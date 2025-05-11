import type { NextApiRequest, NextApiResponse } from 'next';
import { CohereClient } from 'cohere-ai';

const cohere = new CohereClient({ token: process.env.COHERE_API_KEY! });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const { message } = req.body;
    if (!message) {
      res.status(400).json({ error: 'Missing message' });
      return;
    }
    const prompt = `You are a helpful Hajj assistant. Answer questions about Hajj, safety, navigation, and general advice for pilgrims.\n\nUser: ${message}\nAssistant:`;
    const response = await cohere.generate({
      model: 'command',
      prompt,
      maxTokens: 80,
      temperature: 0.5,
    });
    res.status(200).json({ reply: response.generations[0].text.trim() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Problem generating reply' });
  }
} 