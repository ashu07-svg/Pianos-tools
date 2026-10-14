import React, { useState, useRef, useEffect } from 'react';
import { NoteName, SCALES, CHORDS } from '../utils/musicTheory';
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Sparkles,
  Zap,
  BrainCircuit,
  GraduationCap,
  Music,
  RotateCcw,
  Copy,
  Check,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  modelUsed?: string;
  timestamp: Date;
}

interface ChatTutorProps {
  currentRoot: NoteName;
  currentScaleId: string;
  currentChordId: string;
  onApplyScaleToStudio: (scaleId: string) => void;
  onApplyChordToStudio: (chordId: string) => void;
  externalPrompt?: string | null;
  onClearExternalPrompt?: () => void;
}

export const ChatTutor: React.FC<ChatTutorProps> = ({
  currentRoot,
  currentScaleId,
  currentChordId,
  onApplyScaleToStudio,
  onApplyChordToStudio,
  externalPrompt,
  onClearExternalPrompt,
}) => {
  // Roles with system instructions
  const ROLES = [
    {
      id: 'prof_harmonia',
      name: 'Prof. Harmonia',
      badge: 'Academic Theory',
      icon: GraduationCap,
      description: 'Jazz Harmony & Classical Counterpoint Scholar',
      systemInstruction:
        'You are Professor Harmonia, a distinguished music theorist and harmony professor. You explain music theory with clarity, deep historical context, and pedagogical rigor. When analyzing chords and scales, reference intervals, Roman numeral analysis, voice leading, and functional harmony. Use clear formatting with bullet points and bold chord names like [Cmaj7] or [D Dorian]. Keep answers concise yet thorough.',
    },
    {
      id: 'maestro_neo',
      name: 'Maestro Neo',
      badge: 'Modern Producer',
      icon: Music,
      description: 'Songwriter, Neo-Soul & Pop Arrangement Specialist',
      systemInstruction:
        'You are Maestro Neo, a top platinum record producer and keyboardist specializing in Neo-Soul, R&B, Lo-Fi, and modern pop arrangements. You focus on chord substitutions (secondary dominants, tritone subs, modal interchange), tension & release, lush voicings (9ths, 11ths, 13ths), and songwriting emotion. Use upbeat, encouraging creative tone.',
    },
    {
      id: 'virtuoso_guitar',
      name: 'Virtuoso Guitar',
      badge: 'Fretboard Master',
      icon: Zap,
      description: 'Guitarist specializing in CAGED & Modal Soloing',
      systemInstruction:
        'You are Virtuoso Guitar, an elite guitar instructor. You focus on fretboard geometry, CAGED shapes, 3-notes-per-string patterns, voice-leading through arpeggios, and picking techniques over modal vamps. Reference string numbers and fret regions when helpful.',
    },
    {
      id: 'drill_tutor',
      name: 'Drill Tutor',
      badge: 'Speed Trainer',
      icon: BrainCircuit,
      description: 'Fast explanations and ear training quizzes',
      systemInstruction:
        'You are Drill Tutor, a fast-paced interactive theory trainer. Provide direct, razor-sharp answers, quick mnemonic tricks, and test the user with a follow-up 1-question quiz to reinforce their knowledge.',
    },
  ];

  const [selectedRole, setSelectedRole] = useState<string>('prof_harmonia');
  // Model options per prompt: gemini-3.8-flash (general tasks), gemini-4-argon (complex), gemini-3.1-flash-lite (fast)
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash');
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Initial greeting
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'model',
      content: `Greetings! I am **Prof. Harmonia**, your interactive music theory mentor. I can analyze harmonic progressions, explain modal interchange, decode complex chords, or suggest improvisational scales.

Currently active in your studio: **${currentRoot} ${SCALES.find((s) => s.id === currentScaleId)?.name}** and **${currentRoot}${CHORDS.find((c) => c.id === currentChordId)?.symbol}**.

What musical concept would you like to explore today?`,
      modelUsed: 'gemini-3.8-flash',
      timestamp: new Date(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle external prompts sent from other studio components
  useEffect(() => {
    if (externalPrompt) {
      handleSendMessage(externalPrompt);
      if (onClearExternalPrompt) onClearExternalPrompt();
    }
  }, [externalPrompt]);

  const currentRoleObj = ROLES.find((r) => r.id === selectedRole) || ROLES[0];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Map history for server API
      const payloadMessages = newHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          systemInstruction: currentRoleObj.systemInstruction,
          model: selectedModel,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Server error occurred during chat.');
      }

      const modelMsg: ChatMessage = {
        id: `${Date.now()}-model`,
        role: 'model',
        content: data.reply || 'No response generated.',
        modelUsed: data.model || selectedModel,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `${Date.now()}-error`,
        role: 'model',
        content: `⚠️ **Error communicating with Gemini**: ${err.message || 'Please check your connection and API key configuration.'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Quick suggestions chips
  const SUGGESTIONS = [
    `How does the tritone substitution work in ${currentRoot} major?`,
    `What scales work best for soloing over a ${currentRoot}7#9 chord?`,
    `Explain the modal difference between ${currentRoot} Dorian and Aeolian.`,
    `Suggest a 4-chord neo-soul progression starting on ${currentRoot}maj9.`,
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[650px] shadow-2xl overflow-hidden">
      {/* Chat Header & Persona Selector */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base">Gemini Music Theory Tutor</h3>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Multi-Turn
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive conversation with AI specialized in musical harmony and composition.
            </p>
          </div>
        </div>

        {/* Controls: Persona & Model Selection */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Persona selector */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
            {ROLES.map((r) => {
              const Icon = r.icon;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRole(r.id)}
                  title={r.description}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium transition cursor-pointer ${
                    selectedRole === r.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{r.name}</span>
                </button>
              );
            })}
          </div>

          {/* Model Selector Affordance: gemini-3.8-flash, gemini-4-argon, gemini-3.1-flash-lite */}
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
            title="Switch model based on task complexity"
          >
            <option value="gemini-3.8-flash">gemini-3.8-flash (General Tasks)</option>
            <option value="gemini-4-argon">gemini-4-argon (Complex Analysis)</option>
            <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast Tasks)</option>
          </select>
        </div>
      </div>

      {/* Messages Scrollable Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/60">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[88%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold shadow-md ${
                  isUser
                    ? 'bg-indigo-600'
                    : 'bg-gradient-to-tr from-violet-600 to-indigo-600'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`rounded-2xl p-3.5 text-xs md:text-sm leading-relaxed relative group ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-900/30'
                    : 'bg-slate-800/90 text-slate-100 border border-slate-700/70 rounded-tl-none shadow-sm'
                }`}
              >
                {/* Header row in model bubble */}
                {!isUser && (
                  <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-slate-700/50 text-[10px] text-slate-400 font-mono">
                    <span className="font-semibold text-indigo-300">
                      {currentRoleObj.name}
                    </span>
                    {msg.modelUsed && (
                      <span className="bg-slate-900/70 px-1.5 py-0.5 rounded text-[9px] text-slate-400">
                        {msg.modelUsed}
                      </span>
                    )}
                  </div>
                )}

                {/* Content with basic markdown formatting */}
                <div className="space-y-2 whitespace-pre-wrap font-sans">
                  {msg.content.split('\n\n').map((paragraph, pIdx) => (
                    <p key={pIdx} className="leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Action button: Copy */}
                {!isUser && (
                  <div className="mt-2.5 pt-1.5 border-t border-slate-700/50 flex items-center justify-end">
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition cursor-pointer"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 max-w-[80%]">
            <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white flex-shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-800/90 border border-slate-700/70 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-slate-400 font-mono text-[11px]">
                {selectedModel} is reasoning...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
        <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" /> Ideas:
        </span>
        {SUGGESTIONS.map((sugg, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(sugg)}
            disabled={isLoading}
            className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 whitespace-nowrap transition cursor-pointer disabled:opacity-50"
          >
            {sugg}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
        <div className="flex items-end gap-2 bg-slate-900 border border-slate-700/80 rounded-xl p-2 focus-within:ring-2 focus-within:ring-indigo-500/50 transition">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask ${currentRoleObj.name} anything about chords, scales, or harmony... (Press Enter to send)`}
            rows={2}
            className="flex-1 bg-transparent text-slate-100 text-xs md:text-sm resize-none outline-none placeholder-slate-500"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isLoading}
            className="p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white shadow-md transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
