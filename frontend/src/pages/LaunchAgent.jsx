import { Navigate, useNavigate } from "react-router";
import { motion, scale } from "motion/react";
import { descriptionMap } from "../staticContent/content";
import GoBack from "../components/GoBack";
import LLMKitBox from "../components/LLMKit/LLMKitBox";
import LLMConfigDialogueBox from "../components/LLMKit/LLMConfigDialogueBox";

const LaunchAgent = () => {
  const navigate = useNavigate(null);
  return (
    <div className="bg-black h-max px-4">
      <motion.div>
        <GoBack />
      </motion.div>
      <div className="call-to-action-text-box flex flex-col items-center pt-16 gap-y-8">
        <div>
          <p className="text-center text-5xl inter-600 tracking-tighter text-white">
            Launch your First Voice <br />
            Agent <span className="satoshi-500 text-5xl">.</span> Now.
          </p>
        </div>
        {/* <MediumButton buttonText={"Launch Now"} /> */}
        <div className="grid grid-cols-1 xl:grid-cols-2 xl:gap-x-4 gap-y-8 h-max justify-items-center-safe">
          <LLMKitBox
            title={"System"}
            description={descriptionMap.system_prompt}
            buttonText={"Add System Prompt"}
            icon_name={"settings"}
          />
          <LLMKitBox
            title={"Template Variables"}
            description={descriptionMap.template_variables}
            buttonText={"Add Variables"}
            icon_name={"lda"}
          />
          <LLMKitBox
            title={"Template Variables"}
            description={descriptionMap.template_variables}
            buttonText={"Add Variables"}
            icon_name={"lda"}
          />
          <LLMKitBox
            title={"Few Shot Prompts"}
            description={descriptionMap.few_shot_prompts}
            buttonText={"Add few shot prompts"}
            icon_name={"arrow_drop_down"}
          />
          <LLMKitBox
            title={"Knowledge base"}
            description={descriptionMap.knowledge}
            buttonText={"Add knowledge"}
            icon_name={"network_intel_node"}
          />
        </div>
      </div>
    </div>
  );
};

const LaunchAgentPage = () => {
  return (
    <div className="relative">
      <LaunchAgent />
      <LLMConfigDialogueBox />
    </div>
  );
};

export default LaunchAgentPage;
