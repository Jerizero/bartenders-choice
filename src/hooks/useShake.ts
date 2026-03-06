import { useEffect, useRef, useState, useCallback } from 'react'

const SHAKE_THRESHOLD = 15
const DEBOUNCE_MS = 1000

export default function useShake(onShake: () => void) {
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [supported, setSupported] = useState(true)
  const lastShake = useRef(0)
  const lastAccel = useRef({ x: 0, y: 0, z: 0 })

  const requestPermission = useCallback(async () => {
    // iOS 13+ requires explicit permission request from user gesture
    const DME = DeviceMotionEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>
    }
    if (typeof DME.requestPermission === 'function') {
      try {
        const result = await DME.requestPermission()
        if (result === 'granted') {
          setPermissionGranted(true)
          return true
        }
        return false
      } catch {
        setSupported(false)
        return false
      }
    }
    // Android / desktop — no permission needed
    setPermissionGranted(true)
    return true
  }, [])

  useEffect(() => {
    if (!permissionGranted) return
    if (!('DeviceMotionEvent' in window)) {
      setSupported(false)
      return
    }

    const handler = (e: DeviceMotionEvent) => {
      const { x, y, z } = e.accelerationIncludingGravity || {}
      if (x == null || y == null || z == null) return

      const dx = Math.abs(x - lastAccel.current.x)
      const dy = Math.abs(y - lastAccel.current.y)
      const dz = Math.abs(z - lastAccel.current.z)

      lastAccel.current = { x, y, z }

      if (dx + dy + dz > SHAKE_THRESHOLD) {
        const now = Date.now()
        if (now - lastShake.current > DEBOUNCE_MS) {
          lastShake.current = now
          onShake()
        }
      }
    }

    window.addEventListener('devicemotion', handler)
    return () => window.removeEventListener('devicemotion', handler)
  }, [permissionGranted, onShake])

  return { permissionGranted, supported, requestPermission }
}
