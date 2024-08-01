const functions = require("firebase-functions");
const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

/**
 * Generate a letter using OpenAI's GPT-3.5-turbo model.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.post("/api/generate-letter", async (req, res) => {
  const {prompt} = req.body;
  console.log("Received prompt:", prompt);

  const messages = [
    {
      role: "system",
      content: "あなたは日本語のネイティブスピーカーで、プロのライターである。",
    },
    {role: "user", content: prompt},
  ];

  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const response = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-3.5-turbo",
            messages: messages,
            max_tokens: 300,
            n: 1,
            stop: null,
            temperature: 0.7,
          },
          {
            headers: {
              "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
              "Content-Type": "application/json",
            },
          },
      );

      const text = response.data.choices[0].message.content.trim();
      console.log("Response from OpenAI API:", text);
      return res.json({text});
    } catch (error) {
      if (error.response && error.response.status === 429) {
        console.log(
            `Attempt ${attempt} failed: Too Many Requests.`,
        );
        await sleep(1000 * attempt); // 再試行前に増加する遅延を加える
      } else {
        console.error(
            "Error communicating with OpenAI API:",
          error.response ? error.response.data : error.message,
        );
        return res.status(500).json({error: "Communicating with OpenAI API"});
      }
    }
  }

  res.status(500).json({error: "Too many retries. Please try again later."});
});

exports.app = functions.https.onRequest(app);

/**
 * Sleep for a given number of milliseconds.
 * @param {number} ms - The number of milliseconds to sleep.
 * @return {Promise} A promise that resolves after the specified time.
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
