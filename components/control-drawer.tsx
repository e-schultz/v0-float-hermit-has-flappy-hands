"use client"

import { useState, useEffect, useRef } from "react"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { useAudio } from "@/contexts/audio-context"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Square,
  Circle,
  Hash,
  LayoutGrid,
  BarChart3,
  Sparkles,
  ChevronUp,
  Maximize,
  Minimize,
} from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

interface ControlDrawerProps {
  isPlaying: boolean
  setIsPlaying: (isPlaying: boolean) => void
}

export default function ControlDrawer({ isPlaying, setIsPlaying }: ControlDrawerProps) {
  const {
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
    visibleElements,
    toggleVisibility,
  } = useAudio()

  const [isExpanded, setIsExpanded] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const isMobile = useMobile()
  const drawerRef = useRef<HTMLDivElement>(null)

  // Close drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node) && isExpanded) {
        setIsExpanded(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isExpanded])

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  return (
    <>
      {/* Minimized control bar - always visible */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-10 transition-all duration-300 ease-in-out",
          isExpanded ? "opacity-0 pointer-events-none" : "opacity-100",
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 bg-black/40 backdrop-blur-md border-t border-white/10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-600/90 hover:bg-purple-600 transition-colors"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800/80 hover:bg-gray-700/80 transition-colors"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            <Slider
              value={[masterVolume * 100]}
              min={0}
              max={100}
              step={1}
              className="w-24 md:w-32"
              onValueChange={(value) => setMasterVolume(value[0] / 100)}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800/80 hover:bg-gray-700/80 transition-colors"
            >
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>

            <button
              onClick={() => setIsExpanded(true)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800/80 hover:bg-gray-700/80 transition-colors"
            >
              <ChevronUp size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded drawer */}
      <div
        ref={drawerRef}
        className={cn(
          "fixed inset-x-0 bottom-0 z-20 transition-all duration-300 ease-in-out",
          "bg-gradient-to-b from-black/60 via-black/70 to-black/80 backdrop-blur-lg",
          "border-t border-white/10 shadow-2xl",
          isExpanded ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none",
        )}
        style={{
          height: isMobile ? "85vh" : "380px",
          maxHeight: isMobile ? "85vh" : "380px",
        }}
      >
        {/* Close button */}
        <button
          onClick={() => setIsExpanded(false)}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-gray-800/80 hover:bg-gray-700/80 transition-colors"
        >
          <ChevronUp className="rotate-180" size={16} />
        </button>

        <div className="h-full overflow-auto px-4 py-6 text-white scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Main controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-purple-600/90 hover:bg-purple-600 transition-colors"
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>

                <div className="flex flex-col">
                  <span className="text-sm font-medium">Master Volume</span>
                  <span className="text-xs text-gray-400">{Math.round(masterVolume * 100)}%</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800/80 hover:bg-gray-700/80 transition-colors"
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>

                <Slider
                  value={[masterVolume * 100]}
                  min={0}
                  max={100}
                  step={1}
                  className="w-32 md:w-48"
                  onValueChange={(value) => setMasterVolume(value[0] / 100)}
                />
              </div>
            </div>

            {/* Visual elements toggles */}
            <div>
              <h3 className="text-sm font-medium mb-4">Visual Elements</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Square className="text-pink-400" size={16} />
                    <span>Diamond</span>
                  </div>
                  <Switch
                    checked={visibleElements.diamond}
                    onCheckedChange={() => toggleVisibility("diamond")}
                    className="data-[state=checked]:bg-pink-600"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Circle className="text-blue-400" size={16} />
                    <span>Circles</span>
                  </div>
                  <Switch
                    checked={visibleElements.circles}
                    onCheckedChange={() => toggleVisibility("circles")}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hash className="text-green-400" size={16} />
                    <span>Lines</span>
                  </div>
                  <Switch
                    checked={visibleElements.lines}
                    onCheckedChange={() => toggleVisibility("lines")}
                    className="data-[state=checked]:bg-green-600"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="text-yellow-400" size={16} />
                    <span>Mazes</span>
                  </div>
                  <Switch
                    checked={visibleElements.mazes}
                    onCheckedChange={() => toggleVisibility("mazes")}
                    className="data-[state=checked]:bg-yellow-600"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="text-purple-400" size={16} />
                    <span>Bars</span>
                  </div>
                  <Switch
                    checked={visibleElements.bars}
                    onCheckedChange={() => toggleVisibility("bars")}
                    className="data-[state=checked]:bg-purple-600"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-orange-400" size={16} />
                    <span>Particles</span>
                  </div>
                  <Switch
                    checked={visibleElements.particles}
                    onCheckedChange={() => toggleVisibility("particles")}
                    className="data-[state=checked]:bg-orange-600"
                  />
                </div>
              </div>
            </div>

            {/* Audio controls */}
            <div>
              <h3 className="text-sm font-medium mb-4">Audio Controls</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Bass</span>
                    <span className="text-xs text-gray-400 font-mono">{Math.round(bassVolume * 100)}%</span>
                  </div>
                  <Slider
                    value={[bassVolume * 100]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => setBassVolume(value[0] / 100)}
                    className="mb-6"
                  />

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Hi-hats</span>
                    <span className="text-xs text-gray-400 font-mono">{Math.round(hatsVolume * 100)}%</span>
                  </div>
                  <Slider
                    value={[hatsVolume * 100]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => setHatsVolume(value[0] / 100)}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Melody</span>
                    <span className="text-xs text-gray-400 font-mono">{Math.round(melodyVolume * 100)}%</span>
                  </div>
                  <Slider
                    value={[melodyVolume * 100]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => setMelodyVolume(value[0] / 100)}
                    className="mb-6"
                  />

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Ambient</span>
                    <span className="text-xs text-gray-400 font-mono">{Math.round(padVolume * 100)}%</span>
                  </div>
                  <Slider
                    value={[padVolume * 100]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => setPadVolume(value[0] / 100)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

