import { useMemo, useState } from 'react';
import type { Clue } from '../../types';
import { revealXorFlag } from '../../lib/flag';
import { normalizeAddress, normalizeAlgorithm } from '../../lib/normalize';
import { deriveAddress, derivePrivateKey, deriveSeed, validateMnemonic } from '../../lib/wallet';

const gateLabels = ['助记词 → 种子', '种子 → 私钥', '私钥 → 地址'];

export function RecoveryModule({ clues, slots, payload, onSolved }: { clues: Clue[]; slots: (string | null)[]; payload: string; onSolved: () => void }) {
  const [gates, setGates] = useState([false, false, false]);
  const [gateInput, setGateInput] = useState(['', '', '']);
  const [toolUsed, setToolUsed] = useState([false, false, false]);
  const [seedResult, setSeedResult] = useState('');
  const [privateKeyResult, setPrivateKeyResult] = useState('');
  const [addressResult, setAddressResult] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [error, setError] = useState('');
  const [revealed, setRevealed] = useState('');
  const ordered = useMemo(() => slots.map((id) => clues.find((clue) => clue.id === id)?.word ?? ''), [clues, slots]);
  const phrase = ordered.join(' ');
  const validation = validateMnemonic(ordered, { allowTeachingMode: true });

  const unlock = (index: number) => {
    const normalized = normalizeAlgorithm(gateInput[index]);
    const ok = index === 0
      ? normalized === 'bip39'
      : index === 1
        ? ['bip32', 'bip44'].includes(normalized)
        : normalized.includes('secp256k1') && normalized.includes('keccak256');
    if (ok) {
      const next = [...gates];
      next[index] = true;
      setGates(next);
      setError('');
    } else {
      setError('标准名称不正确，请到知识库查找后再试。');
    }
  };

  const useTool = (index: number) => {
    if (!gates[index]) {
      setError('请先解锁这个工具。');
      return;
    }
    if (index > 0 && !toolUsed[index - 1]) {
      setError('请先使用上一个工具。');
      return;
    }
    if (!validation.valid) {
      setError(validation.reason ?? '助记词尚未准备好。');
      return;
    }
    try {
      if (index === 0) setSeedResult(deriveSeed(phrase));
      if (index === 1) setPrivateKeyResult(derivePrivateKey(seedResult));
      if (index === 2) setAddressResult(deriveAddress(privateKeyResult));
      const next = [...toolUsed];
      next[index] = true;
      setToolUsed(next);
      setError('');
    } catch {
      setError('工具执行失败，请检查线索是否收集完整。');
    }
  };

  const copyAddressToCheck = () => {
    setAddressInput(addressResult);
    setError('');
  };

  const verifyAddress = () => {
    setError('');
    if (!addressResult) {
      setError('请依次使用三个工具，先计算出地址。');
      return;
    }
    if (normalizeAddress(addressInput) !== normalizeAddress(addressResult)) {
      setError('验证栏中的地址与计算结果不匹配。');
      return;
    }
    if (/^0+$/.test(payload)) {
      setError('题目组还没有写入最终 data，请先完成出题配置。');
      return;
    }
    try {
      setRevealed(revealXorFlag(payload, addressResult));
      onSolved();
    } catch {
      setError('flag 解码失败，请检查题目配置。');
    }
  };

  return <div className="module-layout recovery-layout">
    <div className="module-intro">
      <span className="kicker">WALLET RECOVERY / FINAL DESK</span>
      <h2>钱包恢复台</h2>
      <p>先从知识库找到正确的算法名称，解锁工具后按顺序运行。每一步都会把结果交给下一步。</p>
    </div>
    <div className="mnemonic-strip">
      <span>当前助记词</span>
      <div className="mnemonic-grid">{ordered.map((word, index) => <span className={`mnemonic-slot ${word ? 'filled' : ''}`} key={index}><small>{index + 1}</small><b>{word || '—'}</b></span>)}</div>
      {validation.teachingMode && <p className="teaching-mode-note">教学模式：这组剧情词用于本地演示计算，不连接真实资产。</p>}
    </div>
    <div className="gate-list">
      {gateLabels.map((label, index) => <div className={`gate-row ${gates[index] ? 'unlocked' : ''}`} key={label}>
        <span className="gate-step">0{index + 1}</span>
        <div className="gate-copy"><strong>{label}</strong></div>
        {gates[index] ? toolUsed[index]
          ? <span className="gate-status">工具已使用 ✓</span>
          : <div className="gate-input"><button className="small-button" disabled={index > 0 && !toolUsed[index - 1]} onClick={() => useTool(index)}>使用工具</button></div>
          : <div className="gate-input"><input value={gateInput[index]} onChange={(event) => { const next = [...gateInput]; next[index] = event.target.value; setGateInput(next); }} placeholder="输入标准名称" /><button className="small-button" onClick={() => unlock(index)}>解锁</button></div>}
      </div>)}
    </div>
    {(seedResult || privateKeyResult || addressResult) && <div className="tool-results">
      {seedResult && <div className="tool-result"><span className="kicker">TOOL 01 / OUTPUT</span><strong>助记词种子</strong><code>{seedResult}</code></div>}
      {privateKeyResult && <div className="tool-result"><span className="kicker">TOOL 02 / OUTPUT</span><strong>派生私钥</strong><code>{privateKeyResult}</code></div>}
      {addressResult && <div className="tool-result tool-result-address"><span className="kicker">TOOL 03 / OUTPUT</span><strong>Ethereum 地址</strong><code>{addressResult}</code><button className="small-button" onClick={copyAddressToCheck}>复制到验证栏</button></div>}
    </div>}
    {addressResult && <div className="derived-area address-check-area">
      <div className="derived-copy"><span className="kicker">FINAL ADDRESS CHECK</span><h3>验证恢复地址</h3><p>将上方工具计算出的地址复制到这里，提交后查看最终结果。</p></div>
      <div className="submit-fields"><label>最终地址<input value={addressInput} onChange={(event) => setAddressInput(event.target.value)} placeholder="粘贴 0x 开头地址" /></label></div>
      <button className="primary-button" onClick={verifyAddress}>验证地址并显示 flag <span>↗</span></button>
    </div>}
    {error && <div className="error-banner">{error}</div>}
    {revealed && <div className="flag-reveal"><span className="kicker">CASE CLOSED</span><h3>《春》已找回</h3><code>{revealed}</code><p>你完成了从助记词到地址的完整恢复链路。</p></div>}
  </div>;
}
