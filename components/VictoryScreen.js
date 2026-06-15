'use client';
import { useEffect, useState } from 'react';
import { useGame } from '../hooks/useGameState';

export default function VictoryScreen({ onMainMenu }) {
  const { killCount, survivalTime, wave, inventory, setGameState } = useGame();
  const [displayKills, setDisplayKills] = useState(0);
  const [displayTime, setDisplayTime] = useState('00:00');
  const [showStats, setShowStats] = useState(false);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayKills(prev => {
        if (prev < killCount) return prev + 1;
        clearInterval(interval);
        return killCount;
      });
    }, 30);
    setDisplayTime(formatTime(survivalTime));

    // Show stats after brief delay
    setTimeout(() => setShowStats(true), 500);

    return () => clearInterval(interval);
  }, [killCount, survivalTime]);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'linear-gradient(135deg, #0a0a00 0%, #1a1a00 40%, #0a0a00 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 10000,
      fontFamily: "'Rajdhani', sans-serif",
      overflow: 'hidden',
    }}>
      {/* Golden glow */}
      <div style={{
        position: 'absolute', width: '100%', height: '100%',
        background: `
          radial-gradient(ellipse at 50% 30%, rgba(255,200,0,0.15) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 60%, rgba(255,200,0,0.05) 0%, transparent 50%)
        `,
        pointerEvents: 'none',
      }} />

      {/* Trophy */}
      <div style={{
        fontSize: 100,
        marginBottom: 20,
        animation: 'float 3s ease-in-out infinite',
      }}>
        🏆
      </div>

      <h1 style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: 'clamp(36px, 7vw, 72px)',
        color: '#ffd700',
        textShadow: '0 0 40px rgba(255,215,0,0.5)',
        letterSpacing: 5,
        margin: 0,
      }}>
        VICTORY!
      </h1>

      <div style={{
        color: '#ffcc00',
        fontSize: 18,
        letterSpacing: 4,
        marginTop: 5,
        opacity: 0.8,
      }}>
        YOU SURVIVED THE APOCALYPSE!
      </div>

      {/* Stats */}
      {showStats && (
        <div style={{
          display: 'flex',
          gap: 40,
          marginTop: 40,
          marginBottom: 40,
          padding: '25px 50px',
          background: 'rgba(255,215,0,0.03)',
          border: '1px solid rgba(255,215,0,0.15)',
          borderRadius: 12,
          backdropFilter: 'blur(10px)',
          animation: 'fadeIn 0.5s ease',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#ffd700', fontSize: 36, fontWeight: 700 }}>{displayKills}</div>
            <div style={{ color: '#887744', fontSize: 12, letterSpacing: 2, marginTop: 4 }}>ZOMBIES KILLED</div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,215,0,0.15)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#ffd700', fontSize: 36, fontWeight: 700 }}>{displayTime}</div>
            <div style={{ color: '#887744', fontSize: 12, letterSpacing: 2, marginTop: 4 }}>SURVIVED</div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,215,0,0.15)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#ffd700', fontSize: 36, fontWeight: 700 }}>Wave {wave}</div>
            <div style={{ color: '#887744', fontSize: 12, letterSpacing: 2, marginTop: 4 }}>SURVIVED</div>
          </div>
        </div>
      )}

      {/* Reward */}
      <div style={{
        marginBottom: 40,
        padding: '15px 30px',
        background: 'rgba(255,215,0,0.05)',
        border: '1px solid rgba(255,215,0,0.1)',
        borderRadius: 8,
      }}>
        <div style={{ color: '#887744', fontSize: 14, marginBottom: 5, textAlign: 'center' }}>
          REWARD EARNED
        </div>
        <div style={{ color: '#ffd700', fontSize: 32, fontWeight: 700 }}>
          +${killCount * 100 + wave * 500}
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 15 }}>
        <button onClick={() => window.location.reload()} style={{
          padding: '14px 35px',
          background: 'rgba(255,215,0,0.2)',
          border: '1px solid #ffd700',
          color: '#ffd700',
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

      {/* Firework particles */}
      <Fireworks />

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function Fireworks() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const colors = ['#ffd700', '#ff6347', '#00ff00', '#4488ff', '#ff44ff', '#ff8800'];
    const newParticles = [];
    
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 2 + Math.random() * 4,
        duration: 1 + Math.random() * 2,
        delay: Math.random() * 3,
      });
    }
    setParticles(newParticles);
  }, []);

  return (
    <div style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, pointerEvents: 'none' }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.x}%`,
          top: `${p.y}%`,
          width: p.size,
          height: p.size,
          background: p.color,
          borderRadius: '50%',
          animation: `particle ${p.duration}s ease-out ${p.delay}s infinite`,
          boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
        }} />
      ))}
      <style jsx>{`
        @keyframes particle {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-100px) scale(0); }
        }
      `}</style>
    </div>
  );
}