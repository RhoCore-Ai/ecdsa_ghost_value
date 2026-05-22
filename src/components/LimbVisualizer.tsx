/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TransactionData } from '../types';
import { simulateLimbSubtraction, SECP256K1_N, SECP256K1_P, toLimbs, formatHexSpacing } from '../utils/crypto';
import { Cpu, ArrowRight, CornerRightDown, HelpCircle, RefreshCw, Layers, Maximize2, Minimize2 } from 'lucide-react';

interface LimbVisualizerProps {
  transactions: TransactionData[];
  selectedInputSig: { r: string; s: string } | null;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

export default function LimbVisualizer({ 
  transactions, 
  selectedInputSig,
  isMaximized = false,
  onToggleMaximize
}: LimbVisualizerProps) {
  // Collect all signatures to let user choose
  const signatures: { id: string; label: string; r: string; s: string }[] = [];
  transactions.forEach((tx, txIdx) => {
    tx.inputs.forEach(inp => {
      if (inp.parsedSig) {
        signatures.push({
          id: `${tx.txid}-${inp.index}`,
          label: `Tx ${tx.txid.substring(0, 6)}... Input #${inp.index} (${inp.amountBtc} BTC)`,
          r: inp.parsedSig.r,
          s: inp.parsedSig.s
        });
      }
    });
  });

  const [sigA, setSigA] = useState<string>('');
  const [sigB, setSigB] = useState<string>('');
  const [selectedField, setSelectedField] = useState<'S' | 'R'>('S');
  const [primeField, setPrimeField] = useState<'N' | 'P'>('N'); // Modulo N (order) or P (field size)

  // Initialize with signature pairs if available
  useEffect(() => {
    if (selectedInputSig) {
      setSigA(selectedField === 'S' ? selectedInputSig.s : selectedInputSig.r);
      // Select another signature for comparison B
      const idx = signatures.findIndex(s => s.s === selectedInputSig.s || s.r === selectedInputSig.r);
      const otherSig = signatures[(idx + 1) % signatures.length];
      if (otherSig) {
        setSigB(selectedField === 'S' ? otherSig.s : otherSig.r);
      }
    } else if (signatures.length >= 2) {
      setSigA(selectedField === 'S' ? signatures[0].s : signatures[0].r);
      setSigB(selectedField === 'S' ? signatures[1].s : signatures[1].r);
    }
  }, [selectedInputSig, selectedField]);

  // Handle custom fields
  const handleRandomize = () => {
    if (signatures.length >= 2) {
      const rand1 = signatures[Math.floor(Math.random() * signatures.length)];
      let rand2 = signatures[Math.floor(Math.random() * signatures.length)];
      while (rand2.id === rand1.id && signatures.length > 1) {
        rand2 = signatures[Math.floor(Math.random() * signatures.length)];
      }
      setSigA(selectedField === 'S' ? rand1.s : rand1.r);
      setSigB(selectedField === 'S' ? rand2.s : rand2.r);
    }
  };

  const valA = BigInt('0x' + (sigA || '0').replace(/[^0-9a-fA-F]/g, ''));
  const valB = BigInt('0x' + (sigB || '0').replace(/[^0-9a-fA-F]/g, ''));

  const activePrime = primeField === 'N' ? SECP256K1_N : SECP256K1_P;
  const activePrimeLabel = primeField === 'N' ? 'Ordnung n (secp256k1)' : 'Primzahl p (secp256k1)';

  // Calculate standard subtraction A - B
  const subtractionResult = valA >= valB ? (valA - valB) : (valA - valB + activePrime);
  const rawDiff = valA - valB;

  // Run limb-by-limb simulation
  const simulationSteps = simulateLimbSubtraction(valA, valB);
  const finalBorrow = simulationSteps[7]?.borrowOut || 0;

  return (
    <div id="limb-visualizer-container" className="p-6 bg-hd-surface rounded-none border-2 border-hd-line">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex justify-between items-start w-full md:w-auto gap-4 flex-1">
          <div>
            <h2 className="text-sm font-bold text-hd-ink font-mono uppercase tracking-tight flex items-center gap-2">
              <Layers className="h-4 w-4 text-hd-accent" />
              GLIEDER_ARITHMETIK // MULTI_PRECISION_BORROW_SIMULATOR
            </h2>
            <p className="text-xs text-hd-ink/70 font-serif italic mt-1">
              Reale 32-Bit Glieder (Limbs) Subtraktion mit Übertrags-Debugging (Borrow) unter Modulo-Kompensation (secp256k1)
            </p>
          </div>
          {onToggleMaximize && (
            <button
              onClick={onToggleMaximize}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-hd-line hover:bg-hd-ink hover:text-hd-bg transition-all text-xs font-mono font-bold uppercase shrink-0 md:hidden"
              title={isMaximized ? "Vollbild schließen" : "Vollbild öffnen"}
            >
              {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              {isMaximized ? "Normal" : "Vollbild"}
            </button>
          )}
        </div>

        {/* Options */}
        <div className="flex flex-wrap gap-2 items-center">
          {onToggleMaximize && (
            <button
              onClick={onToggleMaximize}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-hd-line hover:bg-hd-ink hover:text-hd-bg transition-all text-xs font-mono font-bold uppercase shrink-0"
              title={isMaximized ? "Vollbild schließen" : "Vollbild öffnen"}
            >
              {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              {isMaximized ? "Normal" : "Vollbild"}
            </button>
          )}
          <div className="bg-hd-bg p-1 rounded-none border-2 border-hd-line flex text-[11px] font-mono">
            <button
              onClick={() => setSelectedField('S')}
              className={`px-2.5 py-1 rounded-none font-bold transition-all ${
                selectedField === 'S'
                  ? 'bg-hd-ink text-hd-bg'
                  : 'text-hd-ink/70 hover:text-hd-ink'
              }`}
            >
              Komponente S
            </button>
            <button
              onClick={() => setSelectedField('R')}
              className={`px-2.5 py-1 rounded-none font-bold transition-all ${
                selectedField === 'R'
                  ? 'bg-hd-ink text-hd-bg'
                  : 'text-hd-ink/70 hover:text-hd-ink'
              }`}
            >
              Komponente R
            </button>
          </div>

          <div className="bg-hd-bg p-1 rounded-none border-2 border-hd-line flex text-[11px] font-mono">
            <button
              onClick={() => setPrimeField('N')}
              className={`px-2.5 py-1 rounded-none font-bold transition-all ${
                primeField === 'N'
                  ? 'bg-hd-ink text-hd-bg'
                  : 'text-hd-ink/70'
              }`}
              title="Ordnung der Kurve: n. Wichtig für k und s Berechnungen."
            >
              mod n
            </button>
            <button
              onClick={() => setPrimeField('P')}
              className={`px-2.5 py-1 rounded-none font-bold transition-all ${
                primeField === 'P'
                  ? 'bg-hd-ink text-hd-bg'
                  : 'text-hd-ink/70'
              }`}
              title="Primzahl des endlichen Feldes: p. Wichtig für Koordinaten (x, y) Berechnungen."
            >
              mod p
            </button>
          </div>
        </div>
      </div>

      {/* Manual Input Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-[10px] font-serif italic text-hd-ink/80 tracking-wider mb-1 block font-normal">
            Wert A (Hexadezimal, 256-Bit)
          </label>
          <input
            type="text"
            className="w-full bg-white text-hd-ink text-xs font-mono p-2.5 rounded-none border-2 border-hd-line focus:outline-none focus:border-hd-accent"
            value={sigA}
            onChange={e => setSigA(e.target.value.toLowerCase().replace(/[^0-9a-fA-F]/g, ''))}
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-[10px] font-serif italic text-hd-ink/80 tracking-wider font-normal">
              Wert B (Hexadezimal, 256-Bit)
            </label>
            <button
              onClick={handleRandomize}
              className="text-[10px] font-mono text-hd-accent hover:text-hd-ink flex items-center gap-1 uppercase font-bold"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Vergleichswert rotieren
            </button>
          </div>
          <input
            type="text"
            className="w-full bg-white text-hd-ink text-xs font-mono p-2.5 rounded-none border-2 border-hd-line focus:outline-none focus:border-hd-accent"
            value={sigB}
            onChange={e => setSigB(e.target.value.toLowerCase().replace(/[^0-9a-fA-F]/g, ''))}
          />
        </div>
      </div>

      {/* Arithmetic Output Summary Card */}
      <div className="bg-white p-4 rounded-none border-2 border-hd-line mb-6">
        <h3 className="text-[11px] font-serif italic uppercase text-hd-ink/80 mb-3 flex items-center gap-1.5 font-normal">
          <Cpu className="h-4 w-4 text-hd-accent" />
          Kryptografische Modulo_Subtraktionsauflösung
        </h3>

        <div className="space-y-2 text-xs font-mono">
          <div className="grid grid-cols-5 gap-2 border-b border-hd-line/15 pb-2">
            <span className="text-hd-ink/60 col-span-1">A</span>
            <span className="text-hd-ink col-span-4 break-all font-bold">
              {formatHexSpacing(valA.toString(16).padStart(64, '0'))}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-2 border-b border-hd-line/15 pb-2">
            <span className="text-hd-ink/60 col-span-1">B (Subtrahend)</span>
            <span className="text-hd-ink col-span-4 break-all">
              {formatHexSpacing(valB.toString(16).padStart(64, '0'))}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-2 border-b border-hd-line/15 pb-2">
            <span className="text-hd-ink/60 col-span-1">Differenz</span>
            <span className="text-hd-ink/80 col-span-4 break-all">
              {rawDiff >= 0n ? '+' : ''}
              {formatHexSpacing(rawDiff.toString(16))} (Rohwert)
            </span>
          </div>
          <div className="grid grid-cols-5 gap-2 pt-1">
            <span className="text-hd-ink/90 col-span-1 font-bold">Ergebnis</span>
            <span className="text-hd-accent col-span-4 break-all font-extrabold text-[13px]">
              {formatHexSpacing(subtractionResult.toString(16).padStart(64, '0'))} <span className="text-hd-ink/50 text-[10px]">mod {primeField}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Limb-by-Limb Debug Register Board */}
      <div>
        <h3 className="text-[11px] font-serif italic uppercase text-hd-ink/80 tracking-wider mb-4 font-normal">
          Schritt-für-Schritt Registerauflösung (Limb 0 bis Limb 7)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {simulationSteps.map((step, index) => {
            const hasBorrowOut = step.borrowOut === 1;

            return (
              <div
                key={step.limbIndex}
                className={`p-3 bg-white rounded-none border-2 transition-all ${
                  hasBorrowOut ? 'border-dashed border-red-700 shadow-sm' : 'border-hd-line'
                }`}
              >
                <div className="flex justify-between items-center mb-2 pb-1 border-b border-hd-line/20">
                  <span className="text-xs font-bold text-hd-ink font-mono">{step.label.split(' ')[0]} {step.limbIndex}</span>
                  <span className="text-[9px] font-mono text-hd-line/45">uint32</span>
                </div>

                <div className="space-y-1.5 text-[11px] font-mono">
                  {/* Limb values */}
                  <div className="flex justify-between">
                    <span className="text-hd-ink/60">Limb A:</span>
                    <span className="text-hd-ink font-bold">{step.valA.toString(16).padStart(8, '0').toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-hd-ink/60">Limb B:</span>
                    <span className="text-hd-ink font-semibold">{step.valB.toString(16).padStart(8, '0').toUpperCase()}</span>
                  </div>

                  {/* Borrow Line */}
                  <div className="flex justify-between p-1 bg-hd-surface border border-hd-line/20 text-[10px]">
                    <span className="text-hd-ink/65">Borrow In:</span>
                    <span className={step.borrowIn > 0 ? 'text-red-700 font-bold animate-pulse' : 'text-hd-ink/50'}>
                      {step.borrowIn}
                    </span>
                  </div>

                  {/* Math line */}
                  <div className="pt-1.5 border-t border-dashed border-hd-line/20 text-right font-extrabold text-hd-ink/90">
                    A - B - BorrowIn = <span className="text-hd-ink">{step.rawDiff}</span>
                  </div>

                  {/* Carry Out / Borrow out */}
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-hd-ink/60 text-[10px]">Borrow Out:</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-none text-[10px] font-bold border ${
                        hasBorrowOut
                          ? 'bg-red-50 text-red-700 border-red-300'
                          : 'bg-hd-surface text-hd-ink/50 border-hd-line/20'
                      }`}
                    >
                      {step.borrowOut}
                    </span>
                  </div>

                  {/* Hex outcome */}
                  <div className="flex justify-between pt-1 border-t border-hd-line/25">
                    <span className="text-hd-ink/60">Register:</span>
                    <span className="text-hd-accent font-bold">{step.diffResult.toString(16).padStart(8, '0').toUpperCase()}</span>
                  </div>
                </div>

                {/* Arrow pointing to next limb representing hardware Carry bit */}
                {index < 7 && (
                  <div className="flex justify-center items-center mt-3 text-hd-ink/50">
                    <CornerRightDown className="h-4 w-4 text-hd-accent/70" />
                    <span className="text-[8px] uppercase tracking-wider font-mono ml-1 font-bold">
                      {hasBorrowOut ? 'Borrow propagiert ➔' : 'Kein Übertrag'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Arithmetic Explanation at the end */}
      <div className="mt-6 p-4 bg-white rounded-none border-2 border-hd-line font-sans border-l-4 border-l-hd-accent">
        <h4 className="text-[11px] font-serif italic text-hd-ink/80 uppercase font-bold mb-2 flex items-center gap-1">
          <HelpCircle className="h-4 w-4 text-hd-accent" /> Why is the final Borrow component {finalBorrow} critical?
        </h4>
        <p className="text-xs text-hd-ink/80 mt-1 leading-relaxed">
          Weil wir im endlichen Feld arbeiten, müssen alle Werte zwischen $0$ und $n-1$ liegen. Bei der Subtraktion auf Hardware-Ebene (Limb 7) zeigt ein verbleibender <span className="font-mono text-xs text-hd-accent font-bold">Borrow-Out = {finalBorrow}</span>, dass $A &lt; B$ ist (also das unmodifizierte Ergebnis negativ wäre).
          <br /><br />
          In diesem Fall (da <span className="font-mono text-xs text-red-700 font-bold">Borrow Out at Limb 7 == 1</span>) greift die Modulo-Normalisierung: Das System führt im Hintergrund eine automatische Addition im Ausmaß von ${activePrimeLabel}$ (<span className="font-mono text-xs text-hd-accent font-semibold">+{primeField}</span>) durch. Dadurch wandert das Ergebnis zurück in den positiven Restklassenraum, was einen fehlerfreien mathematischen Key-Space sicherstellt.
        </p>
      </div>
    </div>
  );
}
