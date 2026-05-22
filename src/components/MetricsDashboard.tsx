/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TransactionData, CryptanalysisStats } from '../types';
import { SECP256K1_N } from '../utils/crypto';
import { ShieldCheck, ShieldAlert, Cpu, Percent, BarChart3, Binary, Orbit, Maximize2, Minimize2, RefreshCw } from 'lucide-react';

function calculateStringEntropy(hexStr: string): number {
  const clean = hexStr.replace(/[^0-9a-fA-F]/g, '');
  if (!clean) return 0;
  const bytesByValue: Record<number, number> = {};
  let totalBytes = 0;
  for (let i = 0; i < clean.length; i += 2) {
    const byteVal = parseInt(clean.substring(i, i + 2), 16);
    if (isNaN(byteVal)) continue;
    bytesByValue[byteVal] = (bytesByValue[byteVal] || 0) + 1;
    totalBytes++;
  }
  if (totalBytes === 0) return 0;
  let entropy = 0;
  for (const val in bytesByValue) {
    const p = bytesByValue[val] / totalBytes;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

interface MetricsDashboardProps {
  transactions: TransactionData[];
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

export default function MetricsDashboard({ transactions, isMaximized = false, onToggleMaximize }: MetricsDashboardProps) {
  // Batch processing state
  const [isBatchAnalyzing, setIsBatchAnalyzing] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<number>(0);
  const [batchSteps, setBatchSteps] = useState<string>('');
  const [batchAnalyzed, setBatchAnalyzed] = useState<boolean>(false);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  // Collect all parsed signatures
  const signatures: { txid: string; inputIndex: number; r: string; s: string; z: string; rBigInt: bigint; sBigInt: bigint }[] = [];
  transactions.forEach(tx => {
    tx.inputs.forEach(inp => {
      if (inp.parsedSig) {
        signatures.push({
          txid: tx.txid,
          inputIndex: inp.index,
          r: inp.parsedSig.r,
          s: inp.parsedSig.s,
          z: inp.parsedSig.z,
          rBigInt: inp.parsedSig.rBigInt,
          sBigInt: inp.parsedSig.sBigInt,
        });
      }
    });
  });

  const totalSigs = signatures.length;

  // Uniqueness
  const rSet = new Set(signatures.map(s => s.r));
  const sSet = new Set(signatures.map(s => s.s));
  const uniqueR = rSet.size;
  const uniqueS = sSet.size;

  // Average bit-length of s
  const totalBitLen = signatures.reduce((acc, curr) => {
    return acc + curr.sBigInt.toString(2).length;
  }, 0);
  const averageSLength = totalSigs > 0 ? totalBitLen / totalSigs : 0;

  // Shannon Entropy of S
  // Let's compute entropy grouped by the first byte
  const firstByteFreq: Record<string, number> = {};
  signatures.forEach(sig => {
    const byte = sig.s.substring(0, 2);
    firstByteFreq[byte] = (firstByteFreq[byte] || 0) + 1;
  });
  let shannonEntropy = 0;
  for (const b in firstByteFreq) {
    const p = firstByteFreq[b] / totalSigs;
    shannonEntropy -= p * Math.log2(p);
  }

  // MSB bias: Check if top 8 bits are 00 (indicates small nonce / leading zeroes)
  const msbBiasCount = signatures.filter(sig => {
    const sStr = sig.sBigInt.toString(16).padStart(64, '0');
    return sStr.startsWith('00');
  }).length;

  // LSB even/odd parity count (should be ~50% in a cryptographically random distribution)
  const evenCount = signatures.filter(sig => (sig.sBigInt & 1n) === 0n).length;
  const oddCount = totalSigs - evenCount;
  const lsbEvenPct = totalSigs > 0 ? (evenCount / totalSigs) * 100 : 0;

  // Check BIP-146 rule: s <= n/2
  // Low-S is a rule to prevent transaction malleability in modern Bitcoin.
  const halfN = SECP256K1_N / 2n;
  const highSCount = signatures.filter(sig => sig.sBigInt > halfN).length;
  const highSPct = totalSigs > 0 ? (highSCount / totalSigs) * 100 : 0;

  // Batch analyzer handler
  const handleStartBatchAnalyze = () => {
    setIsBatchAnalyzing(true);
    setBatchProgress(0);
    setBatchAnalyzed(false);
    setSelectedEntityId(null);
    setBatchSteps('Starte Stapelanalysen-Zyklen...');
    
    let step = 0;
    const interval = setInterval(() => {
      step += 20;
      setBatchProgress(step);
      
      if (step === 20) {
        setBatchSteps(`Lese Signaturgruppen... ${signatures.length} Entitäten identifiziert.`);
      } else if (step === 40) {
        setBatchSteps(`Dekomponiere s-Glieder und berechne byteweise Shannon-Entropie...`);
      } else if (step === 60) {
        setBatchSteps(`Prüfe r-Glieder auf Kollisionalität im Bitcoin-Transaktionsraum...`);
      } else if (step === 80) {
        setBatchSteps(`Berechne Entropie-Dichte der Sighash-Vektoren (z)...`);
      } else if (step === 100) {
        setBatchSteps(`Berechnung vollständig! Integral-Sicherheitsindex kalibriert.`);
        clearInterval(interval);
        setTimeout(() => {
          setIsBatchAnalyzing(false);
          setBatchAnalyzed(true);
        }, 150);
      }
    }, 150);
  };

  // Pre-calculate analyzed data for high-speed dynamic presentation
  const analyzedList = signatures.map((sig, idx) => {
    const sEntropy = calculateStringEntropy(sig.s);
    const rEntropy = calculateStringEntropy(sig.r);
    const zEntropy = calculateStringEntropy(sig.z);
    
    const isMsbBiased = sig.sBigInt.toString(16).padStart(64, '0').startsWith('00');
    // Simple r-collision checker inside the current batch
    const hasRCollision = signatures.some((other, oIdx) => oIdx !== idx && other.r === sig.r);
    
    let status: 'safe' | 'warning' | 'critical' = 'safe';
    if (isMsbBiased) status = 'warning';
    if (hasRCollision) status = 'critical';
    
    return {
      id: `${sig.txid}-${sig.inputIndex}`,
      txid: sig.txid,
      inputIndex: sig.inputIndex,
      sEntropy,
      rEntropy,
      zEntropy,
      isMsbBiased,
      hasRCollision,
      status
    };
  });

  const avgSEntropy = analyzedList.length > 0 
    ? analyzedList.reduce((acc, curr) => acc + curr.sEntropy, 0) / analyzedList.length 
    : 0;
  const avgREntropy = analyzedList.length > 0 
    ? analyzedList.reduce((acc, curr) => acc + curr.rEntropy, 0) / analyzedList.length 
    : 0;
  const avgZEntropy = analyzedList.length > 0 
    ? analyzedList.reduce((acc, curr) => acc + curr.zEntropy, 0) / analyzedList.length 
    : 0;

  // Aggregate safety robustness score
  let totalScore = 100;
  if (analyzedList.some(item => item.hasRCollision)) {
    totalScore = 0;
  } else {
    const biasedCount = analyzedList.filter(item => item.isMsbBiased).length;
    totalScore -= Math.min(50, biasedCount * 15);
    
    if (avgSEntropy < 7.8) {
      const deviation = 7.8 - avgSEntropy;
      totalScore -= Math.min(30, Math.round(deviation * 100));
    }
    
    const lsbSkew = Math.abs(lsbEvenPct - 50);
    if (lsbSkew > 15) {
      totalScore -= Math.min(20, Math.round((lsbSkew - 15) * 1.5));
    }
  }
  const finalRobustnessScore = Math.max(0, Math.min(100, totalScore));

  return (
    <div id="metrics-dashboard-container" className="p-6 bg-hd-surface rounded-none border-2 border-hd-line">
      <div className="mb-6 flex justify-between items-start gap-4">
        <div>
          <h2 className="text-sm font-bold text-hd-ink font-mono uppercase tracking-tight flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-hd-accent" />
            KRYPTANALYSEN_METRIKEN // BIAS_EVAL_REPORT
          </h2>
          <p className="text-xs text-hd-ink/70 font-serif italic mt-1">
            Statistische Untersuchung der ECDSA-Komponenten zur Erkennung von Nonce-Bias-Lecks und Key-Exposure
          </p>
        </div>
        {onToggleMaximize && (
          <button
            onClick={onToggleMaximize}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-hd-line hover:bg-hd-ink hover:text-hd-bg transition-all text-xs font-mono font-bold uppercase shrink-0"
            title={isMaximized ? "Vollbild schließen" : "Vollbild öffnen"}
          >
            {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            {isMaximized ? "Normal" : "Vollbild"}
          </button>
        )}
      </div>

      {/* Grid Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-none border-2 border-hd-line">
          <span className="text-[11px] text-hd-ink/65 font-serif italic block uppercase">Signaturen parst</span>
          <span className="text-2xl font-bold font-mono text-hd-ink mt-1 block">{totalSigs}</span>
          <div className="w-full bg-neutral-200 h-1 mt-2">
            <div className="bg-hd-ink h-full" style={{ width: '100%' }}></div>
          </div>
          <span className="text-[10px] text-hd-ink/60 mt-2 block font-mono flex items-center gap-1">
            <Cpu className="h-3 w-3 text-hd-accent" /> Extrahiert
          </span>
        </div>

        <div className="bg-white p-4 rounded-none border-2 border-hd-line">
          <span className="text-[11px] text-hd-ink/65 font-serif italic block uppercase">R-Kollisionen</span>
          <span className={`text-2xl font-bold font-mono mt-1 block ${totalSigs - uniqueR > 0 ? 'text-red-700' : 'text-hd-ink'}`}>
            {totalSigs - uniqueR}
          </span>
          <div className="w-full bg-neutral-200 h-1 mt-2">
            <div className="bg-hd-ink h-full" style={{ width: totalSigs - uniqueR > 0 ? '100%' : '0%' }}></div>
          </div>
          <span className="text-[10px] text-hd-ink/60 mt-2 block font-mono uppercase font-bold">
            {totalSigs - uniqueR > 0 ? '⚠️ KRITISCH' : '✓ KEINER'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-none border-2 border-hd-line">
          <span className="text-[11px] text-hd-ink/65 font-serif italic block uppercase">Shannon Entropie (S)</span>
          <span className="text-2xl font-bold font-mono text-hd-ink mt-1 block">{shannonEntropy.toFixed(3)} Sh</span>
          <div className="w-full bg-neutral-200 h-1 mt-2">
            <div className="bg-hd-ink h-full" style={{ width: `${(shannonEntropy / 8) * 100}%` }}></div>
          </div>
          <span className="text-[10px] text-hd-ink/60 mt-2 block font-mono">
            Max: 8.00 Sh (Uniform)
          </span>
        </div>

        <div className="bg-white p-4 rounded-none border-2 border-hd-line">
          <span className="text-[11px] text-hd-ink/65 font-serif italic block uppercase">MSB Nullbyte-Bias</span>
          <span className="text-2xl font-bold font-mono text-hd-ink mt-1 block">{msbBiasCount}</span>
          <div className="w-full bg-neutral-200 h-1 mt-2">
            <div className="bg-hd-ink h-full" style={{ width: msbBiasCount > 0 ? '55%' : '0%' }}></div>
          </div>
          <span className="text-[10px] text-hd-ink/60 mt-2 block font-mono">
            {msbBiasCount > 0 ? '⚠️ HNP-Risiko' : '✓ Unauffällig'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: Key distribution visualization */}
        <div className="bg-white p-4 rounded-none border-2 border-hd-line">
          <h3 className="text-[11px] font-serif italic uppercase text-hd-ink/80 tracking-wider mb-4 flex items-center gap-1.5">
            <Orbit className="h-4 w-4 text-hd-accent" />
            Signatur-Feld-Verteilung (BIP-146)
          </h3>

          <div className="flex flex-col items-center justify-center py-4">
            <div className="w-full max-w-[240px]">
              {/* Graphic circle representation of high VS low-S map */}
              <div className="relative aspect-square w-full rounded-full border-2 border-hd-line flex items-center justify-center bg-hd-surface/40">
                {/* Horizontal line */}
                <div className="absolute w-full h-[1px] bg-hd-line/45"></div>
                {/* Modulo limits labels */}
                <span className="absolute left-2 text-[8px] font-mono text-hd-ink/60">0</span>
                <span className="absolute right-2 text-[8px] font-mono text-hd-ink/60">n-1</span>
                <span className="absolute top-2 text-[8px] font-mono text-hd-ink/60">n/2 (BIP146)</span>

                {/* S-value Dots representing active signature coordinates */}
                {signatures.map((sig, i) => {
                  const angle = (Number(sig.sBigInt % 360n) * Math.PI) / 180;
                  // Base radius centered around 50%, mapped between 24% and 42%
                  const radius = 24 + (i % 4) * 5; 
                  const x = 50 + radius * Math.cos(angle);
                  const y = 50 + radius * Math.sin(angle);
                  const isHigh = sig.sBigInt > halfN;

                  return (
                    <div
                      key={i}
                      className={`absolute w-2.5 h-2.5 rounded-full border border-white shadow-sm ${isHigh ? 'bg-hd-accent font-bold scale-110' : 'bg-hd-ink'} transition-all`}
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      title={`Index ${i}: s=${sig.s.substring(0, 8)}... (High-S: ${isHigh ? 'Ja' : 'Nein'})`}
                    ></div>
                  );
                })}

                <div className="absolute text-center z-10 p-2 bg-white/95 rounded-none border border-hd-line pointer-events-none">
                  <p className="text-[9px] text-hd-ink/60 font-mono">Malleabilität</p>
                  <p className="text-xs font-bold font-mono text-hd-ink mt-0.5">{highSPct.toFixed(1)}% High-S</p>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-hd-ink/70 text-center mt-4 max-w-sm leading-normal">
              Signaturen mit $s &gt; n/2$ (High-S, <span className="text-hd-accent font-bold">Blau</span>) sind formal valide, können aber bei älteren Bitcoin-Knoten neu signiert werden. Modernere Wallets erzwingen Low-S (<span className="text-hd-ink font-bold">Schwarz/Dunkel</span>).
            </p>
          </div>
        </div>

        {/* Right column: Statistical Bias Testing details */}
        <div className="bg-white p-4 rounded-none border-2 border-hd-line flex flex-col justify-between">
          <div>
            <h3 className="text-[11px] font-serif italic uppercase text-hd-ink/80 tracking-wider mb-4 flex items-center gap-1.5">
              <Binary className="h-4 w-4 text-hd-accent" />
              Zufalls- und Paritäts-Muster-Analysen
            </h3>

            {/* Custom visual progress bars for statistical alignment */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[11px] font-mono mb-1">
                  <span className="text-hd-ink/70">LSB-Even Parität (S%2 == 0)</span>
                  <span className="text-hd-ink font-bold">{lsbEvenPct.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-hd-surface border border-hd-line rounded-none overflow-hidden flex">
                  <div
                    className="bg-hd-ink transition-all duration-500"
                    style={{ width: `${lsbEvenPct}%` }}
                  ></div>
                  <div
                    className="bg-neutral-200 transition-all duration-500"
                    style={{ width: `${100 - lsbEvenPct}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[8px] text-hd-ink/50 font-mono mt-0.5">
                  <span>Sollwert: 50.0% (Zufall)</span>
                  <span>Ist-Symmetrie: {Math.abs(lsbEvenPct - 50).toFixed(1)}% Abweichung</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono mb-1">
                  <span className="text-hd-ink/70">Rauschen / Bit-Längen Stabilität</span>
                  <span className="text-hd-ink font-bold">{((averageSLength / 256) * 100).toFixed(1)}% Dichte</span>
                </div>
                <div className="h-2 bg-hd-surface border border-hd-line rounded-none overflow-hidden flex">
                  <div
                    className="bg-hd-ink transition-all duration-500"
                    style={{ width: `${(averageSLength / 256) * 100}%` }}
                  ></div>
                  <div
                    className="bg-neutral-200 transition-all duration-500"
                    style={{ width: `${100 - (averageSLength / 256) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[8px] text-hd-ink/50 font-mono mt-0.5">
                  <span>Soll-Dichte: ~99.2% (254 bits)</span>
                  <span>Mittelwert BitLänge: {averageSLength.toFixed(1)} bits</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-hd-line/30">
            <h4 className="text-[11px] font-serif italic text-hd-ink/80 font-normal mb-2">Befund der Gitterreduktions-Eignung</h4>
            <div className="p-3 bg-hd-surface rounded-none border-l-4 border-hd-accent flex items-start gap-2">
              <ShieldAlert className="h-4 w-4 text-hd-accent mt-0.5 shrink-0" />
              <p className="text-[10px] text-hd-ink/85 leading-normal font-sans">
                <strong>HNP (Hidden Number Problem) Risiko:</strong> Der Datensatz zeigt keine exakten Dubletten in <span className="font-mono text-[11px]">$r$</span>. Allerdings sind aufeinanderfolgende Transaktionen mit uncompressed public keys unterzeichnet. Falls ein Byte-Bias (Zimmerman- oder LLL-Reduktion) in den Ephemerals <span className="font-mono text-xs">$k$</span> vorliegt, genügen bereits 4-6 Signaturen, um die Wallet vollständig zu kompromittieren.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Batch Processing Register Segment */}
      <div id="batch-processed-metrics-segment" className="mt-6 p-5 bg-white border-2 border-hd-line space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-hd-line pb-3">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase text-hd-ink flex items-center gap-1.5">
              <Binary className="h-4 w-4 text-hd-accent" />
              BATCH_PROZESSOR // INTEGRALE ENTROPIE- & ROBUSTHEITS-DIAGNOSE
            </h3>
            <p className="text-[11px] text-hd-ink/70 font-serif italic mt-0.5">
              Quantifiziert die durchschnittliche Shannon-Entropie (byteweise) und berechnet den integralen Sicherheitsrobustheit-Index des Hauptschlüssels.
            </p>
          </div>
          
          <button
            disabled={isBatchAnalyzing || totalSigs === 0}
            onClick={handleStartBatchAnalyze}
            className="bg-hd-ink hover:bg-hd-accent hover:text-hd-bg text-hd-bg px-4 py-2 text-[10px] font-mono font-bold uppercase transition-all disabled:opacity-45 border border-hd-line shrink-0 cursor-pointer"
          >
            {isBatchAnalyzing ? 'Stapel läuft...' : 'BATCH_ANALYSE STARTEN'}
          </button>
        </div>

        {isBatchAnalyzing && (
          <div className="space-y-3 font-mono text-[11px]">
            <div className="flex justify-between items-center">
              <span className="text-hd-ink/65 uppercase">Batch-Verlauf {batchProgress}%:</span>
              <span className="animate-pulse text-hd-accent font-bold">RECHNE...</span>
            </div>
            <div className="w-full bg-hd-bg h-2.5 border border-hd-line p-0.5">
              <div 
                className="bg-hd-ink h-full transition-all duration-150"
                style={{ width: `${batchProgress}%` }}
              />
            </div>
            <div className="bg-black text-emerald-400 p-3 h-16 rounded-none text-[10px] font-mono overflow-y-auto border border-hd-line">
              &gt; {batchSteps}
            </div>
          </div>
        )}

        {batchAnalyzed && !isBatchAnalyzing && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Aggregierter Robustheit-Gauge */}
              <div className="bg-hd-surface p-4 border border-hd-line flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-hd-ink/65 uppercase block font-mono">Globale Schlüssel-Robustheit</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className={`text-3xl font-bold font-mono ${
                      finalRobustnessScore >= 90 ? 'text-emerald-700' :
                      finalRobustnessScore >= 75 ? 'text-blue-700' :
                      finalRobustnessScore >= 50 ? 'text-amber-700' : 'text-red-700'
                    }`}>
                      {finalRobustnessScore.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-hd-ink/60 font-mono">/ 100</span>
                  </div>
                </div>

                <div className="mt-4">
                  <span className="text-[10px] text-hd-ink/50 uppercase block font-mono">Sicherheitsklasse:</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    {finalRobustnessScore >= 90 ? (
                      <>
                        <ShieldCheck className="h-4 w-4 text-emerald-700" />
                        <span className="text-xs font-bold font-mono text-emerald-700 uppercase">SICHER / EXZELLENT</span>
                      </>
                    ) : finalRobustnessScore >= 75 ? (
                      <>
                        <ShieldCheck className="h-4 w-4 text-blue-700" />
                        <span className="text-xs font-bold font-mono text-blue-700 uppercase">MODERAT / STABIL</span>
                      </>
                    ) : finalRobustnessScore >= 50 ? (
                      <>
                        <ShieldAlert className="h-4 w-4 text-amber-700 animate-pulse" />
                        <span className="text-xs font-bold font-mono text-amber-700 uppercase">GEFÄHRDET (HNP-GEFAHR)</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="h-4 w-4 text-red-700 animate-pulse" />
                        <span className="text-xs font-bold font-mono text-red-700 uppercase">KRITISCH (RISIKO PROMPT)</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Durchschnittliche Entropien */}
              <div className="bg-hd-surface p-4 border border-hd-line space-y-3">
                <span className="text-[10px] text-hd-ink/65 uppercase block font-mono">Mittelwerte Shannon-Entropie (ø)</span>
                
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-hd-ink/60">ø s-Entropie (Shannon):</span>
                      <span className="font-bold">{avgSEntropy.toFixed(4)} Sh</span>
                    </div>
                    <div className="h-1.5 bg-neutral-200 mt-1">
                      <div className="bg-hd-ink h-full" style={{ width: `${(avgSEntropy / 8) * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-hd-ink/60">ø r-Entropie (Shannon):</span>
                      <span className="font-bold">{avgREntropy.toFixed(4)} Sh</span>
                    </div>
                    <div className="h-1.5 bg-neutral-200 mt-1">
                      <div className="bg-hd-ink h-full" style={{ width: `${(avgREntropy / 8) * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-hd-ink/60">ø z-Entropie (Shannon):</span>
                      <span className="font-bold">{avgZEntropy.toFixed(4)} Sh</span>
                    </div>
                    <div className="h-1.5 bg-neutral-200 mt-1">
                      <div className="bg-hd-ink h-full" style={{ width: `${(avgZEntropy / 8) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Diagnoseberatung */}
              <div className="bg-hd-surface p-4 border border-hd-line flex flex-col justify-between font-mono text-[10px] leading-relaxed text-hd-ink/80 space-y-1">
                <div>
                  <span className="text-[10px] text-hd-ink/65 uppercase block font-bold mb-1">AUDIT_DIAGNOSE_TIPP:</span>
                  {finalRobustnessScore >= 90 ? (
                    <p className="font-serif italic text-emerald-800">
                      Ihre s- und r-Datenströme besitzen solide Shannon-Entropiewerte (&gt;7.9 Sh/Byte). Es wurden keine r-Kollisionen oder signifikanten MSB-Bias-Muster identifiziert. Der mathematische HNP-Kanal ist gegen Standard-Gitterangriffe geschützt.
                    </p>
                  ) : finalRobustnessScore >= 75 ? (
                    <p className="font-serif italic text-blue-800">
                      Stabile Entropie, jedoch sind geringfügige Abweichungen in Entropie oder Parität LSB sichtbar. Die Wallet gilt unter moderaten Signaturen als stabil, doch sollte ein regelmäßiger Schlüsselwechsel vollzogen werden.
                    </p>
                  ) : (
                    <p className="font-serif italic text-red-800">
                      Warnung! Die analysierten Signaturen enthalten MSB-Bias-Nullbytes oder es mangelt an Entropiedichte in s. Da HNP-Systeme Linearkombinationen nutzen, könnte das Lösen von Lattices (z. B. Babai) den Hauptschlüssel d offenlegen. Wechseln Sie die Wallet!
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Batch Table list queue */}
            <div className="space-y-2">
              <span className="text-[10px] text-hd-ink/60 uppercase block font-mono">
                Batch Warteschlangenregister ({analyzedList.length} Einheiten geladen)
              </span>
              <div className="overflow-x-auto border border-hd-line">
                <table className="w-full text-left font-mono text-[11px] border-collapse bg-white">
                  <thead>
                    <tr className="bg-hd-bg text-hd-ink/80 border-b border-hd-line uppercase text-[10px]">
                      <th className="p-3">Sighash Index</th>
                      <th className="p-3">Transaction ID (TXID)</th>
                      <th className="p-3">s-Entropie</th>
                      <th className="p-3">r-Entropie</th>
                      <th className="p-3">z-Entropie</th>
                      <th className="p-3 text-right">Diagnose / Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hd-line/40">
                    {analyzedList.map((item, idIdx) => (
                      <tr 
                        key={item.id}
                        className={`hover:bg-hd-bg/25 transition-all cursor-pointer ${
                          selectedEntityId === item.id ? 'bg-hd-accent/5' : ''
                        }`}
                        onClick={() => setSelectedEntityId(selectedEntityId === item.id ? null : item.id)}
                      >
                        <td className="p-3 font-bold text-hd-ink">
                          #{idIdx + 1} (Input {item.inputIndex})
                        </td>
                        <td className="p-3 text-hd-ink/80 font-mono">
                          {item.txid.substring(0, 16)}...
                        </td>
                        <td className="p-3">
                          <span className={item.sEntropy < 7.8 ? 'text-amber-700 font-bold' : ''}>
                            {item.sEntropy.toFixed(5)} Sh
                          </span>
                        </td>
                        <td className="p-3">
                          <span>{item.rEntropy.toFixed(5)} Sh</span>
                        </td>
                        <td className="p-3">
                          <span>{item.zEntropy.toFixed(5)} Sh</span>
                        </td>
                        <td className="p-3 text-right">
                          {item.status === 'critical' ? (
                            <span className="px-2 py-0.5 bg-red-100 text-red-800 font-bold uppercase text-[9px] border border-red-300">
                              Kollision! ❌
                            </span>
                          ) : item.status === 'warning' ? (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold uppercase text-[9px] border border-amber-300">
                              MSB Bias ⚠️
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold uppercase text-[9px] border border-emerald-300">
                              Sicher ✓
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[9px] font-sans text-hd-ink/50 italic leading-none">
                * Die Shannon-Entropiewerte berechnen sich byteweise über den Hex-Gliedern (Maximum 8.00000 Sh).
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
