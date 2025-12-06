import React, { useState, useRef } from 'react';
import { generateEntomancerWorld } from './services/geminiService';
import { WorldData, Faction } from './types';
import FantasyMap from './components/FantasyMap';
import LoreBook from './components/LoreBook';
import { Upload, Mic, Play, Loader2, Leaf, AlertTriangle, RefreshCw, Image as ImageIcon, X, ArrowRight, Sparkles } from 'lucide-react';

export default function App() {
  const [worldData, setWorldData] = useState<WorldData | null>(null);
  const [selectedFaction, setSelectedFaction] = useState<Faction | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [userPrompt, setUserPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };
  
  const resetApp = () => {
    setWorldData(null);
    setImageFile(null);
    setAudioFile(null);
    setUserPrompt('');
    setError(null);
  };

  const generateWorld = async () => {
    if (!imageFile) {
      setError("A visual specimen (photo) is required for analysis.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const data = await generateEntomancerWorld(imageFile, audioFile || undefined, userPrompt);
      setWorldData(data);
      if (data.factions.length > 0) {
        setSelectedFaction(data.factions[0]);
      }
    } catch (err) {
      setError("The scrying ritual failed. Ensure your API key is valid and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const FileChip = ({ file, type, onRemove }: { file: File, type: 'image' | 'audio', onRemove: () => void }) => (
    <div className="flex items-center space-x-2 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-full px-3 py-1 text-xs text-[#d4af37] animate-fade-in">
      {type === 'image' ? <ImageIcon size={12} /> : <Mic size={12} />}
      <span className="max-w-[100px] truncate">{file.name}</span>
      <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="hover:text-white">
        <X size={12} />
      </button>
    </div>
  );

  return (
    <div className="h-screen w-screen bg-[#0a0f0d] text-[#e0e7e3] flex flex-col overflow-hidden font-inter selection:bg-[#d4af37] selection:text-black">
      
      {/* Header */}
      <header className="h-16 border-b border-[#d4af37]/30 flex items-center justify-between px-6 bg-black/50 backdrop-blur-sm relative z-20">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={resetApp}>
          <Leaf className="text-[#50c878]" />
          <div>
            <h1 className="text-xl font-cinzel text-[#d4af37] font-bold tracking-wider">Entomancer's Atlas</h1>
            <p className="text-[10px] text-gray-400 tracking-widest uppercase hidden sm:block">Ecosystem Analysis & Projection Engine</p>
          </div>
        </div>
        
        {/* Header Controls - Only visible when world exists */}
        {worldData && (
            <div className="flex items-center space-x-4 animate-fade-in">
               <button 
                onClick={resetApp}
                className="flex items-center space-x-2 bg-white/5 text-[#d4af37] px-3 py-1.5 rounded border border-white/10 hover:border-[#d4af37] hover:bg-white/10 transition-all"
               >
                 <RefreshCw size={14} />
                 <span className="text-xs font-cinzel">New Analysis</span>
               </button>
            </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {error && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-900/90 text-white px-6 py-3 rounded-xl border border-red-500 flex items-center shadow-lg animate-bounce-in font-cinzel text-sm">
            <AlertTriangle className="mr-2" size={16} /> {error}
          </div>
        )}

        {/* Loading Overlay */}
        {isAnalyzing && (
            <div className="absolute inset-0 z-40 bg-black/90 flex flex-col items-center justify-center font-cinzel text-[#d4af37]">
                <div className="relative">
                    <div className="w-24 h-24 border-t-4 border-b-4 border-[#d4af37] rounded-full animate-spin"></div>
                    <div className="w-16 h-16 border-l-4 border-r-4 border-[#50c878] rounded-full animate-spin absolute top-4 left-4 direction-reverse"></div>
                </div>
                <p className="animate-pulse text-2xl mt-8 tracking-widest">Consulting the Grimoire</p>
                <p className="text-sm text-[#50c878] mt-2 font-mono">Identifying species signatures...</p>
            </div>
        )}

        {worldData ? (
          <>
            {/* Left Panel: Map */}
            <div className="w-full md:w-3/5 p-4 flex flex-col h-full">
              <div className="flex-1 relative h-full">
                <FantasyMap 
                  factions={worldData.factions} 
                  onFactionSelect={setSelectedFaction}
                  selectedFactionId={selectedFaction?.id}
                />
              </div>
            </div>

            {/* Right Panel: Lore & Story */}
            <div className="hidden md:block w-2/5 p-4 pl-0 h-full">
              <LoreBook 
                selectedFaction={selectedFaction}
                story={worldData.story}
              />
            </div>
          </>
        ) : (
          /* Empty State - Central Compact Bar */
          <div className="flex-1 flex flex-col items-center justify-center p-4 relative w-full">
             {/* Background Effects */}
             <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-[#50c878]/10 via-[#d4af37]/5 to-[#50c878]/10 rounded-full blur-[120px]"></div>
             </div>

             <div className="z-10 w-full max-w-2xl flex flex-col items-center">
                 <div className="mb-8 text-center">
                    <h2 className="text-4xl md:text-5xl font-cinzel font-bold text-[#d4af37] mb-2 text-shadow-gold">Begin the Analysis</h2>
                    <p className="text-gray-400 font-serif italic">Upload a visual specimen to reveal the hidden empire.</p>
                 </div>

                 {/* Compact Input Bar Container */}
                 <div className="w-full relative">
                    {/* File Chips Area */}
                    {(imageFile || audioFile) && (
                        <div className="absolute -top-10 left-0 flex space-x-2 px-2">
                            {imageFile && <FileChip file={imageFile} type="image" onRemove={() => setImageFile(null)} />}
                            {audioFile && <FileChip file={audioFile} type="audio" onRemove={() => setAudioFile(null)} />}
                        </div>
                    )}

                    {/* The Omni-Bar */}
                    <div className="w-full flex items-center bg-black/60 border border-[#d4af37]/40 rounded-full p-2 pl-4 shadow-[0_0_30px_rgba(212,175,55,0.1)] backdrop-blur-xl transition-all duration-300 focus-within:shadow-[0_0_40px_rgba(212,175,55,0.25)] focus-within:border-[#d4af37]">
                        
                        {/* Attach Buttons */}
                        <div className="flex items-center space-x-1 pr-3 border-r border-[#d4af37]/20 mr-3">
                             <input type="file" accept="image/*" ref={imageInputRef} className="hidden" onChange={handleImageUpload} />
                             <input type="file" accept="audio/*" ref={audioInputRef} className="hidden" onChange={handleAudioUpload} />
                             
                             <button 
                                onClick={() => imageInputRef.current?.click()}
                                className={`p-2 rounded-full transition-colors ${imageFile ? 'text-[#50c878] bg-[#50c878]/10' : 'text-gray-400 hover:text-[#d4af37] hover:bg-[#d4af37]/10'}`}
                                title="Upload Visual Specimen"
                             >
                                <ImageIcon size={20} />
                             </button>
                             <button 
                                onClick={() => audioInputRef.current?.click()}
                                className={`p-2 rounded-full transition-colors ${audioFile ? 'text-[#50c878] bg-[#50c878]/10' : 'text-gray-400 hover:text-[#d4af37] hover:bg-[#d4af37]/10'}`}
                                title="Upload Audio Ambience"
                             >
                                <Mic size={20} />
                             </button>
                        </div>

                        {/* Text Input */}
                        <input 
                            type="text" 
                            value={userPrompt}
                            onChange={(e) => setUserPrompt(e.target.value)}
                            placeholder={imageFile ? "Add context about this location (optional)..." : "Upload an image to start..."}
                            className="flex-1 bg-transparent border-none outline-none text-[#e0e7e3] placeholder-gray-500 font-inter text-sm"
                            onKeyDown={(e) => e.key === 'Enter' && generateWorld()}
                        />

                        {/* Generate Button */}
                        <button 
                            onClick={generateWorld}
                            disabled={isAnalyzing || !imageFile}
                            className={`
                                ml-2 p-3 rounded-full transition-all duration-300 flex items-center justify-center
                                ${!imageFile 
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                                    : 'bg-[#d4af37] text-black hover:bg-[#c5a028] shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:scale-105'
                                }
                            `}
                        >
                             {isAnalyzing ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} fill="black" />}
                        </button>
                    </div>
                 </div>
                 
                 <p className="text-center text-[10px] text-gray-600 font-mono mt-6 uppercase tracking-widest">
                    Powered by Gemini 2.5 Vision & Audio
                 </p>
             </div>
          </div>
        )}
      </main>

      {/* Footer: Conflict Ticker - Only show if data exists */}
      {worldData && worldData.conflicts.length > 0 && (
        <footer className="h-10 bg-black border-t border-[#d4af37]/30 flex items-center overflow-hidden relative z-20 shrink-0">
           <div className="px-4 bg-[#d4af37] text-black font-bold text-xs h-full flex items-center font-cinzel z-10 shrink-0">
              CONFLICT UPDATE
           </div>
           <div className="marquee-container flex-1 text-sm text-red-400 font-mono tracking-wide py-2">
              <div className="marquee-content">
                {worldData.conflicts.map((c, i) => (
                  <span key={i} className="mx-8 inline-flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
                    [{c.severity.toUpperCase()}] {c.description}
                  </span>
                ))}
              </div>
           </div>
        </footer>
      )}
    </div>
  );
}