import * as Tone from "tone"

// Define types for our audio system
export type AudioLevel = {
  bassLevel: number
  hatsLevel: number
  melodyLevel: number
  padLevel: number
  averageLevel: number
}

// Singleton audio engine to ensure we have only one instance
class AudioEngine {
  private static instance: AudioEngine

  // Audio state
  private initialized = false
  private playing = false

  // Volume controls
  private _masterVolume = 0.7
  private _bassVolume = 0.8
  private _hatsVolume = 0.6
  private _melodyVolume = 0.7
  private _padVolume = 0.5
  private _isMuted = false

  // Audio components
  private bassSynth: Tone.Synth | null = null
  private hatsSynth: Tone.NoiseSynth | null = null
  private melodySynth: Tone.Synth | null = null
  private padSynth: Tone.PolySynth | null = null

  // Effects
  private bassFilter: Tone.Filter | null = null
  private bassAnalyser: Tone.Analyser | null = null
  private hatsFilter: Tone.Filter | null = null
  private hatsAnalyser: Tone.Analyser | null = null
  private melodyDelay: Tone.FeedbackDelay | null = null
  private melodyAnalyser: Tone.Analyser | null = null
  private padReverb: Tone.Reverb | null = null
  private padAnalyser: Tone.Analyser | null = null

  // Patterns
  private bassPattern: Tone.Pattern<string> | null = null
  private hatsLoop: Tone.Loop | null = null
  private melodyLoop: Tone.Loop | null = null
  private padLoop: Tone.Loop | null = null

  // Callback for audio level updates
  private onAudioLevelUpdate: ((levels: AudioLevel) => void) | null = null

  // Private constructor to enforce singleton
  private constructor() {}

  // Get the singleton instance
  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine()
    }
    return AudioEngine.instance
  }

  // Initialize the audio engine
  public async initialize(): Promise<boolean> {
    if (this.initialized) return true

    try {
      console.log("Initializing audio engine...")

      // Start the audio context - this must be called in response to a user gesture
      await Tone.start()
      console.log("Audio context started:", Tone.context.state)

      // Create synths
      this.createSynths()

      // Create effects
      this.createEffects()

      // Connect everything
      this.connectAudio()

      // Set initial volumes
      this.updateVolumes()

      this.initialized = true
      console.log("Audio engine initialized successfully")
      return true
    } catch (error) {
      console.error("Failed to initialize audio engine:", error)
      this.cleanup()
      return false
    }
  }

  // Create all synths
  private createSynths(): void {
    // Bass synth
    this.bassSynth = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: {
        attack: 0.05,
        decay: 0.2,
        sustain: 0.2,
        release: 0.5,
      },
    })

    // Hi-hats
    this.hatsSynth = new Tone.NoiseSynth({
      noise: { type: "white" },
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0.01,
        release: 0.1,
      },
    })

    // Melody synth
    this.melodySynth = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.3,
        release: 0.5,
      },
    })

    // Pad synth
    this.padSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sine" },
      envelope: {
        attack: 0.5,
        decay: 0.5,
        sustain: 0.8,
        release: 2,
      },
    })
  }

  // Create all effects
  private createEffects(): void {
    // Bass effects
    this.bassFilter = new Tone.Filter(100, "lowpass")
    this.bassAnalyser = new Tone.Analyser("waveform", 32)

    // Hats effects
    this.hatsFilter = new Tone.Filter(8000, "highpass")
    this.hatsAnalyser = new Tone.Analyser("waveform", 32)

    // Melody effects
    this.melodyDelay = new Tone.FeedbackDelay("8n", 0.3)
    this.melodyAnalyser = new Tone.Analyser("waveform", 32)

    // Pad effects
    this.padReverb = new Tone.Reverb(4)
    this.padAnalyser = new Tone.Analyser("waveform", 32)
  }

  // Connect audio nodes
  private connectAudio(): void {
    // Bass chain
    if (this.bassSynth && this.bassFilter && this.bassAnalyser) {
      this.bassSynth.connect(this.bassFilter)
      this.bassFilter.connect(this.bassAnalyser)
      this.bassFilter.connect(Tone.Destination)
    }

    // Hats chain
    if (this.hatsSynth && this.hatsFilter && this.hatsAnalyser) {
      this.hatsSynth.connect(this.hatsFilter)
      this.hatsFilter.connect(this.hatsAnalyser)
      this.hatsFilter.connect(Tone.Destination)
    }

    // Melody chain
    if (this.melodySynth && this.melodyDelay && this.melodyAnalyser) {
      this.melodySynth.connect(this.melodyDelay)
      this.melodyDelay.connect(this.melodyAnalyser)
      this.melodyDelay.connect(Tone.Destination)
    }

    // Pad chain
    if (this.padSynth && this.padReverb && this.padAnalyser) {
      this.padSynth.connect(this.padReverb)
      this.padReverb.connect(this.padAnalyser)
      this.padReverb.connect(Tone.Destination)
    }
  }

  // Create and start all patterns
  private createPatterns(): void {
    console.log("Creating audio patterns")

    // Clean up any existing patterns first
    this.disposePatterns()

    // Bass pattern
    if (this.bassSynth) {
      this.bassPattern = new Tone.Pattern(
        (time, note) => {
          if (this.bassSynth) {
            this.bassSynth.triggerAttackRelease(note, "8n", time, 1.0)
          }
        },
        ["C2", "C2", "G1", "C2"],
        "up",
      )
      this.bassPattern.interval = "8n"
      this.bassPattern.start(0)
    }

    // Hi-hats pattern
    if (this.hatsSynth) {
      this.hatsLoop = new Tone.Loop((time) => {
        if (this.hatsSynth) {
          this.hatsSynth.triggerAttackRelease("16n", time, 0.8)
        }
      }, "8n")
      this.hatsLoop.start("4n")
    }

    // Melody pattern
    if (this.melodySynth) {
      const melodyNotes = ["C4", "E4", "G4", "B4", "A4", "G4"]
      let melodyIndex = 0

      this.melodyLoop = new Tone.Loop((time) => {
        if (this.melodySynth && Math.random() > 0.1) {
          const note = melodyNotes[melodyIndex]
          this.melodySynth.triggerAttackRelease(note, "8n", time, 0.9)
          melodyIndex = (melodyIndex + 1) % melodyNotes.length
        }
      }, "4n")
      this.melodyLoop.start(0)
    }

    // Pad pattern
    if (this.padSynth) {
      const padChords = [
        ["C3", "E3", "G3", "B3"],
        ["A2", "C3", "E3", "G3"],
        ["F2", "A2", "C3", "E3"],
        ["G2", "B2", "D3", "F3"],
      ]
      let padIndex = 0

      this.padLoop = new Tone.Loop((time) => {
        if (this.padSynth) {
          const chord = padChords[padIndex]
          this.padSynth.triggerAttackRelease(chord, "2m", time, 0.7)
          padIndex = (padIndex + 1) % padChords.length
        }
      }, "2m")
      this.padLoop.start(0)
    }

    // Set tempo
    Tone.Transport.bpm.value = 90
  }

  // Dispose of all patterns
  private disposePatterns(): void {
    if (this.bassPattern) {
      this.bassPattern.dispose()
      this.bassPattern = null
    }

    if (this.hatsLoop) {
      this.hatsLoop.dispose()
      this.hatsLoop = null
    }

    if (this.melodyLoop) {
      this.melodyLoop.dispose()
      this.melodyLoop = null
    }

    if (this.padLoop) {
      this.padLoop.dispose()
      this.padLoop = null
    }
  }

  // Start playback
  public play(): void {
    if (!this.initialized) {
      console.warn("Cannot play: Audio engine not initialized")
      return
    }

    if (this.playing) return

    try {
      console.log("Starting audio playback")

      // Create patterns if they don't exist
      if (!this.bassPattern && !this.hatsLoop && !this.melodyLoop && !this.padLoop) {
        this.createPatterns()
      }

      // Start the transport
      if (Tone.Transport.state !== "started") {
        Tone.Transport.start()
      }

      this.playing = true

      // Start the analysis loop
      this.startAnalysis()
    } catch (error) {
      console.error("Error starting playback:", error)
    }
  }

  // Pause playback
  public pause(): void {
    if (!this.playing) return

    try {
      console.log("Pausing audio playback")

      // Pause the transport
      if (Tone.Transport.state === "started") {
        Tone.Transport.pause()
      }

      this.playing = false
    } catch (error) {
      console.error("Error pausing playback:", error)
    }
  }

  // Start the analysis loop
  private startAnalysis(): void {
    if (!this.playing) return

    const analyzeAudio = () => {
      if (!this.playing) return

      try {
        // Get analyzer data
        const bassValues = this.bassAnalyser?.getValue() || []
        const hatsValues = this.hatsAnalyser?.getValue() || []
        const melodyValues = this.melodyAnalyser?.getValue() || []
        const padValues = this.padAnalyser?.getValue() || []

        // Calculate levels
        const bassLevel = this.calculateLevel(bassValues)
        const hatsLevel = this.calculateLevel(hatsValues)
        const melodyLevel = this.calculateLevel(melodyValues)
        const padLevel = this.calculateLevel(padValues)
        const averageLevel = (bassLevel + hatsLevel + melodyLevel + padLevel) / 4

        // Call the update callback if it exists
        if (this.onAudioLevelUpdate) {
          this.onAudioLevelUpdate({
            bassLevel,
            hatsLevel,
            melodyLevel,
            padLevel,
            averageLevel,
          })
        }

        // Schedule the next analysis
        if (this.playing) {
          requestAnimationFrame(analyzeAudio)
        }
      } catch (error) {
        console.error("Error in audio analysis:", error)
      }
    }

    // Start the analysis loop
    requestAnimationFrame(analyzeAudio)
  }

  // Calculate audio level from analyzer data
  private calculateLevel(data: Float32Array | number[]): number {
    if (!data.length) return 0

    // Tone.js analyzer values are typically between -1 and 1, so normalize to 0-1
    const sum = Array.from(data).reduce((acc, val) => acc + Math.abs(val), 0)
    return Math.min((sum / data.length) * 2, 1) // Scale up a bit and clamp to 1
  }

  // Update all volumes
  private updateVolumes(): void {
    // Master volume
    const masterVolumeValue = this._isMuted ? Number.NEGATIVE_INFINITY : Tone.gainToDb(this._masterVolume)
    Tone.Destination.volume.value = masterVolumeValue

    // Individual volumes
    if (this.bassSynth) {
      this.bassSynth.volume.value = Tone.gainToDb(this._bassVolume)
    }

    if (this.hatsSynth) {
      this.hatsSynth.volume.value = Tone.gainToDb(this._hatsVolume)
    }

    if (this.melodySynth) {
      this.melodySynth.volume.value = Tone.gainToDb(this._melodyVolume)
    }

    if (this.padSynth) {
      this.padSynth.volume.value = Tone.gainToDb(this._padVolume)
    }
  }

  // Clean up all resources
  public cleanup(): void {
    console.log("Cleaning up audio engine")

    // Stop playback
    this.pause()

    // Dispose of patterns
    this.disposePatterns()

    // Dispose of synths
    if (this.bassSynth) {
      this.bassSynth.dispose()
      this.bassSynth = null
    }

    if (this.hatsSynth) {
      this.hatsSynth.dispose()
      this.hatsSynth = null
    }

    if (this.melodySynth) {
      this.melodySynth.dispose()
      this.melodySynth = null
    }

    if (this.padSynth) {
      this.padSynth.dispose()
      this.padSynth = null
    }

    // Dispose of effects
    if (this.bassFilter) {
      this.bassFilter.dispose()
      this.bassFilter = null
    }

    if (this.bassAnalyser) {
      this.bassAnalyser.dispose()
      this.bassAnalyser = null
    }

    if (this.hatsFilter) {
      this.hatsFilter.dispose()
      this.hatsFilter = null
    }

    if (this.hatsAnalyser) {
      this.hatsAnalyser.dispose()
      this.hatsAnalyser = null
    }

    if (this.melodyDelay) {
      this.melodyDelay.dispose()
      this.melodyDelay = null
    }

    if (this.melodyAnalyser) {
      this.melodyAnalyser.dispose()
      this.melodyAnalyser = null
    }

    if (this.padReverb) {
      this.padReverb.dispose()
      this.padReverb = null
    }

    if (this.padAnalyser) {
      this.padAnalyser.dispose()
      this.padAnalyser = null
    }

    // Reset state
    this.initialized = false
    this.playing = false

    // Cancel any pending transport events
    Tone.Transport.cancel()
  }

  // Getters and setters for volume controls

  public get masterVolume(): number {
    return this._masterVolume
  }

  public set masterVolume(value: number) {
    this._masterVolume = value
    this.updateVolumes()
  }

  public get bassVolume(): number {
    return this._bassVolume
  }

  public set bassVolume(value: number) {
    this._bassVolume = value
    this.updateVolumes()
  }

  public get hatsVolume(): number {
    return this._hatsVolume
  }

  public set hatsVolume(value: number) {
    this._hatsVolume = value
    this.updateVolumes()
  }

  public get melodyVolume(): number {
    return this._melodyVolume
  }

  public set melodyVolume(value: number) {
    this._melodyVolume = value
    this.updateVolumes()
  }

  public get padVolume(): number {
    return this._padVolume
  }

  public set padVolume(value: number) {
    this._padVolume = value
    this.updateVolumes()
  }

  public get isMuted(): boolean {
    return this._isMuted
  }

  public set isMuted(value: boolean) {
    this._isMuted = value
    this.updateVolumes()
  }

  // Set the callback for audio level updates
  public setAudioLevelCallback(callback: (levels: AudioLevel) => void): void {
    this.onAudioLevelUpdate = callback
  }

  // Get the analyzers for visualization
  public getAnalyzers() {
    return {
      bassAnalyser: this.bassAnalyser,
      hatsAnalyser: this.hatsAnalyser,
      melodyAnalyser: this.melodyAnalyser,
      padAnalyser: this.padAnalyser,
    }
  }

  // Check if the audio engine is initialized
  public isInitialized(): boolean {
    return this.initialized
  }

  // Check if the audio is playing
  public isPlaying(): boolean {
    return this.playing
  }
}

// Export the singleton instance
export const audioEngine = AudioEngine.getInstance()

