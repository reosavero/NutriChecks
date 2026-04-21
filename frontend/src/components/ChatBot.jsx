import { useState, useEffect, useRef } from 'react';

export default function ChatBot({ scanResult }) {
  const [messages, setMessages] = useState([
    { 
      role: 'ai', 
      content: "Selamat datang. Saya adalah Lead Clinical Nutritionist Anda. Saya siap memberikan rekomendasi diet berbasis bukti ilmiah dan menganalisis data bio-metrik Anda." 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Context-aware greeting if a scan result is present
  useEffect(() => {
    if (scanResult) {
      setIsTyping(true);
      setTimeout(() => {
        const welcomeMsg = `Saya telah menganalisis data molekuler untuk ${scanResult.nama_makanan} Anda. Dengan ${scanResult.kalori} kkal dan ${scanResult.protein}g protein, makanan ini ${scanResult.protein > 20 ? 'sangat berkontribusi pada pemulihan massa otot Anda' : 'berfungsi sebagai sumber energi karbohidrat utama'}. Apakah Anda ingin mendiskusikan dampaknya pada keseimbangan energi harian Anda?`;
        setMessages(prev => [...prev, { role: 'ai', content: welcomeMsg }]);
        setIsTyping(false);
      }, 1500);
    }
  }, [scanResult]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      let aiResponse = "";
      const lowerMsg = userMsg.toLowerCase();

      if (lowerMsg.includes('sarapan') || lowerMsg.includes('breakfast')) {
        aiResponse = "Untuk sarapan yang optimal, saya merekomendasikan opsi tinggi serat seperti Oatmeal dengan beri atau Omelet sayur. Ini membantu menjaga stabilitas glikemik sepanjang pagi.";
      } else if (lowerMsg.includes('berat badan') || lowerMsg.includes('diet') || lowerMsg.includes('kurus')) {
        aiResponse = "Untuk penurunan berat badan yang sehat, fokuslah pada defisit kalori moderat (200-300 kkal) dan tingkatkan asupan serat. Jangan lupakan hidrasi yang cukup untuk mendukung metabolisme lemak.";
      } else if (lowerMsg.includes('protein') || lowerMsg.includes('otot') || lowerMsg.includes('gym')) {
        aiResponse = "Untuk mendukung hipertropi otot, targetkan asupan protein sebesar 1.6g - 2.2g per kg berat badan. Pastikan distribusi protein merata di setiap waktu makan.";
      } else if (lowerMsg.includes('air') || lowerMsg.includes('minum') || lowerMsg.includes('hidrasi')) {
        aiResponse = "Hidrasi adalah kunci performa seluler. Targetkan minimal 2-3 liter air per hari. Jika Anda aktif berolahraga, tambahkan elektrolit untuk menjaga keseimbangan osmotik.";
      } else if (lowerMsg.includes('malam') || lowerMsg.includes('dinner')) {
        aiResponse = "Makan malam sebaiknya rendah beban glikemik agar tidak mengganggu ritme sirkadian dan kualitas tidur Anda. Protein ringan dan sayuran hijau adalah pilihan terbaik.";
      } else if (lowerMsg.includes('vitamin') || lowerMsg.includes('buah') || lowerMsg.includes('sayur')) {
        aiResponse = "Mikronutrisi adalah katalis dalam tubuh. Pastikan piring Anda berwarna-warni (pelangi) untuk mendapatkan spektrum lengkap antioksidan dan mineral esensial.";
      } else if (lowerMsg.includes('rekomendasi') || lowerMsg.includes('makan') || lowerMsg.includes('saran')) {
        aiResponse = "Berdasarkan studi longitudinal gizi klinis, asupan lemak tak jenuh yang dikombinasikan dengan polong-polongan sangat direkomendasikan untuk jendela metabolik Anda saat ini.";
      } else {
        aiResponse = "Dari sudut pandang klinis, menjaga keragaman nutrisi sambil tetap dalam target kalori adalah fondasi kesehatan jangka panjang. Apakah ada parameter bio-marker tertentu yang ingin Anda capai?";
      }

      setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
      setIsTyping(false);
    }, 2000);
  };

  const suggestions = [
    "Saran sarapan sehat?",
    "Cara turun berat badan?",
    "Kebutuhan protein harian?",
    "Tips hidrasi optimal"
  ];

  return (
    <div className="bg-surface-container-low/40 backdrop-blur-xl rounded-[2.5rem] border border-outline-variant/10 shadow-2xl overflow-hidden flex flex-col h-[500px] md:h-[650px] animate-in fade-in slide-in-from-bottom-12 duration-1000">
      {/* Header */}
      <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-lowest/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <span className="material-symbols-outlined text-2xl fill">clinical_notes</span>
          </div>
          <div>
            <h3 className="font-headline font-black text-on-surface tracking-tight">Konsultan Gizi AI</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Mesin Neural Aktif</span>
            </div>
          </div>
        </div>
        <button className="text-secondary hover:text-on-surface transition-colors">
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide no-scrollbar"
      >
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold border ${msg.role === 'ai' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-surface-container-highest text-secondary border-outline-variant/20'}`}>
                {msg.role === 'ai' ? 'AI' : 'U'}
              </div>
              <div className={`px-6 py-4 rounded-[1.5rem] text-sm font-medium leading-relaxed shadow-sm ${
                msg.role === 'ai' 
                  ? 'bg-surface-container-lowest text-on-surface rounded-tl-none border border-outline-variant/5' 
                  : 'bg-primary text-on-primary rounded-tr-none shadow-primary/20'
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="bg-surface-container-lowest/50 px-6 py-4 rounded-[1.5rem] rounded-tl-none border border-outline-variant/5 flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce delay-150"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce delay-300"></span>
            </div>
          </div>
        )}
      </div>

      {/* Footer / Input */}
      <div className="p-8 bg-surface-container-lowest/30 backdrop-blur-md border-t border-outline-variant/10 space-y-6">
        {/* Suggestions */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {suggestions.map((s, i) => (
            <button 
              key={i} 
              onClick={() => setInput(s)}
              className="whitespace-nowrap px-4 py-2 rounded-full border border-outline-variant/15 text-[10px] font-black uppercase tracking-widest text-secondary hover:border-primary/30 hover:text-primary transition-all bg-surface/50"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="relative group">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Tanya tentang scan, diet, atau target nutrisi..."
            className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-2xl py-5 pl-6 pr-16 focus:ring-2 focus:ring-primary/20 transition-all font-medium placeholder:text-outline/50 shadow-inner"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl bg-primary text-on-primary shadow-lg shadow-primary/20 flex items-center justify-center hover:bg-primary-tint transition-all active:scale-90 disabled:opacity-30 disabled:grayscale"
          >
            <span className="material-symbols-outlined text-[20px] fill">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
