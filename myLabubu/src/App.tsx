import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from './components/ui/tabs';
import RecordingStudio from './components/RecordingStudio';
import GameMode from './components/GameMode';
import { Music, Mic, Gamepad2 } from 'lucide-react';
import HomePage from './components/HomePage';
import MusicNoteBackground from './components/MusicNoteBackground';
import { playClickSound } from './utils/soundEffects';
import BandDirectorChat from './components/BandDirectorChat';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  const handleTabChange = (value: string) => {
    playClickSound();
    setActiveTab(value);
  };

  return (
    <div className="min-h-screen bg-[#ebe7de] text-[#1e3a5f] relative overflow-hidden">
      {/* Music Staff Lines Background - Show on all pages */}
      {activeTab !== 'home' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
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

          {/* Floating musical symbols */}
          <div className="absolute top-20 left-10 opacity-10 text-6xl text-[#1e3a5f]">♪</div>
          <div className="absolute top-40 right-20 opacity-10 text-8xl text-[#1e3a5f]">♫</div>
          <div className="absolute bottom-40 left-32 opacity-10 text-7xl text-[#1e3a5f]">𝄞</div>
          <div className="absolute bottom-20 right-40 opacity-10 text-6xl text-[#1e3a5f]">♬</div>
        </div>
      )}
      
      {/* Content Area */}
      <main>
        {activeTab === 'home' && <HomePage onNavigate={setActiveTab} />}
        {activeTab === 'studio' && (
          <div className="container mx-auto px-4 py-8 relative z-10">
            {/* Navigation Bar */}
            <header className="mb-8">
              <div className="bg-white/70 backdrop-blur-xl rounded-full shadow-lg border border-white/80 px-6 py-3 max-w-4xl mx-auto">
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => handleTabChange('home')}
                    className="flex items-center gap-3 px-8 py-4 rounded-full transition-all duration-300 hover:bg-white/50"
                  >
                    <Music className="w-5 h-5" />
                    <span style={{ fontWeight: 600 }}>Home</span>
                  </button>
                  
                  <button
                    onClick={() => handleTabChange('studio')}
                    className="flex items-center gap-3 px-8 py-4 rounded-full transition-all duration-300 bg-[#5883b0] text-white shadow-lg"
                  >
                    <Mic className="w-5 h-5" />
                    <span style={{ fontWeight: 600 }}>Recording Studio</span>
                  </button>
                  
                  <button
                    onClick={() => handleTabChange('game')}
                    className="flex items-center gap-3 px-8 py-4 rounded-full transition-all duration-300 hover:bg-white/50"
                  >
                    <Gamepad2 className="w-5 h-5" />
                    <span style={{ fontWeight: 600 }}>Game Mode</span>
                  </button>
                </div>
              </div>
            </header>
            <RecordingStudio />
          </div>
        )}
        {activeTab === 'game' && (
          <div className="container mx-auto px-4 py-8 relative z-10">
            {/* Navigation Bar */}
            <header className="mb-8">
              <div className="bg-white/70 backdrop-blur-xl rounded-full shadow-lg border border-white/80 px-6 py-3 max-w-4xl mx-auto">
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => handleTabChange('home')}
                    className="flex items-center gap-3 px-8 py-4 rounded-full transition-all duration-300 hover:bg-white/50"
                  >
                    <Music className="w-5 h-5" />
                    <span style={{ fontWeight: 600 }}>Home</span>
                  </button>
                  
                  <button
                    onClick={() => handleTabChange('studio')}
                    className="flex items-center gap-3 px-8 py-4 rounded-full transition-all duration-300 hover:bg-white/50"
                  >
                    <Mic className="w-5 h-5" />
                    <span style={{ fontWeight: 600 }}>Recording Studio</span>
                  </button>
                  
                  <button
                    onClick={() => handleTabChange('game')}
                    className="flex items-center gap-3 px-8 py-4 rounded-full transition-all duration-300 bg-[#5883b0] text-white shadow-lg"
                  >
                    <Gamepad2 className="w-5 h-5" />
                    <span style={{ fontWeight: 600 }}>Game Mode</span>
                  </button>
                </div>
              </div>
            </header>
            <GameMode />
          </div>
        )}
      </main>
      <BandDirectorChat />
    </div>
  );
}
