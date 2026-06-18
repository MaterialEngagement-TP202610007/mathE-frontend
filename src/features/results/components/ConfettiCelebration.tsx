import { useEffect, useState } from "react"
import Confetti from "react-confetti"

export function ConfettiCelebration() {
  const [dims, setDims] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })
  const [active, setActive] = useState(true)

  useEffect(() => {
    const onResize = () =>
      setDims({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener("resize", onResize)

    const stop = setTimeout(() => setActive(false), 5500)

    return () => {
      window.removeEventListener("resize", onResize)
      clearTimeout(stop)
    }
  }, [])

  if (!active) return null

  return (
    <Confetti
      width={dims.width}
      height={dims.height}
      recycle={false}
      numberOfPieces={450}
      gravity={0.14}
      initialVelocityY={12}
      colors={["#0056D2", "#003E9A", "#16825D", "#10B981", "#F59E0B", "#6366F1", "#EC4899"]}
      style={{ position: "fixed", top: 0, left: 0, zIndex: 9999, pointerEvents: "none" }}
    />
  )
}
