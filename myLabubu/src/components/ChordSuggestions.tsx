import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Lightbulb, Music } from 'lucide-react';
import { Badge } from './ui/badge';

interface Note {
  note: string;
  duration: number;
  octave: number;
}

interface ChordSuggestionsProps {
  notes: Note[];
  keySignature: string;
}

interface Chord {
  name: string;
  notes: string[];
  type: 'primary' | 'secondary' | 'passing';
}

export default function ChordSuggestions({ notes, keySignature }: ChordSuggestionsProps) {
  const generateChordSuggestions = (): Chord[] => {
    if (keySignature.includes('G Major') || keySignature.includes('E Minor')) {
      return [
        { name: 'G Major', notes: ['G', 'B', 'D'], type: 'primary' },
        { name: 'D Major', notes: ['D', 'F#', 'A'], type: 'primary' },
        { name: 'Em', notes: ['E', 'G', 'B'], type: 'secondary' },
        { name: 'C Major', notes: ['C', 'E', 'G'], type: 'secondary' },
        { name: 'Am', notes: ['A', 'C', 'E'], type: 'passing' },
        { name: 'Bm', notes: ['B', 'D', 'F#'], type: 'passing' },
      ];
    } else if (keySignature.includes('C Major') || keySignature.includes('A Minor')) {
      return [
        { name: 'C Major', notes: ['C', 'E', 'G'], type: 'primary' },
        { name: 'G Major', notes: ['G', 'B', 'D'], type: 'primary' },
        { name: 'Am', notes: ['A', 'C', 'E'], type: 'secondary' },
        { name: 'F Major', notes: ['F', 'A', 'C'], type: 'secondary' },
        { name: 'Dm', notes: ['D', 'F', 'A'], type: 'passing' },
        { name: 'Em', notes: ['E', 'G', 'B'], type: 'passing' },
      ];
    }
    
    return [
      { name: 'C Major', notes: ['C', 'E', 'G'], type: 'primary' },
      { name: 'G Major', notes: ['G', 'B', 'D'], type: 'primary' },
      { name: 'Am', notes: ['A', 'C', 'E'], type: 'secondary' },
      { name: 'F Major', notes: ['F', 'A', 'C'], type: 'secondary' },
    ];
  };

  const chords = generateChordSuggestions();

  const getChordColor = (type: string) => {
    switch (type) {
      case 'primary':
        return 'bg-gradient-to-br from-[#7FB069] to-[#6A9556] text-white border-[#7FB069] hover:from-[#6A9556] hover:to-[#5A8446] shadow-lg';
      case 'secondary':
        return 'bg-gradient-to-br from-[#5EAAA8] to-[#4D8F8D] text-white border-[#5EAAA8] hover:from-[#4D8F8D] hover:to-[#3D7F7D] shadow-lg';
      case 'passing':
        return 'bg-gradient-to-br from-[#F4D06F] to-[#E0BE5C] text-gray-800 border-[#F4D06F] hover:from-[#E0BE5C] hover:to-[#D0AE4C] shadow-md';
      default:
        return 'bg-gray-100 text-gray-800 border-2 border-gray-300';
    }
  };

  const getChordLabel = (type: string) => {
    switch (type) {
      case 'primary':
        return 'Primary';
      case 'secondary':
        return 'Secondary';
      case 'passing':
        return 'Passing';
      default:
        return '';
    }
  };

  return (
    <Card className="border-2 border-[#7FB069]/30 shadow-2xl glass relative overflow-hidden">
      <div className="absolute bottom-0 left-0 text-9xl opacity-10 select-none">
        <span className="text-[#7FB069]">♬</span>
      </div>
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 gradient-text">
          <Lightbulb className="w-5 h-5 text-[#F4D06F]" />
          Chord Suggestions
        </CardTitle>
        <CardDescription className="text-gray-700">
          AI-recommended chords that complement your melody in {keySignature}
        </CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <div className="space-y-6">
          {/* Chord Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Primary Chords */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#7FB069] rounded-full" />
                <h4 className="text-gray-800">Primary Chords</h4>
              </div>
              <p className="text-sm text-gray-600">
                Main harmonic foundation
              </p>
              <div className="space-y-2">
                {chords
                  .filter((chord) => chord.type === 'primary')
                  .map((chord, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border-2 ${getChordColor(chord.type)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span>{chord.name}</span>
                        <Music className="w-4 h-4" />
                      </div>
                      <div className="flex gap-1">
                        {chord.notes.map((note, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {note}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Secondary Chords */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#5EAAA8] rounded-full" />
                <h4 className="text-gray-800">Secondary Chords</h4>
              </div>
              <p className="text-sm text-gray-600">
                Add color and variation
              </p>
              <div className="space-y-2">
                {chords
                  .filter((chord) => chord.type === 'secondary')
                  .map((chord, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border-2 ${getChordColor(chord.type)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span>{chord.name}</span>
                        <Music className="w-4 h-4" />
                      </div>
                      <div className="flex gap-1">
                        {chord.notes.map((note, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {note}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Passing Chords */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#F4D06F] rounded-full" />
                <h4 className="text-gray-800">Passing Chords</h4>
              </div>
              <p className="text-sm text-gray-600">
                Create smooth transitions
              </p>
              <div className="space-y-2">
                {chords
                  .filter((chord) => chord.type === 'passing')
                  .map((chord, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border-2 ${getChordColor(chord.type)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span>{chord.name}</span>
                        <Music className="w-4 h-4" />
                      </div>
                      <div className="flex gap-1">
                        {chord.notes.map((note, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {note}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="p-6 bg-gradient-to-br from-[#E07A5F] to-[#C86A51] text-white border-2 border-[#E07A5F] rounded-3xl shadow-2xl relative overflow-hidden group hover:from-[#C86A51] hover:to-[#B85A41] transition-all duration-300">
            <div className="absolute top-0 right-0 text-6xl opacity-10">♪</div>
            <h4 className="mb-2 flex items-center gap-2 relative z-10">
              <Lightbulb className="w-5 h-5" />
              Pro Tip
            </h4>
            <p className="text-sm opacity-90 relative z-10">
              Try experimenting with different chord progressions! Start with primary chords for 
              a strong foundation, then add secondary and passing chords to create more interesting harmonies.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
