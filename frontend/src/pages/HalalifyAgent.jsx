import { useEffect, useRef, useState } from "react";
import { getJWT } from "../utils/auth.jsx";
import { useMicVAD } from "@ricky0123/vad-react";
import useAudioQueue from "../hooks/useAudioQueue.jsx";
import VoiceAssistantModel from "../components/VoiceAssistantModel.jsx";
// import runQuery from "../tools/runQuery.jsx";
import googleSearch from "../tools/googleSearch.jsx";
import EndConversation from "../tools/EndConversation.jsx";
import { motion, scale } from "motion/react";

function HalalifyAgent() {
  const VADRef = useRef(null);
  const webSocketRef = useRef(null);
  const [promptResponse, setPromptResponse] = useState([]);
  const { playChunk } = useAudioQueue();
  const messagesEndRef = useRef(null);
  const [schema, setSchema] = useState(null);
  const promptRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [promptResponse]);

  useEffect(() => {
    const getSchema = async () => {
      try {
        const response = await fetch("http://localhost:3000/user-query", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) throw new Error("Failed to fetch schema");

        const data = await response.json();

        const schema_info = data.schema[0].schema_info;
        console.log("Schema info", schema_info);
        setSchema(schema_info);
        return;
      } catch (err) {
        console.error("Some error occured while fetching database schema");
      }
    };
    // getSchema();
  }, []);

  // useEffect(() => {
  //   if (!promptRef.current) return;
  //   promptRef.current.scrollTo({
  //     top: promptRef.current.scrollHeight,
  //     behavior: "smooth",
  //   });
  // }, [promptResponse]);

  // initialize the vad
  const vad = useMicVAD({
    startOnLoad: false,
    onSpeechStart: () => {
      console.log("Speech has started!");
    },
    onFrameProcessed: ({ isSpeech, notSpeech }, audio) => {
      if (
        webSocketRef.current &&
        webSocketRef.current.readyState === WebSocket.OPEN
      ) {
        webSocketRef.current.send(audio);
      }
    },
    onSpeechEnd: () => {
      "Speech has ended!";
    },
    // onnxWASMBasePath:
    //   "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/",
    // baseAssetPath:
    //   "https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.27/dist/",
    baseAssetPath: "/vad/", 
    onnxWASMBasePath: "/vad/",
  });

  VADRef.current = vad;

  const connectToSpeechmatics = async () => {
    const jwt = await getJWT();
    const webSocket = new WebSocket(
      `wss://flow.api.speechmatics.com/v1/flow?jwt=${jwt}`
    );
    webSocket.binaryType = "arraybuffer";
    webSocket.onopen = () => {
      console.log("Connected to socket");
      // send StartConversation message
      const data = {
        message: "StartConversation",
        audio_format: {
          type: "raw",
          encoding: "pcm_f32le",
          sample_rate: 16000,
        },
        //english - 1391918a-d09d-4170-ac0a-d807300edd81:latest
        //arabic -  7393db87-30c3-4c3b-a2b5-785521db5039:latest
        // french - 14c677fe-f700-4e0c-967c-9c9adb4541a9:latest
        // hindi - b14a002a-176d-4301-93e9-0ff656f834b2:latest
        //agp-pharma - afa81d32-1fbf-419a-951e-bee859cdf352:latest

        conversation_config: {
          template_id: "1391918a-d09d-4170-ac0a-d807300edd81:latest",
          template_variables: {
            db_schema: schema,
          },
        },
        tools: [
          // {
          //   type: "function",
          //   function: {
          //     name: "runQuery",
          //     description:
          //       "Search halal food, beverages, cakes, and other edible products. Use this to answer user questions about product availability, details, ingredients, or categories.",
          //     parameters: {
          //       type: "object",
          //       properties: {
          //         query: {
          //           type: "string",
          //           description:
          //             "A syntactically correct PostgreSQL SELECT query based on the provided database schema. The query should only retrieve data and should not contain INSERT, UPDATE, or DELETE commands.",
          //           example:
          //             "SELECT name, product_name, halal_code, category FROM Halal Food Thailand LIMIT 3;",
          //         },
          //       },
          //       required: ["query"],
          //     },
          //   },
          // },
        {
            type: "function",
            function: {
              name: "googleSearch",
              description: `
                Use this tool to perform a Google Search for halal food, beverages, restaurants, and industry information.
                
                CRITICAL RULES FOR USAGE:
                1. IF the user asks for physical locations (e.g., "Find halal pizza", "Halal steakhouse") AND does not specify a city, state, or country:
                  - DO NOT call this tool.
                  - Instead, ASK the user: "Which city or region would you like me to search in?"
                  
                2. IF the user specifies a location (e.g., "Halal pizza in New York") OR the query is general (e.g., "What is meant by halal?", "Halal certification rules"):
                  - Call this tool immediately with the search query.
              `,
              parameters: {
                type: "object",
                properties: {
                  query: {
                    type: "string",
                    description: "The optimal search string for Google (e.g., 'Halal Korean BBQ in London' or 'Is Gelatin Halal').",
                  },
                },
                required: ["query"],
              },
            },
          },

          {
            type: "function",
            function: {
              name: "EndConversation",
              description:
                "End Conversation when user says some words or phrases which indicate end of conversation.",
            },
          },
        ],
      };
      webSocket.send(JSON.stringify(data));
      console.log("sent config data");
      // start the vad
      VADRef.current?.start();
    };
    webSocket.onmessage = async (event) => {
      const data = event.data;
      if (data instanceof ArrayBuffer) {
        playChunk(data);
        return;
      }

      const parsed_data = JSON.parse(event.data);
      const message = parsed_data["message"];

      switch (message) {
        case "AddTranscript":
          const transcript = parsed_data.metadata.transcript;
          // console.log("Final Transcript", transcript);
          break;
        case "ResponseCompleted":
          const response = parsed_data.content;
          // console.log("Final response", response);
          break;
        case "prompt":
          const prompt = parsed_data.prompt;
          const prompt_id = prompt.id;
          const prompt_text = prompt.prompt;
          const response_text = prompt.response;
          const plain_response = response_text.replace(/<[^>]*>/g, "").trim();
          // const plain_response = response_text.replace(/<[^>]*>/, "").trim();
          // console.log("Plain response", plain_response);
          let updated_prompt;

          updated_prompt = { ...prompt, response: plain_response };
          const hasResultXML =
            /<(RESULT|APPLICATION_INPUT)(\s+[^>]*)?>.*?<\/\1>/is.test(
              prompt_text
            );

          if (hasResultXML) {
            updated_prompt = { ...prompt, prompt: "" };
          }
          setPromptResponse((prev) => {
            const index = prev?.findIndex((obj) => obj.id === prompt_id);
            if (index === -1) {
              return [...prev, updated_prompt];
            }
            const updated = [...prev];
            updated[index] = updated_prompt;
            return updated;
          });
          break;
        case "ToolInvoke":
          console.log("Invoke tool", parsed_data);
          const tool_id = parsed_data.id;
          const function_name = parsed_data.function.name;
          switch (function_name) {
            // case "runQuery":
            //   const query = parsed_data.function.arguments.query;
            //   const result = await functionMap[function_name](query);
            //   const queryResult = result.queryResult;
            //   console.log("Result: ", queryResult);

            //   if (
            //     webSocketRef.current &&
            //     webSocketRef.current.readyState === WebSocket.OPEN
            //   ) {
            //     console.log("Sending tool result");
            //     if (queryResult.length !== 0) {
            //       webSocketRef.current.send(
            //         JSON.stringify({
            //           message: "ToolResult",
            //           id: tool_id,
            //           status: "ok",
            //           content: JSON.stringify(queryResult),
            //         })
            //       );
            //     } else {
            //       webSocketRef.current.send(
            //         JSON.stringify({
            //           message: "AddInput",
            //           input:
            //             "The tool call returned empty results which means that user desired product was not found from the database. Now handle the query yourself and answer the user question from your own existing knowledge base WITHOUT tell him/her that you couldn't find any information.",
            //           interrupt_response: true,
            //           immediate: true,
            //         })
            //       );
            //     }
            //   }

            //   break;

            case "googleSearch":
            const query = parsed_data.function.arguments.query;
            const result = await functionMap[function_name](query);
            const queryResult = result.queryResult;
            
            console.log("Google Search Result: ", queryResult);

            if (
              webSocketRef.current &&
              webSocketRef.current.readyState === WebSocket.OPEN
            ) {
              // Check if the result is valid and NOT our "No results" error message
              const hasValidResults = queryResult && !queryResult.includes("No results found");

              if (hasValidResults) {
                console.log("Sending successful tool result");
                webSocketRef.current.send(
                  JSON.stringify({
                    message: "ToolResult",
                    id: tool_id,
                    status: "ok",
                    content: queryResult, // Send the text result directly
                  })
                );
              } else {
                console.log("No results found, forcing AI fallback");
                webSocketRef.current.send(
                  JSON.stringify({
                    message: "AddInput",
                    input:
                      "The Google search returned no relevant results. Now handle the query yourself and answer the user's question from your own existing knowledge base WITHOUT mentioning that the search failed.",
                    interrupt_response: true,
                    immediate: true,
                  })
                );
              }
            }
            break;

            case "EndConversation":
              // end the converation
              functionMap[function_name](webSocketRef, setPromptResponse);
              break;
          }

        case "searchCSV":
          const query = parsed_data.function.arguments.query;
          console.log("User Query", query);
          const result = await functionMap[function_name](query);

          const queryResult = result.queryResult;
          console.log("Query result", queryResult);

          if (
            webSocketRef.current &&
            webSocketRef.current.readyState === WebSocket.OPEN
          ) {
            console.log("Sending tool result");
            if (result.length !== 0) {
              console.log("sending actual tool result");
              webSocketRef.current.send(
                JSON.stringify({
                  message: "ToolResult",
                  id: tool_id,
                  status: "ok",
                  content: queryResult,
                })
              );
            } else {
              webSocketRef.current.send(
                JSON.stringify({
                  message: "AddInput",
                  input:
                    "The tool call returned empty results which means that the query didn't obtained any results or the product was not found from the context. Now handle the query yourself and answer the user question from your own existing knowledge base WITHOUT tell him/her that you couldn't find any information.",
                  interrupt_response: true,
                  immediate: true,
                })
              );
            }
          }
          break;
        default:
          break;
      }
    };

    webSocket.onerror = (error) => console.error("Error:", error);
    webSocketRef.current = webSocket;
  };

  return (
    <div
      ref={promptRef}
      className="flex flex-col gap-y-8 bg-black h-screen scrollbar overflow-y-auto"
    >
      <div className="title-box pt-4">
        <p className="text-center tracking-tighter switzer-500 text-5xl text-white">
          Halalify
        </p>
      </div>
      <div className="flex gap-x-4 justify-center">
        {webSocketRef?.current?.readyState !== WebSocket.OPEN ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            // disabled={schema ? false : true}
            onClick={connectToSpeechmatics}
            className="inter-300 tracking-wider absolute px-4 py-3 text-sm text-white rounded-xl animated-gradient-border animate-border-spin hover:bg-violet-200/10 transition-all ease-in-out duration-300 hover:inter-400 cursor-pointer"
          >
            Start Conversation
          </motion.button>
        ) : (
          <button
            onClick={() => {
              webSocketRef?.current?.close();
              setPromptResponse([]);
            }}
            className="absolute inter-300 tracking-wider px-3 py-2 text-sm text-red-400 hover:scale-105 rounded-xl transition-all ease-in-out duration-300 border border-red-300/40 cursor-pointer"
          >
            Stop Conversation
          </button>
        )}
      </div>
      <div
        className={`${
          webSocketRef?.current?.readyState === WebSocket.OPEN
            ? "opacity-100"
            : "opacity-0"
        } w-full flex justify-center bg-black transition-all ease-in-out duration-300`}
      >
        <VoiceAssistantModel />
      </div>
      {promptResponse?.length > 0 ? (
        <div className="flex flex-col w-full items-center">
          <p className="roboto-400 text-white text-xl font-semibold">
            Conversation
          </p>
        </div>
      ) : null}
      <div className="flex flex-col items-center gap-y-6 w-full px-4">
        {promptResponse?.map((pair, index) => {
          const speaker_number = pair["prompt"] && pair["prompt"][2];

          const color = getColor(speaker_number);

          return (
            <div
              key={index}
              className="flex flex-col gap-y-2 w-full md:w-3/4 lg:w-1/2"
            >
              {pair["prompt"] && (
                <div
                  className={`w-1/2 ml-auto rounded-2xl border ${
                    color === "white"
                      ? "border-white/20 text-white"
                      : color === "purple-200"
                      ? "border-purple-200/20 text-purple-200"
                      : color === "violet-200"
                      ? "border-violet-200/20 text-violet-200"
                      : color === "red-200"
                      ? "border-red-200/20 text-red-200"
                      : color === "orange-200"
                      ? "border-orange-200/20 text-orange-200"
                      : color === "lime-200"
                      ? "border-lime-200/20 text-lime-200"
                      : color === "emerald-200"
                      ? "border-emerald-200/20 text-emerald-200"
                      : color === "sky-200"
                      ? "border-sky-200/20 text-sky-200"
                      : color === "fuchsia-200"
                      ? "border-fuchsia-200/20 text-fuchsia-200"
                      : ""
                  } px-3 py-2 shadow-lg`}
                >
                  <strong className={`text-${color} roboto-600`}>
                    Speaker {pair["prompt"][2]}
                  </strong>
                  <p className="inter-400 text-white">
                    {pair["prompt"].slice(4, -5)}
                  </p>
                </div>
              )}
              {pair["response"] ? (
                <div className="w-1/2 rounded-xl p-2 border border-white/20 shadow-lg">
                  <strong className="roboto-600 text-white">Agent</strong>
                  <p className="inter-400 text-white">{pair["response"]}</p>
                </div>
              ) : null}
              <div ref={messagesEndRef}></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default HalalifyAgent;

const getColor = (speakerNumber) => {
  switch (speakerNumber) {
    case "1":
      return "white";

    case "2":
      return "purple-200";

    case "3":
      return "violet-200";

    case "4":
      return "red-200";

    case "5":
      return "orange-200";

    case "6":
      return "lime-200";

    case "7":
      return "emerald-200";

    case "8":
      return "sky-200";

    case "9":
      return "fuchsia-200";

    default:
      return;
  }
};

// // case "AddTranscript":
// //   const final_transcript = data.metadata.transcript;
// //   console.log("final transcript", final_transcript);
// //   setPrompt((prev) => [...prev, final_transcript]);
// //   break;

// // case "ResponseCompleted":
// //   const total_response = data.content;
// //   setResponse((prev) => [...prev, total_response]);
// //   console.log("Agent's total response", total_response);
// //   break;

const functionMap = {
  googleSearch: googleSearch,
  EndConversation: EndConversation,
};
