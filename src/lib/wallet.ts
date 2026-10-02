import { normalizeAddress, normalizePrivateKey, normalizeWords } from './normalize.ts';

export const DERIVATION_PATH = "m/44'/60'/0'/0/0";

type EthersV5 = {
  utils: {
    isValidMnemonic(phrase: string): boolean;
    getAddress(value: string): string;
    mnemonicToSeed(phrase: string): string;
    HDNode: { fromSeed(seed: string): { derivePath(path: string): { privateKey: string } } };
    computeAddress(privateKey: string): string;
  };
  Wallet: { fromMnemonic(phrase: string, path: string): { privateKey: string; address: string } };
};

export type MnemonicValidation = {
  valid: boolean;
  phrase: string;
  checksumValid: boolean;
  teachingMode: boolean;
  reason?: string;
};

function ethers(): EthersV5 {
  const value = (globalThis as typeof globalThis & { ethers?: EthersV5 }).ethers;
  if (!value) throw new Error('Wallet engine is unavailable. Load ethers before using the recovery desk.');
  return value;
}

export function validateMnemonic(words: string[], options: { allowTeachingMode?: boolean } = {}): MnemonicValidation {
  const normalized = normalizeWords(words);
  const phrase = normalized.join(' ');
  if (normalized.length !== 12) return { valid: false, phrase, checksumValid: false, teachingMode: false, reason: '需要正好 12 个词' };
  let checksumValid = false;
  try {
    checksumValid = ethers().utils.isValidMnemonic(phrase);
  } catch {
    return { valid: false, phrase, checksumValid: false, teachingMode: false, reason: '钱包引擎不可用' };
  }
  if (checksumValid) return { valid: true, phrase, checksumValid: true, teachingMode: false };
  if (options.allowTeachingMode) return { valid: true, phrase, checksumValid: false, teachingMode: true, reason: '教学派生模式：当前词组未通过 BIP-39 校验和。' };
  return { valid: false, phrase, checksumValid: false, teachingMode: false, reason: '助记词校验和不正确' };
}

export function deriveSeed(phrase: string): string {
  return ethers().utils.mnemonicToSeed(normalizeWords(phrase).join(' '));
}

export function derivePrivateKey(seed: string): string {
  const node = ethers().utils.HDNode.fromSeed(seed).derivePath(DERIVATION_PATH);
  return normalizePrivateKey(node.privateKey);
}

export function deriveAddress(privateKey: string): string {
  const normalized = normalizePrivateKey(privateKey);
  return ethers().utils.getAddress(ethers().utils.computeAddress(`0x${normalized}`));
}

export function deriveWallet(phrase: string): { privateKey: string; address: string; path: string } {
  const privateKey = derivePrivateKey(deriveSeed(phrase));
  return { privateKey, address: deriveAddress(privateKey), path: DERIVATION_PATH };
}

export function addressesMatch(expected: string, actual: string): boolean {
  try { return normalizeAddress(ethers().utils.getAddress(expected)) === normalizeAddress(ethers().utils.getAddress(actual)); } catch { return false; }
}
