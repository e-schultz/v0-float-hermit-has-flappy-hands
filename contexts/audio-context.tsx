"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import { audioEngine, type AudioLevel } from "@/lib/audio-engine"

interface AudioContextType {
  isPlaying: boolean
  masterVolume: number
  setMasterVolume: (volume: number) => void
  bassVolume: number
  setBassVolume: (volume: number) => void
  hatsVolume: number
  setHatsVolume: (volume: number) => void
  melodyVolume: number
  setMelodyVolume: (volume: number) => void
  padVolume: number
  setPadVolume: (volume: number) => void
  isMuted: boolean
  setIsMuted: (muted: boolean) => void
  audioData: React.RefObject<AudioLevel>
  visibleElements: {
    diamond: boolean
    circles: boolean
    lines: boolean
    mazes: boolean
    bars: boolean
    particles: boolean
  }
  toggleVisibility: (element: string) => void
}

interface AudioProviderProps {
  children: ReactNode
  isPlaying: boolean
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export function AudioProvider({ children, isPlaying }: AudioProviderProps) {
  const [masterVolume, setMasterVolume] = useState(audioEngine.masterVolume)
  const [bassVolume, setBassVolume] = useState(audioEngine.bassVolume)
  const [hatsVolume, setHatsVolume] = useState(audioEngine.hatsVolume)
  const [melodyVolume, setMelodyVolume] = useState(audioEngine.melodyVolume)
  const [padVolume, setPadVolume] = useState(audioEngine.padVolume)
  const [isMuted, setIsMuted] = useState(audioEngine.isMuted)
  const [visibleElements, setVisibleElements] = useState({
    diamond: true,
    circles: true,
    lines: true,
    mazes: true,
    bars: true,
    particles: true,
  })

  const toggleVisibility = (element: string) => {
    setVisibleElements((prev) => ({
      ...prev,
      [element]: !prev[element as keyof typeof prev],
    }))
  }

  const audioData = useRef<AudioLevel>({
    bassLevel: 0,
    hatsLevel: 0,
    melodyLevel: 0,
    padLevel: 0,
    averageLevel: 0,
  })

  // Set up audio level callback
  useEffect(() => {
    audioEngine.setAudioLevelCallback((levels) => {
      audioData.current = levels
    })
  }, [])

  // Handle play/pause
  useEffect(() => {
    if (audioEngine.isInitialized()) {
      if (isPlaying) {
        audioEngine.play()
      } else {
        audioEngine.pause()
      }
    }
  }, [isPlaying])

  // Handle volume changes
  useEffect(() => {
    audioEngine.masterVolume = masterVolume
  }, [masterVolume])

  useEffect(() => {
    audioEngine.bassVolume = bassVolume
  }, [bassVolume])

  useEffect(() => {
    audioEngine.hatsVolume = hatsVolume
  }, [hatsVolume])

  useEffect(() => {
    audioEngine.melodyVolume = melodyVolume
  }, [melodyVolume])

  useEffect(() => {
    audioEngine.padVolume = padVolume
  }, [padVolume])

  useEffect(() => {
    audioEngine.isMuted = isMuted
  }, [isMuted])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      audioEngine.cleanup()
    }
  }, [])

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        masterVolume,
        setMasterVolume,
        bassVolume,
        setBassVolume,
        hatsVolume,
        setHatsVolume,
        melodyVolume,
        setMelodyVolume,
        padVolume,
        setPadVolume,
        isMuted,
        setIsMuted,
        audioData,
        visibleElements,
        toggleVisibility,
      }}
    >
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio() {
  const context = useContext(AudioContext)
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider")
  }
  return context
}

