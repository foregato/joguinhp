import { LayoutGrid, Lightbulb, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { HintStep, LevelDefinition } from '../game/types';

interface GameHUDProps {
  level: LevelDefinition;
  tapCount: number;
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
  hintTier,
  activeHint,
  isMuted,
  onOpenGrid,
  onPause,
  onRestart,
  onRequestHint,
  onToggleMute,
}: GameHUDProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-between p-4 sm:p-6">
      {/* Perimeter Top Cluster (unobstructed playfield >= 85%) */}
      <div className="flex items-start justify-between gap-3">
        {/* Top-left: Navigation + Level identity */}
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onOpenGrid}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[#2b3230]/10 bg-[#fcfbf8]/90 px-3 text-[#2b3230] transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5e8569]"
            aria-label="Fases"
            title="Grade de Fases"
          >
            <LayoutGrid className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          <div className="px-1">
            <div className="flex items-center gap-2 text-sm font-medium text-[#2b3230] sm:text-base">
              <span className="font-display font-semibold tabular-nums text-[#5e8569]">
                {level.numberLabel}
              </span>
              <span aria-hidden="true" className="text-[#68706d]">·</span>
              <span className="font-display font-medium">{level.title}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#68706d] tabular-nums">
              <span className="hidden sm:inline">{level.subtitle}</span>
              <span className="hidden sm:inline" aria-hidden="true">·</span>
              <span>
                Toques: {tapCount}
              </span>
            </div>
          </div>
        </div>

        {/* Top-right: Restart, Hint, Mute, Pause */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onRequestHint}
            className={`inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-xl border px-3.5 text-xs font-medium transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5e8569] sm:text-sm ${
              hintTier > 0
                ? 'border-[#5e8569]/40 bg-[#7fa68a]/18 text-[#2b3230]'
                : 'border-[#2b3230]/10 bg-[#fcfbf8]/90 text-[#2b3230]'
            }`}
            aria-label="Dica"
            title="Dica (H)"
          >
            <Lightbulb className="h-4 w-4 text-[#5e8569]" />
            <span>{hintTier === 0 ? 'Dica' : hintTier === 1 ? 'Mais dica' : 'Dica ativa'}</span>
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[#2b3230]/10 bg-[#fcfbf8]/90 px-3 text-[#2b3230] transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5e8569]"
            aria-label="Reiniciar fase"
            title="Reiniciar (R)"
          >
            <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[#2b3230]/10 bg-[#fcfbf8]/90 px-3 text-[#2b3230] transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5e8569]"
            aria-label={isMuted ? 'Ativar som' : 'Silenciar som'}
            title={isMuted ? 'Ativar som (M)' : 'Silenciar som (M)'}
          >
            {isMuted ? <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" /> : <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />}
          </button>

          <button
            type="button"
            onClick={onPause}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[#2b3230]/10 bg-[#fcfbf8]/90 px-3 text-[#2b3230] transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5e8569]"
            aria-label="Pausar"
            title="Pausar (Esc)"
          >
            <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </div>

      {/* Bottom quiet hint caption (only when player asked for a hint) */}
      <div className="flex justify-center">
        {hintTier > 0 && activeHint && (
          <div className="rounded-xl border border-[#5e8569]/25 bg-[#fcfbf8]/95 px-4 py-2 text-center text-xs font-medium text-[#2b3230] sm:text-sm">
            {activeHint.label}
          </div>
        )}
      </div>
    </div>
  );
}
