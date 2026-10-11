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
import { PieceColor } from '../chess/types';

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

  // Mobile Workstation Bay Switcher tab state
  const [mobileTab, setMobileTab] = useState<'engine' | 'moves' | 'chart'>('engine');

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
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [currentFen, analysisStatus, depth, evaluateCurrentPosition]);

  // Top and bottom players according to board orientation
  const topPlayer = orientation === 'w' ? game.black : game.white;
  const topColor = orientation === 'w' ? 'b' : 'w';
  const bottomPlayer = orientation === 'w' ? game.white : game.black;
  const bottomColor = orientation === 'w' ? 'w' : 'b';

  // Whose turn is it at current ply?
  const sideToMove = (currentFen.split(' ')[1] as PieceColor) || (currentPly % 2 === 0 ? 'w' : 'b');

  // Last move from/to coordinates
  const lastMoveCoords = currentMove ? { from: currentMove.from, to: currentMove.to } : null;

  // Next move analysis (if available from whole game analysis, evalBefore is currentFen's evaluation)
  const nextMoveAnalysis = useMemo(
    () => (currentPly < game.moves.length ? analyses[currentPly + 1] : null),
    [analyses, currentPly, game.moves.length]
  );

  // Verify interactive engine evaluation matches the currently displayed board FEN
  const isInteractiveMatchingFen = interactiveResult?.fen === currentFen;
  const currentInteractiveResult = isInteractiveMatchingFen ? interactiveResult : null;
  const currentInteractiveInfo = isInteractiveMatchingFen ? interactiveInfo : null;

  // Best move recommendation for the board currently displayed:
  // Prioritize live interactive evaluation of current position, then nextMoveAnalysis
  const bestMove = currentInteractiveResult?.bestMove || nextMoveAnalysis?.bestMove || null;

  // Active evaluation score for display (normalized to White perspective)
  const activeScore =
    currentInteractiveResult?.normalizedScore ||
    (currentPly === 0 ? nextMoveAnalysis?.bestScoreBefore : currentMoveAnalysis?.playedScoreAfter) ||
    null;

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
      <main className="workstation-main">
        {/* Left Column: Board, Evaluation Bar, Controls, Graph */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', width: '100%' }}>
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
              gap: '10px',
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

            {/* Interactive Vector Chessboard with Mobile Swipe Gestures */}
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
                onSwipeLeft={nextMove}
                onSwipeRight={prevMove}
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

          {/* Desktop Evaluation Flow Graph */}
          <div className="desktop-bay" style={{ width: '100%', maxWidth: '640px' }}>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#94a3b8',
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
                marginBottom: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>Evaluation Flow</span>
              <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'none', letterSpacing: 'normal' }}>Click or scrub to jump</span>
            </div>
            <EvaluationChart
              game={game}
              analyses={analyses}
              currentPly={currentPly}
              onSelectPly={setCurrentPly}
            />
          </div>

          {/* Mobile Workstation Bay Switcher */}
          <div
            className="mobile-bay-switcher"
            style={{
              width: '100%',
              maxWidth: '640px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              marginTop: '4px',
            }}
          >
            {/* Tactile Segmented Controls */}
            <div
              role="tablist"
              aria-label="Workstation view"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                backgroundColor: '#0f121a',
                borderRadius: '8px',
                padding: '4px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                gap: '4px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
              }}
            >
              <button
                type="button"
                role="tab"
                aria-selected={mobileTab === 'engine'}
                onClick={() => setMobileTab('engine')}
                style={{
                  minHeight: '40px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: mobileTab === 'engine' ? '1px solid rgba(200, 170, 110, 0.35)' : '1px solid transparent',
                  backgroundColor: mobileTab === 'engine' ? '#1c2230' : 'transparent',
                  color: mobileTab === 'engine' ? '#f8fafc' : '#94a3b8',
                  fontWeight: mobileTab === 'engine' ? 700 : 500,
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  cursor: 'pointer',
                  boxShadow: mobileTab === 'engine' ? '0 1px 3px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06)' : 'none',
                }}
              >
                <span>⚡ Engine</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={mobileTab === 'moves'}
                onClick={() => setMobileTab('moves')}
                style={{
                  minHeight: '40px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: mobileTab === 'moves' ? '1px solid rgba(200, 170, 110, 0.35)' : '1px solid transparent',
                  backgroundColor: mobileTab === 'moves' ? '#1c2230' : 'transparent',
                  color: mobileTab === 'moves' ? '#f8fafc' : '#94a3b8',
                  fontWeight: mobileTab === 'moves' ? 700 : 500,
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  cursor: 'pointer',
                  boxShadow: mobileTab === 'moves' ? '0 1px 3px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06)' : 'none',
                }}
              >
                <span>📋 Moves</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={mobileTab === 'chart'}
                onClick={() => setMobileTab('chart')}
                style={{
                  minHeight: '40px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: mobileTab === 'chart' ? '1px solid rgba(200, 170, 110, 0.35)' : '1px solid transparent',
                  backgroundColor: mobileTab === 'chart' ? '#1c2230' : 'transparent',
                  color: mobileTab === 'chart' ? '#f8fafc' : '#94a3b8',
                  fontWeight: mobileTab === 'chart' ? 700 : 500,
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  cursor: 'pointer',
                  boxShadow: mobileTab === 'chart' ? '0 1px 3px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06)' : 'none',
                }}
              >
                <span>📈 Graph</span>
              </button>
            </div>

            {/* Active Mobile Bay Content */}
            <div style={{ width: '100%' }}>
              {mobileTab === 'engine' && (
                <EnginePanel
                  interactiveResult={currentInteractiveResult}
                  interactiveInfo={currentInteractiveInfo}
                  isEvaluating={isInteractiveEvaluating || analysisStatus === 'analyzing'}
                  currentMoveAnalysis={currentMoveAnalysis}
                  nextMoveAnalysis={nextMoveAnalysis}
                  engineMode={engineMode}
                  onSetEngineMode={setEngineMode}
                />
              )}

              {mobileTab === 'moves' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#94a3b8',
                      letterSpacing: '0.6px',
                      textTransform: 'uppercase',
                    }}
                  >
                    <span>Move History</span>
                    <span className="tabular-nums" style={{ textTransform: 'none', letterSpacing: 'normal' }}>{game.moves.length} Plies</span>
                  </div>
                  <MoveList
                    game={game}
                    analyses={analyses}
                    currentPly={currentPly}
                    onSelectPly={setCurrentPly}
                  />
                </div>
              )}

              {mobileTab === 'chart' && (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#94a3b8',
                      letterSpacing: '0.6px',
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>Evaluation Flow</span>
                    <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'none', letterSpacing: 'normal' }}>Drag or scrub to jump</span>
                  </div>
                  <EvaluationChart
                    game={game}
                    analyses={analyses}
                    currentPly={currentPly}
                    onSelectPly={setCurrentPly}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Right Column: Real-time Engine Panel, Move List, Game Info (Desktop Bay) */}
        <section className="desktop-bay" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Real-time Engine Panel */}
          <EnginePanel
            interactiveResult={currentInteractiveResult}
            interactiveInfo={currentInteractiveInfo}
            isEvaluating={isInteractiveEvaluating || analysisStatus === 'analyzing'}
            currentMoveAnalysis={currentMoveAnalysis}
            nextMoveAnalysis={nextMoveAnalysis}
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
                fontSize: '11px',
                fontWeight: 700,
                color: '#94a3b8',
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
              }}
            >
              <span>Move History</span>
              <span className="tabular-nums" style={{ textTransform: 'none', letterSpacing: 'normal' }}>{game.moves.length} Plies</span>
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
