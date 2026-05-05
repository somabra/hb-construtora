#!/usr/bin/env node
// Patch Astro Vercel adapter v7 output pra forçar Node 22.x runtime.
// O adapter v7 hardcoda nodejs18.x, mas a Vercel descontinuou essa runtime
// e o Supabase Realtime exige WebSocket nativo (Node 22+).

import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const FUNCS_DIR = '.vercel/output/functions';
const TARGET = 'nodejs22.x';

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full);
    } else if (entry === '.vc-config.json') {
      const cfg = JSON.parse(readFileSync(full, 'utf8'));
      if (cfg.runtime && cfg.runtime !== TARGET) {
        cfg.runtime = TARGET;
        writeFileSync(full, JSON.stringify(cfg, null, 2));
        console.log(`[patch-runtime] ${full} → ${TARGET}`);
      }
    }
  }
}

try {
  walk(FUNCS_DIR);
} catch (err) {
  if (err.code === 'ENOENT') {
    console.log('[patch-runtime] no functions dir, skipping');
  } else {
    throw err;
  }
}
