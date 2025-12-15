import { useEffect, useRef } from "react";
import { motion } from "motion/react";

const SmallButton = ({
  buttonText,
  bgColor = "bg-white",
  textColor = "text-black",
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 200, duration: 100 }}
      className={`w-max px-4 h-7 ${bgColor} text-xs rounded-full poppins-semibold text-center cursor-pointer ${textColor}`}
    >
      {buttonText}
    </motion.button>
  );
};

export default SmallButton;
