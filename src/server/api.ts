import express from 'express';
import { fal } from "@fal-ai/client";
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

if (!process.env.FAL_API_KEY) {
  throw new Error('FAL_API_KEY is not configured');
}

fal.config({
  credentials: process.env.FAL_API_KEY
});

app.post('/api/ai/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    const result = await fal.subscribe("fal-ai/flux-pro", {
      input: {
        prompt,
        image_size: "landscape_16_9",
        num_images: 1,
        scheduler: "euler_a",
        num_inference_steps: 50,
        guidance_scale: 7.5
      },
      pollInterval: 1000,
      logs: true,
    });

    if (!result.data?.images?.[0]?.url) {
      throw new Error('No image URL in response');
    }

    res.json({ url: result.data.images[0].url });
  } catch (error) {
    console.error('Flux API error:', error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
});

app.post('/api/ai/edit', async (req, res) => {
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

    res.json({ url: result.data.images[0].url });
  } catch (error) {
    console.error('Flux API error:', error);
    res.status(500).json({ error: 'Failed to edit image' });
  }
});

const PORT = 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app, server }; 