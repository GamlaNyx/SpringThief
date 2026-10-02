import { useState } from 'react';
import type { CipherDefinition } from '../../types';
import { decodeKeyboard, decodeMorse } from '../../lib/ciphers';

export function CipherModule({ ciphers, onComplete }: { ciphers: CipherDefinition[]; onComplete: (id: string) => void }) {
  const [values, setValues] = useState<Record<string, string>>({}); const [done, setDone] = useState<string[]>([]);
  const answers: Record<string, string> = { caesar: 'spring', keyboard: 'garden', morse: 'good' };
  const solve = (id: string) => { if (values[id]?.trim().toLowerCase() === answers[id] && !done.includes(id)) { setDone([...done, id]); onComplete(id); } };
  return <div className="module-layout"><div className="module-intro"><span className="kicker">CRYPT / TERMINAL 04</span><h2>解密终端</h2><p>终端没有复杂的密码学。先看例子，再试着把文本还原成普通单词。</p></div><div className="cipher-stack">
    <section className="cipher-card"><div className="cipher-head"><span>01</span><div><h3>{ciphers[0].title}</h3><p>{ciphers[0].description}</p></div></div><code className="cipher-code">urtkpi</code><small className="cipher-hint">提示：每个字母向左移动两格。</small><div className="inline-input"><input value={values.caesar ?? ''} onChange={(e) => setValues({ ...values, caesar: e.target.value })} placeholder="输入还原后的词" /><button className="small-button" onClick={() => solve('caesar')}>解锁</button></div>{done.includes('caesar') && <span className="success-line">✓ 线索已提取</span>}</section>
    <section className="cipher-card"><div className="cipher-head"><span>02</span><div><h3>{ciphers[1].title}</h3><p>{ciphers[1].description}</p></div></div><code className="cipher-code">hstfrm</code><small className="cipher-hint">提示：每个字符其实按到了右边的键。</small><div className="inline-input"><input value={values.keyboard ?? ''} onChange={(e) => setValues({ ...values, keyboard: e.target.value })} placeholder="输入还原后的词" /><button className="small-button" onClick={() => solve('keyboard')}>解锁</button></div>{done.includes('keyboard') && <span className="success-line">✓ 线索已提取</span>}</section>
    <section className="cipher-card"><div className="cipher-head"><span>03</span><div><h3>{ciphers[2].title}</h3><p>{ciphers[2].description}</p></div></div><code className="cipher-code">--. --- --- -..</code><small className="cipher-hint">提示：点是短，划是长，空格分隔字母。</small><div className="inline-input"><input value={values.morse ?? ''} onChange={(e) => setValues({ ...values, morse: e.target.value })} placeholder="输入翻译后的词" /><button className="small-button" onClick={() => solve('morse')}>解锁</button></div>{done.includes('morse') && <span className="success-line">✓ 线索已提取</span>}</section>
  </div><div className="module-footer-note">已完成 {done.length}/3 个解密 · 试错不会扣分</div></div>;
}
