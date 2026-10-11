import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Google Gen AI
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// AI Hint Endpoint
app.post('/api/gemini/hint', async (req, res) => {
  try {
    const { gameType, levelNumber, title, story, objective, puzzleContext, hintTier } = req.body;
    const tier = hintTier || 1;

    if (!ai) {
      return res.json({
        hint: getFallbackHint(gameType, levelNumber, objective, tier),
        source: 'fallback',
      });
    }

    const tierPrompt =
      tier === 1
        ? 'Provide a subtle, poetic nudge that guides thought without revealing the answer.'
        : tier === 2
        ? 'Provide a clear, specific directional clue highlighting key relationships or patterns.'
        : 'Provide a strong, near-complete explanation or step-by-step solution breakdown.';

    const systemInstruction = `You are the ancient Guardian of the TreasureVerse, a mysterious fantasy multi-game realm.
You help players solving ${gameType} Level ${levelNumber}: "${title}".
The objective is: "${objective}".
Story context: "${story || ''}".
Board/Puzzle State: ${JSON.stringify(puzzleContext || {})}.
${tierPrompt}
Keep your hint concise (1 to 3 sentences), immersed in fantasy adventure tone, and strictly helpful for the puzzle mechanics.
Never hallucinate non-existent puzzle rules.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Provide Level ${levelNumber} Tier ${tier} Hint for the player.`,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const hintText = response.text?.trim() || getFallbackHint(gameType, levelNumber, objective, tier);
    return res.json({ hint: hintText, source: 'ai' });
  } catch (error: any) {
    console.warn('Gemini hint error, using fallback:', error?.message);
    const { gameType, levelNumber, objective, hintTier } = req.body;
    return res.json({
      hint: getFallbackHint(gameType, levelNumber, objective, hintTier || 1),
      source: 'fallback',
    });
  }
});

// AI Dynamic Riddle Endpoint
app.post('/api/gemini/riddle', async (req, res) => {
  try {
    const { worldTheme, difficulty } = req.body;
    if (!ai) {
      return res.json({
        riddle: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
        answer: "echo",
        options: ["echo", "shadow", "flame", "river"],
        explanation: "An echo reflects sound carried by the breeze and canyon walls.",
        source: 'fallback',
      });
    }

    const prompt = `Create a fantasy riddle suited for a ${worldTheme || 'Treasure Island'} adventure at ${difficulty || 'medium'} difficulty.
Return JSON with the following structure:
{
  "riddle": "The poetic riddle text (2-4 lines)",
  "answer": "one-word-answer",
  "options": ["one-word-answer", "wrong1", "wrong2", "wrong3"],
  "explanation": "Why this answer fits the riddle"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    let data;
    try {
      data = JSON.parse(response.text?.trim() || '{}');
    } catch {
      data = {
        riddle: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
        answer: "echo",
        options: ["echo", "shadow", "flame", "river"],
        explanation: "An echo reflects sound carried by the breeze and canyon walls.",
      };
    }

    return res.json({ ...data, source: 'ai' });
  } catch (error: any) {
    return res.json({
      riddle: "I have keys but no locks. I have space but no room. You can enter, but you cannot go outside. What am I?",
      answer: "keyboard",
      options: ["keyboard", "chest", "crypt", "map"],
      explanation: "A musical or typing keyboard has keys and a space bar.",
      source: 'fallback',
    });
  }
});

// Interactive AI Oracle Chat Endpoint
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, gameContext } = req.body;
    if (!ai) {
      return res.json({
        reply: `The Oracle listens carefully: Focus on your objective: ${gameContext?.objective || 'uncover the secrets of the realm'}. Look for patterns that align with your quest!`,
        source: 'fallback',
      });
    }

    const systemInstruction = `You are the ancient Guardian of the TreasureVerse, a whimsical, knowledgeable guide who helps adventurers solving Treasure Hunt, Art Puzzles, and Arrow Puzzles.
Current player context: ${JSON.stringify(gameContext || {})}.
Answer the player's question warmly, concisely (2-4 sentences), and with mystical adventure charm. Give helpful clues without spoiling the joy of discovery.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: message || 'How can I solve this puzzle?',
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return res.json({
      reply: response.text?.trim() || 'Follow the compass needle and listen to the whisper of the ancient stones.',
      source: 'ai',
    });
  } catch (error: any) {
    return res.json({
      reply: 'The Oracle senses great potential in you! Take a deep breath and look at the puzzle from a new perspective.',
      source: 'fallback',
    });
  }
});

// Real Photograph Art & Nature Lore Endpoint
app.post('/api/gemini/art-lore', async (req, res) => {
  try {
    const { title, category, location } = req.body;
    if (!ai) {
      return res.json({
        lore: `This breathtaking photograph captures ${title || 'the natural beauty of the world'}. Notice the delicate balance of light, color, and natural geometry.`,
        strategyTip: 'Start by finding high-contrast edges and sky or water horizon lines.',
        source: 'fallback',
      });
    }

    const prompt = `Provide 2 sentences of fascinating geographical or photographic insight about "${title}" (${category || 'Landscape'}, ${location || 'World'}).
Then provide 1 practical tip for assembling this as a jigsaw puzzle (e.g. which color or texture to assemble first).
Return JSON:
{
  "lore": "2 sentences of fascinating insight",
  "strategyTip": "1 practical assembly strategy"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const data = JSON.parse(response.text?.trim() || '{}');
    return res.json({ ...data, source: 'ai' });
  } catch (error: any) {
    return res.json({
      lore: `A timeless view celebrating the majesty of nature and world architecture.`,
      strategyTip: 'Group tiles by distinct color gradients before fitting the center pieces.',
      source: 'fallback',
    });
  }
});

// Fallback hint generator
function getFallbackHint(gameType: string, level: number, objective: string, tier: number): string {
  if (tier === 1) {
    return `Observe the surroundings closely: ${objective}. Look for repeating symbols or paths that point forward.`;
  } else if (tier === 2) {
    return `Focus on the interaction requirements. Notice how each move or switch alters the adjacent elements.`;
  } else {
    return `Direct solution guide: Trace the steps systematically from the starting clue to the destination lock.`;
  }
}

// Development vs Production serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TreasureVerse server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
