import { useCallback, useEffect, useMemo, useState } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { GameHUD } from './components/GameHUD';
import { LevelGrid } from './components/LevelGrid';
import {
  CampaignCompleteModal,
  LevelCompleteModal,
  PauseModal,
} from './components/Modals';
import { TitleScreen } from './components/TitleScreen';
import { audioEngine } from './game/audio';
import { LEVELS } from './game/levels';
import { GameState, PlayerProgress } from './game/types';

const STORAGE_KEY = 'toque-calmo-progress-v1';

const DEFAULT_PROGRESS: PlayerProgress = {
  unlockedLevel: 1,
  completedLevels: [],
  bestTaps: {},
  isMuted: false,
};

function loadProgress(): PlayerProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<PlayerProgress>;
    return {
      unlockedLevel:
        typeof parsed.unlockedLevel === 'number'
          ? Math.max(1, Math.min(LEVELS.length, parsed.unlockedLevel))
          : 1,
      completedLevels: Array.isArray(parsed.completedLevels) ? parsed.completedLevels : [],
      bestTaps: parsed.bestTaps && typeof parsed.bestTaps === 'object' ? parsed.bestTaps : {},
      isMuted: Boolean(parsed.isMuted),
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export default function App() {
  const [progress, setProgress] = useState<PlayerProgress>(loadProgress);
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [currentLevelId, setCurrentLevelId] = useState<number>(() => {
    const p = loadProgress();
    return Math.min(p.unlockedLevel, LEVELS.length);
  });
  const [resetToken, setResetToken] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const [outOfTapsStuck, setOutOfTapsStuck] = useState(false);
  const [hintTier, setHintTier] = useState(0);
  const [hintIndex, setHintIndex] = useState(0);
  const [solvedTaps, setSolvedTaps] = useState(0);

  const currentLevel = useMemo(
    () => LEVELS.find((l) => l.id === currentLevelId) ?? LEVELS[0],
    [currentLevelId]
  );

  // Persist progress & sync audio mute state
  useEffect(() => {
    audioEngine.setMuted(progress.isMuted);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore storage quota errors
    }
  }, [progress]);

  const handleToggleMute = useCallback(() => {
    audioEngine.unlock();
    setProgress((prev) => ({ ...prev, isMuted: !prev.isMuted }));
  }, []);

  const startLevel = useCallback((levelId: number) => {
    audioEngine.unlock();
    setCurrentLevelId(levelId);
    setTapCount(0);
    setOutOfTapsStuck(false);
    setHintTier(0);
    setHintIndex(0);
    setResetToken((n) => n + 1);
    setGameState('PLAYING');
  }, []);

  const handleStartFromTitle = useCallback(() => {
    const nextId =
      progress.completedLevels.length >= LEVELS.length ? 1 : progress.unlockedLevel;
    startLevel(nextId);
  }, [progress.completedLevels.length, progress.unlockedLevel, startLevel]);

  const handleRestartLevel = useCallback(() => {
    audioEngine.unlock();
    setTapCount(0);
    setOutOfTapsStuck(false);
    setHintTier(0);
    setHintIndex(0);
    setResetToken((n) => n + 1);
    setGameState('PLAYING');
  }, []);

  const handleRequestHint = useCallback(() => {
    audioEngine.unlock();
    if (hintTier === 0) {
      setHintTier(1);
    } else if (hintTier === 1) {
      setHintTier(2);
    } else if (currentLevel.hints.length > 1) {
      setHintIndex((i) => (i + 1) % currentLevel.hints.length);
      setHintTier(1);
    } else {
      setHintTier(0);
    }
  }, [currentLevel.hints.length, hintTier]);

  const handleLevelSolved = useCallback(
    (tapsUsed: number) => {
      const safeTaps = Math.max(1, tapsUsed);
      setSolvedTaps(safeTaps);
      setProgress((prev) => {
        const completedSet = new Set(prev.completedLevels);
        completedSet.add(currentLevelId);
        const prevBest = prev.bestTaps[currentLevelId];
        const nextBest = prevBest === undefined ? safeTaps : Math.min(prevBest, safeTaps);
        return {
          ...prev,
          unlockedLevel: Math.min(
            LEVELS.length,
            Math.max(prev.unlockedLevel, currentLevelId + 1)
          ),
          completedLevels: Array.from(completedSet),
          bestTaps: {
            ...prev.bestTaps,
            [currentLevelId]: nextBest,
          },
        };
      });

      if (currentLevelId >= LEVELS.length) {
        setGameState('CAMPAIGN_COMPLETE');
      } else {
        setGameState('LEVEL_COMPLETE');
      }
    },
    [currentLevelId]
  );

  const handleNextLevel = useCallback(() => {
    const nextId = currentLevelId + 1;
    if (nextId <= LEVELS.length) {
      startLevel(nextId);
    } else {
      setGameState('CAMPAIGN_COMPLETE');
    }
  }, [currentLevelId, startLevel]);

  // Global keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        handleToggleMute();
        return;
      }

      if (gameState === 'PLAYING') {
        if (e.key === 'r' || e.key === 'R') {
          e.preventDefault();
          handleRestartLevel();
        } else if (e.key === 'h' || e.key === 'H') {
          e.preventDefault();
          handleRequestHint();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          setGameState('PAUSED');
        }
      } else if (gameState === 'PAUSED' && e.key === 'Escape') {
        e.preventDefault();
        setGameState('PLAYING');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameState, handleRequestHint, handleRestartLevel, handleToggleMute]);

  const activeHint = currentLevel.hints[hintIndex] ?? currentLevel.hints[0] ?? null;

  const totalBestTaps = useMemo(
    () => Object.values(progress.bestTaps).reduce((acc, v) => acc + v, 0),
    [progress.bestTaps]
  );

  return (
    <main className="paper-backdrop relative h-dvh w-full overflow-hidden">
      {gameState === 'LEVEL_GRID' ? (
        <LevelGrid
          progress={progress}
          onSelectLevel={startLevel}
          onBackToTitle={() => setGameState('TITLE_MENU')}
          onToggleMute={handleToggleMute}
        />
      ) : (
        <>
          <GameCanvas
            mode={gameState === 'TITLE_MENU' ? 'diorama' : 'play'}
            level={gameState === 'TITLE_MENU' ? null : currentLevel}
            resetToken={resetToken}
            paused={gameState === 'PAUSED'}
            hintTier={gameState === 'PLAYING' ? hintTier : 0}
            activeHint={activeHint}
            onTapPerformed={setTapCount}
            onOutOfTapsStuck={setOutOfTapsStuck}
            onLevelSolved={handleLevelSolved}
          />

          {gameState === 'TITLE_MENU' && (
            <TitleScreen
              hasProgress={progress.completedLevels.length > 0}
              isMuted={progress.isMuted}
              onStart={handleStartFromTitle}
              onOpenGrid={() => {
                audioEngine.unlock();
                setGameState('LEVEL_GRID');
              }}
              onToggleMute={handleToggleMute}
            />
          )}

          {gameState !== 'TITLE_MENU' && (
            <GameHUD
              level={currentLevel}
              tapCount={tapCount}
              outOfTapsStuck={outOfTapsStuck}
              hintTier={hintTier}
              activeHint={activeHint}
              isMuted={progress.isMuted}
              onOpenGrid={() => setGameState('LEVEL_GRID')}
              onPause={() => setGameState('PAUSED')}
              onRestart={handleRestartLevel}
              onRequestHint={handleRequestHint}
              onToggleMute={handleToggleMute}
            />
          )}

          {gameState === 'PAUSED' && (
            <PauseModal
              level={currentLevel}
              onResume={() => setGameState('PLAYING')}
              onRestart={handleRestartLevel}
              onOpenGrid={() => setGameState('LEVEL_GRID')}
            />
          )}

          {gameState === 'LEVEL_COMPLETE' && (
            <LevelCompleteModal
              level={currentLevel}
              tapsUsed={solvedTaps}
              hasNextLevel={currentLevelId < LEVELS.length}
              onNextLevel={handleNextLevel}
              onReplay={handleRestartLevel}
              onOpenGrid={() => setGameState('LEVEL_GRID')}
            />
          )}

          {gameState === 'CAMPAIGN_COMPLETE' && (
            <CampaignCompleteModal
              totalTaps={totalBestTaps}
              onPlayAgain={() => startLevel(1)}
              onOpenGrid={() => setGameState('LEVEL_GRID')}
            />
          )}
        </>
      )}
    </main>
  );
}
