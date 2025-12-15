import { sequelize } from "../../src/db/connectDB.js";
import { ChatFireworks } from "@langchain/community/chat_models/fireworks";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import dotenv from "dotenv";

dotenv.config();

const systemTemplate =
  "You are a SQL assistant expert, given a query, make it syntatically correct \n **INSTRUCTIONS** 1. Only return the correct SQL query, no extra words, characters or symbols. For example Select * from Halal Food Thailand where category = 'food'. 2. NEVER deal with update, modify or delete queries and return an empty string 3. Always use ILIKE instead of LIKE for case-insensitive text searches in PostgreSQL";

const llm = new ChatFireworks({
  apiKey: process.env.FIREWORKS_AI_API_KEY,
  model: "accounts/fireworks/models/gpt-oss-120b",
  temperature: 0,
});

const promptTemplate = ChatPromptTemplate.fromMessages([
  ["system", systemTemplate],
  ["user", "{query}"],
]);

const chain = promptTemplate.pipe(llm);

const runQuery = async (query) => {
  if (!query) {
    throw new Error("Query is not defined!");
  }
  const response = await chain.invoke({ query: query });
  const correct_query = response.content;
  console.log("Corrected query", correct_query);
  const [result] = await sequelize.query(correct_query);
  console.log("Query executed successfully!", result);
  return result;
};

export { runQuery };
