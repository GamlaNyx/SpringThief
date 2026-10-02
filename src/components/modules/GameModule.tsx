import { useEffect, useMemo, useState } from 'react';
import type { GameDefinition } from '../../types';
import { assetUrl } from '../../lib/assets';

type Card = { id: number; pair: number; icon: string };
const iconFiles = ['blender.png', 'cs-network.png', 'evince.png', 'firefox.png', 'gconf-editor.png', 'gmahjongg.png', 'gnobots2.png', 'icecat.png', 'LimeWire.png', 'lpi-translate.png', 'openjdk-6.png', 'sol.png'];
const iconBase = assetUrl('imgs/记忆配对');

function shuffleCards(): Card[] {
  const cards = iconFiles.flatMap((file, pair) => [0, 1].map((copy) => ({ id: pair * 2 + copy, pair, icon: `${iconBase}/${file}` })));
  return [...cards].sort((a, b) => ((a.id * 17 + 11) % 29) - ((b.id * 17 + 11) % 29));
}

export function GameModule({ games, onComplete }: { games: GameDefinition[]; onComplete: (id: string) => void }) {
  const game = games[0];
  const [cards, setCards] = useState<Card[]>(() => shuffleCards());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [complete, setComplete] = useState(false);

  const matchedPairs = useMemo(() => matched.length / 2, [matched]);

  useEffect(() => {
    if (flipped.length !== 2) return;
    const [first, second] = flipped.map((index) => cards[index]);
    if (first.pair === second.pair) {
      const timer = window.setTimeout(() => {
        setMatched((previous) => [...previous, first.id, second.id]);
        setFlipped([]);
        if (matched.length + 2 === cards.length) {
          setComplete(true);
          onComplete(game.id);
        }
      }, 350);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => {
      setFlipped([]);
      setMistakes((previous) => previous + 1);
    }, 800);
    return () => window.clearTimeout(timer);
  }, [flipped, cards, matched.length, onComplete, game.id]);

  const choose = (index: number) => {
    if (complete || flipped.length >= 2 || matched.includes(cards[index].id) || flipped.includes(index)) return;
    setFlipped((previous) => [...previous, index]);
  };

  const reset = () => {
    setCards(shuffleCards());
    setFlipped([]);
    setMatched([]);
    setMistakes(0);
    setComplete(false);
  };

  return <div className="module-layout"><div className="module-intro"><span className="kicker">ARCADE / MEMORY FILE</span><h2>记忆配对</h2><p>这是一个 4×6 的记忆棋盘。找到全部 12 对图标，点错不会扣分，卡片会自动翻回；只有 24 张全部配对后，第三组的三个词才会归档。</p></div>
    <section className="memory-game-panel"><div className="memory-game-head"><div><strong>记忆配对.exe</strong><span>已配对 {matchedPairs}/12 · 失误 {mistakes}</span></div><button className="small-button" onClick={reset}>重新开始</button></div><div className="memory-card-grid">{cards.map((card, index) => { const visible = flipped.includes(index) || matched.includes(card.id); return <button key={card.id} className={`memory-card ${visible ? 'is-visible' : ''} ${matched.includes(card.id) ? 'is-matched' : ''}`} onClick={() => choose(index)} aria-label={visible ? `图标 ${card.pair + 1}` : '隐藏图标'}><span className="card-back">?</span>{visible && <img src={`${card.icon}`} alt="" />}</button>; })}</div>{complete ? <div className="memory-success"><strong>全部配对完成！</strong><span>第三组的三个助记词已归档。</span></div> : <div className="memory-tip">每次翻开两张卡片，记住它们的位置。</div>}</section><div className="module-footer-note">{complete ? '已完成 · 获得 3 个助记词' : `进度 ${matchedPairs}/12 对`}</div></div>;
}
