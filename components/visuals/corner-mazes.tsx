"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { useAudio } from "@/contexts/audio-context"
import * as THREE from "three"

export default function CornerMazes() {
  const { audioData } = useAudio()
  const groupRef = useRef<THREE.Group>(null)

  const mazeSize = 1.5
  const cornerPositions = [
    [-6, -6, 0], // bottom left
    [6, -6, 0], // bottom right
    [-6, 6, 0], // top left
    [6, 6, 0], // top right
  ]

  const mazeGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const vertices = []

    // Create a maze-like pattern
    const gridSize = 5
    const cellSize = mazeSize / gridSize

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if ((i + j) % 2 === 0) continue // Skip some cells for maze effect

        const x1 = (i / gridSize) * mazeSize - mazeSize / 2
        const y1 = (j / gridSize) * mazeSize - mazeSize / 2
        const x2 = ((i + 1) / gridSize) * mazeSize - mazeSize / 2
        const y2 = ((j + 1) / gridSize) * mazeSize - mazeSize / 2

        // Horizontal lines
        vertices.push(x1, y1, 0, x2, y1, 0)
        vertices.push(x1, y2, 0, x2, y2, 0)

        // Vertical lines
        vertices.push(x1, y1, 0, x1, y2, 0)
        vertices.push(x2, y1, 0, x2, y2, 0)
      }
    }

    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3))
    return geometry
  }, [mazeSize])

  useFrame(() => {
    if (!groupRef.current || !audioData.current) return

    const { hatsLevel, padLevel } = audioData.current

    // Rotate mazes based on hats
    groupRef.current.children.forEach((child, index) => {
      child.rotation.z = Math.sin(Date.now() * 0.001 + index) * 0.2 + hatsLevel * 0.5
    })

    // Scale based on pad
    const scale = 1 + padLevel * 0.3
    groupRef.current.scale.set(scale, scale, scale)
  })

  return (
    <group ref={groupRef}>
      {cornerPositions.map((position, index) => (
        <lineSegments key={index} position={position as [number, number, number]}>
          <primitive object={mazeGeometry} attach="geometry" />
          <lineBasicMaterial
            attach="material"
            color={new THREE.Color().setHSL(index * 0.25, 0.7, 0.5)}
            linewidth={1}
            opacity={0.7}
            transparent={true}
          />
        </lineSegments>
      ))}
    </group>
  )
}

