const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const {GoogleGenerativeAI} = require('@google/generative-ai');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });



// Route
app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;

    if(!userMessage) {
        return res.status(400).json({ reply: "Message is required" });
    };

    // --- Deteksi pertanyaan perkenalan ---
    const introKeywords = [
        'siapa kamu', 'siapakah anda', 'who are you', 'apa itu sportaibot', 'kenalkan', 'perkenalkan', 'what is sportaibot'
    ];
    const isIntro = introKeywords.some(keyword =>
        userMessage.toLowerCase().includes(keyword)
    );

    if (isIntro) {
        return res.json({ reply: "SportAIBot: Hai! Saya SportAIBot, chatbot AI yang khusus membantu menjawab pertanyaan seputar dunia olahraga. Silakan tanyakan apa saja tentang olahraga seperti sepak bola, basket, renang, dan lainnya. Saya siap membantu Anda dengan informasi olahraga yang mudah dipahami dan ramah!" });
    }

    // --- Deteksi topik olahraga ---
    const olahragaKeywords = [
        'olahraga', 'sepak bola', 'basket', 'voli', 'renang', 'badminton', 'lari', 'fitness', 'gym', 'atlet', 'pertandingan', 'skor', 'tim', 'pemain', 'olympiade'
    ];
    const isOlahraga = olahragaKeywords.some(keyword =>
        userMessage.toLowerCase().includes(keyword)
    );

    if (!isOlahraga) {
        return res.json({ reply: "SportAIBot: Maaf, saya hanya bisa menjawab seputar olahraga. Silakan tanyakan hal tentang olahraga!" });
    }

    try {
        // Prompt agar Gemini menjawab dengan bahasa yang mudah dipahami
        const prompt = `Jawablah pertanyaan berikut dengan bahasa yang mudah dipahami dan ramah, hanya seputar olahraga. Jawabanmu harus diawali dengan 'SportAIBot:'.\n${userMessage}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({reply:text});
    } catch (e) {
        console.log(e);
        res.status(500).json({ reply: "SportAIBot: Something Went Wrong" });
    }
 })

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});