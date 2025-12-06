export interface Coordinate {
  x: number;
  y: number;
}

export interface Faction {
  id: string;
  species: string;
  factionName: string;
  leader: string;
  role: 'predator' | 'prey' | 'decomposer' | 'pollinator' | 'producer';
  population: number;
  territory: Coordinate[]; // Array of points 0-100 for polygon
  layer: 'Surface' | 'Subterranean' | 'Canopy';
  culture: string;
  resource: string;
  diplomaticStatus: 'At War' | 'Allied' | 'Neutral' | 'Dominated';
  enemies: string[]; // Faction IDs
  allies: string[]; // Faction IDs
  color: string;
}

export interface StoryPage {
  title: string;
  content: string; // HTML allowed
  illustrationType: 'battle' | 'diplomacy' | 'discovery';
}

export interface Conflict {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface WorldData {
  factions: Faction[];
  story: StoryPage[];
  conflicts: Conflict[];
}
