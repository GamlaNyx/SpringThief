export function ProgressBar({ value, label }: { value: number; label: string }) {
  return <div className="progress-wrap"><div className="progress-label"><span>{label}</span><b>{value}%</b></div><div className="progress-track"><span style={{ width: `${value}%` }} /></div></div>;
}
