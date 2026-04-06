/**
 * Radix-44 Encoding Utility
 * Alphabet optimized for QR Code "Alphanumeric Mode" (44 chars)
 * QR alphanumeric mode supports: 0-9, A-Z, SP $ % * + - . / :
 * This 44-char subset maximizes density in QR alphanumeric encoding.
 */

export const RADIX44_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';

if (RADIX44_ALPHABET.length !== 44) {
  throw new Error('Radix-44 alphabet must be exactly 44 characters');
}

const CHAR_TO_INDEX = new Map(
  [...RADIX44_ALPHABET].map((char, i) => [char, i])
);

/**
 * Encode a non-negative integer to a Radix-44 string
 * @param {number} num
 * @returns {string}
 */
export function encode(num) {
  if (num === 0) return RADIX44_ALPHABET[0];
  let result = '';
  let n = num;
  while (n > 0) {
    result = RADIX44_ALPHABET[n % 44] + result;
    n = Math.floor(n / 44);
  }
  return result;
}

/**
 * Decode a Radix-44 string back to an integer
 * @param {string} str
 * @returns {number}
 */
export function decode(str) {
  return [...str.toUpperCase()].reduce((acc, char) => {
    const idx = CHAR_TO_INDEX.get(char);
    if (idx === undefined) throw new Error(`Invalid Radix-44 character: ${char}`);
    return acc * 44 + idx;
  }, 0);
}

/**
 * Encode a short string (e.g. org slug, referral code) to compact Radix-44
 * Converts each char code and packs into a Radix-44 string.
 * @param {string} text - ASCII/alphanumeric input
 * @returns {string}
 */
export function encodeString(text) {
  return text
    .toUpperCase()
    .replace(/[^0-9A-Z $%*+\-./:]/g, '')
    .split('')
    .map(c => encode(CHAR_TO_INDEX.get(c) ?? 0))
    .join('-');
}

/**
 * Generate a short Radix-44 ID from a timestamp (for referral codes, QR payloads)
 * @param {string} [prefix] - Optional prefix (e.g. 'ORG', 'REF')
 * @returns {string}
 */
export function generateId(prefix = '') {
  const ts = Date.now() % (44 ** 5); // Keep it short (5 chars)
  return prefix ? `${prefix}-${encode(ts)}` : encode(ts);
}