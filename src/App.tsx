import { useMemo, useState } from 'react';
import { challengeConfig } from './data/challenge';
import type { ModuleId } from './types';
import { Desktop } from './components/Desktop';
import { Window } from './components/Window';
import { ClueBag } from './components/ClueBag';
import { ArchiveModule } from './components/modules/ArchiveModule';
import { BrowserModule } from './components/modules/BrowserModule';
import { GameModule } from './components/modules/GameModule';
import { CipherModule } from './components/modules/CipherModule';
import { RecoveryModule } from './components/modules/RecoveryModule';
import { KnowledgePanel } from './components/KnowledgePanel';
import { PromptFile } from './components/PromptFile';
import { placeCollectedClues } from './lib/clueSlots';

function App() {
  const [active, setActive] = useState<ModuleId | null>(null); const [collected, setCollected] = useState<string[]>([]); const [completed, setCompleted] = useState<ModuleId[]>([]); const [slots, setSlots] = useState<(string | null)[]>(Array(12).fill(null));
  const collect = (ids: string[]) => {
    setCollected((previous) => [...new Set([...previous, ...ids])]);
    setSlots((previous) => placeCollectedClues(previous, challengeConfig.clues, ids));
  };
  const finish = (module: ModuleId, ids: string[]) => { collect(ids); setCompleted((previous) => previous.includes(module) ? previous : [...previous, module]); };
  const open = (module: ModuleId) => setActive(module);
  const collectedClues = challengeConfig.clues.filter((clue) => collected.includes(clue.id));
  const percent = Math.round((collected.length / 12) * 70 + (completed.includes('recovery') ? 30 : 0));
  return <div className="app-root"><Desktop openWindow={open} completed={completed} percent={percent} collectedCount={collected.length} />
    {active && <div className="window-layer" onMouseDown={(event) => event.target === event.currentTarget && setActive(null)}><Window title={active === 'prompt' ? '题目提示.txt - 记事本' : active === 'archive' ? '失窃报告' : active === 'browser' ? 'Internet Explorer' : active === 'games' ? '游戏中心' : active === 'cipher' ? '解密终端' : active === 'recovery' ? '钱包恢复台' : active === 'clues' ? '线索背包' : '知识库'} eyebrow="" icon={active === 'prompt' ? '📝' : active === 'archive' ? '▣' : active === 'browser' ? '◎' : active === 'games' ? '✦' : active === 'cipher' ? '⌁' : active === 'recovery' ? '◇' : active === 'clues' ? '≡' : 'i'} onClose={() => setActive(null)} wide={active === 'recovery' || active === 'games' || active === 'cipher'}>
      {active === 'prompt' && <PromptFile />}
      {active === 'archive' && <ArchiveModule clues={challengeConfig.clues.filter((clue) => clue.group === 1)} onComplete={() => finish('archive', challengeConfig.clues.filter((clue) => clue.group === 1).map((clue) => clue.id))} />}
      {active === 'browser' && <BrowserModule records={challengeConfig.browserIndex} onComplete={() => finish('browser', challengeConfig.clues.filter((clue) => clue.group === 2).map((clue) => clue.id))} />}
      {active === 'games' && <GameModule games={challengeConfig.gameDefinitions} onComplete={(id) => { const clueIds = challengeConfig.gameDefinitions.find((game) => game.id === id)?.clueIds ?? []; collect(clueIds); setCompleted((previous) => [...new Set([...previous, 'games' as ModuleId])]); }} />}
      {active === 'cipher' && <CipherModule ciphers={challengeConfig.cipherDefinitions} onComplete={(id) => { const clueId = challengeConfig.cipherDefinitions.find((cipher) => cipher.id === id)?.clueId; if (clueId) collect([clueId]); if (challengeConfig.cipherDefinitions.every((cipher) => collected.includes(cipher.clueId) || cipher.id === id)) setCompleted((previous) => [...new Set([...previous, 'cipher' as ModuleId])]); }} />}
      {active === 'clues' && <ClueBag clues={challengeConfig.clues} collected={collected} />}
      {active === 'knowledge' && <KnowledgePanel onClose={() => setActive(null)} />}
      {active === 'recovery' && <RecoveryModule clues={challengeConfig.clues} slots={slots} payload={challengeConfig.flagPayload} onSolved={() => setCompleted((previous) => [...new Set([...previous, 'recovery' as ModuleId])])} />}
    </Window></div>}
    <button className="floating-bag" onClick={() => setActive('clues')} aria-label={`打开线索背包，已收集 ${collectedClues.length} 个词`}><span>≡</span><b>{collectedClues.length}</b></button>
  </div>;
}

export default App;
