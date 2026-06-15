import { useRef, useEffect, useMemo, useState, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import { useKeyboard } from "../hooks/useKeyboard";

// Collision objects data (shared between systems)
export const collisionObjects = [];
// Zombie references for attack system
export const zombieRefs = [];

function checkCollision(position, radius = 1.0) {
  for (const obj of collisionObjects) {
    if (!obj || !obj.position) continue;
    const dx = position.x - obj.position.x;
    const dz = position.z - obj.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    const minDist = radius + (obj.radius || 2.0);
    if (dist < minDist) return true;
  }
  if (Math.abs(position.x) > 290 || Math.abs(position.z) > 290) return 'death';
  return false;
}

export default function Player({ playerRef, onFall, locked, gamePaused }) {
  const group = useRef();
  const { camera } = useThree();
  const { moveForward, moveBackward, moveLeft, moveRight, attack, jump } = useKeyboard();
  const [mobileMove, setMobileMove] = useState({ forward: false, backward: false, left: false, right: false });
  const attackCooldown = useRef(0);
  const jumpVelocity = useRef(0);
  const isGrounded = useRef(true);
  const yPos = useRef(0);
  
  const effectiveForward = moveForward || mobileMove.forward;
  const effectiveBackward = moveBackward || mobileMove.backward;
  const effectiveLeft = moveLeft || mobileMove.left;
  const effectiveRight = moveRight || mobileMove.right;

  useEffect(() => {
    const checkMobile = () => {
      if (window.__mobileMove) setMobileMove(window.__mobileMove);
    };
    const interval = setInterval(checkMobile, 50);
    return () => clearInterval(interval);
  }, []);

  const { scene, animations } = useGLTF("/models/humany.glb");
  
  const clone = useMemo(() => {
    if (!scene) return null;
    const instance = SkeletonUtils.clone(scene);
    instance.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.side = THREE.DoubleSide;
          child.material.needsUpdate = true;
        }
      }
    });
    return instance;
  }, [scene]);

  const { actions, names } = useAnimations(animations, group);

  useEffect(() => {
    if (!actions || names.length === 0 || !clone) return;
    const isMoving = effectiveForward || effectiveBackward || effectiveLeft || effectiveRight;
    const walkName = names.find(n => n.toLowerCase().includes('walk')) || names.find(n => n.toLowerCase().includes('run')) || names[0];
    const idleName = names.find(n => n.toLowerCase().includes('idle')) || names.find(n => n.toLowerCase().includes('pose')) || names[1] || names[0];
    const currentAction = isMoving ? actions[walkName] : actions[idleName];
    if (currentAction) {
      Object.values(actions).forEach(a => a?.fadeOut(0.2));
      currentAction.reset().fadeIn(0.2).play();
    }
  }, [effectiveForward, effectiveBackward, effectiveLeft, effectiveRight, actions, names, clone]);

  // Attack system - damages nearby zombies
  const performAttack = useCallback(() => {
    if (!playerRef?.current) return;
    const playerPos = playerRef.current.position;
    
    // Get current weapon from window.__weapon (set by HUD)
    const currentWeaponIdx = window.__currentWeapon || 0;
    const weapons = window.__weaponsData || [];
    const weapon = weapons[currentWeaponIdx] || { damage: 15, range: 2, type: 'melee' };
    
    // Play gunshot sound for ranged weapons
    if (weapon.type === 'ranged' && window.__audio) {
      window.__audio.playGunshot();
    }
    
    // Check all zombie references for attack range
    const attackRange = weapon.range || 2;
    const damage = weapon.damage || 15;
    let hitSomething = false;
    
    for (let i = zombieRefs.length - 1; i >= 0; i--) {
      const zRef = zombieRefs[i];
      if (!zRef || !zRef.current) continue;
      
      const zPos = zRef.current.position;
      const dx = playerPos.x - zPos.x;
      const dz = playerPos.z - zPos.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      
      if (dist < attackRange) {
        // Hit this zombie
        if (zRef.__takeDamage) {
          zRef.__takeDamage(damage);
          hitSomething = true;
        }
      }
    }
    
    if (!hitSomething && window.__audio) {
      // Swing/swish sound for missed melee
      window.__audio.playSound(400, 0.08, 'sine', 0.05);
    }
  }, [playerRef]);

  useFrame((state, delta) => {
    if (!group.current) return;
    if (playerRef) playerRef.current = group.current;
    if (gamePaused) return;

    const speed = 7;
    
    // Jump physics
    // JUMP VELOCITY: Change this value to adjust jump height/distance
    // Higher = jump higher/farther, Lower = jump shorter
    // Default: 7 (was 5, increased for better gameplay feel)
    const JUMP_VELOCITY = 7;
    if (jump && isGrounded.current) {
      jumpVelocity.current = JUMP_VELOCITY;
      isGrounded.current = false;
    }
    
    if (!isGrounded.current) {
      jumpVelocity.current -= 15 * delta;
      yPos.current += jumpVelocity.current * delta;
      if (yPos.current <= 0) {
        yPos.current = 0;
        isGrounded.current = true;
        jumpVelocity.current = 0;
      }
      group.current.position.y = yPos.current;
    }

    // Movement with collision
    const direction = new THREE.Vector3(
      Number(effectiveLeft) - Number(effectiveRight), 0,
      Number(effectiveBackward) - Number(effectiveForward)
    );
    
    if (direction.length() > 0) {
      direction.normalize();
      const moveVector = direction.applyEuler(new THREE.Euler(0, camera.rotation.y, 0));
      const newPos = group.current.position.clone();
      newPos.addScaledVector(moveVector, speed * delta);
      newPos.y = yPos.current;
      
      const collisionResult = checkCollision(newPos, 1.2);
      if (collisionResult === 'death') { if (onFall) onFall(); return; }
      
      if (!collisionResult) {
        group.current.position.copy(newPos);
      } else {
        const slideX = group.current.position.clone();
        slideX.x += moveVector.x * speed * delta;
        slideX.y = yPos.current;
        if (!checkCollision(slideX, 1.2)) group.current.position.x = slideX.x;
        
        const slideZ = group.current.position.clone();
        slideZ.z += moveVector.z * speed * delta;
        slideZ.y = yPos.current;
        if (!checkCollision(slideZ, 1.2)) group.current.position.z = slideZ.z;
      }
      
      const targetRotation = Math.atan2(moveVector.x, moveVector.z);
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetRotation, 0.2);
    }

    // Attack handling
    attackCooldown.current -= delta;
    if (attack && attackCooldown.current <= 0) {
      attackCooldown.current = 0.4; // Cooldown between attacks
      performAttack();
    }

    const cameraOffset = new THREE.Vector3(0, 5 + yPos.current, 10);
    const targetCamPos = group.current.position.clone().add(cameraOffset);
    camera.position.lerp(targetCamPos, 0.08);
    camera.lookAt(group.current.position.x, group.current.position.y + 1.5, group.current.position.z);
  });

  if (!clone) return null;

  return (
    <group ref={group} position={[0, 0, 0]}>
      <primitive object={clone} scale={1.5} castShadow />
    </group>
  );
}