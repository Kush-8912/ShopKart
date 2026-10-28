import { useEffect, useRef, useState } from 'react'

const CLICKABLE = 'a, button, select, label, summary, [role="button"], input[type="checkbox"], input[type="radio"], input[type="submit"]'
// Typing keeps the normal I-beam cursor (see index.css), so the custom one hides there
const TEXT_FIELD = 'input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"]), textarea, [contenteditable="true"]'

const RING_SCALE = { default: 1, hover: 1.6, disabled: 1, text: 0.5 }

// ShopKart's cursor: a dot that sits exactly on the pointer and a ring that eases after it,
// growing over anything clickable. Only for a mouse/trackpad; touch screens are untouched.
// The native cursor is hidden only once this has mounted, so a failed script never leaves
// the user without a cursor.
function CustomCursor() {
  const [enabled] = useState(() => window.matchMedia('(hover: hover) and (pointer: fine)').matches)
  const dotRef = useRef(null)
  const ringRef = useRef(null)

  useEffect(() => {
    if (!enabled) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const root = document.documentElement
    root.classList.add('has-custom-cursor')

    const dot = dotRef.current
    const ring = ringRef.current
    const pointer = { x: -100, y: -100 }
    const ringPos = { x: -100, y: -100 }
    let state = 'default'
    let pressed = false
    let scale = 1
    let frame = 0

    const setVisible = (visible) => {
      dot.style.opacity = visible && state !== 'text' ? '1' : '0'
      ring.style.opacity = visible && state !== 'text' ? '1' : '0'
    }

    const render = () => {
      // The ring covers a fraction of the remaining distance each frame, which gives the trail
      const ease = reduceMotion ? 1 : 0.2
      ringPos.x += (pointer.x - ringPos.x) * ease
      ringPos.y += (pointer.y - ringPos.y) * ease
      const targetScale = RING_SCALE[state] * (pressed ? 0.8 : 1)
      scale += (targetScale - scale) * (reduceMotion ? 1 : 0.25)

      dot.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0) translate(-50%, -50%)`
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%) scale(${scale})`

      // Keep animating until the ring has caught up, then rest until the next move
      const moving = Math.abs(pointer.x - ringPos.x) > 0.1 || Math.abs(pointer.y - ringPos.y) > 0.1 || Math.abs(targetScale - scale) > 0.005
      frame = moving ? requestAnimationFrame(render) : 0
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(render) }

    const stateFor = (el) => {
      if (!(el instanceof Element)) return 'default'
      if (el.closest(TEXT_FIELD)) return 'text'
      const clickable = el.closest(CLICKABLE)
      if (!clickable) return 'default'
      return clickable.matches(':disabled') || clickable.closest('fieldset:disabled') ? 'disabled' : 'hover'
    }

    const onMove = (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return
      pointer.x = e.clientX
      pointer.y = e.clientY
      const next = stateFor(e.target)
      if (next !== state) {
        state = next
        ring.dataset.state = state
        dot.dataset.state = state
      }
      setVisible(true)
      schedule()
    }
    const onDown = () => { pressed = true; schedule() }
    const onUp = () => { pressed = false; schedule() }
    // Leaving the window, or moving into an iframe such as Razorpay Checkout,
    // which draws its own cursor
    const onOut = (e) => {
      if (!e.relatedTarget || e.relatedTarget.tagName === 'IFRAME') setVisible(false)
    }
    const onBlur = () => setVisible(false)

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    document.addEventListener('mouseout', onOut)
    window.addEventListener('blur', onBlur)

    return () => {
      cancelAnimationFrame(frame)
      root.classList.remove('has-custom-cursor')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.removeEventListener('mouseout', onOut)
      window.removeEventListener('blur', onBlur)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden="true"
        data-state="default"
        className="pointer-events-none fixed top-0 left-0 z-[9999] w-8 h-8 rounded-full border-[1.5px] border-brand-300/70 opacity-0 transition-[opacity,background-color,border-color] duration-200 data-[state=hover]:bg-brand-400/20 data-[state=hover]:border-brand-500 data-[state=disabled]:border-zinc-500/60"
      />
      <div
        ref={dotRef}
        aria-hidden="true"
        data-state="default"
        className="pointer-events-none fixed top-0 left-0 z-[9999] w-1.5 h-1.5 rounded-full bg-brand-300 opacity-0 transition-[opacity,background-color] duration-200 data-[state=hover]:bg-brand-600 data-[state=disabled]:bg-zinc-500"
      />
    </>
  )
}

export default CustomCursor
