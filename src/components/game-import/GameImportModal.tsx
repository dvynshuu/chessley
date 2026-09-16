import React, { useState } from 'react';
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

  if (!isOpen) return null;

  const handleFetchUserGames = async () => {
    if (!username.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const games = await ChessComClient.getRecentGames(username.trim(), 15);
      if (games.length === 0) {
        setError(`No recent games found for "${username}".`);
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
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(5px)',
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
          backgroundColor: '#0f172a',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
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
          <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Import Chess Game</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Selector */}
        <div
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
                  transition: 'background-color 0.15s',
                }}
              >
                <Icon size={16} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div
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
                <div
                  key={fg.title}
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
                    transition: 'border-color 0.15s, transform 0.1s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#38bdf8')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)')}
                >
                  <div>
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
                  <ArrowRight size={18} color="#94a3b8" />
                </div>
              ))}
            </div>
          )}

          {/* CHESS.COM USERNAME TAB */}
          {tab === 'username' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter Chess.com username (e.g. hikaru, magnuscarlsen)"
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
                    outline: 'none',
                  }}
                />
                <button
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
                  }}
                >
                  {isLoading ? <Loader2 size={16} className="spin" /> : <Search size={16} />}
                  Fetch Games
                </button>
              </div>

              {fetchedGames.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '350px', overflowY: 'auto' }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>
                    Recent games from public archives:
                  </div>
                  {fetchedGames.map((g) => (
                    <div
                      key={g.id}
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
                        transition: 'border-color 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#10b981')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)')}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700 }}>
                          {g.white.username} ({g.white.rating}) vs {g.black.username} ({g.black.rating})
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                          {g.date} • {g.timeControl} • {g.white.result === 'win' ? '1-0' : g.black.result === 'win' ? '0-1' : '1/2-1/2'}
                        </div>
                      </div>
                      <button
                        style={{
                          padding: '4px 10px',
                          backgroundColor: '#2563eb',
                          border: 'none',
                          borderRadius: '4px',
                          color: '#ffffff',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Analyze
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PASTE PGN TAB */}
          {tab === 'pgn' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <textarea
                value={pgnInput}
                onChange={(e) => setPgnInput(e.target.value)}
                placeholder="Paste your PGN here (e.g. 1. e4 e5 2. Nf3 Nc6 3. Bb5...)"
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
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
              <button
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
                }}
              >
                Load Game
              </button>
            </div>
          )}

          {/* CHESS.COM URL TAB */}
          {tab === 'url' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                Enter a Chess.com live or daily game URL:
              </div>
              <input
                type="text"
                value={gameUrl}
                onChange={(e) => setGameUrl(e.target.value)}
                placeholder="https://www.chess.com/game/live/123456789"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  backgroundColor: '#1e293b',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontFamily: "'Inter', sans-serif",
                  outline: 'none',
                }}
              />
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Note: Chess.com public API provides games via monthly player archives. If you know either player's username, enter it in the Username tab for instant 1-click loading.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
