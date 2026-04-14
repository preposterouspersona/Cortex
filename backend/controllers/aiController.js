import Groq from "groq-sdk";
import Note from "../models/Notes.js";

function getGroq() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

export async function generateTags(req, res) {
  const groq = getGroq();
  try {
    const { title, content } = req.body;
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 60,
      temperature: 0.4,
      messages: [
        {
          role: "user",
          content: `Generate 3-5 short tags for this text. Return ONLY a JSON array of lowercase strings, no explanation.
Title: ${title}
Content: ${content}
Example output: ["machine learning","python","data"]`,
        },
      ],
    });

    const raw = response.choices[0].message.content.trim();
    const match = raw.match(/\[.*\]/s);
    const tags = match ? JSON.parse(match[0]) : [];
    res.json({ tags });
  } catch (err) {
    console.error("Tag generation error:", err.message);
    res.status(500).json({ tags: [] });
  }
}

export async function findLinks(req, res) {
  const groq = getGroq();
  try {
    const { id, title, content } = req.body;

    const others = await Note.find(
      id && id !== "preview" ? { _id: { $ne: id } } : {}
    ).select("_id title content tags");
    if (others.length === 0) return res.json({ linkedIds: [] });

    const corpus = others
      .map((n) => `ID:${n._id} | Title: ${n.title} | Tags: ${n.tags.join(",")} | Preview: ${n.content.slice(0, 120)}`)
      .join("\n");

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 100,
      temperature: 0.3,
      messages: [
        {
          role: "user",
          content: `Given this entry:
Title: ${title}
Content: ${content}

And these existing entries:
${corpus}

Return ONLY a JSON array of IDs (from the list above) that are conceptually related. Max 4 links. If none are related, return [].
Example: ["64abc123","64def456"]`,
        },
      ],
    });

    const raw = response.choices[0].message.content.trim();
    const match = raw.match(/\[.*\]/s);
    const linkedIds = match ? JSON.parse(match[0]) : [];

    if (id && id !== "preview") {
      await Note.findByIdAndUpdate(id, { linkedIds });
    }

    res.json({ linkedIds });
  } catch (err) {
    console.error("Link generation error:", err.message);
    res.status(500).json({ linkedIds: [] });
  }
}