export const fluxService = {
  async generateImage(prompt: string): Promise<string> {
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const data = await response.json();
      if (!data.url) {
        throw new Error('No image URL in response');
      }
      return data.url;
    } catch (error) {
      console.error('Flux API error:', error);
      throw error;
    }
  },

  async editImage(prompt: string, sourceImageUrl: string): Promise<string> {
    try {
      const response = await fetch('/api/ai/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, imageUrl: sourceImageUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to edit image');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Flux API error:', error);
      throw error;
    }
  }
};
