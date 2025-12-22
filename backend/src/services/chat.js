import dotenv from "dotenv";
import { createAgent } from "langchain";
import { ChatGroq } from "@langchain/groq";
import { HumanMessage } from "@langchain/core/messages";
import googleSearch from "../tools/googleSearch.js";
import { analyzeImage } from './visionService.js';
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
  
### IMAGE ANALYSIS & RESTRICTIONS

**Scope:**
You can only analyze images related to:
1. Food & Beverages (Labels, Ingredients, Packaging).
2. Cosmetics & Medicines (Ingredients lists).
3. Halal Logos or Certificates.
4. Tourist spots (Mosques, Restaurants).

**Strict Restrictions:**
- **DO NOT** analyze images of:
  - Human body parts (hands, faces, selfies).
  - Sports equipment (footballs, bats).
  - Vehicles, furniture, or random daily objects.
  - Anything sexually explicit or haram by nature.

- If an image falls outside the "Halal" scope, reply politely: 
  "I specialize only in Halal matters (food, cosmetics, tourism). I cannot analyze this image as it appears unrelated."
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
      try {
        const parsed_message = JSON.parse(message);
        const message_type = parsed_message.type;

        switch (message_type) {
          case "HumanMessage":
            const human_message = parsed_message.human_message;

            const response = await halalify.invoke({
              messages: [new HumanMessage(human_message)],
            });

            const agentResponse = response.messages[1].content;
            
            socket.send(
              JSON.stringify({
                type: "AIMessage",
                AIMessage: agentResponse || "",
              })
            );
            break;

          case "ImageMessage":
            console.log("📸 Image received in Backend");
            
            socket.send(JSON.stringify({
                type: "AIMessage",
                AIMessage: "🔍 Analyzing image..."
            }));

            const userPrompt = parsed_message.prompt; 

            const imageAnalysis = await analyzeImage(parsed_message.image, userPrompt);

            socket.send(JSON.stringify({
                type: "AIMessage",
                AIMessage: imageAnalysis
            }));
            break;

          default:
            console.log("Unknown message type:", message_type);
            break;
        }
      } catch (error) {
        console.error("Error processing message:", error);
        socket.send(JSON.stringify({
            type: "AIMessage",
            AIMessage: "Sorry, something went wrong processing your request."
        }));
      }
    });

    //   const parsed_message = JSON.parse(message);
    //   const message_type = parsed_message.type;
    //   switch (message_type) {
    //     case "HumanMessage":
    //       //logic to send human message to our agent
    //       const human_message = parsed_message.human_message;

    //       const response = await halalify.invoke({
    //         messages: [new HumanMessage(human_message)],
    //       });

    //       console.log("AI Response", response.messages[1].content);
    //       const agentResponse = response.messages[1].content;
    //       socket.send(
    //         JSON.stringify({
    //           type: "AIMessage",
    //           AIMessage: agentResponse || "",
    //         })
    //       );
    //       break;
    //     default:
    //       break;
    //   }
    // });

    socket.on("error", (error) => {
      console.error(`Server error: ${error.message}`);
      console.log("Closing server websocket");
      socket.close();
    });
  });
  return wss;
};

export { startChat };
