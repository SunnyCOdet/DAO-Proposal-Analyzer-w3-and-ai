import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001; // Backend port

// --- Basic Setup ---
app.use(cors()); // Allow requests from frontend
app.use(express.json()); // Parse JSON request bodies

// --- Gemini AI Setup ---
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash"}); // Or your preferred model

// --- API Endpoint ---
app.post('/api/analyze', async (req, res) => {
  const { proposalText } = req.body;

  if (!proposalText) {
    return res.status(400).json({ error: 'Proposal text is required.' });
  }

  if (!process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
    console.error('Gemini API Key not configured in .env file.');
    return res.status(500).json({ error: 'AI service not configured.' });
  }

  try {
    const prompt = `
Analyze the following DAO proposal text. Provide:
1. A concise summary (2-3 sentences).
2. A list of potential pros.
3. A list of potential cons.

Format the output as JSON with keys "summary", "pros", and "cons". Each pro and con should be a string in an array.

Proposal Text:
---
${proposalText}
---
`;

    console.log("Sending prompt to Gemini...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("Received response from Gemini.");

    // Attempt to parse the JSON response from Gemini
    try {
      // Clean the response text if it's wrapped in markdown code blocks
      const cleanedText = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      const analysis = JSON.parse(cleanedText);
      res.json(analysis);
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);
      console.error("Raw Gemini response:", text);
      // Fallback: return the raw text if JSON parsing fails
      res.status(500).json({ error: 'Failed to parse AI analysis.', rawResponse: text });
    }

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Failed to analyze proposal with AI.' });
  }
});

// --- Start Server ---
app.listen(port, () => {
  console.log(`Backend server listening on http://localhost:${port}`);
});
