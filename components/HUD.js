'use client';
import { useState, useEffect, useRef } from 'react';
import { useGame } from '../hooks/useGameState';

export default function HUD({ onPause, isPaused }) {
  const {
    playerHealth, maxHealth, killCount, survivalTime,
    inventory, currentWeapon, wave, zombieCount,
    useMedkit, switchWeapon, isReloading, setIsReloading,
    setInventory, setGameState,
    currentMissions,
  } = useGame();
  
  const [showMap, setShowMap] = useState(false);
  const [showPause, setShowPause] = useState(false);
  
  const weapon = inventory.weapons[currentWeapon];
  const weaponCount = inventory.weapons.filter(w => w.unlocked).length;

  // Expose weapon data globally for the attack system in Player.js
  useEffect(() => {
    window.__currentWeapon = currentWeapon;
    window.__weaponsData = inventory.weapons;
  }, [currentWeapon, inventory.weapons]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === 'KeyM') setShowMap(prev => !prev);
      if (e.code === 'Digit1') switchWeapon(0);
      if (e.code === 'Digit2') switchWeapon(1);
      if (e.code === 'Digit3') switchWeapon(2);
      if (e.code === 'Digit4') switchWeapon(3);
      if (e.code === 'Digit5') switchWeapon(4);
      if (e.code === 'Digit6') switchWeapon(5);
      if (e.code === 'Digit7') switchWeapon(6);
      if (e.code === 'Digit8') switchWeapon(7);
      if (e.code === 'KeyR') {
        if (weapon && weapon.type === 'ranged' && weapon.ammo < weapon.maxAmmo) {
          setIsReloading(true);
        }
      }
      if (e.code === 'KeyH') useMedkit();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentWeapon, weapon]);

  // Reload timer
  useEffect(() => {
    if (!isReloading || !weapon || weapon.type === 'melee') return;
    const timer = setTimeout(() => {
      setInventory(prev => ({
        ...prev,
        weapons: prev.weapons.map((w, i) => 
          i === currentWeapon ? { ...w, ammo: w.maxAmmo } : w
        ),
      }));
      setIsReloading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [isReloading, weapon, currentWeapon, setIsReloading, setInventory]);

  if (showMap) return <MapOverlay onClose={() => setShowMap(false)} />;

  return (
    <>
      {/* Top Left - Health & Stats */}
      <div style={{
        position: 'fixed', top: 20, left: 20, zIndex: 50,
        fontFamily: "'Rajdhani', sans-serif",
      }}>
        <div style={{
          width: 200, height: 22,
          background: 'rgba(0,0,0,0.7)',
          border: '1px solid #333', borderRadius: 4,
          position: 'relative', overflow: 'hidden',
          backdropFilter: 'blur(5px)', marginBottom: 8,
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, height: '100%',
            width: `${Math.max(0, playerHealth)}%`,
            background: playerHealth > 50 ? 'linear-gradient(90deg, #00ff00, #44ff44)' 
                      : playerHealth > 25 ? 'linear-gradient(90deg, #ffaa00, #ffcc00)'
                      : 'linear-gradient(90deg, #ff0000, #ff4444)',
            transition: 'width 0.2s ease',
          }} />
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 12, fontWeight: 600,
            textShadow: '0 1px 3px rgba(0,0,0,0.8)',
          }}>
            ❤️ {Math.ceil(playerHealth)}%
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, color: '#888', fontSize: 13 }}>
          <div>💀 Kills: <span style={{ color: '#ff4444' }}>{killCount}</span></div>
          <div>⏱️ {formatTime(survivalTime)}</div>
          <div>🌊 Wave {wave}</div>
          <div>🧟 {zombieCount}</div>
        </div>
      </div>

      {/* Top Right - Weapon Info */}
      <div style={{
        position: 'fixed', top: 20, right: 20, zIndex: 50,
        fontFamily: "'Rajdhani', sans-serif", textAlign: 'right',
      }}>
        <div style={{
          background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8, padding: '10px 15px', backdropFilter: 'blur(5px)',
        }}>
          <div style={{ color: '#ff4444', fontSize: 11, letterSpacing: 2, marginBottom: 4 }}>EQUIPPED</div>
          <div style={{ color: 'white', fontSize: 18, fontWeight: 700 }}>
            {weapon?.icon} {weapon?.name}
          </div>
          {weapon?.type === 'ranged' && (
            <div style={{ color: '#aaa', fontSize: 14, marginTop: 4 }}>
              🔫 {weapon.ammo}/{weapon.maxAmmo}
              {isReloading && <span style={{ color: '#ffcc00', marginLeft: 8, fontSize: 11 }}>RELOADING...</span>}
            </div>
          )}
          <div style={{ color: '#ffcc00', fontSize: 15, marginTop: 6 }}>💰 ${inventory.money}</div>
        </div>
      </div>

      {/* Bottom Center - Weapon Hotbar */}
      <div style={{
        position: 'fixed', bottom: 30, left: '50%', transform: 'translateX(-50%)',
        zIndex: 50, display: 'flex', gap: 4, fontFamily: "'Rajdhani', sans-serif",
      }}>
        {inventory.weapons.filter(w => w.unlocked).map((w, i) => (
          <div key={w.id} onClick={() => switchWeapon(i)} style={{
            padding: '6px 10px',
            background: i === currentWeapon ? 'rgba(255,0,0,0.3)' : 'rgba(0,0,0,0.6)',
            border: i === currentWeapon ? '1px solid #ff4444' : '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6, cursor: 'pointer', textAlign: 'center',
            backdropFilter: 'blur(5px)', transition: 'all 0.2s', minWidth: 50,
          }}>
            <div style={{ fontSize: 18 }}>{w.icon}</div>
            <div style={{ color: i === currentWeapon ? '#ff4444' : '#666', fontSize: 9, fontWeight: 600 }}>
              [{i + 1}]
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Left - Controls */}
      <div style={{
        position: 'fixed', bottom: 90, left: 20, zIndex: 50,
        color: '#444', fontFamily: "'Rajdhani', sans-serif", fontSize: 11,
        lineHeight: 1.6, opacity: 0.5,
      }}>
        <div>WASD - Move | SPACE - Attack</div>
        <div>1-8 Weapons | R Reload | H Heal | M Map</div>
      </div>

      {/* Crosshair */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)', zIndex: 50, pointerEvents: 'none',
      }}>
        <div style={{ width: 24, height: 24, position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: 4, height: 4, background: 'rgba(255,0,0,0.9)', borderRadius: 2, transform: 'translate(-50%, -50%)' }} />
          <div style={{ position: 'absolute', top: 0, left: '50%', width: 1.5, height: 9, background: 'rgba(255,255,255,0.4)', transform: 'translateX(-50%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: '50%', width: 1.5, height: 9, background: 'rgba(255,255,255,0.4)', transform: 'translateX(-50%)' }} />
          <div style={{ position: 'absolute', left: 0, top: '50%', width: 9, height: 1.5, background: 'rgba(255,255,255,0.4)', transform: 'translateY(-50%)' }} />
          <div style={{ position: 'absolute', right: 0, top: '50%', width: 9, height: 1.5, background: 'rgba(255,255,255,0.4)', transform: 'translateY(-50%)' }} />
        </div>
      </div>
    </>
  );
}

function MapOverlay({ onClose }) {
  const { playerPos, zombieCount, killCount, wave, survivalTime } = useGame();
  
  useEffect(() => {
    const handleKey = (e) => e.code === 'KeyM' && onClose();
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${Math.floor(s%60).toString().padStart(2,'0')}`;

  const mapLocations = [
    { name: '🏘️ Safe Zone', x: 50, y: 50, color: '#44ff44' },
    { name: '🏪 Market', x: 25, y: 30, color: '#ffcc00' },
    { name: '🏥 Hospital', x: 75, y: 25, color: '#ff4444' },
    { name: '🏫 School', x: 30, y: 75, color: '#4488ff' },
    { name: '🏭 Factory', x: 70, y: 70, color: '#ff8800' },
    { name: '🚁 Airport', x: 80, y: 80, color: '#ff44ff' },
    { name: '⛰️ Mountain', x: 15, y: 15, color: '#886644' },
  ];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', zIndex: 100,
      fontFamily: "'Rajdhani', sans-serif",
    }}>
      <h2 style={{ color: '#ff4444', fontFamily: "'Orbitron', sans-serif", fontSize: 28, letterSpacing: 3, marginBottom: 5 }}>
        🗺️ SURVIVAL MAP
      </h2>
      <div style={{ display: 'flex', gap: 20, color: '#888', fontSize: 13, marginBottom: 20 }}>
        <div>Kills: <span style={{ color: 'white' }}>{killCount}</span></div>
        <div>Wave: <span style={{ color: 'white' }}>{wave}</span></div>
        <div>Time: <span style={{ color: 'white' }}>{formatTime(survivalTime)}</span></div>
      </div>
      <div style={{
        width: 'min(450px, 85vw)', height: 'min(450px, 85vw)',
        background: '#1a1a1a', border: '2px solid #333', borderRadius: 8,
        position: 'relative', overflow: 'hidden',
      }}>
        {mapLocations.map((loc, i) => (
          <div key={i} style={{ position: 'absolute', left: `${loc.x}%`, top: `${loc.y}%`, transform: 'translate(-50%, -50%)' }}>
            <div style={{ width: 12, height: 12, background: loc.color, borderRadius: '50%', boxShadow: `0 0 10px ${loc.color}40` }} />
            <div style={{ color: loc.color, fontSize: 9, marginTop: 2, whiteSpace: 'nowrap', textAlign: 'center' }}>{loc.name}</div>
          </div>
        ))}
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
          <div style={{ width: 16, height: 16, background: '#44ff44', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', boxShadow: '0 0 15px rgba(68,255,68,0.5)' }} />
          <div style={{ color: '#44ff44', fontSize: 9, marginTop: 2, textAlign: 'center' }}>YOU</div>
        </div>
      </div>
      <div style={{ color: '#555', fontSize: 12, marginTop: 15 }}>Press [M] to close</div>
    </div>
  );
}