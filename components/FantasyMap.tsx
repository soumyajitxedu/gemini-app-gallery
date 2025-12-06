import React, { useState } from 'react';
import { Faction } from '../types';

interface FantasyMapProps {
  factions: Faction[];
  onFactionSelect: (faction: Faction) => void;
  selectedFactionId?: string;
}

const FantasyMap: React.FC<FantasyMapProps> = ({ factions, onFactionSelect, selectedFactionId }) => {
  const [activeLayer, setActiveLayer] = useState<'Surface' | 'Subterranean' | 'Canopy'>('Surface');

  const visibleFactions = factions.filter(f => f.layer === activeLayer);

  const getPointsString = (coords: { x: number; y: number }[]) => {
    return coords.map(c => `${c.x},${c.y}`).join(' ');
  };

  const downloadMap = () => {
    const svg = document.getElementById('fantasy-map-svg');
    if (!svg) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const link = document.createElement('a');
    link.href = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);
    link.download = `entomancer_map_${activeLayer}.svg`;
    link.click();
  };

  return (
    <div className="relative w-full h-full bg-[#1a1510] border-4 border-[#d4af37] rounded-lg overflow-hidden shadow-2xl">
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/aged-paper.png")' }}></div>

      {/* Layer Controls */}
      <div className="absolute top-4 left-4 z-10 flex space-x-2">
        {['Canopy', 'Surface', 'Subterranean'].map((layer) => (
          <button
            key={layer}
            onClick={() => setActiveLayer(layer as any)}
            className={`px-4 py-1 text-sm font-cinzel border border-[#d4af37] transition-all duration-300 ${
              activeLayer === layer 
                ? 'bg-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.6)]' 
                : 'bg-black/80 text-[#d4af37] hover:bg-[#d4af37]/20'
            }`}
          >
            {layer}
          </button>
        ))}
      </div>

      <button 
        onClick={downloadMap}
        className="absolute top-4 right-4 z-10 p-2 bg-black/50 border border-[#50c878] text-[#50c878] text-xs hover:bg-[#50c878]/20"
      >
        Export Glyph
      </button>

      {/* The Map */}
      <svg id="fantasy-map-svg" viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          {/* Textures */}
          <pattern id="pattern-crosshatch" width="4" height="4" patternUnits="userSpaceOnUse">
             <path d="M0,4 l4,-4 M-1,1 l2,-2 M3,5 l2,-2" stroke="#ffffff" strokeWidth="0.5" opacity="0.2"/>
          </pattern>
           <pattern id="pattern-dots" width="2" height="2" patternUnits="userSpaceOnUse">
             <circle cx="1" cy="1" r="0.5" fill="#ffffff" opacity="0.3"/>
          </pattern>
        </defs>

        {/* Background Grid (Stylized) */}
        <g opacity="0.1" stroke="#d4af37" strokeWidth="0.1">
          {Array.from({ length: 10 }).map((_, i) => (
            <React.Fragment key={i}>
              <line x1={i * 10} y1="0" x2={i * 10} y2="100" />
              <line x1="0" y1={i * 10} x2="100" y2={i * 10} />
            </React.Fragment>
          ))}
        </g>

        {/* Territories */}
        {visibleFactions.map((faction) => {
            const isSelected = selectedFactionId === faction.id;
            return (
              <g 
                key={faction.id} 
                onClick={() => onFactionSelect(faction)}
                className="cursor-pointer transition-all duration-300 group"
              >
                <polygon
                  points={getPointsString(faction.territory)}
                  fill={faction.color}
                  fillOpacity={isSelected ? 0.6 : 0.3}
                  stroke={isSelected ? '#ffffff' : faction.color}
                  strokeWidth={isSelected ? 0.8 : 0.3}
                  filter={isSelected ? "url(#glow)" : ""}
                  className="transition-all duration-500 hover:fill-opacity-50"
                />
                
                {/* Pattern Overlay */}
                <polygon
                  points={getPointsString(faction.territory)}
                  fill={faction.role === 'predator' ? "url(#pattern-crosshatch)" : "url(#pattern-dots)"}
                  fillOpacity="0.4"
                  className="pointer-events-none"
                />

                {/* City/Leader Marker (Centroid Approx) */}
                {faction.territory.length > 0 && (
                   <g transform={`translate(${faction.territory[0].x + 2}, ${faction.territory[0].y + 2})`}>
                      <circle r="1.5" fill="#d4af37" />
                      <text 
                        y="-3" 
                        fontSize="3" 
                        fill="#e0e7e3" 
                        textAnchor="middle" 
                        fontFamily="Cinzel" 
                        className={`pointer-events-none opacity-0 group-hover:opacity-100 ${isSelected ? 'opacity-100' : ''}`}
                        style={{textShadow: '1px 1px 2px black'}}
                      >
                        {faction.factionName}
                      </text>
                   </g>
                )}
              </g>
            );
        })}
      </svg>
    </div>
  );
};

export default FantasyMap;
