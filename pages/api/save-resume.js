import { v2 as cloudinary } from "cloudinary";

export const config = { api: { bodyParser: { sizeLimit: "10mb" } } };

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dvpd0p6si",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { slug, data } = req.body;
  if (!slug || !data) {
    return res.status(400).json({ error: "Missing slug or data" });
  }

  if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return res.status(500).json({ error: "Cloudinary credentials not configured on server" });
  }

  try {
    const publicId = `resume-data/${encodeURIComponent(slug)}`;
    const jsonString = JSON.stringify(data);

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { public_id: publicId, resource_type: "raw", overwrite: true },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      const { Readable } = require("stream");
      Readable.from([Buffer.from(jsonString)]).pipe(uploadStream);
    });

    return res.json({ ok: true, url: result.secure_url });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Upload failed" });
  }
}
