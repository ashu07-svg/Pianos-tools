import React, { useState } from 'react';
import {
  NoteName,
  CHROMATIC_SHARP,
  SCALES,
  CHORDS,
  getScaleNotes,
  getChordNotes,
} from './utils/musicTheory';
import { InstrumentType, soundEngine } from './utils/audioSynth';
import { PianoVisualizer } from './components/PianoVisualizer';
import { FretboardVisualizer } from './components/FretboardVisualizer';
import { CircleOfFifths } from './components/CircleOfFifths';
import { StaffVisualizer } from './components/StaffVisualizer';
import { ChordExplorer } from './components/ChordExplorer';
import { ProgressionStudio } from './components/ProgressionStudio';
import { ChatTutor } from './components/ChatTutor';
import { ImageGenerator } from './components/ImageGenerator';
import {
  Piano,
  Guitar,
  Compass,
  Layers,
  Sliders,
  MessageSquare,
  Sparkles,
  Music2,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  BookOpen,
} from 'lucide-react';

export default function App() {
  // Global Studio State
  const [rootNote, setRootNote] = useState<NoteName>('C');
  const [scaleId, setScaleId] = useState<string>('major');
  const [chordId, setChordId] = useState<string>('maj7');
  const [inversion, setInversion] = useState<number>(0);
  const [instrument, setInstrument] = useState<InstrumentType>('piano');
  const [activeTab, setActiveTab] = useState<
    'keys' | 'fretboard' | 'circle' | 'chords' | 'progressions' | 'chat' | 'image'
  >('keys');

  // External prompt bridge for ChatTutor
  const [chatPromptBridge, setChatPromptBridge] = useState<string | null>(null);

  // Active scale & chord derivations
  const currentScale = SCALES.find((s) => s.id === scaleId) || SCALES[0];
  const currentChord = CHORDS.find((c) => c.id === chordId) || CHORDS[0];

  const scaleNotes = getScaleNotes(rootNote, scaleId);
  const chordNotes = getChordNotes(rootNote, chordId);

  const handleQuickPlayScale = () => {
    const seq = scaleNotes.map((sn) => ({
      note: sn.note,
      octave: 4 + Math.floor(sn.interval / 12),
    }));
    seq.push({ note: rootNote, octave: 5 });
    soundEngine.playScaleArpeggio(seq, instrument, 150);
  };

  const handleQuickPlayChord = () => {
    const chordArr = chordNotes.map((cn) => ({
      note: cn.note,
      octave: 4 + Math.floor(cn.interval / 12),
    }));
    soundEngine.playChord(chordArr, instrument, 40);
  };

  const handleAskAITopic = (question: string) => {
    setChatPromptBridge(question);
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Application Bar */}
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Music2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-lg md:text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  Harmoniq
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                  Studio
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Interactive Music Theory, Fretboard & Chord Visualization
              </p>
            </div>
          </div>

          {/* Global Harmony Controls */}
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            {/* Root Note Picker */}
            <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 mr-2">Key:</span>
              <select
                value={rootNote}
                onChange={(e) => setRootNote(e.target.value as NoteName)}
                className="bg-transparent font-bold text-white text-sm outline-none cursor-pointer"
              >
                {CHROMATIC_SHARP.map((note) => (
                  <option key={note} value={note} className="bg-slate-900 text-white">
                    {note}
                  </option>
                ))}
              </select>
            </div>

            {/* Scale Picker */}
            <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 mr-2">Scale:</span>
              <select
                value={scaleId}
                onChange={(e) => setScaleId(e.target.value)}
                className="bg-transparent text-xs font-semibold text-indigo-300 outline-none cursor-pointer max-w-[140px] md:max-w-[180px] truncate"
              >
                {SCALES.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Chord Picker */}
            <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 mr-2">Chord:</span>
              <select
                value={chordId}
                onChange={(e) => {
                  setChordId(e.target.value);
                  setInversion(0);
                }}
                className="bg-transparent text-xs font-semibold text-rose-300 outline-none cursor-pointer max-w-[110px] md:max-w-[150px] truncate"
              >
                {CHORDS.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {c.symbol ? `${c.symbol} (${c.name})` : c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Instrument Sound Preset */}
            <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl px-2 py-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 mr-1.5 hidden md:inline">
                Sound:
              </span>
              <select
                value={instrument}
                onChange={(e) => setInstrument(e.target.value as InstrumentType)}
                className="bg-transparent text-xs text-slate-200 outline-none cursor-pointer"
              >
                <option value="piano" className="bg-slate-900">Grand Piano</option>
                <option value="rhodes" className="bg-slate-900">Fender Rhodes</option>
                <option value="guitar" className="bg-slate-900">Acoustic Guitar</option>
                <option value="synth" className="bg-slate-900">Analog Pad</option>
              </select>
            </div>

            {/* Quick Audition Buttons */}
            <button
              onClick={handleQuickPlayScale}
              title="Play scale arpeggio"
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-2.5 py-1.5 rounded-xl shadow-md transition cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Scale</span>
            </button>

            <button
              onClick={handleQuickPlayChord}
              title="Play chord"
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-2.5 py-1.5 rounded-xl shadow-md transition cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chord</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto border-t border-slate-800/60 scrollbar-none">
          <nav className="flex space-x-1 md:space-x-2 py-2">
            {[
              { id: 'keys', label: 'Piano & Notation', icon: Piano },
              { id: 'fretboard', label: 'Guitar & Bass Fretboard', icon: Guitar },
              { id: 'circle', label: 'Circle of Fifths', icon: Compass },
              { id: 'chords', label: 'Chord Voicings', icon: Layers },
              { id: 'progressions', label: 'Progression Studio', icon: Sliders },
              { id: 'chat', label: 'Gemini AI Tutor', icon: MessageSquare, badge: 'Chatbot' },
              { id: 'image', label: 'AI Poster Generator', icon: Sparkles, badge: 'Image' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[9px] uppercase px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : tab.badge === 'Image'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-indigo-500/20 text-indigo-300'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Studio Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Active Scale & Chord Info Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xl md:text-2xl font-black text-white">
                {rootNote} {currentScale.name}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30 font-medium">
                {currentScale.stepPattern}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {currentScale.category}
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              {currentScale.description} <span className="text-indigo-300 italic">— Mood: {currentScale.mood}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] uppercase font-bold text-slate-400">Harmonized Chord:</div>
              <div className="text-sm font-extrabold text-amber-400">
                {rootNote}{currentChord.symbol} ({currentChord.formula})
              </div>
            </div>
            <button
              onClick={() =>
                handleAskAITopic(
                  `Explain the harmonic relationship between the ${rootNote} ${currentScale.name} scale and the ${rootNote}${currentChord.symbol} chord. What emotions does this combination evoke?`
                )
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-indigo-300 hover:text-white border border-slate-700 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Ask AI Tutor</span>
            </button>
          </div>
        </div>

        {/* Tab Content Panels */}
        {activeTab === 'keys' && (
          <div className="space-y-6">
            <PianoVisualizer
              rootNote={rootNote}
              activeNotes={scaleNotes}
              mode="scale"
              title={`Interactive Piano Keyboard: ${rootNote} ${currentScale.name}`}
              instrument={instrument}
            />

            <StaffVisualizer
              rootNote={rootNote}
              activeNotes={scaleNotes}
              mode="scale"
              instrument={instrument}
              title={`Standard Notation Staff: ${rootNote} ${currentScale.name}`}
            />
          </div>
        )}

        {activeTab === 'fretboard' && (
          <div className="space-y-6">
            <FretboardVisualizer
              rootNote={rootNote}
              activeNotes={scaleNotes}
              instrumentType={instrument}
              title={`Fretboard Visualizer: ${rootNote} ${currentScale.name}`}
            />

            {/* Secondary Piano reference */}
            <PianoVisualizer
              rootNote={rootNote}
              activeNotes={chordNotes}
              mode="chord"
              title={`Accompanying Chord: ${rootNote}${currentChord.symbol}`}
              instrument={instrument}
            />
          </div>
        )}

        {activeTab === 'circle' && (
          <div className="space-y-6">
            <CircleOfFifths
              currentRoot={rootNote}
              onSelectRoot={(newRoot) => setRootNote(newRoot)}
              instrument={instrument}
            />

            <PianoVisualizer
              rootNote={rootNote}
              activeNotes={scaleNotes}
              mode="scale"
              title={`Transposed Key: ${rootNote} Major Scale`}
              instrument={instrument}
            />
          </div>
        )}

        {activeTab === 'chords' && (
          <div className="space-y-6">
            <ChordExplorer
              currentRoot={rootNote}
              currentChordId={chordId}
              inversion={inversion}
              onSelectChord={(newChordId) => {
                setChordId(newChordId);
                setInversion(0);
              }}
              onSelectInversion={(inv) => setInversion(inv)}
              onLoadScale={(sId) => {
                setScaleId(sId);
                setActiveTab('keys');
              }}
              instrument={instrument}
            />

            <PianoVisualizer
              rootNote={rootNote}
              activeNotes={chordNotes}
              mode="chord"
              title={`Voicing on Keyboard: ${rootNote}${currentChord.symbol} (Inversion ${inversion})`}
              instrument={instrument}
            />
          </div>
        )}

        {activeTab === 'progressions' && (
          <div className="space-y-6">
            <ProgressionStudio
              currentRoot={rootNote}
              instrument={instrument}
              onSelectChord={(cRoot, cChordId) => {
                setRootNote(cRoot);
                setChordId(cChordId);
              }}
              onAskAIAboutProgression={(analysisQuery) => handleAskAITopic(analysisQuery)}
            />

            <PianoVisualizer
              rootNote={rootNote}
              activeNotes={chordNotes}
              mode="chord"
              title={`Active Progression Chord: ${rootNote}${currentChord.symbol}`}
              instrument={instrument}
            />
          </div>
        )}

        {activeTab === 'chat' && (
          <ChatTutor
            currentRoot={rootNote}
            currentScaleId={scaleId}
            currentChordId={chordId}
            onApplyScaleToStudio={(sId) => setScaleId(sId)}
            onApplyChordToStudio={(cId) => setChordId(cId)}
            externalPrompt={chatPromptBridge}
            onClearExternalPrompt={() => setChatPromptBridge(null)}
          />
        )}

        {activeTab === 'image' && (
          <ImageGenerator
            currentRoot={rootNote}
            currentScaleId={scaleId}
            currentChordId={chordId}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>Harmoniq — Interactive Music Theory, Scales & Chords Visualization Studio.</p>
      </footer>
    </div>
  );
}
