export function normalizeWords(value: string | string[]): string[] {
  const input = Array.isArray(value) ? value.join(' ') : value;
  return input.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

export function normalizeAlgorithm(value: string): string {
  return value.toLowerCase().replace(/[\s_-]/g, '');
}

export function normalizeAddress(value: string): string {
  return value.trim().toLowerCase().replace(/^0x/, '');
}

export function normalizePrivateKey(value: string): string {
  return value.trim().toLowerCase().replace(/^0x/, '');
}
