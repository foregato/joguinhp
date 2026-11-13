import { useEffect, useRef } from 'react';
import { audioEngine } from '../game/audio';
import { createTitleDiorama, createWorldFromLevel, evaluateLevelGoal } from '../game/levels';
import {
  findTappableAt,
  PhysicsWorldState,
  stepPhysicsWorld,
  triggerBodyTap,
  WORLD_H,
  WORLD_W,
} from '../game/physics';
import { renderPhysicsWorld } from '../game/renderer';
import { HintStep, LevelDefinition } from '../game/types';

interface GameCanvasProps {
  mode: 'diorama' | 'play';
  level: LevelDefinition | null;
  resetToken: number;
  paused: boolean;
  hintTier: number;
  activeHint: HintStep | null;
  onTapPerformed: (totalTaps: number) => void;
  onLevelSolved: (tapsUsed: number) => void;
}

export function GameCanvas({
  mode,
  level,
  resetToken,
  paused,
  hintTier,
  activeHint,
  onTapPerformed,
  onLevelSolved,
}: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const worldRef = useRef<PhysicsWorldState>(
    mode === 'play' && level ? createWorldFromLevel(level) : createTitleDiorama()
  );
  const hoveredIdRef = useRef<string | null>(null);
  const solvedFiredRef = useRef(false);
  const tapCountRef = useRef(0);
  const goalProgressRef = useRef(0);

  // Sync props to refs so RAF loop never restarts unnecessarily
  const modeRef = useRef(mode);
  const levelRef = useRef(level);
  const pausedRef = useRef(paused);
  const hintTierRef = useRef(hintTier);
  const activeHintRef = useRef(activeHint);
  const onTapRef = useRef(onTapPerformed);
  const onSolvedRef = useRef(onLevelSolved);

  modeRef.current = mode;
  levelRef.current = level;
  pausedRef.current = paused;
  hintTierRef.current = hintTier;
  activeHintRef.current = activeHint;
  onTapRef.current = onTapPerformed;
  onSolvedRef.current = onLevelSolved;

  // Rebuild world when level or resetToken changes
  useEffect(() => {
    solvedFiredRef.current = false;
    tapCountRef.current = 0;
    goalProgressRef.current = 0;
    if (mode === 'play' && level) {
      worldRef.current = createWorldFromLevel(level);
      audioEngine.setComplexity(level.id);
    } else {
      worldRef.current = createTitleDiorama();
      audioEngine.setComplexity(1);
    }
  }, [mode, level, resetToken]);

  // Isolated 60fps simulation & render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let logicalW = container.clientWidth;
    let logicalH = container.clientHeight;

    const updateSize = () => {
      if (!container || !canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      logicalW = container.clientWidth;
      logicalH = container.clientHeight;
      canvas.width = Math.max(1, Math.floor(logicalW * dpr));
      canvas.height = Math.max(1, Math.floor(logicalH * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(container);

    let rafId = 0;
    let lastTime = performance.now();

    const frame = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;

      if (!pausedRef.current) {
        const dt = Math.min(rawDt, 0.05);
        const world = worldRef.current;

        stepPhysicsWorld(world, dt, {
          onImpact: (a, b, speed) => {
            const mat = a.material === 'bell' || b.material === 'bell'
              ? 'bell'
              : !a.isStatic
              ? a.material
              : b.material;
            audioEngine.playImpact(mat, speed);
          },
          onWaterEnter: () => {
            audioEngine.playImpact('water', 160);
          },
          onBellRung: () => {
            audioEngine.playBellChime();
          },
          onDropCollected: () => {
            audioEngine.playImpact('water', 140);
          },
        });

        audioEngine.updateEnergy(world.kineticEnergy);

        if (modeRef.current === 'play' && levelRef.current && !solvedFiredRef.current) {
          const { progress, solved } = evaluateLevelGoal(world, levelRef.current, dt);
          goalProgressRef.current = progress;
          if (solved) {
            solvedFiredRef.current = true;
            audioEngine.playLevelSolved();
            onSolvedRef.current(tapCountRef.current);
          }
        }
      }

      renderPhysicsWorld(
        ctx,
        logicalW,
        logicalH,
        worldRef.current,
        modeRef.current === 'play' ? levelRef.current : null,
        goalProgressRef.current,
        hoveredIdRef.current,
        activeHintRef.current,
        hintTierRef.current
      );

      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  const mapClientToWorld = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(rect.width / WORLD_W, rect.height / WORLD_H);
    const offsetX = (rect.width - WORLD_W * scale) * 0.5;
    const offsetY = (rect.height - WORLD_H * scale) * 0.5;
    return {
      x: (clientX - rect.left - offsetX) / scale,
      y: (clientY - rect.top - offsetY) / scale,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (mode !== 'play' || paused) {
      hoveredIdRef.current = null;
      return;
    }
    const pt = mapClientToWorld(e.clientX, e.clientY);
    const body = findTappableAt(worldRef.current, pt.x, pt.y);
    hoveredIdRef.current = body ? body.id : null;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    audioEngine.unlock();
    if (mode !== 'play' || paused || solvedFiredRef.current) return;

    const pt = mapClientToWorld(e.clientX, e.clientY);
    const body = findTappableAt(worldRef.current, pt.x, pt.y);
    if (body) {
      const result = triggerBodyTap(worldRef.current, body);
      tapCountRef.current += 1;
      if (result.soundKind === 'spring') {
        audioEngine.playImpact('spring', 200);
      } else {
        audioEngine.playTap(tapCountRef.current);
      }
      onTapRef.current(tapCountRef.current);
    }
  };

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      <canvas
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        className="block h-full w-full touch-none cursor-pointer"
        aria-label={level ? `Fase ${level.numberLabel}: ${level.title}` : 'Cenário interativo Toque Calmo'}
      />
    </div>
  );
}
