import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dotenv from 'dotenv';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';
import * as iam from 'aws-cdk-lib/aws-iam';

dotenv.config();

export class SkywayConvertSpeechCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 共通のメソッドレスポンスを作成
    const methodResponse: apigateway.MethodResponse = {
      statusCode: '200',
      responseModels: {
        'application/json': apigateway.Model.EMPTY_MODEL,
      },
      responseParameters: {
        'method.response.header.Access-Control-Allow-Origin': true,
      },
    };

    // CORS オプションを定義
    const defaultCorsPreflightOptions: cdk.aws_apigateway.CorsOptions = {
      allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
      allowMethods: apigateway.Cors.ALL_METHODS,
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
    };

    // OpenAI のレイヤーを作成
    const openaiLayerName = 'openai';
    const openaiLayer = new lambda.LayerVersion(this, openaiLayerName, {
      layerVersionName: openaiLayerName,
      code: lambda.Code.fromAsset(path.join('lambda_layer', 'openai')),
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
    });

    // 指定の形式に文字データを変換する Lambda 関数を作成
    const convertTextFunctionName = 'convertTextFunction';
    const convertTextFunction = new lambda.Function(
      this,
      convertTextFunctionName,
      {
        functionName: convertTextFunctionName,
        runtime: lambda.Runtime.NODEJS_18_X,
        timeout: cdk.Duration.seconds(30),
        code: lambda.Code.fromAsset(path.join('lambda', 'convertText')),
        handler: 'index.handler',
        layers: [openaiLayer],
        environment: {
          OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? '',
        },
      }
    );

    // 作成した Lambda 関数を実行する REST API を作成
    const convertTextApiName = 'convertTextApi';
    const convertTextApi = new apigateway.RestApi(this, convertTextApiName, {
      restApiName: convertTextApiName,
      endpointTypes: [apigateway.EndpointType.REGIONAL],
      deploy: true,
      defaultCorsPreflightOptions,
    });
    convertTextApi.root.addMethod(
      'GET',
      new apigateway.LambdaIntegration(convertTextFunction, { proxy: true }),
      { methodResponses: [methodResponse] }
    );

    // ClientPolly のレイヤーを作成
    const pollyLayerName = 'clientPolly';
    const pollyLayer = new lambda.LayerVersion(this, pollyLayerName, {
      layerVersionName: pollyLayerName,
      code: lambda.Code.fromAsset(path.join('lambda_layer', 'client_polly')),
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
    });

    // 文字データを音声データに変換する Lambda 関数を作成
    const convertAudioFunctionName = 'convertAudioFunction';
    const convertAudioFunction = new lambda.Function(
      this,
      convertAudioFunctionName,
      {
        functionName: convertAudioFunctionName,
        runtime: lambda.Runtime.NODEJS_18_X,
        timeout: cdk.Duration.seconds(30),
        code: lambda.Code.fromAsset(path.join('lambda', 'convertAudio')),
        handler: 'index.handler',
        layers: [pollyLayer],
      }
    );

    // Polly の実行権限を Lambda 関数に付与
    convertAudioFunction.role?.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonPollyFullAccess')
    );

    // 作成した Lambda 関数を実行する REST API を作成
    const convertAudioApiName = 'convertAudioApi';
    const convertAudioApi = new apigateway.RestApi(this, convertAudioApiName, {
      restApiName: convertAudioApiName,
      endpointTypes: [apigateway.EndpointType.REGIONAL],
      deploy: true,
      defaultCorsPreflightOptions,
      binaryMediaTypes: ['audio/mpeg'],
    });
    convertAudioApi.root.addMethod(
      'GET',
      new apigateway.LambdaIntegration(convertAudioFunction, { proxy: true }),
      { methodResponses: [methodResponse] }
    );
  }
}
