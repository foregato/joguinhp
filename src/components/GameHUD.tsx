import { LayoutGrid, Lightbulb, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { HintStep, LevelDefinition } from '../game/types';

interface GameHUDProps {
  level: LevelDefinition;
  tapCount: number;
  outOfTapsStuck: boolean;
  hintTier: number;
  activeHint: HintStep | null;
  isMuted: boolean;
  onOpenGrid: () => void;
  onPause: () => void;
  onRestart: () => void;
  onRequestHint: () => void;
  onToggleMute: () => void;
}

export function GameHUD({
  level,
  tapCount,
  outOfTapsStuck,
  hintTier,
  activeHint,
  isMuted,
  onOpenGrid,
  onPause,
  onRestart,
  onRequestHint,
  onToggleMute,
}: GameHUDProps) {
  const remaining = Math.max(0, level.tapLimit - tapCount);
  const atLimit = remaining === 0;

  return (
    <div className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-between px-3 py-3 sm:p-6">
      {/* Perimeter Top Cluster */}
      <div className="flex items-center justify-between gap-2">
        {/* Top-left: Navigation + Level identity */}
        <div className="pointer-events-auto flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onOpenGrid}
            className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-[#2b3230]/10 bg-[#fcfbf8]/92 text-[#2b3230] transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5e8569]"
            aria-label="Fases"
            title="Grade de Fases"
          >
            <LayoutGrid className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 truncate text-sm font-medium text-[#2b3230] sm:gap-2 sm:text-base">
              <span className="font-display font-semibold tabular-nums text-[#5e8569]">
                {level.numberLabel}
              </span>
              <span aria-hidden="true" className="text-[#68706d]">·</span>
              <span className="truncate font-display font-medium">{level.title}</span>
            </div>
            <p className="hidden text-xs text-[#68706d] sm:block">{level.subtitle}</p>
          </div>
        </div>

        {/* Top-right: Hint, Restart, Mute, Pause */}
        <div className="pointer-events-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onRequestHint}
            className={`inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-xl border px-3 text-xs font-medium transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5e8569] sm:px-3.5 sm:text-sm ${
              hintTier > 0
                ? 'border-[#5e8569]/40 bg-[#7fa68a]/18 text-[#2b3230]'
                : 'border-[#2b3230]/10 bg-[#fcfbf8]/92 text-[#2b3230]'
            }`}
            aria-label="Dica"
            title="Dica (H)"
          >
            <Lightbulb className="h-4 w-4 text-[#5e8569]" />
            <span className="hidden xs:inline sm:inline">
              {hintTier === 0 ? 'Dica' : hintTier === 1 ? 'Mais dica' : 'Dica'}
            </span>
          </button>

          <button
            type="button"
            onClick={onRestart}
            className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border text-[#2b3230] transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5e8569] ${
              outOfTapsStuck
                ? 'border-[#dda089] bg-[#dda089]/25'
                : 'border-[#2b3230]/10 bg-[#fcfbf8]/92'
            }`}
            aria-label="Reiniciar fase"
            title="Reiniciar (R)"
          >
            <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[#2b3230]/10 bg-[#fcfbf8]/92 text-[#2b3230] transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5e8569]"
            aria-label={isMuted ? 'Ativar som' : 'Silenciar som'}
            title={isMuted ? 'Ativar som (M)' : 'Silenciar som (M)'}
          >
            {isMuted ? <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" /> : <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />}
          </button>

          <button
            type="button"
            onClick={onPause}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[#2b3230]/10 bg-[#fcfbf8]/92 text-[#2b3230] transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5e8569]"
            aria-label="Pausar"
            title="Pausar (Esc)"
          >
            <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </div>

      {/* Bottom mobile-first cluster: Hint / Out-of-taps prompt + Objective + Tap Budget */}
      <div className="flex flex-col items-center gap-2">
        {outOfTapsStuck ? (
          <div className="pointer-events-auto flex items-center gap-3 rounded-xl border border-[#dda089]/70 bg-[#fcfbf8]/96 px-4 py-2 text-xs font-medium text-[#2b3230] sm:text-sm">
            <span>Limite de toques atingido</span>
            <button
              type="button"
              onClick={onRestart}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-[#5e8569] px-3 py-1 font-display text-xs font-medium text-[#fcfbf8] active:scale-[0.97]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reiniciar</span>
            </button>
          </div>
        ) : hintTier > 0 && activeHint ? (
          <div className="rounded-xl border border-[#5e8569]/30 bg-[#fcfbf8]/96 px-4 py-2 text-center text-xs font-medium text-[#2b3230] sm:text-sm">
            {activeHint.label}
          </div>
        ) : null}

        <div className="flex w-full items-center justify-between gap-3 rounded-xl border border-[#2b3230]/8 bg-[#fcfbf8]/88 px-3.5 py-2 sm:w-auto sm:justify-center sm:gap-5">
          <span className="truncate text-xs text-[#68706d] sm:hidden">{level.subtitle}</span>
          <div className="flex shrink-0 items-center gap-2 text-xs font-medium tabular-nums sm:text-sm">
            <span className="text-[#68706d]">Toques</span>
            <span
              className={`font-display font-semibold ${
                atLimit ? 'text-[#b5674c]' : remaining === 1 ? 'text-[#a37d2c]' : 'text-[#2b3230]'
              }`}
            >
              {tapCount}/{level.tapLimit}
            </span>
            <span className="flex items-center gap-1" aria-hidden="true">
              {Array.from({ length: level.tapLimit }).map((_, idx) => (
                <span
                  key={idx}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    idx < remaining ? 'bg-[#7fa68a]' : 'bg-[#2b3230]/15'
                  }`}
                />
              ))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
