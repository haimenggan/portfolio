import crypto from "crypto";

export const config = { api: { bodyParser: { sizeLimit: "10mb" } } };

const CLOUD = process.env.CLOUDINARY_CLOUD_NAME || "dvpd0p6si";
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { slug, data } = req.body;
  if (!slug || !data) {
    return res.status(400).json({ error: "Missing slug or data" });
  }

  if (!API_KEY || !API_SECRET) {
    return res.status(500).json({ error: "Cloudinary credentials not configured on server" });
  }

  const publicId = `resume-data/${encodeURIComponent(slug)}`;
  const timestamp = Math.floor(Date.now() / 1000);

  // Cloudinary signed upload: sign sorted params + API secret
  const paramsToSign = `overwrite=true&public_id=${publicId}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash("sha256")
    .update(paramsToSign + API_SECRET)
    .digest("hex");

  const fd = new FormData();
  const jsonBlob = new Blob([JSON.stringify(data)], { type: "application/json" });
  fd.append("file", jsonBlob, `${slug}.json`);
  fd.append("public_id", publicId);
  fd.append("overwrite", "true");
  fd.append("timestamp", String(timestamp));
  fd.append("api_key", API_KEY);
  fd.append("signature", signature);

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/raw/upload`, {
    method: "POST",
    body: fd,
  });

  if (!uploadRes.ok) {
    let msg = "Upload failed";
    try {
      const err = await uploadRes.json();
      msg = err?.error?.message || msg;
    } catch {}
    return res.status(500).json({ error: msg });
  }

  const result = await uploadRes.json();
  return res.json({ ok: true, url: result.secure_url });
}
