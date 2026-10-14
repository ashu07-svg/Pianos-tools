import React, { useState } from 'react';
import { NoteName, noteToSemitone, semitoneToNote } from '../utils/musicTheory';
import { soundEngine, InstrumentType } from '../utils/audioSynth';
import { Volume2, Play, RefreshCw, Eye } from 'lucide-react';

interface PianoVisualizerProps {
  rootNote: NoteName;
  activeNotes: { note: NoteName; degree: string; interval: number }[];
  mode: 'scale' | 'chord';
  title?: string;
  instrument: InstrumentType;
  onNoteClick?: (note: NoteName, octave: number) => void;
}

export const PianoVisualizer: React.FC<PianoVisualizerProps> = ({
  rootNote,
  activeNotes,
  mode,
  title,
  instrument,
  onNoteClick,
}) => {
  const [octaveCount, setOctaveCount] = useState<number>(3); // 2, 3, or 4 octaves
  const [startOctave, setStartOctave] = useState<number>(3); // starting at C3
  const [labelMode, setLabelMode] = useState<'degree' | 'name' | 'interval'>('degree');
  const [isPlayingArpeggio, setIsPlayingArpeggio] = useState(false);
  const [activePlaybackNote, setActivePlaybackNote] = useState<string | null>(null);

  // Map of active notes by note name for quick lookup
  const activeNoteMap = new Map<string, { degree: string; interval: number }>();
  activeNotes.forEach((item) => {
    activeNoteMap.set(item.note, { degree: item.degree, interval: item.interval });
    // Also store semitone for enharmonic match
    const semi = noteToSemitone(item.note);
    activeNoteMap.set(semitoneToNote(semi, false), { degree: item.degree, interval: item.interval });
    activeNoteMap.set(semitoneToNote(semi, true), { degree: item.degree, interval: item.interval });
  });

  const whiteNoteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const blackKeysByWhiteIndex: { [key: number]: { note: string; offsetLeftPercent: number } } = {
    0: { note: 'C#', offsetLeftPercent: 64 }, // C# between C and D
    1: { note: 'D#', offsetLeftPercent: 66 }, // D# between D and E
    3: { note: 'F#', offsetLeftPercent: 62 }, // F# between F and G
    4: { note: 'G#', offsetLeftPercent: 64 }, // G# between G and A
    5: { note: 'A#', offsetLeftPercent: 66 }, // A# between A and B
  };

  const handlePlayKey = (note: string, octave: number) => {
    soundEngine.playNote(note, octave, 1.2, instrument, 0.85);
    setActivePlaybackNote(`${note}${octave}`);
    setTimeout(() => setActivePlaybackNote(null), 300);
    if (onNoteClick) onNoteClick(note as NoteName, octave);
  };

  const playChordAll = () => {
    const chordNotesToPlay = activeNotes.map((an, i) => {
      // spread across 1-2 octaves
      const oct = startOctave + Math.floor(an.interval / 12);
      return { note: an.note, octave: oct };
    });
    soundEngine.playChord(chordNotesToPlay, instrument, 40);
  };

  const playScaleSequence = () => {
    if (isPlayingArpeggio) return;
    setIsPlayingArpeggio(true);

    // Build ascending scale
    const notesSequence = activeNotes.map((an) => {
      const oct = startOctave + Math.floor(an.interval / 12);
      return { note: an.note, octave: oct };
    });

    // Add root octave on top
    const topRootOctave = startOctave + 1;
    notesSequence.push({ note: rootNote, octave: topRootOctave });

    soundEngine.playScaleArpeggio(
      notesSequence,
      instrument,
      130,
      (playedNote, idx) => {
        const item = notesSequence[idx];
        setActivePlaybackNote(`${item.note}${item.octave}`);
        if (idx === notesSequence.length - 1) {
          setTimeout(() => {
            setActivePlaybackNote(null);
            setIsPlayingArpeggio(false);
          }, 400);
        }
      }
    );
  };

  const getDegreeBadgeColor = (degree: string, isRoot: boolean) => {
    if (isRoot) return 'bg-rose-500 text-white shadow-rose-500/50';
    if (degree.includes('3')) return 'bg-emerald-500 text-white shadow-emerald-500/50';
    if (degree.includes('5')) return 'bg-sky-500 text-white shadow-sky-500/50';
    if (degree.includes('7')) return 'bg-purple-500 text-white shadow-purple-500/50';
    if (degree.includes('9') || degree.includes('2')) return 'bg-amber-500 text-black shadow-amber-500/50';
    if (degree.includes('11') || degree.includes('4')) return 'bg-teal-500 text-white shadow-teal-500/50';
    if (degree.includes('13') || degree.includes('6')) return 'bg-indigo-500 text-white shadow-indigo-500/50';
    return 'bg-blue-600 text-white';
  };

  // Generate octaves array
  const octaves = Array.from({ length: octaveCount }, (_, i) => startOctave + i);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
            <h3 className="font-semibold text-slate-100 text-base md:text-lg">
              {title || `Interactive Piano Keyboard (${mode === 'scale' ? 'Scale' : 'Chord'} View)`}
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Click keys to play. Active notes are highlighted with harmonic degrees.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Label selector */}
          <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700/60 text-xs text-slate-300">
            <button
              onClick={() => setLabelMode('degree')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                labelMode === 'degree' ? 'bg-indigo-600 text-white' : 'hover:text-white'
              }`}
            >
              Degree
            </button>
            <button
              onClick={() => setLabelMode('name')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                labelMode === 'name' ? 'bg-indigo-600 text-white' : 'hover:text-white'
              }`}
            >
              Note
            </button>
            <button
              onClick={() => setLabelMode('interval')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                labelMode === 'interval' ? 'bg-indigo-600 text-white' : 'hover:text-white'
              }`}
            >
              Semitones
            </button>
          </div>

          {/* Octave Range */}
          <div className="flex items-center gap-1 text-xs text-slate-300 bg-slate-800/90 px-2 py-1 rounded-lg border border-slate-700/60">
            <span className="text-slate-400">Octaves:</span>
            {[2, 3].map((cnt) => (
              <button
                key={cnt}
                onClick={() => setOctaveCount(cnt)}
                className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                  octaveCount === cnt ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {cnt}
              </button>
            ))}
          </div>

          {/* Audio Action Buttons */}
          {mode === 'scale' ? (
            <button
              onClick={playScaleSequence}
              disabled={isPlayingArpeggio}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white shadow-md shadow-emerald-900/30 transition cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {isPlayingArpeggio ? 'Playing...' : 'Play Scale'}
            </button>
          ) : (
            <button
              onClick={playChordAll}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-900/30 transition cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              Play Chord
            </button>
          )}
        </div>
      </div>

      {/* Keyboard Container */}
      <div className="overflow-x-auto pb-2 pt-1 select-none">
        <div className="flex justify-center min-w-max">
          {octaves.map((octave) => (
            <div key={octave} className="flex relative">
              {/* Octave Marker */}
              <div className="absolute -top-3 left-1 text-[10px] font-mono text-slate-500 pointer-events-none">
                C{octave}
              </div>

              {whiteNoteKeys.map((noteName, whiteIndex) => {
                const fullNote = noteName;
                const noteKeyId = `${fullNote}${octave}`;
                const activeInfo = activeNoteMap.get(fullNote);
                const isActive = !!activeInfo;
                const isRoot = noteToSemitone(fullNote) === noteToSemitone(rootNote);
                const isPlaying = activePlaybackNote === noteKeyId;

                const blackKeyInfo = blackKeysByWhiteIndex[whiteIndex];

                return (
                  <div key={noteKeyId} className="relative">
                    {/* White Key */}
                    <button
                      onClick={() => handlePlayKey(fullNote, octave)}
                      className={`w-9 md:w-11 h-36 md:h-44 rounded-b-md border-r border-b border-l border-slate-300 relative flex flex-col justify-end items-center pb-2 transition-all cursor-pointer ${
                        isPlaying
                          ? 'bg-amber-200 transform translate-y-1'
                          : isActive
                          ? isRoot
                            ? 'bg-rose-50/95 hover:bg-rose-100'
                            : 'bg-indigo-50/95 hover:bg-indigo-100'
                          : 'bg-white hover:bg-slate-100 active:bg-slate-200'
                      }`}
                    >
                      {/* Active Note Badge */}
                      {isActive && (
                        <div
                          className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex flex-col items-center justify-center font-bold text-[10px] md:text-xs shadow-md transition-transform scale-100 mb-1 ${getDegreeBadgeColor(
                            activeInfo.degree,
                            isRoot
                          )}`}
                        >
                          {labelMode === 'degree' && activeInfo.degree}
                          {labelMode === 'name' && fullNote}
                          {labelMode === 'interval' && `+${activeInfo.interval}`}
                        </div>
                      )}

                      <span className="text-[10px] font-mono text-slate-600 font-medium">
                        {fullNote}
                        <sub className="text-[8px] text-slate-400">{octave}</sub>
                      </span>
                    </button>

                    {/* Black Key overlay if exists */}
                    {blackKeyInfo && (
                      <div
                        className="absolute top-0 z-20 pointer-events-auto"
                        style={{
                          left: `${blackKeyInfo.offsetLeftPercent}%`,
                          transform: 'translateX(-50%)',
                        }}
                      >
                        {(() => {
                          const blackNote = blackKeyInfo.note;
                          const blackKeyId = `${blackNote}${octave}`;
                          const bActiveInfo = activeNoteMap.get(blackNote);
                          const isBActive = !!bActiveInfo;
                          const isBRoot = noteToSemitone(blackNote) === noteToSemitone(rootNote);
                          const isBPlaying = activePlaybackNote === blackKeyId;

                          return (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlayKey(blackNote, octave);
                              }}
                              className={`w-5 md:w-6.5 h-22 md:h-26 rounded-b-sm border-x border-b border-slate-900 shadow-lg flex flex-col justify-end items-center pb-1.5 transition-all cursor-pointer ${
                                isBPlaying
                                  ? 'bg-amber-400 transform translate-y-1'
                                  : isBActive
                                  ? isBRoot
                                    ? 'bg-rose-900 border-rose-600'
                                    : 'bg-indigo-900 border-indigo-500'
                                  : 'bg-slate-950 hover:bg-slate-800'
                              }`}
                            >
                              {isBActive && (
                                <div
                                  className={`w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center font-bold text-[8px] md:text-[9px] shadow-sm mb-1 ${getDegreeBadgeColor(
                                    bActiveInfo.degree,
                                    isBRoot
                                  )}`}
                                >
                                  {labelMode === 'degree' && bActiveInfo.degree}
                                  {labelMode === 'name' && blackNote}
                                  {labelMode === 'interval' && `+${bActiveInfo.interval}`}
                                </div>
                              )}
                              <span className="text-[8px] font-mono text-slate-300">
                                {blackNote}
                              </span>
                            </button>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Degree Color Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-3 mt-2 border-t border-slate-800/60 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Root (1)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> 3rd / b3 (Chord Quality)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> 5th / b5
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> 7th / b7
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Extensions (9, 11, 13)
        </span>
      </div>
    </div>
  );
};
