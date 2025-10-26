import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Mic, Square, Music, Loader2, AlertCircle, Waveform } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import SheetMusicDisplay from './SheetMusicDisplay';
import ChordSuggestions from './ChordSuggestions';
import { playClickSound } from '../utils/soundEffects';
import { motion, AnimatePresence } from 'framer-motion';
import { OpenSheetMusicDisplay } from "opensheetmusicdisplay";

interface AnalyzedMusic {
  notes: Array<{ note: string; duration: number; octave: number }>;
  keySignature: string;
  tempo: number;
  timeSignature: string;
}

export default function RecordingStudio() {
  const [musicXML, setMusicXML] = useState<string | null>(null);
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
    playClickSound();
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
    playClickSound();
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setHasRecorded(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const processRecording = async () => {
  setIsProcessing(true);
  try {
    const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });

    const form = new FormData();
    form.append("audio", blob, "take.webm");
    // optional transpose:
    // form.append("target_key", "G major");

    const res = await fetch("http://127.0.0.1:8000/api/transcribe-and-transpose", {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Backend error");
    }
    const data = await res.json();

    const xml =
      data?.transposed?.musicxml ??
      data?.original?.musicxml ??
      null;

    setMusicXML(xml);

    // Build your existing analyzedMusic from notes/bpm/key
    const analyzeds: AnalyzedMusic = {
      notes: (data.notes || []).map((n: any) => ({
        note: n.note,
        duration: n.duration_q,
        octave: n.octave,
      })),
      keySignature: data.detectedKey || "C Major",
      tempo: data.bpm || 120,
      timeSignature: data.timeSignature || "4/4",
    };
    setAnalyzedMusic(analyzeds);

    // // Build the AnalyzedMusic your UI expects
    // const analyzed: AnalyzedMusic = {
    //   notes: (data.notes || []).map((n: any) => ({
    //     note: n.note,                       // e.g., 'C', 'F#', 'Bb'
    //     duration: n.duration_q,             // quarter lengths: 0.5, 1, 1.5, ...
    //     octave: n.octave
    //   })),
    //   keySignature: data.detectedKey || "C Major",
    //   tempo: data.bpm || 120,
    //   timeSignature: data.timeSignature || "4/4",
    // };

    // setAnalyzedMusic(analyzed);
    setIsProcessing(false);
  } catch (err) {
    console.error(err);
    setIsProcessing(false);
    setPermissionError(err instanceof Error ? err.message : "Processing failed.");
  }
};


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Recording Control */}
      <Card className="border border-white/60 shadow-2xl bg-gradient-to-br from-white/70 to-white/50 backdrop-blur-xl relative overflow-hidden">
        {/* Floating musical symbols with bobbing animation */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <motion.div 
            className="absolute top-10 left-10 text-6xl text-[#1e3a5f]"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            ♪
          </motion.div>
          <motion.div 
            className="absolute top-10 right-10 text-7xl text-[#1e3a5f]"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            ♫
          </motion.div>
          <motion.div 
            className="absolute bottom-10 left-1/4 text-8xl text-[#1e3a5f]"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          >
            𝄞
          </motion.div>
          <motion.div 
            className="absolute bottom-10 right-1/4 text-6xl text-[#1e3a5f]"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            ♬
          </motion.div>
        </div>

        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#4a7ba7]/10 rounded-full blur-3xl" />
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#1e66b8]/10 rounded-full blur-3xl" />
        
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-3 text-[#1e3a5f] text-3xl" style={{ fontWeight: 700 }}>
            <div className="w-12 h-12 bg-gradient-to-br from-[#1e66b8] to-[#2d5a8f] rounded-2xl flex items-center justify-center shadow-xl">
              <Music className="w-6 h-6 text-white" />
            </div>
            Recording Studio
          </CardTitle>
          <CardDescription className="text-[#1e3a5f]/70 text-lg">
            Record any instrumental performance! For better results record in a quiet environment.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8 relative">
          <div className="flex flex-col items-center gap-8 py-12">
            {/* Recording Button */}
            <div className="relative">
              <AnimatePresence mode="wait">
                {isRecording ? (
                  <motion.button
                    key="stop"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    onClick={stopRecording}
                    className="w-40 h-40 rounded-full bg-gradient-to-br from-[#2d5a8f] to-[#4a7ba7] flex items-center justify-center shadow-2xl relative z-10 pulse-glow"
                  >
                    <Square className="w-16 h-16 text-white fill-white" />
                  </motion.button>
                ) : (
                  <motion.button
                    key="mic"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    onClick={startRecording}
                    disabled={isProcessing}
                    className="w-40 h-40 rounded-full bg-gradient-to-br from-[#1e66b8] to-[#2d5a8f] hover:scale-110 flex items-center justify-center shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative z-10"
                  >
                    <Mic className="w-16 h-16 text-white" />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Pulsing rings when recording */}
              {isRecording && (
                <>
                  <motion.div
                    className="absolute inset-0 border-4 border-[#4a7ba7] rounded-full"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.8, 0, 0.8],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 border-4 border-[#1e66b8] rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.6, 0, 0.6],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: 0.5,
                      ease: "easeOut",
                    }}
                  />
                </>
              )}
            </div>

            {/* Waveform visualization when recording */}
            {isRecording && (
              <motion.div 
                className="flex items-center gap-1.5 h-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 bg-[#1e66b8] rounded-full"
                    animate={{
                      height: [20, Math.random() * 60 + 10, 20],
                    }}
                    transition={{
                      duration: 0.5 + Math.random() * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </motion.div>
            )}

            {/* Timer */}
            <AnimatePresence>
              {(isRecording || hasRecorded) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center bg-gradient-to-br from-white/70 to-white/50 backdrop-blur-xl rounded-3xl p-8 border border-white/60 shadow-xl min-w-[200px]"
                >
                  <div className="text-[#1e3a5f] text-6xl tabular-nums tracking-wider" style={{ fontWeight: 700 }}>
                    {formatTime(recordingTime)}
                  </div>
                  <div className="text-sm text-[#1e3a5f]/70 flex items-center gap-2 justify-center mt-3">
                    {isRecording && (
                      <motion.span 
                        className="w-3 h-3 bg-[#1e66b8] rounded-full"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    )}
                    <span className="text-base">{isRecording ? 'Recording...' : 'Recorded'}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Instructions */}
            {!isRecording && !hasRecorded && !isProcessing && !permissionError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-4"
              >
                <p className="text-[#1e3a5f] text-2xl" style={{ fontWeight: 600 }}>Ready to record</p>
                <p className="text-base text-[#1e3a5f]/70">Click the microphone to start recording your performance</p>
                <div className="flex gap-4 justify-center mt-6 text-4xl opacity-30 text-[#1e3a5f]">
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
              </motion.div>
            )}

            {/* Permission Error */}
            {permissionError && !isRecording && (
              <Alert className="border-[#1e66b8]/30 bg-gradient-to-br from-white/70 to-white/50 backdrop-blur-xl max-w-lg">
                <AlertCircle className="w-4 h-4 text-[#1e3a5f]" />
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
            )}

            {/* Processing */}
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-white/70 to-white/50 backdrop-blur-xl rounded-3xl p-8 border border-white/60 shadow-xl"
              >
                <div className="flex items-center gap-4">
                  <Loader2 className="w-6 h-6 animate-spin text-[#1e66b8]" />
                  <div className="text-[#1e3a5f] text-lg">
                    Analyzing your performance...
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {analyzedMusic && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <SheetMusicDisplay music={analyzedMusic} musicXML={musicXML || undefined} />
          <ChordSuggestions notes={analyzedMusic.notes} keySignature={analyzedMusic.keySignature} />
        </motion.div>
      )}
    </div>
  );
}
