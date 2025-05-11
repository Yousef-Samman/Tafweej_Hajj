import type { NextApiRequest, NextApiResponse } from 'next';
import { CohereClient } from 'cohere-ai';

const cohere = new CohereClient({ token: process.env.COHERE_API_KEY! });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const { crowdData, time, weather, event } = req.body;
    if (!crowdData || !time || !weather || !event) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    const prompt = `Current crowd densities:\n${Object.entries(crowdData).map(([loc, density]) => `- ${loc}: ${density}`).join('\n')}\nTime: ${time}\nWeather: ${weather}\nEvent: ${event}\n\nQuestion: Based on this information, what is your best advice for congestion management for Hajj organizers and pilgrims? Respond with clear, actionable advice.`;
    const response = await cohere.generate({
      model: 'command',
      prompt,
      maxTokens: 80,
      temperature: 0.3,
    });
    res.status(200).json({ advice: response.generations[0].text.trim() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Problem generating advice' });
  }
} 