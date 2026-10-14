import React, { useState, useEffect, useRef } from 'react';
import {
  NoteName,
  PRESET_PROGRESSIONS,
  PresetProgression,
  CHORDS,
  CHROMATIC_SHARP,
  noteToSemitone,
  semitoneToNote,
  getChordNotes,
} from '../utils/musicTheory';
import { soundEngine, InstrumentType } from '../utils/audioSynth';
import { Play, Pause, RotateCcw, Plus, Trash2, ArrowRight, Volume2, Sparkles } from 'lucide-react';

interface ProgressionStudioProps {
  currentRoot: NoteName;
  instrument: InstrumentType;
  onSelectChord: (root: NoteName, chordId: string) => void;
  onAskAIAboutProgression: (progressionDesc: string) => void;
}

interface ProgressionItem {
  id: string;
  root: NoteName;
  chordId: string;
  label: string;
  roman: string;
}

export const ProgressionStudio: React.FC<ProgressionStudioProps> = ({
  currentRoot,
  instrument,
  onSelectChord,
  onAskAIAboutProgression,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('jazz_ii_v_i');
  const [bpm, setBpm] = useState<number>(110);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentChordIndex, setCurrentChordIndex] = useState<number>(-1);
  const [progressionChords, setProgressionChords] = useState<ProgressionItem[]>([]);

  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load preset transposed to current key
  useEffect(() => {
    const preset = PRESET_PROGRESSIONS.find((p) => p.id === selectedPresetId) || PRESET_PROGRESSIONS[0];
    const semitoneDiff = noteToSemitone(currentRoot) - noteToSemitone('C');

    const transposed = preset.chordsInC.map((c, i) => {
      const origSemi = noteToSemitone(c.root);
      const newRoot = semitoneToNote(origSemi + semitoneDiff);
      const chordDef = CHORDS.find((cd) => cd.id === c.chordId);
      const chordSymbol = chordDef ? chordDef.symbol : '';
      return {
        id: `${i}-${Date.now()}`,
        root: newRoot,
        chordId: c.chordId,
        label: `${newRoot}${chordSymbol}`,
        roman: preset.romanNumerals[i] || `deg-${i + 1}`,
      };
    });

    setProgressionChords(transposed);
    if (isPlaying) {
      stopPlayback();
    }
  }, [selectedPresetId, currentRoot]);

  const stopPlayback = () => {
    if (playTimerRef.current) {
      clearInterval(playTimerRef.current);
      playTimerRef.current = null;
    }
    setIsPlaying(false);
    setCurrentChordIndex(-1);
  };

  const playSingleChordItem = (item: ProgressionItem) => {
    const notes = getChordNotes(item.root, item.chordId);
    const audioNotes = notes.map((n, i) => ({
      note: n.note,
      octave: 3 + Math.floor(n.interval / 12) + (i > 2 ? 1 : 0),
    }));
    soundEngine.playChord(audioNotes, instrument, 35);
    onSelectChord(item.root, item.chordId);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopPlayback();
      return;
    }

    if (progressionChords.length === 0) return;

    setIsPlaying(true);
    let index = 0;
    setCurrentChordIndex(0);
    playSingleChordItem(progressionChords[0]);

    const stepMs = (60 / bpm) * 2000; // 2 beats per chord

    playTimerRef.current = setInterval(() => {
      index = (index + 1) % progressionChords.length;
      setCurrentChordIndex(index);
      playSingleChordItem(progressionChords[index]);
    }, stepMs);
  };

  useEffect(() => {
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, []);

  const handleAddChord = () => {
    const defaultChordId = 'major';
    const newChord: ProgressionItem = {
      id: `${Date.now()}`,
      root: currentRoot,
      chordId: defaultChordId,
      label: `${currentRoot}`,
      roman: 'I',
    };
    setProgressionChords([...progressionChords, newChord]);
  };

  const handleRemoveChord = (idx: number) => {
    const updated = progressionChords.filter((_, i) => i !== idx);
    setProgressionChords(updated);
  };

  const currentPresetObj = PRESET_PROGRESSIONS.find((p) => p.id === selectedPresetId);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-slate-100 text-base md:text-lg">
              Harmonic Progression Studio
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Arranger and player for iconic chord cadences, voice leading, and reharmonization.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Selector */}
          <select
            value={selectedPresetId}
            onChange={(e) => setSelectedPresetId(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-500 outline-none"
          >
            {PRESET_PROGRESSIONS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.genre} - {p.name}
              </option>
            ))}
          </select>

          {/* BPM Slider */}
          <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60 text-xs text-slate-300">
            <span className="text-slate-400 font-mono">BPM:</span>
            <input
              type="range"
              min="60"
              max="180"
              value={bpm}
              onChange={(e) => setBpm(parseInt(e.target.value, 10))}
              className="w-16 accent-indigo-500 cursor-pointer"
            />
            <span className="font-mono w-6 text-right font-bold text-indigo-400">{bpm}</span>
          </div>

          {/* Play / Stop Button */}
          <button
            onClick={togglePlay}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg text-white shadow-md transition cursor-pointer ${
              isPlaying
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/40'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" /> Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Play Loop
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preset description */}
      {currentPresetObj && (
        <div className="flex items-center justify-between mb-4 p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-900/40 text-xs text-indigo-200">
          <span>{currentPresetObj.description}</span>
          <button
            onClick={() => {
              const summary = `Analyze this harmonic progression: ${progressionChords
                .map((c) => `${c.label} (${c.roman})`)
                .join(' -> ')} in the key of ${currentRoot}. What makes its voice leading work and what scales should I solo with?`;
              onAskAIAboutProgression(summary);
            }}
            className="flex items-center gap-1 text-[11px] font-medium text-amber-300 hover:text-amber-200 underline cursor-pointer ml-3 flex-shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Ask Gemini to Analyze
          </button>
        </div>
      )}

      {/* Chords Sequence Timeline */}
      <div className="flex flex-wrap items-center gap-2 py-2">
        {progressionChords.map((chordItem, idx) => {
          const isCurrent = currentChordIndex === idx;

          return (
            <React.Fragment key={chordItem.id}>
              <div
                onClick={() => playSingleChordItem(chordItem)}
                className={`relative flex flex-col items-center justify-center min-w-[100px] p-3 rounded-xl border transition-all cursor-pointer group ${
                  isCurrent
                    ? 'bg-indigo-600/30 border-indigo-400 ring-2 ring-indigo-400 scale-105 shadow-xl'
                    : 'bg-slate-800/80 border-slate-700/80 hover:bg-slate-700/80'
                }`}
              >
                {/* Roman Numeral */}
                <span className="text-[10px] font-mono text-indigo-300 font-bold mb-0.5">
                  {chordItem.roman}
                </span>

                {/* Chord Label */}
                <span className="text-base font-extrabold text-white tracking-wide">
                  {chordItem.label}
                </span>

                {/* Remove hover button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveChord(idx);
                  }}
                  className="absolute -top-1.5 -right-1.5 opacity-0 group-hover:opacity-100 bg-rose-600 hover:bg-rose-500 text-white rounded-full p-0.5 shadow-md transition"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              {idx < progressionChords.length - 1 && (
                <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
              )}
            </React.Fragment>
          );
        })}

        {/* Add Chord Button */}
        <button
          onClick={handleAddChord}
          className="flex flex-col items-center justify-center w-12 h-16 rounded-xl border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition cursor-pointer"
          title="Add chord to progression"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
