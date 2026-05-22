/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Send, ShieldCheck, HelpCircle, Loader2, Maximize2, Minimize2 } from 'lucide-react';

interface AIExplanationProps {
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

export default function AIExplanation({ isMaximized = false, onToggleMaximize }: AIExplanationProps) {
  const [messages, setMessages] = useState<{ sender: 'user' | 'assistant'; text: string }[]>([
    {
      sender: 'assistant',
      text: 'Willkommen beim kryptanalytischen KI-Assistenten. Ich helfe Ihnen, die mathematischen Details hinter secp256k1, Biased Nonces, Gitterreduktionsangriffen (HNP) und der Limb-by-Limb-Multi-Precision-Arithmetik zu verstehen.\n\nWählen Sie eine der unten stehen Fragen oder geben Sie ein eigenes Thema ein!'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestedQuestions = [
    'Wie funktioniert der Gitterangriff (LLL) auf biased nonces?',
    'Warum ist das Borrow-Bit wichtig für Side-Channel-Resistenz?',
    'Welche Gefahr besteht bei uncompressed public keys?',
    'Wie hängen s, r und z mathematisch mit dem Private Key d zusammen?'
  ];

  const handleSendPrompt = async (promptText: string) => {
    if (!promptText.trim() || loading) return;

    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text: promptText }]);
    setLoading(true);
    setInputValue('');

    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText })
      });

      const data = await response.json();
      if (data && data.text) {
        setMessages(prev => [...prev, { sender: 'assistant', text: data.text }]);
      } else {
        setMessages(prev => [...prev, { sender: 'assistant', text: 'Entschuldigung, die KI konnte keine Antwort generieren.' }]);
      }
    } catch (err) {
      console.error('API Error:', err);
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Entschuldigung, es konnte keine Verbindung zum Analyse-Server aufgebaut werden. Wir greifen auf die lokale Sicherheitserklärung zurück:\n\n**Analysedetails:** Jede Signatur der Form $s = k^{-1}(z + r \\cdot d) \\pmod n$ kann anfällig für Gitterangriffe sein, wenn die Zufallszahlen $k$ (Nonce) einen Bias (z. B. führende Nullen) aufweisen. Mittels des LLL-Gitterreduktions-Algorithmus kann über das Hidden Number Problem bereits nach Erhalt weniger Signaturen der private Schlüssel $d$ ausgeforscht werden.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="ai-explanation-container" className="p-6 bg-hd-surface rounded-none border-2 border-hd-line flex flex-col h-[520px]">
      <div className="mb-4 shrink-0 flex justify-between items-start gap-4">
        <div>
          <h2 className="text-sm font-bold text-hd-ink font-mono uppercase tracking-tight flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-hd-accent" />
            KRYPTANALYSE_KI_ASSISTENT // INTEGRATED_EXPLAINER
          </h2>
          <p className="text-xs text-hd-ink/70 font-serif italic mt-1">
            Ermitteln Sie die mathematischen Hintergründe von Modularrechnung, Gitter-Angriffen und Lecks
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

      {/* Message space */}
      <div className="flex-1 overflow-y-auto pr-2 mb-4 space-y-4 custom-scrollbar text-sm">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-4 py-3 rounded-none leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-hd-accent text-white font-bold border border-hd-line'
                  : 'bg-white text-hd-ink border-2 border-hd-line font-mono font-medium text-xs whitespace-pre-wrap'
              }`}
            >
              <div className="max-w-none text-xs leading-normal">
                {msg.text}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-hd-ink border-2 border-hd-line px-4 py-3 rounded-none flex items-center gap-2 font-mono text-xs">
              <Loader2 className="h-4 w-4 animate-spin text-hd-accent" />
              Berechne mathematische Hypothesen...
            </div>
          </div>
        )}
      </div>

      {/* Suggested Questions */}
      <div className="mb-3 flex flex-wrap gap-1.5 shrink-0">
        {suggestedQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSendPrompt(q)}
            disabled={loading}
            className="text-[10px] font-mono bg-white hover:bg-hd-bg text-hd-ink px-2.5 py-1 rounded-none border border-hd-line transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input zone */}
      <div className="flex items-center gap-2 mt-auto shrink-0">
        <input
          type="text"
          className="flex-1 bg-white border-2 border-hd-line rounded-none px-4 py-2.5 text-xs text-hd-ink placeholder-hd-ink/40 focus:outline-none focus:border-hd-accent font-mono"
          placeholder="FRAGE_STELLEN // SUBMIT_PROMPT..."
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleSendPrompt(inputValue);
          }}
          disabled={loading}
        />
        <button
          onClick={() => handleSendPrompt(inputValue)}
          className="bg-hd-ink hover:bg-hd-accent text-hd-bg p-2.5 rounded-none border-2 border-hd-line disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          disabled={!inputValue.trim() || loading}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
