"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { useAudio } from "@/contexts/audio-context"
import * as THREE from "three"

export default function VerticalBars() {
  const { audioData } = useAudio()
  const groupRef = useRef<THREE.Group>(null)

  const barCount = 32
  const barWidth = 0.15
  const barMaxHeight = 4
  const radius = 7

  const bars = useMemo(() => {
    const temp = []
    for (let i = 0; i < barCount; i++) {
      const angle = (i / barCount) * Math.PI * 2
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius

      temp.push({
        position: [x, 0, z],
        rotation: [0, -angle, 0],
        color: new THREE.Color().setHSL(i / barCount, 0.7, 0.5),
      })
    }
    return temp
  }, [barCount, radius])

  useFrame(() => {
    if (!groupRef.current || !audioData.current) return

    const { bassLevel, melodyLevel, hatsLevel, padLevel } = audioData.current

    // Rotate the entire group slowly
    groupRef.current.rotation.y += 0.001

    // Update each bar's height based on audio
    groupRef.current.children.forEach((child, index) => {
      const mesh = child as THREE.Mesh

      // Use different audio components for different bar sections
      let level
      if (index < barCount * 0.25) {
        level = bassLevel
      } else if (index < barCount * 0.5) {
        level = melodyLevel
      } else if (index < barCount * 0.75) {
        level = hatsLevel
      } else {
        level = padLevel
      }

      // Add some variation
      const variation = Math.sin(Date.now() * 0.002 + index * 0.2) * 0.2 + 0.8
      const targetHeight = barMaxHeight * level * variation

      // Smooth transition to target height
      const currentHeight = mesh.scale.y
      mesh.scale.y = THREE.MathUtils.lerp(currentHeight, targetHeight, 0.1)

      // Update y position to keep the bar grounded
      mesh.position.y = mesh.scale.y / 2
    })
  })

  return (
    <group ref={groupRef}>
      {bars.map((bar, index) => (
        <mesh
          key={index}
          position={bar.position as [number, number, number]}
          rotation={bar.rotation as [number, number, number]}
        >
          <boxGeometry args={[barWidth, 1, barWidth]} />
          <meshStandardMaterial
            color={bar.color}
            emissive={bar.color}
            emissiveIntensity={0.3}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      ))}
    </group>
  )
}

