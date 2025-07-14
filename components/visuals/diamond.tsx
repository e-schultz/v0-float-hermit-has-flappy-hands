"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useAudio } from "@/contexts/audio-context"
import type * as THREE from "three"

export default function Diamond() {
  const { audioData } = useAudio()
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (!meshRef.current || !audioData.current) return

    const { bassLevel, melodyLevel } = audioData.current

    // Scale based on bass
    const targetScale = 1 + bassLevel * 0.5
    meshRef.current.scale.set(targetScale, targetScale, targetScale)

    // Rotation speed based on melody
    meshRef.current.rotation.x += 0.01 + melodyLevel * 0.02
    meshRef.current.rotation.y += 0.01 + melodyLevel * 0.02
  })

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <octahedronGeometry args={[1.5, 0]} />
      <meshStandardMaterial color="#ff00ff" emissive="#550055" metalness={0.8} roughness={0.2} wireframe={false} />
    </mesh>
  )
}

