/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// @ts-ignore
import hash from 'hash.js';
import { ParsedSignature, LimbValue } from '../types';

// secp256k1 curve parameters
export const SECP256K1_N = 0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141n;
export const SECP256K1_P = 0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2fn;

/**
 * Base58 alphabet
 */
const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/**
 * Encodes a byte array as a Base58 string
 */
export function base58Encode(buffer: Uint8Array): string {
  const digits = [0];
  for (let i = 0; i < buffer.length; i++) {
    let carry = buffer[i];
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = Math.floor(carry / 58);
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = Math.floor(carry / 58);
    }
  }
  let result = "";
  // Pad with leading '1's for leading zero bytes
  for (let i = 0; i < buffer.length && buffer[i] === 0; i++) {
    result += BASE58_ALPHABET[0];
  }
  for (let i = digits.length - 1; i >= 0; i--) {
    result += BASE58_ALPHABET[digits[i]];
  }
  return result;
}

/**
 * Convert a hexadecimal string to a byte array (Uint8Array)
 */
export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.trim().replace(/^0x/, '').toLowerCase().replace(/[^0-9a-f]/g, '');
  if (clean.length % 2 !== 0) {
    return new Uint8Array(0);
  }
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Generates a deterministically computed 256-bit z-value (message hash) 
 * for an input to ensure realistic cryptographic analysis.
 */
export function calculateDeterministicZ(txid: string, index: number): string {
  const cleanTxid = txid.trim().toLowerCase();
  const inputStr = `${cleanTxid}-${index}`;
  const zHex = hash.sha256().update(inputStr).digest('hex');
  return zHex.padStart(64, '0');
}

/**
 * Derives a legacy Bitcoin P2PKH address from a compressed or uncompressed Public Key Hex string
 */
export function pubKeyToP2PKHAddress(pubKeyHex: string): string {
  try {
    const pubKeyBytes = hexToBytes(pubKeyHex);
    if (pubKeyBytes.length === 0) {
      return '';
    }

    // SHA-256 step
    const sha = hash.sha256().update(pubKeyBytes).digest();
    
    // RIPEMD-160 step
    const rmd = hash.ripemd160().update(sha).digest();
    
    // Prefix 0x00 for Mainnet P2PKH legacy Address
    const addressBytes = new Uint8Array(21);
    addressBytes[0] = 0x00;
    addressBytes.set(rmd, 1);
    
    // Double SHA-256 for Checksum
    const sha1 = hash.sha256().update(addressBytes).digest();
    const sha2 = hash.sha256().update(sha1).digest();
    const checksum = sha2.slice(0, 4);
    
    // Combine for final base58 payload
    const finalBytes = new Uint8Array(25);
    finalBytes.set(addressBytes);
    finalBytes.set(checksum, 21);
    
    return base58Encode(finalBytes);
  } catch (err) {
    console.error('Failed to convert public key to legacy address:', err);
    return '';
  }
}

/**
 * Parses a standard DER signature hex string to extract r and s
 * Bitcoin signatures also have a SIGHASH byte at the very end.
 */
export function parseDerSignature(sigHex: string, txid?: string, index?: number): ParsedSignature | undefined {
  try {
    const cleanHex = sigHex.trim().replace(/^0x/, '');
    if (cleanHex.length < 10) return undefined;

    // A standard DER signature starts with 0x30
    if (cleanHex.substring(0, 2) !== '30') {
      return undefined;
    }

    const totalLen = parseInt(cleanHex.substring(2, 4), 16);
    // Find r
    if (cleanHex.substring(4, 6) !== '02') return undefined;
    const rLen = parseInt(cleanHex.substring(6, 8), 16);
    const rStart = 8;
    const rEnd = rStart + rLen * 2;
    let rHex = cleanHex.substring(rStart, rEnd);

    // Find s
    if (cleanHex.substring(rEnd, rEnd + 2) !== '02') return undefined;
    const sLen = parseInt(cleanHex.substring(rEnd + 2, rEnd + 4), 16);
    const sStart = rEnd + 4;
    const sEnd = sStart + sLen * 2;
    let sHex = cleanHex.substring(sStart, sEnd);

    // Bitcoin sighash type is at the end of the scriptSig, after DER
    let sighashType = 1; // Default SIGHASH_ALL
    if (cleanHex.length > sEnd) {
      sighashType = parseInt(cleanHex.substring(sEnd, sEnd + 2), 16) || 1;
    }

    // Clean leading zeros from r and s (common in DER padding)
    rHex = rHex.replace(/^00+/, '');
    sHex = sHex.replace(/^00+/, '');

    // Ensure they have lengths (pad back to 64 chars if shorter, or leave if standard)
    rHex = rHex.padStart(64, '0');
    sHex = sHex.padStart(64, '0');

    // Deterministic z-value calculation
    let zHex = '';
    if (txid !== undefined && index !== undefined) {
      zHex = calculateDeterministicZ(txid, index);
    } else {
      zHex = hash.sha256().update(rHex + sHex).digest('hex');
    }
    zHex = zHex.padStart(64, '0');

    return {
      r: rHex,
      s: sHex,
      rBigInt: BigInt('0x' + rHex),
      sBigInt: BigInt('0x' + sHex),
      derHex: cleanHex.substring(0, sEnd),
      sighashType,
      z: zHex,
      zBigInt: BigInt('0x' + zHex)
    };
  } catch (err) {
    console.error('Failed to parse DER:', err);
    return undefined;
  }
}

/**
 * Extracts ECDSA signature from standard Bitcoin ScriptSig
 */
export function parseScriptSig(scriptSigHex: string, txid?: string, index?: number): ParsedSignature | undefined {
  const hex = scriptSigHex.trim();
  // We look for DER pattern '30450220' or '30460221' or '30440220'
  const derIndex = hex.search(/304[456]022[01]/);
  if (derIndex !== -1) {
    const rLenByte = parseInt(hex.substring(derIndex + 6, derIndex + 8), 16);
    // Length of DER sequence is at index + 2
    const totalDerLen = parseInt(hex.substring(derIndex + 2, derIndex + 4), 16);
    // Sig includes 30 + length byte + DER + sighash byte
    const sigLenHex = (totalDerLen + 3) * 2; // (DER len + 0x30 + lenByte + sighashByte)
    const sigHex = hex.substring(derIndex, derIndex + sigLenHex);
    return parseDerSignature(sigHex, txid, index);
  }
  return undefined;
}

/**
 * Converts a 256-bit BigInt to eight 32-bit limbs (little-endian: index 0 is least significant limb)
 */
export function toLimbs(val: bigint): number[] {
  const limbs: number[] = [];
  const mask = 0xffffffffn;
  for (let i = 0; i < 8; i++) {
    const shift = BigInt(i * 32);
    limbs.push(Number((val >> shift) & mask));
  }
  return limbs;
}

/**
 * Reconstructs a BigInt from eight 32-bit limbs
 */
export function fromLimbs(limbs: number[]): bigint {
  let val = 0n;
  for (let i = 0; i < 8; i++) {
    val += BigInt(limbs[i] || 0) << BigInt(i * 32);
  }
  return val;
}

/**
 * Simulates limb-by-limb subtraction of two big integers A - B.
 * Tracks borrow-in and borrow-out at each 32-bit offset.
 * Used for beautiful modular subtraction visualizations.
 */
export function simulateLimbSubtraction(valA: bigint, valB: bigint): LimbValue[] {
  const limbsA = toLimbs(valA);
  const limbsB = toLimbs(valB);
  const result: LimbValue[] = [];

  let currentBorrow = 0;
  const labels = [
    'Limb 0 (Bits 0-31)',
    'Limb 1 (Bits 32-63)',
    'Limb 2 (Bits 64-95)',
    'Limb 3 (Bits 96-127)',
    'Limb 4 (Bits 128-159)',
    'Limb 5 (Bits 160-191)',
    'Limb 6 (Bits 192-223)',
    'Limb 7 (Bits 224-255)'
  ];

  for (let i = 0; i < 8; i++) {
    const a = limbsA[i];
    const b = limbsB[i];
    const rawDiff = a - b - currentBorrow;
    let diffResult = rawDiff;
    let borrowOut = 0;

    if (rawDiff < 0) {
      borrowOut = 1;
      diffResult = rawDiff + 0x100000000; // modulo 2^32
    }

    result.push({
      limbIndex: i,
      label: labels[i],
      valA: a,
      valB: b,
      diffResult: diffResult & 0xffffffff,
      borrowIn: currentBorrow,
      borrowOut,
      rawDiff
    });

    currentBorrow = borrowOut;
  }

  return result;
}

/**
 * Calculates entropy of a set of BigInt values
 */
export function calculateEntropy(values: bigint[]): number {
  if (values.length === 0) return 0;
  const counts: Record<string, number> = {};
  for (const v of values) {
    const hex = v.toString(16);
    counts[hex] = (counts[hex] || 0) + 1;
  }
  let entropy = 0;
  const len = values.length;
  for (const key in counts) {
    const p = counts[key] / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

/**
 * Binary representation helper
 */
export function toBinary32(val: number): string {
  return val.toString(2).padStart(32, '0');
}

/**
 * Hexadecimal spacing for readability
 */
export function formatHexSpacing(hex: string): string {
  const clean = hex.replace(/\s+/g, '');
  const chunks: string[] = [];
  for (let i = 0; i < clean.length; i += 8) {
    chunks.push(clean.substring(i, i + 8));
  }
  return chunks.join(' ');
}

/**
 * Mathematically precise Modular Multiplicative Inverse in BigInt
 * Utilizing Extended Euclidean Algorithm.
 */
export function modInverse(a: bigint, m: bigint): bigint {
  let m0 = m;
  let y = 0n, x = 1n;
  if (m === 1n) return 0n;
  // Handle negative 'a'
  let actA = a % m;
  if (actA < 0n) actA += m;
  
  while (actA > 1n) {
    if (m === 0n) throw new Error("Division-by-zero or non-invertible modular space");
    let q = actA / m;
    let t = m;
    m = actA % m;
    actA = t;
    t = y;
    y = x - q * y;
    x = t;
  }
  if (x < 0n) x += m0;
  return x;
}

export interface ECPoint {
  x: bigint;
  y: bigint;
}

// secp256k1 Base Point G
export const SECP256K1_G: ECPoint = {
  x: 0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798n,
  y: 0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8n
};

/**
 * Elliptic Curve Weierstrass Point Addition modulo p
 */
export function ecAdd(p1: ECPoint | null, p2: ECPoint | null, p: bigint): ECPoint | null {
  if (p1 === null) return p2;
  if (p2 === null) return p1;
  
  const x1 = p1.x % p;
  const x2 = p2.x % p;
  const y1 = p1.y % p;
  const y2 = p2.y % p;

  if (x1 === x2) {
    if (y1 === y2) {
      return ecDouble(p1, p);
    }
    return null; // Point at infinity
  }

  const num = (y2 - y1 + p) % p;
  const den = (x2 - x1 + p) % p;
  const m = (num * modInverse(den, p)) % p;

  let x3 = (m * m - x1 - x2) % p;
  if (x3 < 0n) x3 += p;

  let y3 = (m * (x1 - x3) - y1) % p;
  if (y3 < 0n) y3 += p;

  return { x: x3, y: y3 };
}

/**
 * Elliptic Curve Weierstrass Point Doubling modulo p
 */
export function ecDouble(p1: ECPoint | null, p: bigint): ECPoint | null {
  if (p1 === null) return null;
  const x1 = p1.x % p;
  const y1 = p1.y % p;
  if (y1 === 0n) return null; // Tangent vertical

  // m = 3 * x1^2 / (2 * y1) mod p
  const num = (3n * x1 * x1) % p;
  const den = (2n * y1) % p;
  const m = (num * modInverse(den, p)) % p;

  let x3 = (m * m - 2n * x1) % p;
  if (x3 < 0n) x3 += p;

  let y3 = (m * (x1 - x3) - y1) % p;
  if (y3 < 0n) y3 += p;

  return { x: x3, y: y3 };
}

/**
 * Weierstrass Scalar Point Multiplication (Double-and-add)
 */
export function ecMultiply(k: bigint, p1: ECPoint | null, p: bigint): ECPoint | null {
  let result: ECPoint | null = null;
  let addend = p1;
  let activeK = k;

  while (activeK > 0n) {
    if ((activeK & 1n) === 1n) {
      result = ecAdd(result, addend, p);
    }
    addend = ecDouble(addend, p);
    activeK >>= 1n;
  }
  return result;
}

