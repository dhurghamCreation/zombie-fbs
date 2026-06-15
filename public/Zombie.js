import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";

export default function Zombie({ position }) {
  const mesh = useRef();
  const speed = 1.5;

  useFrame((state, delta) => {
    if (mesh.current) {
      // Directions: Move toward the center (where player is)
      const playerPos = new Vector3(0, 0, 0); 
      mesh.current.lookAt(playerPos);
      mesh.current.translateZ(speed * delta);
    }
  });

  return (
    <mesh ref={mesh} position={position} castShadow>
      <capsuleGeometry args={[0.5, 1.5, 4, 8]} />
      <meshStandardMaterial color="#3e5c36" />
      {/* Floating Blood Bar for Zombie */}
      <mesh position={[0, 1.8, 0]}>
        <planeGeometry args={[0.8, 0.1]} />
        <meshBasicMaterial color="red" />
      </mesh>
    </mesh>
  );
}