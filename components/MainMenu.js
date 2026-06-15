
'use client';
import { useState, useEffect, useRef } from 'react';
import { useGame, GameState } from '../hooks/useGameState';

export default function MainMenu({ onStartGame }) {
  const { setGameState, settings } = useGame();
  const [selectedOption, setSelectedOption] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showMissions, setShowMissions] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const canvasRef = useRef(null);

  // Keep welcome music playing on menu (it continues from loading screen)
  // Only stop it when player clicks START GAME
  useEffect(() => {
    return () => {
      // When menu unmounts (game starts), stop welcome music
      if (window.__welcomeMusic) {
        window.__welcomeMusic.pause();
        window.__welcomeMusic = null;
      }
    };
  }, []);

  const menuOptions = [
    { name: 'NEW GAME', action: () => { onStartGame(); setGameState('PLAYING'); } },
    
    { name: 'SHOP', action: () => setShowShop(true) },
    { name: 'MISSIONS', action: () => setShowMissions(true) },
    { name: 'SETTINGS', action: () => setShowSettings(true) },
    { name: 'HELP', action: () => setShowHelp(true) },
    { name: 'CREDITS', action: () => setShowCredits(true) },
  ];

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        setSelectedOption(prev => (prev > 0 ? prev - 1 : menuOptions.length - 1));
      }
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        setSelectedOption(prev => (prev < menuOptions.length - 1 ? prev + 1 : 0));
      }
      if (e.code === 'Enter' || e.code === 'Space') {
        menuOptions[selectedOption].action();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedOption]);

  if (showSettings) return <SettingsPanel onBack={() => setShowSettings(false)} />;
  if (showMissions) return <MissionsPanel onBack={() => setShowMissions(false)} />;
  if (showShop) return <ShopPanel onBack={() => setShowShop(false)} />;
  if (showCredits) return <CreditsPanel onBack={() => setShowCredits(false)} />;
  if (showHelp) return <HelpPanel onBack={() => setShowHelp(false)} />;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'linear-gradient(135deg, #0d0d0d 0%, #1a0505 30%, #0d0d0d 60%, #050505 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      overflow: 'hidden',
    }}>
      {/* Blood drip effects */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(ellipse at 50% 0%, rgba(100,0,0,0.3) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* Title */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 50,
        position: 'relative',
      }}>
        <div style={{
          fontSize: 60,
          marginBottom: 5,
          animation: 'float 4s ease-in-out infinite',
        }}>
          ☣️
        </div>
        <h1 style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: 'clamp(32px, 6vw, 64px)',
          fontWeight: 900,
          background: 'linear-gradient(180deg, #ff4444 0%, #cc0000 50%, #660000 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 0 60px rgba(255,0,0,0.3)',
          letterSpacing: 3,
          margin: 0,
          lineHeight: 1.1,
          textAlign: 'center',
        }}>
          ZOMBIE APOCALYPSE
        </h1>
        <div style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: 'clamp(16px, 2.5vw, 28px)',
          color: '#553',
          letterSpacing: 10,
          marginTop: 5,
        }}>
          LAST STAND
        </div>
        <div style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: 'clamp(12px, 1.5vw, 18px)',
          color: '#333',
          letterSpacing: 5,
          marginTop: 10,
          borderBottom: '1px solid #222',
          paddingBottom: 10,
        }}>
          SURVIVE. FIGHT. ESCAPE.
        </div>
      </div>

      {/* Menu Options with dark backgrounds */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        width: 'min(380px, 80vw)',
        position: 'relative',
      }}>
        {menuOptions.map((option, index) => (
          <div
            key={index}
            onClick={option.action}
            onMouseEnter={() => setSelectedOption(index)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '14px 20px',
              cursor: 'pointer',
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 'clamp(16px, 2vw, 22px)',
              fontWeight: 600,
              letterSpacing: 3,
              color: selectedOption === index ? '#ff4444' : '#888',
              background: selectedOption === index 
                ? 'linear-gradient(135deg, rgba(255,0,0,0.15) 0%, rgba(255,0,0,0.05) 100%)'
                : 'rgba(0,0,0,0.6)',
              border: selectedOption === index 
                ? '1px solid rgba(255,0,0,0.4)'
                : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 6,
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              position: 'relative',
              backdropFilter: 'blur(5px)',
              transform: selectedOption === index ? 'scale(1.02)' : 'scale(1)',
            }}
          >
            {selectedOption === index && (
              <span style={{
                position: 'absolute',
                left: 12,
                color: '#ff0000',
                fontSize: 12,
              }}>▶</span>
            )}
            {option.name}
          </div>
        ))}
      </div>

      {/* Controls hint */}
      <div style={{
        position: 'absolute',
        bottom: 30,
        display: 'flex',
        gap: 20,
        left: 60,
        color: '#333',
        fontFamily: "'Rajdhani', sans-serif",
        fontSize: 12,
        letterSpacing: 1,
      }}>
        <span>↑↓ NAVIGATE</span>
        <span>|</span>
        <span>ENTER SELECT</span>
        <span>|</span>
        <span>ESC BACK</span>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}

function SettingsPanel({ onBack }) {
  const { settings, setSettings } = useGame();
  const [activeTab, setActiveTab] = useState('display');
  const [localSettings, setLocalSettings] = useState({ ...settings });

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === 'Escape') { onBack(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onBack]);

  const saveSettings = () => {
    setSettings(localSettings);
  };

  const tabs = [
    { id: 'display', name: 'DISPLAY' },
    { id: 'audio', name: 'AUDIO' },
    { id: 'controls', name: 'CONTROLS' },
    { id: 'game', name: 'GAME' },
  ];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0505 50%, #0a0a0a 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center',
      zIndex: 10001, padding: '30px 0',
      overflow: 'auto',
    }}>
      <h2 style={{ fontFamily: "'Orbitron', sans-serif", color: '#ff4444', fontSize: 32, marginBottom: 20, letterSpacing: 3 }}>
        ⚙️ SETTINGS
      </h2>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 25, flexWrap: 'wrap', justifyContent: 'center' }}>
        {tabs.map(tab => (
          <div key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: '10px 22px',
            background: activeTab === tab.id ? 'rgba(255,0,0,0.2)' : 'rgba(0,0,0,0.6)',
            border: `1px solid ${activeTab === tab.id ? '#ff4444' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: 6, cursor: 'pointer',
            color: activeTab === tab.id ? '#ff4444' : '#888',
            fontFamily: "'Rajdhani', sans-serif", fontSize: 15, fontWeight: 600,
            letterSpacing: 2, transition: 'all 0.3s',
          }}>
            {tab.name}
          </div>
        ))}
      </div>

      <div style={{ width: 'min(500px, 85vw)', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* DISPLAY TAB */}
        {activeTab === 'display' && (
          <>
            <div style={{ color: '#ff4444', fontFamily: "'Orbitron', sans-serif", fontSize: 14, letterSpacing: 2, marginBottom: 5 }}>DISPLAY SETTINGS</div>
            <SettingSlider label="BRIGHTNESS" value={localSettings.brightness || 1.0} onChange={(v) => setLocalSettings(prev => ({ ...prev, brightness: v }))} min={0.3} max={1.5} step={0.1} />
            <SettingSlider label="CONTRAST" value={localSettings.contrast || 1.0} onChange={(v) => setLocalSettings(prev => ({ ...prev, contrast: v }))} min={0.5} max={1.5} step={0.1} />
            <SettingSelect label="QUALITY" value={localSettings.quality} options={['low', 'medium', 'high', 'ultra']} onChange={(v) => setLocalSettings(prev => ({ ...prev, quality: v }))} />
            <SettingSelect label="SHADOW QUALITY" value={localSettings.shadowQuality || 'high'} options={['off', 'low', 'medium', 'high']} onChange={(v) => setLocalSettings(prev => ({ ...prev, shadowQuality: v }))} />
            <SettingSelect label="ANTI-ALIASING" value={localSettings.aa || 'on'} options={['off', 'on']} onChange={(v) => setLocalSettings(prev => ({ ...prev, aa: v }))} />
            <SettingSelect label="TEXTURE QUALITY" value={localSettings.textureQuality || 'high'} options={['low', 'medium', 'high']} onChange={(v) => setLocalSettings(prev => ({ ...prev, textureQuality: v }))} />
            <SettingToggle label="SHOW FPS" value={localSettings.showFPS} onChange={(v) => setLocalSettings(prev => ({ ...prev, showFPS: v }))} />
            <SettingToggle label="SHOW MINIMAP" value={localSettings.showMinimap !== false} onChange={(v) => setLocalSettings(prev => ({ ...prev, showMinimap: v }))} />
            <SettingToggle label="VSYNC" value={localSettings.vsync !== false} onChange={(v) => setLocalSettings(prev => ({ ...prev, vsync: v }))} />
          </>
        )}

        {/* AUDIO TAB */}
        {activeTab === 'audio' && (
          <>
            <div style={{ color: '#ff4444', fontFamily: "'Orbitron', sans-serif", fontSize: 14, letterSpacing: 2, marginBottom: 5 }}>AUDIO SETTINGS</div>
            <SettingSlider label="MASTER VOLUME" value={localSettings.masterVolume !== undefined ? localSettings.masterVolume : 1.0} onChange={(v) => setLocalSettings(prev => ({ ...prev, masterVolume: v }))} />
            <SettingSlider label="MUSIC VOLUME" value={localSettings.musicVolume} onChange={(v) => setLocalSettings(prev => ({ ...prev, musicVolume: v }))} />
            <SettingSlider label="SFX VOLUME" value={localSettings.sfxVolume} onChange={(v) => setLocalSettings(prev => ({ ...prev, sfxVolume: v }))} />
            <SettingSlider label="AMBIENT VOLUME" value={localSettings.ambientVolume || 0.5} onChange={(v) => setLocalSettings(prev => ({ ...prev, ambientVolume: v }))} />
            <SettingSlider label="VOICE VOLUME" value={localSettings.voiceVolume || 0.8} onChange={(v) => setLocalSettings(prev => ({ ...prev, voiceVolume: v }))} />
            <SettingToggle label="AMBIENT SOUNDS" value={localSettings.ambientSounds !== false} onChange={(v) => setLocalSettings(prev => ({ ...prev, ambientSounds: v }))} />
            <SettingToggle label="ZOMBIE GROANS" value={localSettings.zombieGroans !== false} onChange={(v) => setLocalSettings(prev => ({ ...prev, zombieGroans: v }))} />
            <SettingToggle label="FOOTSTEPS" value={localSettings.footsteps !== false} onChange={(v) => setLocalSettings(prev => ({ ...prev, footsteps: v }))} />
          </>
        )}

        {/* CONTROLS TAB */}
        {activeTab === 'controls' && (
          <>
            <div style={{ color: '#ff4444', fontFamily: "'Orbitron', sans-serif", fontSize: 14, letterSpacing: 2, marginBottom: 5 }}>CONTROLS SETTINGS</div>
            <SettingSlider label="MOUSE SENSITIVITY" value={localSettings.sensitivity} onChange={(v) => setLocalSettings(prev => ({ ...prev, sensitivity: v }))} min={0.1} max={2.0} step={0.05} />
            <SettingSlider label="CONTROLLER DEADZONE" value={localSettings.deadzone || 0.2} onChange={(v) => setLocalSettings(prev => ({ ...prev, deadzone: v }))} min={0.05} max={0.5} step={0.05} />
            <SettingToggle label="INVERT Y AXIS" value={localSettings.invertY} onChange={(v) => setLocalSettings(prev => ({ ...prev, invertY: v }))} />
            <SettingToggle label="TOGGLE CROUCH" value={localSettings.toggleCrouch || false} onChange={(v) => setLocalSettings(prev => ({ ...prev, toggleCrouch: v }))} />
            <SettingToggle label="AUTO AIM" value={localSettings.autoAim || false} onChange={(v) => setLocalSettings(prev => ({ ...prev, autoAim: v }))} />
            <SettingToggle label="VIBRATION" value={localSettings.vibration !== false} onChange={(v) => setLocalSettings(prev => ({ ...prev, vibration: v }))} />
            <div style={{ marginTop: 15, padding: '15px 20px', background: 'rgba(0,0,0,0.4)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ color: '#888', fontFamily: "'Rajdhani', sans-serif", fontSize: 14, marginBottom: 10, letterSpacing: 1 }}>
                ⌨️ KEYBOARD CONTROLS
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 30px', color: '#666', fontFamily: "'Rajdhani', sans-serif", fontSize: 13 }}>
                <span>WASD - Move</span>
                <span>Mouse - Look Around</span>
                <span>1-8 - Switch Weapons</span>
                <span>R - Reload</span>
                <span>H - Use Medkit</span>
                <span>M - Toggle Map</span>
                <span>Enter - Attack</span>
                <span>Space - Jump</span>
                <span>ESC - Pause</span>
                <span>Shift - Sprint</span>
              </div>
            </div>
          </>
        )}

        {/* GAME TAB */}
        {activeTab === 'game' && (
          <>
            <div style={{ color: '#ff4444', fontFamily: "'Orbitron', sans-serif", fontSize: 14, letterSpacing: 2, marginBottom: 5 }}>GAME SETTINGS</div>
            <SettingSelect label="DIFFICULTY" value={localSettings.difficulty || 'normal'} options={['easy', 'normal', 'hard', 'nightmare']} onChange={(v) => setLocalSettings(prev => ({ ...prev, difficulty: v }))} />
            <SettingToggle label="BLOOD EFFECTS" value={localSettings.bloodEffects !== false} onChange={(v) => setLocalSettings(prev => ({ ...prev, bloodEffects: v }))} />
            <SettingToggle label="GORE" value={localSettings.gore || false} onChange={(v) => setLocalSettings(prev => ({ ...prev, gore: v }))} />
            <SettingToggle label="HIT INDICATORS" value={localSettings.hitIndicators !== false} onChange={(v) => setLocalSettings(prev => ({ ...prev, hitIndicators: v }))} />
            <SettingToggle label="DAMAGE NUMBERS" value={localSettings.damageNumbers || false} onChange={(v) => setLocalSettings(prev => ({ ...prev, damageNumbers: v }))} />
            <SettingToggle label="AUTO PICKUP" value={localSettings.autoPickup !== false} onChange={(v) => setLocalSettings(prev => ({ ...prev, autoPickup: v }))} />
            <SettingToggle label="DAY/NIGHT CYCLE" value={localSettings.dayNightCycle || false} onChange={(v) => setLocalSettings(prev => ({ ...prev, dayNightCycle: v }))} />
            <SettingToggle label="SUBTITLES" value={localSettings.subtitles || false} onChange={(v) => setLocalSettings(prev => ({ ...prev, subtitles: v }))} />
          </>
        )}
      </div>

      <div style={{ display: 'flex', gap: 15, marginTop: 30 }}>
        <button onClick={() => { saveSettings(); onBack(); }} style={{
          padding: '12px 35px',
          background: 'rgba(255,0,0,0.2)',
          border: '1px solid #ff4444',
          color: '#ff4444',
          borderRadius: 6, cursor: 'pointer',
          fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 600, letterSpacing: 2,
        }}>
          SAVE & BACK
        </button>
        <button onClick={onBack} style={{
          padding: '12px 35px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: '#ccc',
          borderRadius: 6, cursor: 'pointer',
          fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 600, letterSpacing: 2,
        }}>
          CANCEL [ESC]
        </button>
      </div>
    </div>
  );
}

function SettingSlider({ label, value, onChange, min = 0, max = 1, step = 0.01 }) {
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontFamily: "'Rajdhani', sans-serif", fontSize: 14, marginBottom: 5 }}>
        <span>{label}</span>
        <span>{typeof value === 'number' ? Math.round(value * 100) + '%' : value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: '#ff4444', cursor: 'pointer' }}
      />
    </div>
  );
}

function SettingSelect({ label, value, options, onChange }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#888', fontFamily: "'Rajdhani', sans-serif", fontSize: 14 }}>
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        style={{
          background: '#111', color: '#ccc', border: '1px solid #333',
          padding: '6px 12px', borderRadius: 4, fontFamily: "'Rajdhani', sans-serif", fontSize: 14, cursor: 'pointer',
        }}>
        {options.map(o => <option key={o} value={o}>{o.toUpperCase()}</option>)}
      </select>
    </div>
  );
}

function SettingToggle({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#888', fontFamily: "'Rajdhani', sans-serif", fontSize: 14 }}>
      <span>{label}</span>
      <div onClick={() => onChange(!value)} style={{
        width: 50, height: 26, borderRadius: 13,
        background: value ? '#ff4444' : '#333',
        cursor: 'pointer', position: 'relative',
        transition: 'background 0.3s',
      }}>
        <div style={{
          width: 22, height: 22, borderRadius: 11,
          background: 'white', position: 'absolute',
          top: 2, left: value ? 26 : 2,
          transition: 'left 0.3s',
        }} />
      </div>
    </div>
  );
}

function MissionsPanel({ onBack }) {
  const { currentMissions, inventory } = useGame();
  
  useEffect(() => {
    const handleKey = (e) => e.code === 'Escape' && onBack();
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onBack]);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0505 50%, #0a0a0a 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 10001,
    }}>
      <h2 style={{ fontFamily: "'Orbitron', sans-serif", color: '#ff4444', fontSize: 32, marginBottom: 10, letterSpacing: 3 }}>
        MISSIONS
      </h2>
      <div style={{ color: '#666', fontFamily: "'Rajdhani', sans-serif", fontSize: 14, marginBottom: 25 }}>
        Complete missions to earn rewards
      </div>
      <div style={{ width: 'min(500px, 85vw)', maxHeight: '60vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {currentMissions.map(m => (
          <div key={m.id} style={{
            padding: '12px 15px',
            background: m.completed ? 'rgba(0,255,0,0.08)' : 'rgba(0,0,0,0.5)',
            border: `1px solid ${m.completed ? 'rgba(0,255,0,0.25)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 6,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ color: m.completed ? '#4f4' : '#ccc', fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 600 }}>
                {m.completed ? '✅ ' : '⬜ '}{m.name}
              </div>
              <div style={{ color: '#666', fontFamily: "'Rajdhani', sans-serif", fontSize: 13 }}>
                {m.description}
              </div>
            </div>
            <div style={{ color: '#ffcc00', fontFamily: "'Rajdhani', sans-serif", fontSize: 14, whiteSpace: 'nowrap', marginLeft: 10 }}>
              {m.completed ? 'COMPLETED' : `+$${m.reward}`}
            </div>
          </div>
        ))}
      </div>
      <button onClick={onBack} style={{
        marginTop: 30, padding: '12px 40px',
        background: 'rgba(0,0,0,0.6)', border: '1px solid #ff4444',
        color: '#ff4444', fontFamily: "'Rajdhani', sans-serif",
        fontSize: 18, letterSpacing: 3, cursor: 'pointer',
        borderRadius: 6, transition: 'all 0.3s',
      }} onMouseEnter={(e) => e.target.style.background = 'rgba(255,0,0,0.2)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(0,0,0,0.6)'}>
        BACK [ESC]
      </button>
    </div>
  );
}

function ShopPanel({ onBack }) {
  const { inventory, buyWeapon, buyAmmo, buyEquipment } = useGame();
  const [selectedTab, setSelectedTab] = useState('weapons');

  useEffect(() => {
    const handleKey = (e) => e.code === 'Escape' && onBack();
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onBack]);

  const filteredWeapons = inventory.weapons.filter(w => !w.unlocked);
  const unlockedCount = inventory.weapons.filter(w => w.unlocked).length;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0505 50%, #0a0a0a 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center',
      zIndex: 10001,
      padding: '30px 0',
    }}>
      <h2 style={{ fontFamily: "'Orbitron', sans-serif", color: '#ff4444', fontSize: 32, marginBottom: 5, letterSpacing: 3 }}>
        🛒 SHOP
      </h2>
      <div style={{ color: '#ffcc00', fontFamily: "'Rajdhani', sans-serif", fontSize: 22, marginBottom: 15 }}>
        💰 ${inventory.money}
      </div>
      
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {['weapons', 'equipment', 'ammo'].map(tab => (
          <div key={tab} onClick={() => setSelectedTab(tab)} style={{
            padding: '8px 20px',
            background: selectedTab === tab ? 'rgba(255,0,0,0.2)' : 'rgba(0,0,0,0.5)',
            border: `1px solid ${selectedTab === tab ? '#ff4444' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: 6, cursor: 'pointer',
            color: selectedTab === tab ? '#ff4444' : '#888',
            fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 600,
            letterSpacing: 2, textTransform: 'uppercase', transition: 'all 0.3s',
          }}>{tab}</div>
        ))}
      </div>

      <div style={{ width: 'min(500px, 85vw)', maxHeight: '55vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {selectedTab === 'weapons' && filteredWeapons.map(w => (
          <div key={w.id} style={{
            padding: '12px 15px',
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 6,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ color: '#ccc', fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 600 }}>
                {w.icon} {w.name}
              </div>
              <div style={{ color: '#666', fontFamily: "'Rajdhani', sans-serif", fontSize: 12 }}>
                DMG: {w.damage} | Range: {w.range}m | Type: {w.type} | Rate: {w.fireRate}ms
              </div>
            </div>
            <button onClick={() => buyWeapon(w.id)} style={{
              padding: '8px 18px',
              background: inventory.money >= w.price ? 'rgba(255,0,0,0.3)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${inventory.money >= w.price ? '#ff4444' : '#333'}`,
              color: inventory.money >= w.price ? '#ff4444' : '#555',
              borderRadius: 4, cursor: inventory.money >= w.price ? 'pointer' : 'default',
              fontFamily: "'Rajdhani', sans-serif", fontSize: 14, fontWeight: 700,
              transition: 'all 0.3s',
            }}>
              ${w.price}
            </button>
          </div>
        ))}

        {selectedTab === 'equipment' && (
          <>
            <ShopItem name=" Body Armor" desc="Reduces all damage by 30%" price={1000} onBuy={() => buyEquipment('armor', 1000, 1)} />
            <ShopItem name=" Medkit" desc="Restores 50HP instantly" price={200} onBuy={() => buyEquipment('medkits', 200, 1)} />
            <ShopItem name=" Frag Grenade" desc="Deals massive AOE damage" price={300} onBuy={() => buyEquipment('grenades', 300, 1)} />
            <ShopItem name=" Throwing Knife" desc="Silent ranged attack" price={150} onBuy={() => buyEquipment('throwingKnife', 150, 3)} />
            <ShopItem name=" Flashbang" desc="Stuns zombies temporarily" price={250} onBuy={() => buyEquipment('flashbangs', 250, 2)} />
          </>
        )}

        {selectedTab === 'ammo' && inventory.weapons.filter(w => w.unlocked && w.type === 'ranged').map(w => (
          <div key={w.id} style={{
            padding: '12px 15px',
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 6,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ color: '#ccc', fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 600 }}>
                {w.icon} {w.name}
              </div>
              <div style={{ color: '#666', fontFamily: "'Rajdhani', sans-serif", fontSize: 12 }}>
                Ammo: {w.ammo}/{w.maxAmmo} | Refill: 50%
              </div>
            </div>
            <button onClick={() => buyAmmo(w.id)} style={{
              padding: '8px 18px',
              background: inventory.money >= 50 ? 'rgba(255,0,0,0.3)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${inventory.money >= 50 ? '#ff4444' : '#333'}`,
              color: inventory.money >= 50 ? '#ff4444' : '#555',
              borderRadius: 4, cursor: inventory.money >= 50 ? 'pointer' : 'default',
              fontFamily: "'Rajdhani', sans-serif", fontSize: 14, fontWeight: 700,
            }}>
              REFILL ($50)
            </button>
          </div>
        ))}
      </div>

      <div style={{ color: '#555', fontFamily: "'Rajdhani', sans-serif", fontSize: 12, marginTop: 15 }}>
        Weapons Unlocked: {unlockedCount}/9
      </div>

      <button onClick={onBack} style={{
        marginTop: 15, padding: '12px 40px',
        background: 'rgba(0,0,0,0.6)', border: '1px solid #ff4444',
        color: '#ff4444', fontFamily: "'Rajdhani', sans-serif",
        fontSize: 18, letterSpacing: 3, cursor: 'pointer',
        borderRadius: 6, transition: 'all 0.3s',
      }} onMouseEnter={(e) => e.target.style.background = 'rgba(255,0,0,0.2)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(0,0,0,0.6)'}>
        BACK [ESC]
      </button>
    </div>
  );
}

function ShopItem({ name, desc, price, onBuy }) {
  const { inventory } = useGame();
  return (
    <div style={{
      padding: '12px 15px',
      background: 'rgba(0,0,0,0.5)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 6,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <div>
        <div style={{ color: '#ccc', fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 600 }}>
          {name}
        </div>
        <div style={{ color: '#666', fontFamily: "'Rajdhani', sans-serif", fontSize: 12 }}>
          {desc}
        </div>
      </div>
      <button onClick={onBuy} style={{
        padding: '8px 18px',
        background: inventory.money >= price ? 'rgba(255,0,0,0.3)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${inventory.money >= price ? '#ff4444' : '#333'}`,
        color: inventory.money >= price ? '#ff4444' : '#555',
        borderRadius: 4, cursor: inventory.money >= price ? 'pointer' : 'default',
        fontFamily: "'Rajdhani', sans-serif", fontSize: 14, fontWeight: 700,
      }}>
        ${price}
      </button>
    </div>
  );
}

function HelpPanel({ onBack }) {
  useEffect(() => {
    const handleKey = (e) => e.code === 'Escape' && onBack();
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onBack]);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0505 50%, #0a0a0a 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 10001, padding: '20px',
    }}>
      <h2 style={{ fontFamily: "'Orbitron', sans-serif", color: '#ff4444', fontSize: 32, marginBottom: 25, letterSpacing: 3 }}>
        ❓ HELP
      </h2>
      
      <div style={{ width: 'min(550px, 85vw)', maxHeight: '65vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 15 }}>
        <HelpSection title=" HOW TO PLAY" content="Survive the zombie apocalypse! Kill zombies to earn money, complete missions for bonus rewards, and buy better weapons and equipment from the shop. Each wave gets harder - be prepared!" />
        <HelpSection title="⌨ KEYBOARD CONTROLS" content="WASD - Move | Mouse - Look | 1-8 - Weapon Switch | R - Reload | H - Medkit | M - Map | Enter - Attack | Space - Jump | Shift - Sprint | ESC - Pause" />
        <HelpSection title=" MOBILE CONTROLS" content="Left joystick - Move | Right buttons - Attack/Reload/Heal | Bottom bar - Switch weapons | Top right - Map & Pause" />
        <HelpSection title=" WEAPONS" content="Use [1-8] to switch weapons. Ranged weapons need ammo - press [R] to reload. Melee weapons never run out of ammo! Headshots deal 3x damage." />
        <HelpSection title=" HEALTH & ARMOR" content="Your health is shown at the top left. Use Medkits [H] to restore 50HP. Armor reduces damage by 30%. Buy both from the shop." />
        <HelpSection title=" ECONOMY" content="Kill zombies for money ($10-40 each). Complete waves for bonuses. Complete missions for large rewards. Spend wisely on weapons, ammo, and equipment." />
        <HelpSection title=" WORLD" content="Explore the open world! Find supply drops, search buildings, collect items from the ground. The map [M] shows key locations." />
        <HelpSection title=" DYING" content="When your health reaches 0, you die and lose everything. Try to survive as long as possible! Use Medkits before it's too late." />
      </div>
      
      <button onClick={onBack} style={{
        marginTop: 25, padding: '12px 40px',
        background: 'rgba(0,0,0,0.6)', border: '1px solid #ff4444',
        color: '#ff4444', fontFamily: "'Rajdhani', sans-serif",
        fontSize: 18, letterSpacing: 3, cursor: 'pointer',
        borderRadius: 6, transition: 'all 0.3s',
      }} onMouseEnter={(e) => e.target.style.background = 'rgba(255,0,0,0.2)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(0,0,0,0.6)'}>
        BACK [ESC]
      </button>
    </div>
  );
}

function HelpSection({ title, content }) {
  return (
    <div style={{
      padding: '12px 15px',
      background: 'rgba(0,0,0,0.5)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 6,
    }}>
      <div style={{ color: '#ff4444', fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 600, marginBottom: 5 }}>
        {title}
      </div>
      <div style={{ color: '#888', fontFamily: "'Rajdhani', sans-serif", fontSize: 14, lineHeight: 1.5 }}>
        {content}
      </div>
    </div>
  );
}

function CreditsPanel({ onBack }) {
  useEffect(() => {
    const handleKey = (e) => e.code === 'Escape' && onBack();
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onBack]);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0505 50%, #0a0a0a 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 10001,
    }}>
      <h2 style={{ fontFamily: "'Orbitron', sans-serif", color: '#ff4444', fontSize: 32, marginBottom: 30, letterSpacing: 3 }}>
        CREDITS
      </h2>
      <div style={{ textAlign: 'center', lineHeight: 2.2 }}>
        <div style={{ color: '#ff4444', fontFamily: "'Orbitron', sans-serif", fontSize: 20 }}>ZOMBIE APOCALYPSE: LAST STAND</div>
        <div style={{ color: '#888', fontFamily: "'Rajdhani', sans-serif", fontSize: 16 }}>A 3D Open World Survival Game</div>
        <br />
        <div style={{ color: '#ccc', fontFamily: "'Rajdhani', sans-serif", fontSize: 18 }}>
          Designed by <span style={{ color: '#ff4444', fontWeight: 700 }}>Dhurgham Alsaadi</span>
        </div>
        <div style={{ color: '#555', fontFamily: "'Rajdhani', sans-serif", fontSize: 14 }}>© 2026 All Rights Reserved</div>
        <br />
        <div style={{ color: '#555', fontFamily: "'Rajdhani', sans-serif", fontSize: 13 }}>
          Built with Three.js / React Three Fiber<br />
          Next.js Platform<br />
          Web Audio API
        </div>
        <br />
        <div style={{ color: '#444', fontFamily: "'Rajdhani', sans-serif", fontSize: 12 }}>
          Special thanks to the open source community<br />
          and all zombie survival fans!
        </div>
      </div>
      <button onClick={onBack} style={{
        marginTop: 30, padding: '12px 40px',
        background: 'rgba(0,0,0,0.6)', border: '1px solid #ff4444',
        color: '#ff4444', fontFamily: "'Rajdhani', sans-serif",
        fontSize: 18, letterSpacing: 3, cursor: 'pointer',
        borderRadius: 6, transition: 'all 0.3s',
      }} onMouseEnter={(e) => e.target.style.background = 'rgba(255,0,0,0.2)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(0,0,0,0.6)'}>
        BACK [ESC]
      </button>
    </div>
  );
}