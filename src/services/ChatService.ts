
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const generateChatResponse = async (
  prompt: string,
  apiKey: string = 'sA6Ia2st2jefew5QAsvaWt8oC0NktI41'
): Promise<string> => {
  try {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are a caring mental health counselor helping students manage stress and emotions. Respond in under 50 words with supportive, evidence-based advice. If distress is detected, provide self-care strategies or recommend professional help.'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'mistral-tiny',
        messages,
        max_tokens: 100,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating chat response:', error);
    return 'I apologize, but I\'m having trouble responding right now. Please try again later.';
  }
};

export const generateAudioFromText = async (text: string): Promise<string> => {
  try {
    const response = await fetch('https://text.pollinations.ai/prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai-audio',
        voice: 'nova',
        prompt: text
      })
    });

    if (!response.ok) {
      throw new Error(`Audio API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.audioUrl;
  } catch (error) {
    console.error('Error generating audio:', error);
    return '';
  }
};
