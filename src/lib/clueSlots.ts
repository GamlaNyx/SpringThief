import type { Clue } from '../types';

export function placeCollectedClues(slots: (string | null)[], clues: Pick<Clue, 'id' | 'slot'>[], clueIds: string[]): (string | null)[] {
  const next = [...slots];
  clueIds.forEach((id) => {
    const clue = clues.find((item) => item.id === id);
    if (clue && clue.slot >= 1 && clue.slot <= next.length) next[clue.slot - 1] = clue.id;
  });
  return next;
}
