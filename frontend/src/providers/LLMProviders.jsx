import { useState } from "react";
import { LLMContext } from "../contexts/LLMContexts";

const LLMProvider = ({ children }) => {
  const [isLLMConfigOpen, setIsLLMConfigOpen] = useState(false);

  return (
    <LLMContext.Provider value={{ isLLMConfigOpen, setIsLLMConfigOpen }}>
      {children}
    </LLMContext.Provider>
  );
};

export default LLMProvider;
