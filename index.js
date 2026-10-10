const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const API_BASE = "https://api.synoxcloud.xyz/search/ampreset";

app.disable("x-powered-by");
app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/api/search", async (req, res) => {
  const url = String(req.query.url || "").trim();

  if (!url) {
    return res.status(400).json({ status: false, message: "Masukkan link TikTok terlebih dahulu." });
  }

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return res.status(400).json({ status: false, message: "Link tidak valid. Periksa kembali URL TikTok kamu." });
  }

  const host = parsed.hostname.toLowerCase();
  if (!(host === "tiktok.com" || host.endsWith(".tiktok.com"))) {
    return res.status(400).json({ status: false, message: "Masukkan link dari TikTok, misalnya vt.tiktok.com atau www.tiktok.com." });
  }

  try {
    const endpoint = `${API_BASE}?url=${encodeURIComponent(url)}&apikey=FREE`;
    const upstream = await fetch(endpoint, {
      method: "GET",
      headers: { "Accept": "application/json", "User-Agent": "TikTok-Preset-Finder/1.0" },
      signal: AbortSignal.timeout(20000)
    });

    const raw = await upstream.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return res.status(502).json({ status: false, message: "API mengembalikan respons yang tidak bisa dibaca. Coba lagi nanti." });
    }

    if (!upstream.ok) {
      return res.status(502).json({ status: false, message: data.message || `API gagal merespons (${upstream.status}).` });
    }

    return res.json(data);
  } catch (error) {
    console.error("Search API error:", error.message);
    return res.status(502).json({
      status: false,
      message: error.name === "TimeoutError"
        ? "Permintaan terlalu lama. Coba lagi sebentar."
        : "Tidak dapat terhubung ke API. Coba lagi nanti."
    });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`TikTok Preset Finder running on port ${PORT}`);
});

module.exports = app;