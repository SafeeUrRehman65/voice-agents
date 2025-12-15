import SmallButton from "../Buttons/SmallButton";
import { motion } from "motion/react";
import { LLMContext } from "../../contexts/LLMContexts";
import { useContext } from "react";

const LLMKitBox = ({ title, description, buttonText, icon_name }) => {
  const { isLLMConfigOpen, setIsLLMConfigOpen } = useContext(LLMContext);

  return (
    <div className="bg-black w-[36rem] h-max pb-8 border border-white/20 shadow-md rounded-xl flex flex-col gap-y-2 overflow-clip">
      <div className="w-full h-[3rem]  px-4 flex justify-between items-center border-b border-white/10">
        <p className="inter-400 text-white/90">{title}</p>
        <span className="text-white/80 text-md material-symbols-outlined">
          {icon_name}
        </span>
      </div>

      <div className="description px-4">
        <p className="text-white/70 inter-400 leading-6.5">{description}</p>
      </div>
      <div className="px-4 mt-2">
        <motion.div
          onTap={(e) => {
            setIsLLMConfigOpen(true);
          }}
        >
          <SmallButton buttonText={buttonText} />
        </motion.div>
      </div>
    </div>
  );
};
export default LLMKitBox;
