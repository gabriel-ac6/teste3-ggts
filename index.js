const express = require('express');
const gTTS = require('gtts');
const multer = require('multer');
const { PassThrough } = require('stream');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

// Configurações do Express
const app = express();
const port = 3000;

// Configuração do multer para lidar com form-data
const upload = multer();

// Middleware para interpretar o corpo da requisição como JSON
app.use(express.json());

// Endpoint para converter texto em áudio e retornar como arquivo
app.post('/text-to-speech', upload.none(), (req, res) => {
    const text = req.body.text;

    if (!text) {
        return res.status(400).json({ error: 'Texto é necessário' });
    }

    // Definindo a língua como português
    const language = 'pt';
    const gtts = new gTTS(text, language);

    // Usar um buffer para capturar o áudio sem salvar em arquivo
    const mp3Stream = new PassThrough();
    gtts.stream().pipe(mp3Stream);

    // Converter o áudio MP3 para WAV usando ffmpeg
    res.set({
        'Content-Type': 'audio/wav',
        'Content-Disposition': 'attachment; filename="audio.wav"'
    });

    ffmpeg(mp3Stream)
        .toFormat('wav')
        .on('error', (err) => {
            console.error('Erro ao converter o áudio:', err);
            res.status(500).json({ error: 'Erro ao converter o áudio' });
        })
        .pipe(res, { end: true });
});

// Iniciando o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});