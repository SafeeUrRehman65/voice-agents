import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatFireworks } from "@langchain/community/chat_models/fireworks";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// construct absolute path safely
const pathCSV = path.join(__dirname, "../context/agp_pharma_products.csv");

const loader = new CSVLoader(pathCSV);

const docs = await loader.load();

const csvContent = docs.map((doc) => doc.pageContent).join("\n");

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are a helpful assistant analyzing and searching through CSV data and answering queries.**GUIDELINES:** 1. Keep your answers brief and concise unless user asks for detailed answers. 2. The max length of your responses shouldn't exceed 6 sentences. 3. Always restrict your results to a maximum of 4 unless user asks for more.",
  ],
  [
    "user",
    "Question:{question}\n Based on this data:\n {csvContent} \nAnswer:",
  ],
]);

// pass to llm as context
const llm = new ChatFireworks({
  model: "accounts/fireworks/models/gpt-oss-120b",
  temperature: 0,
  apiKey: process.env.FIREWORKS_AI_API_KEY,
});

const chain = prompt.pipe(llm);

const searchCSVService = async (query) => {
  console.log("Query recieved in service", query);
  const response = await chain.invoke({
    csvContent: csvContent,
    question: query,
  });

  console.log("AI response", response.content);
  return response.content;
};

export default searchCSVService;
