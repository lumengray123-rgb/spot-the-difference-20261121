// Rendering for Double Take: paints both picture panels, the markers on
// found differences, the hint pulse, floating score popups, and keeps the
// heads-up display in step with the game state.

import { PANEL_H, PANEL_W, SCENES } from './scenes.js';
import { SCREENS } from './game.js';

const MARKER_COLOUR = '#ffcf3d';
const MARKER_GLOW = 'rgba(255, 207, 61, 0.35)';
const HINT_COLOUR = '#5ae8ff';
const WRONG_COLOUR = '#ff5a5a';

function paintPanel(ctx, scene, side) {
  ctx.clearRect(0, 0, PANEL_W, PANEL_H);
  scene.base(ctx);
  for (const diff of scene.diffs) {
    if (side === 'left') diff.left(ctx);
    else diff.right(ctx);
  }
}

function drawFoundMarker(ctx, diff, now) {
  const pulse = 1 + 0.08 * Math.sin(now / 220);
  const r = (diff.r + 6) * pulse;
  ctx.beginPath();
  ctx.arc(diff.x, diff.y, r + 5, 0, Math.PI * 2);
  ctx.strokeStyle = MARKER_GLOW;
  ctx.lineWidth = 8;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(diff.x, diff.y, r, 0, Math.PI * 2);
  ctx.strokeStyle = MARKER_COLOUR;
  ctx.lineWidth = 3.5;
  ctx.stroke();
  // A small check tick inside the ring.
  ctx.beginPath();
  ctx.moveTo(diff.x - 7, diff.y);
  ctx.lineTo(diff.x - 2, diff.y + 6);
  ctx.lineTo(diff.x + 8, diff.y - 6);
  ctx.strokeStyle = MARKER_COLOUR;
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
}

function drawHintPulse(ctx, diff, ageMs) {
  const span = 2200;
  if (ageMs > span) return;
  const progress = ageMs / span;
  const alpha = 1 - progress;
  const r = diff.r + 8 + 18 * (1 - Math.abs(1 - (progress * 4) % 2));
  ctx.beginPath();
  ctx.arc(diff.x, diff.y, r, 0, Math.PI * 2);
  ctx.strokeStyle = HINT_COLOUR;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawWrongMark(ctx, mark, ageMs) {
  const span = 900;
  if (ageMs > span) return;
  const alpha = 1 - ageMs / span;
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.moveTo(mark.x - 10, mark.y - 10);
  ctx.lineTo(mark.x + 10, mark.y + 10);
  ctx.moveTo(mark.x + 10, mark.y - 10);
  ctx.lineTo(mark.x - 10, mark.y + 10);
  ctx.strokeStyle = WRONG_COLOUR;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawPopup(ctx, popup, ageMs) {
  const span = 1100;
  if (ageMs > span) return;
  const alpha = 1 - ageMs / span;
  const rise = (ageMs / span) * 26;
  ctx.globalAlpha = alpha;
  ctx.font = 'bold 20px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(30, 20, 0, 0.7)';
  ctx.strokeText(popup.text, popup.x, popup.y - rise);
  ctx.fillStyle = '#ffe27a';
  ctx.fillText(popup.text, popup.x, popup.y - rise);
  ctx.globalAlpha = 1;
}

function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function starsText(count) {
  return '★'.repeat(count) + '☆'.repeat(3 - count);
}

export function createRenderer(game, els) {
  const ctxA = els.canvasA.getContext('2d');
  const ctxB = els.canvasB.getContext('2d');
  const lastHud = {};

  function setText(key, element, value) {
    if (lastHud[key] !== value) {
      lastHud[key] = value;
      element.textContent = value;
    }
  }

  function updateHud(now) {
    const state = game.state;
    const scene = SCENES[state.sceneIndex];
    const remaining = scene.diffs.length - state.found.size;
    setText('counter', els.counter, `Found ${state.found.size} / ${scene.diffs.length}  ·  ${remaining} left`);
    setText('score', els.score, `Score ${state.score}`);
    setText('hearts', els.hearts, '♥'.repeat(state.hearts) + '♡'.repeat(3 - state.hearts));
    setText('sceneName', els.sceneName, `Scene ${state.sceneIndex + 1} of ${SCENES.length} — ${scene.name}`);
    setText('timerText', els.timerText, formatTime(state.timeLeft));
    setText('hintCount', els.hintCount, `(${state.hintsLeft})`);
    setText('message', els.message, state.message);

    const share = Math.max(0, Math.min(1, state.timeLeft / scene.seconds));
    els.timerFill.style.width = `${(share * 100).toFixed(1)}%`;
    els.timerFill.classList.toggle('low', state.timeLeft <= 15 && state.screen === SCREENS.PLAYING);

    for (let i = 0; i < els.sceneDots.length; i++) {
      const dot = els.sceneDots[i];
      dot.classList.toggle('done', i < state.sceneIndex || state.stars[i] !== undefined);
      dot.classList.toggle('current', i === state.sceneIndex);
      dot.textContent = state.stars[i] ? '★'.repeat(state.stars[i]) : String(i + 1);
    }

    const showStart = state.screen === SCREENS.START;
    const showScene = state.screen === SCREENS.SCENE_DONE;
    const showOver = state.screen === SCREENS.GAME_OVER;
    const showWin = state.screen === SCREENS.VICTORY;
    els.overlayStart.classList.toggle('hidden', !showStart);
    els.overlayScene.classList.toggle('hidden', !showScene);
    els.overlayOver.classList.toggle('hidden', !showOver);
    els.overlayWin.classList.toggle('hidden', !showWin);

    if (showScene) {
      setText('sceneStars', els.sceneStars, starsText(state.lastSceneStars));
      setText('sceneBonus', els.sceneBonus, `Time bonus +${state.lastSceneBonus}`);
      setText('sceneScore', els.sceneScore, `Score ${state.score}`);
      setText('sceneNext', els.sceneNext, state.sceneIndex + 1 >= SCENES.length ? 'See results' : 'Next scene');
    }
    if (showWin) {
      const totalStars = state.stars.reduce((sum, s) => sum + s, 0);
      setText('finalScore', els.finalScore, `${state.score}`);
      setText('finalStars', els.finalStars, `Stars ${totalStars} / ${SCENES.length * 3}`);
      setText('finalTime', els.finalTime, `Time ${formatTime(state.totalTimeUsed)}`);
      setText('bestScore', els.bestScore, `Best ${state.bestScore}`);
    }
    if (showStart) {
      setText('startBest', els.startBest, state.bestScore > 0 ? `Best score: ${state.bestScore}` : 'Find every difference across four hand-drawn scenes.');
    }
  }

  function draw(now) {
    const state = game.state;
    const scene = SCENES[state.sceneIndex];
    paintPanel(ctxA, scene, 'left');
    paintPanel(ctxB, scene, 'right');

    if (state.screen === SCREENS.PLAYING || state.screen === SCREENS.SCENE_DONE) {
      for (const index of state.foundOrder) {
        drawFoundMarker(ctxA, scene.diffs[index], now);
        drawFoundMarker(ctxB, scene.diffs[index], now);
      }
      if (state.hintPulse) {
        const age = now - state.hintPulse.at;
        const diff = scene.diffs[state.hintPulse.index];
        drawHintPulse(ctxA, diff, age);
        drawHintPulse(ctxB, diff, age);
      }
      for (const popup of state.popups) {
        drawPopup(ctxA, popup, now - popup.at);
        drawPopup(ctxB, popup, now - popup.at);
      }
      for (const mark of state.wrongMarks) {
        drawWrongMark(ctxA, mark, now - mark.at);
        drawWrongMark(ctxB, mark, now - mark.at);
      }
    }
    updateHud(now);
  }

  return { draw };
}
