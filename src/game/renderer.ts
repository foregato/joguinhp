import { PhysicsWorldState, WORLD_H, WORLD_W } from './physics';
import { HintStep, LevelDefinition, LiquidZone, PhysicsBody } from './types';

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rad = Math.min(r, Math.abs(w) * 0.5, Math.abs(h) * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.lineTo(x + w - rad, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
  ctx.lineTo(x + w, y + h - rad);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
  ctx.lineTo(x + rad, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
  ctx.lineTo(x, y + rad);
  ctx.quadraticCurveTo(x, y, x + rad, y);
  ctx.closePath();
}

function drawLiquid(ctx: CanvasRenderingContext2D, liq: LiquidZone) {
  ctx.save();
  ctx.beginPath();
  const topY = Math.max(liq.y, liq.surfaceY);
  const bottomY = liq.y + liq.h;
  ctx.moveTo(liq.x, bottomY);
  ctx.lineTo(liq.x, topY);

  const steps = 16;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const px = liq.x + t * liq.w;
    const wave =
      Math.sin(t * Math.PI * 3 + liq.wavePhase) * liq.waveAmplitude +
      Math.cos(t * Math.PI * 5 - liq.wavePhase * 0.7) * (liq.waveAmplitude * 0.4);
    ctx.lineTo(px, topY + wave);
  }
  ctx.lineTo(liq.x + liq.w, bottomY);
  ctx.closePath();
  ctx.fillStyle = liq.color;
  ctx.fill();

  // Top meniscus line
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const px = liq.x + t * liq.w;
    const wave =
      Math.sin(t * Math.PI * 3 + liq.wavePhase) * liq.waveAmplitude +
      Math.cos(t * Math.PI * 5 - liq.wavePhase * 0.7) * (liq.waveAmplitude * 0.4);
    if (i === 0) ctx.moveTo(px, topY + wave);
    else ctx.lineTo(px, topY + wave);
  }
  ctx.strokeStyle = liq.surfaceColor;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function drawWeightPips(ctx: CanvasRenderingContext2D, count: number, yOffset = 0) {
  if (!count || count <= 0) return;
  const total = Math.round(count);
  const spacing = 6;
  const startX = -((total - 1) * spacing) / 2;
  ctx.fillStyle = 'rgba(43, 50, 48, 0.55)';
  for (let i = 0; i < total; i++) {
    ctx.beginPath();
    ctx.arc(startX + i * spacing, yOffset, 1.9, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBody(
  ctx: CanvasRenderingContext2D,
  b: PhysicsBody,
  world: PhysicsWorldState,
  hoveredId: string | null,
  time: number
) {
  if (!b.active || b.fadeOut <= 0.01) return;

  ctx.save();
  ctx.globalAlpha = b.fadeOut;
  ctx.translate(b.x, b.y);
  ctx.rotate(b.angle);
  ctx.scale(b.squashX, b.squashY);

  const isAttachedFruit = Boolean(b.attachedToClip);
  const isHeldBob = Boolean(
    world.pendulum && !world.pendulum.released && b.id === world.pendulum.bobBodyId
  );
  const isTappable =
    ((Boolean(b.tapAction) && (b.maxTaps === undefined || b.tappedCount < b.maxTaps)) ||
      isAttachedFruit ||
      isHeldBob) &&
    !b.isRemoved;
  const isHovered =
    hoveredId === b.id ||
    (isAttachedFruit &&
      world.bodies.some((c) => c.id === hoveredId && c.launchTargetId === b.id)) ||
    (isHeldBob && hoveredId === 'pendulum_clip');

  // Subtle interactive halo for tappable items
  if (isTappable) {
    const pulse = 0.5 + 0.5 * Math.sin(time * 3.1 + b.x * 0.02);
    ctx.save();
    ctx.strokeStyle = isHovered
      ? 'rgba(127, 166, 138, 0.85)'
      : `rgba(127, 166, 138, ${0.22 + pulse * 0.18})`;
    ctx.lineWidth = isHovered ? 2.4 : 1.5;
    ctx.setLineDash([4, 4]);
    if (b.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, (b.radius ?? 16) + 7 + (isHovered ? 2 : 0), 0, Math.PI * 2);
      ctx.stroke();
    } else {
      const hw = (b.w ?? 30) * 0.5 + 6 + (isHovered ? 2 : 0);
      const hh = (b.h ?? 30) * 0.5 + 6 + (isHovered ? 2 : 0);
      roundRectPath(ctx, -hw, -hh, hw * 2, hh * 2, 10);
      ctx.stroke();
    }
    ctx.restore();
  }

  const strokeInk = '#49524F';
  const hw = (b.w ?? 20) * 0.5;
  const hh = (b.h ?? 20) * 0.5;
  const r = b.radius ?? 16;

  switch (b.kind) {
    case 'shelf':
    case 'ramp':
    case 'wall': {
      roundRectPath(ctx, -hw, -hh, b.w!, b.h!, 6);
      ctx.fillStyle = b.color;
      ctx.fill();
      ctx.strokeStyle = strokeInk;
      ctx.lineWidth = 1.6;
      ctx.stroke();
      break;
    }

    case 'hinge_plank': {
      roundRectPath(ctx, -hw, -hh, b.w!, b.h!, 7);
      ctx.fillStyle = b.color;
      ctx.fill();
      ctx.strokeStyle = strokeInk;
      ctx.lineWidth = 1.7;
      ctx.stroke();
      // Center pivot pin
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#FCFBF8';
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'spoon': {
      // Wooden handle + rounded spoon bowl on left
      roundRectPath(ctx, -hw + 16, -4.5, b.w! - 16, 9, 4.5);
      ctx.fillStyle = b.color;
      ctx.fill();
      ctx.strokeStyle = strokeInk;
      ctx.lineWidth = 1.6;
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(-hw + 22, 0, 22, 10, 0, 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#7FA68A';
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'sugar': {
      roundRectPath(ctx, -hw, -hh, b.w!, b.h!, 5);
      ctx.fillStyle = '#FCFBF8';
      ctx.fill();
      ctx.strokeStyle = strokeInk;
      ctx.lineWidth = 1.7;
      ctx.stroke();
      // Subtle sugar grain dots
      ctx.fillStyle = 'rgba(73, 82, 79, 0.25)';
      ctx.fillRect(-5, -5, 2.5, 2.5);
      ctx.fillRect(4, -2, 2.5, 2.5);
      ctx.fillRect(-2, 5, 2.5, 2.5);
      break;
    }

    case 'ice': {
      roundRectPath(ctx, -hw, -hh, b.w!, b.h!, 7);
      ctx.fillStyle = 'rgba(207, 228, 238, 0.85)';
      ctx.fill();
      ctx.strokeStyle = '#6D92A3';
      ctx.lineWidth = 1.7;
      ctx.stroke();
      // Crisp ice shine
      ctx.beginPath();
      ctx.moveTo(-hw + 6, -hh + 10);
      ctx.lineTo(-hw + 12, -hh + 5);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.stroke();
      break;
    }

    case 'cup':
    case 'plate':
    case 'soap_dish': {
      roundRectPath(ctx, -hw, -hh, b.w!, b.h!, 5);
      ctx.fillStyle = b.color;
      ctx.fill();
      ctx.strokeStyle = strokeInk;
      ctx.lineWidth = 1.6;
      ctx.stroke();
      break;
    }

    case 'pin':
    case 'gate': {
      roundRectPath(ctx, -hw, -hh, b.w!, b.h!, 5);
      ctx.fillStyle = b.color;
      ctx.fill();
      ctx.strokeStyle = strokeInk;
      ctx.lineWidth = 1.7;
      ctx.stroke();
      // Top pull knob
      ctx.beginPath();
      ctx.arc(0, -hh, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#FCFBF8';
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'book': {
      roundRectPath(ctx, -hw, -hh, b.w!, b.h!, 4);
      ctx.fillStyle = b.color;
      ctx.fill();
      ctx.strokeStyle = strokeInk;
      ctx.lineWidth = 1.7;
      ctx.stroke();
      // Cream spine bands
      ctx.fillStyle = 'rgba(252, 251, 248, 0.72)';
      ctx.fillRect(-hw + 3, -hh + 14, b.w! - 6, 5);
      ctx.fillRect(-hw + 3, hh - 19, b.w! - 6, 5);
      break;
    }

    case 'bell': {
      const shimmer = world.bellRung ? Math.sin(time * 28) * 1.6 : 0;
      ctx.translate(shimmer, 0);
      // Base
      roundRectPath(ctx, -r - 2, r - 6, (r + 2) * 2, 8, 4);
      ctx.fillStyle = '#49524F';
      ctx.fill();
      // Dome
      ctx.beginPath();
      ctx.arc(0, r - 6, r - 1, Math.PI, 0);
      ctx.closePath();
      ctx.fillStyle = b.color;
      ctx.fill();
      ctx.strokeStyle = strokeInk;
      ctx.lineWidth = 1.8;
      ctx.stroke();
      // Top button
      ctx.beginPath();
      ctx.arc(0, -r + 12, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#FCFBF8';
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'toaster': {
      const depress = (b.bounceAnim ?? 0) * 14;
      // Toaster body
      roundRectPath(ctx, -hw, -hh + 8, b.w!, b.h! - 8, 16);
      ctx.fillStyle = b.color;
      ctx.fill();
      ctx.strokeStyle = strokeInk;
      ctx.lineWidth = 1.8;
      ctx.stroke();
      // Slot line
      roundRectPath(ctx, -22, -hh + 12, 44, 6, 3);
      ctx.fillStyle = '#49524F';
      ctx.fill();
      // Side lever
      roundRectPath(ctx, hw - 2, -10 + depress, 12, 9, 4);
      ctx.fillStyle = '#DDA089';
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'toast': {
      // Crust + soft bread center
      roundRectPath(ctx, -hw, -hh, b.w!, b.h!, 10);
      ctx.fillStyle = b.accentColor ?? '#B88B58';
      ctx.fill();
      ctx.strokeStyle = strokeInk;
      ctx.lineWidth = 1.7;
      ctx.stroke();
      roundRectPath(ctx, -hw + 5, -hh + 5, b.w! - 10, b.h! - 10, 6);
      ctx.fillStyle = b.color;
      ctx.fill();
      break;
    }

    case 'scale_beam':
    case 'mobile_bar': {
      roundRectPath(ctx, -hw, -hh, b.w!, b.h!, 5);
      ctx.fillStyle = b.color;
      ctx.fill();
      ctx.strokeStyle = strokeInk;
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#E6C675';
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'scale_pan': {
      // Shallow porcelain dish pan with subtle raised side lips
      ctx.beginPath();
      ctx.moveTo(-hw, -hh - 6);
      ctx.lineTo(-hw + 8, hh);
      ctx.lineTo(hw - 8, hh);
      ctx.lineTo(hw, -hh - 6);
      ctx.lineTo(hw - 6, -hh - 6);
      ctx.lineTo(hw - 12, -hh + 2);
      ctx.lineTo(-hw + 12, -hh + 2);
      ctx.lineTo(-hw + 6, -hh - 6);
      ctx.closePath();
      ctx.fillStyle = b.color;
      ctx.fill();
      ctx.strokeStyle = strokeInk;
      ctx.lineWidth = 1.6;
      ctx.stroke();
      break;
    }

    case 'orange':
    case 'apple':
    case 'lemon': {
      ctx.beginPath();
      if (b.kind === 'lemon') {
        ctx.ellipse(0, 0, r * 1.12, r * 0.88, 0, 0, Math.PI * 2);
      } else {
        ctx.arc(0, 0, r, 0, Math.PI * 2);
      }
      ctx.fillStyle = b.color;
      ctx.fill();
      ctx.strokeStyle = strokeInk;
      ctx.lineWidth = 1.7;
      ctx.stroke();

      // Tiny sage leaf on top
      ctx.beginPath();
      ctx.ellipse(4, -r + 1, 7, 3.5, -0.4, 0, Math.PI * 2);
      ctx.fillStyle = '#7FA68A';
      ctx.fill();
      ctx.stroke();

      if (b.weightValue) {
        drawWeightPips(ctx, b.weightValue, 2);
      }
      break;
    }

    case 'clip': {
      roundRectPath(ctx, -hw, -hh, b.w!, b.h!, 7);
      ctx.fillStyle = b.color;
      ctx.fill();
      ctx.strokeStyle = strokeInk;
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#FCFBF8';
      ctx.fill();
      break;
    }

    case 'drop': {
      ctx.beginPath();
      ctx.moveTo(0, -r - 3);
      ctx.quadraticCurveTo(r + 1, 0, 0, r);
      ctx.quadraticCurveTo(-r - 1, 0, 0, -r - 3);
      ctx.fillStyle = b.color;
      ctx.fill();
      ctx.strokeStyle = '#5D879B';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      break;
    }

    case 'leaf': {
      ctx.beginPath();
      ctx.ellipse(0, 0, hw, hh + 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.fill();
      ctx.strokeStyle = strokeInk;
      ctx.lineWidth = 1.7;
      ctx.stroke();
      // Leaf midrib
      ctx.beginPath();
      ctx.moveTo(-hw + 12, 0);
      ctx.lineTo(hw - 12, 0);
      ctx.strokeStyle = 'rgba(252, 251, 248, 0.65)';
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#FCFBF8';
      ctx.fill();
      ctx.strokeStyle = strokeInk;
      ctx.stroke();
      break;
    }

    case 'pot': {
      const drops = world.faucet?.dropsCollected ?? 0;
      const target = world.faucet?.targetDrops ?? 5;
      const ratio = Math.min(1, drops / target);

      // Sprout growing out of the pot!
      const stemH = 12 + ratio * 38;
      ctx.beginPath();
      ctx.moveTo(0, -hh + 8);
      ctx.quadraticCurveTo(4, -hh + 8 - stemH * 0.5, 0, -hh + 8 - stemH);
      ctx.strokeStyle = '#5E8569';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.stroke();

      const leafScale = 0.45 + ratio * 0.75;
      ctx.save();
      ctx.translate(0, -hh + 8 - stemH);
      ctx.scale(leafScale, leafScale);
      ctx.beginPath();
      ctx.ellipse(-9, -2, 10, 5, -0.45, 0, Math.PI * 2);
      ctx.ellipse(9, -4, 10, 5, 0.45, 0, Math.PI * 2);
      ctx.fillStyle = '#7FA68A';
      ctx.fill();
      ctx.strokeStyle = strokeInk;
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.restore();

      // Terracotta pot body (trapezoid)
      ctx.beginPath();
      ctx.moveTo(-hw + 4, -hh + 10);
      ctx.lineTo(hw - 4, -hh + 10);
      ctx.lineTo(hw - 14, hh);
      ctx.lineTo(-hw + 14, hh);
      ctx.closePath();
      ctx.fillStyle = b.color;
      ctx.fill();
      ctx.strokeStyle = strokeInk;
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Pot rim
      roundRectPath(ctx, -hw, -hh, b.w!, 14, 5);
      ctx.fillStyle = '#E6B39F';
      ctx.fill();
      ctx.stroke();

      // Clean drop counter text inside pot
      ctx.fillStyle = '#FCFBF8';
      ctx.font = '600 13px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${drops}/${target}`, 0, 8);
      break;
    }

    case 'cookie': {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.fill();
      ctx.strokeStyle = strokeInk;
      ctx.lineWidth = 1.7;
      ctx.stroke();
      // Chocolate chips
      ctx.fillStyle = b.accentColor ?? '#8C6B4A';
      [
        [-6, -5],
        [6, -3],
        [-3, 6],
        [5, 6],
        [0, -1],
      ].forEach(([cx, cy]) => {
        ctx.beginPath();
        ctx.arc(cx, cy, 2.3, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }

    case 'key_weight': {
      // Brass key / padlock charm
      roundRectPath(ctx, -hw + 4, -hh + 10, b.w! - 8, b.h! - 10, 6);
      ctx.fillStyle = b.color;
      ctx.fill();
      ctx.strokeStyle = strokeInk;
      ctx.lineWidth = 1.7;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, -hh + 9, 8, Math.PI, 0);
      ctx.stroke();
      drawWeightPips(ctx, b.weightValue ?? 2, 6);
      break;
    }

    case 'button_weight': {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.fill();
      ctx.strokeStyle = strokeInk;
      ctx.lineWidth = 1.7;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, r - 4.5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(252,251,248,0.6)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      drawWeightPips(ctx, b.weightValue ?? 1, 0);
      break;
    }

    case 'soap': {
      roundRectPath(ctx, -hw, -hh, b.w!, b.h!, 12);
      ctx.fillStyle = b.color;
      ctx.fill();
      ctx.strokeStyle = strokeInk;
      ctx.lineWidth = 1.7;
      ctx.stroke();
      roundRectPath(ctx, -hw + 8, -hh + 5, b.w! - 16, 4, 2);
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.fill();
      break;
    }

    case 'sponge': {
      const springLift = (b.bounceAnim ?? 0) * -6;
      ctx.translate(0, springLift);
      roundRectPath(ctx, -hw, -hh, b.w!, b.h!, 9);
      ctx.fillStyle = b.color;
      ctx.fill();
      ctx.strokeStyle = strokeInk;
      ctx.lineWidth = 1.7;
      ctx.stroke();
      // Scouring pad top stripe
      roundRectPath(ctx, -hw, -hh, b.w!, 7, 4);
      ctx.fillStyle = '#7FA68A';
      ctx.fill();
      // Sponge pores
      ctx.fillStyle = 'rgba(184, 139, 88, 0.35)';
      [-24, -8, 12, 26].forEach((px, idx) => {
        ctx.beginPath();
        ctx.arc(px, idx % 2 === 0 ? 4 : 7, 2.2, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }

    case 'marble':
    case 'pendulum_bob': {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.fill();
      ctx.strokeStyle = strokeInk;
      ctx.lineWidth = 1.7;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-r * 0.3, -r * 0.3, r * 0.28, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.fill();
      break;
    }

    case 'float_raft': {
      roundRectPath(ctx, -hw, -hh, b.w!, b.h!, 7);
      ctx.fillStyle = b.color;
      ctx.fill();
      ctx.strokeStyle = strokeInk;
      ctx.lineWidth = 1.6;
      ctx.stroke();
      // Cork wood grain lines
      ctx.strokeStyle = 'rgba(73,82,79,0.22)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-hw + 14, -2);
      ctx.lineTo(-hw + 44, -2);
      ctx.moveTo(10, 2);
      ctx.lineTo(hw - 16, 2);
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
}

function drawScalesAndMobiles(ctx: CanvasRenderingContext2D, world: PhysicsWorldState) {
  const strokeInk = '#49524F';

  // Scales: pedestal + strings + balance indicator
  for (const sc of world.scales) {
    const beam = world.bodies.find((b) => b.id === sc.beamId);
    const leftPan = world.bodies.find((b) => b.id === sc.leftPanId);
    const rightPan = world.bodies.find((b) => b.id === sc.rightPanId);
    if (!beam || !leftPan || !rightPan) continue;

    ctx.save();
    // Pedestal stand down to table (y=496)
    ctx.beginPath();
    ctx.moveTo(beam.x - 16, 496);
    ctx.lineTo(beam.x - 4, beam.y);
    ctx.lineTo(beam.x + 4, beam.y);
    ctx.lineTo(beam.x + 16, 496);
    ctx.closePath();
    ctx.fillStyle = '#D5BFA8';
    ctx.fill();
    ctx.strokeStyle = strokeInk;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Equilibrium dial arc above pivot
    const balanced = Math.abs(beam.angle) < sc.equilibriumTolerance;
    ctx.beginPath();
    ctx.arc(beam.x, beam.y - 26, 18, Math.PI * 1.15, Math.PI * 1.85);
    ctx.strokeStyle = balanced ? '#7FA68A' : 'rgba(73,82,79,0.25)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Needle
    ctx.beginPath();
    ctx.moveTo(beam.x, beam.y);
    ctx.lineTo(
      beam.x + Math.sin(beam.angle) * 28,
      beam.y - Math.cos(beam.angle) * 28
    );
    ctx.strokeStyle = balanced ? '#5E8569' : '#DDA089';
    ctx.lineWidth = 2.4;
    ctx.stroke();

    // Strings to left & right pans
    const lx = beam.x - Math.cos(beam.angle) * sc.armLength;
    const ly = beam.y - Math.sin(beam.angle) * sc.armLength;
    const rx = beam.x + Math.cos(beam.angle) * sc.armLength;
    const ry = beam.y + Math.sin(beam.angle) * sc.armLength;

    ctx.strokeStyle = 'rgba(73, 82, 79, 0.45)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(leftPan.x - 32, leftPan.y - 4);
    ctx.moveTo(lx, ly);
    ctx.lineTo(leftPan.x + 32, leftPan.y - 4);
    ctx.moveTo(rx, ry);
    ctx.lineTo(rightPan.x - 32, rightPan.y - 4);
    ctx.moveTo(rx, ry);
    ctx.lineTo(rightPan.x + 32, rightPan.y - 4);
    ctx.stroke();
    ctx.restore();
  }

  // Mobiles: ceiling cord + platform threads
  for (const mob of world.mobiles) {
    const bar = world.bodies.find((b) => b.id === mob.barId);
    const leftPlat = world.bodies.find((b) => b.id === mob.leftPlatformId);
    const rightPlat = world.bodies.find((b) => b.id === mob.rightPlatformId);
    if (!bar || !leftPlat || !rightPlat) continue;

    ctx.save();
    ctx.strokeStyle = 'rgba(73, 82, 79, 0.45)';
    ctx.lineWidth = 1.4;

    if (!mob.parentBarId) {
      // Main suspension cord from ceiling
      ctx.beginPath();
      ctx.moveTo(bar.x, 40);
      ctx.lineTo(bar.x, bar.y);
      ctx.stroke();
    } else {
      const parent = world.bodies.find((b) => b.id === mob.parentBarId);
      if (parent) {
        const px = parent.x + Math.cos(parent.angle) * (mob.attachOffsetX ?? 0);
        const py = parent.y + Math.sin(parent.angle) * (mob.attachOffsetX ?? 0);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(bar.x, bar.y);
        ctx.stroke();
      }
    }

    const lx = bar.x - Math.cos(bar.angle) * mob.armLength;
    const ly = bar.y - Math.sin(bar.angle) * mob.armLength;
    const rx = bar.x + Math.cos(bar.angle) * mob.armLength;
    const ry = bar.y + Math.sin(bar.angle) * mob.armLength;

    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(leftPlat.x, leftPlat.y - 4);
    if (!rightPlat.sensorOnly) {
      ctx.moveTo(rx, ry);
      ctx.lineTo(rightPlat.x, rightPlat.y - 4);
    }
    ctx.stroke();
    ctx.restore();
  }

  // Hanging cords for attached clip items
  for (const clip of world.bodies) {
    if (clip.kind === 'clip' && clip.active && !clip.isRemoved && clip.launchTargetId) {
      const target = world.bodies.find((b) => b.id === clip.launchTargetId);
      if (target && target.attachedToClip) {
        ctx.save();
        ctx.strokeStyle = 'rgba(73, 82, 79, 0.4)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(clip.x, 0);
        ctx.lineTo(clip.x, clip.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
        ctx.restore();
      }
    }
  }
}

function drawFaucet(ctx: CanvasRenderingContext2D, world: PhysicsWorldState) {
  if (!world.faucet) return;
  const { x, y } = world.faucet;
  ctx.save();
  ctx.strokeStyle = '#49524F';
  ctx.fillStyle = '#D5D8D6';
  ctx.lineWidth = 1.8;

  // Curved minimalist pipe from left wall
  ctx.beginPath();
  ctx.moveTo(x - 95, y - 35);
  ctx.lineTo(x - 16, y - 35);
  ctx.quadraticCurveTo(x, y - 35, x, y - 16);
  ctx.lineTo(x, y);
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#C9D3D0';
  ctx.stroke();

  ctx.lineWidth = 1.6;
  ctx.strokeStyle = '#49524F';
  ctx.beginPath();
  ctx.roundRect(x - 9, y - 6, 18, 10, 4);
  ctx.fillStyle = '#E3DDD2';
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawPendulum(ctx: CanvasRenderingContext2D, world: PhysicsWorldState) {
  if (!world.pendulum) return;
  const p = world.pendulum;
  const bob = world.bodies.find((b) => b.id === p.bobBodyId);
  if (!bob) return;

  ctx.save();
  // Ceiling bracket
  ctx.strokeStyle = 'rgba(73, 82, 79, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(p.anchorX, 0);
  ctx.lineTo(p.anchorX, p.anchorY);
  ctx.stroke();

  if (!p.released) {
    // Arc guide
    ctx.save();
    ctx.setLineDash([4, 6]);
    ctx.strokeStyle = 'rgba(138, 180, 200, 0.35)';
    ctx.beginPath();
    ctx.arc(
      p.anchorX,
      p.anchorY,
      p.length,
      Math.PI * 0.5 - p.maxAngle,
      Math.PI * 0.5 + p.maxAngle
    );
    ctx.stroke();
    ctx.restore();

    // Swinging cord
    ctx.beginPath();
    ctx.moveTo(p.anchorX, p.anchorY);
    ctx.lineTo(bob.x, bob.y);
    ctx.strokeStyle = '#49524F';
    ctx.lineWidth = 1.8;
    ctx.stroke();
  }
  ctx.restore();
}

function drawHintOverlay(
  ctx: CanvasRenderingContext2D,
  world: PhysicsWorldState,
  hint: HintStep | null,
  hintTier: number,
  time: number
) {
  if (!hint || hintTier <= 0) return;
  const target = world.bodies.find((b) => b.id === hint.targetBodyId);
  if (!target || !target.active || target.isRemoved) return;

  ctx.save();
  const pulse = 0.5 + 0.5 * Math.sin(time * 5);
  const rad =
    target.shape === 'circle'
      ? (target.radius ?? 20) + 16 + pulse * 6
      : Math.max(target.w ?? 40, target.h ?? 40) * 0.5 + 14 + pulse * 6;

  ctx.beginPath();
  ctx.arc(target.x, target.y, rad, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(94, 133, 105, ${0.55 + pulse * 0.35})`;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  if (hintTier >= 2 && hint.directionHint) {
    const { dx, dy } = hint.directionHint;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const sx = target.x + ux * (rad + 6);
    const sy = target.y + uy * (rad + 6);
    const ex = sx + ux * 42;
    const ey = sy + uy * 42;

    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.strokeStyle = '#5E8569';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    const angle = Math.atan2(uy, ux);
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex - Math.cos(angle - 0.5) * 9, ey - Math.sin(angle - 0.5) * 9);
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex - Math.cos(angle + 0.5) * 9, ey - Math.sin(angle + 0.5) * 9);
    ctx.stroke();
  }

  ctx.restore();
}

export function renderPhysicsWorld(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  world: PhysicsWorldState,
  level: LevelDefinition | null,
  goalProgress: number,
  hoveredId: string | null,
  activeHint: HintStep | null,
  hintTier: number
) {
  ctx.clearRect(0, 0, width, height);

  // Fit 960x580 virtual world cleanly centered with calm margin
  const scale = Math.min(width / WORLD_W, height / WORLD_H);
  const offsetX = (width - WORLD_W * scale) * 0.5;
  const offsetY = (height - WORLD_H * scale) * 0.5;

  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  // Subtle decorative background shapes (warm pastel organic forms)
  ctx.fillStyle = 'rgba(234, 230, 221, 0.45)';
  ctx.beginPath();
  ctx.arc(170, 140, 82, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(138, 180, 200, 0.1)';
  ctx.beginPath();
  ctx.arc(780, 180, 110, 0, Math.PI * 2);
  ctx.fill();

  // Draw cup handle decoration for Level 1 & Title diorama
  if (!level || level.id === 1) {
    const cx = level ? 545 : 730;
    const cy = level ? 452 : 445;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx + 52, cy - 2, 20, -Math.PI * 0.48, Math.PI * 0.48);
    ctx.strokeStyle = '#FCFBF8';
    ctx.lineWidth = 10;
    ctx.stroke();
    ctx.strokeStyle = '#49524F';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.restore();
  }

  // Draw goal zone subtle dashed cushion if applicable
  if (level?.goal.zone) {
    const z = level.goal.zone;
    ctx.save();
    roundRectPath(ctx, z.x, z.y, z.w, z.h, 12);
    ctx.fillStyle =
      goalProgress > 0.05
        ? `rgba(127, 166, 138, ${0.08 + goalProgress * 0.16})`
        : 'rgba(127, 166, 138, 0.05)';
    ctx.fill();
    ctx.restore();
  }

  // Draw liquids behind glass/cup walls
  for (const liq of world.liquids) {
    drawLiquid(ctx, liq);
  }

  // Draw structural lines (scales, mobiles, pendulum, faucet)
  drawScalesAndMobiles(ctx, world);
  drawFaucet(ctx, world);
  drawPendulum(ctx, world);

  // Draw all bodies
  for (const b of world.bodies) {
    drawBody(ctx, b, world, hoveredId, world.timeElapsed);
  }

  // Draw tap ripples
  for (const r of world.ripples) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
    ctx.strokeStyle = r.color;
    ctx.globalAlpha = Math.max(0, r.alpha);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  // Draw particles
  for (const p of world.particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Draw hint overlay
  drawHintOverlay(ctx, world, activeHint, hintTier, world.timeElapsed);

  // Subtle settling ring near top-center when goal is actively stabilizing
  if (goalProgress > 0.05 && goalProgress < 1) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(WORLD_W * 0.5, 58, 16, -Math.PI * 0.5, -Math.PI * 0.5 + Math.PI * 2 * goalProgress);
    ctx.strokeStyle = '#7FA68A';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}
