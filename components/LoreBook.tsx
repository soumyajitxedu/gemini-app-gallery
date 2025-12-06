import React, { useState } from 'react';
import { Faction, StoryPage } from '../types';
import { BookOpen, ShieldAlert, Skull, Crown, Swords } from 'lucide-react';

interface LoreBookProps {
  selectedFaction: Faction | null;
  story: StoryPage[];
}

const LoreBook: React.FC<LoreBookProps> = ({ selectedFaction, story }) => {
  const [activeTab, setActiveTab] = useState<'lore' | 'story'>('lore');
  const [currentPage, setCurrentPage] = useState(0);

  const StatBar = ({ label, value, max = 10000 }: { label: string, value: number, max?: number }) => (
    <div className="mb-2">
      <div className="flex justify-between text-xs text-[#d4af37] mb-1 font-cinzel">
        <span>{label}</span>
        <span>{value.toLocaleString()}</span>
      </div>
      <div className="w-full bg-black/50 h-1.5 rounded-full">
        <div 
          className="h-full bg-[#50c878] rounded-full transition-all duration-1000" 
          style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col glass-panel rounded-lg overflow-hidden border border-[#d4af37]/30">
      {/* Tabs */}
      <div className="flex border-b border-[#d4af37]/30">
        <button
          onClick={() => setActiveTab('lore')}
          className={`flex-1 py-3 text-center font-cinzel transition-colors ${
            activeTab === 'lore' ? 'bg-[#d4af37]/10 text-[#d4af37]' : 'text-gray-500 hover:text-[#d4af37]'
          }`}
        >
          Faction Registry
        </button>
        <button
          onClick={() => setActiveTab('story')}
          className={`flex-1 py-3 text-center font-cinzel transition-colors ${
            activeTab === 'story' ? 'bg-[#d4af37]/10 text-[#d4af37]' : 'text-gray-500 hover:text-[#d4af37]'
          }`}
        >
          Chronicles
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        {activeTab === 'lore' ? (
          selectedFaction ? (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-[#d4af37]/20 pb-4">
                <h2 className="text-3xl text-[#d4af37] font-cinzel mb-1">{selectedFaction.factionName}</h2>
                <div className="flex items-center space-x-2 text-[#50c878] text-sm italic">
                  <Crown size={14} />
                  <span>Ruler: {selectedFaction.leader}</span>
                </div>
                <div className="text-gray-500 text-xs mt-1 uppercase tracking-widest">{selectedFaction.species}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 p-3 rounded border border-[#d4af37]/10">
                  <div className="text-[#d4af37] text-xs uppercase mb-1">Role</div>
                  <div className="text-white font-serif capitalize">{selectedFaction.role}</div>
                </div>
                <div className="bg-black/40 p-3 rounded border border-[#d4af37]/10">
                  <div className="text-[#d4af37] text-xs uppercase mb-1">Status</div>
                  <div className={`font-serif ${selectedFaction.diplomaticStatus === 'At War' ? 'text-red-400' : 'text-[#50c878]'}`}>
                    {selectedFaction.diplomaticStatus}
                  </div>
                </div>
              </div>

              <StatBar label="Estimated Population" value={selectedFaction.population} />

              <div>
                <h3 className="text-[#d4af37] font-cinzel text-lg mb-2">Culture & Customs</h3>
                <p className="text-gray-300 text-sm leading-relaxed font-serif border-l-2 border-[#50c878] pl-4 italic">
                  "{selectedFaction.culture}"
                </p>
              </div>

              <div>
                <h3 className="text-[#d4af37] font-cinzel text-lg mb-2">Strategic Resources</h3>
                 <div className="flex items-center space-x-2 text-sm text-gray-300">
                    <div className="w-2 h-2 bg-[#d4af37] rotate-45"></div>
                    <span>{selectedFaction.resource}</span>
                 </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
              <BookOpen size={48} className="mb-4 text-[#d4af37]" />
              <p className="font-cinzel">Select a faction from the map to view its records.</p>
            </div>
          )
        ) : (
          <div className="h-full flex flex-col">
            {story.length > 0 ? (
              <>
                 <div className="flex-1 parchment p-6 rounded text-[#2c1a0b] shadow-inner mb-4 overflow-y-auto">
                    <h3 className="font-cinzel text-2xl font-bold mb-4 text-center border-b border-[#2c1a0b]/20 pb-2">
                      Chapter {currentPage + 1}: {story[currentPage].title}
                    </h3>
                    
                    <div className="flex justify-center mb-6">
                      {story[currentPage].illustrationType === 'battle' && <Swords size={40} className="opacity-50" />}
                      {story[currentPage].illustrationType === 'diplomacy' && <Crown size={40} className="opacity-50" />}
                      {story[currentPage].illustrationType === 'discovery' && <BookOpen size={40} className="opacity-50" />}
                    </div>

                    <div className="font-serif leading-loose text-justify text-sm">
                      {story[currentPage].content}
                    </div>
                 </div>

                 <div className="flex justify-between items-center px-2">
                    <button 
                      disabled={currentPage === 0}
                      onClick={() => setCurrentPage(c => c - 1)}
                      className="text-[#d4af37] disabled:opacity-30 hover:text-white font-cinzel"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-gray-500">Page {currentPage + 1} of {story.length}</span>
                    <button 
                      disabled={currentPage === story.length - 1}
                      onClick={() => setCurrentPage(c => c + 1)}
                      className="text-[#d4af37] disabled:opacity-30 hover:text-white font-cinzel"
                    >
                      Next
                    </button>
                 </div>
              </>
            ) : (
              <div className="text-center mt-20 text-gray-500">
                <p>The chronicles have not yet been written.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoreBook;
