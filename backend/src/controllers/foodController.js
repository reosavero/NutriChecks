const { GoogleGenerativeAI } = require("@google/generative-ai");

// Inisialisasi API Geminii menggunakan API Key dari .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.analyzeFoodImage = async (req, res) => {
  try {
    // 1. Validasi Keberadaan Input File
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Tidak ada file gambar yang diunggah." });
    }

    // 2. Validasi Ekstensi/MIME Type (Hanya izinkan JPEG, PNG, WEBP)
    const validMimes = ["image/jpeg", "image/png", "image/webp"];
    if (!validMimes.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        success: false, 
        message: "Format gambar tidak didukung. Harap unggah format JPEG, PNG, atau WEBP." 
      });
    }

    // 3. Konversi buffer file memori dari Multer ke dalam format objek yang bisa dibaca Gemini
    const imagePart = {
      inlineData: {
        data: req.file.buffer.toString("base64"),
        mimeType: req.file.mimetype,
      },
    };

    // 4. Inisialisasi Model AI Generatif (Sesuai dengan versi yang tersedia di Google AI Studio)
    const modelName = "gemini-1.5-flash";
    console.log(`Pemicu scan AI menggunakan model: ${modelName}`);
    
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    // 5. Prompt Instruksi Ketat (Strict Instructions) untuk Output JSON Murni
    const prompt = `Anda adalah seorang Lead Clinical Nutritionist AI.
Tugas Anda adalah membedah gambar makanan secara molekuler dan memberikan data nutrisi yang akurat.

PERINTAH KHUSUS:
1. Analisis porsi makanan dalam gambar (kecil, sedang, besar) berdasarkan perbandingan objek di sekitarnya.
2. Identifikasi bahan dasar makanan tersebut.
3. Jika gambar BUKAN makanan/minuman, set "success": false.

Struktur Output JSON:
{
  "success": boolean,
  "message": string (isi jika success false),
  "data": {
     "nama_makanan": string,
     "porsi": string (misal: "1 porsi sedang (~250g)"),
     "kalori": number,
     "protein": number,
     "karbohidrat": number,
     "lemak": number,
     "confidence_score": number (0-1),
     "analisis_singkat": string (penjelasan singkat tentang nutrisi makanan ini)
  }
}`;

    // 6. Jalankan Proses Analisis AI
    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(responseText);
    } catch (parseErr) {
      console.error("Gagal melakukan parsing output AI JSON:", responseText);
      return res.status(500).json({ 
        success: false, 
        message: "AI memberikan output yang tidak sinkron dengan protokol bio-matriks. Mohon coba gambar lain." 
      });
    }

    // 7. Tentukan Respon Akhir Sesuai Skenario Makanan (Benar / Salah) 
    if (jsonResponse.success === false) {
      return res.status(400).json({
        success: false,
        message: jsonResponse.message || "Gambar yang diunggah tidak terdeteksi sebagai bahan gizi yang valid."
      }); 
    }

    return res.status(200).json(jsonResponse); // Berhasil

  } catch (error) {
    console.error("Error analyzing food image:", error);
    
    // Penanganan Rate Limit (API Limit)
    if (error.status === 429 || (error.message && error.message.includes("429"))) {
      return res.status(429).json({ 
        success: false, 
        message: "Limit API tercapai (Maks 15 scan/menit). Harap tunggu sejenak sebelum melakukan scan berikutnya." 
      });
    }

    if (error.message && error.message.includes("API key")) {
      return res.status(500).json({ success: false, message: "Kredensial API Google AI tidak valid atau telah kedaluwarsa." });
    }

    return res.status(500).json({
      success: false,
      message: "Terjadi gangguan pada sirkuit analisis AI. Mohon pastikan foto cukup terang dan jelas.",
    });
  }
};
