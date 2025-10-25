import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Music2, Clock, Key, FileMusic } from 'lucide-react';
import { Badge } from './ui/badge';

interface Note {
  note: string;
  duration: number;
  octave: number;
}

interface SheetMusicDisplayProps {
  music: {
    notes: Note[];
    keySignature: string;
    tempo: number;
    timeSignature: string;
  };
}

export default function SheetMusicDisplay({ music }: SheetMusicDisplayProps) {
  const getDurationSymbol = (duration: number) => {
    if (duration >= 1.5) return '𝅝.'; // Dotted half note
    if (duration >= 1) return '𝅝'; // Half note
    if (duration >= 0.75) return '𝅗𝅥.'; // Dotted quarter note
    if (duration >= 0.5) return '𝅗𝅥'; // Quarter note
    return '𝅘𝅥'; // Eighth note
  };

  const getNotePosition = (note: string, octave: number): number => {
    const noteValues: { [key: string]: number } = {
      'C': 0, 'C#': 0, 'D': 1, 'D#': 1, 'E': 2, 'F': 3, 
      'F#': 3, 'G': 4, 'G#': 4, 'A': 5, 'A#': 5, 'B': 6
    };
    return (octave * 7) + noteValues[note];
  };

  return (
    <Card className="border-2 border-[#7FB069]/30 shadow-2xl glass">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 gradient-text">
              <FileMusic className="w-5 h-5 text-[#5EAAA8]" />
              Sheet Music
            </CardTitle>
            <CardDescription className="text-gray-700">Your performance visualized as musical notation</CardDescription>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary" className="gap-1 bg-gradient-to-r from-[#7FB069] to-[#6A9556] text-white border-[#7FB069] hover:from-[#6A9556] hover:to-[#5A8446] transition-colors shadow-lg">
              <Key className="w-3 h-3" />
              {music.keySignature}
            </Badge>
            <Badge variant="secondary" className="gap-1 bg-gradient-to-r from-[#5EAAA8] to-[#4D8F8D] text-white border-[#5EAAA8] hover:from-[#4D8F8D] hover:to-[#3D7F7D] transition-colors shadow-lg">
              <Clock className="w-3 h-3" />
              {music.tempo} BPM
            </Badge>
            <Badge variant="secondary" className="bg-gradient-to-r from-[#F4D06F] to-[#E0BE5C] text-gray-800 border-[#F4D06F] hover:from-[#E0BE5C] hover:to-[#D0AE4C] transition-colors shadow-lg">
              {music.timeSignature}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Staff Lines */}
        <div className="bg-white rounded-lg p-8 border-2 border-[#7FB069]/20 shadow-inner relative overflow-hidden">
          <div className="absolute top-2 right-2 text-[#7FB069]/20 text-4xl">♫</div>
          <div className="relative">
            {/* Treble Clef Symbol */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-6xl text-[#5EAAA8]">
              𝄞
            </div>

            {/* Staff Lines */}
            <div className="ml-16 relative" style={{ height: '200px' }}>
              {[0, 1, 2, 3, 4].map((line) => (
                <div
                  key={line}
                  className="absolute w-full border-t-2 border-[#7FB069]/30"
                  style={{ top: `${line * 40 + 20}px` }}
                />
              ))}

              {/* Notes */}
              <div className="absolute inset-0 flex items-center gap-4 pl-8">
                {music.notes.map((noteData, index) => {
                  const position = getNotePosition(noteData.note, noteData.octave);
                  const staffPosition = 280 - (position * 10); // Position from top
                  const symbol = getDurationSymbol(noteData.duration);
                  
                  return (
                    <div
                      key={index}
                      className="relative flex flex-col items-center group"
                      style={{ top: `${staffPosition - 100}px` }}
                    >
                      <div className="text-5xl text-black leading-none transition-all group-hover:scale-110 group-hover:opacity-70">
                        {symbol}
                      </div>
                      <div className="text-xs text-gray-700 mt-1 font-mono">
                        {noteData.note}{noteData.octave}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Note Legend */}
          <div className="mt-8 pt-6 border-t-2 border-black/10 flex gap-6 justify-center text-sm text-gray-700 flex-wrap">
            <div className="flex items-center gap-2 hover:text-black transition-colors cursor-default">
              <span className="text-2xl text-black">𝅘𝅥</span>
              <span>Eighth</span>
            </div>
            <div className="flex items-center gap-2 hover:text-black transition-colors cursor-default">
              <span className="text-2xl text-black">𝅗𝅥</span>
              <span>Quarter</span>
            </div>
            <div className="flex items-center gap-2 hover:text-black transition-colors cursor-default">
              <span className="text-2xl text-black">𝅗𝅥.</span>
              <span>Dotted Quarter</span>
            </div>
            <div className="flex items-center gap-2 hover:text-black transition-colors cursor-default">
              <span className="text-2xl text-black">𝅝</span>
              <span>Half</span>
            </div>
            <div className="flex items-center gap-2 hover:text-black transition-colors cursor-default">
              <span className="text-2xl text-black">𝅝.</span>
              <span>Dotted Half</span>
            </div>
          </div>
        </div>

        {/* Detected Notes List */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-black/10">
          <h4 className="text-sm text-black mb-3 flex items-center gap-2">
            <Music2 className="w-4 h-4" />
            Detected Notes
          </h4>
          <div className="flex flex-wrap gap-2">
            {music.notes.map((note, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="gap-1 border-black/20 hover:bg-black hover:text-white transition-all"
              >
                {note.note}{note.octave}
                <span className="text-xs opacity-70">({note.duration}s)</span>
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
