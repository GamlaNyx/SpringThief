import type { Clue } from '../../types';

export function ArchiveModule({ clues, onComplete }: { clues: Clue[]; onComplete: () => void }) {
  return <div className="module-layout"><div className="module-intro"><span className="kicker">FOLDER / 001</span><h2>失窃报告</h2><p>桌面上最干净的文件，往往是最早留下的线索。打开报告，记录三处被红笔圈出的词。</p></div><div className="paper-file"><div className="paper-head"><span>STUDIO SECURITY LOG</span><span>APR / 26</span></div><h3>春季展览 · 钱包交接记录</h3><p>交接前，管理员在备忘录里写下了一句没有解释的话：</p><p className="hand-note">“{clues.map((clue) => clue.word).join(' · ')}”</p><div className="slot-notes">{clues.map((clue) => <span key={clue.id}><b>{clue.label}</b>{clue.word}</span>)}</div><div className="paper-stamp">ARCHIVED</div></div><button className="primary-button" onClick={onComplete}>归档这份报告 <span>✓</span></button></div>;
}
