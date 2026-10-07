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
].join(", ")

let lastFeedbackAt = 0

function createRipple(event: PointerEvent) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

  const ripple = document.createElement("span")
  const size = 36
  ripple.className = "interaction-feedback-ripple"
  ripple.style.width = `${size}px`
  ripple.style.height = `${size}px`
  ripple.style.left = `${event.clientX - size / 2}px`
  ripple.style.top = `${event.clientY - size / 2}px`

  document.body.appendChild(ripple)
  window.setTimeout(() => ripple.remove(), 220)
}

export default function InteractionFeedback() {
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return

      const target = event.target as Element | null
      const control = target?.closest(INTERACTIVE_SELECTOR) as HTMLElement | null
      if (!control || control.hasAttribute("disabled") || control.getAttribute("aria-disabled") === "true") return

      // Flipbook controls use their own page-turn audio; never add the global click tone there.
      const insideFlipbook = control.closest("[data-flipbook-reader=\"true\"]") !== null

      const now = performance.now()
      if (now - lastFeedbackAt < 60) return
      lastFeedbackAt = now

      // Never do visual/audio/haptic work inside the input event itself.
      // The control must remain free to process its click/tap immediately.
      window.requestAnimationFrame(() => createRipple(event))

      if (event.pointerType !== "mouse") {
        window.setTimeout(() => {
          if (typeof navigator.vibrate === "function") {
            try {
              navigator.vibrate(18)
            } catch {
              // Haptic feedback is optional.
            }
          }
        }, 0)
      }
    }

    document.addEventListener("pointerdown", handlePointerDown, { passive: true })
    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [])

  return null
}
