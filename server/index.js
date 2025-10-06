import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/generate', async (req, res) => {
  const { prompt, diagramType } = req.body;

  const fullPrompt = `
You are a helpful assistant that only returns diagrams in Mermaid.js format.
Respond ONLY with a valid Mermaid diagram inside a \`\`\`mermaid code block.

Generate a Mermaid ${diagramType} diagram for the following input:
${prompt}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: fullPrompt }],
    });

    const content = completion?.choices?.[0]?.message?.content;

    if (!content) {
      console.error('GPT response missing content:', completion);
      return res.status(500).json({ error: 'No content returned from GPT.' });
    }

    const mermaid = content.replace(/```mermaid|```/g, '').trim();
    res.json({ diagram: mermaid });

  } catch (err) {
    console.error('OpenAI Error: ', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
