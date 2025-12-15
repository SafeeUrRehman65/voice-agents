import { useEffect, useRef } from "react";
import { motion } from "motion/react";

const MediumButton = ({ buttonText }) => {
  return (
    <div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="w-max px-5 h-10 bg-white text-sm rounded-full poppins-semibold text-center cursor-pointer"
      >
        {buttonText}
      </motion.button>
    </div>
  );
};

export default MediumButton;
