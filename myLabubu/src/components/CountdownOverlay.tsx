import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CountdownOverlayProps {
  onComplete: () => void;
}

export default function CountdownOverlay({ onComplete }: CountdownOverlayProps) {
  const [count, setCount] = useState<number | string>(3);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const sequence = [3, 2, 1, 'GO!'];
    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex++;
      if (currentIndex < sequence.length) {
        setCount(sequence[currentIndex]);
        // Play sound effect
        playBeep(currentIndex === sequence.length - 1 ? 'go' : 'tick');
      } else {
        setIsVisible(false);
        setTimeout(onComplete, 500);
        clearInterval(interval);
      }
    }, 1000);

    // Play initial sound
    playBeep('tick');

    return () => clearInterval(interval);
  }, [onComplete]);

  const playBeep = (type: 'tick' | 'go') => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'go') {
      oscillator.frequency.value = 880; // A5
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } else {
      oscillator.frequency.value = 440; // A4
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            key={count}
            className="text-white text-center"
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: 180, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <motion.div
              className={`${
                count === 'GO!' ? 'bg-gradient-to-br from-[#1e66b8] to-white bg-clip-text text-transparent' : 'text-white'
              } drop-shadow-2xl relative`}
              animate={{
                textShadow: count === 'GO!' 
                  ? [
                      '0 0 20px rgba(30, 102, 184, 0.5)',
                      '0 0 60px rgba(30, 102, 184, 0.8)',
                      '0 0 20px rgba(30, 102, 184, 0.5)',
                    ]
                  : ['0 0 20px rgba(255, 255, 255, 0.5)'],
              }}
              transition={{ duration: 0.5, repeat: count === 'GO!' ? 2 : 0 }}
              style={{ fontSize: count === 'GO!' ? '8rem' : '12rem', fontWeight: 'bold' }}
            >
              {count}
            </motion.div>
            
            {/* Circular pulse effect */}
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-white"
              initial={{ scale: 0.5, opacity: 1 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 1 }}
            />
            
            {/* Music notes explosion */}
            {count === 'GO!' && (
              <>
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-4xl text-[#1e66b8]"
                    style={{
                      left: '50%',
                      top: '50%',
                    }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{
                      x: Math.cos(i * 45 * Math.PI / 180) * 200,
                      y: Math.sin(i * 45 * Math.PI / 180) * 200,
                      opacity: 0,
                      scale: 2,
                      rotate: 360,
                    }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  >
                    {['♪', '♫'][i % 2]}
                  </motion.div>
                ))}
              </>
            )}
          </motion.div>
          
          {/* Battling Music Notes */}
          {count !== 'GO!' && (
            <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 pointer-events-none" style={{
              opacity: count === 3 ? 1 : count === 2 ? 0.6 : count === 1 ? 0.2 : 0
            }}>
              {/* Left music note - Player 1 (Blue) */}
              <motion.div
                className="absolute left-10 text-9xl text-[#1e66b8]"
                animate={{
                  x: [0, 3, -3, 3, -3, 0, 350, 320, 0],
                  y: [0, -5, 5, -5, 5, 0, 10, -10, 0],
                  rotate: [0, -15, 15, -15, 15, 0, 45, -45, 0],
                  scale: [1, 1.1, 0.9, 1.1, 0.9, 1, 1.2, 0.8, 1],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 1],
                }}
              >
                ♪
              </motion.div>
              
              {/* Right music note - Player 2 (White) */}
              <motion.div
                className="absolute right-10 text-9xl text-white"
                animate={{
                  x: [0, -3, 3, -3, 3, 0, -350, -320, 0],
                  y: [0, 5, -5, 5, -5, 0, -10, 10, 0],
                  rotate: [0, 15, -15, 15, -15, 0, -45, 45, 0],
                  scale: [1, 1.1, 0.9, 1.1, 0.9, 1, 1.2, 0.8, 1],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 1],
                }}
              >
                ♫
              </motion.div>
              
              {/* Impact flash in center */}
              <motion.div
                className="absolute left-1/2 top-0 -translate-x-1/2 text-7xl text-white"
                animate={{
                  scale: [0, 2, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: "easeOut",
                  times: [0, 0.6, 0.8],
                }}
              >
                ✦
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
