import type { NextApiRequest, NextApiResponse } from 'next';
import { predictCrowdMovement } from '@/lib/crowdSensors';

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

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
    const prediction = await predictCrowdMovement(crowdData, time, weather, event);
    res.status(200).json({ prediction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Prediction failed' });
  }
} 