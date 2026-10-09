const { GoogleGenerativeAI } = require('@google/generative-ai');

const callGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = 'gemini-3.8-flash';

  if (!apiKey) {
    throw new Error('Gemini API key is not configured');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  // Retry up to 3 times for temporary 503 errors
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`Gemini request attempt ${attempt}/3...`);

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new Error('Invalid Gemini response');
      }

      return text;

    } catch (error) {
      console.error(`Gemini API Error (attempt ${attempt}):`, error.message);

      // Retry only for temporary service errors
      if (error.message.includes('503') && attempt < 3) {
        const waitTime = attempt * 3000;

        console.log(`Gemini busy. Retrying in ${waitTime / 1000} seconds...`);

        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        throw error;
      }
    }
  }
};

module.exports = {
  callGemini,
};