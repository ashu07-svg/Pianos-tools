import React from 'react';
import {
  NoteName,
  CHORDS,
  ChordDefinition,
  SCALES,
  getChordNotes,
  noteToSemitone,
  semitoneToNote,
} from '../utils/musicTheory';
import { soundEngine, InstrumentType } from '../utils/audioSynth';
import { Layers, Volume2, Sparkles, Compass, CheckCircle } from 'lucide-react';

interface ChordExplorerProps {
  currentRoot: NoteName;
  currentChordId: string;
  inversion: number;
  onSelectChord: (chordId: string) => void;
  onSelectInversion: (inv: number) => void;
  onLoadScale: (scaleId: string) => void;
  instrument: InstrumentType;
}

export const ChordExplorer: React.FC<ChordExplorerProps> = ({
  currentRoot,
  currentChordId,
  inversion,
  onSelectChord,
  onSelectInversion,
  onLoadScale,
  instrument,
}) => {
  const currentChord = CHORDS.find((c) => c.id === currentChordId) || CHORDS[0];

  const rawNotes = getChordNotes(currentRoot, currentChordId);

  // Invert notes
  // Inversion 0: root position
  // Inversion 1: 3rd in bass (first note shifted up octave)
  // Inversion 2: 5th in bass (first two notes shifted up octave)
  // Inversion 3: 7th in bass (first three notes shifted up octave)
  const invertedNotes = rawNotes.map((item, idx) => {
    let octaveOffset = 0;
    if (inversion === 1 && idx < 1) octaveOffset = 1;
    if (inversion === 2 && idx < 2) octaveOffset = 1;
    if (inversion === 3 && idx < 3) octaveOffset = 1;
    return {
      ...item,
      octave: 4 + octaveOffset,
      isBassNote: (idx === 0 && inversion === 0) || (idx === inversion),
    };
  });

  // Reorder for voicing display so bass note is first
  const displayVoicing = [...invertedNotes].sort((a, b) => a.octave * 12 + a.interval - (b.octave * 12 + b.interval));

  const playVoicing = () => {
    const playList = displayVoicing.map((v) => ({
      note: v.note,
      octave: v.octave,
    }));
    soundEngine.playChord(playList, instrument, 45);
  };

  // Determine compatible scales
  const getCompatibleScales = () => {
    if (currentChordId.includes('maj') || currentChordId === 'major') {
      return ['major', 'lydian', 'pentatonic_major', 'bebop_dominant'];
    }
    if (currentChordId.includes('min') || currentChordId === 'minor' || currentChordId === 'm7') {
      return ['dorian', 'minor', 'pentatonic_minor', 'blues', 'melodic_minor'];
    }
    if (currentChordId === 'dom7' || currentChordId === 'dom9' || currentChordId === 'dom7b9') {
      return ['mixolydian', 'bebop_dominant', 'blues', 'diminished_hw'];
    }
    if (currentChordId === 'm7b5' || currentChordId === 'diminished') {
      return ['locrian', 'harmonic_minor', 'diminished_hw'];
    }
    return ['major', 'minor', 'pentatonic_minor'];
  };

  const compatibleScaleIds = getCompatibleScales();
  const compatibleScales = SCALES.filter((s) => compatibleScaleIds.includes(s.id));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-slate-100 text-base md:text-lg">
              Chord Voicing & Inversion Inspector
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Examine chord formula, voice leading inversions, and compatible scales for improvisation.
          </p>
        </div>

        <button
          onClick={playVoicing}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-900/30 transition cursor-pointer"
        >
          <Volume2 className="w-3.5 h-3.5" /> Play Voicing
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Inversion & Formula */}
        <div className="lg:col-span-7 space-y-4">
          {/* Inversion Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">
              Voicing Inversion:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => onSelectInversion(0)}
                className={`px-3 py-2 rounded-xl text-xs font-medium border transition cursor-pointer text-left ${
                  inversion === 0
                    ? 'bg-indigo-600/30 border-indigo-500 text-white'
                    : 'bg-slate-800/70 border-slate-700/60 text-slate-300 hover:bg-slate-700/60'
                }`}
              >
                <div className="font-bold">Root Position</div>
                <div className="text-[10px] text-slate-400">Bass: {rawNotes[0]?.note}</div>
              </button>

              <button
                onClick={() => onSelectInversion(1)}
                className={`px-3 py-2 rounded-xl text-xs font-medium border transition cursor-pointer text-left ${
                  inversion === 1
                    ? 'bg-indigo-600/30 border-indigo-500 text-white'
                    : 'bg-slate-800/70 border-slate-700/60 text-slate-300 hover:bg-slate-700/60'
                }`}
              >
                <div className="font-bold">1st Inversion</div>
                <div className="text-[10px] text-slate-400">Bass: {rawNotes[1]?.note} (3rd)</div>
              </button>

              <button
                onClick={() => onSelectInversion(2)}
                className={`px-3 py-2 rounded-xl text-xs font-medium border transition cursor-pointer text-left ${
                  inversion === 2
                    ? 'bg-indigo-600/30 border-indigo-500 text-white'
                    : 'bg-slate-800/70 border-slate-700/60 text-slate-300 hover:bg-slate-700/60'
                }`}
              >
                <div className="font-bold">2nd Inversion</div>
                <div className="text-[10px] text-slate-400">Bass: {rawNotes[2]?.note} (5th)</div>
              </button>

              {rawNotes.length >= 4 && (
                <button
                  onClick={() => onSelectInversion(3)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition cursor-pointer text-left ${
                    inversion === 3
                      ? 'bg-indigo-600/30 border-indigo-500 text-white'
                      : 'bg-slate-800/70 border-slate-700/60 text-slate-300 hover:bg-slate-700/60'
                  }`}
                >
                  <div className="font-bold">3rd Inversion</div>
                  <div className="text-[10px] text-slate-400">Bass: {rawNotes[3]?.note} (7th)</div>
                </button>
              )}
            </div>
          </div>

          {/* Voicing Breakdown Pill Badges */}
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Current Voicing Notes (Low to High):</span>
              <span className="text-xs font-mono text-indigo-400 font-bold">
                Formula: {currentChord.formula}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {displayVoicing.map((v, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${
                    idx === 0
                      ? 'bg-rose-950/60 border-rose-600 text-rose-200 ring-1 ring-rose-500/50'
                      : 'bg-slate-800/90 border-slate-700 text-slate-200'
                  }`}
                >
                  <span className="font-bold text-white text-sm">{v.note}</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {v.degree} ({v.octave})
                  </span>
                  {idx === 0 && (
                    <span className="text-[9px] font-bold bg-rose-600 text-white px-1 py-0.2 rounded uppercase">
                      Bass
                    </span>
                  )}
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-400 mt-3 italic">
              {currentChord.description}
            </p>
          </div>
        </div>

        {/* Right Column: Soloing & Improvisation Scales */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Improvisation Scales for {currentRoot}{currentChord.symbol}
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              These scales emphasize the chord tones and safe tensions over this harmony:
            </p>

            <div className="space-y-2">
              {compatibleScales.map((scale) => (
                <div
                  key={scale.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition"
                >
                  <div>
                    <span className="font-bold text-white text-xs block">{scale.name}</span>
                    <span className="text-[10px] text-slate-400">{scale.mood}</span>
                  </div>
                  <button
                    onClick={() => onLoadScale(scale.id)}
                    className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded bg-indigo-600/40 hover:bg-indigo-600 text-indigo-200 hover:text-white transition cursor-pointer"
                  >
                    Load Scale
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
