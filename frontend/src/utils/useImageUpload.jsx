import { useRef } from "react";

export const useImageUpload = (setMessages, wsRef) => {
  const fileInputRef = useRef(null);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Image = reader.result;

      setMessages((prev) => [
        ...(prev || []),
        { role: "user", message: "Sent an image", image: base64Image },
      ]);

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "ImageMessage",
            image: base64Image,
            mime_type: file.type,
          })
        );
      }
    };
    reader.readAsDataURL(file);
    
    e.target.value = null; 
  };

  return { fileInputRef, triggerFileInput, handleFileChange };
};