import React, { useState } from 'react';
import {
  NoteName,
  GUITAR_TUNINGS,
  GuitarTuning,
  noteToSemitone,
  semitoneToNote,
} from '../utils/musicTheory';
import { soundEngine, InstrumentType } from '../utils/audioSynth';
import { Guitar, Eye, Filter } from 'lucide-react';

interface FretboardVisualizerProps {
  rootNote: NoteName;
  activeNotes: { note: NoteName; degree: string; interval: number }[];
  instrumentType: InstrumentType;
  title?: string;
}

export const FretboardVisualizer: React.FC<FretboardVisualizerProps> = ({
  rootNote,
  activeNotes,
  instrumentType,
  title,
}) => {
  const [selectedTuningId, setSelectedTuningId] = useState<string>('standard');
  const [fretCount, setFretCount] = useState<number>(15); // 12, 15, or 21
  const [labelMode, setLabelMode] = useState<'degree' | 'name' | 'interval'>('degree');
  const [filterMode, setFilterMode] = useState<'all' | 'roots' | 'triad'>('all');
  const [lastPlayedFret, setLastPlayedFret] = useState<string | null>(null);

  const currentTuning: GuitarTuning =
    GUITAR_TUNINGS.find((t) => t.id === selectedTuningId) || GUITAR_TUNINGS[0];

  // Active note map
  const activeNoteMap = new Map<number, { degree: string; interval: number }>();
  activeNotes.forEach((an) => {
    activeNoteMap.set(noteToSemitone(an.note), { degree: an.degree, interval: an.interval });
  });

  const rootSemitone = noteToSemitone(rootNote);

  // Inlay dot positions
  const singleDotFrets = [3, 5, 7, 9, 15, 17, 19, 21];
  const doubleDotFrets = [12, 24];

  const handleFretClick = (note: string, octave: number, stringIdx: number, fret: number) => {
    soundEngine.playNote(note, octave, 1.2, instrumentType === 'guitar' ? 'guitar' : 'piano', 0.9);
    setLastPlayedFret(`${stringIdx}-${fret}`);
    setTimeout(() => setLastPlayedFret(null), 350);
  };

  const getDegreeBadgeColor = (degree: string, isRoot: boolean) => {
    if (isRoot) return 'bg-rose-500 text-white shadow-rose-500/50 ring-2 ring-rose-400';
    if (degree.includes('3')) return 'bg-emerald-500 text-white shadow-emerald-500/50';
    if (degree.includes('5')) return 'bg-sky-500 text-white shadow-sky-500/50';
    if (degree.includes('7')) return 'bg-purple-500 text-white shadow-purple-500/50';
    if (degree.includes('9') || degree.includes('2')) return 'bg-amber-500 text-black shadow-amber-500/50';
    return 'bg-blue-600 text-white';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Guitar className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-slate-100 text-base md:text-lg">
              {title || 'Interactive Fretboard Visualizer'}
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any fret to pluck the string. Supports standard & alternate tunings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tuning Selector */}
          <select
            value={selectedTuningId}
            onChange={(e) => setSelectedTuningId(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-500 outline-none"
          >
            {GUITAR_TUNINGS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Fret Count */}
          <div className="flex items-center gap-1 text-xs text-slate-300 bg-slate-800/90 px-2 py-1 rounded-lg border border-slate-700/60">
            <span className="text-slate-400">Frets:</span>
            {[12, 15, 21].map((f) => (
              <button
                key={f}
                onClick={() => setFretCount(f)}
                className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                  fretCount === f ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Label selector */}
          <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700/60 text-xs text-slate-300">
            <button
              onClick={() => setLabelMode('degree')}
              className={`px-2 py-1 rounded font-medium transition ${
                labelMode === 'degree' ? 'bg-indigo-600 text-white' : 'hover:text-white'
              }`}
            >
              Degrees
            </button>
            <button
              onClick={() => setLabelMode('name')}
              className={`px-2 py-1 rounded font-medium transition ${
                labelMode === 'name' ? 'bg-indigo-600 text-white' : 'hover:text-white'
              }`}
            >
              Notes
            </button>
          </div>

          {/* Filter selector */}
          <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700/60 text-xs text-slate-300">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2 py-1 rounded font-medium transition ${
                filterMode === 'all' ? 'bg-amber-600 text-white' : 'hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterMode('triad')}
              className={`px-2 py-1 rounded font-medium transition ${
                filterMode === 'triad' ? 'bg-amber-600 text-white' : 'hover:text-white'
              }`}
            >
              1-3-5
            </button>
            <button
              onClick={() => setFilterMode('roots')}
              className={`px-2 py-1 rounded font-medium transition ${
                filterMode === 'roots' ? 'bg-amber-600 text-white' : 'hover:text-white'
              }`}
            >
              Roots
            </button>
          </div>
        </div>
      </div>

      {/* Fretboard SVG / HTML layout */}
      <div className="overflow-x-auto pb-4 select-none">
        <div className="min-w-[760px] bg-gradient-to-b from-stone-900 via-amber-950/40 to-stone-900 border-2 border-stone-800 rounded-xl p-3 shadow-2xl relative">
          {/* Fret numbers row */}
          <div className="flex items-center mb-1 text-[11px] font-mono text-slate-400">
            <div className="w-12 text-center text-slate-500 font-semibold">Nut</div>
            {Array.from({ length: fretCount }, (_, f) => f + 1).map((fretNum) => (
              <div key={fretNum} className="flex-1 text-center font-bold">
                {fretNum}
              </div>
            ))}
          </div>

          {/* Strings and Frets Grid */}
          <div className="relative">
            {currentTuning.strings.map((str, stringIndex) => {
              const baseSemi = noteToSemitone(str.note);
              const stringGaugeThickness = Math.max(1.5, 4.2 - stringIndex * 0.55);

              return (
                <div
                  key={stringIndex}
                  className="flex items-center h-10 md:h-11 relative border-b border-stone-800/60 last:border-b-0"
                >
                  {/* Visual String Line */}
                  <div
                    className="absolute left-12 right-0 bg-gradient-to-r from-stone-400 via-stone-200 to-stone-400 pointer-events-none opacity-85 shadow-sm"
                    style={{
                      height: `${stringGaugeThickness}px`,
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}
                  />

                  {/* Nut / Open String Note (Fret 0) */}
                  <div className="w-12 pr-1 flex justify-center items-center z-10 border-r-4 border-amber-200/40">
                    {(() => {
                      const openNote = str.note;
                      const openSemi = baseSemi;
                      const activeInfo = activeNoteMap.get(openSemi);
                      const isRoot = openSemi === rootSemitone;
                      let showBadge = !!activeInfo;

                      if (filterMode === 'roots' && !isRoot) showBadge = false;
                      if (filterMode === 'triad' && activeInfo && !['1', '3', 'b3', '5', 'b5', '#5'].includes(activeInfo.degree)) {
                        showBadge = false;
                      }

                      return (
                        <button
                          onClick={() => handleFretClick(openNote, str.octave, stringIndex, 0)}
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md transition-transform hover:scale-110 active:scale-95 cursor-pointer ${
                            showBadge && activeInfo
                              ? getDegreeBadgeColor(activeInfo.degree, isRoot)
                              : 'bg-stone-800 text-stone-300 border border-stone-700 hover:bg-stone-700'
                          }`}
                        >
                          {showBadge && activeInfo && labelMode === 'degree'
                            ? activeInfo.degree
                            : openNote}
                        </button>
                      );
                    })()}
                  </div>

                  {/* Frets 1 to N */}
                  {Array.from({ length: fretCount }, (_, f) => f + 1).map((fret) => {
                    const totalSemitone = baseSemi + fret;
                    const semitoneMod = totalSemitone % 12;
                    const calculatedNote = semitoneToNote(semitoneMod);
                    const octaveOffset = Math.floor((str.octave * 12 + baseSemi + fret) / 12);
                    const activeInfo = activeNoteMap.get(semitoneMod);
                    const isRoot = semitoneMod === rootSemitone;
                    const isPlayed = lastPlayedFret === `${stringIndex}-${fret}`;

                    let showBadge = !!activeInfo;
                    if (filterMode === 'roots' && !isRoot) showBadge = false;
                    if (filterMode === 'triad' && activeInfo && !['1', '3', 'b3', '5', 'b5', '#5'].includes(activeInfo.degree)) {
                      showBadge = false;
                    }

                    return (
                      <div
                        key={fret}
                        className="flex-1 h-full flex items-center justify-center relative border-r-2 border-stone-600/80 hover:bg-white/5 transition cursor-pointer"
                        onClick={() =>
                          handleFretClick(calculatedNote, octaveOffset, stringIndex, fret)
                        }
                      >
                        {showBadge && activeInfo && (
                          <div
                            className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center font-bold text-[9px] md:text-[10px] shadow-lg z-20 transition-all ${
                              isPlayed ? 'scale-125 ring-4 ring-amber-300' : 'scale-100'
                            } ${getDegreeBadgeColor(activeInfo.degree, isRoot)}`}
                          >
                            {labelMode === 'degree' && activeInfo.degree}
                            {labelMode === 'name' && calculatedNote}
                            {labelMode === 'interval' && `+${activeInfo.interval}`}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Inlay Dots Row beneath the fretboard */}
            <div className="flex items-center h-5 mt-1">
              <div className="w-12" />
              {Array.from({ length: fretCount }, (_, f) => f + 1).map((fret) => {
                const isSingle = singleDotFrets.includes(fret);
                const isDouble = doubleDotFrets.includes(fret);

                return (
                  <div key={fret} className="flex-1 flex justify-center items-center">
                    {isSingle && (
                      <span className="w-2.5 h-2.5 rounded-full bg-stone-500/80 shadow-inner" />
                    )}
                    {isDouble && (
                      <span className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-400/90 shadow-sm" />
                        <span className="w-2 h-2 rounded-full bg-amber-400/90 shadow-sm" />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
