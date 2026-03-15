export const config = { api: { bodyParser: { sizeLimit: "10mb" } } };

const CLOUD = process.env.CLOUDINARY_CLOUD_NAME || "dvpd0p6si";
const PRESET = process.env.CLOUDINARY_UPLOAD_PRESET || "portfolio_uploads";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { slug, data } = req.body;
  if (!slug || !data) {
    return res.status(400).json({ error: "Missing slug or data" });
  }

  try {
    const publicId = `resume-data/${encodeURIComponent(slug)}`;
    const jsonString = JSON.stringify(data);

    const fd = new FormData();
    fd.append("file", new Blob([jsonString], { type: "application/json" }), `${slug}.json`);
    fd.append("upload_preset", PRESET);
    fd.append("public_id", publicId);

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/raw/upload`, {
      method: "POST",
      body: fd,
    });

    const result = await uploadRes.json();

    if (!uploadRes.ok) {
      return res.status(500).json({ error: result?.error?.message || "Upload failed" });
    }

    return res.json({ ok: true, url: result.secure_url });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Upload failed" });
  }
}
