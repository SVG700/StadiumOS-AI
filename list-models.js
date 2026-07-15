const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GOOGLE_API_KEY;

const genAI = new GoogleGenerativeAI(apiKey);

async function main() {
  try {
    const models = await genAI.listModels();

    console.log("Available Models:\n");

    for (const model of models.models) {
      console.log(model.name);
    }
  } catch (err) {
    console.error(err);
  }
}

main();