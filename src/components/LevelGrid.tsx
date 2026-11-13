import { ArrowLeft, Check, Lock, Volume2, VolumeX } from 'lucide-react';
import { LEVELS } from '../game/levels';
import { PlayerProgress } from '../game/types';
import { ObjectIcon } from './ObjectIcon';

interface LevelGridProps {
  progress: PlayerProgress;
  onSelectLevel: (levelId: number) => void;
  onBackToTitle: () => void;
  onToggleMute: () => void;
}

export function LevelGrid({
  progress,
  onSelectLevel,
  onBackToTitle,
  onToggleMute,
}: LevelGridProps) {
  const completedCount = progress.completedLevels.length;

  return (
    <div className="paper-backdrop flex h-full w-full flex-col overflow-y-auto px-6 py-6 sm:px-10 sm:py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col">
        {/* Clean minimal top bar */}
        <header className="mb-8 flex items-center justify-between gap-4 border-b border-[#2b3230]/10 pb-5">
          <button
            type="button"
            onClick={onBackToTitle}
            className="inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium text-[#2b3230] transition-colors hover:bg-[#eae6dd]/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5e8569]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Início</span>
          </button>

          <div className="text-center">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-[#2b3230] sm:text-3xl">
              Fases do Cotidiano
            </h1>
            <p className="mt-0.5 text-xs text-[#68706d] tabular-nums sm:text-sm">
              {completedCount} de {LEVELS.length} concluídas
            </p>
          </div>

          <button
            type="button"
            onClick={onToggleMute}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[#2b3230]/10 bg-[#fcfbf8] px-3 text-[#2b3230] transition-colors hover:bg-[#eae6dd]/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5e8569]"
            aria-label={progress.isMuted ? 'Ativar som' : 'Silenciar som'}
            title={progress.isMuted ? 'Ativar som (M)' : 'Silenciar som (M)'}
          >
            {progress.isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        </header>

        {/* Direct numbered 12-level grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {LEVELS.map((lvl) => {
            const isCompleted = progress.completedLevels.includes(lvl.id);
            const isUnlocked = lvl.id <= progress.unlockedLevel || isCompleted;
            const best = progress.bestTaps[lvl.id];

            return (
              <button
                key={lvl.id}
                type="button"
                disabled={!isUnlocked}
                onClick={() => onSelectLevel(lvl.id)}
                className={`group flex min-h-[126px] flex-col justify-between rounded-2xl border p-5 text-left transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5e8569] ${
                  isUnlocked
                    ? 'cursor-pointer border-[#2b3230]/10 bg-[#fcfbf8] hover:-translate-y-0.5 hover:border-[#7fa68a]/60 active:translate-y-0'
                    : 'cursor-not-allowed border-[#2b3230]/6 bg-[#eae6dd]/45 opacity-65'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#68706d] tabular-nums">
                    <span className="font-display text-base font-semibold text-[#2b3230]">
                      {lvl.numberLabel}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {isCompleted ? 'Concluída' : isUnlocked ? 'Disponível' : 'Bloqueada'}
                    </span>
                  </div>

                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                      isCompleted
                        ? 'bg-[#7fa68a]/18 text-[#5e8569]'
                        : isUnlocked
                        ? 'bg-[#eae6dd]/60 text-[#2b3230]'
                        : 'text-[#68706d]'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : !isUnlocked ? (
                      <Lock className="h-3.5 w-3.5" />
                    ) : (
                      <ObjectIcon kind={lvl.objectIcon} className="h-6 w-6" />
                    )}
                  </span>
                </div>

                <div className="mt-4 flex items-end justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-medium leading-snug text-[#2b3230]">
                      {lvl.title}
                    </h2>
                    {best !== undefined ? (
                      <p className="mt-1 text-xs text-[#68706d] tabular-nums">
                        Melhor: {best} {best === 1 ? 'toque' : 'toques'}
                      </p>
                    ) : (
                      <p className="mt-1 line-clamp-1 text-xs text-[#68706d]">{lvl.subtitle}</p>
                    )}
                  </div>

                  {isCompleted && (
                    <ObjectIcon kind={lvl.objectIcon} className="h-7 w-7 shrink-0 opacity-85" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
