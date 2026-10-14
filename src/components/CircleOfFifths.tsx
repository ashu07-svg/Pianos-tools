import React from 'react';
import { NoteName, CIRCLE_OF_FIFTHS, noteToSemitone } from '../utils/musicTheory';
import { soundEngine, InstrumentType } from '../utils/audioSynth';
import { Compass, Sparkles, Volume2 } from 'lucide-react';

interface CircleOfFifthsProps {
  currentRoot: NoteName;
  onSelectRoot: (root: NoteName) => void;
  instrument: InstrumentType;
}

export const CircleOfFifths: React.FC<CircleOfFifthsProps> = ({
  currentRoot,
  onSelectRoot,
  instrument,
}) => {
  const currentKeyIndex = CIRCLE_OF_FIFTHS.findIndex(
    (k) => noteToSemitone(k.major) === noteToSemitone(currentRoot)
  );

  const selectedKey = currentKeyIndex !== -1 ? CIRCLE_OF_FIFTHS[currentKeyIndex] : CIRCLE_OF_FIFTHS[0];

  // Helper to play tonic cadence
  const playCadence = (majorNote: NoteName) => {
    // Play I - IV - V - I cadence
    const baseSemi = noteToSemitone(majorNote);
    const chords = [
      // I
      [{ note: majorNote, octave: 4 }],
      // IV (+5 semitones)
      [{ note: majorNote, octave: 4 }],
      // V (+7 semitones)
      [{ note: majorNote, octave: 4 }],
    ];
    soundEngine.playChord([
      { note: majorNote, octave: 4 },
      { note: majorNote, octave: 3 },
    ], instrument, 30);
  };

  const handleSliceClick = (majorKey: NoteName) => {
    onSelectRoot(majorKey);
    playCadence(majorKey);
  };

  // 12 sectors, 30 degrees each
  // Sector 0 is C at 12 o'clock (-90 deg offset)
  const size = 360;
  const center = size / 2;
  const outerRadius = 160;
  const middleRadius = 110;
  const innerRadius = 60;

  const getHarmonicRole = (index: number) => {
    if (currentKeyIndex === -1) return null;
    const diff = (index - currentKeyIndex + 12) % 12;
    if (diff === 0) return { role: 'Tonic (I)', color: 'fill-rose-500' };
    if (diff === 1) return { role: 'Dominant (V)', color: 'fill-sky-500' };
    if (diff === 11) return { role: 'Subdominant (IV)', color: 'fill-emerald-500' };
    if (diff === 2) return { role: 'Supertonic (ii)', color: 'fill-amber-500' };
    if (diff === 9) return { role: 'Submediant (vi)', color: 'fill-purple-500' };
    if (diff === 10) return { role: 'Mediant (iii)', color: 'fill-indigo-500' };
    return null;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-slate-100 text-base md:text-lg">
              Interactive Circle of Fifths
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any key to transpose the entire studio. Shows closely related keys & cadences.
          </p>
        </div>

        {/* Selected key badge */}
        <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-xl text-xs">
          <div>
            <span className="text-slate-400">Current Key:</span>{' '}
            <span className="font-bold text-white text-sm">{selectedKey.major} Major</span>
            <span className="text-slate-400 ml-1">/ {selectedKey.minor} Minor</span>
          </div>
          <div className="h-4 w-px bg-slate-700" />
          <div className="text-amber-400 font-medium">
            {selectedKey.keySignature}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* SVG Wheel */}
        <div className="lg:col-span-7 flex justify-center items-center">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="w-full max-w-[340px] md:max-w-[380px] drop-shadow-2xl select-none"
          >
            {/* Background disc */}
            <circle cx={center} cy={center} r={outerRadius} className="fill-slate-950 stroke-slate-800" strokeWidth="2" />

            {/* Slices */}
            {CIRCLE_OF_FIFTHS.map((item, idx) => {
              const startAngle = (idx * 30 - 105) * (Math.PI / 180);
              const endAngle = ((idx + 1) * 30 - 105) * (Math.PI / 180);
              const midAngle = (idx * 30 - 90) * (Math.PI / 180);

              const isSelected = idx === currentKeyIndex;
              const harmonic = getHarmonicRole(idx);

              // Outer Ring Path (Major Keys)
              const x1Outer = center + outerRadius * Math.cos(startAngle);
              const y1Outer = center + outerRadius * Math.sin(startAngle);
              const x2Outer = center + outerRadius * Math.cos(endAngle);
              const y2Outer = center + outerRadius * Math.sin(endAngle);
              const x1Mid = center + middleRadius * Math.cos(endAngle);
              const y1Mid = center + middleRadius * Math.sin(endAngle);
              const x2Mid = center + middleRadius * Math.cos(startAngle);
              const y2Mid = center + middleRadius * Math.sin(startAngle);

              const outerPath = `M ${x1Outer} ${y1Outer} A ${outerRadius} ${outerRadius} 0 0 1 ${x2Outer} ${y2Outer} L ${x1Mid} ${y1Mid} A ${middleRadius} ${middleRadius} 0 0 0 ${x2Mid} ${y2Mid} Z`;

              // Middle Ring Path (Minor Keys)
              const x1Inner = center + innerRadius * Math.cos(endAngle);
              const y1Inner = center + innerRadius * Math.sin(endAngle);
              const x2Inner = center + innerRadius * Math.cos(startAngle);
              const y2Inner = center + innerRadius * Math.sin(startAngle);

              const innerPath = `M ${x2Mid} ${y2Mid} A ${middleRadius} ${middleRadius} 0 0 1 ${x1Mid} ${y1Mid} L ${x1Inner} ${y1Inner} A ${innerRadius} ${innerRadius} 0 0 0 ${x2Inner} ${y2Inner} Z`;

              // Label positions
              const labelRadiusOuter = (outerRadius + middleRadius) / 2;
              const labelRadiusInner = (middleRadius + innerRadius) / 2;
              const lxOuter = center + labelRadiusOuter * Math.cos(midAngle);
              const lyOuter = center + labelRadiusOuter * Math.sin(midAngle);
              const lxInner = center + labelRadiusInner * Math.cos(midAngle);
              const lyInner = center + labelRadiusInner * Math.sin(midAngle);

              return (
                <g key={item.major} className="cursor-pointer group" onClick={() => handleSliceClick(item.major)}>
                  {/* Outer Sector (Major) */}
                  <path
                    d={outerPath}
                    className={`transition-all duration-200 stroke-slate-900 stroke-1 ${
                      isSelected
                        ? 'fill-rose-600/90 hover:fill-rose-500'
                        : harmonic
                        ? `${harmonic.color} opacity-85 hover:opacity-100`
                        : 'fill-slate-800/80 hover:fill-slate-700'
                    }`}
                  />

                  {/* Inner Sector (Relative Minor) */}
                  <path
                    d={innerPath}
                    className={`transition-all duration-200 stroke-slate-900 stroke-1 ${
                      isSelected
                        ? 'fill-rose-950/80 hover:fill-rose-900'
                        : harmonic
                        ? 'fill-slate-900/90 hover:fill-slate-800'
                        : 'fill-slate-900/70 hover:fill-slate-800'
                    }`}
                  />

                  {/* Major Text */}
                  <text
                    x={lxOuter}
                    y={lyOuter}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className={`text-[13px] font-bold pointer-events-none transition-all ${
                      isSelected ? 'fill-white font-extrabold text-[15px]' : 'fill-slate-100 group-hover:fill-white'
                    }`}
                  >
                    {item.major}
                  </text>

                  {/* Minor Text */}
                  <text
                    x={lxInner}
                    y={lyInner}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="text-[10px] font-medium fill-slate-300 pointer-events-none group-hover:fill-white"
                  >
                    {item.minor}m
                  </text>
                </g>
              );
            })}

            {/* Center Circle Hub */}
            <circle cx={center} cy={center} r={innerRadius - 4} className="fill-slate-900 stroke-indigo-500/40" strokeWidth="2" />
            <text x={center} y={center - 12} textAnchor="middle" className="fill-indigo-300 text-[11px] font-semibold">
              KEY CENTER
            </text>
            <text x={center} y={center + 8} textAnchor="middle" className="fill-white font-black text-[18px]">
              {selectedKey.major}
            </text>
            <text x={center} y={center + 24} textAnchor="middle" className="fill-slate-400 text-[9px] font-mono">
              {selectedKey.keySignature}
            </text>
          </svg>
        </div>

        {/* Harmonic Relationship Inspector */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Harmonic Family for {selectedKey.major} Major
            </h4>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-rose-950/50 border border-rose-800/60 text-center">
                <span className="text-[10px] text-rose-400 block font-mono">Tonic (I)</span>
                <span className="font-bold text-white text-sm">{selectedKey.major}</span>
              </div>
              <div className="p-2 rounded-lg bg-emerald-950/50 border border-emerald-800/60 text-center">
                <span className="text-[10px] text-emerald-400 block font-mono">Subdominant (IV)</span>
                <span className="font-bold text-white text-sm">
                  {CIRCLE_OF_FIFTHS[(currentKeyIndex + 11) % 12]?.major}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-sky-950/50 border border-sky-800/60 text-center">
                <span className="text-[10px] text-sky-400 block font-mono">Dominant (V)</span>
                <span className="font-bold text-white text-sm">
                  {CIRCLE_OF_FIFTHS[(currentKeyIndex + 1) % 12]?.major}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-purple-950/50 border border-purple-800/60 text-center">
                <span className="text-[10px] text-purple-400 block font-mono">Rel. Minor (vi)</span>
                <span className="font-bold text-white text-sm">{selectedKey.minor}m</span>
              </div>
              <div className="p-2 rounded-lg bg-amber-950/50 border border-amber-800/60 text-center">
                <span className="text-[10px] text-amber-400 block font-mono">Supertonic (ii)</span>
                <span className="font-bold text-white text-sm">
                  {CIRCLE_OF_FIFTHS[(currentKeyIndex + 2) % 12]?.minor}m
                </span>
              </div>
              <div className="p-2 rounded-lg bg-indigo-950/50 border border-indigo-800/60 text-center">
                <span className="text-[10px] text-indigo-400 block font-mono">Mediant (iii)</span>
                <span className="font-bold text-white text-sm">
                  {CIRCLE_OF_FIFTHS[(currentKeyIndex + 4) % 12]?.minor}m
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/40 text-xs text-slate-300">
            <p className="leading-relaxed">
              <strong className="text-indigo-400">Theory Note:</strong> Adjacent keys on the Circle of Fifths share 6 of their 7 notes. Moving clockwise adds one sharp (dominant modulation); moving counter-clockwise adds one flat (subdominant modulation).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
