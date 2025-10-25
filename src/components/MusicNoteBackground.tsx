import React from 'react';
import { useEffect, useState } from 'react';

interface MusicNote {
  id: number;
  left: string;
  top: string;
  delay: number;
  duration: number;
  size: number;
  symbol: string;
}

export default function MusicNoteBackground() {
  const [notes, setNotes] = useState<MusicNote[]>([]);

  useEffect(() => {
    const symbols = ['♪', '♫', '♬'];
    const generatedNotes: MusicNote[] = [];

    for (let i = 0; i < 30; i++) {
      generatedNotes.push({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: Math.random() * 10,
        duration: 15 + Math.random() * 15,
        size: 20 + Math.random() * 40,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
      });
    }

    setNotes(generatedNotes);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {notes.map((note) => (
        <div
          key={note.id}
          className="absolute text-gray-200 music-note-bg select-none"
          style={{
            left: note.left,
            top: note.top,
            fontSize: `${note.size}px`,
            animationDelay: `${note.delay}s`,
            animationDuration: `${note.duration}s`,
          }}
        >
          {note.symbol}
        </div>
      ))}
    </div>
  );
}
