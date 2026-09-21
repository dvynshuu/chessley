import React, { useState, useEffect } from 'react';
import { ChessComClient, ChessComGameSummary } from '../../integrations/chesscom/ChessComClient';
import { FEATURED_GAMES, FeaturedGame } from '../../integrations/chesscom/GameResolver';
import { X, Search, FileText, Globe, Star, ArrowRight, Loader2 } from 'lucide-react';

interface GameImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadPgn: (pgn: string, source: 'chesscom' | 'pgn' | 'manual') => void;
}

type ImportTab = 'username' | 'pgn' | 'url' | 'featured';

export const GameImportModal: React.FC<GameImportModalProps> = ({
  isOpen,
  onClose,
  onLoadPgn,
}) => {
  const [tab, setTab] = useState<ImportTab>('featured');
  const [username, setUsername] = useState('hikaru');
  const [gameUrl, setGameUrl] = useState('');
  const [pgnInput, setPgnInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedGames, setFetchedGames] = useState<ChessComGameSummary[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFetchUserGames = async () => {
    if (!username.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const games = await ChessComClient.getRecentGames(username.trim(), 15);
      if (games.length === 0) {
        setError(`No recent games found for “${username}”.`);
      }
      setFetchedGames(games);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch games from Chess.com');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadPgnSubmit = () => {
    if (!pgnInput.trim()) {
      setError('Please paste a valid PGN.');
      return;
    }
    onLoadPgn(pgnInput.trim(), 'pgn');
    onClose();
  };

  const handleFeaturedSelect = (featured: FeaturedGame) => {
    onLoadPgn(featured.pgn, 'pgn');
    onClose();
  };

  const handleChessComGameSelect = (g: ChessComGameSummary) => {
    onLoadPgn(g.pgn, 'chesscom');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 7, 18, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          backgroundColor: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.9), 0 0 40px rgba(56, 189, 248, 0.15)',
          fontFamily: "'Inter', sans-serif",
          color: '#f8fafc',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <h2 id="import-modal-title" className="text-balance" style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>
            Import Chess Game
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close import dialog"
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Tab Selector */}
        <div
          role="tablist"
          aria-label="Game import sources"
          style={{
            display: 'flex',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: '#0b1120',
          }}
        >
          {[
            { id: 'featured' as const, label: 'Featured Games', icon: Star },
            { id: 'username' as const, label: 'Chess.com Username', icon: Search },
            { id: 'pgn' as const, label: 'Paste PGN', icon: FileText },
            { id: 'url' as const, label: 'Game URL', icon: Globe },
          ].map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={active}
                aria-controls={`tabpanel-${t.id}`}
                onClick={() => {
                  setTab(t.id);
                  setError(null);
                }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '12px 14px',
                  backgroundColor: active ? '#0f172a' : 'transparent',
                  border: 'none',
                  borderBottom: active ? '2px solid #2563eb' : '2px solid transparent',
                  color: active ? '#ffffff' : '#94a3b8',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease, color 0.15s ease',
                }}
              >
                <Icon size={16} aria-hidden="true" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div
          role="tabpanel"
          id={`tabpanel-${tab}`}
          aria-labelledby={`tab-${tab}`}
          style={{
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {error && (
            <div
              role="alert"
              aria-live="polite"
              style={{
                padding: '10px 14px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #ef4444',
                borderRadius: '6px',
                fontSize: '13px',
                color: '#fca5a5',
              }}
            >
              {error}
            </div>
          )}

          {/* FEATURED GAMES TAB */}
          {tab === 'featured' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                Select an immortal masterpiece for instant tactical analysis:
              </div>

              {FEATURED_GAMES.map((fg) => (
                <button
                  key={fg.title}
                  type="button"
                  aria-label={`Load featured game: ${fg.title} (${fg.year})`}
                  onClick={() => handleFeaturedSelect(fg)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'border-color 0.15s ease, transform 0.1s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#38bdf8')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)')}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>
                      {fg.title} ({fg.year})
                    </div>
                    <div style={{ fontSize: '12px', color: '#38bdf8', marginTop: '2px' }}>
                      {fg.white} vs {fg.black} • {fg.subtitle}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                      {fg.description}
                    </div>
                  </div>
                  <ArrowRight size={18} color="#94a3b8" aria-hidden="true" style={{ flexShrink: 0, marginLeft: '12px' }} />
                </button>
              ))}
            </div>
          )}

          {/* CHESS.COM USERNAME TAB */}
          {tab === 'username' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label htmlFor="import-username" className="sr-only">
                Chess.com Username
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  id="import-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  spellCheck={false}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter Chess.com username (e.g. hikaru, magnuscarlsen)…"
                  onKeyDown={(e) => e.key === 'Enter' && handleFetchUserGames()}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontFamily: "'Inter', sans-serif",
                  }}
                />
                <button
                  type="button"
                  aria-label="Fetch games from Chess.com archives"
                  onClick={handleFetchUserGames}
                  disabled={isLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 18px',
                    backgroundColor: '#2563eb',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    opacity: isLoading ? 0.7 : 1,
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  {isLoading ? <Loader2 size={16} className="spin" aria-hidden="true" /> : <Search size={16} aria-hidden="true" />}
                  Fetch Games
                </button>
              </div>

              {fetchedGames.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '350px', overflowY: 'auto' }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>
                    Recent games from public archives:
                  </div>
                  {fetchedGames.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      aria-label={`Select game ${g.white.username} versus ${g.black.username}`}
                      onClick={() => handleChessComGameSelect(g)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        backgroundColor: '#1e293b',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%',
                        transition: 'border-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#10b981')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)')}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                          {g.white.username} ({g.white.rating}) vs {g.black.username} ({g.black.rating})
                        </div>
                        <div className="tabular-nums" style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                          {g.date} • {g.timeControl} • {g.white.result === 'win' ? '1-0' : g.black.result === 'win' ? '0-1' : '1/2-1/2'}
                        </div>
                      </div>
                      <span
                        style={{
                          padding: '4px 10px',
                          backgroundColor: '#2563eb',
                          borderRadius: '4px',
                          color: '#ffffff',
                          fontSize: '11px',
                          fontWeight: 600,
                          flexShrink: 0,
                          marginLeft: '12px',
                        }}
                      >
                        Analyze
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PASTE PGN TAB */}
          {tab === 'pgn' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label htmlFor="import-pgn" className="sr-only">
                PGN Content
              </label>
              <textarea
                id="import-pgn"
                name="pgn"
                autoComplete="off"
                spellCheck={false}
                value={pgnInput}
                onChange={(e) => setPgnInput(e.target.value)}
                placeholder="Paste your PGN here (e.g. 1. e4 e5 2. Nf3 Nc6 3. Bb5…)…"
                rows={8}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#1e293b',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontFamily: "'JetBrains Mono', monospace",
                  resize: 'vertical',
                }}
              />
              <button
                type="button"
                onClick={handleLoadPgnSubmit}
                style={{
                  padding: '10px 18px',
                  backgroundColor: '#2563eb',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  alignSelf: 'flex-end',
                  transition: 'background-color 0.15s ease',
                }}
              >
                Load Game
              </button>
            </div>
          )}

          {/* CHESS.COM URL TAB */}
          {tab === 'url' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label htmlFor="import-url" className="sr-only">
                Chess.com Game URL
              </label>
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                Enter a Chess.com live or daily game URL:
              </div>
              <input
                id="import-url"
                name="gameUrl"
                type="url"
                autoComplete="off"
                spellCheck={false}
                value={gameUrl}
                onChange={(e) => setGameUrl(e.target.value)}
                placeholder="https://www.chess.com/game/live/123456789…"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  backgroundColor: '#1e293b',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontFamily: "'Inter', sans-serif",
                }}
              />
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Note: Chess.com public API provides games via monthly player archives. If you know either player’s username, enter it in the Username tab for instant 1-click loading.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
