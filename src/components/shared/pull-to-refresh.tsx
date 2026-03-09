'use client'

import { useCallback, useRef, useState, type ReactNode } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { RefreshCw } from 'lucide-react'

const PULL_THRESHOLD = 80
const MAX_PULL = 120

interface PullToRefreshProps {
  children: ReactNode
  onRefresh: () => Promise<void> | void
}

export function PullToRefresh({ children, onRefresh }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const touchStartY = useRef(0)
  const touchStartScrollTop = useRef(0)
  const isPulling = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const pullDistance = useMotionValue(0)
  const indicatorOpacity = useTransform(pullDistance, [0, PULL_THRESHOLD * 0.5, PULL_THRESHOLD], [0, 0.5, 1])
  const indicatorScale = useTransform(pullDistance, [0, PULL_THRESHOLD], [0.6, 1])
  const indicatorRotation = useTransform(pullDistance, [0, MAX_PULL], [0, 180])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isRefreshing) return
    const scrollContainer = containerRef.current
    // Only enable pull if we're scrolled to top
    const scrollTop = scrollContainer?.scrollTop ?? window.scrollY
    if (scrollTop > 5) return

    touchStartY.current = e.touches[0].clientY
    touchStartScrollTop.current = scrollTop
    isPulling.current = true
  }, [isRefreshing])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling.current || isRefreshing) return

    const currentY = e.touches[0].clientY
    const delta = currentY - touchStartY.current

    if (delta > 0) {
      // Pulling down — apply resistance curve
      const distance = Math.min(delta * 0.5, MAX_PULL)
      pullDistance.set(distance)
    } else {
      pullDistance.set(0)
      isPulling.current = false
    }
  }, [isRefreshing, pullDistance])

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current) return
    isPulling.current = false

    const currentPull = pullDistance.get()

    if (currentPull >= PULL_THRESHOLD && !isRefreshing) {
      // Trigger refresh
      setIsRefreshing(true)
      pullDistance.set(PULL_THRESHOLD * 0.6) // Hold at partial position

      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
        pullDistance.set(0)
      }
    } else {
      // Snap back
      pullDistance.set(0)
    }
  }, [pullDistance, isRefreshing, onRefresh])

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull indicator */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center"
        style={{
          opacity: indicatorOpacity,
          y: useTransform(pullDistance, (v) => v - 40),
        }}
      >
        <motion.div
          className="flex h-8 w-8 items-center justify-center rounded-full bg-muted"
          style={{ scale: indicatorScale }}
        >
          {isRefreshing ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            >
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          ) : (
            <motion.div style={{ rotate: indicatorRotation }}>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div style={{ y: pullDistance }}>
        {children}
      </motion.div>
    </div>
  )
}
