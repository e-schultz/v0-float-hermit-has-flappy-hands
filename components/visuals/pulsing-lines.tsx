"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { useAudio } from "@/contexts/audio-context"
import * as THREE from "three"

export default function PulsingLines() {
  const { audioData } = useAudio()
  const groupRef = useRef<THREE.Group>(null)

  const lineCount = 12
  const radius = 5

  const lines = useMemo(() => {
    const temp = []
    for (let i = 0; i < lineCount; i++) {
      const angle = (i / lineCount) * Math.PI * 2
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius

      temp.push({
        start: new THREE.Vector3(0, 0, 0),
        end: new THREE.Vector3(x, y, 0),
        color: new THREE.Color().setHSL(i / lineCount, 0.8, 0.5),
      })
    }
    return temp
  }, [lineCount, radius])

  useFrame(() => {
    if (!groupRef.current || !audioData.current) return

    const { melodyLevel, bassLevel } = audioData.current

    // Rotate based on melody
    groupRef.current.rotation.z += 0.003 + melodyLevel * 0.01

    // Scale lines based on bass
    const children = groupRef.current.children
    for (let i = 0; i < children.length; i++) {
      const line = children[i] as THREE.Line
      const scale = 1 + bassLevel * Math.sin(Date.now() * 0.001 + i * 0.5) * 0.5
      line.scale.set(1, scale, 1)
    }
  })

  return (
    <group ref={groupRef}>
      {lines.map((line, index) => (
        <line key={index}>
          <bufferGeometry attach="geometry">
            <bufferAttribute
              attach="attributes-position"
              array={new Float32Array([line.start.x, line.start.y, line.start.z, line.end.x, line.end.y, line.end.z])}
              count={2}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial attach="material" color={line.color} linewidth={1} />
        </line>
      ))}
    </group>
  )
}

