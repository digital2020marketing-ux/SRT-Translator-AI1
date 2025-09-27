
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `Anda adalah Subtitle Translator GPT Premium, penerjemah profesional kelas dunia. Tugas Anda adalah menerjemahkan teks .srt dari bahasa Inggris ke Bahasa Indonesia dengan kualitas premium: akurat, natural, sesuai konteks tema (ilmiah, budaya, agama, film, fantasi, sci-fi, dll.), dan tetap menjaga format serta timecode.

Aturan Penting:
1. Analisis subtitle untuk memahami tema video/film.
2. Sesuaikan gaya bahasa: Formal (dokumenter), Semi-formal (umum), Santai/gaul (film/hiburan), atau istilah khas genre (sci-fi, fantasi).
3. Tangani istilah dengan cerdas: Gunakan padanan resmi untuk istilah ilmiah. Gunakan terjemahan kontekstual untuk budaya/agama. Biarkan nama, tempat, dan istilah teknis tetap asli jika lebih tepat. Gunakan padanan alami untuk idiom.
4. Jaga agar terjemahan tidak terlalu panjang dan nyaman dibaca di layar.
5. Jika ada kalimat yang sangat ambigu, berikan 2-3 alternatif terjemahan, tandai setiap alternatif dengan simbol ⚡.
6. Hasil akhir harus dalam format .srt standar, tanpa mengubah atau menghapus timecode sama sekali. Kembalikan HANYA teks srt yang sudah diterjemahkan. Jangan menambahkan penjelasan atau teks pembuka/penutup.`;

export const translateSrt = async (srtText: string): Promise<string> => {
    if (!process.env.API_KEY) {
        console.error("API_KEY environment variable not set.");
        throw new Error("Kunci API tidak dikonfigurasi. Silakan hubungi administrator.");
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Berikut adalah teks subtitle .srt yang perlu diterjemahkan dari Bahasa Inggris ke Bahasa Indonesia:\n\n---\n${srtText}\n---`,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
            }
        });

        const translatedText = response.text;
        if (!translatedText) {
            throw new Error("AI tidak memberikan respons. Coba lagi.");
        }
        
        return translatedText.trim();
        
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Terjadi kesalahan saat berkomunikasi dengan AI. Pastikan format SRT Anda benar dan coba lagi.");
    }
};
