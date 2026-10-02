const alphabet = 'abcdefghijklmnopqrstuvwxyz';

export function decodeCaesar(input: string, shift: number): string {
  return [...input].map((char) => {
    const lower = char.toLowerCase();
    const index = alphabet.indexOf(lower);
    if (index < 0) return char;
    const next = alphabet[(index - shift + 26 * 10) % 26];
    return char === lower ? next : next.toUpperCase();
  }).join('');
}

const keyboard = 'qwertyuiopasdfghjklzxcvbnm';
export function decodeKeyboard(input: string): string {
  return [...input].map((char) => {
    const index = keyboard.indexOf(char.toLowerCase());
    if (index < 0) return char;
    const next = keyboard[Math.max(0, index - 1)];
    return char === char.toUpperCase() ? next.toUpperCase() : next;
  }).join('');
}

const morse: Record<string, string> = {
  '.-': 'a', '-...': 'b', '-.-.': 'c', '-..': 'd', '.': 'e', '..-.': 'f', '--.': 'g', '....': 'h', '..': 'i', '.---': 'j', '-.-': 'k', '.-..': 'l', '--': 'm', '-.': 'n', '---': 'o', '.--.': 'p', '--.-': 'q', '.-.': 'r', '...': 's', '-': 't', '..-': 'u', '...-': 'v', '.--': 'w', '-..-': 'x', '-.--': 'y', '--..': 'z',
};
export function decodeMorse(input: string): string {
  return input.trim().split(/\s+\/\s+|\s{2,}|\s+/).map((token) => morse[token] ?? '?').join('');
}
