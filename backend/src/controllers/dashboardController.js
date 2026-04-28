const db = require('../config/db');

exports.getDashboardData = async (req, res) => {
  try {
    // Grab user details from database
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    
    const user = users[0];
    
    // Map string kecepatan to float value
    let kecepatanValue = 0.5; // default normal
    if (user.kecepatan === 'lambat') kecepatanValue = 0.25;
    if (user.kecepatan === 'cepat') kecepatanValue = 1.0;
    const kecepatan = kecepatanValue;
    const isMenurunkan = user.tujuan === 'menurunkan berat badan';
    
    const beratBadan = parseFloat(user.berat_badan) || 0;
    const targetBerat = parseFloat(user.target_berat) || 0;
    const selisihBerat = Math.abs(beratBadan - targetBerat);
    
    let goalWeeks = 0; 
    if (kecepatan > 0 && selisihBerat > 0) {
        goalWeeks = Math.ceil(selisihBerat / kecepatan);
    }
    
    // Use proper signs for loss/gain
    const sign = isMenurunkan && selisihBerat > 0 ? '-' : (selisihBerat > 0 ? '+' : '');
    const weightPerWeekChange = selisihBerat > 0 ? `${sign}${kecepatan}` : '0';
    const totalWeightChange = `${sign}${selisihBerat.toFixed(1)}`;

    // Target Kalori dan perhitungan makronutrisi
    // Pembagian standar: 30% Protein (4 kcal/g), 45% Karbohidrat (4 kcal/g), 25% Lemak (9 kcal/g)
    const targetKalori = user.target_kalori || 2168;
    const proteinGrams = Math.round((targetKalori * 0.30) / 4);
    const carbsGrams = Math.round((targetKalori * 0.45) / 4);
    const fatGrams = Math.round((targetKalori * 0.25) / 9);

    // Hitung BMR dinamis
    const bb = parseFloat(user.berat_badan) || 0;
    const tb = parseFloat(user.tinggi_badan) || 0;
    const u = parseInt(user.usia) || 0;
    let bmr = 0;
    if (user.gender === 'laki-laki') {
        bmr = Math.round((10 * bb) + (6.25 * tb) - (5 * u) + 5);
    } else if (user.gender === 'perempuan') {
        bmr = Math.round((10 * bb) + (6.25 * tb) - (5 * u) - 161);
    }

    const responseData = {
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
        status: 'Online',
        avatar: user.avatar 
          ? `http://localhost:5000${user.avatar}` 
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nama.charAt(0))}&background=006c51&color=fff`,
        // Tambahan data biologis dari database
        berat_badan: user.berat_badan,
        tinggi_badan: user.tinggi_badan,
        usia: user.usia,
        gender: user.gender,
        tujuan: user.tujuan,
        kecepatan: user.kecepatan,
        target_kalori: user.target_kalori
      },
      planning: {
        goalWeeks: goalWeeks,
        weightPerWeekChange: weightPerWeekChange,
        totalWeightChange: totalWeightChange
      },
      calories: {
        target: targetKalori,
        bmr: bmr > 0 ? bmr : 1734
      },
      weightProgress: {
        labels: ['Jan 01', 'Jan 15', 'Feb 01', 'Feb 15', 'Mar 01', 'Mar 15', 'Apr 01'],
        data: [65.0, 65.5, 66.2, 66.8, 67.5, 68.0, 68.2],
        targetWeight: parseFloat(user.target_berat) || 71.0,
        todayWeight: parseFloat(user.berat_badan) || 68.2,
        startWeightDate: 'Apr 01',
        startWeight: parseFloat(user.berat_badan) || 74.2 
      },
      macros: {
        protein: proteinGrams,
        carbs: carbsGrams,
        fat: fatGrams
      }
    };
    
    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Dashboard API Error: ", error);
    return res.status(500).json({ message: 'Terjadi kesalahan internal pada server' });
  }
};
