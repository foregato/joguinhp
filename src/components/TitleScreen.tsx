import { useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface TitleScreenProps {
  hasProgress: boolean;
  isMuted: boolean;
  onStart: () => void;
  onOpenGrid: () => void;
  onToggleMute: () => void;
}

export function TitleScreen({
  hasProgress,
  isMuted,
  onStart,
  onOpenGrid,
  onToggleMute,
}: TitleScreenProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onStart();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onStart]);

  return (
    <div className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-between p-6 sm:p-10">
      {/* Top right minimal audio toggle */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onToggleMute}
          className="pointer-events-auto inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[#2b3230]/10 bg-[#fcfbf8]/90 px-3.5 text-[#2b3230] transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5e8569]"
          aria-label={isMuted ? 'Ativar som' : 'Silenciar som'}
          title={isMuted ? 'Ativar som (M)' : 'Silenciar som (M)'}
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      </div>

      {/* Center bespoke SVG title lockup over calm negative space */}
      <div className="mx-auto flex max-w-lg flex-col items-center text-center">
        <div className="mb-5">
          <svg
            viewBox="0 0 320 110"
            className="h-24 w-auto sm:h-28"
            role="img"
            aria-label="Toque Calmo"
          >
            {/* Calm ripple motif behind emblem */}
            <circle cx="160" cy="24" r="16" fill="#7FA68A" fillOpacity="0.16" />
            <circle cx="160" cy="24" r="9" fill="#7FA68A" fillOpacity="0.32" />
            <circle cx="160" cy="24" r="4" fill="#5E8569" />

            <text
              x="160"
              y="76"
              textAnchor="middle"
              fill="#2B3230"
              fontFamily="Outfit, sans-serif"
              fontWeight="600"
              fontSize="44"
              letterSpacing="-0.02em"
            >
              Toque Calmo
            </text>
            <line
              x1="108"
              y1="94"
              x2="212"
              y2="94"
              stroke="#DDA089"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <p className="mb-8 max-w-md text-base leading-relaxed text-[#68706d] sm:text-lg">
          Puzzles minimalistas com objetos do cotidiano. Um toque suave para colocar tudo em movimento.
        </p>

        <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onStart}
            className="min-h-[48px] min-w-[164px] whitespace-nowrap rounded-xl bg-[#5e8569] px-8 py-3 font-display text-base font-medium text-[#fcfbf8] transition-transform duration-150 hover:scale-[1.02] hover:bg-[#52775c] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5e8569]"
          >
            {hasProgress ? 'Continuar' : 'Jogar'}
          </button>

          <button
            type="button"
            onClick={onOpenGrid}
            className="min-h-[48px] whitespace-nowrap rounded-xl border border-[#2b3230]/12 bg-[#fcfbf8]/95 px-6 py-3 font-display text-base font-medium text-[#2b3230] transition-transform duration-150 hover:scale-[1.02] hover:bg-[#eae6dd]/60 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5e8569]"
          >
            Fases (01–12)
          </button>
        </div>
      </div>

      {/* Single flat control-hint line */}
      <div className="text-center text-xs tracking-wide text-[#68706d] sm:text-sm">
        Toque ou clique nos objetos · R Reiniciar · H Dica · M Som
      </div>
    </div>
  );
}
