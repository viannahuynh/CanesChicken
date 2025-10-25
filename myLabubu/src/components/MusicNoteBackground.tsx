import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface MusicNote {
  id: number;
  left: string;
  top: string;
  delay: number;
  duration: number;
  size: number;
  symbol: string;
  rotation: number;
  depth: number;
}

export default function MusicNoteBackground() {
  const [notes, setNotes] = useState<MusicNote[]>([]);

  useEffect(() => {
    const symbols = ['♪', '♫', '♬', '𝄞'];
    const generatedNotes: MusicNote[] = [];

    for (let i = 0; i < 50; i++) {
      generatedNotes.push({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: Math.random() * 10,
        duration: 15 + Math.random() * 15,
        size: 20 + Math.random() * 60,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        rotation: Math.random() * 360,
        depth: Math.random(),
      });
    }

    setNotes(generatedNotes);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {notes.map((note) => {
        const shadowIntensity = note.depth * 20;
        const blur = note.depth * 10;
        
        // Monster theme colors
        const colors = [
          'rgba(127, 176, 105, 0.15)', // green
          'rgba(94, 170, 168, 0.15)',  // blue
          'rgba(224, 122, 95, 0.15)',  // orange
          'rgba(244, 208, 111, 0.15)', // yellow
          'rgba(129, 195, 215, 0.15)', // teal
        ];
        const color = colors[note.id % colors.length];
        
        return (
          <motion.div
            key={note.id}
            className="absolute select-none"
            style={{
              left: note.left,
              top: note.top,
              fontSize: `${note.size}px`,
              color: color,
              filter: `drop-shadow(0 ${shadowIntensity}px ${blur}px rgba(127, 176, 105, ${note.depth * 0.2}))`,
            }}
            initial={{ 
              opacity: 0, 
              scale: 0,
              rotate: note.rotation
            }}
            animate={{
              opacity: [0, 0.12 + note.depth * 0.08, 0.15 + note.depth * 0.1, 0.12 + note.depth * 0.08, 0],
              scale: [0.8, 1, 1.05, 1, 0.8],
              rotate: [note.rotation, note.rotation + 15, note.rotation - 15, note.rotation],
              y: [0, -note.depth * 30, 0],
            }}
            transition={{
              duration: note.duration,
              delay: note.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {note.symbol}
          </motion.div>
        );
      })}
      
      {/* Depth layers with monster-themed gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#7FB069]/[0.02] to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#5EAAA8]/[0.02] via-transparent to-[#E07A5F]/[0.02] pointer-events-none" />
      
      {/* Soft vignette effect */}
      <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(127,176,105,0.05)] pointer-events-none" />
    </div>
  );
}
