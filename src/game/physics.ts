import {
  FaucetRig,
  LiquidZone,
  MobileLinkage,
  Particle,
  PendulumRig,
  PhysicsBody,
  ScaleLinkage,
  TapRipple,
} from './types';

export const WORLD_W = 960;
export const WORLD_H = 580;
export const GRAVITY = 520;
const SUBSTEPS = 6;

export interface WorldViewport {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export function computeWorldViewport(width: number, height: number): WorldViewport {
  const isPortraitOrCompact = width < height || width < 640;
  if (isPortraitOrCompact) {
    // Mobile-first framing: zoom into the active central arena (x: 75..885, y: 45..550)
    // and reserve safe breathing space for the compact top and bottom mobile HUD bars.
    const topReserve = 66;
    const bottomReserve = 82;
    const availW = Math.max(120, width - 12);
    const availH = Math.max(160, height - topReserve - bottomReserve);
    const focusW = 810;
    const focusH = 510;
    const scale = Math.min(availW / focusW, availH / focusH);
    const centerX = WORLD_W * 0.5;
    const centerY = 296;
    return {
      scale,
      offsetX: width * 0.5 - centerX * scale,
      offsetY: topReserve + availH * 0.5 - centerY * scale,
    };
  }

  const topReserve = 50;
  const bottomReserve = 20;
  const availW = Math.max(200, width - 24);
  const availH = Math.max(200, height - topReserve - bottomReserve);
  const scale = Math.min(availW / WORLD_W, availH / WORLD_H);
  return {
    scale,
    offsetX: (width - WORLD_W * scale) * 0.5,
    offsetY: topReserve + (availH - WORLD_H * scale) * 0.5,
  };
}

interface Vec2 {
  x: number;
  y: number;
}

export interface PhysicsWorldState {
  bodies: PhysicsBody[];
  liquids: LiquidZone[];
  scales: ScaleLinkage[];
  mobiles: MobileLinkage[];
  pendulum: PendulumRig | null;
  faucet: FaucetRig | null;
  floatBridge: { raftId: string; liquidId: string; baseOffset: number } | null;
  particles: Particle[];
  ripples: TapRipple[];
  bellRung: boolean;
  bellRingTimer: number;
  goalHoldTimer: number;
  timeElapsed: number;
  kineticEnergy: number;
  panImpulsesY: Map<string, number>;
}

export function createBoxBody(
  opts: Partial<PhysicsBody> & { id: string; kind: PhysicsBody['kind']; x: number; y: number; w: number; h: number }
): PhysicsBody {
  const isStatic = opts.isStatic ?? false;
  const isPinned = opts.isPinnedPivot ?? false;
  const mass = isStatic ? 0 : (opts.mass ?? Math.max(0.5, (opts.w * opts.h) / 1800));
  const invMass = isStatic || isPinned || mass === 0 ? 0 : 1 / mass;
  const inertia =
    isStatic && !isPinned ? 0 : (1 / 12) * Math.max(0.8, mass) * (opts.w * opts.w + opts.h * opts.h);
  const invInertia = isStatic && !isPinned ? 0 : inertia > 0 ? 1 / inertia : 0;

  return {
    shape: 'box',
    vx: 0,
    vy: 0,
    angle: 0,
    angularVel: 0,
    restitution: 0.2,
    friction: 0.45,
    linearDamping: 0.08,
    angularDamping: 0.25,
    color: '#EAE6DD',
    material: 'wood',
    active: true,
    fadeOut: 1,
    tappedCount: 0,
    squashX: 1,
    squashY: 1,
    highlightPulse: 0,
    ...opts,
    isStatic,
    mass,
    invMass,
    inertia,
    invInertia,
  };
}

export function createCircleBody(
  opts: Partial<PhysicsBody> & { id: string; kind: PhysicsBody['kind']; x: number; y: number; radius: number }
): PhysicsBody {
  const isStatic = opts.isStatic ?? false;
  const isPinned = opts.isPinnedPivot ?? false;
  const mass = isStatic ? 0 : (opts.mass ?? Math.max(0.4, (Math.PI * opts.radius * opts.radius) / 1600));
  const invMass = isStatic || isPinned || mass === 0 ? 0 : 1 / mass;
  const inertia = isStatic && !isPinned ? 0 : 0.5 * Math.max(0.5, mass) * opts.radius * opts.radius;
  const invInertia = isStatic && !isPinned ? 0 : inertia > 0 ? 1 / inertia : 0;

  return {
    shape: 'circle',
    vx: 0,
    vy: 0,
    angle: 0,
    angularVel: 0,
    restitution: 0.28,
    friction: 0.35,
    linearDamping: 0.06,
    angularDamping: 0.15,
    color: '#8AB4C8',
    material: 'ceramic',
    active: true,
    fadeOut: 1,
    tappedCount: 0,
    squashX: 1,
    squashY: 1,
    highlightPulse: 0,
    ...opts,
    isStatic,
    mass,
    invMass,
    inertia,
    invInertia,
  };
}

export interface StepCallbacks {
  onImpact?: (a: PhysicsBody, b: PhysicsBody, speed: number, x: number, y: number) => void;
  onWaterEnter?: (body: PhysicsBody, liquid: LiquidZone) => void;
  onBellRung?: () => void;
  onDropCollected?: () => void;
}

function getBoxAxes(angle: number): [Vec2, Vec2] {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [
    { x: c, y: s },
    { x: -s, y: c },
  ];
}

function getBoxVertices(b: PhysicsBody): Vec2[] {
  const hw = (b.w ?? 20) * 0.5;
  const hh = (b.h ?? 20) * 0.5;
  const c = Math.cos(b.angle);
  const s = Math.sin(b.angle);
  const dx1 = c * hw;
  const dy1 = s * hw;
  const dx2 = -s * hh;
  const dy2 = c * hh;
  return [
    { x: b.x - dx1 - dx2, y: b.y - dy1 - dy2 },
    { x: b.x + dx1 - dx2, y: b.y + dy1 - dy2 },
    { x: b.x + dx1 + dx2, y: b.y + dy1 + dy2 },
    { x: b.x - dx1 + dx2, y: b.y - dy1 + dy2 },
  ];
}

function projectVerts(verts: Vec2[], axis: Vec2): { min: number; max: number } {
  let min = verts[0].x * axis.x + verts[0].y * axis.y;
  let max = min;
  for (let i = 1; i < verts.length; i++) {
    const p = verts[i].x * axis.x + verts[i].y * axis.y;
    if (p < min) min = p;
    if (p > max) max = p;
  }
  return { min, max };
}

function findBestEdge(verts: Vec2[], normal: Vec2): { v1: Vec2; v2: Vec2; maxVert: Vec2 } {
  let maxProj = -Infinity;
  let idx = 0;
  for (let i = 0; i < verts.length; i++) {
    const p = verts[i].x * normal.x + verts[i].y * normal.y;
    if (p > maxProj) {
      maxProj = p;
      idx = i;
    }
  }
  const v = verts[idx];
  const vPrev = verts[(idx + 3) % 4];
  const vNext = verts[(idx + 1) % 4];

  const l1 = { x: v.x - vPrev.x, y: v.y - vPrev.y };
  const len1 = Math.hypot(l1.x, l1.y) || 1;
  const l2 = { x: v.x - vNext.x, y: v.y - vNext.y };
  const len2 = Math.hypot(l2.x, l2.y) || 1;

  const dot1 = Math.abs((l1.x / len1) * normal.x + (l1.y / len1) * normal.y);
  const dot2 = Math.abs((l2.x / len2) * normal.x + (l2.y / len2) * normal.y);

  if (dot1 <= dot2) {
    return { v1: vPrev, v2: v, maxVert: v };
  }
  return { v1: v, v2: vNext, maxVert: v };
}

function clipSegmentToLine(vIn: Vec2[], normal: Vec2, offset: number): Vec2[] {
  const out: Vec2[] = [];
  if (vIn.length < 2) return out;
  const d0 = normal.x * vIn[0].x + normal.y * vIn[0].y - offset;
  const d1 = normal.x * vIn[1].x + normal.y * vIn[1].y - offset;
  if (d0 >= 0) out.push(vIn[0]);
  if (d1 >= 0) out.push(vIn[1]);
  if (d0 * d1 < 0) {
    const t = d0 / (d0 - d1);
    out.push({
      x: vIn[0].x + t * (vIn[1].x - vIn[0].x),
      y: vIn[0].y + t * (vIn[1].y - vIn[0].y),
    });
  }
  return out;
}

interface ContactManifold {
  normal: Vec2; // From A to B
  depth: number;
  contacts: Vec2[];
}

function collideCircleCircle(a: PhysicsBody, b: PhysicsBody): ContactManifold | null {
  const ra = a.radius ?? 10;
  const rb = b.radius ?? 10;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distSq = dx * dx + dy * dy;
  const rSum = ra + rb;
  if (distSq >= rSum * rSum) return null;
  const dist = Math.sqrt(distSq);
  const nx = dist > 0.0001 ? dx / dist : 0;
  const ny = dist > 0.0001 ? dy / dist : 1;
  return {
    normal: { x: nx, y: ny },
    depth: rSum - dist,
    contacts: [{ x: a.x + nx * ra, y: a.y + ny * ra }],
  };
}

function collideCircleBox(circle: PhysicsBody, box: PhysicsBody): ContactManifold | null {
  const r = circle.radius ?? 10;
  const hw = (box.w ?? 20) * 0.5;
  const hh = (box.h ?? 20) * 0.5;
  const c = Math.cos(-box.angle);
  const s = Math.sin(-box.angle);
  const dx = circle.x - box.x;
  const dy = circle.y - box.y;
  const lx = dx * c - dy * s;
  const ly = dx * s + dy * c;

  const cx = Math.max(-hw, Math.min(hw, lx));
  const cy = Math.max(-hh, Math.min(hh, ly));
  let lnx = lx - cx;
  let lny = ly - cy;
  let distSq = lnx * lnx + lny * lny;

  if (distSq > r * r) return null;

  let depth = 0;
  if (distSq < 1e-6) {
    // Circle center inside box
    const px = hw - Math.abs(lx);
    const py = hh - Math.abs(ly);
    if (px < py) {
      lnx = lx >= 0 ? 1 : -1;
      lny = 0;
      depth = px + r;
    } else {
      lnx = 0;
      lny = ly >= 0 ? 1 : -1;
      depth = py + r;
    }
  } else {
    const dist = Math.sqrt(distSq);
    lnx /= dist;
    lny /= dist;
    depth = r - dist;
  }

  // Transform local normal (pointing from box to circle) back to world, then flip for circle->box
  const wc = Math.cos(box.angle);
  const ws = Math.sin(box.angle);
  const wnx = -(lnx * wc - lny * ws);
  const wny = -(lnx * ws + lny * wc);

  const wcx = box.x + (cx * wc - cy * ws);
  const wcy = box.y + (cx * ws + cy * wc);

  return {
    normal: { x: wnx, y: wny },
    depth,
    contacts: [{ x: wcx, y: wcy }],
  };
}

function collideBoxBox(a: PhysicsBody, b: PhysicsBody): ContactManifold | null {
  const vertsA = getBoxVertices(a);
  const vertsB = getBoxVertices(b);
  const axesA = getBoxAxes(a.angle);
  const axesB = getBoxAxes(b.angle);
  const axes = [axesA[0], axesA[1], axesB[0], axesB[1]];

  let minOverlap = Infinity;
  let bestAxis: Vec2 = { x: 0, y: 1 };

  for (const axis of axes) {
    const pA = projectVerts(vertsA, axis);
    const pB = projectVerts(vertsB, axis);
    const overlap = Math.min(pA.max, pB.max) - Math.max(pA.min, pB.min);
    if (overlap <= 0) return null;
    if (overlap < minOverlap) {
      minOverlap = overlap;
      bestAxis = axis;
    }
  }

  const centerDir = { x: b.x - a.x, y: b.y - a.y };
  if (centerDir.x * bestAxis.x + centerDir.y * bestAxis.y < 0) {
    bestAxis = { x: -bestAxis.x, y: -bestAxis.y };
  }

  const edgeA = findBestEdge(vertsA, bestAxis);
  const edgeB = findBestEdge(vertsB, { x: -bestAxis.x, y: -bestAxis.y });

  const vecA = { x: edgeA.v2.x - edgeA.v1.x, y: edgeA.v2.y - edgeA.v1.y };
  const vecB = { x: edgeB.v2.x - edgeB.v1.x, y: edgeB.v2.y - edgeB.v1.y };
  const lenA = Math.hypot(vecA.x, vecA.y) || 1;
  const lenB = Math.hypot(vecB.x, vecB.y) || 1;

  const perpA = Math.abs((vecA.x / lenA) * bestAxis.x + (vecA.y / lenA) * bestAxis.y);
  const perpB = Math.abs((vecB.x / lenB) * bestAxis.x + (vecB.y / lenB) * bestAxis.y);

  let refEdge = edgeA;
  let incEdge = edgeB;
  let refNormal = bestAxis;
  let flip = false;

  if (perpB < perpA) {
    refEdge = edgeB;
    incEdge = edgeA;
    refNormal = { x: -bestAxis.x, y: -bestAxis.y };
    flip = true;
  }

  const refDir = {
    x: refEdge.v2.x - refEdge.v1.x,
    y: refEdge.v2.y - refEdge.v1.y,
  };
  const refLen = Math.hypot(refDir.x, refDir.y) || 1;
  refDir.x /= refLen;
  refDir.y /= refLen;

  const offset1 = refDir.x * refEdge.v1.x + refDir.y * refEdge.v1.y;
  let clipped = clipSegmentToLine([incEdge.v1, incEdge.v2], refDir, offset1);
  if (clipped.length < 2) return null;

  const negRefDir = { x: -refDir.x, y: -refDir.y };
  const offset2 = negRefDir.x * refEdge.v2.x + negRefDir.y * refEdge.v2.y;
  clipped = clipSegmentToLine(clipped, negRefDir, offset2);
  if (clipped.length === 0) return null;

  const refPlaneOffset = refNormal.x * refEdge.maxVert.x + refNormal.y * refEdge.maxVert.y;
  const contacts: Vec2[] = [];
  for (const pt of clipped) {
    const sep = refNormal.x * pt.x + refNormal.y * pt.y - refPlaneOffset;
    if (sep <= 0.5) {
      contacts.push(pt);
    }
  }

  if (contacts.length === 0) {
    contacts.push(flip ? edgeA.maxVert : edgeB.maxVert);
  }

  return {
    normal: bestAxis,
    depth: minOverlap,
    contacts,
  };
}

function resolveManifold(
  a: PhysicsBody,
  b: PhysicsBody,
  m: ContactManifold,
  state: PhysicsWorldState,
  callbacks: StepCallbacks
) {
  const { normal, depth, contacts } = m;
  const count = contacts.length;
  const invMassSum = a.invMass + b.invMass;

  // Baumgarte positional correction
  const slop = 0.25;
  const percent = 0.45;
  if (invMassSum > 0 && depth > slop) {
    const corr = ((depth - slop) / invMassSum) * percent;
    a.x -= normal.x * corr * a.invMass;
    a.y -= normal.y * corr * a.invMass;
    b.x += normal.x * corr * b.invMass;
    b.y += normal.y * corr * b.invMass;
  }

  let maxImpactSpeed = 0;

  for (const contact of contacts) {
    const rAx = contact.x - a.x;
    const rAy = contact.y - a.y;
    const rBx = contact.x - b.x;
    const rBy = contact.y - b.y;

    const vAx = a.vx - a.angularVel * rAy;
    const vAy = a.vy + a.angularVel * rAx;
    const vBx = b.vx - b.angularVel * rBy;
    const vBy = b.vy + b.angularVel * rBx;

    const rvx = vBx - vAx;
    const rvy = vBy - vAy;

    const vn = rvx * normal.x + rvy * normal.y;
    if (vn > 0) continue;

    if (-vn > maxImpactSpeed) maxImpactSpeed = -vn;

    const e = Math.abs(vn) < 42 ? 0 : Math.max(a.restitution, b.restitution);
    const rACrossN = rAx * normal.y - rAy * normal.x;
    const rBCrossN = rBx * normal.y - rBy * normal.x;

    const denom =
      a.invMass +
      b.invMass +
      rACrossN * rACrossN * a.invInertia +
      rBCrossN * rBCrossN * b.invInertia;

    if (denom <= 1e-8) continue;

    let j = (-(1 + e) * vn) / denom;
    j /= count;

    const ix = j * normal.x;
    const iy = j * normal.y;

    a.vx -= ix * a.invMass;
    a.vy -= iy * a.invMass;
    a.angularVel -= (rAx * iy - rAy * ix) * a.invInertia;

    b.vx += ix * b.invMass;
    b.vy += iy * b.invMass;
    b.angularVel += (rBx * iy - rBy * ix) * b.invInertia;

    // Accumulate downward impulse for scale/mobile pans
    if (a.kind === 'scale_pan') {
      state.panImpulsesY.set(a.id, (state.panImpulsesY.get(a.id) ?? 0) - iy);
    }
    if (b.kind === 'scale_pan') {
      state.panImpulsesY.set(b.id, (state.panImpulsesY.get(b.id) ?? 0) + iy);
    }

    // Keep motor-driven hinged planks immune to counter-torque from tiny cubes
    if (a.targetAngle !== undefined && a.angleMotorStiffness) {
      a.angularVel = 0;
    }
    if (b.targetAngle !== undefined && b.angleMotorStiffness) {
      b.angularVel = 0;
    }

    // Friction
    const vAx2 = a.vx - a.angularVel * rAy;
    const vAy2 = a.vy + a.angularVel * rAx;
    const vBx2 = b.vx - b.angularVel * rBy;
    const vBy2 = b.vy + b.angularVel * rBx;
    const rvx2 = vBx2 - vAx2;
    const rvy2 = vBy2 - vAy2;

    const vn2 = rvx2 * normal.x + rvy2 * normal.y;
    let tx = rvx2 - vn2 * normal.x;
    let ty = rvy2 - vn2 * normal.y;
    const tLen = Math.hypot(tx, ty);
    if (tLen > 0.0001) {
      tx /= tLen;
      ty /= tLen;

      const rACrossT = rAx * ty - rAy * tx;
      const rBCrossT = rBx * ty - rBy * tx;
      const denomT =
        a.invMass +
        b.invMass +
        rACrossT * rACrossT * a.invInertia +
        rBCrossT * rBCrossT * b.invInertia;

      if (denomT > 1e-8) {
        let jt = -(rvx2 * tx + rvy2 * ty) / denomT;
        jt /= count;
        const mu = Math.sqrt(a.friction * b.friction);
        jt = Math.max(-j * mu, Math.min(j * mu, jt));

        const fix = jt * tx;
        const fiy = jt * ty;

        a.vx -= fix * a.invMass;
        a.vy -= fiy * a.invMass;
        a.angularVel -= (rAx * fiy - rAy * fix) * a.invInertia;

        b.vx += fix * b.invMass;
        b.vy += fiy * b.invMass;
        b.angularVel += (rBx * fiy - rBy * fix) * b.invInertia;
      }
    }
  }

  // Impact feedback: squash & stretch + bell check + particles + audio
  if (maxImpactSpeed > 45) {
    const squashAmt = Math.min(0.18, maxImpactSpeed / 1600);
    if (!a.isStatic) {
      a.squashX = 1 + squashAmt;
      a.squashY = 1 - squashAmt;
    }
    if (!b.isStatic) {
      b.squashX = 1 + squashAmt;
      b.squashY = 1 - squashAmt;
    }

    if (a.kind === 'bell' || b.kind === 'bell') {
      if (!state.bellRung) {
        state.bellRung = true;
        state.bellRingTimer = 1.0;
        spawnParticles(state, a.kind === 'bell' ? a.x : b.x, a.kind === 'bell' ? a.y - 12 : b.y - 12, '#E6C675', 10, 'spark');
        callbacks.onBellRung?.();
      }
    }

    // Extra sponge bounce pad reaction!
    if ((a.kind === 'sponge' && !b.isStatic) || (b.kind === 'sponge' && !a.isStatic)) {
      const sponge = a.kind === 'sponge' ? a : b;
      const other = a.kind === 'sponge' ? b : a;
      if (sponge.bounceAnim && sponge.bounceAnim > 0.1) {
        const imp = sponge.bounceImpulse ?? { vx: 110, vy: -320 };
        other.vx = imp.vx;
        other.vy = imp.vy;
      }
    }

    const pt = contacts[0];
    callbacks.onImpact?.(a, b, maxImpactSpeed, pt.x, pt.y);
  }
}

export function spawnParticles(
  state: PhysicsWorldState,
  x: number,
  y: number,
  color: string,
  count: number,
  kind: Particle['kind'] = 'circle'
) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = kind === 'steam' ? 12 + Math.random() * 18 : 35 + Math.random() * 85;
    state.particles.push({
      x,
      y,
      vx: kind === 'steam' ? (Math.random() - 0.5) * 14 : Math.cos(angle) * speed,
      vy: kind === 'steam' ? -18 - Math.random() * 20 : Math.sin(angle) * speed - 35,
      radius: kind === 'steam' ? 5 + Math.random() * 6 : 2.5 + Math.random() * 3.5,
      alpha: 0.85,
      life: 0,
      maxLife: kind === 'steam' ? 1.3 + Math.random() * 0.6 : 0.45 + Math.random() * 0.35,
      color,
      kind,
    });
  }
}

export function spawnRipple(state: PhysicsWorldState, x: number, y: number, color = '#7FA68A') {
  state.ripples.push({
    x,
    y,
    radius: 8,
    maxRadius: 48,
    alpha: 0.65,
    color,
  });
}

export function stepPhysicsWorld(
  state: PhysicsWorldState,
  rawDt: number,
  callbacks: StepCallbacks
) {
  const dt = Math.min(rawDt, 0.05);
  state.timeElapsed += dt;

  // Fade out removed bodies
  for (const b of state.bodies) {
    if (b.isRemoved && b.fadeOut > 0) {
      b.fadeOut = Math.max(0, b.fadeOut - dt * 5);
      if (b.fadeOut <= 0) b.active = false;
    }
    if (b.bounceAnim && b.bounceAnim > 0) {
      const decayRate = b.kind === 'sponge' ? 0.75 : 2.4;
      b.bounceAnim = Math.max(0, b.bounceAnim - dt * decayRate);
    }
    // Relax squash & stretch
    b.squashX += (1 - b.squashX) * Math.min(1, dt * 12);
    b.squashY += (1 - b.squashY) * Math.min(1, dt * 12);
    if (b.highlightPulse > 0) {
      b.highlightPulse = Math.max(0, b.highlightPulse - dt * 1.8);
    }
  }

  // Update pendulum if attached
  if (state.pendulum && !state.pendulum.released) {
    const p = state.pendulum;
    p.angle = Math.sin(state.timeElapsed * p.frequency) * p.maxAngle;
    p.angularVel =
      Math.cos(state.timeElapsed * p.frequency) * p.maxAngle * p.frequency;

    const bob = state.bodies.find((b) => b.id === p.bobBodyId);
    if (bob) {
      bob.x = p.anchorX + Math.sin(p.angle) * p.length;
      bob.y = p.anchorY + Math.cos(p.angle) * p.length;
      bob.vx = Math.cos(p.angle) * p.length * p.angularVel;
      bob.vy = -Math.sin(p.angle) * p.length * p.angularVel;
    }
  }

  // Update faucet spawner
  if (state.faucet && state.faucet.active) {
    state.faucet.timer += dt;
    if (state.faucet.timer >= state.faucet.interval) {
      state.faucet.timer = 0;
      const dropId = `drop_${state.faucet.dropsSpawned++}`;
      const drop = createCircleBody({
        id: dropId,
        kind: 'drop',
        x: state.faucet.x + (Math.random() - 0.5) * 3,
        y: state.faucet.y + 12,
        radius: 9,
        mass: 0.35,
        restitution: 0.18,
        friction: 0.04,
        linearDamping: 0.04,
        color: '#8AB4C8',
        accentColor: '#CBE0EB',
        material: 'water',
        collisionGroup: -7,
      });
      state.bodies.push(drop);
      // Limit old stray drops to keep scene clean
      const drops = state.bodies.filter((b) => b.kind === 'drop' && b.active);
      if (drops.length > 10) {
        drops[0].active = false;
      }
    }
  }

  // Update liquids wave & dynamic rise
  for (const liq of state.liquids) {
    liq.wavePhase += dt * 3.4;
    liq.waveAmplitude = Math.max(1.2, liq.waveAmplitude * (1 - dt * 1.4));
    liq.surfaceY += (liq.targetSurfaceY - liq.surfaceY) * Math.min(1, dt * 5.5);
  }

  // Update float bridge (Level 10)
  if (state.floatBridge) {
    const raft = state.bodies.find((b) => b.id === state.floatBridge!.raftId);
    const liq = state.liquids.find((l) => l.id === state.floatBridge!.liquidId);
    if (raft && liq) {
      const targetY = liq.surfaceY + state.floatBridge.baseOffset;
      raft.y += (targetY - raft.y) * Math.min(1, dt * 6);
    }
  }

  const subDt = dt / SUBSTEPS;

  for (let step = 0; step < SUBSTEPS; step++) {
    state.panImpulsesY.clear();

    // 1. Integrate forces & motor springs
    for (const b of state.bodies) {
      if (!b.active || b.isRemoved) continue;

      // Motor targetAngle (for leaves, spoons, ramps)
      if (b.targetAngle !== undefined && b.angleMotorStiffness) {
        const diff = b.targetAngle - b.angle;
        b.angularVel += diff * b.angleMotorStiffness * subDt;
        b.angularVel *= Math.exp(-8.5 * subDt);
        b.angle += b.angularVel * subDt;
        continue;
      }

      if (b.isStatic && !b.isPinnedPivot) continue;

      // Skip gravity for clipped items or held pendulum bob
      const isHeldBob =
        state.pendulum && !state.pendulum.released && b.id === state.pendulum.bobBodyId;
      if (!b.attachedToClip && !isHeldBob && !b.isPinnedPivot) {
        b.vy += GRAVITY * subDt;
      }

      // Buoyancy in liquids
      for (const liq of state.liquids) {
        if (b.x > liq.x && b.x < liq.x + liq.w && b.y < liq.y + liq.h) {
          const halfH = b.shape === 'circle' ? (b.radius ?? 10) : (b.h ?? 20) * 0.5;
          const bottom = b.y + halfH;
          const top = b.y - halfH;
          if (bottom > liq.surfaceY) {
            const sub = Math.min(1, (bottom - liq.surfaceY) / Math.max(1, halfH * 2));
            if (sub > 0.05 && b.vy > 85 && !b.goalGroup?.includes('in_water')) {
              b.goalGroup = (b.goalGroup ?? '') + 'in_water';
              liq.waveAmplitude = Math.min(8, liq.waveAmplitude + 4.5);
              spawnParticles(state, b.x, liq.surfaceY, liq.surfaceColor, 6, 'droplet');
              callbacks.onWaterEnter?.(b, liq);
            }
            const buoyancyAccel = GRAVITY * liq.density * sub;
            b.vy -= buoyancyAccel * subDt;
            // Water drag
            b.vx *= Math.exp(-3.2 * sub * subDt);
            b.vy *= Math.exp(-4.2 * sub * subDt);
            b.angularVel *= Math.exp(-4.5 * sub * subDt);
          }
        }
      }

      // Restoring angular spring on seesaws / scales
      if (b.isPinnedPivot && b.restoringSpring) {
        b.angularVel += -b.angle * b.restoringSpring * subDt;
      }

      // Damping & integration
      b.vx *= Math.exp(-b.linearDamping * subDt);
      b.vy *= Math.exp(-b.linearDamping * subDt);
      b.angularVel *= Math.exp(-b.angularDamping * subDt);

      if (!b.isPinnedPivot && !b.attachedToClip && !isHeldBob) {
        b.x += b.vx * subDt;
        b.y += b.vy * subDt;
      }
      b.angle += b.angularVel * subDt;

      if (b.angleMin !== undefined && b.angle < b.angleMin) {
        b.angle = b.angleMin;
        if (b.angularVel < 0) b.angularVel *= -0.15;
      }
      if (b.angleMax !== undefined && b.angle > b.angleMax) {
        b.angle = b.angleMax;
        if (b.angularVel > 0) b.angularVel *= -0.15;
      }
    }

    // 2. Collisions
    const len = state.bodies.length;
    for (let i = 0; i < len; i++) {
      const a = state.bodies[i];
      if (!a.active || a.isRemoved || a.sensorOnly) continue;
      for (let j = i + 1; j < len; j++) {
        const b = state.bodies[j];
        if (!b.active || b.isRemoved || b.sensorOnly) continue;
        if (a.invMass === 0 && a.invInertia === 0 && b.invMass === 0 && b.invInertia === 0) {
          continue;
        }
        if (a.collisionGroup && a.collisionGroup < 0 && a.collisionGroup === b.collisionGroup) {
          continue;
        }

        let manifold: ContactManifold | null = null;
        if (a.shape === 'circle' && b.shape === 'circle') {
          manifold = collideCircleCircle(a, b);
        } else if (a.shape === 'circle' && b.shape === 'box') {
          manifold = collideCircleBox(a, b);
        } else if (a.shape === 'box' && b.shape === 'circle') {
          const m = collideCircleBox(b, a);
          if (m) {
            manifold = {
              normal: { x: -m.normal.x, y: -m.normal.y },
              depth: m.depth,
              contacts: m.contacts,
            };
          }
        } else {
          manifold = collideBoxBox(a, b);
        }

        if (manifold) {
          resolveManifold(a, b, manifold, state, callbacks);
        }
      }
    }

    // 3. Apply Scale & Mobile linkages (smooth, tunnel-proof balance physics)
    for (const sc of state.scales) {
      const beam = state.bodies.find((b) => b.id === sc.beamId);
      const leftPan = state.bodies.find((b) => b.id === sc.leftPanId);
      const rightPan = state.bodies.find((b) => b.id === sc.rightPanId);
      if (!beam || !leftPan || !rightPan) continue;

      let leftLoad = 0;
      let rightLoad = 0;
      for (const item of state.bodies) {
        if (item.isStatic || item.attachedToClip || !item.active) continue;
        const r = item.shape === 'circle' ? (item.radius ?? 16) : (item.h ?? 20) * 0.5;
        const leftHw = (leftPan.w ?? 120) * 0.52;
        const rightHw = (rightPan.w ?? 120) * 0.52;
        if (Math.abs(item.x - leftPan.x) < leftHw && item.y > leftPan.y - 90 && item.y < leftPan.y + 20) {
          leftLoad += item.mass;
        } else if (Math.abs(item.x - rightPan.x) < rightHw && item.y > rightPan.y - 90 && item.y < rightPan.y + 20) {
          rightLoad += item.mass;
        }
        // Soft curved bowl walls so fruits settle inside pan without rolling off
        for (const pan of [leftPan, rightPan]) {
          const hw = (pan.w ?? 120) * 0.44;
          if (Math.abs(item.x - pan.x) < hw + 14 && item.y > pan.y - 85 && item.y < pan.y + 18) {
            if (item.x < pan.x - hw + r * 0.5) {
              item.x = pan.x - hw + r * 0.5;
              if (item.vx < 0) item.vx *= -0.2;
            } else if (item.x > pan.x + hw - r * 0.5) {
              item.x = pan.x + hw - r * 0.5;
              if (item.vx > 0) item.vx *= -0.2;
            }
            item.vx *= Math.exp(-4.5 * subDt);
            item.angularVel *= Math.exp(-7.0 * subDt);
            if (item.y > pan.y - 6 - r && item.vy >= -20) {
              item.y = pan.y - 6 - r;
              if (item.vy > 0) item.vy = 0;
            }
          }
        }
      }

      const targetAng = Math.max(
        beam.angleMin ?? -0.25,
        Math.min(beam.angleMax ?? 0.25, (rightLoad - leftLoad) * 0.12)
      );
      beam.angularVel += (targetAng - beam.angle) * 14 * subDt;
      beam.angularVel *= Math.exp(-6.5 * subDt);
      beam.angle += beam.angularVel * subDt;

      const lx = beam.x - Math.cos(beam.angle) * sc.armLength;
      const ly = beam.y - Math.sin(beam.angle) * sc.armLength + sc.panDrop;
      const rx = beam.x + Math.cos(beam.angle) * sc.armLength;
      const ry = beam.y + Math.sin(beam.angle) * sc.armLength + sc.panDrop;

      leftPan.vx = 0;
      leftPan.vy = 0;
      leftPan.x = lx;
      leftPan.y = ly;
      leftPan.angle = 0;

      rightPan.vx = 0;
      rightPan.vy = 0;
      rightPan.x = rx;
      rightPan.y = ry;
      rightPan.angle = 0;
    }

    const mobileLoads = new Map<string, number>();
    for (let mIdx = state.mobiles.length - 1; mIdx >= 0; mIdx--) {
      const mob = state.mobiles[mIdx];
      const bar = state.bodies.find((b) => b.id === mob.barId);
      const leftPlat = state.bodies.find((b) => b.id === mob.leftPlatformId);
      const rightPlat = state.bodies.find((b) => b.id === mob.rightPlatformId);
      if (!bar || !leftPlat || !rightPlat) continue;

      if (mob.parentBarId) {
        const parent = state.bodies.find((b) => b.id === mob.parentBarId);
        if (parent) {
          const offset = mob.attachOffsetX ?? 0;
          bar.x = parent.x + Math.cos(parent.angle) * offset;
          bar.y = parent.y + Math.sin(parent.angle) * offset + mob.dropLength;
        }
      }

      let leftLoad = 0;
      let rightLoad = 0;
      for (const item of state.bodies) {
        if (item.isStatic || item.attachedToClip || !item.active) continue;
        const r = item.shape === 'circle' ? (item.radius ?? 16) : (item.h ?? 20) * 0.5;
        if (!leftPlat.sensorOnly && Math.abs(item.x - leftPlat.x) < (leftPlat.w ?? 80) * 0.55 && item.y > leftPlat.y - 52 && item.y < leftPlat.y + 18) {
          leftLoad += item.mass;
        } else if (!rightPlat.sensorOnly && Math.abs(item.x - rightPlat.x) < (rightPlat.w ?? 80) * 0.55 && item.y > rightPlat.y - 52 && item.y < rightPlat.y + 18) {
          rightLoad += item.mass;
        }
        for (const plat of [leftPlat, rightPlat]) {
          if (plat.sensorOnly) continue;
          const hw = (plat.w ?? 80) * 0.48;
          if (Math.abs(item.x - plat.x) < hw + 8 && item.y > plat.y - r - 18 && item.y < plat.y + 12) {
            item.vx += (plat.x - item.x) * 8.0 * subDt;
            item.vx *= Math.exp(-6.0 * subDt);
            item.angularVel *= Math.exp(-8.0 * subDt);
            if (item.y > plat.y - 5 - r && item.vy >= -20) {
              item.y = plat.y - 5 - r;
              if (item.vy > 0) item.vy = 0;
            }
          }
        }
      }

      // Include child mobile load if any child hangs on right/left
      for (const child of state.mobiles) {
        if (child.parentBarId === mob.barId) {
          const childLoad = mobileLoads.get(child.barId) ?? 0;
          if ((child.attachOffsetX ?? 0) >= 0) rightLoad += childLoad;
          else leftLoad += childLoad;
        }
      }
      mobileLoads.set(mob.barId, leftLoad + rightLoad);

      const targetAng = Math.max(
        bar.angleMin ?? -0.25,
        Math.min(bar.angleMax ?? 0.25, (rightLoad - leftLoad) * 0.14)
      );
      bar.angularVel += (targetAng - bar.angle) * 18 * subDt;
      bar.angularVel *= Math.exp(-6.5 * subDt);
      bar.angle += bar.angularVel * subDt;

      const lx = bar.x - Math.cos(bar.angle) * mob.armLength;
      const ly = bar.y - Math.sin(bar.angle) * mob.armLength + mob.panDrop;
      const rx = bar.x + Math.cos(bar.angle) * mob.armLength;
      const ry = bar.y + Math.sin(bar.angle) * mob.armLength + mob.panDrop;

      leftPlat.vx = 0;
      leftPlat.vy = 0;
      leftPlat.x = lx;
      leftPlat.y = ly;
      leftPlat.angle = 0;

      rightPlat.vx = 0;
      rightPlat.vy = 0;
      rightPlat.x = rx;
      rightPlat.y = ry;
      rightPlat.angle = 0;
    }
  }

  // Update dynamic liquid rise from submerged objects
  for (const liq of state.liquids) {
    if (!liq.risePerUnitArea) continue;
    let submergedCount = 0;
    for (const b of state.bodies) {
      if (!b.active || b.isStatic || b.kind === 'drop' || b.kind === 'float_raft') continue;
      if (b.x > liq.x && b.x < liq.x + liq.w && b.y > liq.surfaceY - 12 && b.y < liq.y + liq.h) {
        submergedCount += b.mass;
      }
    }
    liq.targetSurfaceY = Math.max(
      liq.y + 18,
      liq.baseSurfaceY - submergedCount * liq.risePerUnitArea
    );
  }

  // Faucet drops vs pot collection check
  if (state.faucet) {
    const pot = state.bodies.find((b) => b.kind === 'pot');
    if (pot) {
      for (const b of state.bodies) {
        if (b.kind === 'drop' && b.active && !b.isRemoved) {
          if (
            Math.abs(b.x - pot.x) < (pot.w ?? 80) * 0.36 &&
            b.y > pot.y - 34 &&
            b.y < pot.y + 12
          ) {
            b.isRemoved = true;
            b.active = false;
            state.faucet.dropsCollected++;
            pot.squashX = 1.07;
            pot.squashY = 0.93;
            spawnParticles(state, b.x, pot.y - 24, '#8AB4C8', 6, 'droplet');
            callbacks.onDropCollected?.();
          } else if (b.y > WORLD_H + 30) {
            b.active = false;
          }
        }
      }
    }
  }

  // Update particles & ripples
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.life += dt;
    if (p.life >= p.maxLife) {
      state.particles.splice(i, 1);
      continue;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.kind !== 'steam') {
      p.vy += 180 * dt;
    }
    p.alpha = 1 - p.life / p.maxLife;
  }

  for (let i = state.ripples.length - 1; i >= 0; i--) {
    const r = state.ripples[i];
    r.radius += (r.maxRadius - r.radius) * Math.min(1, dt * 7);
    r.alpha -= dt * 1.4;
    if (r.alpha <= 0.02) {
      state.ripples.splice(i, 1);
    }
  }

  // Compute total kinetic energy (0..1) for adaptive soundtrack
  let totalKE = 0;
  for (const b of state.bodies) {
    if (!b.active || b.isStatic || b.isRemoved) continue;
    const speedSq = b.vx * b.vx + b.vy * b.vy;
    totalKE += speedSq * 0.000018 + Math.abs(b.angularVel) * 0.04;
  }
  state.kineticEnergy = Math.min(1, totalKE * 0.5);
}

export function findTappableAt(
  state: PhysicsWorldState,
  wx: number,
  wy: number,
  minTouchRadius = 26
): PhysicsBody | null {
  let best: PhysicsBody | null = null;
  let bestDist = Infinity;

  for (const b of state.bodies) {
    if (!b.active || b.isRemoved) continue;

    // Resolve tappable target: either the body itself or its owning clip / pendulum release
    let targetBody: PhysicsBody | null = b.tapAction ? b : null;
    if (!targetBody && b.attachedToClip) {
      targetBody =
        state.bodies.find(
          (c) => c.tapAction === 'drop_item' && c.launchTargetId === b.id && c.active && !c.isRemoved
        ) ?? null;
    }
    if (!targetBody && state.pendulum && !state.pendulum.released && b.id === state.pendulum.bobBodyId) {
      targetBody =
        state.bodies.find((c) => c.tapAction === 'release_pendulum' && c.active && !c.isRemoved) ?? null;
    }

    if (!targetBody) continue;
    if (targetBody.maxTaps !== undefined && targetBody.tappedCount >= targetBody.maxTaps) continue;

    // Generous touch hitbox (>= 48px CSS equivalent on mobile)
    if (b.shape === 'circle') {
      const hitR = Math.max(minTouchRadius, (b.radius ?? 16) + 16 + (b.tapRadiusBonus ?? 0));
      const d = Math.hypot(wx - b.x, wy - b.y);
      if (d <= hitR && d < bestDist) {
        best = targetBody;
        bestDist = d;
      }
    } else {
      const hw = Math.max(minTouchRadius, (b.w ?? 30) * 0.5 + 16 + (b.tapRadiusBonus ?? 0));
      const hh = Math.max(minTouchRadius, (b.h ?? 30) * 0.5 + 16 + (b.tapRadiusBonus ?? 0));
      const c = Math.cos(-b.angle);
      const s = Math.sin(-b.angle);
      const dx = wx - b.x;
      const dy = wy - b.y;
      const lx = dx * c - dy * s;
      const ly = dx * s + dy * c;
      if (Math.abs(lx) <= hw && Math.abs(ly) <= hh) {
        const d = Math.hypot(dx, dy);
        if (d < bestDist) {
          best = targetBody;
          bestDist = d;
        }
      }
    }
  }

  return best;
}

export function triggerBodyTap(
  state: PhysicsWorldState,
  body: PhysicsBody
): { soundKind: 'tap' | 'spring' | 'water' } {
  body.tappedCount++;
  body.highlightPulse = 1;
  spawnRipple(state, body.x, body.y, body.accentColor ?? '#7FA68A');

  switch (body.tapAction) {
    case 'remove': {
      body.isRemoved = true;
      spawnParticles(state, body.x, body.y, body.color, 6, 'circle');
      return { soundKind: 'tap' };
    }
    case 'tilt_toggle': {
      if (body.angleOptions && body.angleOptions.length > 0) {
        const idx = body.tappedCount % body.angleOptions.length;
        body.targetAngle = body.angleOptions[idx];
      }
      body.squashX = 1.06;
      body.squashY = 0.94;
      return { soundKind: 'tap' };
    }
    case 'launch_toast': {
      const target = state.bodies.find((b) => b.id === body.launchTargetId);
      if (target) {
        const imp = body.launchImpulse ?? { vx: 215, vy: -465 };
        target.vx = imp.vx;
        target.vy = imp.vy;
        target.angularVel = 1.4;
        target.squashX = 0.85;
        target.squashY = 1.18;
        spawnParticles(state, target.x, target.y + 10, '#E6C675', 7, 'circle');
      }
      body.bounceAnim = 1;
      body.squashX = 1.1;
      body.squashY = 0.88;
      return { soundKind: 'spring' };
    }
    case 'bounce_pad': {
      body.bounceAnim = 1;
      body.squashX = 1.22;
      body.squashY = 0.78;
      // Find any nearby dynamic body above/touching the sponge and launch it smoothly
      const imp = body.bounceImpulse ?? { vx: 115, vy: -320 };
      for (const other of state.bodies) {
        if (!other.active || other.isStatic || other.id === body.id) continue;
        const d = Math.hypot(other.x - body.x, other.y - body.y);
        if (d < 78) {
          other.vx = imp.vx;
          other.vy = imp.vy;
          other.squashX = 1.18;
          other.squashY = 0.84;
          spawnParticles(state, body.x, body.y - 10, '#E6C675', 6, 'circle');
        }
      }
      return { soundKind: 'spring' };
    }
    case 'drop_item': {
      body.isRemoved = true;
      const target = state.bodies.find((b) => b.id === body.launchTargetId);
      if (target) {
        target.attachedToClip = false;
        target.vy = 18;
      }
      spawnParticles(state, body.x, body.y, '#DDA089', 5, 'circle');
      return { soundKind: 'tap' };
    }
    case 'push_book': {
      const target = state.bodies.find((b) => b.id === body.launchTargetId) ?? body;
      const imp = body.pushImpulse ?? { vx: 95, vy: -12, angVel: 2.1 };
      target.vx += imp.vx;
      target.vy += imp.vy;
      target.angularVel += imp.angVel ?? 2.0;
      return { soundKind: 'tap' };
    }
    case 'release_pendulum': {
      if (state.pendulum && !state.pendulum.released) {
        state.pendulum.released = true;
        body.isRemoved = true;
        spawnParticles(state, body.x, body.y, '#8AB4C8', 6, 'circle');
      }
      return { soundKind: 'tap' };
    }
  }
  return { soundKind: 'tap' };
}
