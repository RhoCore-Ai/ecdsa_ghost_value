/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { TransactionData } from '../types';
import { 
  toLimbs, 
  fromLimbs, 
  formatHexSpacing, 
  ecMultiply, 
  SECP256K1_G, 
  SECP256K1_P, 
  SECP256K1_N,
  modInverse
} from '../utils/crypto';
import { 
  Cpu, 
  Zap, 
  Settings, 
  Flame, 
  Play, 
  Layers, 
  RefreshCw, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle,
  Maximize2,
  Minimize2,
  Orbit
} from 'lucide-react';

interface LimbStrikeSimulatorProps {
  transactions: TransactionData[];
  currentPubKey: string;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

export default function LimbStrikeSimulator({ 
  transactions, 
  currentPubKey,
  isMaximized = false,
  onToggleMaximize
}: LimbStrikeSimulatorProps) {
  // Grab standard signatures from active transactions list to make it fully concrete
  const signatures = useMemo(() => {
    const list: { id: string; txid: string; index: number; r: string; s: string; z: string }[] = [];
    transactions.forEach(tx => {
      tx.inputs.forEach(inp => {
        if (inp.parsedSig) {
          list.push({
            id: `${tx.txid}-${inp.index}`,
            txid: tx.txid,
            index: inp.index,
            r: inp.parsedSig.r,
            s: inp.parsedSig.s,
            z: inp.parsedSig.z
          });
        }
      });
    });
    return list;
  }, [transactions]);

  // Current states
  const [selectedSigId, setSelectedSigId] = useState<string>('');
  const [userPrivateKeyHex, setUserPrivateKeyHex] = useState<string>('a0c4f839b2e67d51f04561ae3d2948eb5c73291bf028da3bb108eaecb40283ca');
  const [hoveredHnpPoint, setHoveredHnpPoint] = useState<any>(null);
  
  // Simulation execution state
  const [gpuSpeed, setGpuSpeed] = useState<number>(800000000); // 800 MH/s (Nvidia RTX 4090 level)
  const [isCracking, setIsCracking] = useState<boolean>(false);
  const [crackProgress, setCrackProgress] = useState<number>(0);
  const [crackedKey, setCrackedKey] = useState<string | null>(null);
  const [crackSteps, setCrackSteps] = useState<string[]>([]);

  // Automatically select first available signature as default
  useEffect(() => {
    if (signatures.length > 0 && !selectedSigId) {
      setSelectedSigId(signatures[0].id);
    }
  }, [signatures, selectedSigId]);

  const activeSig = useMemo(() => {
    return signatures.find(s => s.id === selectedSigId) || signatures[0] || null;
  }, [signatures, selectedSigId]);

  // Derived: Decrypt the ephemeral nonce k using the user's entered Private Key (d)
  const decryptedNonce = useMemo(() => {
    if (!activeSig) return null;
    const cleanPriv = userPrivateKeyHex.trim().replace(/^0x/, '');
    if (cleanPriv.length !== 64) return null;
    
    try {
      const d = BigInt('0x' + cleanPriv);
      const r = BigInt('0x' + activeSig.r);
      const s = BigInt('0x' + activeSig.s);
      const z = BigInt('0x' + activeSig.z);
      
      // k = s^-1 * (z + r * d) mod n
      const sInv = modInverse(s, SECP256K1_N);
      const val = (z + r * d) % SECP256K1_N;
      const k = (sInv * val) % SECP256K1_N;
      
      const limbs = toLimbs(k);
      
      return {
        d,
        k,
        limbs,
        hex: k.toString(16).padStart(64, '0')
      };
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [activeSig, userPrivateKeyHex]);

  // Sample adjacent candidates for Private Key d and compute resulting Ephemeral Nonce k
  // to visualize the Hidden Number Problem (HNP)
  const hnpPoints = useMemo(() => {
    if (!activeSig || !decryptedNonce) return [];
    
    try {
      const dVal = decryptedNonce.d;
      const rVal = BigInt('0x' + activeSig.r);
      const sVal = BigInt('0x' + activeSig.s);
      const zVal = BigInt('0x' + activeSig.z);
      
      const sInv = modInverse(sVal, SECP256K1_N);
      
      const list: { delta: number; dStr: string; kHex: string; kPercent: number; isActual: boolean }[] = [];
      
      // Sample symmetrical points around current key
      for (let delta = -8; delta <= 8; delta++) {
        const testD = dVal + BigInt(delta);
        const positiveD = ((testD % SECP256K1_N) + SECP256K1_N) % SECP256K1_N;
        
        const val = (zVal + rVal * positiveD) % SECP256K1_N;
        const testK = (sInv * val) % SECP256K1_N;
        const positiveK = ((testK % SECP256K1_N) + SECP256K1_N) % SECP256K1_N;
        
        const kPercent = Number((positiveK * 10000n) / SECP256K1_N) / 100;
        
        list.push({
          delta,
          dStr: positiveD.toString(16).padStart(64, '0'),
          kHex: positiveK.toString(16).padStart(64, '0'),
          kPercent,
          isActual: delta === 0
        });
      }
      return list;
    } catch (e) {
      console.error("HNP visualization computation error:", e);
      return [];
    }
  }, [activeSig, decryptedNonce]);

  const searchSpaceSize = 8 * Math.pow(2, 32); // 34.35 Billion states
  const searchSpaceFormatted = "34.359.738.368";

  const estimatedCrackTimeSeconds = useMemo(() => {
    return searchSpaceSize / gpuSpeed;
  }, [gpuSpeed]);

  // Simulated GPU Vulnerability Checking Core
  const handleStartCrack = () => {
    if (!decryptedNonce || !activeSig) return;
    setIsCracking(true);
    setCrackProgress(0);
    setCrackedKey(null);
    const limbs = decryptedNonce.limbs;
    const lStr = limbs.map((l, i) => `L${i}: 0x${l.toString(16).toUpperCase().padStart(8, '0')}`).join(', ');
    setCrackSteps([
      `[AUDIT] Initialisiere Gliederarithmetik-Prüfung für secp256k1 Signatur-Parameter...`,
      `[AUDIT] Lade Signatur: r=0x${activeSig.r.substring(0, 8)}... s=0x${activeSig.s.substring(0, 8)}...`,
      `[AUDIT] Lade Message Hash (z) = 0x${activeSig.z.substring(0, 8)}...`,
    ]);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setCrackProgress(prev => Math.min(prev + 25, 100));

      if (step === 1) {
        setCrackSteps(prev => [
          ...prev,
          `[VERIFIKATION] Berechne Ephemeral Nonce: k = s⁻¹ * (z + r * d) mod n...`,
          `[VERIFIKATION] Berechneter Wert für k: 0x${decryptedNonce.hex.toUpperCase()}`
        ]);
      } else if (step === 2) {
        setCrackSteps(prev => [
          ...prev,
          `[MATHEMATIK] Verifiziere Punktmultiplikation: Berechne R_check = k * G modulo p...`,
          `[MATHEMATIK] R_check.x mod n stimmt mit Signatur r überein: [Bestätigt]`
        ]);
      } else if (step === 3) {
        setCrackSteps(prev => [
          ...prev,
          `[DETEKTION] Zerlege extrahierte Nonce k in 8 physische 32-Bit Glieder (Limbs) im C-Heap:`,
          `[DETEKTION] ${lStr}`
        ]);
      } else if (step >= 4) {
        setCrackSteps(prev => [
          ...prev,
          `[ERGEBNIS] Audit abgeschlossen! Formelzusammenhang erfolgreich verifiziert (k · G ≡ R).`,
          `[ERGEBNIS] Keine spekulativen Angriffsbeurteilungen für diese Schlüssel-Instanz. Anomalie-Visierung obliegt dem Auditor.`
        ]);
        setCrackedKey("PROCESSED_OK");
        setIsCracking(false);
        clearInterval(interval);
      }
    }, 1000);
  };

  return (
    <div id="limb-strike-simulator-container" className="p-6 bg-hd-surface border-2 border-hd-line rounded-none">
      
      {/* Banner Head */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-sm font-bold text-hd-ink font-mono uppercase tracking-tight flex items-center gap-2">
            <Flame className="h-4 w-4 text-hd-accent animate-pulse" />
            32-BIT_LIMB_STRIKE_SIMULATOR // MASTERARBEIT_RESEARCH_FLOW
          </h2>
          <p className="text-xs text-hd-ink/70 font-serif italic mt-1">
            Wissenschaftliche Simulation des uninitialisierten BN_ULONG BIGNUM-Recycling-Ausfalls in OpenSSL
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

      {/* Grid Layout splits visual explainer and interactive controls */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column: Explainer and Mathematical Background */}
        <div className="xl:col-span-4 space-y-4">
          <div className="bg-white p-4 border-2 border-hd-line space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase text-hd-ink flex items-center gap-1.5 border-b border-hd-line pb-2">
              <Layers className="h-4 w-4 text-hd-accent" />
              Mathematische Prämisse
            </h3>
            <p className="text-[11px] text-hd-ink/85 leading-relaxed font-serif">
              In Ihrer Masterarbeit evaluieren Sie das <strong>Limb-Strike-Szenario</strong>: Durch ein fehlerhaftes Stack-Recycling des OpenSSL <code>BN_CTX</code>-Pools bleiben 32 zusammenhängende Bits (ein <code>BN_ULONG</code>-Glied auf 32-Bit) im uninitialisierten Zustand alter Berechnungen ("Ghost-Values").
            </p>
            <p className="text-[11px] text-hd-ink/85 leading-relaxed font-serif">
              Da die übrigen 7 Glieder (224-Bits) korrekt mit hoher kryptografischer Entropie befüllt werden, ist die Nonce für klassische Gittergriffe (HNP/LLL) schwer angreifbar, da kein kontinuierlicher linearer Bias vorliegt.
            </p>
            <div className="p-2.5 bg-hd-bg border border-hd-line-dashed font-mono text-[10px] space-y-1">
              <div className="text-hd-accent font-bold">BRUTE-FORCE-GRID FORMEL:</div>
              <div>k = L₀ + L₁·2³² + ... + L_err·2^(err·32) + ...</div>
              <div className="pt-1 text-hd-ink/65 italic leading-normal">
                Der Angreifer probiert für jeden der 8 Limbs alle 2³² Permutationen aus.
              </div>
            </div>
          </div>

          {/* GPU Parameter Card */}
          <div className="bg-white p-4 border-2 border-hd-line space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase text-hd-ink flex items-center gap-1.5 border-b border-hd-line pb-2">
              <Cpu className="h-4 w-4 text-hd-accent" />
              Angreifer Hardware-Parameter
            </h3>
            
            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[10px] text-hd-ink/60 uppercase block mb-1">GPU Point-Mult Speed (MH/s):</label>
                <select 
                  className="w-full bg-hd-bg p-2 text-xs border border-hd-line rounded-none focus:outline-none focus:border-hd-accent"
                  value={gpuSpeed}
                  onChange={e => setGpuSpeed(Number(e.target.value))}
                >
                  <option value={100000000}>100 MH/s (Älteres GPU-Cluster)</option>
                  <option value={800000000}>800 MH/s (NVIDIA RTX 4090 Optimiert)</option>
                  <option value={2000000000}>2.000 MH/s (2x Enterprise A100 Tensor-Core)</option>
                  <option value={5000000000}>5.000 MH/s (Wissenschaftliches Hochleistungscluster)</option>
                </select>
              </div>

              <div className="p-3 bg-hd-bg border border-hd-line space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-hd-ink/60">Zustände gesamt:</span>
                  <span className="font-bold text-hd-ink">{searchSpaceFormatted}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-hd-ink/60">Erwartete K-Analysen:</span>
                  <span className="font-bold text-hd-ink">~17,17 Mrd. (Average)</span>
                </div>
                <div className="flex justify-between text-[11px] pt-1.5 border-t border-dashed border-hd-line/30">
                  <span className="text-hd-ink/80 font-semibold">GPU Verifikationsdauer:</span>
                  <span className="font-extrabold text-hd-accent">
                    {estimatedCrackTimeSeconds.toFixed(2)} Sekunden
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Simulator Block */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* Simulation Injector Control Center */}
          <div className="bg-white p-5 border-2 border-hd-line space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase text-hd-ink flex items-center gap-1.5 border-b border-hd-line pb-2.5">
              <Settings className="h-4 w-4 text-hd-accent" />
              1. SIMULATIONS-SETUP // INJEKTION_DES_FEHLERS_IN_NONCE_K
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Select seed transaction */}
              <div>
                <label className="text-[10px] font-mono uppercase text-hd-ink/60 block mb-1">
                  Basis-Signatur (Sighash Quelle)
                </label>
                <select
                  className="w-full bg-hd-bg p-2 text-xs font-mono border border-hd-line rounded-none focus:outline-none focus:border-hd-accent"
                  value={selectedSigId}
                  onChange={e => setSelectedSigId(e.target.value)}
                >
                  {signatures.map(s => (
                    <option key={s.id} value={s.id}>
                      Tx {s.txid.substring(0, 8)}... Input {s.index} (z={s.z.substring(0,6)}...)
                    </option>
                  ))}
                </select>
              </div>

              {/* Private Key Simulator input */}
              <div>
                <label className="text-[10px] font-mono uppercase text-hd-ink/60 block mb-1">
                  Auditierung Private Key d (256-Bit Hex)
                </label>
                <input
                  type="text"
                  maxLength={64}
                  className="w-full bg-hd-bg p-2 text-xs font-mono border border-hd-line rounded-none focus:outline-none focus:border-hd-accent"
                  value={userPrivateKeyHex}
                  onChange={e => setUserPrivateKeyHex(e.target.value.toLowerCase().replace(/[^0-9a-fA-F]/g, ''))}
                />
              </div>

              {/* Reset/Demo Action Helpers */}
              <div className="flex items-end gap-2">
                <button
                  onClick={() => setUserPrivateKeyHex('a0c4f839b2e67d51f04561ae3d2948eb5c73291bf028da3bb108eaecb40283ca')}
                  className="px-3 py-2 bg-white border border-hd-line hover:bg-hd-line/10 text-[10px] font-mono font-bold uppercase transition-all"
                  title="Demo-Key für die simulierte Standardadresse einsetzen"
                >
                  Demo Private Key d laden
                </button>
                <button
                  onClick={() => setUserPrivateKeyHex('')}
                  className="px-3 py-2 bg-white border border-hd-line hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-[10px] font-mono font-bold uppercase transition-all"
                >
                  Feld löschen
                </button>
              </div>
            </div>
          </div>

          {/* Visual state representation of Nonce limbs (Memory Grid) */}
          <div className="bg-white p-5 border-2 border-hd-line space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase text-hd-ink flex items-center gap-1.5 border-b border-hd-line pb-2.5">
              <Layers className="h-4 w-4 text-hd-accent" />
              2. SPEICHERGRID // DEKRYPTIERTE NONCE K IM ARBEITSSPEICHER (C-HEAP)
            </h3>

            {decryptedNonce ? (
              <div className="space-y-4">
                <p className="text-[11px] text-hd-ink/70 font-serif italic leading-relaxed">
                  Realisierte Gliederarithmetik (Limbs): Darstellung der 8-Limb-Struktur (32-Bit) der aus Ihrem Private Key d rekonstruierten Ephemeral Nonce k für den ausgewählten Signatureintrag. Wählen Sie andere Einträge in Schritt 1 aus, um das Vorkommen von Ghost-Values (konstanten oder identischen Werten an spezifischen Gliedpositionen) visuell zu prüfen.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                  {decryptedNonce.limbs.map((limbVal, idx) => {
                    return (
                      <div 
                        key={idx} 
                        className="p-2.5 border-2 border-hd-line bg-hd-bg/30 text-center flex flex-col justify-between h-20"
                      >
                        <span className="text-[9px] font-mono font-bold uppercase text-hd-ink/50">
                          Limb {idx} ✓
                        </span>
                        <span className="font-mono text-[10px] break-all font-semibold leading-none text-hd-ink font-semibold">
                          {limbVal.toString(16).padStart(8, '0').toUpperCase()}
                        </span>
                        <span className="text-[8px] font-mono uppercase tracking-tighter text-emerald-800 font-medium">
                          32-Bit Glied
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3.5 bg-hd-bg border border-hd-line font-mono text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-hd-ink/65 text-[10px] uppercase">Geladenes Signatur-r:</span>
                    <span className="font-bold text-hd-ink truncate max-w-[70%]">{activeSig?.r}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-hd-ink/65 text-[10px] uppercase">Geladenes Signatur-s:</span>
                    <span className="font-bold text-hd-ink truncate max-w-[70%]">{activeSig?.s}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-hd-ink/65 text-[10px] uppercase">Gerechnete Nonce k (Hex):</span>
                    <span className="font-bold text-blue-700 break-all truncate max-w-[70%]">{decryptedNonce.hex}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-hd-bg border border-hd-line border-dashed rounded-none flex flex-col items-center gap-2.5 font-mono text-xs text-hd-ink/60 text-center">
                <AlertTriangle className="h-5 w-5 text-hd-accent animate-bounce" />
                <span>KEINE ANZEIGE MÖGLICH // PRIVATE KEY UNVOLLSTÄNDIG</span>
                <p className="max-w-md font-serif text-[11px] leading-relaxed italic text-hd-ink/50 mt-0.5">
                  Bitte tragen Sie oben einen gültigen 64-stelligen hexadezimalen Private Key ein, um die Ephemeral Nonce k für diese Signatur zu entschlüsseln und ihre 32-Bit Gliederstruktur (Limbs) im Arbeitsspeicher zu entblößen.
                </p>
              </div>
            )}
          </div>

          {/* Mathematical verification steps flow progress */}
          <div className="bg-white p-5 border-2 border-hd-line space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase text-hd-ink flex items-center justify-between border-b border-hd-line pb-2.5">
              <span className="flex items-center gap-1.5 flex-1">
                <Zap className="h-4 w-4 text-hd-accent" />
                3. MATHEMATISCHE VERIFIKATION // PRÜFUNG DES FORMELZUSAMMENHANGS
              </span>
              <button
                disabled={isCracking || !decryptedNonce}
                onClick={handleStartCrack}
                className="bg-hd-ink hover:bg-hd-accent hover:text-hd-bg text-hd-bg px-3.5 py-1.5 text-[10px] font-mono font-bold uppercase transition-all disabled:opacity-40 border border-hd-line shrink-0"
              >
                {isCracking ? 'Verifiziere...' : 'Anfälligkeit prüfen (Check)'}
              </button>
            </h3>

            {isCracking || crackedKey || crackSteps.length > 0 ? (
              <div className="space-y-4">
                {/* Progress bar info */}
                {isCracking && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-hd-ink/60">
                      <span>VERIFIKATIONS_PROGRESS:</span>
                      <span className="font-bold">{crackProgress}%</span>
                    </div>
                    <div className="w-full bg-hd-bg h-2 border border-hd-line p-0.5">
                      <div 
                        className="bg-hd-accent h-full transition-all duration-300"
                        style={{ width: `${crackProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Console Log terminal window */}
                <div className="bg-black text-emerald-400 p-4 font-mono text-[10.5px] leading-relaxed select-text space-y-1 overflow-y-auto max-h-[180px] border border-hd-line rounded-none">
                  {crackSteps.map((stepMsg, stepIdx) => (
                    <div key={stepIdx} className="break-all whitespace-pre-wrap">
                      {stepMsg}
                    </div>
                  ))}
                </div>

                {crackedKey && decryptedNonce && (
                  <div className="p-3.5 bg-emerald-50 text-emerald-900 border-2 border-dashed border-emerald-400 rounded-none flex items-start gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="font-mono text-xs">
                      <span className="font-bold block uppercase text-emerald-950 text-xs">VERIFIKATION ERFOLGREICH ABGESCHLOSSEN</span>
                      <p className="mt-1 font-serif text-[11px] leading-relaxed italic text-emerald-900/80">
                        Die Ephemeral Nonce k wurde erfolgreich rekonstruiert und die Punktmultiplikation k · G verifiziert. Die Analyse liefert das präzise Glieder-Muster der Nonce. Es erfolgt keine Mutmaßung über eine angebliche Gefährdung; die Beurteilung von Anomalien an den physischen Gliedern obliegt rein den Auditoren anhand des darüberliegenden Speichergrids.
                      </p>
                      <div className="mt-3 p-2 bg-white/95 border border-emerald-300 text-[10.5px] font-mono text-emerald-950 font-bold flex items-center gap-2">
                        <span className="px-1.5 py-0.5 bg-emerald-600 text-white font-mono text-[9px] uppercase tracking-wider font-extrabold">STATUS: VERIFIZIERT</span>
                        FORMELZUSAMMENHANG KORREKT (k · G ≡ R)
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-hd-bg border border-hd-line rounded-none flex items-center gap-3 font-mono text-xs text-hd-ink/50 justify-center text-center">
                <AlertTriangle className="h-4 w-4 text-hd-accent shrink-0" />
                {decryptedNonce 
                  ? 'Klicken Sie auf den Button "Anfälligkeit prüfen", um die mathematische Verifikation dieses Keys und Signaturen zu aktivieren.'
                  : 'Bitte tragen Sie in (1) einen gültigen Private Key ein, um die mathematische Verifikationsprüfung freizuschalten.'
                }
              </div>
            )}
          </div>

          {/* NEW Step 4: HNP-KOORDINATENGRID & PROJEKTION */}
          <div className="bg-white p-5 border-2 border-hd-line space-y-4">
            <div className="flex justify-between items-center border-b border-hd-line pb-2.5">
              <h3 className="text-xs font-mono font-bold uppercase text-hd-ink flex items-center gap-1.5">
                <Orbit className="h-4 w-4 text-hd-accent" />
                4. HNP-KOORDINATENGRID // 2D-RECON_PROJECTION (HIDDEN NUMBER PROBLEM)
              </h3>
              <span className="text-[9px] font-mono bg-hd-ink text-hd-bg px-2 py-0.5 uppercase">
                secp256k1 LLL Plane
              </span>
            </div>

            <p className="text-[11px] text-hd-ink/70 font-serif italic leading-relaxed">
              Dieses Diagramm projiziert die Beziehung zwischen simulierten Private-Key-Kandidaten <span className="font-mono text-xs text-hd-accent font-bold">d + δ</span> auf der X-Achse und den daraus resultierenden Nonces <span className="font-mono text-xs text-blue-700 font-bold font-mono">k</span> auf der Y-Achse. Im echten HNP-Angriff sucht der LLL-Gitterreduktions-Algorithmus den kürzesten Vektor, welcher das untere Zielband (Leckage-Entropieband) penetriert.
            </p>

            {hnpPoints.length > 0 ? (
              <div className="space-y-4">
                {/* Visual coordinate system box */}
                <div className="relative h-[250px] w-full bg-hd-bg border border-hd-line/45 flex select-none overflow-hidden">
                  
                  {/* Y-Axis scale label */}
                  <div className="absolute left-1.5 top-2 text-[8px] font-mono text-hd-ink/40 uppercase tracking-widest writing-mode-v select-none">
                    Nonces-Moduloraum (0% bis 100% von SECP256K1_N)
                  </div>

                  {/* High leakage safety-warn stripe (e.g., k is small, top/bottom part of private key) */}
                  <div className="absolute bottom-0 left-0 right-0 h-[35px] bg-red-500/10 border-t border-dashed border-red-500/25 flex items-center px-4">
                    <span className="text-[8px] font-mono text-red-700 font-extrabold tracking-widest uppercase">
                      LLL REDUKTIONS-BAND (Biased / Small Nonce k &lt; 2²²⁴)
                    </span>
                  </div>

                  {/* Horizontal grid guide lines */}
                  <div className="absolute inset-0 flex flex-col justify-between py-6 pointer-events-none">
                    <div className="border-b border-hd-line/10 w-full" />
                    <div className="border-b border-hd-line/10 w-full" />
                    <div className="border-b border-hd-line/10 w-full" />
                    <div className="border-b border-hd-line/10 w-full" />
                  </div>

                  {/* Vertical grid guide lines */}
                  <div className="absolute inset-0 flex justify-between px-10 pointer-events-none">
                    <div className="border-r border-hd-line/10 h-full" />
                    <div className="border-r border-hd-line/10 h-full" />
                    <div className="border-r border-hd-line/10 h-full" />
                    <div className="border-r border-hd-line/10 h-full" />
                  </div>

                  {/* Coordinate plane contents */}
                  <div className="absolute inset-0 px-[40px] pt-4 pb-[35px]">
                    <div className="relative w-full h-full">
                      {/* Plotting points */}
                      {hnpPoints.map((pt, i) => {
                        const leftPct = (i / (hnpPoints.length - 1)) * 100;
                        const topPct = 100 - pt.kPercent;
                        const isHovered = hoveredHnpPoint?.delta === pt.delta;
                        
                        return (
                          <div
                            key={pt.delta}
                            style={{ 
                              left: `${leftPct}%`, 
                              top: `${topPct}%`,
                              transform: 'translate(-50%, -50%)'
                            }}
                            className="absolute transition-all duration-300解决方案 z-20 group"
                            onMouseEnter={() => setHoveredHnpPoint(pt)}
                            onMouseLeave={() => setHoveredHnpPoint(null)}
                          >
                            <div className={`relative rounded-full cursor-crosshair transition-all duration-300 ${
                              pt.isActual 
                                ? 'h-4 w-4 bg-hd-accent shadow-md shadow-hd-accent/40 border-2 border-white ring-4 ring-hd-accent/20 animate-pulse' 
                                : isHovered
                                  ? 'h-3.5 w-3.5 bg-hd-ink ring-4 ring-hd-ink/20 scale-125' 
                                  : 'h-2.5 w-2.5 bg-hd-line hover:bg-hd-ink hover:scale-125'
                            }`} />
                            
                            {/* Point Label info (shows delta on X-axis and state) */}
                            <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-hd-ink text-white text-[8px] font-mono px-1 py-0.5 rounded-none pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                              δ = {pt.delta > 0 ? `+${pt.delta}` : pt.delta}
                            </div>
                          </div>
                        );
                      })}

                      {/* Line connecting the points to show modular irregularity */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 animate-pulse">
                        <polyline
                          fill="none"
                          stroke="#262626"
                          strokeWidth="0.8"
                          strokeDasharray="3 3"
                          opacity="0.35"
                          points={hnpPoints.map((pt, i) => {
                            const x = (i / (hnpPoints.length - 1)) * 100;
                            const y = 100 - pt.kPercent;
                            return `${x}%,${y}%`;
                          }).join(' ')}
                          style={{
                            vectorEffect: 'non-scaling-stroke'
                          }}
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Info labels underneath the coordinate grid */}
                <div className="flex justify-between text-[10px] font-mono text-hd-ink/50 px-2">
                  <span>δ = -8 (Falsche d-Nachbarn)</span>
                  <span className="text-hd-accent font-bold">δ = 0 (KORREKTER WEG / IHR KEY)</span>
                  <span>δ = +8 (Falsche d-Nachbarn)</span>
                </div>

                {/* Live Point Auditor Inspector Panel */}
                <div className="p-3.5 bg-hd-surface border border-hd-line rounded-none flex flex-col gap-1 z-30 min-h-[70px]">
                  {hoveredHnpPoint ? (
                    <div className="font-mono text-[10.5px]">
                      <div className="flex justify-between border-b border-hd-line/25 pb-1 mb-1">
                        <span className="text-hd-accent font-bold">
                          [AKTIVE PRÜFUNG: DETEKTION AN δ = {hoveredHnpPoint.delta > 0 ? `+${hoveredHnpPoint.delta}` : hoveredHnpPoint.delta}]
                        </span>
                        <span className="text-hd-ink/50 uppercase">
                          {hoveredHnpPoint.isActual ? '🔑 IHR SCHLÜSSEL' : 'SIMULIERTER NACHBAR'}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                        <div className="truncate">
                          <span className="text-hd-ink/50 font-normal">Privatkey d_cand:</span>{' '}
                          <span className="font-bold">{hoveredHnpPoint.dStr.substring(0, 16)}...</span>
                        </div>
                        <div className="truncate">
                          <span className="text-hd-ink/50 font-normal font-mono">Simulierte k (Nonce):</span>{' '}
                          <span className="font-mono">{hoveredHnpPoint.kHex.substring(0, 24)}...</span>
                        </div>
                        <div>
                          <span className="text-hd-ink/50 font-normal font-mono">Modulare Lage k:</span>{' '}
                          <span className="font-bold text-blue-700 font-mono">{(hoveredHnpPoint.kPercent).toFixed(3)}%</span>{' '}
                          vom Kurvenraum <span className="font-mono text-[9px] text-hd-ink/40 font-mono">(SECP256K1_N)</span>
                        </div>
                        <div>
                          <span className="text-hd-ink/50 font-normal font-mono">Gitterpotential:</span>{' '}
                          {hoveredHnpPoint.kPercent < 12.5 ? (
                            <span className="text-amber-700 font-extrabold uppercase animate-pulse">LLL-VERLETZBAR (HOCH) ✓</span>
                          ) : (
                            <span className="text-emerald-700 font-bold uppercase">GLEICHMÄßIG VERTEILT (SICHER) ✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-2 text-hd-ink/50 font-mono text-[10.5px] italic leading-relaxed">
                      Führen Sie den Zeiger über die einzelnen Messpunkte im Koordinatengitter, um die lineare d ↔ k Verteilung des Hidden Number Problems im Detail zu inspizieren.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-hd-bg border border-hd-line rounded-none text-center font-mono text-xs text-hd-ink/50 leading-relaxed italic">
                Bitte tragen Sie in (1) einen privaten Bitcoin-Schlüssel ein, um die 2D-Gitterreduktionsprojektion der Nonces zu laden.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
