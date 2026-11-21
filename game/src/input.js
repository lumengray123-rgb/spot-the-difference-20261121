// Pointer and keyboard input for Double Take. Clicks on either picture are
// translated into panel coordinates and handed to the game; keys drive the
// hint, the mute toggle and the scene restart.

import { PANEL_H, PANEL_W } from './scenes.js';
import { unlockAudio } from './audio.js';

function panelPoint(canvas, event) {
  const box = canvas.getBoundingClientRect();
  const x = ((event.clientX - box.left) / box.width) * PANEL_W;
  const y = ((event.clientY - box.top) / box.height) * PANEL_H;
  return { x, y };
}

export function bindInput(game, els, actions) {
  const onPanelClick = (canvas) => (event) => {
    unlockAudio();
    const { x, y } = panelPoint(canvas, event);
    if (x < 0 || x > PANEL_W || y < 0 || y > PANEL_H) return;
    game.clickAt(x, y);
  };

  els.canvasA.addEventListener('pointerdown', onPanelClick(els.canvasA));
  els.canvasB.addEventListener('pointerdown', onPanelClick(els.canvasB));

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === 'h') {
      unlockAudio();
      game.useHint();
    } else if (key === 'r') {
      actions.restartScene();
    } else if (key === 'm') {
      actions.toggleMute();
    } else if (key === 'enter' || key === ' ') {
      actions.advance();
    }
  });
}
