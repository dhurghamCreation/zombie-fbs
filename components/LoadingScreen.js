'use client';
import { useEffect, useState } from 'react';
import { useGame } from '../hooks/useGameState';

export default function LoadingScreen({ onComplete }) {
  const { loadingProgress, setLoadingProgress, setGameState } = useGame();
  const [tipIndex, setTipIndex] = useState(0);
  const [dots, setDots] = useState('');
  
  const tips = [
    ' Headshots deal 3x damage! Aim for the head!',
    ' Stay quiet when sneaking past hordes - crouch to reduce noise',
    ' Visit the shop to buy better weapons and ammo',
    ' Use vehicles to travel faster and run over zombies',
    ' Search abandoned houses for supplies and ammo',
    ' The map expands as you explore new areas',
    ' Different weapons work better at different ranges',
    ' Medkits restore 50HP - always keep one handy',
    ' Kill zombies to earn money for upgrades',
    ' Complete missions for bonus rewards',
    ' Night time brings stronger zombies but more loot',
    ' Armor reduces damage taken by 30%',
    ' Sniper rifles are great for taking out enemies from a distance',
    ' Molotovs and grenades clear groups of zombies',
    ' Supply drops appear randomly - grab them fast!',
  ];

  useEffect(() => {
    // Start welcome music on loading screen
    // The music file is at: /sounds/geoffharvey-electro-zombies-371569.mp3
    const startMusic = () => {
      try {
        const audio = new Audio('/sounds/geoffharvey-electro-zombies-371569.mp3');
        audio.loop = true;
        audio.volume = 0.25;
        // Try to play immediately - if blocked by browser, will play on first click
        audio.play().catch(() => {
          // Browser blocked autoplay - play on first user interaction
          const playOnInteraction = () => {
            audio.play().catch(() => {});
            document.removeEventListener('click', playOnInteraction);
            document.removeEventListener('keydown', playOnInteraction);
          };
          document.addEventListener('click', playOnInteraction);
          document.addEventListener('keydown', playOnInteraction);
        });
        window.__welcomeMusic = audio;
      } catch(e) {}
    };
    startMusic();

    const tipInterval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % tips.length);
    }, 4000);
    
    let progress = 0;
    const loadInterval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(loadInterval);
        clearInterval(tipInterval);
        setTimeout(() => {
          setGameState('MENU');
          if (onComplete) onComplete();
        }, 1000);
      }
      setLoadingProgress(Math.min(100, progress));
    }, 200);

    const dotInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => {
      clearInterval(loadInterval);
      clearInterval(tipInterval);
      clearInterval(dotInterval);
    };
  }, [onComplete, setLoadingProgress, setGameState]);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0000 50%, #0a0a0a 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000,
      overflow: 'hidden',
    }}>
      {/* Background Particles */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at 20% 50%, rgba(255,0,0,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(200,0,0,0.03) 0%, transparent 50%)',
      }} />

      {/* Logo */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 60,
        position: 'relative',
      }}>
        <div style={{
          fontSize: 80,
          marginBottom: 10,
          animation: 'float 3s ease-in-out infinite',
        }}>
          ☣️
        </div>
        <h1 style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: 'clamp(28px, 5vw, 56px)',
          fontWeight: 900,
          background: 'linear-gradient(180deg, #ff4444 0%, #ff0000 40%, #8b0000 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 0 40px rgba(255,0,0,0.3)',
          letterSpacing: 4,
          margin: 0,
          lineHeight: 1.2,
          textAlign: 'center',
        }}>
          ZOMBIE APOCALYPSE
        </h1>
        <h2 style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: 'clamp(14px, 2vw, 24px)',
          color: '#664',
          letterSpacing: 8,
          margin: '5px 0 0 0',
          textTransform: 'uppercase',
        }}>
          LAST STAND
        </h2>
      </div>

      {/* Loading Bar */}
      <div style={{
        width: 'min(400px, 80vw)',
        marginBottom: 20,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          color: '#888',
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: 14,
          marginBottom: 8,
        }}>
          <span>INITIALIZING{dots}</span>
          <span>{Math.floor(loadingProgress)}%</span>
        </div>
        <div style={{
          width: '100%',
          height: 6,
          background: '#1a1a1a',
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid #333',
        }}>
          <div style={{
            width: `${loadingProgress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #ff0000, #ff4444, #ff6666, #ff4444, #ff0000)',
            backgroundSize: '200% 100%',
            borderRadius: 3,
            transition: 'width 0.3s ease',
            animation: 'shimmer 2s linear infinite',
          }} />
        </div>
      </div>

      {/* Tips */}
      <div style={{
        maxWidth: 400,
        padding: '15px 25px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 8,
        marginTop: 20,
        textAlign: 'center',
      }}>
        <div style={{
          color: '#666',
          fontSize: 11,
          fontFamily: "'Rajdhani', sans-serif",
          letterSpacing: 2,
          marginBottom: 5,
          textTransform: 'uppercase',
        }}>
          Tip of the Day
        </div>
        <p style={{
          color: '#aaa',
          fontSize: 15,
          fontFamily: "'Rajdhani', sans-serif",
          margin: 0,
          lineHeight: 1.4,
          animation: 'fadeIn 0.5s ease',
        }}>
          {tips[tipIndex]}
        </p>
      </div>

      {/* Bottom text */}
      <div style={{
        position: 'absolute',
        bottom: 30,
        color: '#333',
        fontSize: 12,
        fontFamily: "'Rajdhani', sans-serif",
        letterSpacing: 3,
      }}>
        LOADING ASSETS...
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}