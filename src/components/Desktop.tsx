import { useState } from 'react';
import type { ModuleId } from '../types';
import { assetUrl } from '../lib/assets';

const iconRoot = assetUrl('imgs/图标');
const items: Array<{ id: ModuleId; label: string; icon: string }> = [
  { id: 'prompt', label: '题目提示.txt', icon: `${iconRoot}/题目提示.png` },
  { id: 'archive', label: '档案室', icon: `${iconRoot}/题目提示.png` },
  { id: 'browser', label: 'Internet Explorer', icon: `${iconRoot}/Internet Explorer.png` },
  { id: 'games', label: '游戏中心', icon: `${iconRoot}/游戏中心.png` },
  { id: 'cipher', label: '解密终端', icon: `${iconRoot}/解密终端.png` },
  { id: 'recovery', label: '钱包恢复台', icon: `${iconRoot}/钱包恢复台.png` },
  { id: 'knowledge', label: '知识库', icon: `${iconRoot}/知识库.png` },
  { id: 'clues', label: '线索背包', icon: `${iconRoot}/线索背包.png` },
];

export function Desktop({ openWindow, completed, percent, collectedCount }: { openWindow: (id: ModuleId) => void; completed: ModuleId[]; percent: number; collectedCount: number }) {
  const [startOpen, setStartOpen] = useState(false);
  return <main className="xp-desktop" style={{ backgroundImage: `url("${assetUrl('imgs/壁纸.jpeg')}")` }} onContextMenu={(event) => event.preventDefault()}>
    <div className="xp-desktop-icons">{items.map((item) => <button className="xp-icon" key={item.id} onDoubleClick={() => openWindow(item.id)} onClick={() => setStartOpen(false)} title={`双击打开 ${item.label}`}><span className="xp-icon-image"><img src={item.icon} alt="" /></span><span>{item.label}</span>{completed.includes(item.id) && <b className="xp-check">✓</b>}</button>)}</div>
    <div className="xp-desktop-note"><span>案件进度：{percent}%</span><span>已收集 {collectedCount}/12 个词</span></div>
    {startOpen && <div className="xp-start-menu"><div className="start-user"><span className="user-avatar">春</span><strong>Security Studio</strong></div><div className="start-columns"><div><button onClick={() => openWindow('prompt')}>📝 题目提示</button><button onClick={() => openWindow('browser')}>🌐 浏览器</button><button onClick={() => openWindow('games')}>🎮 游戏中心</button><button onClick={() => openWindow('recovery')}>🔐 钱包恢复台</button></div><div className="start-right"><button onClick={() => openWindow('archive')}>我的档案</button><button onClick={() => openWindow('clues')}>线索背包</button><button onClick={() => openWindow('knowledge')}>帮助和支持</button></div></div><div className="start-footer"><span>所有程序</span><span>关闭计算机</span></div></div>}
    <div className="xp-taskbar"><button className="xp-start" onClick={() => setStartOpen(!startOpen)}><img src={`${iconRoot}/start.png`} alt="" /><strong>start</strong></button><div className="quick-launch"><button aria-label="显示桌面" onClick={() => setStartOpen(false)}>▣</button><button aria-label="浏览器" onClick={() => openWindow('browser')}><img src={`${iconRoot}/Internet Explorer.png`} alt="" /></button></div><div className="taskbar-tasks"><button onClick={() => openWindow('prompt')}><img src={`${iconRoot}/题目提示.png`} alt="" />题目提示.txt</button></div><div className="system-tray"><span>🔊</span><span>🌐</span><span>10:55</span></div></div>
  </main>;
}
