"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { useAudio } from "@/contexts/audio-context"
import * as THREE from "three"

export default function SpiralParticles() {
  const { audioData } = useAudio()
  const pointsRef = useRef<THREE.Points>(null)

  const particleCount = 2000
  const radius = 8

  const particles = useMemo(() => {
    const temp = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      const angle = (i / particleCount) * Math.PI * 20
      const spiralRadius = (i / particleCount) * radius

      temp[i3] = Math.cos(angle) * spiralRadius
      temp[i3 + 1] = (i / particleCount) * 4 - 2 // Spread vertically
      temp[i3 + 2] = Math.sin(angle) * spiralRadius

      // Color gradient based on position
      const color = new THREE.Color().setHSL(i / particleCount, 0.8, 0.5)
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b
    }

    return { positions: temp, colors }
  }, [particleCount, radius])

  useFrame(() => {
    if (!pointsRef.current || !audioData.current) return

    const { averageLevel, melodyLevel } = audioData.current

    // Rotate based on average level
    pointsRef.current.rotation.y += 0.002 + averageLevel * 0.01

    // Scale based on melody
    const scale = 1 + melodyLevel * 0.3
    pointsRef.current.scale.set(scale, scale, scale)

    // Update particle positions for animation
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3

      // Add subtle movement
      positions[i3] += Math.sin(Date.now() * 0.001 + i * 0.01) * 0.01 * averageLevel
      positions[i3 + 1] += Math.cos(Date.now() * 0.001 + i * 0.01) * 0.01 * averageLevel
      positions[i3 + 2] += Math.sin(Date.now() * 0.001 + i * 0.02) * 0.01 * averageLevel
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={particles.positions} count={particleCount} itemSize={3} />
        <bufferAttribute attach="attributes-color" array={particles.colors} count={particleCount} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} vertexColors transparent opacity={0.8} sizeAttenuation />
    </points>
  )
}

