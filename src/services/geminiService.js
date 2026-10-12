// Lesson 11: Tích hợp Gemini API tư vấn chọn xe
export const fetchGeminiConsultant = async (budget, preference) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    // Giả lập response nếu chưa có API key thật
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`[AI Autohunt Advisor]: Với ngân sách khoảng ${(budget/1000000).toFixed(0)} triệu VNĐ và nhu cầu "${preference}", bạn nên tham khảo mẫu Toyota Camry (bền bỉ, giữ giá tốt) hoặc Ford Ranger (mạnh mẽ, thích hợp đi đường trường).`);
      }, 1000);
    });
  }

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Tôi có ngân sách ${budget} VNĐ, nhu cầu: ${preference}. Hãy gợi ý 2 mẫu xe phù hợp ngắn gọn bằng tiếng Việt.` }] }]
      })
    });
    const data = await res.json();
    return data.candidates[0].content.parts[0].text;
  } catch (err) {
    return 'Lỗi kết nối AI Service. Vui lòng thử lại sau.';
  }
};