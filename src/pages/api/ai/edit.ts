import { NextApiRequest, NextApiResponse } from 'next';
import { fal } from "@fal-ai/client";

if (!process.env.FAL_API_KEY) {
  throw new Error('FAL_API_KEY is not configured');
}

fal.config({
  credentials: process.env.FAL_API_KEY
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, imageUrl } = req.body;

    const result = await fal.subscribe("fal-ai/flux-pro", {
      input: {
        prompt,
        image: imageUrl,
        scheduler: "euler_a",
        num_inference_steps: 50,
        guidance_scale: 7.5,
        strength: 0.7,
        num_images: 1
      },
      pollInterval: 1000,
      logs: true,
    });

    if (!result.data?.images?.[0]?.url) {
      throw new Error('No image URL in response');
    }

    return res.status(200).json({ url: result.data.images[0].url });
  } catch (error) {
    console.error('Flux API error:', error);
    return res.status(500).json({ error: 'Failed to edit image' });
  }
} 