import { useRef, useEffect, useMemo, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib"; 
import { zombieRefs } from "./Player";

const ZOMBIE_COLORS = {
  Walker: { body: '#556655', clothes: '#334433', skin: '#667766' },
  Runner: { body: '#445544', clothes: '#223322', skin: '#556655' },
  Brute: { body: '#334433', clothes: '#112211', skin: '#445544' },
  Spitter: { body: '#44aa44', clothes: '#228822', skin: '#55bb55' },
  Crawler: { body: '#555533', clothes: '#333311', skin: '#666644' },
  Giant: { body: '#225522', clothes: '#113311', skin: '#336633' },
};

export default function Zombie({ position, playerRef, onHit, onDeath, health, maxHealth, speed, damage, onPlayerHit, id, zombieType, gamePaused }) {
  const group = useRef();
  const healthRef = useRef(health);
  const maxHealthRef = useRef(maxHealth || health || 50);
  const hitCooldown = useRef(0);
  const deathSoundPlayed = useRef(false);
  const isDeadRef = useRef(false);
  
  const type = zombieType || { name: 'Walker', speed: 2.5, health: 40, damage: 8, color: '#556655', scale: 1.0 };
  
  const { scene, animations } = useGLTF("/models/zombie-final.glb");
  
  const clone = useMemo(() => {
    if (!scene) return null;
    const instance = SkeletonUtils.clone(scene);
    instance.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) child.material.needsUpdate = true;
      }
    });
    return instance;
  }, [scene]);
  
  const { actions } = useAnimations(animations, group);

  // Register this zombie's ref for attack system
  useEffect(() => {
    if (!group.current) return;
    zombieRefs.push(group);
    
    // Expose takeDamage function on the ref
    group.current.__takeDamage = (damage) => {
      if (isDeadRef.current) return;
      const newHealth = Math.max(0, healthRef.current - damage);
      healthRef.current = newHealth;
      
      if (newHealth <= 0) {
        isDeadRef.current = true;
        if (!deathSoundPlayed.current) {
          deathSoundPlayed.current = true;
          if (window.__audio) window.__audio.playZombieDeath();
          if (onDeath) onDeath(group.current.position.clone());
        }
      }
    };
    
    return () => {
      const idx = zombieRefs.indexOf(group);
      if (idx >= 0) zombieRefs.splice(idx, 1);
    };
  }, [onDeath]);

  useEffect(() => {
    if (group.current && position) {
      group.current.position.set(position[0], position[1], position[2]);
    }
    healthRef.current = health;
    maxHealthRef.current = maxHealth || health || 50;
  }, [position, health, maxHealth]);

  useEffect(() => {
    if (!actions) return;
    const walkAnim = actions["Walk"] || actions["Run"] || Object.values(actions)[0];
    if (walkAnim) walkAnim.play();
  }, [actions]);

  useFrame((state, delta) => {
    if (!group.current || !playerRef?.current || !clone || isDeadRef.current) return;
    if (gamePaused) return; // Freeze all zombie movement when paused

    const zombie = group.current;
    const player = playerRef.current;

    const direction = new THREE.Vector3();
    direction.subVectors(player.position, zombie.position);
    direction.y = 0; 
    
    const distance = direction.length();
    const currentSpeed = speed || 4;

    // Check if health reached 0 from attack system
    if (healthRef.current <= 0) {
      isDeadRef.current = true;
      if (!deathSoundPlayed.current) {
        deathSoundPlayed.current = true;
        if (window.__audio) window.__audio.playZombieDeath();
        if (onDeath) onDeath(zombie.position.clone());
      }
      return;
    }

    if (distance > 1.8) {
      zombie.lookAt(player.position.x, zombie.position.y, player.position.z);
      direction.normalize();
      zombie.position.addScaledVector(direction, currentSpeed * delta);
    } else {
      hitCooldown.current += delta;
      const attackSpeed = type.name === 'Runner' ? 0.4 : type.name === 'Brute' ? 1.0 : 0.6;
      if (hitCooldown.current > attackSpeed) {
        hitCooldown.current = 0;
        const dmg = Math.floor(damage / 3); // Reduced damage! 
        if (onPlayerHit) onPlayerHit(dmg);
        if (onHit) onHit();
      }
    }
  });

  if (!clone) return null;

  const currentHealth = healthRef.current || 0;
  const totalHealth = maxHealthRef.current || 50;
  const healthPercent = totalHealth > 0 ? (currentHealth / totalHealth) * 100 : 0;
  const barColor = healthPercent > 50 ? '#00ff00' : healthPercent > 25 ? '#ffaa00' : '#ff0000';
  const scaleVal = type.scale || 1.0;

  return (
    <group ref={group} scale={scaleVal}>
      <primitive object={clone} scale={1.8} position={[0, 0, 0]} castShadow />
      
      {/* Health Bar */}
      <mesh position={[0, 2.5 * scaleVal, 0]}>
        <planeGeometry args={[1 * scaleVal, 0.1 * scaleVal]} />
        <meshBasicMaterial color="#333" />
      </mesh>
      <mesh position={[-0.5 * scaleVal * (1 - healthPercent/100), 2.5 * scaleVal, 0.01]}>
        <planeGeometry args={[Math.max(0.01, healthPercent/100) * scaleVal, 0.08 * scaleVal]} />
        <meshBasicMaterial color={barColor} />
      </mesh>
      
      {/* Type indicator */}
      <mesh position={[0, 2.8 * scaleVal, 0]}>
        <planeGeometry args={[0.4 * scaleVal, 0.06 * scaleVal]} />
        <meshBasicMaterial color={type.name === 'Runner' ? '#ff4444' : type.name === 'Brute' ? '#ff8800' : type.name === 'Giant' ? '#ff00ff' : type.name === 'Spitter' ? '#44ff44' : '#666'} />
      </mesh>
    </group>
  );
}