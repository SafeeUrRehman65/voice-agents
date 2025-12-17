import dotenv from "dotenv";
import { createAgent } from "langchain";
import { ChatGroq } from "@langchain/groq";
import { HumanMessage } from "@langchain/core/messages";
import googleSearch from "../tools/googleSearch.js";
import { WebSocketServer } from "ws";

dotenv.config();
const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  apiKey: process.env.GROQ_AI_API_KEY,
  temperature: 0,
  maxRetries: 2,
});

const system_instructions = `You are a halal assistant and your role is to provide assistance in halal related matters worldwide, including but not limited to food, beverage, tourism, cosmetics, etc. If user asks anything irrelevant or unrelated to the specific halal category, redirect him politely to your specified niche and role.

## TOOL CALLING

### googleSearch Tool

**Purpose:**  
Retrieve halal-related information such as food, beverages, cosmetics, tourist spots, etc.

**Guidelines:**
1. Call the "googleSearch" tool when the user asks about halal products or places (e.g., food, beverages, tourist spots, cosmetics).
2. If the user asks about halal products or spots, **first ask for the user’s location** (city, state, or country).
3. After receiving the location, call the tool using the provided location.

---

### EndConversation Tool

**Purpose:**  
End the conversation and disconnect the WebSocket when the user wants to end it.

**Examples:**  
- “Goodbye”  
- “Allah Hafiz”  
- Any similar farewell phrase

---

### Important Guidelines

- If no relevant or empty results are obtained after calling the "googleSearch" tool:
  - Answer the user using your own knowledge.
  - **Do not** tell the user that the tool returned no results.
`;

const halalify = createAgent({
  model,
  tools: [],
  systemPrompt: system_instructions,
});

const WEBSOCKET_PORT = 9000;

let wss = null;
const startChat = () => {
  if (wss) return wss;
  wss = new WebSocketServer({
    port: WEBSOCKET_PORT,
  });

  wss.on("listening", () => {
    console.log(`WS listening on ${WEBSOCKET_PORT}`);
  });
  wss.on("connection", (socket) => {
    console.log(`Client connected at ${WEBSOCKET_PORT}!`);

    socket.on("message", async (message) => {
      console.log(`Message received from client ${message}`);
      const parsed_message = JSON.parse(message);
      const message_type = parsed_message.type;
      switch (message_type) {
        case "HumanMessage":
          //logic to send human message to our agent
          const human_message = parsed_message.human_message;

          const response = await halalify.invoke({
            messages: [new HumanMessage(human_message)],
          });

          console.log("AI Response", response.messages[1].content);
          const agentResponse = response.messages[1].content;
          socket.send(
            JSON.stringify({
              type: "AIMessage",
              AIMessage: agentResponse || "",
            })
          );
          break;
        default:
          break;
      }
    });

    socket.on("error", (error) => {
      console.error(`Server error: ${error.message}`);
      console.log("Closing server websocket");
      socket.close();
    });
  });
  return wss;
};

export { startChat };
