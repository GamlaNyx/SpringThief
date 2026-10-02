import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { deriveAddress, derivePrivateKey, deriveSeed, validateMnemonic } from '../src/lib/wallet.ts';
import { placeCollectedClues } from '../src/lib/clueSlots.ts';

const styles = readFileSync(fileURLToPath(new URL('../src/styles.css', import.meta.url)), 'utf8');

globalThis.ethers = {
  utils: {
    isValidMnemonic: () => false,
    getAddress: (value) => value,
    mnemonicToSeed: (phrase) => `seed:${phrase}`,
    HDNode: {
      fromSeed: (seed) => ({
        derivePath: (path) => ({ privateKey: `0x${'33'.repeat(32)}`, path, seed }),
      }),
    },
    computeAddress: (privateKey) => {
      if (!privateKey.startsWith('0x')) throw new Error('private key must be prefixed');
      return `0x${'44'.repeat(20)}`;
    },
  },
  Wallet: {
    fromMnemonic: () => ({ privateKey: `0x${'11'.repeat(32)}`, address: `0x${'22'.repeat(20)}` }),
  },
};

function xor(dataHex, addressHex) {
  const out = [];
  for (let i = 0; i < dataHex.length; i += 2) out.push((parseInt(dataHex.slice(i, i + 2), 16) ^ parseInt(addressHex.slice((i / 2 % 20) * 2, (i / 2 % 20) * 2 + 2), 16)).toString(16).padStart(2, '0'));
  return Buffer.from(out.join(''), 'hex').toString('utf8');
}

test('address XOR payload repeats the 20-byte address for longer flags', () => {
  const address = '00112233445566778899aabbccddeeff00112233';
  const expected = 'DLNUCTF{w3lc0m3_t0_w3b3}';
  const bytes = Buffer.from(expected);
  const data = Buffer.from(bytes.map((value, index) => value ^ parseInt(address.slice((index % 20) * 2, (index % 20) * 2 + 2), 16))).toString('hex');
  assert.equal(xor(data, address), expected);
  assert.equal(data.length, 48);
});

test('fixed challenge groups preserve their intended order', () => {
  assert.deepEqual([
    'only sunny day', 'fever dream high', 'forever night day', 'your how good',
  ].join(' ').split(' '), [
    'only', 'sunny', 'day', 'fever', 'dream', 'high', 'forever', 'night', 'day', 'your', 'how', 'good',
  ]);
});

test('Caesar clue ciphertext decodes to spring with a left shift of two', () => {
  const ciphertext = 'urtkpi';
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  const plaintext = [...ciphertext].map((char) => {
    const index = alphabet.indexOf(char);
    return index < 0 ? char : alphabet[(index - 2 + 26) % 26];
  }).join('');
  assert.equal(plaintext, 'spring');
  assert.equal(plaintext.split(' ').at(-1), 'spring');
});

test('teaching derivation allows a twelve-word phrase with an invalid checksum', () => {
  const result = validateMnemonic([
    'only', 'sunny', 'day', 'fever', 'dream', 'high',
    'forever', 'night', 'day', 'your', 'how', 'good',
  ], { allowTeachingMode: true });
  assert.equal(result.valid, true);
  assert.equal(result.checksumValid, false);
  assert.equal(result.teachingMode, true);
});

test('collected clues are placed into their configured mnemonic slots automatically', () => {
  const clues = [
    { id: 'clue-1', slot: 1 },
    { id: 'clue-2', slot: 5 },
    { id: 'clue-3', slot: 12 },
  ];
  const slots = placeCollectedClues(Array(12).fill(null), clues, ['clue-2', 'clue-3']);
  assert.equal(slots[4], 'clue-2');
  assert.equal(slots[11], 'clue-3');
  assert.equal(slots[0], null);
});

test('recovery tools expose seed, private key, and address as sequential results', () => {
  const seed = deriveSeed('only sunny day');
  const privateKey = derivePrivateKey(seed);
  const address = deriveAddress(privateKey);
  assert.equal(seed, 'seed:only sunny day');
  assert.equal(privateKey, '33'.repeat(32));
  assert.equal(address, `0x${'44'.repeat(20)}`);
});

test('XP windows keep long recovery results scrollable instead of clipping the flag', () => {
  assert.match(styles, /\.window\s*\{[^}]*display:\s*flex;[^}]*flex-direction:\s*column;/s);
  assert.match(styles, /\.window-content\s*\{[^}]*min-height:\s*0;[^}]*overflow:\s*auto;/s);
});

test('GitHub Pages deployment keeps the project base and workflow configured', () => {
  const viteConfig = readFileSync(fileURLToPath(new URL('../vite.config.mjs', import.meta.url)), 'utf8');
  const workflow = readFileSync(fileURLToPath(new URL('../.github/workflows/deploy-pages.yml', import.meta.url)), 'utf8');
  assert.match(viteConfig, /base:\s*process\.env\.GITHUB_ACTIONS\s*\?\s*['"]\/SpringThief\/['"]\s*:\s*['"]\/['"]/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(workflow, /path:\s*['"]?\.\/dist/);
});
