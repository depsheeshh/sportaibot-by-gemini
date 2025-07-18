const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const sendButton = form.querySelector('button');

// --- 1. Manajemen Session ID ---
// Fungsi untuk mendapatkan atau membuat sessionId yang unik untuk setiap pengguna.
function getSessionId() {
    // Coba ambil sessionId dari penyimpanan lokal browser
    let sessionId = localStorage.getItem('chatSessionId');
    
    // Jika tidak ada, buat yang baru dan simpan
    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`; // <-- Membuat ID unik
        localStorage.setItem('chatSessionId', sessionId); // <-- Menyimpan ID agar tidak hilang
    }
    return sessionId;
}

const sessionId = getSessionId(); // <-- Panggil fungsi saat aplikasi dimuat

form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const userMessage = input.value.trim();
    if (!userMessage) return;

    appendMessage('user', userMessage);
    input.value = '';
    sendButton.disabled = true;

    const botMessageElement = appendMessage('bot', '');
    botMessageElement.classList.add('loading');
    botMessageElement.innerHTML = '<span class="loading-dots"></span>';

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // --- 2. Mengirim `sessionId` bersama pesan ---
            body: JSON.stringify({ 
                message: userMessage,
                sessionId: sessionId // <-- Tambahkan sessionId di sini
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            // --- 3. Perbaikan penanganan error ---
            throw new Error(errorData.error || 'Something went wrong'); // <-- Gunakan `errorData.error` sesuai respons backend
        }

        const data = await response.json();
        botMessageElement.classList.remove('loading');
        botMessageElement.innerHTML = data.reply;
    } catch (error) {
        console.error('Error:', error);
        botMessageElement.classList.remove('loading');
        botMessageElement.textContent = `Error: ${error.message}`;
        botMessageElement.classList.add('error');
    } finally {
        sendButton.disabled = false;
        input.focus();
    }
});

function appendMessage(sender, text) {
    const msg = document.createElement('div');
    msg.classList.add('message', sender);
    msg.textContent = text;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
    return msg;
}