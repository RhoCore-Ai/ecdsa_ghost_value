/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TransactionData, TransactionInput } from '../types';
import { Search, Info, Award, Wallet, ShieldAlert, Cpu, Maximize2, Minimize2 } from 'lucide-react';

interface TransactionsTableProps {
  transactions: TransactionData[];
  selectedInput: { txid: string; index: number } | null;
  onSelectInput: (txid: string, index: number) => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

export default function TransactionsTable({
  transactions,
  selectedInput,
  onSelectInput,
  isMaximized = false,
  onToggleMaximize,
}: TransactionsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'P2PKH' | 'P2PK'>('ALL');

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.txid.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (typeFilter === 'ALL') return true;
    return tx.inputs.some(input => input.prevType === typeFilter);
  });

  return (
    <div id="transactions-table-container" className="p-6 bg-hd-surface rounded-none border-2 border-hd-line">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex justify-between items-start w-full sm:w-auto gap-4">
          <div>
            <h2 className="text-sm font-bold text-hd-ink font-mono uppercase tracking-tight flex items-center gap-2">
              <Wallet className="h-4 w-4 text-hd-accent" />
              BITCOIN_HAUPTBUCH // DETECTED_LEDGER
            </h2>
            <p className="text-xs text-hd-ink/70 font-serif italic mt-1">
              Gefundene Transaktionen für Adresse <span className="font-mono text-hd-accent text-xs font-semibold">1GiFy...PeN</span>
            </p>
          </div>
          {onToggleMaximize && (
            <button
              onClick={onToggleMaximize}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border-2 border-hd-line hover:bg-hd-ink hover:text-hd-bg transition-all text-xs font-mono font-bold uppercase shrink-0 sm:hidden"
              title={isMaximized ? "Vollbild schließen" : "Vollbild öffnen"}
            >
              {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              {isMaximized ? "Normal" : "Vollbild"}
            </button>
          )}
        </div>
        {onToggleMaximize && (
          <button
            onClick={onToggleMaximize}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-white border-2 border-hd-line hover:bg-hd-ink hover:text-hd-bg transition-all text-xs font-mono font-bold uppercase shrink-0"
            title={isMaximized ? "Vollbild schließen" : "Vollbild öffnen"}
          >
            {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            {isMaximized ? "Normal" : "Vollbild"}
          </button>
        )}

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Filter buttons */}
          <div className="bg-hd-bg p-1 rounded-none border-2 border-hd-line flex text-[11px] font-mono">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-2.5 py-1 rounded-none font-bold transition-all ${
                typeFilter === 'ALL'
                  ? 'bg-hd-ink text-hd-bg'
                  : 'text-hd-ink/70 hover:text-hd-ink'
              }`}
            >
              ALLE
            </button>
            <button
              onClick={() => setTypeFilter('P2PKH')}
              className={`px-2.5 py-1 rounded-none font-bold transition-all ${
                typeFilter === 'P2PKH'
                  ? 'bg-hd-ink text-hd-bg'
                  : 'text-hd-ink/70 hover:text-hd-ink'
              }`}
            >
              P2PKH
            </button>
            <button
              onClick={() => setTypeFilter('P2PK')}
              className={`px-2.5 py-1 rounded-none font-bold transition-all ${
                typeFilter === 'P2PK'
                  ? 'bg-hd-ink text-hd-bg'
                  : 'text-hd-ink/70 hover:text-hd-ink'
              }`}
            >
              P2PK
            </button>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-hd-ink/40" />
        </span>
        <input
          type="text"
          className="w-full bg-white text-hd-ink placeholder-hd-ink/40 text-xs pl-10 pr-4 py-2.5 rounded-none border-2 border-hd-line focus:outline-none focus:border-hd-accent transition-all font-mono"
          placeholder="SUCHE_TXID // ID_KEY..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Ledger Cards */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {filteredTransactions.map(tx => {
          const isTxSelected = selectedInput?.txid === tx.txid;

          return (
            <div
              key={tx.txid}
              className={`bg-white rounded-none p-4 border-2 transition-all ${
                isTxSelected ? 'border-hd-accent shadow-[4px_4px_0px_0px_#141414]' : 'border-hd-line'
              }`}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-3">
                <div className="flex items-center gap-2 max-w-full">
                  <span className="px-2 py-0.5 bg-hd-surface text-hd-ink font-mono text-[10px] rounded-none border border-hd-line font-bold">
                    TXID
                  </span>
                  <p className="text-xs font-mono text-hd-ink font-semibold truncate max-w-[200px] md:max-w-[400px]" title={tx.txid}>
                    {tx.txid}
                  </p>
                </div>
                <div className="text-right flex items-center md:flex-col gap-2 md:gap-0 mt-1 md:mt-0">
                  <span className="text-xs font-bold text-hd-accent font-mono">
                    {tx.totalBtcIn.toFixed(2)} BTC In
                  </span>
                  <span className="text-[10px] text-hd-ink/50 font-serif italic uppercase">
                    {tx.inputs.length} {tx.inputs.length === 1 ? 'Input' : 'Inputs'}
                  </span>
                </div>
              </div>

              {/* Input list under each TX */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                {tx.inputs
                  .filter(inp => typeFilter === 'ALL' || inp.prevType === typeFilter)
                  .map(inp => {
                    const isSelected = selectedInput?.txid === tx.txid && selectedInput?.index === inp.index;

                    return (
                      <button
                        key={inp.index}
                        onClick={() => onSelectInput(tx.txid, inp.index)}
                        className={`text-left p-2.5 rounded-none border transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-hd-ink text-hd-bg border-hd-ink'
                            : 'bg-hd-surface/45 hover:bg-hd-surface border-hd-line text-hd-ink hover:border-hd-accent'
                        }`}
                      >
                        <div className="flex justify-between items-center w-full mb-1">
                          <span className={`text-[10px] font-mono font-bold uppercase ${isSelected ? 'text-hd-bg/70' : 'text-hd-ink/60'}`}>
                            Input #{inp.index}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded-none text-[8px] font-mono font-bold border ${
                              inp.prevType === 'P2PKH'
                                ? isSelected ? 'bg-hd-surface text-hd-ink border-white/20' : 'bg-white text-hd-accent border-hd-accent/30'
                                : isSelected ? 'bg-hd-surface text-hd-ink border-white/20' : 'bg-white text-hd-ink border-hd-line/45'
                            }`}
                          >
                            {inp.prevType}
                          </span>
                        </div>

                        <div className="flex justify-between items-baseline mt-2">
                          <div className="flex flex-col">
                            <span className={`text-[9px] ${isSelected ? 'text-hd-bg/50' : 'text-hd-ink/50'}`}>Betrag</span>
                            <span className={`text-xs font-bold font-mono ${isSelected ? 'text-hd-bg' : 'text-hd-ink'}`}>
                              {inp.amountBtc.toFixed(2)} BTC
                            </span>
                          </div>

                          <div className="text-right">
                            <span className={`text-[9px] ${isSelected ? 'text-hd-bg/50' : 'text-hd-ink/50'} block`}>Schnittstelle</span>
                            <span className={`text-[10px] font-mono font-bold flex items-center justify-end gap-1 ${isSelected ? 'text-hd-bg/95' : 'text-hd-accent'}`}>
                              <Cpu className="h-3 w-3" />
                              {inp.parsedSig ? 'r,s Parst' : 'Keine Sig'}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          );
        })}

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12 bg-white/40 rounded-none border-2 border-hd-line border-dashed">
            <ShieldAlert className="h-8 w-8 text-hd-ink/40 mx-auto mb-2" />
            <p className="text-sm text-hd-ink/70">Keine Transaktionen gefunden, die dem Suchfilter entsprechen.</p>
          </div>
        )}
      </div>
    </div>
  );
}
