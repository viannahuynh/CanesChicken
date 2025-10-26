import React, { useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Music2, Clock, Key, FileMusic } from "lucide-react";
import { Badge } from "./ui/badge";
import { OpenSheetMusicDisplay } from "opensheetmusicdisplay";

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
  musicXML?: string; 
}

export default function SheetMusicDisplay({ music, musicXML }: SheetMusicDisplayProps) {
  const osmdHostRef = useRef<HTMLDivElement | null>(null);
  const osmdRef = useRef<OpenSheetMusicDisplay | null>(null);

  useEffect(() => {
    const renderScore = async () => {
      if (!musicXML || !osmdHostRef.current) return;

      try {
        if (!osmdRef.current) {
          osmdRef.current = new OpenSheetMusicDisplay(osmdHostRef.current, {
            autoResize: true,
            drawTitle: false,
            drawSubtitle: false,
            drawPartNames: false,
            drawMetronomeMarks: true,
          });
        }

        await osmdRef.current.load(musicXML);
        await osmdRef.current.render();
      } catch (err) {
        console.error("Error rendering MusicXML:", err);
      }
    };

    renderScore();
  }, [musicXML]); 

  const getDurationSymbol = (duration: number) => {
    if (duration >= 1.5) return ;
    if (duration >= 1) return;
    if (duration >= 0.75) return;
    if (duration >= 0.5) return ;
    return ;
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
            <CardDescription className="text-gray-700">
              Your performance visualized as musical notation
            </CardDescription>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary" className="gap-1 bg-gradient-to-r from-[#7FB069] to-[#6A9556] text-white border-[#7FB069]">
              <Key className="w-3 h-3" />
              {music.keySignature}
            </Badge>
            <Badge variant="secondary" className="gap-1 bg-gradient-to-r from-[#5EAAA8] to-[#4D8F8D] text-white border-[#5EAAA8]">
              <Clock className="w-3 h-3" />
              {Math.round(music.tempo)} BPM
            </Badge>
            <Badge variant="secondary" className="bg-gradient-to-r from-[#F4D06F] to-[#E0BE5C] text-gray-800 border-[#F4D06F]">
              {music.timeSignature}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {musicXML ? (
          <div
            className="bg-white rounded-lg p-4 border-2 border-[#7FB069]/20 shadow-inner"
            style={{ minHeight: "400px" }}
          >
            <div ref={osmdHostRef} style={{ width: "100%", height: "100%" }} />
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 border-2 border-[#7FB069]/20 text-gray-600">
            No sheet music yet. Record a new performance!
          </div>
        )}

        {/* Detected Notes */}
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
                {note.note}
                {note.octave}
                <span className="text-xs opacity-70">({getDurationSymbol(note.duration)})</span>
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
