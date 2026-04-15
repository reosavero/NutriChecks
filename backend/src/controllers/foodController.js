const { GoogleGenerativeAI } = require("@google/generative-ai");

// Inisialisasi API Gemini menggunakan API Key dari .env
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

    // 4. Inisialisasi Model AI Generatif
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 5. Prompt Instruksi Ketat untuk Output JSON Murni
    const prompt = `Anda adalah seorang ahli nutrisi dan AI penganalisis gambar.\nTugas Anda adalah mematuhi instruksi secara ketat. Anda HANYA boleh membalas dengan sebuah JSON murni (tanpa dibungkus tag markdown, tanpa tambahan string/kalimat pengantar atau penutup).\n\nLihat gambar yang dilampirkan:\n\nSkenario A - BUKAN MAKANAN:\nJika gambar di atas BUKAN MAKANAN (misalnya manusia, pemandangan, laptop, struk/kartu, mobil, logo, objek abstrak, dsb):\nKembalikan persis JSON di bawah ini:\n{\n  "success": false,\n  "message": "Gambar yang diunggah bukan gambar makanan. Silakan unggah foto makanan yang jelas."\n}\n\nSkenario B - ITU ADALAH MAKANAN:\nJika gambar tersebut adalah makanan minuman yang valid:\nTebak nama makanan tersebut dan berikan perkiraan kandungan makronutrisi (jumlah kalori, protein, karbohidrat, dan lemak per porsi standar makanan tersebut). Semua angka nutrisi harus berformat "number" (tanpa ekstensi satuan seperti g/kkal).\nKembalikan persis JSON di bawah ini:\n{\n  "success": true,\n  "data": {\n     "nama_makanan": "Nasi Goreng Ayam",\n     "kalori": 450,\n     "protein": 15.5,\n     "karbohidrat": 50.2,\n     "lemak": 12.0\n  }\n}\n\nINGAT: Kirimkan 1 objek JSON saja dan jangan gunakan format markdown \`\`\`json.`;

    // 6. Fungsi helper: delay untuk retry
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // 7. Jalankan Proses Analisis AI dengan Retry Logic (max 3 kali untuk error 503)
    let result;
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        result = await model.generateContent([prompt, imagePart]);
        break; // Berhasil, keluar dari loop
      } catch (aiError) {
        const is503 = aiError.status === 503 || (aiError.message && aiError.message.includes("503"));
        const isApiKeyError = aiError.status === 403 || (aiError.message && aiError.message.includes("API key"));

        if (isApiKeyError) {
          console.error("API Key error (tidak bisa di-retry):", aiError.message);
          return res.status(500).json({
            success: false,
            message: "API Key AI tidak valid atau telah diblokir. Hubungi administrator.",
          });
        }

        if (is503 && attempt < maxRetries) {
          const waitMs = attempt * 2000; // 2s, 4s, ...
          console.warn(`Gemini 503 - percobaan ${attempt}/${maxRetries}. Mencoba lagi dalam ${waitMs / 1000}s...`);
          await delay(waitMs);
          continue;
        }

        // Lempar error bila sudah habis retry atau bukan 503
        throw aiError;
      }
    }

    const responseText = result.response.text();

    // 8. Sanitasi Hasil (Menghapus markdown atau whitespace)
    const jsonString = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(jsonString);
    } catch (parseErr) {
      console.error("Gagal melakukan parsing output AI JSON:", responseText);
      return res.status(500).json({ 
        success: false, 
        message: "AI memberikan output yang tidak dapat dipahami. Mohon coba gambar lain." 
      });
    }

    // 8. Tentukan Respon Akhir Sesuai Skenario Makanan (Benar / Salah) 
    if (jsonResponse.success === false) {
      return res.status(400).json(jsonResponse); 
    }

    return res.status(200).json(jsonResponse); // Berhasil

  } catch (error) {
    console.error("Error analyzing food image:", error);
    
    // Penanganan apabila Timeout atau Invalid API Key
    if (error.message && error.message.includes("API key")) {
      return res.status(500).json({ success: false, message: "Server kehilangan izin API Key Generative AI." });
    }

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server AI saat membedah / menganalisis foto tersebut.",
    });
  }
};
