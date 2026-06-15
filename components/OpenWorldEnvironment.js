'use client';
import { useMemo, useRef, useCallback, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { collisionObjects } from './Player';

export default function OpenWorldEnvironment({ playerPos, brightness = 1.0 }) {
  return (
    <group>
      <Ground />
      <CityBuildings />
      <Houses />
      <AbandonedCars />
      <Mountains />
      <Trees />
      <GrassField />
      <Temples />
      <SupplyDrops />
      <Roads />
      <StreetLights />
      <Barricades />
      <FenceWalls />
      <Graveyard />
      <WorldBoundaryWalls />
    </group>
  );
}

function Ground() {
  return (
    <group>
      <mesh receiveShadow position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[600, 600, 80, 80]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.8} metalness={0.05} />
      </mesh>
      
      {/* Main Road */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[600, 12]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
      </mesh>
      
      {/* Road markings */}
      {Array.from({length: 20}, (_, i) => i * 30 - 285).map((z, i) => (
        <mesh key={i} position={[0, 0.03, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.4, 4]} />
          <meshBasicMaterial color="#555" />
        </mesh>
      ))}
      
      {/* Cross road */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[600, 12]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
      </mesh>
    </group>
  );
}

function CityBuildings() {
  const buildings = useMemo(() => {
    const b = [];
    const colors = ['#3a3a3a', '#444444', '#4d4d4d', '#555555', '#3f3f3f', '#484848'];
    const windowGlowColors = ['#ffcc44', '#ffaa22', '#ffdd66', '#ffffff'];
    
    for (let i = 0; i < 45; i++) {
      let x = (Math.random() - 0.5) * 380;
      let z = (Math.random() - 0.5) * 380;
      if (Math.abs(x) < 25 && Math.abs(z) < 25) continue;
      // Avoid clustering on roads
      if (Math.abs(x) < 10 && Math.abs(z % 200) < 80) continue;
      
      const height = 5 + Math.random() * 30;
      const width = 4 + Math.random() * 10;
      const depth = 4 + Math.random() * 10;
      
      b.push({
        pos: [x, height/2, z],
        size: [width, height, depth],
        color: colors[Math.floor(Math.random() * colors.length)],
        hasWindows: Math.random() > 0.2,
        windowColor: windowGlowColors[Math.floor(Math.random() * windowGlowColors.length)],
      });
    }
    return b;
  }, []);

  // Register collision objects
  useEffect(() => {
    const collisionData = buildings.map(b => ({
      position: new THREE.Vector3(b.pos[0], 0, b.pos[2]),
      radius: Math.max(b.size[0], b.size[2]) * 0.6,
    }));
    collisionObjects.push(...collisionData);
    return () => {
      // Clean up collision objects
      collisionData.forEach(cd => {
        const idx = collisionObjects.indexOf(cd);
        if (idx >= 0) collisionObjects.splice(idx, 1);
      });
    };
  }, [buildings]);

  return (
    <group>
      {buildings.map((b, i) => (
        <group key={i} position={b.pos}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={b.size} />
            <meshStandardMaterial color={b.color} roughness={0.6} metalness={0.3} />
          </mesh>
          {b.hasWindows && <BuildingWindows size={b.size} windowColor={b.windowColor} />}
          <mesh position={[0, b.size[1]/2 + 0.3, 0]} castShadow>
            <boxGeometry args={[b.size[0] - 0.5, 0.15, b.size[2] - 0.5]} />
            <meshStandardMaterial color="#222" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function BuildingWindows({ size, windowColor }) {
  const windows = useMemo(() => {
    const w = [];
    const rows = Math.floor(size[1] / 3);
    const cols = Math.floor(size[0] / 2);
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (Math.random() > 0.4) {
          w.push({
            pos: [-size[0]/2 + 1 + col * 2, -size[1]/2 + 1.5 + row * 3, size[2]/2 + 0.05],
            lit: Math.random() > 0.4,
          });
        }
      }
    }
    return w;
  }, [size]);
  return (
    <group>
      {windows.map((w, i) => (
        <mesh key={i} position={w.pos}>
          <planeGeometry args={[1.2, 1.8]} />
          <meshStandardMaterial color={w.lit ? (windowColor || '#ffcc44') : '#1a1a2a'} emissive={w.lit ? (windowColor || '#ffcc44') : '#000000'} emissiveIntensity={w.lit ? 0.4 : 0} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function Houses() {
  const houses = useMemo(() => {
    const h = [];
    const houseColors = ['#A0522D', '#CD853F', '#DEB887', '#D2691E', '#8B7355', '#B8860B', '#DAA520'];
    const roofColors = ['#8B0000', '#654321', '#4A0404', '#333333', '#555555'];
    for (let i = 0; i < 18; i++) {
      const x = (Math.random() - 0.5) * 400;
      const z = (Math.random() - 0.5) * 400;
      if (Math.abs(x) < 30 && Math.abs(z) < 30) continue;
      h.push({
        pos: [x, 0, z],
        color: houseColors[Math.floor(Math.random() * houseColors.length)],
        roofColor: roofColors[Math.floor(Math.random() * roofColors.length)],
        scale: 0.8 + Math.random() * 0.6,
        rotation: Math.random() * Math.PI / 2,
      });
    }
    return h;
  }, []);

  useEffect(() => {
    const collisionData = houses.map(h => ({
      position: new THREE.Vector3(h.pos[0], 0, h.pos[2]),
      radius: 4 * h.scale,
    }));
    collisionObjects.push(...collisionData);
    return () => {
      collisionData.forEach(cd => {
        const idx = collisionObjects.indexOf(cd);
        if (idx >= 0) collisionObjects.splice(idx, 1);
      });
    };
  }, [houses]);

  return (
    <group>
      {houses.map((house, i) => {
        const s = house.scale;
        return (
        <group key={i} position={house.pos} rotation={[0, house.rotation, 0]} scale={s}>
          <mesh castShadow receiveShadow position={[0, 1.5, 0]}>
            <boxGeometry args={[5, 3, 5]} />
            <meshStandardMaterial color={house.color} roughness={0.7} />
          </mesh>
          <mesh castShadow position={[0, 3.8, 0]}>
            <coneGeometry args={[4, 2.5, 4]} />
            <meshStandardMaterial color={house.roofColor} roughness={0.9} />
          </mesh>
          <mesh position={[0, 1, 2.55]}>
            <planeGeometry args={[1.4, 2.2]} />
            <meshStandardMaterial color="#4a2800" />
          </mesh>
          <mesh position={[1.5, 1.8, 2.55]}>
            <planeGeometry args={[0.9, 0.9]} />
            <meshStandardMaterial color="#88ccff" emissive="#88ccff" emissiveIntensity={0.15} />
          </mesh>
          <mesh position={[-1.5, 1.8, 2.55]}>
            <planeGeometry args={[0.9, 0.9]} />
            <meshStandardMaterial color="#88ccff" emissive="#88ccff" emissiveIntensity={0.15} />
          </mesh>
          <mesh position={[1.5, 4, -1.2]} castShadow>
            <boxGeometry args={[0.6, 1.5, 0.6]} />
            <meshStandardMaterial color="#5a3a1a" />
          </mesh>
          {[[3, 0.3, 0], [-3, 0.3, 0], [0, 0.3, 3], [0, 0.3, -3], [3, 0.3, 3], [-3, 0.3, 3], [3, 0.3, -3], [-3, 0.3, -3]].map((fp, fi) => (
            <mesh key={fi} position={[fp[0], fp[1], fp[2]]}>
              <boxGeometry args={[0.08, 0.6, 0.08]} />
              <meshStandardMaterial color="#8B7355" />
            </mesh>
          ))}
        </group>
      );})}
    </group>
  );
}

function AbandonedCars() {
  const cars = useMemo(() => {
    const c = [];
    const carColors = ['#8B0000', '#1a1a2a', '#333333', '#444400', '#2a1a00', '#004466', '#660044'];
    for (let i = 0; i < 25; i++) {
      const x = (Math.random() - 0.5) * 380;
      const z = (Math.random() - 0.5) * 380;
      if (Math.abs(x) < 20 && Math.abs(z) < 20) continue;
      c.push({
        pos: [x, 0.3, z],
        color: carColors[Math.floor(Math.random() * carColors.length)],
        rotation: Math.random() * Math.PI * 2,
        damaged: Math.random() > 0.4,
      });
    }
    return c;
  }, []);

  useEffect(() => {
    const collisionData = cars.map(c => ({
      position: new THREE.Vector3(c.pos[0], 0, c.pos[2]),
      radius: 2.5,
    }));
    collisionObjects.push(...collisionData);
    return () => {
      collisionData.forEach(cd => {
        const idx = collisionObjects.indexOf(cd);
        if (idx >= 0) collisionObjects.splice(idx, 1);
      });
    };
  }, [cars]);

  return (
    <group>
      {cars.map((car, i) => (
        <group key={i} position={car.pos} rotation={[0, car.rotation, 0]}>
          <mesh castShadow receiveShadow position={[0, 0.4, 0]}>
            <boxGeometry args={[2, 0.5, 5]} />
            <meshStandardMaterial color={car.color} roughness={0.7} metalness={0.4} />
          </mesh>
          <mesh castShadow position={[0, 0.95, -0.3]}>
            <boxGeometry args={[1.8, 0.6, 2.8]} />
            <meshStandardMaterial color={car.damaged ? '#555' : '#88bbdd'} roughness={0.4} metalness={0.2} />
          </mesh>
          {[[-0.9, 0.15, 1.5], [0.9, 0.15, 1.5], [-0.9, 0.15, -1.5], [0.9, 0.15, -1.5]].map((wp, wi) => (
            <mesh key={wi} position={wp}>
              <cylinderGeometry args={[0.35, 0.35, 0.2, 12]} />
              <meshStandardMaterial color="#111" />
            </mesh>
          ))}
          <mesh position={[0.6, 0.5, -2.5]}>
            <planeGeometry args={[0.3, 0.3]} />
            <meshStandardMaterial color="#ffcc88" emissive="#ffcc88" emissiveIntensity={0.1} />
          </mesh>
          <mesh position={[-0.6, 0.5, -2.5]}>
            <planeGeometry args={[0.3, 0.3]} />
            <meshStandardMaterial color="#ffcc88" emissive="#ffcc88" emissiveIntensity={0.1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Mountains() {
  const mountains = useMemo(() => {
    const m = [];
    const mountainColors = ['#5a5a4a', '#6a6a5a', '#4a4a3a', '#7a6a5a', '#5a4a3a'];
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const distance = 140 + Math.random() * 60;
      m.push({
        pos: [Math.cos(angle) * distance, 0, Math.sin(angle) * distance],
        height: 35 + Math.random() * 60,
        color: mountainColors[Math.floor(Math.random() * mountainColors.length)],
        scale: 0.8 + Math.random() * 0.6,
      });
    }
    return m;
  }, []);

  useEffect(() => {
    const collisionData = mountains.map(mt => ({
      position: new THREE.Vector3(mt.pos[0], 0, mt.pos[2]),
      radius: 20,
    }));
    collisionObjects.push(...collisionData);
    return () => {
      collisionData.forEach(cd => {
        const idx = collisionObjects.indexOf(cd);
        if (idx >= 0) collisionObjects.splice(idx, 1);
      });
    };
  }, [mountains]);

  return (
    <group>
      {mountains.map((mt, i) => (
        <group key={i} position={mt.pos} scale={mt.scale}>
          <mesh castShadow position={[0, mt.height * 0.3, 0]}>
            <coneGeometry args={[30, mt.height, 8]} />
            <meshStandardMaterial color={mt.color} roughness={0.9} flatShading />
          </mesh>
          <mesh position={[0, mt.height * 0.55, 0]}>
            <coneGeometry args={[10, mt.height * 0.2, 6]} />
            <meshStandardMaterial color="#e8e8e8" roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Trees() {
  const trees = useMemo(() => {
    const t = [];
    const trunkColors = ['#5a3a1a', '#6a4a2a', '#4a2a0a', '#7a5a3a'];
    const leafColors = ['#2a5a2a', '#3a6a3a', '#1a4a1a', '#4a7a4a', '#2a6a2a', '#1a5a2a'];
    for (let i = 0; i < 80; i++) {
      const x = (Math.random() - 0.5) * 460;
      const z = (Math.random() - 0.5) * 460;
      if (Math.abs(x) < 30 && Math.abs(z) < 30) continue;
      t.push({
        pos: [x, 0, z],
        trunkColor: trunkColors[Math.floor(Math.random() * trunkColors.length)],
        leafColor: leafColors[Math.floor(Math.random() * leafColors.length)],
        height: 3 + Math.random() * 6,
        radius: 2 + Math.random() * 4,
      });
    }
    return t;
  }, []);

  useEffect(() => {
    const collisionData = trees.map(t => ({
      position: new THREE.Vector3(t.pos[0], 0, t.pos[2]),
      radius: 1.5,
    }));
    collisionObjects.push(...collisionData);
    return () => {
      collisionData.forEach(cd => {
        const idx = collisionObjects.indexOf(cd);
        if (idx >= 0) collisionObjects.splice(idx, 1);
      });
    };
  }, [trees]);

  return (
    <group>
      {trees.map((tree, i) => (
        <group key={i} position={tree.pos}>
          <mesh castShadow position={[0, tree.height * 0.4, 0]}>
            <cylinderGeometry args={[0.3, 0.6, tree.height]} />
            <meshStandardMaterial color={tree.trunkColor} roughness={0.9} />
          </mesh>
          <mesh castShadow position={[0, tree.height * 0.8, 0]}>
            <sphereGeometry args={[tree.radius, 6]} />
            <meshStandardMaterial color={tree.leafColor} roughness={0.7} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function GrassField() {
  const grassPatches = useMemo(() => {
    const g = [];
    for (let i = 0; i < 250; i++) {
      const x = (Math.random() - 0.5) * 550;
      const z = (Math.random() - 0.5) * 550;
      if (Math.abs(x) < 25 && Math.abs(z) < 25) continue;
      g.push({
        pos: [x, 0.01, z],
        color: Math.random() > 0.5 ? '#3a5a2a' : '#4a6a3a',
        scale: 0.5 + Math.random() * 2,
      });
    }
    return g;
  }, []);
  return (
    <group>
      {grassPatches.map((g, i) => (
        <mesh key={i} position={g.pos} scale={g.scale}>
          <planeGeometry args={[1.5, 1.5]} />
          <meshStandardMaterial color={g.color} roughness={0.9} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function Temples() {
  const temples = useMemo(() => [
    { pos: [-100, 0, -80], scale: 1.3 },
    { pos: [110, 0, 90], scale: 1.1 },
    { pos: [-90, 0, 110], scale: 0.9 },
    { pos: [80, 0, -100], scale: 1.0 },
  ], []);

  useEffect(() => {
    const collisionData = temples.map(t => ({
      position: new THREE.Vector3(t.pos[0], 0, t.pos[2]),
      radius: 8 * t.scale,
    }));
    collisionObjects.push(...collisionData);
    return () => {
      collisionData.forEach(cd => {
        const idx = collisionObjects.indexOf(cd);
        if (idx >= 0) collisionObjects.splice(idx, 1);
      });
    };
  }, [temples]);

  return (
    <group>
      {temples.map((temple, i) => (
        <group key={i} position={temple.pos} scale={temple.scale}>
          <mesh castShadow receiveShadow position={[0, 1, 0]}>
            <boxGeometry args={[10, 2, 10]} />
            <meshStandardMaterial color="#9B8575" roughness={0.9} />
          </mesh>
          <mesh castShadow position={[0, 4, 0]}>
            <boxGeometry args={[8, 4, 8]} />
            <meshStandardMaterial color="#B0A090" roughness={0.8} />
          </mesh>
          <mesh castShadow position={[0, 7, 0]}>
            <coneGeometry args={[5, 3, 8]} />
            <meshStandardMaterial color="#C4B898" roughness={0.7} />
          </mesh>
          <mesh castShadow position={[0, 9, 0]}>
            <coneGeometry args={[0.6, 3, 6]} />
            <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.3} />
          </mesh>
          {[[-3, 2.5, -3], [3, 2.5, -3], [-3, 2.5, 3], [3, 2.5, 3]].map((cp, ci) => (
            <mesh key={ci} position={cp}>
              <cylinderGeometry args={[0.4, 0.5, 5]} />
              <meshStandardMaterial color="#A09080" />
            </mesh>
          ))}
          <mesh position={[0, 1.5, 5.05]}>
            <planeGeometry args={[2.5, 3.5]} />
            <meshStandardMaterial color="#3a2a1a" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function SupplyDrops() {
  const drops = useMemo(() => [
    { pos: [40, 0.5, 40] },
    { pos: [-50, 0.5, 30] },
    { pos: [30, 0.5, -60] },
    { pos: [-35, 0.5, -40] },
  ], []);
  return (
    <group>
      {drops.map((drop, i) => (
        <group key={i} position={drop.pos}>
          <mesh castShadow>
            <boxGeometry args={[2.5, 1.2, 2.5]} />
            <meshStandardMaterial color="#8B4513" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.6, 0]}>
            <boxGeometry args={[2.7, 0.1, 2.7]} />
            <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Roads() {
  const roads = useMemo(() => {
    const r = [];
    for (let i = 0; i < 8; i++) {
      const x = (Math.random() - 0.5) * 320;
      const z = (Math.random() - 0.5) * 320;
      if (Math.abs(x) < 30 && Math.abs(z) < 30) continue;
      r.push({ pos: [x, 0.01, z], rotation: Math.random() * Math.PI, length: 30 + Math.random() * 60 });
    }
    return r;
  }, []);
  return (
    <group>
      {roads.map((road, i) => (
        <mesh key={i} position={road.pos} rotation={[-Math.PI / 2, 0, road.rotation]}>
          <planeGeometry args={[road.length, 6]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function StreetLights() {
  const lights = useMemo(() => {
    const l = [];
    for (let i = 0; i < 30; i++) {
      const x = (Math.random() - 0.5) * 420;
      const z = (Math.random() - 0.5) * 420;
      if (Math.abs(x) < 15 && Math.abs(z) < 15) continue;
      l.push({ pos: [x, 0, z], working: Math.random() > 0.25 });
    }
    return l;
  }, []);

  useEffect(() => {
    const collisionData = lights.map(l => ({
      position: new THREE.Vector3(l.pos[0], 0, l.pos[2]),
      radius: 0.5,
    }));
    collisionObjects.push(...collisionData);
    return () => {
      collisionData.forEach(cd => {
        const idx = collisionObjects.indexOf(cd);
        if (idx >= 0) collisionObjects.splice(idx, 1);
      });
    };
  }, [lights]);

  return (
    <group>
      {lights.map((light, i) => (
        <group key={i} position={light.pos}>
          <mesh castShadow position={[0, 3.5, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 7]} />
            <meshStandardMaterial color="#666" metalness={0.4} roughness={0.5} />
          </mesh>
          <mesh position={[0, 7, 0]}>
            <sphereGeometry args={[0.25]} />
            <meshStandardMaterial color={light.working ? '#ffcc44' : '#444'} emissive={light.working ? '#ffcc44' : '#000'} emissiveIntensity={light.working ? 0.6 : 0} />
          </mesh>
          {light.working && (
            <mesh position={[0, 6.5, 0]}>
              <coneGeometry args={[2.5, 6, 8]} />
              <meshStandardMaterial color="#ffcc44" transparent opacity={0.04} emissive="#ffcc44" emissiveIntensity={0.1} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

function Barricades() {
  const barricades = useMemo(() => {
    const b = [];
    for (let i = 0; i < 15; i++) {
      const x = (Math.random() - 0.5) * 380;
      const z = (Math.random() - 0.5) * 380;
      if (Math.abs(x) < 20 && Math.abs(z) < 20) continue;
      b.push({ pos: [x, 0.5, z], rotation: Math.random() * Math.PI * 2, type: Math.floor(Math.random() * 3) });
    }
    return b;
  }, []);

  useEffect(() => {
    const collisionData = barricades.map(b => ({
      position: new THREE.Vector3(b.pos[0], 0, b.pos[2]),
      radius: 2,
    }));
    collisionObjects.push(...collisionData);
    return () => {
      collisionData.forEach(cd => {
        const idx = collisionObjects.indexOf(cd);
        if (idx >= 0) collisionObjects.splice(idx, 1);
      });
    };
  }, [barricades]);

  return (
    <group>
      {barricades.map((b, i) => (
        <group key={i} position={b.pos} rotation={[0, b.rotation, 0]}>
          {b.type === 0 && (
            <>
              <mesh position={[0, 0.3, 0]} castShadow><boxGeometry args={[2.5, 0.6, 1.2]} /><meshStandardMaterial color="#9B8575" roughness={0.9} /></mesh>
              <mesh position={[-0.8, 0.7, 0]} castShadow><boxGeometry args={[0.8, 0.6, 1.2]} /><meshStandardMaterial color="#A09080" roughness={0.9} /></mesh>
              <mesh position={[0.8, 0.7, 0]} castShadow><boxGeometry args={[0.8, 0.6, 1.2]} /><meshStandardMaterial color="#8B7565" roughness={0.9} /></mesh>
            </>
          )}
          {b.type === 1 && (
            <mesh castShadow><boxGeometry args={[3.5, 1.8, 0.15]} /><meshStandardMaterial color="#777" metalness={0.6} roughness={0.3} /></mesh>
          )}
          {b.type === 2 && (
            <>
              <mesh position={[0, 0.8, 0]} castShadow><boxGeometry args={[3.5, 0.08, 1.8]} /><meshStandardMaterial color="#8B4513" roughness={0.9} /></mesh>
              {[-1.5, 0, 1.5].map((xp, xi) => (
                <mesh key={xi} position={[xp, 0.6, 0]}><boxGeometry args={[0.08, 1.2, 1.8]} /><meshStandardMaterial color="#6B3A13" roughness={0.9} /></mesh>
              ))}
            </>
          )}
        </group>
      ))}
    </group>
  );
}

function FenceWalls() {
  const fences = useMemo(() => {
    const f = [];
    for (let i = 0; i < 12; i++) {
      const x = (Math.random() - 0.5) * 360;
      const z = (Math.random() - 0.5) * 360;
      if (Math.abs(x) < 22 && Math.abs(z) < 22) continue;
      f.push({ pos: [x, 0.5, z], rotation: Math.random() * Math.PI * 2, length: 5 + Math.random() * 8 });
    }
    return f;
  }, []);

  useEffect(() => {
    const collisionData = fences.map(f => ({
      position: new THREE.Vector3(f.pos[0], 0, f.pos[2]),
      radius: f.length / 2,
    }));
    collisionObjects.push(...collisionData);
    return () => {
      collisionData.forEach(cd => {
        const idx = collisionObjects.indexOf(cd);
        if (idx >= 0) collisionObjects.splice(idx, 1);
      });
    };
  }, [fences]);

  return (
    <group>
      {fences.map((f, i) => (
        <group key={i} position={f.pos} rotation={[0, f.rotation, 0]}>
          <mesh position={[0, 0.3, 0]} castShadow><boxGeometry args={[f.length, 0.6, 0.08]} /><meshStandardMaterial color="#777" metalness={0.5} roughness={0.4} /></mesh>
          <mesh position={[0, 0.8, 0]} castShadow><boxGeometry args={[f.length, 0.08, 0.06]} /><meshStandardMaterial color="#888" metalness={0.4} roughness={0.5} /></mesh>
        </group>
      ))}
    </group>
  );
}

function Graveyard() {
  const graves = useMemo(() => {
    const g = [];
    for (let i = 0; i < 10; i++) {
      const x = (Math.random() - 0.5) * 20 + 50;
      const z = (Math.random() - 0.5) * 20 + 50;
      g.push({ pos: [x, 0.3, z], rotation: Math.random() * 0.3 - 0.15 });
    }
    return g;
  }, []);

  useEffect(() => {
    const collisionData = graves.map(g => ({
      position: new THREE.Vector3(g.pos[0], 0, g.pos[2]),
      radius: 1,
    }));
    collisionObjects.push(...collisionData);
    return () => {
      collisionData.forEach(cd => {
        const idx = collisionObjects.indexOf(cd);
        if (idx >= 0) collisionObjects.splice(idx, 1);
      });
    };
  }, [graves]);

  return (
    <group>
      {graves.map((grave, i) => (
        <group key={i} position={grave.pos} rotation={[0, grave.rotation, 0]}>
          <mesh castShadow><boxGeometry args={[0.6, 0.5, 0.15]} /><meshStandardMaterial color="#777" roughness={0.8} /></mesh>
        </group>
      ))}
    </group>
  );
}

// Invisible kill zone walls at world boundary
function WorldBoundaryWalls() {
  // No visual walls, just collision handled in Player.js
  return null;
}