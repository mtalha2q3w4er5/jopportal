import type React from "react"

interface GradientBackgroundProps {
  children: React.ReactNode
  className?: string
}

export function GradientBackground({ children, className = "" }: GradientBackgroundProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#4A1E9E] via-[#6C3CE9] to-[#A259FF] ${className}`}>
      {children}
    </div>
  )
}
