const API_KEY = 'AIzaSyBTQGT6QI8nY5JZ9L64Ac8DJqxHT2CVwFs';

export async function getGeminiResponse(prompt: string) {
  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=' + API_KEY,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      }),
    }
  );
  const data = await response.json();
  return data;
}