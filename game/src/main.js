// Boot for Double Take: wires the game, the renderer and the input, runs
// the frame loop, and stages screenshot states from a `?shot=` query.
// Shot states are real game states (found marks, clock, victory screen),
// reached through the same code a player uses.

import { createGame, SCREENS } from './game.js';
import { createRenderer } from './render.js';
import { bindInput } from './input.js';
import { isMuted, playTick, setMuted, unlockAudio } from './audio.js';
import { SCENES } from './scenes.js';

const $ = (id) => document.getElementById(id);

const els = {
  canvasA: $('panel-a'),
  canvasB: $('panel-b'),
  counter: $('counter'),
  score: $('score'),
  hearts: $('hearts'),
  sceneName: $('scene-name'),
  sceneDots: Array.from(document.querySelectorAll('.scene-dot')),
  timerFill: $('timer-fill'),
  timerText: $('timer-text'),
  hintCount: $('hint-count'),
  message: $('message'),
  overlayStart: $('overlay-start'),
  overlayScene: $('overlay-scene'),
  overlayOver: $('overlay-over'),
  overlayWin: $('overlay-win'),
  sceneStars: $('scene-stars'),
  sceneBonus: $('scene-bonus'),
  sceneScore: $('scene-score'),
  sceneNext: $('scene-next'),
  finalScore: $('final-score'),
  finalStars: $('final-stars'),
  finalTime: $('final-time'),
  bestScore: $('best-score'),
  startBest: $('start-best'),
};

const game = createGame(() => {});
const renderer = createRenderer(game, els);

const actions = {
  restartScene() {
    if (game.state.screen === SCREENS.PLAYING) game.restartScene();
  },
  toggleMute() {
    setMuted(!isMuted());
    $('mute-btn').textContent = isMuted() ? 'Sound off' : 'Sound on';
    if (!isMuted()) playTick();
  },
  advance() {
    const screen = game.state.screen;
    if (screen === SCREENS.START) game.startGame();
    else if (screen === SCREENS.SCENE_DONE) game.nextScene();
    else if (screen === SCREENS.GAME_OVER || screen === SCREENS.VICTORY) game.startGame();
  },
};

bindInput(game, els, actions);

$('start-btn').addEventListener('click', () => {
  unlockAudio();
  game.startGame();
});
$('hint-btn').addEventListener('click', () => {
  unlockAudio();
  game.useHint();
});
$('mute-btn').addEventListener('click', () => actions.toggleMute());
$('restart-btn').addEventListener('click', () => actions.restartScene());
$('scene-next').addEventListener('click', () => game.nextScene());
$('retry-btn').addEventListener('click', () => game.startGame());
$('again-btn').addEventListener('click', () => game.startGame());
$('menu-btn').addEventListener('click', () => game.backToStart());

// Frame loop: advance the clock, then redraw both panels.
let lastNow = performance.now();
function frame(now) {
  const dt = Math.min(0.1, (now - lastNow) / 1000);
  lastNow = now;
  game.tick(dt);
  renderer.draw(now);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Screenshot staging, driven by ?shot=:
//   cover  — scene 1 mid-play, 2 of 5 found, clock part run
//   play   — scene 2 mid-play, 3 of 6 found
//   late   — scene 4 mid-play, 2 of 8 found, little time left
//   end    — the victory screen after all four scenes
const shot = new URLSearchParams(window.location.search).get('shot');
if (shot === 'cover') game.stageForShot(0, [0, 2], 62);
else if (shot === 'play') game.stageForShot(1, [1, 3, 5], 48);
else if (shot === 'late') game.stageForShot(3, [2, 6], 19);
else if (shot === 'end') game.stageVictory();

// A small handle for automated play-testing.
window.__doubleTake = { game, scenes: SCENES };
