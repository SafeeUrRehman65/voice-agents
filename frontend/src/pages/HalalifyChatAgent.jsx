import { easeInOut, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import SendIcon from "../../src/assets/icons/send_icon.svg?react";
import ImageIcon from "../../src/assets/icons/image_icon.svg?react";
function HalalifyChatAgent() {
  const [isChatActive, setIsChatActive] = useState(false);
  const [showChatPlaceHolder, setShowChatPlaceHolder] = useState(true);
  const [messages, setMessages] = useState([]);
  const inputRef = useRef();
  const messagesEndRef = useRef();
  const wsRef = useRef();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages]);
  useEffect(() => {
    fetch("http://localhost:3000/start-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }).then(() => {
      const webSocket = new WebSocket("ws://localhost:9000");
      wsRef.current = webSocket;

      wsRef.current.onopen = () => {
        console.log("Connected with server side successfully!");
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("data", data);
        const data_type = data.type;
        switch (data_type) {
          case "AIMessage":
            const message = data.AIMessage;
            setMessages((prev) => {
              if (prev.length === 0) {
                return prev;
              }

              const lastMessage = prev[prev.length - 1];
              if (lastMessage.role === "assistant") {
                const updated = [...prev];

                updated[prev.length - 1] = {
                  role: "assistant",
                  message: lastMessage.message + message,
                };
                return updated;
              } else {
                return [...prev, { role: "assistant", message: message }];
              }
            });
            break;
          default:
            break;
        }
      };
    });
  }, []);
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        setIsChatActive(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [isChatActive, setIsChatActive]);

  const ask = (e) => {
    if (e.key !== "Enter" || e.shiftKey) return;
    e.preventDefault();
    if (!inputRef.current || !wsRef.current) {
      return;
    }

    const humanMessage = e.target.innerText.trim();
    if (humanMessage === "") return;
    setMessages((prev) => {
      return [...(prev || []), { role: "user", message: humanMessage }];
    });
    wsRef.current.send(
      JSON.stringify({ type: "HumanMessage", human_message: humanMessage })
    );

    inputRef.current.innerText = "";
    setShowChatPlaceHolder(true);
  };
  return (
    <div className="h-screen w-screen">
      <div className="w-full h-full bg-black flex flex-col">
        <div className="title-box pt-4">
          <p className="text-center tracking-tighter switzer-500 text-5xl text-white">
            Halalify
          </p>
        </div>
        <div className="scrollbar overflow-y-auto w-full flex justify-center">
          <div
            id="chatbot-messages"
            className="flex flex-col w-full lg:w-3/4 items-center p-4 gap-y-4 "
          >
            {messages?.map((record, index) => {
              return record.role === "user" ? (
                <div
                  key={index}
                  className="shadow-md self-end w-max max-w-3/4 py-2 px-4 rounded-lg border border-white/20"
                >
                  <p className="switzer-500 text-white">{record.message}</p>
                </div>
              ) : (
                <div
                  key={index}
                  className="shadow-md rounded-md border py-2 px-4 w-full lg:max-w-3/4 border-white/20 self-start"
                >
                  <div className="switzer-500 text-white">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                    >
                      {record.message}
                    </ReactMarkdown>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef}></div>
          </div>
        </div>
        <div className="w-full h-[8rem] mt-auto flex flex-col items-center justify-center">
          <div className="input-box flex py-4 items-center justify-center relative ">
            <div className="mr-2 w-12 h-12 flex justify-center items-center rounded-full bg-white/10 cursor-pointer hover:bg-white/20">
              <ImageIcon className="fill-current ml-0.5 text-white w-5 h-5" />
            </div>
            <motion.div
              ref={inputRef}
              onClick={() => {
                if (inputRef.current.innerText.trim() === "") {
                  setIsChatActive((prev) => !prev);
                }
              }}
              onKeyDown={(e) => {
                ask(e);
              }}
              onInput={(e) => {
                const text = e.currentTarget.innerText.trim();
                setShowChatPlaceHolder(text === "");
              }}
              animate={{ width: isChatActive ? "360px" : "320px" }}
              transition={{ duration: 0.3, ease: easeInOut }}
              className="backdrop-blur-md w-[30rem] border border-white/20 h-12 bg-transparent rounded-full focus:outline-none text-white/90 switzer-500 pt-2.5 pl-4 py-2 overflow-y-auto"
              contentEditable
            ></motion.div>

            {showChatPlaceHolder && (
              <motion.span
                animate={{ x: isChatActive ? "-56px" : "-36px" }}
                transition={{ duration: 0.3, ease: easeInOut }}
                className={`absolute switzer-500 
              text-white/90 pointer-events-none`}
              >
                Salam, I am Halalify and you?
              </motion.span>
            )}
            <motion.div
              onClick={() => {
                if (!inputRef.current || !wsRef.current) {
                  return;
                }

                const humanMessage = inputRef?.current.innerText.trim();
                if (humanMessage === "") return;
                setMessages((prev) => {
                  return [
                    ...(prev || []),
                    { role: "user", message: humanMessage },
                  ];
                });
                wsRef.current.send(
                  JSON.stringify({
                    type: "HumanMessage",
                    human_message: humanMessage,
                  })
                );

                inputRef.current.innerText = "";
                setShowChatPlaceHolder(true);
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="ml-2 w-12 h-12 flex justify-center items-center rounded-full bg-white/10 cursor-pointer hover:bg-white/20"
            >
              <SendIcon className="fill-current ml-0.5 text-white w-6 h-6" />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HalalifyChatAgent;
