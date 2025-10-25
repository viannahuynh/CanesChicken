import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function AnimatedTrebleClef() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <div ref={containerRef} className="relative w-64 h-64 mx-auto perspective-1000">
      {/* Main 3D Rotating Treble Clef */}
      <motion.div
        className="relative w-full h-full preserve-3d"
        animate={{ 
          rotateY: [0, 360],
        }}
        transition={{ 
          duration: 10, 
          repeat: Infinity, 
          ease: "linear" 
        }}
      >
        {/* Front face */}
        <div className="absolute inset-0 flex items-center justify-center backface-hidden">
          <motion.div 
            className="text-[200px] leading-none text-black"
            style={{
              filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.3)) drop-shadow(0 10px 20px rgba(0, 0, 0, 0.2))',
            }}
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            𝄞
          </motion.div>
        </div>
        
        {/* Back face */}
        <div className="absolute inset-0 flex items-center justify-center backface-hidden rotate-y-180">
          <motion.div 
            className="text-[200px] leading-none text-gray-900"
            style={{
              filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.3)) drop-shadow(0 10px 20px rgba(0, 0, 0, 0.2))',
            }}
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            𝄞
          </motion.div>
        </div>
      </motion.div>
      
      {/* Expanding Notes - Inner Ring */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`inner-${i}`}
          className="absolute text-4xl select-none text-gray-800"
          style={{
            left: '50%',
            top: '50%',
            marginLeft: '-20px',
            marginTop: '-20px',
          }}
          animate={{
            x: Math.cos(i * 45 * Math.PI / 180) * 100,
            y: Math.sin(i * 45 * Math.PI / 180) * 100,
            opacity: [0, 0.4, 0],
            scale: [0, 1.2, 0],
            rotate: [0, 180],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeOut",
          }}
        >
          {['♪', '♫', '♬'][i % 3]}
        </motion.div>
      ))}
      
      {/* Expanding Notes - Outer Ring */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`outer-${i}`}
          className="absolute text-3xl select-none text-gray-600"
          style={{
            left: '50%',
            top: '50%',
            marginLeft: '-15px',
            marginTop: '-15px',
          }}
          animate={{
            x: Math.cos(i * 30 * Math.PI / 180) * 150,
            y: Math.sin(i * 30 * Math.PI / 180) * 150,
            opacity: [0, 0.3, 0],
            scale: [0, 1, 0],
            rotate: [0, -180],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            delay: i * 0.25,
            ease: "easeOut",
          }}
        >
          {['♪', '♫', '♬', '𝄞'][i % 4]}
        </motion.div>
      ))}
      
      {/* Floating notes around */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`float-${i}`}
          className="absolute text-2xl select-none text-gray-500"
          style={{
            left: `${20 + (i % 3) * 30}%`,
            top: `${20 + Math.floor(i / 3) * 60}%`,
          }}
          animate={{
            y: [-10, 10, -10],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut",
          }}
        >
          {['♪', '♫', '♬'][i % 3]}
        </motion.div>
      ))}
      
      {/* Subtle glow underneath */}
      <div className="absolute inset-0 -z-10 blur-3xl opacity-20 bg-gradient-to-br from-black via-gray-500 to-black animate-pulse" />
    </div>
  );
}
