// Sound effect utilities for interactive buttons
// Only used for main navigation and primary actions

export const playClickSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (error) {
    // Silently fail if audio context not supported
  }
};

export const playSuccessSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Play a chord: C-E-G
    [523.25, 659.25, 783.99].forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime + index * 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.1 + 0.5);
      
      oscillator.start(audioContext.currentTime + index * 0.1);
      oscillator.stop(audioContext.currentTime + index * 0.1 + 0.5);
    });
  } catch (error) {
    // Silently fail if audio context not supported
  }
};

const chords = [
  [261.63, 329.63, 392.00], // C Major (C-E-G)
  [293.66, 369.99, 440.00], // D Major (D-F#-A)
  [329.63, 415.30, 493.88], // E Major (E-G#-B)
  [349.23, 440.00, 523.25], // F Major (F-A-C)
  [392.00, 493.88, 587.33], // G Major (G-B-D)
  [440.00, 554.37, 659.25], // A Major (A-C#-E)
];

export const playRandomChord = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const chord = chords[Math.floor(Math.random() * chords.length)];
    
    chord.forEach((freq) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.8);
    });
  } catch (error) {
    // Silently fail if audio context not supported
  }
};
