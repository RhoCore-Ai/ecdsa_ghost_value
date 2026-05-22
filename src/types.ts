/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TransactionInput {
  index: number;
  prevTxid: string;
  amountBtc: number;
  scriptSigHex: string;
  scriptSigAsm: string;
  prevScriptPubKey: string;
  prevType: 'P2PKH' | 'P2PK' | 'Unknown';
  parsedSig?: ParsedSignature;
  address?: string;
  pubKey?: string;
}

export interface ParsedSignature {
  r: string; // Hex string (256-bit)
  s: string; // Hex string (256-bit)
  rBigInt: bigint;
  sBigInt: bigint;
  derHex: string;
  sighashType: number;
  z: string; // Message hash / Sighash (256-bit Hex)
  zBigInt: bigint;
}

export interface TransactionData {
  txid: string;
  inputs: TransactionInput[];
  outputsCount: number;
  totalBtcIn: number;
  rawDerHex?: string;
}

export interface LimbValue {
  limbIndex: number;
  label: string;
  valA: number; // 32-bit uint
  valB: number; // 32-bit uint
  diffResult: number; // uint32
  borrowIn: number; // 0 or 1
  borrowOut: number; // 0 or 1
  rawDiff: number; // A - B - borrowIn
}

export interface CryptanalysisStats {
  totalSigs: number;
  uniqueR: number;
  uniqueS: number;
  averageSLength: number;
  entropyS: number;
  msbBiasCount: number; // number of signatures where s fits in less than 252 bits
  lsbZeroCount: number;  // number of signatures where s ends with 0
}
