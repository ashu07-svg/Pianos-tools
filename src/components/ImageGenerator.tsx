import React, { useState } from 'react';
import { NoteName, SCALES, CHORDS } from '../utils/musicTheory';
import {
  Sparkles,
  Download,
  Image as ImageIcon,
  Maximize2,
  RefreshCw,
  Palette,
  Check,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface ImageGeneratorProps {
  currentRoot: NoteName;
  currentScaleId: string;
  currentChordId: string;
}

interface GeneratedImageItem {
  id: string;
  url: string;
  prompt: string;
  imageSize: '1K' | '2K' | '4K';
  aspectRatio: string;
  model: string;
  timestamp: Date;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({
  currentRoot,
  currentScaleId,
  currentChordId,
}) => {
  const currentScale = SCALES.find((s) => s.id === currentScaleId) || SCALES[0];
  const currentChord = CHORDS.find((c) => c.id === currentChordId) || CHORDS[0];

  // Affordance for the user to specify the image size (1K, 2K, and 4K)
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [prompt, setPrompt] = useState<string>(
    `A stunning vintage Bauhaus music theory poster visualizing the ${currentRoot} ${currentScale.name} scale and ${currentRoot}${currentChord.symbol} chord. Elegant geometric circles, clean typography, vibrant harmonic waves, pedagogical infographic.`
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [gallery, setGallery] = useState<GeneratedImageItem[]>([]);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<GeneratedImageItem | null>(null);

  const STYLES = [
    {
      name: 'Bauhaus Infographic',
      desc: 'Clean geometric layouts, swiss typography, bold primary colors',
      promptSuffix: 'Bauhaus modernism style, clean vector lines, high-contrast typography, educational diagram.',
    },
    {
      name: 'Cyberpunk Hologram',
      desc: 'Neon glowing frets, holographic soundwaves, deep synth aesthetic',
      promptSuffix: 'Futuristic cyberpunk HUD interface, glowing neon lasers, dark metallic background, octane render.',
    },
    {
      name: 'Classical Manuscript',
      desc: 'Aged parchment, gold-leaf calligraphy, baroque engraving',
      promptSuffix: 'Antique parchment manuscript, ornate copperplate engraving, J.S. Bach aesthetic, warm sepia tones.',
    },
    {
      name: 'Cymatics & Sacred Geometry',
      desc: 'Chladni plate patterns, sacred vibration resonance, harmonic nodes',
      promptSuffix: 'Cymatics water vibration frequency pattern, sacred geometry, acoustic wave nodes, mesmerizing symmetry.',
    },
  ];

  const handleApplyStyle = (style: typeof STYLES[0]) => {
    setPrompt(
      `Artistic music visualization of ${currentRoot} ${currentScale.name} and ${currentRoot}${currentChord.symbol} chord. ${style.promptSuffix}`
    );
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          imageSize, // 1K, 2K, or 4K
          aspectRatio,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image.');
      }

      const newItem: GeneratedImageItem = {
        id: `${Date.now()}`,
        url: data.imageUrl,
        prompt,
        imageSize: data.imageSize || imageSize,
        aspectRatio: data.aspectRatio || aspectRatio,
        model: data.model || 'gemini-3-pro-image-preview',
        timestamp: new Date(),
      };

      setGallery((prev) => [newItem, ...prev]);
      setSelectedPreviewImage(newItem);
    } catch (err: any) {
      console.error('Image generation failure:', err);
      setError(err?.message || 'Error communicating with Gemini Image model.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (item: GeneratedImageItem) => {
    const a = document.createElement('a');
    a.href = item.url;
    a.download = `harmoniq-${currentRoot}-${item.imageSize}-${item.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base md:text-lg">
                High-Resolution Music Theory Art & Infographic Generator
              </h3>
              <p className="text-xs text-slate-400">
                Powered by <code className="text-amber-400 font-mono">gemini-3-pro-image-preview</code>. Generate bespoke posters, blueprints, and diagrams.
              </p>
            </div>
          </div>
        </div>

        {/* Model Indicator Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          gemini-3-pro-image-preview
        </div>
      </div>

      {/* Configuration Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Prompt Input */}
        <div className="md:col-span-8 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">
              Visual Concept / Prompt:
            </label>
            <button
              onClick={() =>
                setPrompt(
                  `Infographic artwork of ${currentRoot} ${currentScale.name} scale and ${currentRoot}${currentChord.symbol} chord. Colorful frequency rings, harmonic spectrum, note degrees [${currentScale.degreeNames.join(', ')}], clean modern design.`
                )
              }
              className="text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Auto-fill from Current Studio State
            </button>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="Describe the music theory visualization, poster, or diagram..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs md:text-sm text-slate-100 placeholder-slate-500 outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
          />

          {/* Quick Style Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-400 font-medium">Styles:</span>
            {STYLES.map((st) => (
              <button
                key={st.name}
                onClick={() => handleApplyStyle(st)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
              >
                {st.name}
              </button>
            ))}
          </div>
        </div>

        {/* Resolution & Aspect Ratio Selectors */}
        <div className="md:col-span-4 space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
          {/* Explicit User Affordance: Image Size (1K, 2K, 4K) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-200">
                Resolution (Image Size):
              </label>
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">
                {imageSize} Definition
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(['1K', '2K', '4K'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setImageSize(size)}
                  className={`py-2 rounded-lg text-xs font-bold font-mono transition cursor-pointer flex flex-col items-center justify-center border ${
                    imageSize === size
                      ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-900/40 ring-1 ring-amber-400'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <span>{size}</span>
                  <span className="text-[9px] font-normal opacity-80">
                    {size === '1K' ? '1024px' : size === '2K' ? '2048px' : '4096px'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="text-xs font-semibold text-slate-200 block mb-1.5">
              Aspect Ratio:
            </label>
            <div className="grid grid-cols-5 gap-1 text-[11px] font-mono">
              {['1:1', '16:9', '4:3', '3:4', '9:16'].map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`py-1.5 rounded-md text-center transition cursor-pointer border ${
                    aspectRatio === ratio
                      ? 'bg-indigo-600 border-indigo-500 text-white font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 disabled:opacity-40 text-white font-bold text-xs shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Generating {imageSize}...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Generate {imageSize} Poster
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error alert if any */}
      {error && (
        <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Gallery Section */}
      {gallery.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-indigo-400" />
              Generated Artwork Gallery ({gallery.length})
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gallery.map((item) => (
              <div
                key={item.id}
                className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-lg group hover:border-slate-700 transition"
              >
                {/* Image Frame */}
                <div className="relative aspect-square bg-slate-900 overflow-hidden flex items-center justify-center">
                  <img
                    src={item.url}
                    alt={item.prompt}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => setSelectedPreviewImage(item)}
                      className="p-2 rounded-lg bg-slate-800/90 text-white hover:bg-slate-700 shadow-md transition cursor-pointer"
                      title="View Full Resolution"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(item)}
                      className="p-2 rounded-lg bg-amber-600 text-white hover:bg-amber-500 shadow-md transition cursor-pointer"
                      title="Download Image"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Resolution Badge */}
                  <span className="absolute top-2 right-2 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/70 text-amber-400 border border-amber-400/40 shadow">
                    {item.imageSize}
                  </span>
                </div>

                {/* Meta details */}
                <div className="p-3 space-y-1">
                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-snug">
                    {item.prompt}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                    <span>{item.aspectRatio}</span>
                    <span>{item.model}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPreviewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedPreviewImage(null)}
        >
          <div
            className="max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="font-mono text-amber-400 font-bold">
                Resolution: {selectedPreviewImage.imageSize} ({selectedPreviewImage.aspectRatio})
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(selectedPreviewImage)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
                <button
                  onClick={() => setSelectedPreviewImage(null)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="overflow-auto flex-1 flex items-center justify-center p-2 bg-slate-950">
              <img
                src={selectedPreviewImage.url}
                alt={selectedPreviewImage.prompt}
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
              />
            </div>

            <div className="p-3 border-t border-slate-800 text-xs text-slate-300">
              <p className="italic">{selectedPreviewImage.prompt}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
