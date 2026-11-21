// Double Take hand-in (Node 22, standard library only). The game lives in
// this repository as plain static files under game/; this program copies
// game/ and screenshots/ into the output directory and writes the dossier
// the judge reads, built with the kit's vendored library.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output.

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

// The scorer's caps for this bounty: at most 4 screenshots of 256 KiB, at
// most 993 files and 48 MiB under game/, no game path over 1000 bytes, and
// the dossier's source text capped at 160 KiB.
const DOSSIER_LIMITS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function handIn() {
  const repoRoot = fileURLToPath(new URL('.', import.meta.url));
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

  mkdirSync(outDir, { recursive: true });

  // The game itself: every file under game/ goes across unchanged.
  cpSync(join(repoRoot, 'game'), join(outDir, 'game'), { recursive: true });

  // The screenshots, when the folder exists. Refuse to hand in an entry
  // with too few shots or an empty file: the gate would refuse it anyway,
  // and failing here says so plainly instead of shipping a broken entry.
  mkdirSync(join(outDir, 'screenshots'), { recursive: true });
  const shotsDir = join(repoRoot, 'screenshots');
  if (existsSync(shotsDir)) {
    const shots = readdirSync(shotsDir).filter((name) => !name.startsWith('.'));
    if (shots.length < 3 || shots.length > 4) {
      throw new Error(`expected 3 or 4 screenshots, found ${shots.length}`);
    }
    for (const name of shots) {
      if (statSync(join(shotsDir, name)).size === 0) {
        throw new Error(`screenshot is empty: ${name}`);
      }
    }
    cpSync(shotsDir, join(outDir, 'screenshots'), { recursive: true });
  } else {
    throw new Error('screenshots/ is missing: the entry needs 3 or 4 screenshots');
  }

  // The dossier is built from the output tree, so it describes exactly
  // what was handed in.
  const dossier = buildDossier(outDir, DOSSIER_LIMITS);
  if (dossier.length === 0) throw new Error('buildDossier wrote nothing');
  writeFileSync(join(outDir, 'dossier.json'), dossier);
}

handIn();
