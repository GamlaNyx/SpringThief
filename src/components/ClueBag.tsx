import type { Clue } from '../types';

export function ClueBag({ clues, collected }: { clues: Clue[]; collected: string[] }) {
  const available = clues.filter((clue) => collected.includes(clue.id));
  return <div className="clue-bag-panel">
    <div className="section-heading"><div><span className="kicker">EVIDENCE BOARD</span><h3>线索背包</h3></div><span className="count-badge">{available.length}/12</span></div>
    <div className="clue-list">{available.length === 0 ? <p className="muted">完成桌面上的模块，词语会自动归档。</p> : available.map((clue) => <div className="clue-row" key={clue.id}><span className={`group-dot group-${clue.group}`} /><code>{clue.word}</code><span className="clue-source">自动归档至第 {clue.slot} 位</span><span className="clue-status">已归档</span></div>)}</div>
  </div>;
}
