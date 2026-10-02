import type { ReactNode } from 'react';

export function Window({ title, eyebrow, icon, onClose, children, wide = false }: { title: string; eyebrow?: string; icon: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return <div className={`window ${wide ? 'window-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
    <div className="window-bar"><div className="window-title"><span className="window-icon">{icon}</span><strong>{title}</strong></div><div className="window-controls"><button aria-label="最小化" title="最小化">_</button><button aria-label="最大化" title="最大化">□</button><button className="close-button" onClick={onClose} aria-label="关闭窗口" title="关闭">×</button></div></div>
    <div className="window-content">{children}</div>
  </div>;
}
