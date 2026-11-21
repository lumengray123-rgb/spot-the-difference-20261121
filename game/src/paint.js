// Shared canvas drawing helpers for Double Take's scenes.
// Every helper draws one small shape; the scene painters compose them.

export function disc(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

export function ring(ctx, x, y, r, stroke, width) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = width;
  ctx.stroke();
}

export function ellipse(ctx, x, y, rx, ry, fill, rotation = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rotation, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

export function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

export function roundRect(ctx, x, y, w, h, r, fill) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

export function poly(ctx, points, fill) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

export function line(ctx, x1, y1, x2, y2, stroke, width) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.stroke();
}

// A five-pointed star centred at (x, y).
export function star5(ctx, x, y, outer, inner, fill, rotation = -Math.PI / 2) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = rotation + (i * Math.PI) / 5;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

// A soft three-lobed cloud.
export function cloud(ctx, x, y, s, fill) {
  disc(ctx, x, y, 16 * s, fill);
  disc(ctx, x + 18 * s, y - 6 * s, 20 * s, fill);
  disc(ctx, x + 38 * s, y, 15 * s, fill);
  rect(ctx, x - 12 * s, y, 62 * s, 14 * s, fill);
}

// A simple gull: two arcs like a shallow "m".
export function gull(ctx, x, y, s, stroke) {
  ctx.beginPath();
  ctx.arc(x - 7 * s, y, 7 * s, Math.PI * 1.15, Math.PI * 1.95);
  ctx.arc(x + 7 * s, y, 7 * s, Math.PI * 1.05, Math.PI * 1.85);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2 * s;
  ctx.lineCap = 'round';
  ctx.stroke();
}

// A pine tree: trunk plus three stacked triangles.
export function pine(ctx, x, y, s, foliage, trunk = '#6b4a2b') {
  rect(ctx, x - 3 * s, y - 8 * s, 6 * s, 14 * s, trunk);
  poly(ctx, [[x, y - 52 * s], [x - 20 * s, y - 12 * s], [x + 20 * s, y - 12 * s]], foliage);
  poly(ctx, [[x, y - 38 * s], [x - 16 * s, y - 4 * s], [x + 16 * s, y - 4 * s]], foliage);
  poly(ctx, [[x, y - 24 * s], [x - 12 * s, y + 4 * s], [x + 12 * s, y + 4 * s]], foliage);
}

// A vertical sky gradient across the whole panel.
export function sky(ctx, w, h, top, bottom) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}
