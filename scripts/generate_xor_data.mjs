import { argv } from 'node:process';

const address = (argv[2] ?? '').replace(/^0x/, '').toLowerCase();
if (!/^[0-9a-f]{40}$/.test(address)) {
  console.error('Usage: node scripts/generate_xor_data.mjs <20-byte Ethereum address>');
  process.exit(1);
}

const flagBytes = Buffer.from('DLNUCTF{w3lc0m3_t0_w3b3}', 'utf8');
const addressBytes = Buffer.from(address, 'hex');
const data = Buffer.from(flagBytes.map((value, index) => value ^ addressBytes[index % addressBytes.length]));
console.log(data.toString('hex'));
