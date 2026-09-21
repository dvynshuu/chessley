import React, { useEffect, useState, useMemo } from 'react';
import { useGameStore } from '../state/gameStore';
import { useAnalysisStore } from '../state/analysisStore';
import { useSettingsStore } from '../state/settingsStore';
import { Navbar } from '../components/ui/Navbar';
import { Chessboard } from '../components/chessboard/Chessboard';
import { EvaluationBar } from '../components/evaluation/EvaluationBar';
import { PlayerHeader } from '../components/chessboard/PlayerHeader';
import { BoardControls } from '../components/chessboard/BoardControls';
import { MoveList } from '../components/move-list/MoveList';
import { EnginePanel } from '../components/engine/EnginePanel';
import { EvaluationChart } from '../components/charts/EvaluationChart';
import { GameImportModal } from '../components/game-import/GameImportModal';
import { GameSummaryModal } from '../components/game-summary/GameSummaryModal';
import { ExportModal } from '../components/export/ExportModal';
import { SettingsModal } from '../components/settings/SettingsModal';
import { SplashScreen } from '../components/ui/SplashScreen';
import { FEATURED_GAMES } from '../integrations/chesscom/GameResolver';

export const App: React.FC = () => {
  const {
    game,
    currentPly,
    orientation,
    model,
    loadGame,
    setCurrentPly,
    nextMove,
    prevMove,
    firstMove,
    lastMove,
    flipBoard,
  } = useGameStore();

  const {
    status: analysisStatus,
    progressPercent,
    analyses,
    summary,
    interactiveResult,
    interactiveInfo,
    isInteractiveEvaluating,
    startWholeGameAnalysis,
    pauseAnalysis,
    resumeAnalysis,
    evaluateCurrentPosition,
    clearAnalysis,
  } = useAnalysisStore();

  const {
    engineMode,
    depth,
    boardTheme,
    showArrows,
    soundEnabled,
    soundVolume,
    setEngineMode,
  } = useSettingsStore();

  // Modals state
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load default featured game on initial mount if empty
  useEffect(() => {
    if (game.moves.length === 0) {
      loadGame(FEATURED_GAMES[0].pgn, 'pgn');
    }
  }, [game.moves.length, loadGame]);

  // Current position FEN and metadata
  const currentFen = useMemo(() => model.getFenAtPly(currentPly), [model, currentPly]);
  const currentMove = useMemo(() => model.getMoveAtPly(currentPly), [model, currentPly]);
  const currentMoveAnalysis = useMemo(() => (currentPly > 0 ? analyses[currentPly] : null), [analyses, currentPly]);

  // Request high-priority live interactive engine evaluation when navigating moves
  useEffect(() => {
    // If not analyzing whole game, run interactive evaluation on current FEN with subtle debounce
    if (analysisStatus !== 'analyzing') {
      const timer = setTimeout(() => {
        evaluateCurrentPosition(currentFen, depth);
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [currentFen, analysisStatus, depth, evaluateCurrentPosition]);

  // Top and bottom players according to board orientation
  const topPlayer = orientation === 'w' ? game.black : game.white;
  const topColor = orientation === 'w' ? 'b' : 'w';
  const bottomPlayer = orientation === 'w' ? game.white : game.black;
  const bottomColor = orientation === 'w' ? 'w' : 'b';

  // Whose turn is it at current ply?
  const sideToMove = currentPly % 2 === 0 ? 'w' : 'b';

  // Last move from/to coordinates
  const lastMoveCoords = currentMove ? { from: currentMove.from, to: currentMove.to } : null;

  // Best move recommendation (either from full analysis or interactive engine)
  const bestMove = currentMoveAnalysis?.bestMove || interactiveResult?.bestMove || null;

  // Active evaluation score for display
  const activeScore = interactiveResult?.normalizedScore || currentMoveAnalysis?.playedScoreAfter || null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'transparent' }}>
      {/* Dynamic Animated Startup Splash Screen */}
      <SplashScreen />

      {/* Accessibility Skip Link */}
      <a href="#main-board" className="sr-only">
        Skip to main chessboard
      </a>

      {/* Primary Accessible Document Heading */}
      <h1 className="sr-only">Chessley — Precision Stockfish 19 Game Analyzer</h1>

      {/* Top Navigation */}
      <Navbar
        analysisStatus={analysisStatus}
        progressPercent={progressPercent}
        hasAnalyses={Object.keys(analyses).length > 0}
        onStartAnalysis={() => startWholeGameAnalysis(game)}
        onPauseAnalysis={pauseAnalysis}
        onResumeAnalysis={resumeAnalysis}
        onOpenImport={() => setIsImportOpen(true)}
        onOpenSummary={() => setIsSummaryOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onFlipBoard={flipBoard}
      />

      {/* Main Analysis Workstation Layout */}
      <main
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1fr) minmax(320px, 440px)',
          gap: '24px',
          padding: '24px',
          maxWidth: '1440px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Left Column: Board, Evaluation Bar, Controls, Graph */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
          {/* Top Player */}
          <PlayerHeader
            player={topPlayer}
            color={topColor}
            isTurn={sideToMove === topColor}
          />

          {/* Board + Evaluation Bar Container */}
          <div
            id="main-board"
            style={{
              display: 'flex',
              gap: '12px',
              width: '100%',
              maxWidth: '640px',
              alignItems: 'stretch',
            }}
          >
            {/* Precision Vertical Evaluation Bar */}
            <EvaluationBar
              score={activeScore}
              orientation={orientation}
              isAnalyzing={isInteractiveEvaluating || analysisStatus === 'analyzing'}
            />

            {/* Interactive Vector Chessboard */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <Chessboard
                fen={currentFen}
                orientation={orientation}
                theme={boardTheme}
                lastMove={lastMoveCoords}
                bestMove={bestMove}
                playedClassification={currentMoveAnalysis?.classification}
                showArrows={showArrows}
                soundEnabled={soundEnabled}
                soundVolume={soundVolume}
              />
            </div>
          </div>

          {/* Bottom Player */}
          <PlayerHeader
            player={bottomPlayer}
            color={bottomColor}
            isTurn={sideToMove === bottomColor}
          />

          {/* Move Navigation Controls */}
          <BoardControls
            currentPly={currentPly}
            totalPlies={game.moves.length}
            onFirst={firstMove}
            onPrev={prevMove}
            onNext={nextMove}
            onLast={lastMove}
          />

          {/* Evaluation Graph across entire game */}
          <div style={{ width: '100%', maxWidth: '640px' }}>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#94a3b8',
                marginBottom: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>Evaluation Flow</span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Click or scrub to jump</span>
            </div>
            <EvaluationChart
              game={game}
              analyses={analyses}
              currentPly={currentPly}
              onSelectPly={setCurrentPly}
            />
          </div>
        </section>

        {/* Right Column: Real-time Engine Panel, Move List, Game Info */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Real-time Engine Panel */}
          <EnginePanel
            interactiveResult={interactiveResult}
            interactiveInfo={interactiveInfo}
            isEvaluating={isInteractiveEvaluating || analysisStatus === 'analyzing'}
            currentMoveAnalysis={currentMoveAnalysis}
            engineMode={engineMode}
            onSetEngineMode={setEngineMode}
          />

          {/* Move History List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
                fontWeight: 700,
                color: '#94a3b8',
              }}
            >
              <span>Move History</span>
              <span>{game.moves.length} Plies</span>
            </div>
            <MoveList
              game={game}
              analyses={analyses}
              currentPly={currentPly}
              onSelectPly={setCurrentPly}
            />
          </div>
        </section>
      </main>

      {/* Modals */}
      <GameImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onLoadPgn={(pgn, source) => {
          clearAnalysis();
          loadGame(pgn, source);
        }}
      />

      {summary && (
        <GameSummaryModal
          game={game}
          summary={summary}
          analyses={analyses}
          isOpen={isSummaryOpen}
          onClose={() => setIsSummaryOpen(false)}
          onSelectPly={setCurrentPly}
          onOpenExport={() => {
            setIsSummaryOpen(false);
            setIsExportOpen(true);
          }}
        />
      )}

      <ExportModal
        game={game}
        analyses={analyses}
        currentFen={currentFen}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};
