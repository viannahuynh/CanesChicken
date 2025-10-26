import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Mic, Users, Trophy, RefreshCw, Play, Square, AlertCircle, Shuffle, Search } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import CountdownOverlay from './CountdownOverlay';
import { playClickSound, playSuccessSound } from '../utils/soundEffects';
import { motion } from 'framer-motion';
import { Input } from './ui/input';
import React from 'react';

interface Performance {
  player: string;
  score: number;
  notes: string[];
  accuracy: number;
}

export default function GameMode() {
  const [gameState, setGameState] = useState<'setup' | 'countdown' | 'recording' | 'results'>('setup');
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [targetSong, setTargetSong] = useState<string>('Happy Birthday');
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const chunksRef = useRef<BlobPart[]>([]);

  const lastBlobRef = useRef<Blob | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const songs = [
    'Happy Birthday',
    'Thotiana',
    'Twinkle Twinkle Little Star'
  ];
  const SONG_KEY_MAP: Record<string, string> = {
    'Happy Birthday': 'happy_birthday',
  };
  const randomizeSong = () => {
    playClickSound();
    const randomSong = songs[Math.floor(Math.random() * songs.length)];
    setTargetSong(randomSong);
  };

  const initiateRecording = () => {
    playClickSound();
    setGameState('countdown');
  };

  const startRecording = async () => {
    setPermissionError(null);

    try {
      // ask for mic
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // create MediaRecorder for this stream
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      // reset chunks at the start of each new recording
      chunksRef.current = [];

      // every time MediaRecorder has audio data, push it into chunksRef
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // when user stops (or we auto-stop at 10s)
      mediaRecorder.onstop = async () => {
        // stop the actual mic input tracks
        stream.getTracks().forEach(track => track.stop());

        // build a single Blob from all chunks
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        lastBlobRef.current = blob;

        // now analyze THIS player's performance with backend
        await analyzePerformance(blob);
      };

      // begin recording
      mediaRecorder.start();
      setIsRecording(true);
      setGameState('recording');
      setRecordingTime(0);

      // start countdown to 10s
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 9) {
            stopRecording(); // this will trigger onstop
            return 10;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);

      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setPermissionError('Microphone access was denied. Please enable microphone permissions in your browser settings.');
        } else if (error.name === 'NotFoundError') {
          setPermissionError('No microphone found. Please connect a microphone and try again.');
        } else if (error.name === 'NotReadableError') {
          setPermissionError('Microphone is already in use by another application.');
        } else {
          setPermissionError('Could not access microphone. Please check your browser settings.');
        }
      }

      setGameState('setup');
    }
  };


  const stopRecording = () => {
    playClickSound();
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop(); 
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };


  const analyzePerformance = async (audioBlob: Blob) => {
    try {
      console.log("▶ analyzePerformance called");
      console.log("currentPlayer:", currentPlayer);
      console.log("targetSong:", targetSong);
  
      const formData = new FormData();
  
      const songKey = SONG_KEY_MAP[targetSong] || 'happy_birthday';
      console.log("sending songKey:", songKey);
  
      formData.append('song_key', songKey);
      formData.append('player_audio', audioBlob, `player${currentPlayer}.webm`);
  
      console.log("audioBlob:", {
        type: audioBlob.type,
        size: audioBlob.size
      });
  
      const res = await fetch('http://localhost:8000/analyzeSinglePlayer', {
        method: 'POST',
        body: formData,
      });
  
      console.log("response status:", res.status);
  
      if (!res.ok) {
        const text = await res.text();
        console.error("backend error body:", text);
        throw new Error(`Backend returned status ${res.status}`);
      }
  
      const data = await res.json();
      console.log("backend json:", data);
  
      const performanceResult: Performance = {
        player: `Player ${currentPlayer}`,
        score: data.score,
        notes: data.notes,
        accuracy: Math.round(data.accuracy * 100),
      };
  
      setPerformances(prev => [...prev, performanceResult]);
      playSuccessSound();
  
      if (currentPlayer === 1) {
        setCurrentPlayer(2);
        setGameState('setup');
      } else {
        setGameState('results');
      }
    } catch (err) {
      console.error('Error analyzing performance:', err);
      setPermissionError('Could not analyze audio. Is the backend running on :8000?');
      setGameState('setup');
    }
  };
  


  const resetGame = () => {
    playClickSound();
    setGameState('setup');
    setCurrentPlayer(1);
    setPerformances([]);
    setRecordingTime(0);
    setPermissionError(null);
  };

  const formatTime = (seconds: number) => {
    return `0:${seconds.toString().padStart(2, '0')}`;
  };

  const getWinner = (): Performance | null => {
    if (performances.length !== 2) return null;
    return performances[0].score > performances[1].score ? performances[0] : performances[1];
  };

  return (
    <div className="space-y-6">
      {/* Countdown Overlay */}
      {gameState === 'countdown' && (
        <CountdownOverlay onComplete={startRecording} />
      )}

      {/* Game Header */}
      <Card className="border border-white/60 bg-gradient-to-br from-white/70 to-white/50 backdrop-blur-xl text-[#1e3a5f] shadow-2xl relative overflow-visible z-20">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
        
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#4a7ba7]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#1e66b8]/20 rounded-full blur-3xl" />
        
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-3 text-[#1e3a5f] text-2xl" style={{ fontWeight: 700 }}>
            <div className="bg-[#1e66b8] p-3 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white pulse-glow" />
            </div>
            Battle Mode
          </CardTitle>
          <CardDescription className="text-[#1e3a5f]/80">
            Two players compete to perform the target song with the highest accuracy!
          </CardDescription>
        </CardHeader>
        <CardContent className="relative space-y-4 pb-6 overflow-visible">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <Badge 
                variant="outline" 
                className="gap-2 bg-white/30 backdrop-blur-sm border-[#1e66b8]/30 text-[#1e3a5f] hover:bg-white/40"
              >
                <Users className="w-4 h-4" />
                2 Players
              </Badge>
              <Badge 
                variant="outline" 
                className="bg-white/30 border-[#1e66b8]/60 text-[#1e3a5f] hover:bg-white/40"
              >
                Max 10 seconds per player
              </Badge>
            </div>
            {gameState === 'results' && (
              <button 
                onClick={resetGame} 
                className="flex items-center gap-2 px-4 py-2 bg-white/30 backdrop-blur-sm border border-[#1e66b8]/30 rounded-lg text-[#1e3a5f] hover:bg-white/40 transition-all duration-300 hover:scale-105"
              >
                <RefreshCw className="w-4 h-4" />
                New Game
              </button>
            )}
          </div>

          {/* Target Song Section with Search */}
          <div className="bg-white/40 rounded-xl p-4 border border-white/50 min-h-[160px] relative z-10 overflow-visible">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex-1">
                <p className="text-[#1e3a5f]/70 text-sm mb-1">Target Song</p>
                <p className="text-2xl text-[#1e3a5f]" style={{ fontWeight: 700 }}>{targetSong}</p>
              </div>
              <button
                onClick={randomizeSong}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1e66b8] to-[#2d5a8f] text-white rounded-lg hover:from-[#2d5a8f] hover:to-[#4a7ba7] transition-all shadow-lg hover:scale-105"
              >
                <Shuffle className="w-4 h-4" />
                Random Song
              </button>
            </div>
            
            {/* Search Bar */}
            <div className="relative z-20">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1e3a5f]/50" />
                <Input
                  type="text"
                  placeholder="Search for a song..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(e.target.value.length > 0);
                  }}
                  onFocus={() => setShowSuggestions(searchQuery.length > 0)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="pl-10 bg-white/60 border-white/70 text-[#1e3a5f] placeholder:text-[#1e3a5f]/40"
                />
              </div>
              
              {/* Search Suggestions */}
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-white/70 rounded-lg shadow-2xl overflow-hidden z-[100] max-h-[180px] overflow-y-auto"
                >
                  {songs
                    .filter(song => 
                      song.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .slice(0, 5)
                    .map((song, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setTargetSong(song);
                          setSearchQuery('');
                          setShowSuggestions(false);
                          playClickSound();
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-[#1e66b8]/10 transition-colors text-[#1e3a5f] border-b border-white/30 last:border-b-0"
                      >
                        <div className="flex items-center gap-2">
                          <Search className="w-4 h-4 text-[#1e66b8]" />
                          <span>{song}</span>
                        </div>
                      </button>
                    ))}
                  {songs.filter(song => 
                    song.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length === 0 && (
                    <div className="px-4 py-3 text-[#1e3a5f]/50 text-center">
                      No songs found
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Setup / Recording */}
      {gameState !== 'results' && (
        <Card className="border border-white/60 shadow-xl bg-gradient-to-br from-white/70 to-white/50 backdrop-blur-xl relative overflow-hidden z-10">
          {/* Musical symbol decoration */}
          <div className="absolute bottom-8 right-8 opacity-10 text-9xl text-[#1e3a5f]">
            {currentPlayer === 1 ? '𝄞' : '♫'}
          </div>
          
          <CardHeader className="relative">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-[#1e3a5f] text-2xl" style={{ fontWeight: 700 }}>Player {currentPlayer}'s Turn</CardTitle>
                <CardDescription className="text-[#1e3a5f]/70">
                  {isRecording
                    ? `Recording... ${formatTime(recordingTime)} / 0:10`
                    : 'Ready to perform? Click the microphone to start!'}
                </CardDescription>
              </div>
              <Badge
                variant="secondary"
                className={`text-lg px-6 py-3 ${
                  currentPlayer === 1 
                    ? 'bg-gradient-to-r from-[#1e66b8] to-[#2d5a8f] text-white hover:from-[#2d5a8f] hover:to-[#4a7ba7]' 
                    : 'bg-gradient-to-r from-[#2d5a8f] to-[#4a7ba7] text-white hover:from-[#4a7ba7] hover:to-[#5a8bc0]'
                } transition-all duration-300 shadow-lg hover:scale-105`}
              >
                Player {currentPlayer}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 relative">
            {!isRecording ? (
              <div className="flex flex-col items-center gap-6 py-8">
                {!permissionError && (
                  <>
                    <div className="text-center space-y-4">
                      <p className="text-[#1e3a5f]/70">Get ready to perform</p>
                      <p className="text-3xl text-[#1e3a5f]" style={{ fontWeight: 700 }}>{targetSong}</p>
                      <div className="flex gap-6 justify-center mt-6 text-5xl opacity-30 text-[#1e3a5f]">
                        <motion.span
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          ♪
                        </motion.span>
                        <motion.span
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                        >
                          ♫
                        </motion.span>
                        <motion.span
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                        >
                          ♬
                        </motion.span>
                      </div>
                    </div>

                    <button
                      onClick={initiateRecording}
                      className="w-28 h-28 rounded-full bg-gradient-to-br from-[#1e66b8] to-[#2d5a8f] hover:from-[#2d5a8f] hover:to-[#4a7ba7] hover:scale-110 flex items-center justify-center shadow-2xl transition-all duration-500 pulse-glow relative"
                    >
                      <Mic className="w-12 h-12 text-white" />
                    </button>

                    <button
                      onClick={initiateRecording}
                      className="group relative px-8 py-4 bg-gradient-to-r from-[#1e66b8] to-[#2d5a8f] text-white rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-[#1e66b8]/50"
                    >
                      <span className="relative z-10 flex items-center gap-2 text-lg">
                        <Play className="w-5 h-5" />
                        Start Performance
                      </span>
                    </button>
                  </>
                )}

                {permissionError && (
                  <div className="w-full max-w-lg space-y-4">
                    <Alert className="border-[#1e66b8]/30 bg-[#f0f7ff]">
                      <AlertCircle className="w-4 h-4 text-[#1e66b8]" />
                      <AlertDescription className="text-[#1e3a5f]">
                        <p className="mb-2">{permissionError}</p>
                        <p className="text-sm text-[#1e3a5f]/80">
                          <strong>To enable microphone access:</strong>
                          <br />
                          • Click the camera/microphone icon in your browser's address bar
                          <br />
                          • Select "Allow" for microphone access
                          <br />
                          • Refresh the page if needed
                        </p>
                      </AlertDescription>
                    </Alert>
                    <button
                      onClick={initiateRecording}
                      className="w-full px-8 py-4 bg-gradient-to-r from-[#1e66b8] to-[#2d5a8f] hover:from-[#2d5a8f] hover:to-[#4a7ba7] text-white rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Play className="w-5 h-5" />
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6 py-8">
                <div className="relative">
                  <button
                    onClick={stopRecording}
                    className="w-28 h-28 rounded-full bg-gradient-to-br from-[#2d5a8f] to-[#4a7ba7] hover:from-[#4a7ba7] hover:to-[#5a8bc0] animate-pulse flex items-center justify-center shadow-2xl pulse-glow relative z-10"
                  >
                    <Square className="w-12 h-12 text-white fill-white" />
                  </button>
                  <div className="absolute -inset-2 border-4 border-[#4a7ba7] rounded-full animate-ping opacity-75 pointer-events-none" />
                </div>

                <div className="text-center space-y-4 w-full max-w-md">
                  <div className="text-[#1e3a5f] text-5xl tabular-nums tracking-wider" style={{ fontWeight: 700 }}>
                    {formatTime(recordingTime)} / 0:10
                  </div>
                  <Progress value={(recordingTime / 10) * 100} className="h-3 bg-[#ebe7de]" />
                  <Alert className="border-[#1e66b8]/30 bg-[#f0f7ff] bg-gradient-to-br from-white/70 to-white/50 backdrop-blur-xl">
                    <AlertDescription className="text-center text-[#1e3a5f] text-lg">
                      Recording Player {currentPlayer}'s performance...
                    </AlertDescription>
                  </Alert>
                </div>

                {/* Animated music notes battle */}
                <div className="flex gap-4 text-4xl">
                  {[...Array(5)].map((_, i) => (
                    <motion.span
                      key={i}
                      className="text-[#1e66b8]"
                      animate={{
                        y: [0, -20, 0],
                        opacity: [0.3, 1, 0.3],
                        color: ['#ffffff', '#1e66b8', '#ffffff', '#1e66b8'],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    >
                      {['♪', '♫', '♬'][i % 3]}
                    </motion.span>
                  ))}
                </div>

                <button 
                  onClick={stopRecording} 
                  className="px-8 py-4 bg-gradient-to-r from-[#2d5a8f] to-[#4a7ba7] hover:from-[#1e66b8] hover:to-[#2d5a8f] text-white rounded-xl shadow-lg transition-all duration-300 flex items-center gap-2"
                >
                  <Square className="w-5 h-5 fill-white" />
                  Stop Recording
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {gameState === 'results' && (
        <Card className="border border-white/60 shadow-2xl bg-gradient-to-br from-white/70 to-white/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#1e3a5f]" style={{ fontWeight: 700 }}>
              <Trophy className="w-6 h-6 text-[#1e66b8]" />
              Battle Results
            </CardTitle>
            <CardDescription className="text-[#1e3a5f]/70">
              Here's how both players performed!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {performances.map((perf, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-2xl border-2 ${
                  getWinner()?.player === perf.player
                    ? 'border-[#1e66b8] bg-gradient-to-br from-[#1e66b8]/10 to-[#4a7ba7]/5'
                    : 'border-white/40 bg-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl text-[#1e3a5f]" style={{ fontWeight: 700 }}>
                    {perf.player}
                    {getWinner()?.player === perf.player && (
                      <span className="ml-2 text-2xl">🏆</span>
                    )}
                  </h3>
                  <Badge className="bg-[#1e66b8] text-white text-lg px-4 py-2">
                    {perf.score} pts
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-[#1e3a5f]/70">
                    <span>Accuracy</span>
                    <span style={{ fontWeight: 600 }}>{perf.accuracy}%</span>
                  </div>
                  <Progress value={perf.accuracy} className="h-2" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

