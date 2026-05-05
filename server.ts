import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Middleware to check Admin Credentials
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const clientUsername = req.headers['x-admin-username'];
  const clientPassword = req.headers['x-admin-password'];
  
  const serverUsername = process.env.ADMIN_USERNAME || 'admin';
  const serverPassword = process.env.ADMIN_PASSWORD || 'Alijee631';

  if (clientUsername !== serverUsername || clientPassword !== serverPassword) {
    res.status(401).json({ error: 'Unauthorized: Incorrect Username or Password' });
    return;
  }
  
  next();
};

// API Route: Verify Credentials
app.post('/api/verify', (req, res) => {
  const { username, password } = req.body;
  const serverUsername = process.env.ADMIN_USERNAME || 'admin';
  const serverPassword = process.env.ADMIN_PASSWORD || 'Alijee631';

  if (username === serverUsername && password === serverPassword) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
});

// API Route: Get Treatment
app.post('/api/treatment', requireAuth, async (req, res) => {
  try {
    const { age, city, condition } = req.body;
    
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
    
    res.json({ text: response.text });
  } catch (error) {
    console.error("Error in /api/treatment:", error);
    res.status(500).json({ error: "Failed to generate treatment" });
  }
});

// API Route: Analyze Remedy
app.post('/api/remedy', requireAuth, async (req, res) => {
  try {
    const { remedy } = req.body;
    
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
    
    res.json({ text: response.text });
  } catch (error) {
    console.error("Error in /api/remedy:", error);
    res.status(500).json({ error: "Failed to analyze remedy" });
  }
});

// Vite middleware for development and static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
