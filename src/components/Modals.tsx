import { ArrowRight, CheckCircle2, LayoutGrid, Play, RotateCcw } from 'lucide-react';
import { LevelDefinition } from '../game/types';

interface PauseModalProps {
  level: LevelDefinition;
  onResume: () => void;
  onRestart: () => void;
  onOpenGrid: () => void;
}

export function PauseModal({ level, onResume, onRestart, onOpenGrid }: PauseModalProps) {
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-[#2b3230]/20 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-[#2b3230]/10 bg-[#fcfbf8] p-7 text-center">
        <p className="text-xs font-medium text-[#68706d] tabular-nums">
          Fase {level.numberLabel} · {level.title}
        </p>
        <h2 className="mt-1 font-display text-2xl font-semibold text-[#2b3230]">Pausa</h2>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onResume}
            className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#5e8569] px-5 py-2.5 font-display text-base font-medium text-[#fcfbf8] transition-colors hover:bg-[#52775c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5e8569]"
          >
            <Play className="h-4 w-4" />
            <span>Continuar</span>
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-[#2b3230]/12 bg-[#fcfbf8] px-5 py-2.5 font-display text-base font-medium text-[#2b3230] transition-colors hover:bg-[#eae6dd]/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5e8569]"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reiniciar Fase</span>
          </button>

          <button
            type="button"
            onClick={onOpenGrid}
            className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl px-5 py-2.5 font-display text-sm font-medium text-[#68706d] transition-colors hover:bg-[#eae6dd]/50 hover:text-[#2b3230] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5e8569]"
          >
            <LayoutGrid className="h-4 w-4" />
            <span>Escolher Fase</span>
          </button>
        </div>
      </div>
    </div>
  );
}

interface LevelCompleteModalProps {
  level: LevelDefinition;
  tapsUsed: number;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onReplay: () => void;
  onOpenGrid: () => void;
}

export function LevelCompleteModal({
  level,
  tapsUsed,
  hasNextLevel,
  onNextLevel,
  onReplay,
  onOpenGrid,
}: LevelCompleteModalProps) {
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-[#2b3230]/18 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-[#2b3230]/10 bg-[#fcfbf8] p-7 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#7fa68a]/18 text-[#5e8569]">
          <CheckCircle2 className="h-6 w-6" />
        </div>

        <p className="text-xs font-medium text-[#68706d] tabular-nums">
          Fase {level.numberLabel} · {level.title}
        </p>
        <h2 className="mt-1 font-display text-2xl font-semibold text-[#2b3230]">
          {hasNextLevel ? 'Tudo no lugar' : 'Mesa completa!'}
        </h2>
        <p className="mt-2 text-sm text-[#68706d] tabular-nums">
          Resolvido com {tapsUsed} {tapsUsed === 1 ? 'toque' : 'toques'}
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          {hasNextLevel ? (
            <button
              type="button"
              onClick={onNextLevel}
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#5e8569] px-5 py-3 font-display text-base font-medium text-[#fcfbf8] transition-colors hover:bg-[#52775c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5e8569]"
            >
              <span>Próxima Fase</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenGrid}
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#5e8569] px-5 py-3 font-display text-base font-medium text-[#fcfbf8] transition-colors hover:bg-[#52775c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5e8569]"
            >
              <LayoutGrid className="h-4 w-4" />
              <span>Ver Todas as Fases</span>
            </button>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onReplay}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-[#2b3230]/12 bg-[#fcfbf8] px-4 py-2 font-display text-sm font-medium text-[#2b3230] transition-colors hover:bg-[#eae6dd]/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5e8569]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Repetir</span>
            </button>
            <button
              type="button"
              onClick={onOpenGrid}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-[#2b3230]/12 bg-[#fcfbf8] px-4 py-2 font-display text-sm font-medium text-[#2b3230] transition-colors hover:bg-[#eae6dd]/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5e8569]"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Fases</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CampaignCompleteModalProps {
  totalTaps: number;
  onPlayAgain: () => void;
  onOpenGrid: () => void;
}

export function CampaignCompleteModal({
  totalTaps,
  onPlayAgain,
  onOpenGrid,
}: CampaignCompleteModalProps) {
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-[#2b3230]/18 p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#2b3230]/10 bg-[#fcfbf8] p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#e6c675]/25 text-[#5e8569]">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <p className="text-xs font-medium text-[#68706d]">12 de 12 Fases Concluídas</p>
        <h2 className="mt-1 font-display text-3xl font-semibold text-[#2b3230]">
          Jornada Concluída
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[#68706d]">
          Você resolveu todos os puzzles do cotidiano com calma e precisão.
        </p>
        <p className="mt-2 text-xs text-[#68706d] tabular-nums">
          Total acumulado nos melhores resultados: {totalTaps} toques
        </p>

        <div className="mt-7 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onPlayAgain}
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#5e8569] px-5 py-3 font-display text-base font-medium text-[#fcfbf8] transition-colors hover:bg-[#52775c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5e8569]"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Jogar Novamente</span>
          </button>
          <button
            type="button"
            onClick={onOpenGrid}
            className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-[#2b3230]/12 bg-[#fcfbf8] px-5 py-2.5 font-display text-sm font-medium text-[#2b3230] transition-colors hover:bg-[#eae6dd]/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5e8569]"
          >
            <LayoutGrid className="h-4 w-4" />
            <span>Explorar Fases</span>
          </button>
        </div>
      </div>
    </div>
  );
}
