import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const getTreatment = async (age: string, city: string, condition: string) => {
  const prompt = `You are an expert Hakeem and specialist in 'Tibb-e-Luqman' (The Medical Wisdom of Hazrat Luqman).
A patient has come to you with the following details:
- Age: ${age}
- City: ${city} (Please consider the current general weather/climate of this city in your recommendation)
- Condition/Symptoms: ${condition}

Based STRICTLY on the teachings and book of Hazrat Luqman (Tibb-e-Luqman), provide a 100% accurate and suitable herbal remedy/treatment.
Include:
1. The recommended medicine/nuskha (ingredients and quantities).
2. Method of preparation.
3. Dosage and usage instructions.
4. Dietary restrictions (Parhez) if any.

Respond in clear Urdu script (اردو).`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
  });
  
  return response.text;
};

export const analyzeRemedy = async (remedy: string) => {
  const prompt = `You are an expert Hakeem and specialist in 'Tibb-e-Luqman'.
A user has provided the following herbal remedy/nuskha:
"${remedy}"

Based STRICTLY on the teachings of Hazrat Luqman, analyze this remedy and explain:
1. Which specific diseases or conditions this remedy is perfectly suited for.
2. How it affects the body (its temperament/Taseer).
3. Any precautions or side effects.

Respond in clear Urdu script (اردو).`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
  });
  
  return response.text;
};
