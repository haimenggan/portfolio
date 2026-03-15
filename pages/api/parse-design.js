import Anthropic from "@anthropic-ai/sdk";

export const config = { api: { bodyParser: { sizeLimit: "20mb" } } };

const SYSTEM_PROMPT = `You are a UX case study parser. Given a screenshot of a case study page, extract all text content and return structured JSON.

Return ONLY a valid JSON array of section objects. No markdown, no explanation, just the JSON array.

Each section object has this shape:
{
  "heading": string,       // section title/heading visible in the design
  "layout": string,        // one of: "text-only" | "meta-split" | "label-cards" | "label-detail" | "image-below"
  "body": string,          // main paragraph text (empty string if none)
  "meta": [{ "label": string, "value": string }],   // only populate for "meta-split" layout
  "cards": [{ "title": string, "body": string }]    // only populate for "label-cards" or "label-detail" layout
}

Layout rules:
- "meta-split": section has small metadata fields like Role, Duration, Team, Tools on the left
- "label-cards": section has a label on the left and 2-column text cards on the right
- "label-detail": section has a label on the left, then a question/callout + labeled paragraphs (like Description, Rationale, Issue) on the right
- "text-only": a regular heading + paragraph section
- "image-below": a heading + text + image (use this if an image placeholder or diagram is clearly present below text)

Important:
- Preserve all text faithfully, including line breaks in values (use \\n)
- Leave the "images" field out — the user will upload real images separately
- Return between 3 and 12 sections depending on the design
- Skip purely decorative headers or footers`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY is not set in environment variables." });
  }

  const { imageBase64, mediaType } = req.body;
  if (!imageBase64) {
    return res.status(400).json({ error: "Missing imageBase64" });
  }

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType || "image/jpeg",
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: "Extract all sections and their text content from this case study design screenshot. Return the JSON array only.",
            },
          ],
        },
      ],
    });

    const raw = response.content[0].text.trim();
    // Strip markdown code fences if present
    const cleaned = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    const sections = JSON.parse(cleaned);

    return res.status(200).json({ sections });
  } catch (err) {
    console.error("parse-design error:", err);
    return res.status(500).json({ error: String(err.message || err) });
  }
}