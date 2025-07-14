"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useAudio } from "@/contexts/audio-context"
import type * as THREE from "three"

export default function ConcentricCircles() {
  const { audioData } = useAudio()
  const groupRef = useRef<THREE.Group>(null)

  const circles = [
    { radius: 2.5, color: "#3498db", thickness: 0.05 },
    { radius: 3.0, color: "#2980b9", thickness: 0.04 },
    { radius: 3.5, color: "#1abc9c", thickness: 0.03 },
    { radius: 4.0, color: "#16a085", thickness: 0.02 },
  ]

  useFrame(() => {
    if (!groupRef.current || !audioData.current) return

    const { padLevel, hatsLevel } = audioData.current

    // Rotate based on pad level
    groupRef.current.rotation.z += 0.002 + padLevel * 0.01

    // Scale based on hats
    const targetScale = 1 + hatsLevel * 0.2
    groupRef.current.scale.set(targetScale, targetScale, 1)
  })

  return (
    <group ref={groupRef}>
      {circles.map((circle, index) => (
        <mesh key={index} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[circle.radius, circle.thickness, 16, 100]} />
          <meshStandardMaterial
            color={circle.color}
            emissive={circle.color}
            emissiveIntensity={0.5}
            transparent={true}
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  )
}

