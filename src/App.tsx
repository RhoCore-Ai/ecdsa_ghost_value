/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { getParsedTransactions } from './data/transactions';
import { TransactionData } from './types';
import TransactionsTable from './components/TransactionsTable';
import MetricsDashboard from './components/MetricsDashboard';
import LimbVisualizer from './components/LimbVisualizer';
import AIExplanation from './components/AIExplanation';
import ImportExportControl from './components/ImportExportControl';
import LimbStrikeSimulator from './components/LimbStrikeSimulator';
import { pubKeyToP2PKHAddress } from './utils/crypto';
import { Shield, KeyRound, Layers, BarChart3, Sparkles, Flame, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [currentPubKey, setCurrentPubKey] = useState<string>('04450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58');

  // Selected input element for active math inspections
  const [selectedInput, setSelectedInput] = useState<{ txid: string; index: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'SIMULATOR' | 'LIMB' | 'METRICS' | 'AI'>('SIMULATOR');

  // Full Screen panel magnification state
  const [maximizedPanel, setMaximizedPanel] = useState<'IMPORT' | 'TABLE' | 'SIMULATOR' | 'LIMB' | 'METRICS' | 'AI' | null>(null);

  // Close overlay on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMaximizedPanel(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load initial demo transactions on mount
  useEffect(() => {
    const demoTxs = getParsedTransactions();
    setTransactions(demoTxs);
    
    // Initialize selectedInput with the first available input containing a signature
    if (demoTxs.length > 0) {
      const firstTx = demoTxs[0];
      const firstInpWithSig = firstTx.inputs.find(inp => inp.parsedSig);
      if (firstInpWithSig) {
        setSelectedInput({
          txid: firstTx.txid,
          index: firstInpWithSig.index,
        });
      }
    }
  }, []);

  // Compute the current active legacy P2PKH address for information displays
  const currentAddress = useMemo(() => {
    return pubKeyToP2PKHAddress(currentPubKey);
  }, [currentPubKey]);

  const handleImportSuccess = (newTxs: TransactionData[], pubKey: string) => {
    setTransactions(newTxs);
    setCurrentPubKey(pubKey);
    
    // Automatically select the first input with signature of the new dataset
    if (newTxs.length > 0) {
      const firstTx = newTxs[0];
      const firstInpWithSig = firstTx.inputs.find(inp => inp.parsedSig);
      if (firstInpWithSig) {
        setSelectedInput({
          txid: firstTx.txid,
          index: firstInpWithSig.index,
        });
      }
    }
  };

  // Retrieve current active signature values
  const getSelectedSigDetails = () => {
    if (!selectedInput) return null;
    const tx = transactions.find(t => t.txid === selectedInput.txid);
    if (!tx) return null;
    const inp = tx.inputs.find(i => i.index === selectedInput.index);
    if (!inp || !inp.parsedSig) return null;
    return {
      r: inp.parsedSig.r,
      s: inp.parsedSig.s,
    };
  };

  const activeSig = getSelectedSigDetails();

  return (
    <div className="min-h-screen bg-hd-bg text-hd-ink flex flex-col font-sans selection:bg-hd-accent/20 selection:text-hd-ink">
      {/* Top Banner Header */}
      <header className="border-b-2 border-hd-line bg-hd-surface sticky top-0 z-50 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white border border-hd-line flex items-center justify-center">
            <Shield className="h-5 w-5 text-hd-accent" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-hd-ink tracking-tight font-mono uppercase">
              SECP256K1_CRYPTANALYSIS // SYSTEM_V.4.2
            </h1>
            <p className="text-[10px] text-hd-ink/60 font-serif italic tracking-wide">
              Ledger-Analyse • Gliederarithmetik (Limb-by-Limb) • Signatur-Biasevaluierung
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-hd-ink/50 font-serif italic hidden md:inline">SOURCE: Public_Dataset_77A</span>
          {/* Status Tag */}
          <div className="bg-hd-ink text-hd-bg px-2 py-1 text-[10px] uppercase font-bold tracking-wider border border-hd-line">
            Status: Berechnet
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="flex-1 p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 max-w-7xl mx-auto w-full">
        
        {/* Full span Import/Export Center control panel */}
        <div className="xl:col-span-12">
          <ImportExportControl 
            transactions={transactions}
            onImportSuccess={handleImportSuccess}
            currentPubKey={currentPubKey}
            currentAddress={currentAddress}
            isMaximized={false}
            onToggleMaximize={() => setMaximizedPanel('IMPORT')}
          />
        </div>

        {/* Left Side: Ledger database Table (Takes 5 cols on widescreen) */}
        <div className="xl:col-span-5 h-full space-y-6 flex flex-col justify-start">
          <TransactionsTable
            transactions={transactions}
            selectedInput={selectedInput}
            onSelectInput={(txid, idx) => setSelectedInput({ txid, index: idx })}
            isMaximized={false}
            onToggleMaximize={() => setMaximizedPanel('TABLE')}
          />

          {/* Active Public Key inspector card */}
          <div className="p-4 bg-hd-surface rounded-none border border-hd-line font-mono">
            <h3 className="text-[11px] font-serif italic uppercase text-hd-ink/80 tracking-wider mb-2 font-normal flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-hd-accent" />
              Aktiver Analyseschlüssel (Uncompressed)
            </h3>
            <div className="p-2.5 bg-white border border-hd-line break-all text-[10px] leading-relaxed text-hd-ink/90">
              {currentPubKey}
            </div>
          </div>
        </div>

        {/* Right Side: Tabbed Analytical panel (Takes 7 cols on widescreen) */}
        <div className="xl:col-span-7 flex flex-col gap-6">
          
          {/* Navigation tabs */}
          <div className="bg-hd-surface p-1 rounded-none border border-hd-line flex flex-wrap w-full gap-1">
            <button
              onClick={() => setActiveTab('SIMULATOR')}
              className={`flex-1 min-w-[130px] py-2 px-3 font-semibold text-xs tracking-wide flex items-center justify-center gap-2 transition-all ${
                activeTab === 'SIMULATOR'
                  ? 'bg-hd-ink text-hd-bg border border-hd-line shadow-sm'
                  : 'text-hd-ink/70 hover:text-hd-ink hover:bg-white/40'
              }`}
            >
              <Flame className="h-3.5 w-3.5" />
              Glied-Strike (Limb Strike)
            </button>

            <button
              onClick={() => setActiveTab('LIMB')}
              className={`flex-1 min-w-[130px] py-2 px-2.5 font-semibold text-xs tracking-wide flex items-center justify-center gap-2 transition-all ${
                activeTab === 'LIMB'
                  ? 'bg-hd-ink text-hd-bg border border-hd-line shadow-sm'
                  : 'text-hd-ink/70 hover:text-hd-ink hover:bg-white/40'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              Limb-Borrow (Auswertung)
            </button>

            <button
              onClick={() => setActiveTab('METRICS')}
              className={`flex-1 min-w-[130px] py-2 px-2.5 font-semibold text-xs tracking-wide flex items-center justify-center gap-2 transition-all ${
                activeTab === 'METRICS'
                  ? 'bg-hd-ink text-hd-bg border border-hd-line shadow-sm'
                  : 'text-hd-ink/70 hover:text-hd-ink hover:bg-white/40'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Statistik-Metriken
            </button>

            <button
              onClick={() => setActiveTab('AI')}
              className={`flex-1 min-w-[130px] py-2 px-3 font-semibold text-xs tracking-wide flex items-center justify-center gap-2 transition-all ${
                activeTab === 'AI'
                  ? 'bg-hd-ink text-hd-bg border border-hd-line shadow-sm'
                  : 'text-hd-ink/70 hover:text-hd-ink hover:bg-white/40'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Kryptografie-KI
            </button>
          </div>

          {/* Active section pane */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {activeTab === 'SIMULATOR' && (
                <motion.div
                  key="limb-strike-simulator"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <LimbStrikeSimulator
                    transactions={transactions}
                    currentPubKey={currentPubKey}
                    isMaximized={false}
                    onToggleMaximize={() => setMaximizedPanel('SIMULATOR')}
                  />
                </motion.div>
              )}

              {activeTab === 'LIMB' && (
                <motion.div
                  key="limb-visualizer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <LimbVisualizer
                    transactions={transactions}
                    selectedInputSig={activeSig}
                    isMaximized={false}
                    onToggleMaximize={() => setMaximizedPanel('LIMB')}
                  />
                </motion.div>
              )}

              {activeTab === 'METRICS' && (
                <motion.div
                  key="metrics-dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <MetricsDashboard 
                    transactions={transactions}
                    isMaximized={false}
                    onToggleMaximize={() => setMaximizedPanel('METRICS')}
                  />
                </motion.div>
              )}

              {activeTab === 'AI' && (
                <motion.div
                  key="ai-explanation"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <AIExplanation 
                    isMaximized={false}
                    onToggleMaximize={() => setMaximizedPanel('AI')}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </main>

      {/* Full-screen overlay portal if a panel is maximized */}
      <AnimatePresence>
        {maximizedPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md p-4 sm:p-8 xl:p-12 overflow-y-auto flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.96, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 15 }}
              className="bg-hd-bg border-4 border-hd-line w-full max-w-7xl h-[90vh] flex flex-col shadow-2xl rounded-none"
            >
              {/* Overlay Header */}
              <div className="bg-hd-surface border-b-2 border-hd-line p-4 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-hd-accent animate-pulse"></div>
                  <span className="text-xs font-bold font-mono uppercase tracking-widest text-hd-ink">
                    Vollbildanalyse // MAXIMIERTE_ANSICHT: {maximizedPanel}
                  </span>
                </div>
                <button
                  onClick={() => setMaximizedPanel(null)}
                  className="px-3 py-1.5 bg-hd-ink text-hd-bg border border-hd-line hover:bg-hd-accent hover:text-hd-bg font-mono text-xs uppercase font-bold tracking-tight transition-all flex items-center gap-1.5"
                >
                  <Minimize2 className="h-4 w-4" />
                  Schließen (ESC)
                </button>
              </div>

              {/* Overlay Content body (Self-Scrollable) */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-8">
                {maximizedPanel === 'IMPORT' && (
                  <ImportExportControl
                    transactions={transactions}
                    onImportSuccess={handleImportSuccess}
                    currentPubKey={currentPubKey}
                    currentAddress={currentAddress}
                    isMaximized={true}
                    onToggleMaximize={() => setMaximizedPanel(null)}
                  />
                )}
                {maximizedPanel === 'TABLE' && (
                  <TransactionsTable
                    transactions={transactions}
                    selectedInput={selectedInput}
                    onSelectInput={(txid, idx) => setSelectedInput({ txid, index: idx })}
                    isMaximized={true}
                    onToggleMaximize={() => setMaximizedPanel(null)}
                  />
                )}
                {maximizedPanel === 'SIMULATOR' && (
                  <LimbStrikeSimulator
                    transactions={transactions}
                    currentPubKey={currentPubKey}
                    isMaximized={true}
                    onToggleMaximize={() => setMaximizedPanel(null)}
                  />
                )}
                {maximizedPanel === 'LIMB' && (
                  <LimbVisualizer
                    transactions={transactions}
                    selectedInputSig={activeSig}
                    isMaximized={true}
                    onToggleMaximize={() => setMaximizedPanel(null)}
                  />
                )}
                {maximizedPanel === 'METRICS' && (
                  <MetricsDashboard
                    transactions={transactions}
                    isMaximized={true}
                    onToggleMaximize={() => setMaximizedPanel(null)}
                  />
                )}
                {maximizedPanel === 'AI' && (
                  <AIExplanation
                    isMaximized={true}
                    onToggleMaximize={() => setMaximizedPanel(null)}
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Humble Footer */}
      <footer className="border-t border-hd-line bg-hd-surface py-5 mt-12 text-center text-[10px] text-hd-ink/50 font-mono flex flex-col sm:flex-row justify-between items-center px-12 gap-2">
        <span>© {new Date().getFullYear()} secp256k1 Cryptanalysis Laboratory. Alle Rechte vorbehalten.</span>
        <span className="text-hd-accent font-semibold uppercase tracking-wider">[OK] LIMB_CORE_INIT: SUCCESS</span>
      </footer>
    </div>
  );
}
