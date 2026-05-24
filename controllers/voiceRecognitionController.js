const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

ffmpeg.setFfmpegPath(ffmpegPath);

exports.getTextFromVoice = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Файл не передан" });
        }

        const inputPath = path.join(__dirname, "input.webm");
        const outputPath = path.join(__dirname, "output.ogg");

        fs.writeFileSync(inputPath, req.file.buffer);

        await new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .audioCodec("libopus")
                .format("ogg")
                .on("end", resolve)
                .on("error", reject)
                .save(outputPath);
        });

        const audioBuffer = fs.readFileSync(outputPath);

        const response = await axios.post(
            "https://stt.api.cloud.yandex.net/speech/v1/stt:recognize",
            audioBuffer,
            {
                headers: {
                    "Content-Type": "audio/ogg",
                    Authorization: `Api-Key ${process.env.YANDEX_API_KEY}`,
                },
                params: {
                    lang: "ru-RU",
                },
            }
        );

        return res.json({ text: response.data.result });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
};