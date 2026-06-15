'use client';
import { useEffect, useState } from 'react';
import { useGame } from '../hooks/useGameState';

export default function GameOverScreen({ onRestart, onMainMenu }) {
  const { killCount, survivalTime, wave, inventory } = useGame();
  const [displayKills, setDisplayKills] = useState(0);
  const [displayTime, setDisplayTime] = useState('00:00');
  
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    // Animate kill count
    const interval = setInterval(() => {
      setDisplayKills(prev => {
        if (prev < killCount) return prev + 1;
        clearInterval(interval);
        return killCount;
      });
    }, 50);
    setDisplayTime(formatTime(survivalTime));
    
    return () => clearInterval(interval);
  }, [killCount, survivalTime]);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'linear-gradient(135deg, #0a0000 0%, #1a0000 40%, #0a0000 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 10000,
      fontFamily: "'Rajdhani', sans-serif",
      overflow: 'hidden',
    }}>
      {/* Blood overlay */}
      <div style={{
        position: 'absolute', width: '100%', height: '100%',
        background: `
          radial-gradient(ellipse at 30% 40%, rgba(100,0,0,0.3) 0%, transparent 50%),
          radial-gradient(ellipse at 70% 60%, rgba(100,0,0,0.2) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 100%, rgba(100,0,0,0.1) 0%, transparent 40%)
        `,
        pointerEvents: 'none',
      }} />

      {/* Skull */}
      <div style={{
        fontSize: 100,
        marginBottom: 20,
        animation: 'float 3s ease-in-out infinite',
        opacity: 0.8,
      }}>
        💀
      </div>

      <h1 style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: 'clamp(36px, 7vw, 72px)',
        color: '#cc0000',
        textShadow: '0 0 30px rgba(255,0,0,0.5)',
        letterSpacing: 5,
        margin: 0,
      }}>
        GAME OVER
      </h1>
      
      <div style={{
        color: '#666',
        fontSize: 16,
        letterSpacing: 3,
        marginTop: 5,
        fontFamily: "'Rajdhani', sans-serif",
      }}>
        THE ZOMBIES GOT YOU...
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex',
        gap: 40,
        marginTop: 40,
        marginBottom: 40,
        padding: '20px 40px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#ff4444', fontSize: 32, fontWeight: 700 }}>{displayKills}</div>
          <div style={{ color: '#666', fontSize: 12, letterSpacing: 2, marginTop: 4 }}>ZOMBIES KILLED</div>
        </div>
        <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#ffaa44', fontSize: 32, fontWeight: 700 }}>{displayTime}</div>
          <div style={{ color: '#666', fontSize: 12, letterSpacing: 2, marginTop: 4 }}>SURVIVED</div>
        </div>
        <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#44aaff', fontSize: 32, fontWeight: 700 }}>Wave {wave}</div>
          <div style={{ color: '#666', fontSize: 12, letterSpacing: 2, marginTop: 4 }}>REACHED</div>
        </div>
      </div>

      {/* Score */}
      <div style={{
        display: 'flex', gap: 30, marginBottom: 40,
        alignItems: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#ffcc00', fontSize: 14, marginBottom: 5 }}>MONEY EARNED</div>
          <div style={{ color: '#ffcc00', fontSize: 28, fontWeight: 700 }}>+${killCount * 50}</div>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 15 }}>
        <button onClick={onRestart} style={{
          padding: '14px 35px',
          background: 'rgba(255,0,0,0.2)',
          border: '1px solid #ff4444',
          color: '#ff4444',
          borderRadius: 6,
          cursor: 'pointer',
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: 18,
          fontWeight: 600,
          letterSpacing: 2,
          transition: 'all 0.3s',
        }}>
          🔄 PLAY AGAIN
        </button>
        <button onClick={onMainMenu} style={{
          padding: '14px 35px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: '#ccc',
          borderRadius: 6,
          cursor: 'pointer',
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: 18,
          fontWeight: 600,
          letterSpacing: 2,
          transition: 'all 0.3s',
        }}>
          🏠 MAIN MENU
        </button>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}