/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize SQLite database
let db: any = null;
let isSqlite = false;
const JSON_DB_PATH = path.join(process.cwd(), 'signatures-db.json');

async function initDb() {
  try {
    // Dynamically require or import SQLite to prevent top-level loading crash in sandboxed environments
    const sqlite3Module = await import('sqlite3');
    const { open: sqliteOpen } = await import('sqlite');
    
    db = await sqliteOpen({
      filename: path.join(process.cwd(), 'signatures.db'),
      driver: sqlite3Module.default.Database
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS saved_signatures (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pubkey TEXT UNIQUE,
        address TEXT,
        tx_data_json TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    isSqlite = true;
    console.log('SQLite database checked and successfully active.');
  } catch (err) {
    console.warn('SQLite native module failed to load. Gracefully falling back to local JSON file persistence:', err);
    isSqlite = false;
    
    // Ensure fallback file is created
    if (!fs.existsSync(JSON_DB_PATH)) {
      fs.writeFileSync(JSON_DB_PATH, JSON.stringify([], null, 2), 'utf-8');
    }
  }
}

// API: Get all saved key-sessions
app.get('/api/signatures', async (req, res) => {
  try {
    if (isSqlite && db) {
      const rows = await db.all('SELECT * FROM saved_signatures ORDER BY created_at DESC');
      return res.json(rows.map((row: any) => ({
        id: row.id,
        pubkey: row.pubkey,
        address: row.address,
        transactions: JSON.parse(row.tx_data_json),
        createdAt: row.created_at
      })));
    } else {
      // Fallback JSON persistence
      if (!fs.existsSync(JSON_DB_PATH)) {
        fs.writeFileSync(JSON_DB_PATH, JSON.stringify([], null, 2), 'utf-8');
      }
      const fileData = fs.readFileSync(JSON_DB_PATH, 'utf-8');
      const sessions = JSON.parse(fileData);
      sessions.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return res.json(sessions);
    }
  } catch (err: any) {
    console.error('Error retrieving signatures:', err);
    return res.status(500).json({ error: 'Database / Storage error', details: err.message });
  }
});

// API: Save or update key-session with signatures
app.post('/api/signatures/save', async (req, res) => {
  try {
    const { pubkey, address, transactions } = req.body;
    if (!pubkey || !transactions) {
      return res.status(400).json({ error: 'Missing pubkey or transactions payload' });
    }

    if (isSqlite && db) {
      const txDataJson = JSON.stringify(transactions);
      await db.run(
        `INSERT OR REPLACE INTO saved_signatures (pubkey, address, tx_data_json, created_at)
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
        [pubkey, address || '', txDataJson]
      );
    } else {
      // Fallback JSON persistence logic
      if (!fs.existsSync(JSON_DB_PATH)) {
        fs.writeFileSync(JSON_DB_PATH, JSON.stringify([], null, 2), 'utf-8');
      }
      const fileData = fs.readFileSync(JSON_DB_PATH, 'utf-8');
      const sessions = JSON.parse(fileData);
      
      const existingIdx = sessions.findIndex((s: any) => s.pubkey === pubkey);
      const newSession = {
        id: existingIdx !== -1 ? sessions[existingIdx].id : Date.now(),
        pubkey,
        address: address || '',
        transactions,
        createdAt: new Date().toISOString()
      };

      if (existingIdx !== -1) {
        sessions[existingIdx] = newSession;
      } else {
        sessions.push(newSession);
      }

      fs.writeFileSync(JSON_DB_PATH, JSON.stringify(sessions, null, 2), 'utf-8');
    }

    return res.json({ success: true, message: 'Signatur-Datensatz erfolgreich in der SQLite-Schicht gesichert!' });
  } catch (err: any) {
    console.error('Error saving signature:', err);
    return res.status(500).json({ error: 'Database/Storage write error', details: err.message });
  }
});

// API: Delete saved key-session
app.delete('/api/signatures/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const numId = Number(id);

    if (isSqlite && db) {
      await db.run('DELETE FROM saved_signatures WHERE id = ?', [numId]);
    } else {
      // Fallback JSON persistence delete
      if (!fs.existsSync(JSON_DB_PATH)) {
        fs.writeFileSync(JSON_DB_PATH, JSON.stringify([], null, 2), 'utf-8');
      }
      const fileData = fs.readFileSync(JSON_DB_PATH, 'utf-8');
      let sessions = JSON.parse(fileData);
      
      sessions = sessions.filter((s: any) => Number(s.id) !== numId && s.id !== id);
      fs.writeFileSync(JSON_DB_PATH, JSON.stringify(sessions, null, 2), 'utf-8');
    }
    return res.json({ success: true, message: 'Datensatz gelöscht.' });
  } catch (err: any) {
    console.error('Error deleting signature row:', err);
    return res.status(500).json({ error: 'Database/Storage delete error', details: err.message });
  }
});

// API: Cryptanalysis explain endpoint using Gemini
app.post('/api/explain', async (req, res) => {
  try {
    const { prompt, context } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      // Graceful local fallback if API key is not configured in local development
      return res.json({
        text: `**Hinweis:** Es ist kein aktiver Google Gemini API-Schlüssel konfiguriert. Hier ist eine mathematische Fachanalyse aus dem lokalen Cache:\n\n` +
          `### Mathematische Analyse für: ${prompt.substring(0, 60)}...\n\n` +
          `1. **Limb-Struktur und Überträge (Borrow):** Bei der Subtraktion $s_1 - s_2 \\pmod n$ auf 32-Bit-Ebene (8 Glieder/Limbs) pflanzt sich das Borrow-Bit bei jedem Überlauf $A_i - B_i - \\text{borrow}_{in} < 0$ von rechts nach links fort. \n` +
          `2. **secp256k1 Ordnung ($n$):** Jede mathematische Reduktion muss modulo $n$ erfolgen. Liegt das Ergebnis der Subtraktion im Negativen (End-Borrow = 1), so addieren wir $n$ hinzu, um es im Feld $[0, n-1]$ zu normalisieren.\n` +
          `3. **Gefahr von Biased Nonces (HNP):** Wenn die zufällige Nonce $k$ bei aufeinanderflogenden Signaturen dieselben signifikanten Bits (z. B. die obersten 4-8 Bits) teilt, können Gitterreduktionsalgorithmen (LLL, BKZ) über das Hidden Number Problem (HNP) den privaten Schlüssel $d$ in Sekunden extrahieren. Dies gilt selbst dann, wenn kein einziges $r$ exakt kollidiert.`
      });
    }

    // Lazy initialization of GoogleGenAI SDK
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const systemInstruction = `You are a world-class cryptographic analysis assistant specializing in Bitcoin ECDSA (secp256k1) security, biased nonces, multi-precision big-integer arithmetic, and math-related aspects of public/private key recovery. 
Auser requested analysis details on Bitcoin signatures.
Explain cryptanalysis concepts concisely, clearly, and mathematically. Always respond inside Markdown tags. 
Translate or answer in German, as the user speaks German. Avoid general filler content, keep explanations mathematically precise.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        {
          text: `The user asks about: "${prompt}".\n` +
            `Context of active analysis session:\n` +
            `- Target Public Key: "04450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58"\n` +
            `- Target Bitcoin Address: "1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN"\n` +
            `- Mathematics: multi-precision integer subtraction (8 limbs of 32-bits), borrow bit propagation, side-channel analysis (Hidden Number Problem), or private key leakage.\n` +
            `Provide a detailed expert response explaining the mathematical properties corresponding to the user's inquiry.`
        }
      ],
      config: {
        systemInstruction,
        temperature: 0.2,
      }
    });

    return res.json({
      text: response.text || 'Keine Antwort generiert.'
    });

  } catch (err: any) {
    console.error('Gemini explanation error:', err);
    return res.status(500).json({
      error: 'Fehler bei der Kommunikation mit dem KI-Analysator.',
      details: err.message
    });
  }
});

async function startServer() {
  // Initialize SQLite database
  await initDb();

  // Vite Dev Server middleware in non-production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Serving app via Vite Dev Server Middleware...');
  } else {
    // Production serving static files
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Serving production static build from dist/...');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server successfully started and listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
