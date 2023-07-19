import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';
import { Buffer } from 'buffer';

export const handler = async (event) => {
  // Polly に送信
  const command = new SynthesizeSpeechCommand({
    Engine: 'neural',
    LanguageCode: 'ja-JP',
    OutputFormat: 'mp3',
    Text: event.queryStringParameters.text,
    VoiceId: 'Takumi',
  });
  const client = new PollyClient({ region: 'ap-northeast-1' });
  const response = await client.send(command);

  // 返却されたバイナリデータをBase64形式に変換
  const uint8Array = await response.AudioStream.transformToByteArray();
  const stringToEncode = String.fromCharCode(...uint8Array);
  const body = Buffer.from(stringToEncode, 'binary').toString('base64');
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'audio/mpeg',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS,GET',
    },
    body,
    isBase64Encoded: true,
  };
};
