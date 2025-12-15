import { motion } from "motion/react";

const GoBack = () => {
  return (
    <div className="px-4 go-back-box w-full py-5 bg-black/60 backdrop-blur-sm flex gap-x-3 h-max fixed border-b border-black/60">
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="bg-arrow-left bg-cover w-5 h-5 cursor-pointer"
      ></motion.div>

      <motion.span className="inter-400 text-white/80 hover:text-white text-sm cursor-pointer">
        Go back
      </motion.span>
    </div>
  );
};

export default GoBack;
