import { easeInOut, motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import SendIcon from "../../src/assets/icons/send_icon.svg?react";
import ImageIcon from "../../src/assets/icons/image_icon.svg?react";
import CameraIcon from "../../src/assets/icons/camera_icon.svg?react";
import GalleryIcon from "../../src/assets/icons/attach_icon.svg?react";

// Custom Markdown Styling
const markdownComponents = {
  p: ({ node, ...props }) => <p className="mb-2 leading-relaxed text-white/90" {...props} />,
  h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-white mb-3 mt-4" {...props} />,
  h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-white mb-2 mt-3" {...props} />,
  h3: ({ node, ...props }) => <h3 className="text-lg font-bold text-white mb-2 mt-2" {...props} />,
  ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 space-y-1 text-white/90" {...props} />,
  ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 space-y-1 text-white/90" {...props} />,
  li: ({ node, ...props }) => <li className="ml-2" {...props} />,
  strong: ({ node, ...props }) => <strong className="font-bold text-purple-300" {...props} />, // Highlight keywords
  a: ({ node, ...props }) => <a className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
  blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-purple-500 pl-4 italic my-4 text-white/80" {...props} />,
};

function HalalifyChatAgent() {
  const [isChatActive, setIsChatActive] = useState(false);
  const [showChatPlaceHolder, setShowChatPlaceHolder] = useState(true);
  const [messages, setMessages] = useState([]);
  
  const [showImageMenu, setShowImageMenu] = useState(false);
  
  const [pendingImage, setPendingImage] = useState(null);

  const inputRef = useRef();
  const messagesEndRef = useRef();
  const wsRef = useRef();

  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, pendingImage]); 

  useEffect(() => {
    fetch("http://localhost:3000/start-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }).then(() => {
      const webSocket = new WebSocket("ws://localhost:9000");
      wsRef.current = webSocket;

      wsRef.current.onopen = () => console.log("Connected to Backend!");

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "AIMessage") {
          const message = data.AIMessage;
          setMessages((prev) => {
            if (prev.length === 0) return prev;
            const lastMessage = prev[prev.length - 1];
            
            if (lastMessage.role === "assistant") {
              const updated = [...prev];
              updated[prev.length - 1] = {
                ...lastMessage,
                message: lastMessage.message + message,
              };
              return updated;
            } else {
              return [...prev, { role: "assistant", message: message }];
            }
          });
        }
      };
    });
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target) && !e.target.closest('.image-menu-container')) {
        setIsChatActive(false);
      }
      if (showImageMenu && !e.target.closest('.image-menu-container')) {
        setShowImageMenu(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [showImageMenu]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPendingImage(reader.result); 
      setShowImageMenu(false);        
      setIsChatActive(true);          
      if (inputRef.current) inputRef.current.focus();
    };
    reader.readAsDataURL(file);
    e.target.value = null; 
  };

  const removePendingImage = () => {
    setPendingImage(null);
  };

  const ask = (e) => {
    if (e.key !== "Enter" || e.shiftKey) return;
    e.preventDefault();
    if (!wsRef.current) return;

    const text = inputRef.current?.innerText.trim();

    if (!text && !pendingImage) return;

    // Handle Image + Text Message
    if (pendingImage) {
        setMessages(prev => [...prev, { 
            role: "user", 
            message: text || "Analyze this image", 
            image: pendingImage 
        }]);

        wsRef.current.send(JSON.stringify({
            type: "ImageMessage",
            image: pendingImage,
            prompt: text 
        }));
        
        setPendingImage(null); // Clear draft
    } 
    // Handle Text Only Message
    else {
        setMessages(prev => [...prev, { role: "user", message: text }]);
        wsRef.current.send(JSON.stringify({ 
            type: "HumanMessage", 
            human_message: text 
        }));
    }

    // Reset Input Bar
    if (inputRef.current) inputRef.current.innerText = "";
    setShowChatPlaceHolder(true);
  };

  return (
    <div className="h-screen w-screen bg-black flex flex-col">
      <div className="title-box pt-4">
        <p className="text-center tracking-tighter switzer-500 text-5xl text-white">Halalify</p>
      </div>

      <div className="scrollbar overflow-y-auto w-full flex justify-center flex-1">
        <div id="chatbot-messages" className="flex flex-col w-full lg:w-3/4 items-center p-4 gap-y-4 pb-32">
          {messages?.map((record, index) => (
            <div
              key={index}
              className={`shadow-md py-3 px-5 rounded-xl border border-white/10 max-w-[85%] ${
                record.role === "user" 
                  ? "self-end bg-white/10 rounded-tr-none" 
                  : "self-start bg-[#111] rounded-tl-none w-full lg:max-w-3/4"
              }`}
            >
              {/* Render Image if User Sent One */}
              {record.image && (
                <div className="mb-3">
                  <img src={record.image} alt="User upload" className="max-w-[250px] max-h-[300px] rounded-lg border border-white/10 object-cover" />
                </div>
              )}

              <div className="switzer-500 text-white text-[15px]">
                <ReactMarkdown 
                    remarkPlugins={[remarkGfm]} 
                    rehypePlugins={[rehypeRaw]}
                    components={markdownComponents} 
                >
                  {record.message}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef}></div>
        </div>
      </div>

      <div className="w-full mt-auto flex flex-col items-center justify-center pb-6 bg-gradient-to-t from-black via-black to-transparent">
        
        <AnimatePresence>
            {pendingImage && (
                <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative mb-2 bg-[#1a1a1a] p-2 rounded-xl border border-white/20"
                >
                    <img src={pendingImage} alt="Preview" className="h-24 rounded-lg object-cover" />
                    <button 
                        onClick={removePendingImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 shadow-md"
                    >
                        ✕
                    </button>
                </motion.div>
            )}
        </AnimatePresence>

        <div className="input-box flex py-2 items-end justify-center relative image-menu-container">
          
          <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageSelect} />

          <AnimatePresence>
            {showImageMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-16 left-0 bg-[#1a1a1a] border border-white/20 rounded-xl p-2 flex flex-col gap-1 z-50 shadow-2xl min-w-[160px]"
              >
                <button onClick={() => galleryInputRef.current?.click()} className="flex items-center gap-3 px-4 py-2 hover:bg-white/10 rounded-lg text-white switzer-500 text-sm text-left transition-colors">
                  <GalleryIcon className="w-4 h-4 fill-white" /> Upload from Gallery
                </button>
                <button onClick={() => cameraInputRef.current?.click()} className="flex items-center gap-3 px-4 py-2 hover:bg-white/10 rounded-lg text-white switzer-500 text-sm text-left transition-colors">
                  <CameraIcon className="w-6 h-6 fill-white" /> Camera
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Image Icon Trigger */}
          <div 
            onClick={() => setShowImageMenu(!showImageMenu)}
            className="mr-2 w-12 h-12 mb-0.5 flex justify-center items-center rounded-full bg-white/10 cursor-pointer hover:bg-white/20 transition-colors"
          >
            <ImageIcon className={`fill-current ml-0.5 text-white w-5 h-5 transition-transform ${showImageMenu ? 'rotate-45' : ''}`} />
          </div>

          {/* Text Input */}
          <motion.div
            ref={inputRef}
            onClick={() => { if (!inputRef.current.innerText.trim()) setIsChatActive(true); }}
            onKeyDown={ask}
            onInput={(e) => setShowChatPlaceHolder(e.currentTarget.innerText.trim() === "")}
            animate={{ width: isChatActive || pendingImage ? "360px" : "320px", height: "auto" }} 
            className="backdrop-blur-md min-h-[3rem] max-h-[8rem] border border-white/20 bg-transparent rounded-[24px] focus:outline-none text-white/90 switzer-500 px-4 py-3 overflow-y-auto"
            contentEditable
          ></motion.div>

          {showChatPlaceHolder && !pendingImage && (
            <motion.span
              animate={{ x: isChatActive ? "-56px" : "-36px" }}
              className="absolute bottom-4 switzer-500 text-white/50 pointer-events-none"
            >
              Salam, I am Halalify and you?
            </motion.span>
          )}

          <motion.div
            onClick={(e) => ask({ key: "Enter", preventDefault: () => {} })}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="ml-2 w-12 h-12 mb-0.5 flex justify-center items-center rounded-full bg-white/10 cursor-pointer hover:bg-white/20"
          >
            <SendIcon className="fill-current ml-0.5 text-white w-6 h-6" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default HalalifyChatAgent;