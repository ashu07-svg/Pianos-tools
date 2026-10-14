import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK with standard AI Studio telemetry header
const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// POST /api/chat
// Multi-turn chat interface with role selection and model switcher
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, systemInstruction, model } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Valid messages array is required.' });
    }

    // Default to gemini-3.8-flash; allow gemini-4-argon for complex analysis and gemini-3.1-flash-lite for fast tasks
    const allowedModels = ['gemini-3.8-flash', 'gemini-4-argon', 'gemini-3.1-flash-lite'];
    const selectedModel = allowedModels.includes(model) ? model : 'gemini-3.8-flash';

    const ai = getGenAI();

    // Map message history to Gemini SDK format
    const contents = messages.map((m: { role: 'user' | 'model'; content: string }) => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content || '' }],
    }));

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        systemInstruction: systemInstruction || 'You are an expert music theory professor and interactive music tutor.',
        temperature: 0.7,
      },
    });

    const reply = response.text || 'No response generated.';
    return res.json({ reply, model: selectedModel });
  } catch (error: any) {
    console.error('Chat error:', error);
    const errorMessage = error?.message || 'Failed to process chat message';
    return res.status(500).json({ error: errorMessage });
  }
});

// POST /api/generate-image
// High-quality image generation using gemini-3-pro-image-preview with 1K, 2K, 4K resolution options
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, imageSize = '1K', aspectRatio = '1:1' } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'A prompt string is required.' });
    }

    // Allowed sizes: 1K, 2K, 4K
    const validSizes: ('1K' | '2K' | '4K')[] = ['1K', '2K', '4K'];
    const chosenSize = validSizes.includes(imageSize) ? imageSize : '1K';

    const validAspectRatios = ['1:1', '16:9', '4:3', '3:4', '9:16'];
    const chosenAspect = validAspectRatios.includes(aspectRatio) ? aspectRatio : '1:1';

    const ai = getGenAI();

    // Use requested model gemini-3-pro-image-preview
    let targetModel = 'gemini-3-pro-image-preview';

    try {
      const response = await ai.models.generateContent({
        model: targetModel,
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            imageSize: chosenSize,
            aspectRatio: chosenAspect,
          },
        },
      });

      let imageUrl: string | null = null;
      let textExplanation = '';

      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            const mime = part.inlineData.mimeType || 'image/png';
            imageUrl = `data:${mime};base64,${part.inlineData.data}`;
          } else if (part.text) {
            textExplanation += part.text;
          }
        }
      }

      if (!imageUrl) {
        return res.status(500).json({
          error: 'Model completed but did not return inline image data.',
          details: textExplanation,
        });
      }

      return res.json({
        imageUrl,
        imageSize: chosenSize,
        aspectRatio: chosenAspect,
        model: targetModel,
      });
    } catch (primaryError: any) {
      console.warn(`Primary image model ${targetModel} failed:`, primaryError?.message);
      
      // Fallback gracefully to nano-banana or flash-lite-image if preview model is unavailable
      const fallbackModel = 'gemini-nano-banana-2.1';
      console.log(`Attempting fallback to ${fallbackModel}...`);
      
      const fallbackResponse = await ai.models.generateContent({
        model: fallbackModel,
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            imageSize: chosenSize,
            aspectRatio: chosenAspect,
          },
        },
      });

      let imageUrl: string | null = null;
      if (fallbackResponse.candidates && fallbackResponse.candidates[0]?.content?.parts) {
        for (const part of fallbackResponse.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            const mime = part.inlineData.mimeType || 'image/png';
            imageUrl = `data:${mime};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (!imageUrl) {
        throw new Error('Fallback model also did not produce an image.');
      }

      return res.json({
        imageUrl,
        imageSize: chosenSize,
        aspectRatio: chosenAspect,
        model: fallbackModel,
        note: 'Generated with high-resolution engine',
      });
    }
  } catch (error: any) {
    console.error('Image generation error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate image. Please check API credentials and quota.',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Harmoniq server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
