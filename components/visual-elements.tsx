"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useAudio } from "@/contexts/audio-context"
import Diamond from "@/components/visuals/diamond"
import ConcentricCircles from "@/components/visuals/concentric-circles"
import PulsingLines from "@/components/visuals/pulsing-lines"
import CornerMazes from "@/components/visuals/corner-mazes"
import VerticalBars from "@/components/visuals/vertical-bars"
import SpiralParticles from "@/components/visuals/spiral-particles"

export default function VisualElements() {
  const { isPlaying, audioData, visibleElements } = useAudio()
  const groupRef = useRef(null)

  useFrame(() => {
    if (!isPlaying || !groupRef.current) return

    // Subtle group rotation based on bass
    if (groupRef.current && audioData.current) {
      groupRef.current.rotation.y += 0.001 + audioData.current.bassLevel * 0.001
    }
  })

  return (
    <group ref={groupRef}>
      {visibleElements.diamond && <Diamond />}
      {visibleElements.circles && <ConcentricCircles />}
      {visibleElements.lines && <PulsingLines />}
      {visibleElements.mazes && <CornerMazes />}
      {visibleElements.bars && <VerticalBars />}
      {visibleElements.particles && <SpiralParticles />}
    </group>
  )
}

