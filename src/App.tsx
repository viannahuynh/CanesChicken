import React from 'react';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Music, Gamepad2, Home } from 'lucide-react';
import RecordingStudio from './components/RecordingStudio';
import GameMode from './components/GameMode';
import HomePage from './components/HomePage';
import MusicNoteBackground from './components/MusicNoteBackground';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Music Note Background */}
      <MusicNoteBackground />
      
      {/* Content */}
      <div className="relative z-10">
        <header className="bg-white/95 backdrop-blur-md border-b border-black/10 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center shadow-lg group hover:bg-red-600 transition-all duration-300">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-black tracking-tight">ViolinAI</h1>
                  <p className="text-sm text-gray-600">Transform your music into sheet notation</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-3xl text-gray-200">
                <span>♪</span>
                <span className="text-red-600">♫</span>
                <span>♬</span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8 bg-white border-2 border-black/10 shadow-lg">
              <TabsTrigger 
                value="home" 
                className="flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white transition-all duration-300"
              >
                <Home className="w-4 h-4" />
                Home
              </TabsTrigger>
              <TabsTrigger 
                value="studio" 
                className="flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white transition-all duration-300"
              >
                <Music className="w-4 h-4" />
                Studio
              </TabsTrigger>
              <TabsTrigger 
                value="game" 
                className="flex items-center gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all duration-300"
              >
                <Gamepad2 className="w-4 h-4" />
                Game Mode
              </TabsTrigger>
            </TabsList>

            <TabsContent value="home">
              <HomePage onNavigate={setActiveTab} />
            </TabsContent>

            <TabsContent value="studio">
              <RecordingStudio />
            </TabsContent>

            <TabsContent value="game">
              <GameMode />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
