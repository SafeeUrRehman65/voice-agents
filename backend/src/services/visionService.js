import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({
  apiKey: process.env.FIREWORKS_AI_API_KEY, 
  baseURL: "https://api.fireworks.ai/inference/v1",
});

export const analyzeImage = async (base64Image, userPrompt) => {
  try {
    console.log("👀 Vision Service: Sending image to Fireworks AI...");

    const systemPrompt = `
      You are a specialized Halal compliance AI. 
      Your job is to analyze images for Halal/Haram status (Food, Ingredients, Cosmetics, Tourism).
      And if user provide the barcode image, you need to identify the product and check its Halal status.
      
      STRICT RULES:
      1. If the image contains a football, hand, car, person, furniture, or any random object NOT related to Halal/Food/Cosmetics, you MUST reply: "I can only assist with Halal-related matters. This image appears irrelevant."
      2. Do not attempt to describe irrelevant objects. Reject them immediately.
      3. If the image is valid (food, label, etc.), answer the user's question regarding its Halal status.
    `;

    // 2. Default user prompt if none provided
    const defaultUserPrompt = "Check this image for Halal/Haram status. If it is irrelevant to Halal topics, reject it.";

    const finalUserPrompt = userPrompt 
      ? `User Question: "${userPrompt}". (Remember: Reject if image is not related to Food/Halal/Cosmetics)` 
      : defaultUserPrompt;
      
    const response = await client.chat.completions.create({
      model: "accounts/fireworks/models/qwen3-vl-235b-a22b-thinking",
      messages: [
        {
            role: "system",
            content: systemPrompt,
        },
        {
            role: "user",
            content: [
                {
                type: "text",
                text: finalUserPrompt
                },
                {
                type: "image_url",
                image_url: {
                    url: base64Image, 
                },
                },
            ],
        },
      ],
      max_tokens: 2048,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Vision Error:", error);
    return "I had trouble analyzing that image. Please try again.";
  }
};


//     // 1. Strict System Instruction
//     const systemPrompt = `
//       You are a specialized Halal compliance AI. 
//       Your ONLY job is to analyze images for Halal/Haram status.
      
//       IMPORTANT:
//       - First, think silently about the image analysis.
//       - Then, provide ONLY the final answer to the user.
//       - DO NOT include your internal monologue or "Let's check the image" sentences in the final output.
//       - Start your final response immediately with the direct answer.
      
//       STRICT RULES:
//       1. If the image contains a football, hand, car, person, furniture, or any random object NOT related to Halal/Food/Cosmetics, reply exactly: "I can only assist with Halal-related matters. This image appears irrelevant."
//       2. If valid, answer the user's question directly.
//     `;
