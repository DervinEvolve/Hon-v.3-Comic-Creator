const FLUX_API_KEY = '6e70e227-a240-4ed0-a716-c4aaa0a67da3';
const FLUX_API_URL = 'https://api.bfl.ml';

export const fluxService = {
  async generateImage(prompt: string): Promise<string> {
    const response = await fetch(`${FLUX_API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FLUX_API_KEY}`
      },
      body: JSON.stringify({
        prompt,
        model: 'flux.1-pro',
        negative_prompt: 'blurry, low quality, distorted',
        steps: 30,
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate image');
    }

    const data = await response.json();
    return data.image_url;
  },

  async editImage(prompt: string, imageUrl: string): Promise<string> {
    const response = await fetch(`${FLUX_API_URL}/edit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FLUX_API_KEY}`
      },
      body: JSON.stringify({
        prompt,
        image_url: imageUrl,
        model: 'flux.redux',
        strength: 0.7,
      })
    });

    if (!response.ok) {
      throw new Error('Failed to edit image');
    }

    const data = await response.json();
    return data.image_url;
  }
}; 