import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

// Game State Management
const GameState = {
  LOADING: 'LOADING',
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAME_OVER: 'GAME_OVER',
  VICTORY: 'VICTORY',
  SHOP: 'SHOP',
  SETTINGS: 'SETTINGS',
};

const initialInventory = {
  weapons: [
    { id: 'fist', name: 'Fists', damage: 15, range: 2, ammo: Infinity, maxAmmo: Infinity, type: 'melee', fireRate: 400, unlocked: true, price: 0, icon: '' },
    { id: 'pistol', name: 'Pistol', damage: 25, range: 30, ammo: 60, maxAmmo: 60, type: 'ranged', fireRate: 300, unlocked: true, price: 0, icon: '' },
    { id: 'shotgun', name: 'Shotgun', damage: 50, range: 20, ammo: 30, maxAmmo: 30, type: 'ranged', fireRate: 800, unlocked: false, price: 2000, icon: '' },
    { id: 'rifle', name: 'Assault Rifle', damage: 35, range: 60, ammo: 120, maxAmmo: 120, type: 'ranged', fireRate: 150, unlocked: false, price: 3500, icon: '' },
    { id: 'sniper', name: 'Sniper Rifle', damage: 100, range: 100, ammo: 15, maxAmmo: 15, type: 'ranged', fireRate: 1000, unlocked: false, price: 5000, icon: '' },
    { id: 'smg', name: 'SMG', damage: 18, range: 35, ammo: 90, maxAmmo: 90, type: 'ranged', fireRate: 100, unlocked: false, price: 2800, icon: '' },
    { id: 'bat', name: 'Baseball Bat', damage: 30, range: 3, ammo: Infinity, maxAmmo: Infinity, type: 'melee', fireRate: 600, unlocked: false, price: 500, icon: '' },
    { id: 'knife', name: 'Combat Knife', damage: 20, range: 2, ammo: Infinity, maxAmmo: Infinity, type: 'melee', fireRate: 200, unlocked: false, price: 300, icon: '' },
    { id: 'sword', name: 'Katana Sword', damage: 45, range: 3.5, ammo: Infinity, maxAmmo: Infinity, type: 'melee', fireRate: 500, unlocked: false, price: 2000, icon: '' },
    { id: 'rpg', name: 'RPG', damage: 200, range: 50, ammo: 6, maxAmmo: 6, type: 'ranged', fireRate: 2000, unlocked: false, price: 8000, icon: '' },
  ],
  equipment: {
    armor: 0,
    medkits: 2,
    grenades: 0,
    throwingKnife: 0,
    flashbangs: 0,
  },
  bag: [],
  money: 0,
};

const missions = [
  { id: 1, name: 'First Blood', description: 'Kill 5 zombies', target: 5, type: 'kill', reward: 500, completed: false },
  { id: 2, name: 'Survivor', description: 'Survive 3 minutes', target: 180, type: 'time', reward: 1000, completed: false },
  { id: 3, name: 'Zombie Hunter', description: 'Kill 25 zombies', target: 25, type: 'kill', reward: 2000, completed: false },
  { id: 4, name: 'Weapon Collector', description: 'Buy 3 weapons', target: 3, type: 'weapons', reward: 1500, completed: false },
  { id: 5, name: 'Massacre', description: 'Kill 50 zombies', target: 50, type: 'kill', reward: 5000, completed: false },
  { id: 6, name: 'Veteran', description: 'Survive 10 minutes', target: 600, type: 'time', reward: 10000, completed: false },
  { id: 7, name: 'Headhunter', description: 'Kill 100 zombies', target: 100, type: 'kill', reward: 15000, completed: false },
  { id: 8, name: 'Last Stand', description: 'Survive 20 minutes and kill 200 zombies', target: 1, type: 'final', reward: 50000, completed: false },
];

export { GameState, initialInventory, missions };

export const GameContext = createContext();

export function GameProvider({ children }) {
  const [gameState, setGameState] = useState(GameState.LOADING);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [maxHealth, setMaxHealth] = useState(100);
  const [zombieCount, setZombieCount] = useState(0);
  const [killCount, setKillCount] = useState(0);
  const [survivalTime, setSurvivalTime] = useState(0);
  const [inventory, setInventory] = useState(initialInventory);
  const [currentWeapon, setCurrentWeapon] = useState(0);
  const [currentMissions, setCurrentMissions] = useState(missions);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [wave, setWave] = useState(1);
  const [difficulty, setDifficulty] = useState('normal');
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0, z: 0 });
  const [showTips, setShowTips] = useState(true);
  const [gameTime, setGameTime] = useState(0);
  const [isReloading, setIsReloading] = useState(false);
  const [activeVehicle, setActiveVehicle] = useState(null);
  const [unlockedAreas, setUnlockedAreas] = useState(['spawn']);
  const [achievements, setAchievements] = useState([]);
  const [settings, setSettings] = useState({
    musicVolume: 0.5,
    sfxVolume: 0.7,
    sensitivity: 1.0,
    quality: 'high',
    showFPS: false,
    invertY: false,
    brightness: 1.0,
    contrast: 1.0,
    masterVolume: 1.0,
    shadowQuality: 'high',
    aa: 'on',
    textureQuality: 'high',
    vsync: true,
    showMinimap: true,
    ambientVolume: 0.5,
    voiceVolume: 0.8,
    ambientSounds: true,
    zombieGroans: true,
    footsteps: true,
    deadzone: 0.2,
    toggleCrouch: false,
    autoAim: false,
    vibration: true,
    difficulty: 'normal',
    bloodEffects: true,
    gore: false,
    hitIndicators: true,
    damageNumbers: false,
    autoPickup: true,
    dayNightCycle: false,
    subtitles: false,
  });
  const [notification, setNotification] = useState(null);

  const gameTimeRef = useRef(0);
  const killCountRef = useRef(0);

  // Show notification
  const showNotification = useCallback((text, type = 'info') => {
    setNotification({ text, type, id: Date.now() });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const resetGame = useCallback(() => {
    setPlayerHealth(100);
    setMaxHealth(100);
    setZombieCount(0);
    setKillCount(0);
    setSurvivalTime(0);
    setGameTime(0);
    setWave(1);
    setCurrentLevel(1);
    gameTimeRef.current = 0;
    killCountRef.current = 0;
    setInventory(initialInventory);
    setCurrentWeapon(0);
    setCurrentMissions(missions);
    setIsReloading(false);
    setActiveVehicle(null);
    setUnlockedAreas(['spawn']);
    setPlayerPos({ x: 0, y: 0, z: 0 });
  }, []);

  const damagePlayer = useCallback((damage) => {
    setPlayerHealth(prev => {
      const armorAbsorb = Math.min(inventory.equipment.armor === 0 ? 0 : inventory.equipment.armor, damage * 0.3);
      const finalDamage = Math.max(damage - armorAbsorb, 1);
      const newHealth = Math.max(0, prev - finalDamage);
      if (newHealth <= 0) {
        window.__gameState = 'GAME_OVER';
        setTimeout(() => {
          setGameState(GameState.GAME_OVER);
        }, 500);
      }
      return newHealth;
    });
  }, [inventory.equipment.armor]);

  const healPlayer = useCallback((amount) => {
    setPlayerHealth(prev => Math.min(maxHealth, prev + amount));
  }, [maxHealth]);

  const addKill = useCallback(() => {
    setKillCount(prev => {
      killCountRef.current = prev + 1;
      return prev + 1;
    });
    // Check missions
    setCurrentMissions(prev => prev.map(m => {
      if (m.completed) return m;
      if (m.type === 'kill' && killCountRef.current >= m.target) {
        showNotification(`Mission Complete: ${m.name}! +$${m.reward}`, 'success');
        return { ...m, completed: true };
      }
      return m;
    }));
  }, [showNotification]);

  const addMoney = useCallback((amount) => {
    setInventory(prev => ({
      ...prev,
      money: prev.money + amount,
    }));
  }, []);

  // Add item to bag
  const addItemToBag = useCallback((item) => {
    setInventory(prev => ({
      ...prev,
      bag: [...prev.bag, { ...item, id: Date.now() + Math.random() }],
    }));
    showNotification(`Picked up: ${item.name}`, 'success');
  }, [showNotification]);

  const buyWeapon = useCallback((weaponId) => {
    let success = false;
    setInventory(prev => {
      const weapon = prev.weapons.find(w => w.id === weaponId);
      if (!weapon || weapon.unlocked) return prev;
      if (prev.money < weapon.price) return prev;
      success = true;
      showNotification(`Purchased: ${weapon.name}!`, 'success');
      return {
        ...prev,
        money: prev.money - weapon.price,
        weapons: prev.weapons.map(w => w.id === weaponId ? { ...w, unlocked: true } : w),
      };
    });
    return success;
  }, [showNotification]);

  const buyAmmo = useCallback((weaponId) => {
    setInventory(prev => {
      const weapon = prev.weapons.find(w => w.id === weaponId);
      if (!weapon || weapon.type === 'melee') return prev;
      const cost = 50;
      if (prev.money < cost) return prev;
      return {
        ...prev,
        money: prev.money - cost,
        weapons: prev.weapons.map(w => 
          w.id === weaponId ? { ...w, ammo: w.ammo + Math.floor(w.maxAmmo * 0.5) } : w
        ),
      };
    });
  }, []);

  const buyEquipment = useCallback((item, cost, amount) => {
    setInventory(prev => {
      if (prev.money < cost) return prev;
      return {
        ...prev,
        money: prev.money - cost,
        equipment: {
          ...prev.equipment,
          [item]: (prev.equipment[item] || 0) + amount,
        },
      };
    });
  }, []);

  const switchWeapon = useCallback((index) => {
    if (inventory.weapons[index] && inventory.weapons[index].unlocked) {
      setCurrentWeapon(index);
      setIsReloading(false);
    }
  }, [inventory.weapons]);

  const useMedkit = useCallback(() => {
    if (inventory.equipment.medkits > 0 && playerHealth < maxHealth) {
      setInventory(prev => ({
        ...prev,
        equipment: { ...prev.equipment, medkits: prev.equipment.medkits - 1 },
      }));
      healPlayer(50);
      showNotification('Used Medkit: +50 HP', 'success');
      return true;
    }
    return false;
  }, [inventory.equipment.medkits, playerHealth, maxHealth, healPlayer, showNotification]);

  const value = {
    gameState, setGameState,
    loadingProgress, setLoadingProgress,
    playerHealth, maxHealth, setPlayerHealth, setMaxHealth,
    damagePlayer, healPlayer,
    zombieCount, setZombieCount,
    killCount, addKill,
    survivalTime, setSurvivalTime,
    inventory, setInventory,
    currentWeapon, setCurrentWeapon,
    switchWeapon,
    currentMissions, setCurrentMissions,
    currentLevel, setCurrentLevel,
    wave, setWave,
    difficulty, setDifficulty,
    playerPos, setPlayerPos,
    showTips, setShowTips,
    gameTime, setGameTime,
    gameTimeRef, killCountRef,
    isReloading, setIsReloading,
    activeVehicle, setActiveVehicle,
    unlockedAreas, setUnlockedAreas,
    achievements, setAchievements,
    settings, setSettings,
    notification, showNotification,
    resetGame,
    addMoney,
    addItemToBag,
    buyWeapon,
    buyAmmo,
    buyEquipment,
    useMedkit,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
}