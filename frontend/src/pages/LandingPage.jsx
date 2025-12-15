import { useScroll } from "motion/react";
import MediumButton from "../components/Buttons/MediumButton";
import { motion } from "motion/react";
import NavBar from "../components/Navbar";

export default function LandingPage() {
  return (
    <motion.div className="w-screen h-screen bg-black">
      <NavBar />
      <div className="hero-section h-[55%]">
        <div className="hero-section-text flex flex-col justify-end items-center gap-y-6 h-full">
          <div className="main-text-box">
            <div>
              <p className="main-text text-center text-5xl tracking-tighter text-white inter-600">
                Build Powerful Voice Agents. <br />
                Quickly. Smoothly.
              </p>
            </div>
          </div>
          <div className="secondary-text-box">
            <div>
              <p className="text-white/60 text-lg poppins-regular tracking-tight text-center">
                Build Amazing - Production-Ready voice agents
                <br />
                with Musa in minutes. Call Tools, bind your
                <br />
                knowledge base and much more!
              </p>
            </div>
          </div>
          <div className="">
            <MediumButton buttonText={"Launch Agent"} />
          </div>
        </div>
      </div>
      <div className="w-screen h-[100vh]"></div>
    </motion.div>
  );
}
