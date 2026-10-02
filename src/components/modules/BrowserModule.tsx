import { useState } from 'react';
import type { BrowserRecord } from '../../types';

const answer = 'fever dream high';

export function BrowserModule({ records, onComplete }: { records: BrowserRecord[]; onComplete: () => void }) {
  const [value, setValue] = useState('');
  const [archived, setArchived] = useState(false);
  const [message, setMessage] = useState('');
  const history = records.filter((record) => record.clueIds);
  const submit = () => {
    if (value.trim().toLowerCase().replace(/\s+/g, ' ') === answer) {
      setArchived(true);
      setMessage('记录匹配。三个词已归档。');
      onComplete();
    } else {
      setMessage('前三个词不匹配，再看看歌曲标题和歌词开头。');
    }
  };
  return <div className="module-layout"><div className="module-intro"><span className="kicker">INTERNET EXPLORER / HISTORY</span><h2>浏览记录</h2><p>这台电脑的历史记录里反复出现一首 Taylor Swift 的歌曲。找到 <b>Cruel Summer</b>，再填写歌词第一句的前三个词。</p></div><div className="ie-window"><div className="ie-toolbar"><span className="ie-nav">◀</span><span className="ie-nav">▶</span><span className="ie-nav">⌂</span><span className="ie-address">地址：local://history</span></div><div className="ie-history"><div className="history-sidebar"><strong>历史记录</strong><span>今天</span><span>音乐</span><span>搜索</span></div><div className="history-list">{history.map((record) => <div className="history-item" key={record.title}><img src="/imgs/图标/Internet Explorer.png" alt="" /><div><b>{record.title}</b><span>local.archive · 今天 09:42</span><p>{record.body}</p></div></div>)}<div className="history-item muted-history"><span className="history-globe">◎</span><div><b>Spring studio playlist</b><span>local.archive · 昨天 21:10</span></div></div></div></div></div><div className="lyric-form"><label htmlFor="lyric-answer">第一句的前三个词</label><div><input id="lyric-answer" value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && submit()} placeholder="输入三个英文单词" disabled={archived} /><button className="primary-button" onClick={submit} disabled={archived}>{archived ? '已归档 ✓' : '归档线索'}</button></div>{message && <small className={archived ? 'archive-success' : 'archive-error'}>{message}</small>}</div></div>;
}
