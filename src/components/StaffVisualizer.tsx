import React from 'react';
import { NoteName, noteToSemitone } from '../utils/musicTheory';
import { soundEngine, InstrumentType } from '../utils/audioSynth';
import { Music, Play } from 'lucide-react';

interface StaffVisualizerProps {
  rootNote: NoteName;
  activeNotes: { note: NoteName; degree: string; interval: number }[];
  mode: 'scale' | 'chord';
  instrument: InstrumentType;
  title?: string;
}

export const StaffVisualizer: React.FC<StaffVisualizerProps> = ({
  rootNote,
  activeNotes,
  mode,
  instrument,
  title,
}) => {
  // Treble staff lines: E4 (bottom line), G4, B4, D5, F5 (top line)
  // Diatonic positions relative to Treble staff:
  // F5 = line 5 (y = 40)
  // E5 = space 4 (y = 48)
  // D5 = line 4 (y = 56)
  // C5 = space 3 (y = 64)
  // B4 = line 3 (y = 72)
  // A4 = space 2 (y = 80)
  // G4 = line 2 (y = 88)
  // F4 = space 1 (y = 96)
  // E4 = line 1 (y = 104)
  // D4 = space below (y = 112)
  // C4 = Middle C ledger line (y = 120)

  // Diatonic pitch index from C0:
  // C=0, D=1, E=2, F=3, G=4, A=5, B=6
  const diatonicLetterMap: Record<string, number> = {
    C: 0,
    D: 1,
    E: 2,
    F: 3,
    G: 4,
    A: 5,
    B: 6,
  };

  // Convert note and base octave to treble staff Y coordinate
  const getStaffY = (noteStr: string, octave: number) => {
    const baseLetter = noteStr.charAt(0).toUpperCase();
    const diatonicStep = diatonicLetterMap[baseLetter] ?? 0;
    // Total steps from C4 (Middle C)
    const totalStepsFromC4 = (octave - 4) * 7 + diatonicStep;
    // C4 is at Y = 120; each diatonic step goes UP by 8px
    return 120 - totalStepsFromC4 * 8;
  };

  const handlePlayNote = (note: string, octave: number) => {
    soundEngine.playNote(note, octave, 1.2, instrument, 0.85);
  };

  // Prepare notes to display
  // For scales, display ascending notes across 1-2 octaves
  const notesOnStaff = activeNotes.map((an) => {
    const oct = 4 + Math.floor(an.interval / 12);
    const y = getStaffY(an.note, oct);
    const hasAccidental = an.note.includes('#') ? '#' : an.note.includes('b') ? 'b' : null;
    const isLedgerLine = y >= 120 || y <= 32; // middle C or high notes
    return {
      note: an.note,
      degree: an.degree,
      octave: oct,
      y,
      hasAccidental,
      isMiddleC: y === 120,
      isHighA: y === 24,
    };
  });

  const staffWidth = Math.max(500, notesOnStaff.length * 60 + 120);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-slate-100 text-base md:text-lg">
              {title || 'Musical Staff Notation (Treble Clef)'}
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real standard music notation with accidental markings and ledger lines. Click note heads to audition.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto pb-2 select-none">
        <div className="flex justify-center min-w-max">
          <svg
            viewBox={`0 0 ${staffWidth} 170`}
            className="w-full max-w-[800px] h-44 bg-slate-950/70 rounded-xl border border-slate-800/80"
          >
            {/* 5 Staff Lines: 40, 56, 72, 88, 104 */}
            {[40, 56, 72, 88, 104].map((lineY, idx) => (
              <line
                key={idx}
                x1="20"
                y1={lineY}
                x2={staffWidth - 20}
                y2={lineY}
                stroke="#475569"
                strokeWidth="1.5"
              />
            ))}

            {/* Treble Clef Graphic (Stylized G-Clef) */}
            <g transform="translate(30, 26) scale(0.65)">
              <path
                d="M18,92 C14,84 12,74 15,64 C19,50 31,40 37,28 C42,18 40,8 33,6 C26,4 20,11 20,20 C20,38 38,48 42,66 C44,76 38,87 28,90 C18,93 8,86 6,76 C4,64 12,52 24,50"
                fill="none"
                stroke="#818cf8"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <line x1="28" y1="2" x2="28" y2="135" stroke="#818cf8" strokeWidth="3" />
              <circle cx="23" cy="135" r="5" fill="#818cf8" />
            </g>

            {/* Time / Mode Signature Indicator */}
            <g transform="translate(75, 45)">
              <text x="0" y="24" className="fill-slate-400 font-serif text-[24px] font-bold">
                4
              </text>
              <text x="0" y="56" className="fill-slate-400 font-serif text-[24px] font-bold">
                4
              </text>
            </g>

            {/* Note items */}
            {notesOnStaff.map((item, idx) => {
              const x = 120 + idx * 56;
              const isRoot = idx === 0;

              return (
                <g
                  key={idx}
                  className="cursor-pointer group"
                  onClick={() => handlePlayNote(item.note, item.octave)}
                >
                  {/* Ledger line for Middle C (y = 120) */}
                  {item.isMiddleC && (
                    <line
                      x1={x - 14}
                      y1={120}
                      x2={x + 14}
                      y2={120}
                      stroke="#94a3b8"
                      strokeWidth="2"
                    />
                  )}

                  {/* Accidental (# or b) */}
                  {item.hasAccidental === '#' && (
                    <text
                      x={x - 16}
                      y={item.y + 5}
                      className="fill-amber-400 text-[18px] font-bold font-serif select-none"
                    >
                      ♯
                    </text>
                  )}
                  {item.hasAccidental === 'b' && (
                    <text
                      x={x - 16}
                      y={item.y + 4}
                      className="fill-amber-400 text-[18px] font-bold font-serif select-none"
                    >
                      ♭
                    </text>
                  )}

                  {/* Note Head (Rotated Ellipse) */}
                  <ellipse
                    cx={x}
                    cy={item.y}
                    rx="8.5"
                    ry="6.5"
                    transform={`rotate(-20 ${x} ${item.y})`}
                    className={`transition-all duration-150 ${
                      isRoot
                        ? 'fill-rose-500 group-hover:fill-rose-400'
                        : 'fill-indigo-400 group-hover:fill-indigo-300'
                    }`}
                  />

                  {/* Note Stem (Upward or downward) */}
                  {item.y >= 72 ? (
                    // Stem points up on right
                    <line
                      x1={x + 7.5}
                      y1={item.y}
                      x2={x + 7.5}
                      y2={item.y - 38}
                      stroke="#cbd5e1"
                      strokeWidth="1.8"
                    />
                  ) : (
                    // Stem points down on left
                    <line
                      x1={x - 7.5}
                      y1={item.y}
                      x2={x - 7.5}
                      y2={item.y + 38}
                      stroke="#cbd5e1"
                      strokeWidth="1.8"
                    />
                  )}

                  {/* Degree Badge below staff */}
                  <rect
                    x={x - 12}
                    y={136}
                    width="24"
                    height="18"
                    rx="4"
                    className={`${isRoot ? 'fill-rose-600' : 'fill-slate-800'}`}
                  />
                  <text
                    x={x}
                    y={149}
                    textAnchor="middle"
                    className="fill-white text-[10px] font-bold font-mono"
                  >
                    {item.degree}
                  </text>

                  {/* Note Name below degree */}
                  <text
                    x={x}
                    y={166}
                    textAnchor="middle"
                    className="fill-slate-400 text-[9px] font-mono group-hover:fill-white"
                  >
                    {item.note}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};
