import React from 'react';
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
  // Mock chord suggestions based on the key signature
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
        return 'bg-black text-white border-black hover:bg-red-600 hover:border-red-600';
      case 'secondary':
        return 'bg-white text-black border-2 border-black hover:bg-black hover:text-white';
      case 'passing':
        return 'bg-gray-100 text-black border-2 border-gray-300 hover:border-black';
      default:
        return 'bg-gray-100 text-black border-2 border-gray-300';
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
    <Card className="border-2 border-black/10 shadow-xl bg-white/90 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute bottom-0 left-0 text-9xl text-gray-100 select-none opacity-50">♬</div>
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 text-black">
          <Lightbulb className="w-5 h-5" />
          Chord Suggestions
        </CardTitle>
        <CardDescription className="text-gray-600">
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
                <div className="w-3 h-3 bg-black rounded-full" />
                <h4 className="text-black">Primary Chords</h4>
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
                <div className="w-3 h-3 bg-red-600 rounded-full" />
                <h4 className="text-black">Secondary Chords</h4>
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
                <div className="w-3 h-3 bg-gray-400 rounded-full" />
                <h4 className="text-black">Passing Chords</h4>
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
          <div className="p-4 bg-black text-white border-2 border-black rounded-lg shadow-lg relative overflow-hidden group hover:bg-red-600 transition-all duration-300">
            <div className="absolute top-0 right-0 text-6xl opacity-10">♪</div>
            <h4 className="text-sm mb-2 flex items-center gap-2 relative z-10">
              <Lightbulb className="w-4 h-4" />
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
