const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const pdf = require("pdf-parse");
const dotenv = require("dotenv");
dotenv.config();
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");


const app = express();

// ✅ Allow frontend (React) to access backend
app.use(cors());

// ✅ Enable file upload
app.use(fileUpload());
app.use(express.json({ limit: "50mb" }));

// let extractedText = "";
// let pages = [];
const sessions = {};

app.get("/", (req, res) => {
    res.send("✅ Server running");
});

app.post("/api/upload", async (req, res) => {
    try {
        if (!req.files || !req.files.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const pdfFile = req.files.file;

        const data = await pdf(pdfFile.data);
        // pages = data.text.split("\f"); 
        // const pages = data.text.split(/\n\s*\n/g);
        const pages = data.text.split(/\f|\n\s*\n/g).map(p => p.trim()).filter(Boolean);

        const extractedText = pages.join("\n");

        // const uploadId = uuidv4();

        const sessionId = uuidv4();
        sessions[sessionId] = { extractedText, pages };
        // extractedText = data.text;
        res.json({
            message: "PDF processed successfully",
            sessionId,
        });
    } catch (error) {
        console.error("Error parsing PDF:", error);
        res.status(500).json({ error: "Failed to extract text" });
    }
});

// ✅ Ask AI about the uploaded PDF
// app.post("/api/ask", async (req, res) => {
//   try {
//     const { question } = req.body;

//     if (!extractedText) {
//       return res.status(400).json({ error: "No PDF uploaded yet" });
//     }

//     console.log("Question received:", question);
//     const prompt = `You are an assistant that answers questions based on this document:\n\n${extractedText.slice(
//       0,
//       2000
//     )}\n\nQuestion: ${question}\nAnswer:`;

//     // ✅ Use a free Hugging Face model
//     const hfResponse = await axios.post(
//       "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
//       { inputs: prompt },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.TOKEN}`,
//         },
//       }
//     );

//     const answer =
//       hfResponse.data[0]?.summary_text ||
//       hfResponse.data[0]?.generated_text ||
//       "Sorry, I couldn’t generate an answer.";
//       console.log("Answer generated:", answer);
//     res.json({ answer });
//   } catch (error) {
//     console.error("Error calling AI:", error.response?.data || error.message);
//     res.status(500).json({
//       error: "AI request failed",
//       details: error.response?.data || error.message,
//     });
//   }
// });

// app.post("/api/ask", async (req, res) => {
//   try {
//     const { question } = req.body;
//     if (!extractedText) {
//       return res.status(400).json({ error: "No PDF uploaded yet" });
//     }

//     // Limit context to first 4000 chars to prevent overflow
//     const context = extractedText.slice(0, 4000);

//     // Use Hugging Face Question Answering model
//     const hfResponse = await axios.post(
//       "https://api-inference.huggingface.co/models/deepset/roberta-base-squad2",
//       {
//         inputs: {
//           question: question,
//           context: context,
//         },
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.TOKEN}`,
//         },
//       }
//     );

//     const answer =
//       hfResponse.data?.answer || "Sorry, I couldn’t find an answer in the document.";

//     console.log("Question received:", question);
//     console.log("Answer generated:", answer);

//     res.json({ answer });
//   } catch (error) {
//     console.error("❌ Error calling AI:", error.response?.data || error.message);
//     res.status(500).json({ error: "AI request failed" });
//   }
// });

app.post("/api/ask", async (req, res) => {
    const { question, sessionId } = req.body;

    if (!sessions[sessionId]) {
        return res.status(400).json({ error: "Invalid or expired session" });
    }

    const { extractedText, pages } = sessions[sessionId];


    if (!extractedText)
        return res.status(400).json({ error: "No PDF uploaded yet" });

    const context = extractedText.slice(0, 1500);
    const prompt = `Answer the following question based only on this text:\n\n${context}\n\nQuestion: ${question}`;

    try {
        const response = await axios.get(
            "https://text.pollinations.ai/" + encodeURIComponent(prompt)
        );

        // const matchedPageIndex = pages.findIndex((p) =>
        //     question.split(" ").some((word) => p.toLowerCase().includes(word.toLowerCase()))
        // );

        // const pageNumber = matchedPageIndex !== -1 ? matchedPageIndex + 1 : 1;

        const questionWords = question.toLowerCase().split(/\s+/);

        const pageNumber = pages.reduce((best, page, i) => {
            const count = questionWords.reduce((c, w) => c + (page.toLowerCase().includes(w) ? 1 : 0), 0);
            return count > best.count ? { index: i, count } : best;
        }, { index: 0, count: 0 }).index + 1;


        res.json({ answer: response.data, page: pageNumber });
    } catch (err) {
        console.error("Pollinations error:", err.message);
        res.status(500).json({ error: "AI request failed" });
    }
});

app.listen(5001, () =>
    console.log("✅ Backend running on http://localhost:5001")
);
