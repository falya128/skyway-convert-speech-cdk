import { Configuration, OpenAIApi } from 'openai';

export const handler = async (event) => {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  const completion = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: `今から話す言葉を敬語に直してください。`,
      },
      {
        role: 'system',
        content: `変換した言葉だけを返してください。`,
      },
      { role: 'user', content: event.queryStringParameters.text },
    ],
  });
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,',
    },
    body: JSON.stringify({
      convertedText: completion.data.choices[0].message.content,
    }),
  };
};
