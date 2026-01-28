const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function translateToChicese(text: string): Promise<string | null> {
  if (!DEEPSEEK_API_KEY) {
    console.error('DeepSeek API key not configured');
    return null;
  }

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content:
              '你是一名专业翻译。请将以下关于糖市场的新闻翻译成简体中文。保持专业术语的准确性，使翻译流畅自然。只返回翻译后的文本，不要添加任何解释或额外内容。',
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent translations
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      console.error('DeepSeek API error:', response.status);
      return null;
    }

    const data: DeepSeekResponse = await response.json();

    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    }

    return null;
  } catch (error) {
    console.error('Error translating text:', error);
    return null;
  }
}

export async function translateHeadline(headline: string): Promise<string | null> {
  if (!DEEPSEEK_API_KEY) {
    console.error('DeepSeek API key not configured');
    return null;
  }

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content:
              '你是一名专业翻译。请将以下新闻标题翻译成简体中文。保持简洁有力，符合中文新闻标题的表达习惯。只返回翻译后的标题，不要添加任何解释。',
          },
          {
            role: 'user',
            content: headline,
          },
        ],
        temperature: 0.3,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      console.error('DeepSeek API error:', response.status);
      return null;
    }

    const data: DeepSeekResponse = await response.json();

    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    }

    return null;
  } catch (error) {
    console.error('Error translating headline:', error);
    return null;
  }
}
