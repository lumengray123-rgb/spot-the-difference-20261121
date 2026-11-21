// Game state and rules for Double Take: scenes, scoring, timer, hints,
// hearts, and the win / lose flow. This module owns no DOM and no canvas;
// render.js reads this state and draws it, main.js wires the buttons.

import { SCENES } from './scenes.js';
import { playFind, playHint, playMiss, playSceneDone, playTick, playVictory } from './audio.js';

export const SCREENS = {
  START: 'start',
  PLAYING: 'playing',
  SCENE_DONE: 'sceneDone',
  GAME_OVER: 'gameOver',
  VICTORY: 'victory',
};

const FIND_POINTS = 100;
const WRONG_CLICK_PENALTY_SECONDS = 5;
const HINTS_PER_SCENE = 3;
const START_HEARTS = 3;
const BEST_KEY = 'double-take-best-score';

export function loadBestScore() {
  try {
    return Number(window.localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveBestScore(score) {
  try {
    window.localStorage.setItem(BEST_KEY, String(score));
  } catch {
    // Storage may be unavailable (private mode); the game plays on.
  }
}

export function createGame(onChange) {
  const game = {
    screen: SCREENS.START,
    sceneIndex: 0,
    found: new Set(),
    foundOrder: [],
    score: 0,
    hearts: START_HEARTS,
    hintsLeft: HINTS_PER_SCENE,
    hintsUsedThisScene: 0,
    timeLeft: SCENES[0].seconds,
    stars: [],
    message: '',
    messageAt: 0,
    popups: [],
    wrongMarks: [],
    hintPulse: null,
    bestScore: loadBestScore(),
    lastSceneBonus: 0,
    lastSceneStars: 0,
    totalTimeUsed: 0,
  };

  function emit() {
    onChange(game);
  }

  function scene() {
    return SCENES[game.sceneIndex];
  }

  function showMessage(text) {
    game.message = text;
    game.messageAt = performance.now();
    emit();
  }

  function startScene(index) {
    game.sceneIndex = index;
    game.found = new Set();
    game.foundOrder = [];
    game.hintsLeft = HINTS_PER_SCENE;
    game.hintsUsedThisScene = 0;
    game.timeLeft = scene().seconds;
    game.popups = [];
    game.wrongMarks = [];
    game.hintPulse = null;
    game.screen = SCREENS.PLAYING;
    showMessage(scene().intro);
  }

  function finishScene() {
    const timeBonus = Math.max(0, Math.round(game.timeLeft) * 10 - game.hintsUsedThisScene * 50);
    game.lastSceneBonus = timeBonus;
    game.score += timeBonus;
    const timeShare = game.timeLeft / scene().seconds;
    let stars = 1;
    if (timeShare >= 0.5 && game.hintsUsedThisScene === 0) stars = 3;
    else if (timeShare >= 0.25 || game.hintsUsedThisScene <= 1) stars = 2;
    game.lastSceneStars = stars;
    game.stars[game.sceneIndex] = stars;
    game.screen = SCREENS.SCENE_DONE;
    playSceneDone();
    emit();
  }

  function finishGame() {
    game.screen = SCREENS.VICTORY;
    if (game.score > game.bestScore) {
      game.bestScore = game.score;
      saveBestScore(game.score);
    }
    playVictory();
    emit();
  }

  return {
    state: game,
    scene,

    startGame() {
      game.score = 0;
      game.hearts = START_HEARTS;
      game.stars = [];
      game.totalTimeUsed = 0;
      playTick();
      startScene(0);
    },

    nextScene() {
      playTick();
      if (game.sceneIndex + 1 >= SCENES.length) finishGame();
      else startScene(game.sceneIndex + 1);
    },

    restartScene() {
      playTick();
      startScene(game.sceneIndex);
    },

    backToStart() {
      playTick();
      game.screen = SCREENS.START;
      emit();
    },

    // A click at panel coordinates (x, y) on either picture.
    clickAt(x, y) {
      if (game.screen !== SCREENS.PLAYING) return;
      const current = scene();
      for (let i = 0; i < current.diffs.length; i++) {
        if (game.found.has(i)) continue;
        const diff = current.diffs[i];
        const dx = x - diff.x;
        const dy = y - diff.y;
        const reach = diff.r + 12;
        if (dx * dx + dy * dy <= reach * reach) {
          game.found.add(i);
          game.foundOrder.push(i);
          game.score += FIND_POINTS;
          game.popups.push({ x: diff.x, y: diff.y - diff.r - 6, text: `+${FIND_POINTS}`, at: performance.now() });
          playFind();
          if (game.found.size === current.diffs.length) {
            finishScene();
          } else {
            showMessage(`Found: ${diff.label} — ${current.diffs.length - game.found.size} to go!`);
          }
          return;
        }
      }
      // No difference there: a small time penalty and a red mark.
      game.timeLeft = Math.max(0, game.timeLeft - WRONG_CLICK_PENALTY_SECONDS);
      game.wrongMarks.push({ x, y, at: performance.now() });
      playMiss();
      showMessage(`Not there — ${WRONG_CLICK_PENALTY_SECONDS} seconds off the clock!`);
    },

    useHint() {
      if (game.screen !== SCREENS.PLAYING) return;
      if (game.hintsLeft <= 0) {
        showMessage('No hints left in this scene.');
        return;
      }
      const current = scene();
      const remaining = current.diffs.map((d, i) => i).filter((i) => !game.found.has(i));
      if (remaining.length === 0) return;
      const pick = remaining[Math.floor(Math.random() * remaining.length)];
      game.hintsLeft -= 1;
      game.hintsUsedThisScene += 1;
      game.hintPulse = { index: pick, at: performance.now() };
      playHint();
      showMessage(`Hint: look near the ${current.diffs[pick].label}…`);
    },

    // Advance the clock by dt seconds. Called from the render loop.
    tick(dt) {
      if (game.screen !== SCREENS.PLAYING) return;
      game.timeLeft -= dt;
      game.totalTimeUsed += dt;
      if (game.timeLeft <= 0) {
        game.hearts -= 1;
        if (game.hearts <= 0) {
          game.screen = SCREENS.GAME_OVER;
          playMiss();
          emit();
        } else {
          game.timeLeft = scene().seconds;
          showMessage(`Out of time! You lose a heart — ${game.hearts} left. The clock restarts.`);
        }
      }
    },

    // Stage a mid-play state for screenshots: mark diffs found through the
    // same state the game itself uses, with a chosen clock value.
    stageForShot(sceneIndex, foundIndexes, secondsLeft) {
      game.score = 0;
      game.hearts = START_HEARTS;
      game.stars = [];
      startScene(sceneIndex);
      for (const i of foundIndexes) {
        game.found.add(i);
        game.foundOrder.push(i);
        game.score += FIND_POINTS;
      }
      game.timeLeft = secondsLeft;
      game.message = `${scene().diffs.length - game.found.size} differences still to find.`;
      game.messageAt = performance.now();
      emit();
    },

    // Stage the victory screen for screenshots, with the final scene
    // visible behind the overlay, all its differences found.
    stageVictory() {
      game.sceneIndex = SCENES.length - 1;
      game.found = new Set(SCENES[game.sceneIndex].diffs.map((d, i) => i));
      game.foundOrder = SCENES[game.sceneIndex].diffs.map((d, i) => i);
      game.timeLeft = 30;
      game.score = 3650;
      game.hearts = 2;
      game.stars = [3, 2, 3, 2];
      game.totalTimeUsed = 214;
      game.bestScore = Math.max(game.bestScore, 3650);
      game.screen = SCREENS.VICTORY;
      emit();
    },
  };
}
