export type ModuleId = 'archive' | 'browser' | 'games' | 'cipher' | 'recovery' | 'knowledge' | 'clues' | 'prompt';

export type Clue = {
  id: string;
  group: 1 | 2 | 3 | 4;
  word: string;
  slot: number;
  source: string;
  label: string;
  hints: string[];
};

export type BrowserRecord = { title: string; body: string; tags: string[]; clueIds?: string[] };
export type SearchRecord = BrowserRecord;

export type GameDefinition = { id: string; title: string; description: string; clueIds: string[] };
export type CipherDefinition = { id: string; title: string; description: string; clueId: string };

export type ChallengeConfig = {
  title: string;
  nftName: string;
  clues: Clue[];
  browserIndex: BrowserRecord[];
  gameDefinitions: GameDefinition[];
  cipherDefinitions: CipherDefinition[];
  mnemonic: string;
  derivationPath: string;
  expectedPrivateKey?: string;
  expectedAddress?: string;
  flagMode: 'xor-address';
  flagPayload: string;
};
