"use client"

import { audioEngine } from "@/lib/audio-engine"

// This hook is not currently used in the application
export function useAnalyser() {
  // Get analyzers from the audio engine
  return audioEngine.getAnalyzers()
}

