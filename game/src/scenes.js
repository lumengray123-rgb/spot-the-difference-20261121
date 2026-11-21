// Scene definitions for Double Take. Each scene paints two near-identical
// pictures: `base` draws everything the panels share, and each difference
// draws its own variant on the left panel and on the right panel.
// All coordinates are in the 540 x 360 panel space. Painting is fully
// deterministic: no randomness, so both panels always agree except at the
// differences.

import { cloud, disc, ellipse, gull, line, pine, poly, rect, ring, roundRect, sky, star5 } from './paint.js';

const W = 540;
const H = 360;

// Fixed star fields so the two panels always match.
const CAMP_STARS = [[40, 30], [110, 80], [180, 35], [230, 90], [300, 40], [350, 95], [420, 35], [500, 110], [150, 120], [330, 130]];
const SPACE_STARS = [[30, 40], [90, 120], [150, 40], [210, 180], [260, 30], [310, 140], [370, 50], [420, 170], [470, 40], [510, 120], [60, 200], [130, 160], [240, 230], [300, 280], [400, 210], [460, 300], [40, 300], [180, 320], [520, 200], [340, 90]];

function harbourBase(ctx) {
  sky(ctx, W, H, '#a8d8f0', '#eaf7fd');
  cloud(ctx, 70, 55, 0.9, '#ffffff');
  cloud(ctx, 250, 40, 0.7, '#ffffff');
  cloud(ctx, 370, 95, 0.6, '#f2f9ff');
  // Sea.
  rect(ctx, 0, 240, W, 120, '#2f7fb8');
  rect(ctx, 0, 240, W, 6, '#7fc4e8');
  line(ctx, 60, 265, 140, 265, '#bfe6f7', 2);
  line(ctx, 330, 290, 430, 290, '#bfe6f7', 2);
  line(ctx, 180, 320, 280, 320, '#bfe6f7', 2);
  line(ctx, 420, 330, 500, 330, '#bfe6f7', 2);
  // Pier.
  rect(ctx, 0, 300, 180, 60, '#8a6a44');
  for (let i = 0; i < 6; i++) line(ctx, 10 + i * 30, 300, 10 + i * 30, 360, '#6e5334', 3);
  // Lighthouse.
  rect(ctx, 78, 110, 34, 130, '#f4f1e6');
  rect(ctx, 78, 140, 34, 14, '#d94f4f');
  rect(ctx, 78, 180, 34, 14, '#d94f4f');
  rect(ctx, 72, 96, 46, 16, '#3a4a5a');
  disc(ctx, 95, 92, 10, '#ffe27a');
  // Sailboat hull and mast (the sail itself is a difference).
  poly(ctx, [[275, 265], [330, 265], [318, 282], [288, 282]], '#7a4a26');
  line(ctx, 302, 265, 302, 205, '#5a3a20', 3);
  // Small rowboat.
  poly(ctx, [[400, 285], [448, 285], [438, 298], [410, 298]], '#c96f2e');
  line(ctx, 424, 285, 424, 268, '#5a3a20', 2);
  // Two gulls that both panels share.
  gull(ctx, 120, 70, 1, '#33506b');
  gull(ctx, 160, 52, 0.8, '#33506b');
}

function campBase(ctx) {
  sky(ctx, W, H, '#241d4e', '#e8875a');
  for (const [x, y] of CAMP_STARS) disc(ctx, x, y, 2, '#fff7d6');
  // Moon disc (its crater is a difference).
  disc(ctx, 480, 60, 26, '#fdf6c9');
  // Mountain silhouettes.
  poly(ctx, [[0, 260], [90, 170], [190, 260]], '#3a2f5e');
  poly(ctx, [[140, 260], [250, 150], [360, 260]], '#2e2450');
  poly(ctx, [[330, 260], [430, 180], [540, 260]], '#3a2f5e');
  // Ground.
  rect(ctx, 0, 260, W, 100, '#22402e');
  rect(ctx, 0, 260, W, 5, '#3d6b45');
  pine(ctx, 60, 250, 1.1, '#1d5c33');
  pine(ctx, 510, 245, 0.9, '#1d5c33');
  pine(ctx, 40, 300, 0.8, '#256b3c');
  // Tent body (its door is a difference).
  poly(ctx, [[215, 260], [270, 165], [325, 260]], '#e8734a');
  poly(ctx, [[215, 260], [270, 165], [270, 260]], '#d95f36');
  line(ctx, 270, 165, 270, 150, '#8a6a44', 3);
  disc(ctx, 270, 148, 4, '#ffd94d');
  // Campfire logs (the flame is a difference).
  line(ctx, 360, 285, 400, 270, '#6b4a2b', 7);
  line(ctx, 400, 285, 360, 270, '#6b4a2b', 7);
  disc(ctx, 380, 288, 20, '#4a3520');
  // Lantern light on the ground.
  ellipse(ctx, 380, 300, 46, 10, 'rgba(255, 190, 80, 0.25)');
}

function marketBase(ctx) {
  sky(ctx, W, H, '#fdeed3', '#f7d9a0');
  // Street.
  rect(ctx, 0, 300, W, 60, '#b9a68c');
  line(ctx, 0, 300, W, 300, '#8f7d64', 3);
  // Bunting string (one flag is a difference).
  ctx.beginPath();
  ctx.moveTo(60, 55);
  ctx.quadraticCurveTo(270, 105, 480, 55);
  ctx.strokeStyle = '#7a5a3a';
  ctx.lineWidth = 2;
  ctx.stroke();
  const flagXs = [150, 200, 300, 350];
  const flagCols = ['#e05252', '#2fa8a0', '#f2c14e', '#7a4fd0'];
  flagXs.forEach((x, i) => {
    const t = (x - 60) / 420;
    const y = (1 - t) * (1 - t) * 55 + 2 * (1 - t) * t * 105 + t * t * 55;
    poly(ctx, [[x - 11, y], [x + 11, y], [x, y + 20]], flagCols[i]);
  });
  // Left stall: counter and red-striped awning.
  rect(ctx, 60, 235, 170, 65, '#a9713f');
  rect(ctx, 60, 235, 170, 10, '#7a4a26');
  poly(ctx, [[55, 200], [235, 200], [215, 165], [75, 165]], '#e05252');
  for (let i = 0; i < 4; i++) poly(ctx, [[75 + i * 40, 165], [95 + i * 40, 165], [91 + i * 40, 200], [71 + i * 40, 200]], '#fdf3e3');
  // Right stall: counter and blue-striped awning.
  rect(ctx, 310, 235, 170, 65, '#a9713f');
  rect(ctx, 310, 235, 170, 10, '#7a4a26');
  poly(ctx, [[305, 200], [485, 200], [465, 165], [325, 165]], '#2f6fd0');
  for (let i = 0; i < 4; i++) poly(ctx, [[325 + i * 40, 165], [345 + i * 40, 165], [341 + i * 40, 200], [321 + i * 40, 200]], '#fdf3e3');
  // Sign board (its text is a difference).
  rect(ctx, 380, 118, 90, 34, '#fdf3e3');
  // Fruit on the left stall: four apples (a fifth is a difference).
  const apples = [[140, 222], [165, 222], [190, 222], [152, 204]];
  for (const [x, y] of apples) {
    disc(ctx, x, y, 11, '#d93b3b');
    disc(ctx, x - 4, y - 4, 3, '#f27d7d');
  }
  disc(ctx, 215, 222, 11, '#f28c28');
  disc(ctx, 211, 218, 3, '#ffc27a');
  // Balloons: three shared ones (a fourth is a difference).
  line(ctx, 95, 150, 70, 78, '#7a5a3a', 1.5);
  line(ctx, 95, 150, 95, 62, '#7a5a3a', 1.5);
  line(ctx, 95, 150, 120, 82, '#7a5a3a', 1.5);
  ellipse(ctx, 70, 70, 13, 16, '#e05252');
  ellipse(ctx, 95, 55, 13, 16, '#2fa8a0');
  ellipse(ctx, 120, 75, 13, 16, '#f2c14e');
  // Cat: body, head and ears (its tail is a difference).
  ellipse(ctx, 330, 312, 22, 16, '#3a3a3a');
  disc(ctx, 348, 296, 12, '#3a3a3a');
  poly(ctx, [[340, 288], [344, 278], [349, 287]], '#3a3a3a');
  poly(ctx, [[350, 287], [355, 278], [358, 288]], '#3a3a3a');
  disc(ctx, 352, 295, 2, '#ffd94d');
  // Bicycle (one hub dot is a difference).
  ring(ctx, 470, 300, 22, '#33506b', 3);
  ring(ctx, 515, 300, 22, '#33506b', 3);
  line(ctx, 470, 300, 492, 278, '#33506b', 3);
  line(ctx, 515, 300, 492, 278, '#33506b', 3);
  line(ctx, 492, 278, 500, 268, '#33506b', 3);
  line(ctx, 488, 268, 508, 268, '#33506b', 3);
}

function stationBase(ctx) {
  sky(ctx, W, H, '#0b1030', '#241a4e');
  for (const [x, y] of SPACE_STARS) disc(ctx, x, y, 1.6, '#dfe8ff');
  // Ringed planet, lower left (one crater is a difference).
  disc(ctx, 130, 270, 68, '#c96f4a');
  ellipse(ctx, 130, 255, 58, 14, '#e8a87c');
  ellipse(ctx, 130, 285, 50, 10, '#a85a38');
  ctx.beginPath();
  ctx.ellipse(130, 270, 96, 22, -0.35, 0, Math.PI * 2);
  ctx.strokeStyle = '#e8c98a';
  ctx.lineWidth = 6;
  ctx.stroke();
  // Earth, lower right (its cloud swirl is a difference).
  disc(ctx, 350, 320, 30, '#3b7fd4');
  ellipse(ctx, 342, 312, 14, 8, '#2fa85a');
  ellipse(ctx, 360, 328, 10, 6, '#2fa85a');
  // Station: main module and left solar panel (the right panel is a difference).
  roundRect(ctx, 240, 130, 120, 40, 14, '#cfd6e4');
  rect(ctx, 252, 142, 26, 16, '#7fb2e8');
  rect(ctx, 292, 142, 26, 16, '#7fb2e8');
  rect(ctx, 332, 142, 16, 16, '#8a94a8');
  line(ctx, 240, 150, 185, 150, '#9aa4b8', 4);
  rect(ctx, 140, 128, 45, 44, '#2f6fd0');
  line(ctx, 162, 128, 162, 172, '#1d4e96', 2);
  line(ctx, 140, 150, 185, 150, '#1d4e96', 2);
  line(ctx, 360, 150, 400, 150, '#9aa4b8', 4);
  // Antenna mast (its dish angle is a difference).
  line(ctx, 200, 130, 200, 100, '#9aa4b8', 4);
  // Astronaut (the visor is a difference).
  disc(ctx, 320, 196, 13, '#f2f2f2');
  roundRect(ctx, 308, 208, 24, 30, 8, '#f2f2f2');
  line(ctx, 310, 214, 298, 228, '#f2f2f2', 6);
  line(ctx, 330, 214, 342, 228, '#f2f2f2', 6);
  line(ctx, 314, 238, 310, 254, '#f2f2f2', 6);
  line(ctx, 326, 238, 330, 254, '#f2f2f2', 6);
  disc(ctx, 320, 222, 6, '#2f6fd0');
  // Satellite body (its dish is a difference).
  rect(ctx, 462, 228, 36, 24, '#b8c0d0');
  rect(ctx, 466, 232, 10, 8, '#f2c14e');
  line(ctx, 462, 240, 448, 240, '#9aa4b8', 3);
  rect(ctx, 430, 232, 18, 16, '#2f6fd0');
}

export const PANEL_W = W;
export const PANEL_H = H;

export const SCENES = [
  {
    name: 'Harbour Morning',
    intro: 'A quiet harbour at sunrise. Five small things differ.',
    seconds: 90,
    base: harbourBase,
    diffs: [
      {
        x: 200, y: 80, r: 26, label: 'an extra gull',
        left: (ctx) => gull(ctx, 200, 80, 0.9, '#33506b'),
        right: () => {},
      },
      {
        x: 455, y: 55, r: 30, label: 'the colour of the sun',
        left: (ctx) => { disc(ctx, 455, 55, 26, '#ffd94d'); for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4; line(ctx, 455 + Math.cos(a) * 30, 55 + Math.sin(a) * 30, 455 + Math.cos(a) * 40, 55 + Math.sin(a) * 40, '#ffd94d', 3); } },
        right: (ctx) => { disc(ctx, 455, 55, 26, '#ff9d3d'); for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4; line(ctx, 455 + Math.cos(a) * 30, 55 + Math.sin(a) * 30, 455 + Math.cos(a) * 40, 55 + Math.sin(a) * 40, '#ff9d3d', 3); } },
      },
      {
        x: 300, y: 232, r: 28, label: 'the colour of the sail',
        left: (ctx) => poly(ctx, [[302, 205], [302, 262], [272, 262]], '#e05252'),
        right: (ctx) => poly(ctx, [[302, 205], [302, 262], [272, 262]], '#2fa8a0'),
      },
      {
        x: 480, y: 305, r: 22, label: 'a missing buoy',
        left: (ctx) => { disc(ctx, 480, 305, 11, '#d93b3b'); rect(ctx, 477, 290, 6, 8, '#fdf3e3'); },
        right: () => {},
      },
      {
        x: 95, y: 195, r: 18, label: 'the lighthouse window',
        left: (ctx) => rect(ctx, 89, 186, 12, 16, '#ffe27a'),
        right: (ctx) => rect(ctx, 89, 186, 12, 16, '#3a4a5a'),
      },
    ],
  },
  {
    name: 'Forest Camp',
    intro: 'Dusk at the campsite. Six things differ under the stars.',
    seconds: 80,
    base: campBase,
    diffs: [
      {
        x: 70, y: 50, r: 16, label: 'an extra star',
        left: (ctx) => star5(ctx, 70, 50, 8, 3.5, '#fff7d6'),
        right: () => {},
      },
      {
        x: 270, y: 205, r: 26, label: 'the tent door',
        left: (ctx) => poly(ctx, [[270, 175], [250, 230], [290, 230]], '#241d2e'),
        right: (ctx) => poly(ctx, [[270, 175], [250, 230], [290, 230]], '#e8734a'),
      },
      {
        x: 380, y: 250, r: 24, label: 'the height of the flame',
        left: (ctx) => { ellipse(ctx, 380, 252, 14, 26, '#ff9d3d'); ellipse(ctx, 380, 258, 8, 16, '#ffd94d'); },
        right: (ctx) => { ellipse(ctx, 380, 262, 14, 14, '#ff9d3d'); ellipse(ctx, 380, 264, 8, 9, '#ffd94d'); },
      },
      {
        x: 150, y: 305, r: 20, label: 'a mushroom by the path',
        left: (ctx) => { rect(ctx, 147, 305, 6, 12, '#f2e8d5'); ellipse(ctx, 150, 304, 13, 9, '#d93b3b'); disc(ctx, 146, 301, 2, '#ffffff'); disc(ctx, 154, 303, 2, '#ffffff'); },
        right: () => {},
      },
      {
        x: 450, y: 290, r: 26, label: 'the colour of the backpack',
        left: (ctx) => { roundRect(ctx, 432, 272, 36, 36, 10, '#3b6fd4'); rect(ctx, 444, 272, 12, 10, '#2a4f9e'); },
        right: (ctx) => { roundRect(ctx, 432, 272, 36, 36, 10, '#3fae5a'); rect(ctx, 444, 272, 12, 10, '#2c7a3f'); },
      },
      {
        x: 480, y: 60, r: 22, label: 'a crater on the moon',
        left: (ctx) => { disc(ctx, 472, 54, 6, '#e8dfae'); disc(ctx, 490, 68, 4, '#e8dfae'); },
        right: () => {},
      },
    ],
  },
  {
    name: 'Market Day',
    intro: 'A busy street market. Seven details differ between the stalls.',
    seconds: 70,
    base: marketBase,
    diffs: [
      {
        x: 100, y: 85, r: 26, label: 'a fourth balloon',
        left: (ctx) => { line(ctx, 95, 150, 108, 100, '#7a5a3a', 1.5); ellipse(ctx, 108, 92, 13, 16, '#7a4fd0'); },
        right: () => {},
      },
      {
        x: 178, y: 204, r: 24, label: 'one more apple',
        left: (ctx) => { disc(ctx, 178, 204, 11, '#d93b3b'); disc(ctx, 174, 200, 3, '#f27d7d'); },
        right: () => {},
      },
      {
        x: 318, y: 296, r: 22, label: 'the cat’s tail',
        left: (ctx) => { ctx.beginPath(); ctx.moveTo(312, 312); ctx.quadraticCurveTo(300, 290, 310, 276); ctx.strokeStyle = '#3a3a3a'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.stroke(); },
        right: (ctx) => { ctx.beginPath(); ctx.moveTo(312, 316); ctx.quadraticCurveTo(300, 322, 292, 314); ctx.strokeStyle = '#3a3a3a'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.stroke(); },
      },
      {
        x: 425, y: 135, r: 26, label: 'the stall sign',
        left: (ctx) => { ctx.fillStyle = '#33506b'; ctx.font = 'bold 20px Georgia, serif'; ctx.textAlign = 'center'; ctx.fillText('FRESH', 425, 141); },
        right: (ctx) => { ctx.fillStyle = '#33506b'; ctx.font = 'bold 20px Georgia, serif'; ctx.textAlign = 'center'; ctx.fillText('FRESH!', 425, 141); },
      },
      {
        x: 470, y: 300, r: 20, label: 'the bicycle hub',
        left: (ctx) => disc(ctx, 470, 300, 5, '#f2c14e'),
        right: () => {},
      },
      {
        x: 250, y: 90, r: 24, label: 'a bunting flag',
        left: (ctx) => poly(ctx, [[239, 88], [261, 88], [250, 108]], '#e05252'),
        right: () => {},
      },
      {
        x: 60, y: 300, r: 24, label: 'a crate by the stall',
        left: (ctx) => { rect(ctx, 42, 292, 34, 30, '#a9713f'); line(ctx, 42, 292, 76, 322, '#7a4a26', 2); line(ctx, 76, 292, 42, 322, '#7a4a26', 2); },
        right: () => {},
      },
    ],
  },
  {
    name: 'Orbital Station',
    intro: 'High above Earth. Eight tiny differences hide in the dark.',
    seconds: 60,
    base: stationBase,
    diffs: [
      {
        x: 60, y: 60, r: 14, label: 'an extra star',
        left: (ctx) => star5(ctx, 60, 60, 7, 3, '#dfe8ff'),
        right: () => {},
      },
      {
        x: 200, y: 96, r: 24, label: 'the antenna dish',
        left: (ctx) => { line(ctx, 200, 100, 186, 86, '#9aa4b8', 3); ellipse(ctx, 182, 84, 14, 6, '#cfd6e4', -0.6); },
        right: (ctx) => { line(ctx, 200, 100, 214, 86, '#9aa4b8', 3); ellipse(ctx, 218, 84, 14, 6, '#cfd6e4', 0.6); },
      },
      {
        x: 320, y: 196, r: 22, label: 'the astronaut’s visor',
        left: (ctx) => ellipse(ctx, 320, 196, 9, 7, '#f2c14e'),
        right: (ctx) => ellipse(ctx, 320, 196, 9, 7, '#4ea8f2'),
      },
      {
        x: 430, y: 150, r: 26, label: 'the solar panel',
        left: (ctx) => { rect(ctx, 405, 128, 50, 44, '#2f6fd0'); line(ctx, 430, 128, 430, 172, '#1d4e96', 2); line(ctx, 405, 150, 455, 150, '#1d4e96', 2); },
        right: (ctx) => { rect(ctx, 405, 128, 50, 44, '#7a4fd0'); line(ctx, 430, 128, 430, 172, '#4e2d96', 2); line(ctx, 405, 150, 455, 150, '#4e2d96', 2); },
      },
      {
        x: 120, y: 280, r: 20, label: 'a crater on the planet',
        left: (ctx) => { disc(ctx, 120, 280, 9, '#a85a38'); disc(ctx, 140, 295, 5, '#a85a38'); },
        right: () => {},
      },
      {
        x: 480, y: 222, r: 22, label: 'the satellite dish',
        left: (ctx) => { line(ctx, 480, 228, 480, 214, '#9aa4b8', 3); ellipse(ctx, 480, 212, 11, 5, '#cfd6e4'); },
        right: () => {},
      },
      {
        x: 270, y: 60, r: 14, label: 'the station beacon',
        left: (ctx) => { line(ctx, 270, 130, 270, 64, '#9aa4b8', 3); disc(ctx, 270, 60, 6, '#ff5a5a'); disc(ctx, 270, 60, 10, 'rgba(255, 90, 90, 0.35)'); },
        right: (ctx) => { line(ctx, 270, 130, 270, 64, '#9aa4b8', 3); disc(ctx, 270, 60, 6, '#5aff8a'); disc(ctx, 270, 60, 10, 'rgba(90, 255, 138, 0.35)'); },
      },
      {
        x: 350, y: 320, r: 24, label: 'a cloud swirl on Earth',
        left: (ctx) => { ctx.beginPath(); ctx.arc(350, 320, 16, 0.4, 2.4); ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.stroke(); },
        right: () => {},
      },
    ],
  },
];
