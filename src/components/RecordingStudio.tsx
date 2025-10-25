import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Mic, Square, Music, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import SheetMusicDisplay from './SheetMusicDisplay';
import ChordSuggestions from './ChordSuggestions';

interface AnalyzedMusic {
  notes: Array<{ note: string; duration: number; octave: number }>;
  keySignature: string;
  tempo: number;
  timeSignature: string;
}

export default function RecordingStudio() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [analyzedMusic, setAnalyzedMusic] = useState<AnalyzedMusic | null>(null);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    setPermissionError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        processRecording();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setAnalyzedMusic(null);
      setHasRecorded(false);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
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
      setHasRecorded(true);
    }
  };

  const processRecording = () => {
    setIsProcessing(true);
    
    // Simulate AI processing with mock data
    setTimeout(() => {
      // Generate mock analyzed music data
      const mockData: AnalyzedMusic = {
        notes: [
          { note: 'E', duration: 0.5, octave: 4 },
          { note: 'F#', duration: 0.5, octave: 4 },
          { note: 'G', duration: 1, octave: 4 },
          { note: 'A', duration: 0.5, octave: 4 },
          { note: 'B', duration: 0.5, octave: 4 },
          { note: 'C', duration: 1, octave: 5 },
          { note: 'B', duration: 0.5, octave: 4 },
          { note: 'A', duration: 1.5, octave: 4 },
        ],
        keySignature: 'G Major',
        tempo: 120,
        timeSignature: '4/4',
      };
      
      setAnalyzedMusic(mockData);
      setIsProcessing(false);
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Recording Control */}
      <Card className="border-2 border-black/10 shadow-xl bg-white/90 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 text-9xl text-gray-100 select-none opacity-50">♪</div>
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2 text-black">
            <Music className="w-5 h-5" />
            Recording Studio
          </CardTitle>
          <CardDescription className="text-gray-600">
            Record your violin performance and instantly see it as sheet music
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 relative">
          <div className="flex flex-col items-center gap-6 py-8">
            {/* Recording Button */}
            <div className="relative">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700 animate-pulse red-glow'
                    : 'bg-black hover:bg-red-600 hover:scale-110'
                } disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl`}
              >
                {isRecording ? (
                  <Square className="w-10 h-10 text-white" />
                ) : (
                  <Mic className="w-10 h-10 text-white" />
                )}
              </button>
              {isRecording && (
                <div className="absolute -inset-2 border-4 border-red-600 rounded-full animate-ping opacity-75" />
              )}
            </div>

            {/* Timer */}
            {(isRecording || hasRecorded) && (
              <div className="text-center">
                <div className="text-black text-2xl tabular-nums tracking-wider">
                  {formatTime(recordingTime)}
                </div>
                <div className="text-sm text-gray-600 flex items-center gap-2 justify-center">
                  {isRecording && <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />}
                  {isRecording ? 'Recording...' : 'Recorded'}
                </div>
              </div>
            )}

            {/* Instructions */}
            {!isRecording && !hasRecorded && !isProcessing && !permissionError && (
              <div className="text-center space-y-2">
                <p className="text-black">Ready to record</p>
                <p className="text-sm text-gray-600">Click the microphone to start recording your performance</p>
                <div className="flex gap-2 justify-center text-2xl text-gray-300 mt-4">
                  <span>♪</span>
                  <span className="text-red-600">♫</span>
                  <span>♬</span>
                </div>
              </div>
            )}

            {/* Permission Error */}
            {permissionError && !isRecording && (
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
            )}

            {/* Processing */}
            {isProcessing && (
              <Alert className="border-black/20 bg-white">
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <AlertDescription className="text-gray-700">
                  Analyzing your performance... This may take a few moments.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {!isRecording && !isProcessing && (
            <div className="flex gap-3 justify-center">
              <Button
                onClick={startRecording}
                className="bg-black hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Mic className="w-4 h-4 mr-2" />
                {hasRecorded ? 'Record Again' : 'Start Recording'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {analyzedMusic && (
        <div className="space-y-6">
          <SheetMusicDisplay music={analyzedMusic} />
          <ChordSuggestions notes={analyzedMusic.notes} keySignature={analyzedMusic.keySignature} />
        </div>
      )}
    </div>
  );
}
