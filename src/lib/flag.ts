import { normalizeAddress } from './normalize';

export function revealXorFlag(dataHex: string, address: string): string {
  const data = dataHex.replace(/[^0-9a-f]/gi, '');
  const addressHex = normalizeAddress(address);
  if (data.length % 2 !== 0 || addressHex.length !== 40) throw new Error('Invalid byte payload');
  const output = new Uint8Array(data.length / 2);
  for (let index = 0; index < output.length; index += 1) {
    const dataByte = Number.parseInt(data.slice(index * 2, index * 2 + 2), 16);
    const addressByte = Number.parseInt(addressHex.slice((index % 20) * 2, (index % 20) * 2 + 2), 16);
    output[index] = dataByte ^ addressByte;
  }
  return new TextDecoder().decode(output);
}
