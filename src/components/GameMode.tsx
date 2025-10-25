import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Mic, Users, Trophy, RefreshCw, Play, Square, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface Performance {
  player: string;
  score: number;
  notes: string[];
  accuracy: number;
}

export default function GameMode() {
  const [gameState, setGameState] = useState<'setup' | 'recording' | 'results'>('setup');
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [targetSong, setTargetSong] = useState<string>('Twinkle Twinkle Little Star');
  const [permissionError, setPermissionError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const songs = [
    'Twinkle Twinkle Little Star',
    'Mary Had a Little Lamb',
    'Happy Birthday',
    'Ode to Joy',
    'Jingle Bells',
  ];

  const startRecording = async () => {
    setPermissionError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = () => {
        // Audio processing would happen here
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        analyzePerformance();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setGameState('recording');

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 10) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setPermissionError('Microphone access was denied. Please enable microphone permissions in your browser settings and try again.');
        } else if (error.name === 'NotFoundError') {
          setPermissionError('No microphone found. Please connect a microphone and try again.');
        } else if (error.name === 'NotReadableError') {
          setPermissionError('Microphone is already in use by another application. Please close other apps using the microphone and try again.');
        } else {
          setPermissionError('Could not access microphone. Please check your browser settings and try again.');
        }
      } else {
        setPermissionError('Could not access microphone. Please check your browser settings and try again.');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const analyzePerformance = () => {
    // Simulate AI analysis with mock data
    setTimeout(() => {
      const mockNotes = ['C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'G4', 'F4'];
      const mockScore = Math.floor(Math.random() * 30) + 70; // Score between 70-100
      const mockAccuracy = mockScore;

      const newPerformance: Performance = {
        player: `Player ${currentPlayer}`,
        score: mockScore,
        notes: mockNotes,
        accuracy: mockAccuracy,
      };

      setPerformances(prev => [...prev, newPerformance]);

      if (currentPlayer === 1) {
        setCurrentPlayer(2);
        setGameState('setup');
      } else {
        setGameState('results');
      }
    }, 1500);
  };

  const resetGame = () => {
    setGameState('setup');
    setCurrentPlayer(1);
    setPerformances([]);
    setRecordingTime(0);
    setPermissionError(null);
  };

  const formatTime = (seconds: number) => {
    return `0:${seconds.toString().padStart(2, '0')}`;
  };

  const getWinner = () => {
    if (performances.length !== 2) return null;
    return performances[0].score > performances[1].score ? performances[0] : performances[1];
  };

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <Card className="border-2 border-black/10 bg-black text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 text-9xl text-white/5 select-none">🏆</div>
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2 text-white">
            <Trophy className="w-5 h-5 text-red-600" />
            Competitive Game Mode
          </CardTitle>
          <CardDescription className="text-gray-300">
            Two players compete to perform "{targetSong}" with the highest accuracy
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <Badge variant="outline" className="gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20">
                <Users className="w-4 h-4" />
                2 Players
              </Badge>
              <Badge variant="outline" className="bg-red-600/20 border-red-600/50 text-red-300 hover:bg-red-600/30">
                Max 10 seconds per player
              </Badge>
            </div>
            {gameState === 'results' && (
              <Button onClick={resetGame} variant="outline" className="gap-2 bg-white text-black hover:bg-red-600 hover:text-white border-white">
                <RefreshCw className="w-4 h-4" />
                New Game
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Setup / Recording */}
      {gameState !== 'results' && (
        <Card className="border-2 border-black/10 shadow-xl bg-white/90 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute bottom-0 right-0 text-9xl text-gray-100 select-none opacity-30">
            {currentPlayer === 1 ? '♪' : '♫'}
          </div>
          <CardHeader className="relative">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-black">Player {currentPlayer}'s Turn</CardTitle>
                <CardDescription className="text-gray-600">
                  {isRecording
                    ? `Recording... ${formatTime(recordingTime)} / 0:10`
                    : 'Ready to perform? Click the microphone to start!'}
                </CardDescription>
              </div>
              <Badge
                variant="secondary"
                className={`text-lg px-4 py-2 ${
                  currentPlayer === 1 
                    ? 'bg-black text-white hover:bg-red-600' 
                    : 'bg-red-600 text-white hover:bg-black'
                } transition-all duration-300 shadow-lg`}
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
                    <div className="text-center space-y-2">
                      <p className="text-black">Target Song</p>
                      <p className="text-2xl text-red-600">{targetSong}</p>
                      <div className="flex gap-2 justify-center text-3xl text-gray-300 mt-2">
                        <span>♪</span>
                        <span className="text-red-600">♫</span>
                        <span>♬</span>
                      </div>
                    </div>

                    <button
                      onClick={startRecording}
                      className="w-24 h-24 rounded-full bg-black hover:bg-red-600 hover:scale-110 flex items-center justify-center shadow-2xl transition-all duration-300"
                    >
                      <Mic className="w-10 h-10 text-white" />
                    </button>

                    <Button
                      onClick={startRecording}
                      size="lg"
                      className="bg-black hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Performance
                    </Button>
                  </>
                )}

                {/* Permission Error */}
                {permissionError && (
                  <div className="w-full max-w-lg space-y-4">
                    <Alert className="border-red-600/30 bg-red-50">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <AlertDescription className="text-red-900">
                        <p className="mb-2">{permissionError}</p>
                        <p className="text-sm text-red-800">
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
                    <Button
                      onClick={startRecording}
                      size="lg"
                      className="w-full bg-black hover:bg-red-600 text-white shadow-lg"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6 py-8">
                <div className="relative">
                  <button
                    onClick={stopRecording}
                    className="w-24 h-24 rounded-full bg-red-600 hover:bg-red-700 animate-pulse flex items-center justify-center shadow-2xl red-glow"
                  >
                    <Square className="w-10 h-10 text-white" />
                  </button>
                  <div className="absolute -inset-2 border-4 border-red-600 rounded-full animate-ping opacity-75" />
                </div>

                <div className="text-center space-y-4 w-full max-w-md">
                  <div className="text-black text-3xl tabular-nums tracking-wider">
                    {formatTime(recordingTime)} / 0:10
                  </div>
                  <Progress value={(recordingTime / 10) * 100} className="h-2 bg-gray-200" />
                  <Alert className="border-red-600/30 bg-red-50">
                    <AlertDescription className="text-center text-black">
                      Recording Player {currentPlayer}'s performance...
                    </AlertDescription>
                  </Alert>
                </div>

                <Button onClick={stopRecording} variant="destructive" size="lg" className="bg-red-600 hover:bg-black shadow-lg">
                  <Square className="w-4 h-4 mr-2" />
                  Stop Recording
                </Button>
              </div>
            )}

            {/* Previous Performance */}
            {performances.length > 0 && currentPlayer === 2 && (
              <div className="mt-6 p-4 bg-black text-white rounded-lg border-2 border-black shadow-lg">
                <h4 className="text-sm mb-2">
                  Player 1's Score: {performances[0].score}%
                </h4>
                <Progress value={performances[0].score} className="h-2 bg-white/20" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {gameState === 'results' && performances.length === 2 && (
        <div className="space-y-6">
          {/* Winner Announcement */}
          <Card className="border-2 border-red-600 bg-black text-white shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/30 via-transparent to-transparent" />
            <div className="absolute top-0 right-0 text-9xl opacity-10 select-none">🎉</div>
            <CardContent className="py-8 relative">
              <div className="text-center space-y-4">
                <Trophy className="w-16 h-16 text-red-600 mx-auto drop-shadow-lg" />
                <div>
                  <h2 className="text-white">
                    {getWinner()?.player} Wins!
                  </h2>
                  <p className="text-gray-300">
                    With an accuracy score of {getWinner()?.score}%
                  </p>
                  <div className="flex gap-2 justify-center text-3xl text-white/30 mt-4">
                    <span>♪</span>
                    <span className="text-red-600">♫</span>
                    <span>♬</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score Comparison */}
          <div className="grid md:grid-cols-2 gap-6">
            {performances.map((performance, index) => (
              <Card
                key={index}
                className={`border-2 shadow-xl transition-all duration-300 ${
                  performance === getWinner()
                    ? 'border-red-600 bg-black text-white'
                    : 'border-black/10 bg-white'
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className={`flex items-center gap-2 ${
                      performance === getWinner() ? 'text-white' : 'text-black'
                    }`}>
                      {performance.player}
                      {performance === getWinner() && (
                        <Trophy className="w-5 h-5 text-red-600" />
                      )}
                    </CardTitle>
                    <Badge
                      variant={performance === getWinner() ? 'default' : 'secondary'}
                      className={`text-lg px-3 py-1 ${
                        performance === getWinner() 
                          ? 'bg-red-600 text-white hover:bg-red-700' 
                          : 'bg-gray-100 text-black hover:bg-black hover:text-white border-2 border-black/10'
                      }`}
                    >
                      {performance.score}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className={performance === getWinner() ? 'text-gray-300' : 'text-gray-600'}>
                        Accuracy
                      </span>
                      <span className={performance === getWinner() ? 'text-white' : 'text-black'}>
                        {performance.accuracy}%
                      </span>
                    </div>
                    <Progress value={performance.accuracy} className="h-3" />
                  </div>

                  <div>
                    <p className={`text-sm mb-2 ${performance === getWinner() ? 'text-gray-300' : 'text-gray-600'}`}>
                      Notes Played
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {performance.notes.map((note, i) => (
                        <Badge 
                          key={i} 
                          variant="outline" 
                          className={`text-xs ${
                            performance === getWinner()
                              ? 'border-white/30 bg-white/10 text-white'
                              : 'border-black/20 hover:bg-black hover:text-white'
                          }`}
                        >
                          {note}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Button
              onClick={resetGame}
              size="lg"
              className="bg-black hover:bg-red-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Play Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
