import { SystemPromptInputBoxContext } from "../../contexts/LLMContexts";
import {
  animate,
  easeIn,
  easeInOut,
  motion,
  useAnimationFrame,
  useMotionValue,
} from "motion/react";
import { LLMContext } from "../../contexts/LLMContexts";
import {
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import SmallButton from "../Buttons/SmallButton";
import {
  descriptionMap,
  SystemPromptDescriptions,
  SuggestionMap,
} from "../../staticContent/content";

const LLMConfigDialogueBox = () => {
  const [hidePlaceHolder, setHidePlaceHolder] = useState(false);
  const [hideInfoSection, setHideInfoSection] = useState({
    isHidden1: true,
    isHidden2: true,
    top: null,
    bottom: null,
    right: null,
    left: null,
  });
  const [paused, setPaused] = useState(false);
  const [inputHeight, setInputHeight] = useState(null);
  const inputBoxRef = useRef(null);
  const [suggestion, setSuggestion] = useState(null);
  const infoController = new AbortController();
  const [openDesription, setOpenDesription] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(null);
  const { isLLMConfigOpen, setIsLLMConfigOpen } = useContext(LLMContext);

  useEffect(() => {
    if (inputBoxRef.current) {
      inputBoxRef.current.style.height = "auto";
      const newHeight =
        Math.min(inputBoxRef.current.scrollHeight, 128) +
        (hidePlaceHolder ? 16 : 8);
      setInputHeight(`${newHeight}px`);
    }
  }, [systemPrompt]);

  if (!isLLMConfigOpen) return null;

  return (
    <motion.div className="absolute inset-0 backdrop-blur">
      <div className="w-full h-screen sticky top-0 flex items-center justify-center">
        <motion.div
          initial={{ backdropFilter: "blur(0px)", opacity: 0 }}
          animate={{ backdropFilter: "blur(8px)", opacity: [0.5, 1] }}
          exit={{ backdropFilter: "blur(0px)", opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-[90%] h-[80%] bg-[#131313] border border-[#48484847] rounded-xl drop-shadow-md flex flex-col gap-y-3 overflow-clip p-4 relative"
        >
          <div className="flex relative justify-between title-icon-box">
            <p className="inter-400 w-max text-white/90">System Prompt</p>

            <motion.span
              whileHover={{ scale: 0.95 }}
              onMouseEnter={() => {
                setHideInfoSection((prev) => ({
                  ...prev,
                  isHidden1: false,
                  top: 4,
                  right: 0,
                }));
                if (!paused) {
                  setHideInfoSection((prev) => ({
                    ...prev,
                    isHidden1: false,
                  }));
                }
              }}
              onMouseLeave={() => {
                if (paused) {
                  setHideInfoSection((prev) => ({
                    ...prev,
                    isHidden1: false,
                  }));
                } else {
                  setHideInfoSection((prev) => ({
                    ...prev,
                    isHidden1: true,
                    top: null,
                    right: null,
                  }));
                }
              }}
              onClick={() => {
                setPaused((prev) => !prev);
              }}
              style={{
                fontVariationSettings:
                  "'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 30",
              }}
              className="material-symbols-outlined text-white/80  hover:text-white cursor-pointer"
            >
              {paused
                ? "resume"
                : hideInfoSection.isHidden1
                ? "info"
                : "pause_circle"}
            </motion.span>
          </div>
          <div className="input-box relative flex flex-col gap-y-2">
            {!hideInfoSection.isHidden1 && (
              <InfoSection
                top={hideInfoSection.top}
                right={hideInfoSection.right}
                type={"system_prompt"}
              />
            )}

            <motion.div
              layout
              animate={{ height: inputHeight }}
              transition={{ type: "spring" }}
              className="bg-[#070303] inset-ring inset-ring-white/10 px-3 py-2 rounded-md inset-shadow-md shadow-sm relative"
            >
              <div
                ref={inputBoxRef}
                onInput={(e) => {
                  if (e.target.innerText.trim() === "") {
                    e.target.innerHTML = "";

                    // Reset caret position properly
                    const range = document.createRange();
                    range.selectNodeContents(e.target);
                    range.collapse(false);

                    const sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                  }
                  setSystemPrompt(e.target.innerText);
                  setHidePlaceHolder(e.target.innerText.trim() !== "");
                }}
                contentEditable
                className="inter-400 leading-6.5 focus:outline-none text-white/80 text-[0.95rem] caret-white cursor-text scrollbar overflow-y-auto min-h-[2.2rem] max-h-[8rem]"
              ></div>
              <motion.div>
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    fontVariationSettings:
                      "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20",
                  }}
                  className="absolute top-2.5 right-2 cursor-pointer material-symbols-outlined text-white/60 hover:text-white/80"
                >
                  wand_stars
                </motion.span>
              </motion.div>
              {/* <div className="w-full h-2 bg-blue-400"></div> */}
            </motion.div>
            {!hidePlaceHolder && (
              <span className="absolute pointer-events-none top-15.5 px-3 text-[0.95rem] inter-300 text-white/50">
                Instructions your LLM should follow.
              </span>
            )}
          </div>
          <div className="suggestion-box h-max px-3 pt-3 pb-6 w-full bg-black/90 rounded-md">
            <div className="w-full rounded-md flex flex-col gap-y-2">
              <div className="flex gap-x-2 justify-between items-center">
                <p className="text-white/90 inter-400 text-sm">Suggestions</p>
                <span
                  style={{
                    fontVariationSettings:
                      "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20",
                  }}
                  className="material-symbols-outlined text-white/80"
                >
                  lightbulb
                </span>
              </div>
              <div className="overflow-clip relative">
                <SystemPromptInputBoxContext.Provider
                  value={{
                    inputBoxRef,
                    setHidePlaceHolder,
                    setOpenDesription,
                    setSuggestion,
                    setSystemPrompt,
                  }}
                >
                  <PromptChips />
                </SystemPromptInputBoxContext.Provider>
              </div>
              {openDesription && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: 0.3,
                    ease: easeInOut,
                  }}
                  className="flex flex-col mt-2 h-full gap-y-2"
                >
                  <p className="inter-400 text-white/70 text-xs">Description</p>
                  <div className="h-full rounded-md overflow-y-hidden">
                    <p className="text-white/70 leading-4.5 text-xs inter-400">
                      {SystemPromptDescriptions[suggestion]}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
          <div className="self-end ">
            <p className="inter-300 text-white/60 text-xs">
              <strong>Limit:</strong> 400 characters
            </p>
          </div>

          <div className="mt-auto gap-x-2 flex justify-end items-center w-full">
            <div>
              <SmallButton
                bgColor="bg-black"
                textColor="text-white"
                buttonText={"Save Changes"}
              />
            </div>
            <div
              onClick={() => {
                setIsLLMConfigOpen(false);
              }}
            >
              <SmallButton buttonText={"Close"} />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const InfoSection = ({
  type,
  top = null,
  bottom = null,
  right = null,
  left = null,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`absolute z-10 w-full max-h-60 overflow-y-auto bg-black/50 backdrop-blur-sm text-sm rounded-lg right-${right} -top-${top} bottom-${bottom} left-${left} px-4 pt-3 pb-5 leading-5.5 scrollbar-thin border border-white/10`}
    >
      <p className="inter-400 text-white/70">{descriptionMap[type]}</p>
    </motion.div>
  );
};

export default LLMConfigDialogueBox;

const PromptChips = () => {
  const x = useMotionValue(0);
  const [isPaused, setIsPaused] = useState(false);

  useAnimationFrame(() => {
    if (!isPaused) {
      const current = x.get();
      const next = current - 0.5; // speed
      // reset when completely off screen (change 500 based on width)
      x.set(next <= -500 ? 0 : next);
    }
  });

  return (
    <motion.div className="h-max">
      <motion.div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{ x }}
        className="flex w-[200%] gap-x-22 cursor-pointer"
      >
        <motion.div
          whileHover={{
            marginRight: 6,

            transition: { duration: 0.2, ease: easeInOut },
          }}
          className={`flex gap-x-2 w-1/2`}
        >
          <Chip instruction="You are a SQL Assistant" />
          <Chip instruction="You are a Backend Developer" />
          <Chip instruction="You are a Prompt Engineer" />
        </motion.div>
        <motion.div
          whileHover={{
            marginLeft: 4,
            transition: { duration: 0.2, ease: easeInOut },
          }}
          className={`flex gap-x-2 w-1/2`}
        >
          <Chip instruction="You are a SQL Assistant" />
          <Chip instruction="You are a Backend Developer" />
          <Chip instruction="You are a Prompt Engineer" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

const Chip = ({ instruction }) => {
  const {
    inputBoxRef,
    setHidePlaceHolder,
    setOpenDesription,
    setSuggestion,
    setEditableHTML,
    setSystemPrompt,
  } = useContext(SystemPromptInputBoxContext);
  return (
    <motion.div
      onMouseEnter={(e) => {
        const suggestion = SuggestionMap[e.target.innerText];
        setSuggestion(suggestion);
        setOpenDesription(true);
      }}
      onMouseLeave={() => {
        setOpenDesription(false);
      }}
      onClick={(e) => {
        const suggestion = SuggestionMap[e.target.innerText];
        const newHTML = `<p><strong>${e.target.innerText}</strong> <br/>${SystemPromptDescriptions[suggestion]}</p>`;
        inputBoxRef.current.innerHTML = newHTML;
        setSystemPrompt(newHTML);
        setHidePlaceHolder(true);
      }}
      whileHover={{
        scale: 1.05,
        marginLeft: 4,
        marginRight: 4,

        transition: { duration: 0.1, ease: "easeInOut" },
      }}
      whileTap={{
        scale: 0.95,
        boxShadow: [
          "inset 1px 1px 3px rgba(0, 0, 0, 0.2)",
          "inset -1px -1px 3px rgba(255, 255, 255, 0.8)",
        ].join(", "),
        transition: {
          duration: 0.2,
          type: "spring",
          stiffness: 500,
          ease: easeInOut,
        },
      }}
      className="rounded-full px-3 py-2 bg-white hover:shadow-md hover:shadow-black"
    >
      <p className="text-black w-max text-xs poppins-semibold">{instruction}</p>
    </motion.div>
  );
};
