import { motion } from 'framer-motion';
import { Mic, Gamepad2 } from 'lucide-react';
import { playClickSound, playRandomChord } from '../utils/soundEffects';
import violinImage from "../assets/violin.png";

interface HomePageProps {
  onNavigate: (tab: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const handleNavigate = (tab: string) => {
    playClickSound();
    onNavigate(tab);
  };

  const handleViolinClick = () => {
    playRandomChord();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#ebe7de]">
      {/* Music Staff Lines Background - Multiple sets for full coverage */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top staff */}
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={`top-${i}`}
            className="absolute w-full h-[2px] bg-[#1e3a5f]/20"
            style={{ top: `${15 + i * 4}%` }}
          />
        ))}
        
        {/* Middle staff */}
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={`middle-${i}`}
            className="absolute w-full h-[2px] bg-[#1e3a5f]/20"
            style={{ top: `${40 + i * 4}%` }}
          />
        ))}
        
        {/* Bottom staff */}
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={`bottom-${i}`}
            className="absolute w-full h-[2px] bg-[#1e3a5f]/20"
            style={{ top: `${65 + i * 4}%` }}
          />
        ))}

        {/* Treble Clef on the left */}
        <motion.div
          className="absolute left-12 text-[#1e3a5f]/30 text-9xl"
          style={{ top: '38%' }}
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          𝄞
        </motion.div>

        {/* Bass Clef on the right */}
        <motion.div
          className="absolute right-12 text-[#1e3a5f]/30 text-9xl"
          style={{ top: '62%' }}
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        >
          𝄢
        </motion.div>

        {/* Additional floating music notes throughout the page - More visible and staying */}
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={`floating-${i}`}
            className="absolute text-[#1e3a5f]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${24 + Math.random() * 48}px`,
              opacity: 0.25 + Math.random() * 0.25,
            }}
            animate={{
              y: [0, -20 - Math.random() * 30, 0],
              rotate: [0, Math.random() * 15 - 7.5, 0],
              opacity: [0.25, 0.45, 0.25],
            }}
            transition={{
              duration: 5 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 3,
            }}
          >
            {['♪', '♫', '♬', '𝄞'][Math.floor(Math.random() * 4)]}
          </motion.div>
        ))}
      </div>

      {/* Navigation Header */}
      <nav className="relative z-30 flex items-center justify-between px-12 py-8">
        <div className="flex items-center gap-0.5">
          <motion.div 
            className="w-12 h-12 flex items-center justify-center perspective-1000"
            animate={{ 
              rotateY: [0, 360],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{ 
              perspective: "1000px",
            }}
          >
            <div 
              className="text-5xl text-[#1e3a5f]"
              style={{
                textShadow: '2px 2px 4px rgba(30, 58, 95, 0.4), -2px -2px 4px rgba(30, 58, 95, 0.2)',
                transform: 'rotateX(15deg)',
              }}
            >
              ♪
            </div>
          </motion.div>
          <span className="text-[#1e3a5f] text-2xl" style={{ fontWeight: 700 }}>Aww Sheet.</span>
        </div>
        <div className="flex items-center gap-8">
          <button
            onClick={() => handleNavigate('studio')}
            className="text-[#1e3a5f] text-lg hover:opacity-70 transition-opacity"
            style={{ fontWeight: 500 }}
          >
            Start Recording
          </button>
          <button
            onClick={() => handleNavigate('game')}
            className="text-[#1e3a5f] text-lg hover:opacity-70 transition-opacity"
            style={{ fontWeight: 500 }}
          >
            Game Mode
          </button>
          <button
            className="px-8 py-3 bg-[#1e66b8] text-white rounded-full hover:bg-[#2d5a8f] transition-all shadow-lg"
            style={{ fontWeight: 600 }}
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-12 pt-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.h1
            className="text-[#1e3a5f] text-7xl mb-6"
            style={{ fontWeight: 700 }}
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Aww Sheet.
          </motion.h1>
          <motion.p
            className="text-[#1e3a5f] text-2xl mb-12"
            style={{ fontWeight: 400 }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Make music from scratch or compete with friends on your favorite songs.<br />
  Either way, every note counts.
          </motion.p>
        </div>

        {/* Centered Violin with Floating Notes - CLICKABLE */}
        <div className="flex justify-center items-center mb-20">
          <motion.button
            onClick={handleViolinClick}
            className="relative cursor-pointer hover:scale-105 transition-transform"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Floating music notes coming from violin - reduced amount */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-[#1e3a5f] pointer-events-none"
                style={{
                  fontSize: `${32 + Math.random() * 24}px`,
                  left: '50%',
                  top: '40%',
                }}
                animate={{
                  x: [0, (Math.random() - 0.5) * 350],
                  y: [0, -160 - Math.random() * 140],
                  opacity: [0, 0.8, 0.5],
                  rotate: [0, Math.random() * 360],
                  scale: [0.3, 1.3, 0.8],
                }}
                transition={{
                  duration: 4 + Math.random() * 2.5,
                  repeat: Infinity,
                  delay: i * 0.35,
                  ease: "easeOut",
                }}
              >
                {['♪', '♫', '♬', '𝄞'][Math.floor(Math.random() * 4)]}
              </motion.div>
            ))}
            
            <img
              src={violinImage}
              alt="Blue Instrument"
              className="w-full h-auto drop-shadow-2xl"
              style={{ maxWidth: '420px' }}
            />
            
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#4a7ba7]/20 to-[#1e66b8]/15 blur-3xl -z-10 scale-125" />
          </motion.button>
        </div>

        {/* Action Buttons */}
        <motion.div
          className="flex justify-center gap-8 mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {/* Record Button */}
          <button
            onClick={() => handleNavigate('studio')}
            className="group relative"
          >
            <div className="bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-xl rounded-[40px] p-8 shadow-2xl border border-white/70 hover:shadow-3xl transition-all hover:scale-105">
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 bg-gradient-to-br from-[#1e66b8] to-[#2d5a8f] rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <Mic className="w-12 h-12 text-white" />
                </div>
                <span className="text-[#1e3a5f] text-xl" style={{ fontWeight: 600 }}>Start Recording</span>
              </div>
            </div>
          </button>

          {/* Game Mode Button */}
          <button
            onClick={() => handleNavigate('game')}
            className="group relative"
          >
            <div className="bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-xl rounded-[40px] p-8 shadow-2xl border border-white/70 hover:shadow-3xl transition-all hover:scale-105">
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 bg-gradient-to-br from-[#2d5a8f] to-[#4a7ba7] rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <Gamepad2 className="w-12 h-12 text-white" />
                </div>
                <span className="text-[#1e3a5f] text-xl" style={{ fontWeight: 600 }}>Game Mode</span>
              </div>
            </div>
          </button>
        </motion.div>

        {/* Features Section - Back to Square Cards */}
        <motion.div
          className="grid grid-cols-3 gap-8 pb-20"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          {/* Feature 1 - Record */}
          <div className="bg-gradient-to-br from-white/70 to-white/50 backdrop-blur-xl rounded-[32px] p-8 shadow-xl border border-white/60 hover:shadow-2xl transition-all hover:scale-105">
            <div className="text-center">
              <motion.div 
                className="text-7xl mb-4 text-[#1e3a5f]"
                animate={{
                  y: [0, -15, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                ♪
              </motion.div>
              <h3 className="text-[#1e3a5f] text-xl mb-3" style={{ fontWeight: 600 }}>Record</h3>
              <p className="text-[#1e3a5f]/70">
                Play any instrument and watch it transform into beautiful sheet music in real-time
              </p>
            </div>
          </div>

          {/* Feature 2 - Analyze */}
          <div className="bg-gradient-to-br from-white/70 to-white/50 backdrop-blur-xl rounded-[32px] p-8 shadow-xl border border-white/60 hover:shadow-2xl transition-all hover:scale-105">
            <div className="text-center">
              <motion.div 
                className="text-7xl mb-4 text-[#1e3a5f]"
                animate={{
                  y: [0, -15, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
              >
                ♫
              </motion.div>
              <h3 className="text-[#1e3a5f] text-xl mb-3" style={{ fontWeight: 600 }}>Analyze</h3>
              <p className="text-[#1e3a5f]/70">
                Get instant feedback on notes, tempo, key signature, and overall performance quality
              </p>
            </div>
          </div>

          {/* Feature 3 - Compete */}
          <div className="bg-gradient-to-br from-white/70 to-white/50 backdrop-blur-xl rounded-[32px] p-8 shadow-xl border border-white/60 hover:shadow-2xl transition-all hover:scale-105">
            <div className="text-center">
              <motion.div 
                className="text-7xl mb-4 text-[#1e3a5f]"
                animate={{
                  y: [0, -15, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2,
                }}
              >
                ♬
              </motion.div>
              <h3 className="text-[#1e3a5f] text-xl mb-3" style={{ fontWeight: 600 }}>Compete</h3>
              <p className="text-[#1e3a5f]/70">
                Challenge friends in battle mode and track your accuracy scores with live leaderboards
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
