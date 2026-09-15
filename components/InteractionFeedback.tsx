"use client"

import { useEffect } from "react"

const INTERACTIVE_SELECTOR = [
  "a",
  "button",
  "summary",
  "select",
  "input[type=\"button\"]",
  "input[type=\"submit\"]",
  "input[type=\"reset\"]",
  "input[type=\"checkbox\"]",
  "input[type=\"radio\"]",
  "[role=\"button\"]",
  "[role=\"link\"]",
  "[role=\"menuitem\"]",
  "[role=\"option\"]",
  "[role=\"tab\"]",
  "[role=\"switch\"]",
  "[role=\"checkbox\"]",
  "[role=\"radio\"]",
  "[role=\"combobox\"]",
  "[role=\"slider\"]",
  "[role=\"spinbutton\"]",
  "[tabindex]:not([tabindex=\"-1\"])",
].join(", ")

let audioContext: AudioContext | null = null
let lastFeedbackAt = 0

function playClickSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return

    audioContext ??= new AudioContextClass()

    const playTone = () => {
      if (!audioContext || audioContext.state !== "running") return

      const oscillator = audioContext.createOscillator()
      const gain = audioContext.createGain()
      const now = audioContext.currentTime

      oscillator.type = "sine"
      oscillator.frequency.setValueAtTime(880, now)
      oscillator.frequency.exponentialRampToValueAtTime(520, now + 0.09)
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.16, now + 0.008)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11)

      oscillator.connect(gain)
      gain.connect(audioContext.destination)
      oscillator.start(now)
      oscillator.stop(now + 0.115)
    }

    if (audioContext.state === "suspended") {
      void audioContext.resume().then(playTone).catch(() => undefined)
    } else {
      playTone()
    }
  } catch {
    // Audio feedback is optional; never interfere with the control action.
  }
}

function createRipple(event: PointerEvent) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

  const ripple = document.createElement("span")
  const size = 42
  ripple.className = "interaction-feedback-ripple"
  ripple.style.width = `${size}px`
  ripple.style.height = `${size}px`
  ripple.style.left = `${event.clientX - size / 2}px`
  ripple.style.top = `${event.clientY - size / 2}px`

  document.body.appendChild(ripple)
  window.setTimeout(() => ripple.remove(), 280)
}

export default function InteractionFeedback() {
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return

      const target = event.target as Element | null
      const control = target?.closest(INTERACTIVE_SELECTOR) as HTMLElement | null
      if (!control || control.hasAttribute("disabled") || control.getAttribute("aria-disabled") === "true") return

      const now = performance.now()
      if (now - lastFeedbackAt < 45) return
      lastFeedbackAt = now

      createRipple(event)

      if (event.pointerType !== "mouse" && typeof navigator.vibrate === "function") {
        try {
          navigator.vibrate([25, 15, 25])
        } catch {
          // Haptic feedback is optional.
        }
      }

      // Audio is started directly from the user's pointer gesture.
      playClickSound()
    }

    document.addEventListener("pointerdown", handlePointerDown, { passive: true })
    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [])

  return null
}
