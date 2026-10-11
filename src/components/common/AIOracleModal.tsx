import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  BrainCircuit,
  MessageSquare,
  HelpCircle,
  Lightbulb,
  Send,
  Loader2,
  X,
  Compass,
  Palette,
  MoveRight,
  Flame,
} from 'lucide-react';
import { sounds } from '../../utils/audio';

interface AIOracleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGame?: string;
  currentLevel?: number;
}

export const AIOracleModal: React.FC<AIOracleModalProps> = ({
  isOpen,
  onClose,
  currentGame = 'TreasureVerse',
  currentLevel = 1,
}) => {
  const [activeTab, setActiveTab] = useState<'how-it-works' | 'ask-oracle' | 'generate-riddle'>('how-it-works');
  
  // Chat state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'oracle'; text: string; time: string }>>([
    {
      sender: 'oracle',
      text: `Greetings, adventurer! I am the Gemini AI Oracle of the TreasureVerse. I power your hints, craft unique world riddles, and analyze puzzles. How may I guide your quest today?`,
      time: 'Just now',
    },
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Dynamic riddle generator state
  const [riddleTheme, setRiddleTheme] = useState('Lost Desert & Ancient Pyramids');
  const [generatedRiddle, setGeneratedRiddle] = useState<{
    riddle: string;
    options: string[];
    answer: string;
    explanation: string;
  } | null>(null);
  const [isRiddleLoading, setIsRiddleLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    sounds.playClick();
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [
      ...prev,
      { sender: 'user', text: userMsg, time: 'Just now' },
    ]);

    setIsChatLoading(true);
    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          gameContext: {
            currentGame,
            currentLevel,
            objective: `Guide the player through ${currentGame} Level ${currentLevel}`,
          },
        }),
      });
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'oracle',
          text: data.reply || 'The Oracle perceives your quest: keep observing the ancient patterns!',
          time: 'Just now',
        },
      ]);
      sounds.playGemCollect();
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'oracle',
          text: 'The celestial stars whisper: Trust your instincts, adventurer. Search for the clearest path!',
          time: 'Just now',
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleGenerateRiddle = async () => {
    sounds.playClick();
    setIsRiddleLoading(true);
    try {
      const res = await fetch('/api/gemini/riddle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worldTheme: riddleTheme,
          difficulty: 'medium',
        }),
      });
      const data = await res.json();
      setGeneratedRiddle(data);
      sounds.playGemCollect();
    } catch {
      setGeneratedRiddle({
        riddle: 'I fly without wings, I cry without eyes. Whenever I lead, darkness flies. What am I?',
        options: ['A Cloud', 'A Shadow', 'The Wind', 'A Dream'],
        answer: 'A Cloud',
        explanation: 'Clouds drift across skies and shed rain droplets.',
      });
    } finally {
      setIsRiddleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border-2 border-indigo-500/40 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
        
        {/* Top Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-amber-500 p-0.5 flex items-center justify-center shadow-lg">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-fantasy text-lg font-bold text-white tracking-wide">
                  Gemini AI Oracle
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                  gemini-3.8-flash
                </span>
              </div>
              <p className="text-xs text-slate-400">
                AI Intelligence & Quest Assistant in TreasureVerse
              </p>
            </div>
          </div>

          <button
            onClick={() => { sounds.playClick(); onClose(); }}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-800 bg-slate-900/60">
          <button
            onClick={() => setActiveTab('how-it-works')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'how-it-works'
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>How AI Works in this Game</span>
          </button>

          <button
            onClick={() => setActiveTab('ask-oracle')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'ask-oracle'
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Ask the AI Oracle</span>
          </button>

          <button
            onClick={() => setActiveTab('generate-riddle')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'generate-riddle'
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate AI Riddle</span>
          </button>
        </div>

        {/* Tab 1: How AI Works in TreasureVerse */}
        {activeTab === 'how-it-works' && (
          <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300">
            <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-2xl p-4">
              <h4 className="font-bold text-sm text-indigo-300 mb-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                How Google Gemini Powers TreasureVerse
              </h4>
              <p className="leading-relaxed text-slate-300">
                TreasureVerse uses the official <strong>@google/genai</strong> TypeScript SDK connected directly to Google’s <strong>gemini-3.8-flash</strong> model via secure server endpoints. Gemini operates as your intelligent Game Master across all three games:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Feature 1 */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-base font-bold">
                  🧭
                </div>
                <h5 className="font-bold text-white text-xs">1. Treasure Hunt AI</h5>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Gemini analyzes your current quest world, reads your progress, and generates context-aware 3-tier clues and dynamic riddles.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-base font-bold">
                  🎨
                </div>
                <h5 className="font-bold text-white text-xs">2. Real Photo AI Insights</h5>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Gemini generates real-world geographical lore, photographic history, and spatial puzzle hints for each real-life photograph.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-base font-bold">
                  🏹
                </div>
                <h5 className="font-bold text-white text-xs">3. Arrow Path AI</h5>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Gemini evaluates directional bottlenecks and illuminates safe escape routes across complex silhouette shapes.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="font-bold text-amber-300 text-xs block mb-1">
                3-Tier Progressive Hint System
              </span>
              <ul className="space-y-1.5 text-[11px] text-slate-400">
                <li>• <strong className="text-slate-200">Tier 1 (Subtle):</strong> A poetic directional nudge that triggers creative thinking without spoiling the answer.</li>
                <li>• <strong className="text-slate-200">Tier 2 (Specific):</strong> Highlights the key patterns and mechanics to look at on your board.</li>
                <li>• <strong className="text-slate-200">Tier 3 (Revelation):</strong> Step-by-step complete breakdown of how to solve the challenge.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 2: Ask the AI Oracle */}
        {activeTab === 'ask-oracle' && (
          <div className="flex-1 flex flex-col min-h-[380px] p-4">
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-3 max-h-[290px]">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.time}</span>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex items-center gap-2 text-indigo-400 text-xs py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Gemini Oracle is consulting the stars...</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask Oracle: 'How do I solve this quest?' or 'Give me a hint'..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={isChatLoading || !chatInput.trim()}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Generate Live AI Riddle */}
        {activeTab === 'generate-riddle' && (
          <div className="p-6 overflow-y-auto space-y-4">
            <div className="text-xs text-slate-300">
              Test Gemini’s dynamic creative power! Select a fantasy theme and ask Gemini to write a fresh, never-before-seen adventure riddle on the fly.
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={riddleTheme}
                onChange={(e) => setRiddleTheme(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              >
                <option value="Lost Desert & Ancient Pyramids">Lost Desert & Pyramids</option>
                <option value="Enchanted Forest & Whispering Trees">Enchanted Forest & Trees</option>
                <option value="Deep Crystal Caves & Gemstones">Deep Crystal Caves</option>
                <option value="Pirate Galleons & Ocean Islands">Pirate Islands & Galleons</option>
                <option value="Frozen Ice Palace & Aurora">Frozen Kingdom & Aurora</option>
                <option value="Cosmic Starlight & Galaxies">Starlight Galaxy</option>
              </select>

              <button
                onClick={handleGenerateRiddle}
                disabled={isRiddleLoading}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isRiddleLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Gemini Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI Riddle</span>
                  </>
                )}
              </button>
            </div>

            {generatedRiddle && (
              <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/30 animate-fade-in space-y-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 block">
                  AI Generated Riddle:
                </span>
                <p className="text-sm font-semibold text-white italic">
                  "{generatedRiddle.riddle}"
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  {generatedRiddle.options.map((opt, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-xl border text-xs font-semibold ${
                        opt.toLowerCase() === generatedRiddle.answer.toLowerCase()
                          ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      {opt} {opt.toLowerCase() === generatedRiddle.answer.toLowerCase() && '✓'}
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-slate-400 pt-1">
                  💡 <strong>Explanation:</strong> {generatedRiddle.explanation}
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
