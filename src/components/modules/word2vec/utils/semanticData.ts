// src/components/modules/word2vec/utils/semanticData.ts

export interface WordVector {
  x: number;
  y: number;
  color: string;
  cluster?: string; // Added cluster property for grouping related words
}

export const semanticWords: Record<string, WordVector> = {
  // Royal/Authority cluster
  king:   { x: 4, y: 5, color: '#facc15', cluster: 'royal' },
  queen:  { x: 1, y: 5, color: '#facc15', cluster: 'royal' },
  prince: { x: 2.5, y: 4.5, color: '#facc15', cluster: 'royal' },
  princess: { x: 0.5, y: 4.5, color: '#facc15', cluster: 'royal' },
  crown:  { x: 3, y: 6, color: '#facc15', cluster: 'royal' },

  // People cluster
  man:    { x: 4, y: 2, color: '#60a5fa', cluster: 'people' },
  woman:  { x: 1, y: 2, color: '#60a5fa', cluster: 'people' },
  boy:    { x: 3.5, y: 1.5, color: '#60a5fa', cluster: 'people' },
  girl:   { x: 1.5, y: 1.5, color: '#60a5fa', cluster: 'people' },
  person: { x: 2.5, y: 2.5, color: '#60a5fa', cluster: 'people' },
  
  // Animal cluster
  dog:    { x: -3, y: -4, color: '#a16207', cluster: 'animals' },
  cat:    { x: -4, y: -4.5, color: '#a16207', cluster: 'animals' },
  pet:    { x: -3.5, y: -3, color: '#a16207', cluster: 'animals' },
  bird:   { x: -2.5, y: -5, color: '#a16207', cluster: 'animals' },
  fish:   { x: -4.5, y: -5, color: '#a16207', cluster: 'animals' },

  // Fruit cluster
  apple:  { x: 5, y: -3, color: '#ef4444', cluster: 'fruits' },
  orange: { x: 5.5, y: -4, color: '#f97316', cluster: 'fruits' },
  banana: { x: 4.5, y: -3.5, color: '#eab308', cluster: 'fruits' },
  grape:  { x: 6, y: -3.5, color: '#8b5cf6', cluster: 'fruits' },
  peach:  { x: 5.2, y: -4.5, color: '#fb923c', cluster: 'fruits' },

  // Emotions cluster
  happy:  { x: -5, y: 4, color: '#22c55e', cluster: 'emotions' },
  sad:    { x: -5.5, y: 3, color: '#3b82f6', cluster: 'emotions' },
  angry:  { x: -6, y: 3.5, color: '#ef4444', cluster: 'emotions' },
  excited: { x: -4.5, y: 4.5, color: '#f59e0b', cluster: 'emotions' },
  calm:   { x: -5, y: 2.5, color: '#06b6d4', cluster: 'emotions' },

  // Weather cluster
  sun:    { x: 6, y: 4, color: '#f59e0b', cluster: 'weather' },
  rain:   { x: 6.5, y: 3, color: '#3b82f6', cluster: 'weather' },
  snow:   { x: 7, y: 3.5, color: '#e5e7eb', cluster: 'weather' },
  cloud:  { x: 6.2, y: 2.5, color: '#94a3b8', cluster: 'weather' },
  storm:  { x: 7.5, y: 3, color: '#6b7280', cluster: 'weather' }
};
