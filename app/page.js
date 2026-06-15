"use client";
import { useState, useRef, useCallback, useEffect, useMemo, Suspense } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Sky, PointerLockControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { GameProvider, useGame, GameState } from "../hooks/useGameState";
import LoadingScreen from "../components/LoadingScreen";
import MainMenu from "../components/MainMenu";
import HUD from "../components/HUD";
import OpenWorldEnvironment from "../components/OpenWorldEnvironment";
import MobileControls from "../components/MobileControls";
import AudioSystem from "../components/AudioSystem";
import Player from "../components/Player";
import Zombie from "../components/Zombie";

// ============ BLOOD EFFECT ============
function BloodEffect({ position, count = 15 }) {
  const particles = useMemo(() => {
    const p = [];
    const colors = ['#cc0000', '#ff0000', '#990000', '#ff3333', '#aa0000'];
    for (let i = 0; i < count; i++) {
      p.push({ pos: [(Math.random() - 0.5) * 2, Math.random() * 0.5, (Math.random() - 0.5) * 2], color: colors[Math.floor(Math.random() * colors.length)], scale: 0.05 + Math.random() * 0.15 });
    }
    return p;
  }, [count]);
  return (<group position={position}>{particles.map((p, i) => (<mesh key={i} position={p.pos}><sphereGeometry args={[p.scale, 4]} /><meshBasicMaterial color={p.color} transparent opacity={0.8} /></mesh>))}</group>);
}

// ============ ZOMBIE MANAGER ============
function ZombieManager({ playerRef, difficulty, gamePaused }) {
  const { setZombieCount, wave, setWave, addKill, addMoney, damagePlayer, settings, addItemToBag, setGameState } = useGame();
  const [zombies, setZombies] = useState([]);
  const [bloodEffects, setBloodEffects] = useState([]);
  const zombieIdRef = useRef(0);
  const waveActiveRef = useRef(false);
  const zombiesKilledThisWave = useRef(0);
  const zombiesPerWaveRef = useRef(5);

  const zombieTypes = [
    { name: 'Walker', speed: 2.5, health: 40, damage: 8, scale: 1.0 },
    { name: 'Runner', speed: 5.0, health: 25, damage: 6, scale: 0.9 },
    { name: 'Brute', speed: 1.8, health: 100, damage: 18, scale: 1.3 },
    { name: 'Spitter', speed: 3.0, health: 35, damage: 10, scale: 1.0 },
    { name: 'Crawler', speed: 3.5, health: 20, damage: 5, scale: 0.7 },
    { name: 'Giant', speed: 1.5, health: 200, damage: 25, scale: 1.6 },
  ];

  const spawnWave = useCallback(() => {
    const baseCount = 4 + wave * 2;
    const count = Math.min(baseCount, 30);
    zombiesPerWaveRef.current = count;
    zombiesKilledThisWave.current = 0;
    waveActiveRef.current = true;
    const newZombies = [];
    const groupCenters = [{x:40,z:40},{x:-40,z:40},{x:40,z:-40},{x:-40,z:-40},{x:60,z:0},{x:-60,z:0},{x:0,z:60},{x:0,z:-60}];
    for (let i = 0; i < count; i++) {
      const center = groupCenters[i % groupCenters.length];
      const angle = Math.random() * Math.PI * 2;
      const spread = 10 + Math.random() * 20;
      const r = Math.random();
      const typeIndex = r < 0.45 ? 0 : r < 0.65 ? 1 : r < 0.78 ? 2 : r < 0.88 ? 3 : r < 0.95 ? 4 : 5;
      const type = zombieTypes[Math.min(typeIndex, zombieTypes.length - 1)];
      const healthMult = 1 + (wave - 1) * 0.12;
      newZombies.push({
        id: zombieIdRef.current++,
        pos: [center.x + Math.cos(angle) * spread, 0, center.z + Math.sin(angle) * spread],
        health: Math.floor(type.health * healthMult),
        maxHealth: Math.floor(type.health * healthMult),
        speed: type.speed + (wave - 1) * 0.08,
        damage: type.damage + Math.floor((wave - 1) * 1.2),
        type: type, isDead: false,
      });
    }
    setZombies(prev => [...prev, ...newZombies]);
    setZombieCount(prev => prev + count);
  }, [wave, setZombieCount, zombieTypes]);

  useEffect(() => { if (!waveActiveRef.current && zombies.length === 0) spawnWave(); }, [zombies.length, spawnWave]);

  const handleZombieDeath = useCallback((zombieId, pos) => {
    setBloodEffects(prev => [...prev, { id: Date.now(), pos, time: 0 }]);
    setZombies(prev => prev.map(z => z.id === zombieId ? { ...z, isDead: true } : z));
    setTimeout(() => { setZombies(prev => prev.filter(z => z.id !== zombieId)); setZombieCount(prev => Math.max(0, prev - 1)); }, 1500);
    addKill();
    addMoney(Math.floor(Math.random() * 30) + 10);
    if (Math.random() < 0.12) addItemToBag({ name: ['Medkit','Ammo','Money','Grenade'][Math.floor(Math.random()*4)], type: 'loot', value: 1 });
    zombiesKilledThisWave.current += 1;
    if (zombiesKilledThisWave.current >= zombiesPerWaveRef.current) {
      waveActiveRef.current = false;
      addMoney(wave * 100);
      if (window.__audio) window.__audio.playPickup();
      setTimeout(() => setWave(prev => prev + 1), 3000);
    }
  }, [setZombieCount, addKill, addMoney, addItemToBag, setWave, wave]);

  useEffect(() => { const interval = setInterval(() => { setBloodEffects(prev => prev.filter(b => b.time < 5).map(b => ({ ...b, time: b.time + 1 }))); }, 1000); return () => clearInterval(interval); }, []);

  return (<group>
    {zombies.map(z => !z.isDead ? (
      <Zombie key={z.id} id={z.id} position={z.pos} playerRef={playerRef} health={z.health} maxHealth={z.maxHealth} speed={z.speed} damage={z.damage} zombieType={z.type} gamePaused={gamePaused}
        onDeath={(pos) => handleZombieDeath(z.id, pos)}
        onPlayerHit={(dmg) => { damagePlayer(dmg); if (window.__audio) window.__audio.playHit(); }}
      />
    ) : (
      <group key={z.id} position={[z.pos[0], 0.1, z.pos[2]]} rotation={[Math.PI/2,0,0]}><mesh><boxGeometry args={[0.6,0.2,1.2]} /><meshStandardMaterial color="#443" transparent opacity={0.5} /></mesh></group>
    ))}
    {bloodEffects.map(b => <BloodEffect key={b.id} position={b.pos} count={10} />)}
  </group>);
}

// ============ BRIGHTNESS CONTROLLER ============
function BrightnessController({ brightness }) {
  const { gl } = useThree();
  useEffect(() => {
    if (gl) gl.toneMappingExposure = brightness || 1.0;
  }, [gl, brightness]);
  return null;
}

// ============ GAME SCENE ============
function GameScene({ onGameOver }) {
  const { gameState, setGameState, survivalTime, setSurvivalTime, addMoney, damagePlayer, notification, settings, playerHealth, setPlayerHealth } = useGame();
  const playerRef = useRef(null);
  const gameTimeRef = useRef(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [sunPosition, setSunPosition] = useState([100, 50, 100]);
  const [showPauseMenu, setShowPauseMenu] = useState(false);

  useEffect(() => {
    if (!settings.dayNightCycle) { setSunPosition([100, 50, 100]); return; }
    const interval = setInterval(() => { setSunPosition(prev => { const y = prev[1] - 0.5; if (y < -50) return [100, 50, 100]; return [prev[0], y, prev[2]]; }); }, 1000);
    return () => clearInterval(interval);
  }, [settings.dayNightCycle]);

  useEffect(() => {
    if (gameState !== 'PLAYING' || isPaused) return;
    const interval = setInterval(() => { gameTimeRef.current += 1; setSurvivalTime(gameTimeRef.current); if (gameTimeRef.current % 30 === 0) addMoney(25); }, 1000);
    return () => clearInterval(interval);
  }, [gameState, isPaused, setSurvivalTime, addMoney]);

  useEffect(() => {
    const handleKey = (e) => { if (e.code === 'Escape') { setIsPaused(prev => !prev); setShowPauseMenu(prev => !prev); } };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleUnlock = useCallback(() => { setIsLocked(true); if (window.__audio) window.__audio.init(); }, []);
  const handleLock = useCallback(() => { setIsLocked(false); }, []);

  const sceneBrightness = settings.brightness || 1.0;
  const ambientIntensity = 0.5 * sceneBrightness;
  const dirLightIntensity = 1.5 * sceneBrightness;

  // Watch for health reaching 0 and trigger game over
  useEffect(() => {
    if (playerHealth <= 0 && gameState === 'PLAYING') {
      setIsPaused(true);
      setTimeout(() => {
        setGameState('GAME_OVER');
        window.__gameState = 'GAME_OVER';
        if (onGameOver) onGameOver();
      }, 300);
    }
  }, [playerHealth, gameState, setGameState, onGameOver]);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "black", position: 'relative' }}>
      {notification && (
        <div style={{ position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)', background: notification.type === 'success' ? 'rgba(0,80,0,0.95)' : 'rgba(0,0,0,0.95)', border: `1px solid ${notification.type === 'success' ? '#4f4' : '#ff4444'}`, color: notification.type === 'success' ? '#4f4' : '#fff', padding: '12px 25px', borderRadius: 8, fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 600, zIndex: 300, backdropFilter: 'blur(10px)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', animation: 'fadeIn 0.3s ease' }}>
          {notification.text}
        </div>
      )}

      <Canvas shadows camera={{ fov: 65, near: 0.1, far: 1000, position: [0, 8, 15] }}
        onCreated={({ gl }) => { gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFSoftShadowMap; gl.setPixelRatio(Math.min(window.devicePixelRatio, 2)); gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = sceneBrightness; }}
      >
        <Suspense fallback={null}>
          <BrightnessController brightness={sceneBrightness} />
          <Sky sunPosition={sunPosition} turbidity={8} rayleigh={2} mieCoefficient={0.005} mieDirectionalG={0.7} />
          <Stars radius={500} depth={50} count={200} factor={3} saturation={0} fade />
          
          <ambientLight intensity={ambientIntensity} color="#8899aa" />
          <directionalLight position={sunPosition} intensity={dirLightIntensity} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-far={200} shadow-camera-left={-100} shadow-camera-right={100} shadow-camera-top={100} shadow-camera-bottom={-100} />
          <hemisphereLight args={['#88aacc', '#445566', 0.4 * sceneBrightness]} />
          
          <OpenWorldEnvironment playerPos={{x:0,y:0,z:0}} brightness={sceneBrightness} />
          
          <Player playerRef={playerRef} onFall={() => { setPlayerHealth(0); }} locked={isLocked} gamePaused={isPaused} />
          
          {gameState === 'PLAYING' && <ZombieManager playerRef={playerRef} difficulty={settings.difficulty || 'normal'} gamePaused={isPaused} />}
        </Suspense>
        {!isPaused && <PointerLockControls onUnlock={handleLock} onLock={handleUnlock} pointerSpeed={settings.sensitivity || 0.5} />}
      </Canvas>

      {gameState === 'PLAYING' && <HUD isPaused={isPaused} />}

      {showPauseMenu && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 200, fontFamily: "'Rajdhani', sans-serif", backdropFilter: 'blur(10px)' }}>
          <h2 style={{ color: '#ff4444', fontFamily: "'Orbitron', sans-serif", fontSize: 42, letterSpacing: 5, marginBottom: 35 }}>⏸ PAUSED</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 280 }}>
            <button onClick={() => { setIsPaused(false); setShowPauseMenu(false); }} style={ps}>▶ RESUME</button>
            <button onClick={() => { setGameState('SETTINGS'); window.__openSettings = true; }} style={ps}>⚙️ SETTINGS</button>
            <button onClick={() => { window.__gameState = 'MENU'; window.location.reload(); }} style={{...ps, borderColor: '#ff4444', color: '#ff4444'}}>🏠 MAIN MENU</button>
          </div>
        </div>
      )}

      <AudioSystem />
      {!isPaused && (
        <MobileControls onMove={(m) => { window.__mobileMove = m; }} onAction={(action, value) => {
          if (action === 'attack') document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter' }));
          else if (action === 'heal') document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyH' }));
          else if (action === 'reload') document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyR' }));
          else if (action === 'map') document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyM' }));
          else if (action === 'pause') { setIsPaused(true); setShowPauseMenu(true); }
          else if (action === 'weapon' && typeof value === 'number') document.dispatchEvent(new KeyboardEvent('keydown', { code: `Digit${value + 1}` }));
        }} />
      )}
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateX(-50%) translateY(-20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }`}</style>
    </div>
  );
}
const ps = { padding: '14px 30px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: '#ccc', borderRadius: 8, cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 600, letterSpacing: 2, transition: 'all 0.3s' };

// ============ DEATH SCREEN ============
function DeathScreen({ onRestart, onMainMenu }) {
  const { killCount, survivalTime, wave } = useGame();
  const [displayKills, setDisplayKills] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [bloodOpacity, setBloodOpacity] = useState(0);

  useEffect(() => {
    const bloodInterval = setInterval(() => { setBloodOpacity(prev => { if (prev >= 1) { clearInterval(bloodInterval); setTimeout(() => setShowContent(true), 500); return 1; } return prev + 0.03; }); }, 30);
    const killInterval = setInterval(() => { setDisplayKills(prev => { if (prev < killCount) return prev + 1; clearInterval(killInterval); return killCount; }); }, 40);
    return () => { clearInterval(bloodInterval); clearInterval(killInterval); };
  }, [killCount]);

  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${Math.floor(s%60).toString().padStart(2,'0')}`;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10000, fontFamily: "'Rajdhani', sans-serif", overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: '100%', height: '100%', background: bloodOpacity > 0 ? `radial-gradient(ellipse at 50% 50%, rgba(180,0,0,${bloodOpacity*0.7}) 0%, rgba(100,0,0,${bloodOpacity*0.4}) 40%, transparent 80%)` : 'none', transition: 'background 0.1s', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: '100%', height: '100%', background: bloodOpacity > 0.3 ? `radial-gradient(ellipse at 20% 30%, rgba(200,0,0,${bloodOpacity*0.3}) 0%, transparent 30%),radial-gradient(ellipse at 80% 60%, rgba(200,0,0,${bloodOpacity*0.25}) 0%, transparent 30%),radial-gradient(ellipse at 50% 80%, rgba(150,0,0,${bloodOpacity*0.2}) 0%, transparent 30%)` : 'none', pointerEvents: 'none' }} />
      <div style={{ fontSize: 80, animation: showContent ? 'pulse 2s ease-in-out infinite' : 'none', opacity: Math.min(1, bloodOpacity * 2), marginBottom: 15 }}>☠️🩸</div>
      {showContent && (<>
        <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 'clamp(32px, 6vw, 64px)', color: '#cc0000', textShadow: '0 0 50px rgba(255,0,0,0.5)', letterSpacing: 6, margin: 0, animation: 'fadeInUp 0.5s ease' }}>GAME OVER</h1>
        <div style={{ color: '#666', fontSize: 16, letterSpacing: 4, marginTop: 5, animation: 'fadeInUp 0.7s ease' }}>THE ZOMBIES CONSUMED YOU...</div>
        <div style={{ display: 'flex', gap: 25, marginTop: 30, marginBottom: 30, padding: '18px 30px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, animation: 'fadeInUp 0.9s ease' }}>
          <div style={{ textAlign: 'center' }}><div style={{ color: '#ff4444', fontSize: 28, fontWeight: 700 }}>{displayKills}</div><div style={{ color: '#555', fontSize: 10, letterSpacing: 2, marginTop: 4 }}>KILLS</div></div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ textAlign: 'center' }}><div style={{ color: '#ffaa44', fontSize: 28, fontWeight: 700 }}>{formatTime(survivalTime)}</div><div style={{ color: '#555', fontSize: 10, letterSpacing: 2, marginTop: 4 }}>TIME</div></div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ textAlign: 'center' }}><div style={{ color: '#44aaff', fontSize: 28, fontWeight: 700 }}>Wave {wave}</div><div style={{ color: '#555', fontSize: 10, letterSpacing: 2, marginTop: 4 }}>WAVE</div></div>
        </div>
        <div style={{ display: 'flex', gap: 15, animation: 'fadeInUp 1.1s ease' }}>
          <button onClick={onRestart} style={{ padding: '14px 35px', background: 'rgba(255,0,0,0.2)', border: '1px solid #ff4444', color: '#ff4444', borderRadius: 6, cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>🔄 PLAY AGAIN</button>
          <button onClick={onMainMenu} style={{ padding: '14px 35px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#ccc', borderRadius: 6, cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>🏠 MAIN MENU</button>
        </div>
      </>)}
      <style>{`@keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.05); opacity: 1; } } @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

// ============ APP ============
export default function App() {
  const [showLoading, setShowLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [showDeath, setShowDeath] = useState(false);
  const [gameKey, setGameKey] = useState(0);

  const handleLoadingComplete = useCallback(() => { setShowLoading(false); setShowMenu(true); }, []);
  const handleStartGame = useCallback(() => { setShowMenu(false); setShowGame(true); setShowDeath(false); }, []);

  const handleRestart = useCallback(() => {
    window.__gameState = 'PLAYING';
    setShowDeath(false);
    setGameKey(prev => prev + 1);
    setShowGame(true);
  }, []);

  const handleMainMenu = useCallback(() => {
    window.__gameState = 'MENU';
    setShowDeath(false);
    setShowMenu(true);
  }, []);

  // Detect GAME_OVER from inside Canvas
  useEffect(() => {
    const checkState = setInterval(() => {
      const gs = window.__gameState;
      if (gs === 'GAME_OVER') {
        window.__gameState = null;
        setShowGame(false);
        setShowDeath(true);
      }
    }, 100);
    return () => clearInterval(checkState);
  }, []);

  return (
    <GameProvider key={gameKey}>
      {showLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
      {showMenu && <MainMenu onStartGame={handleStartGame} />}
      {showGame && <GameScene onGameOver={() => { setShowGame(false); setShowDeath(true); }} />}
      {showDeath && <DeathScreen onRestart={handleRestart} onMainMenu={handleMainMenu} />}
    </GameProvider>
  );
}