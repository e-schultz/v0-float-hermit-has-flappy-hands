"use client"

import { useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { AudioProvider } from "@/contexts/audio-context"
import ControlDrawer from "@/components/control-drawer"
import VisualElements from "@/components/visual-elements"
import { audioEngine } from "@/lib/audio-engine"

export default function AudioVisualExperience() {
  const [isAudioInitialized, setIsAudioInitialized] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const handleStartExperience = async () => {
    try {
      // Initialize the audio engine
      const success = await audioEngine.initialize()

      if (success) {
        setIsAudioInitialized(true)
        setIsPlaying(true)
      } else {
        console.error("Failed to initialize audio")
        alert("Failed to initialize audio. Please try again.")
      }
    } catch (error) {
      console.error("Error starting experience:", error)
      alert("An error occurred while starting the experience. Please try again.")
    }
  }

  return (
    <div className="relative w-full h-screen bg-black">
      {!isAudioInitialized && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <button
            onClick={handleStartExperience}
            className="px-6 py-3 text-lg font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Start Experience
          </button>
        </div>
      )}

      <AudioProvider isPlaying={isPlaying}>
        <Canvas className="w-full h-full" camera={{ position: [0, 0, 10], fov: 75 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <VisualElements />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            rotateSpeed={0.5}
            autoRotate={true}
            autoRotateSpeed={0.5}
          />
        </Canvas>

        {isAudioInitialized && <ControlDrawer isPlaying={isPlaying} setIsPlaying={setIsPlaying} />}
      </AudioProvider>
    </div>
  )
}

