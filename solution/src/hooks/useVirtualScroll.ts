import { useState, useCallback, useRef, useEffect } from 'react'

interface UseVirtualScrollOptions {
  itemHeight: number
  totalItems: number
  bufferCount?: number
}

interface UseVirtualScrollReturn {
  startIndex: number
  endIndex: number
  offsetY: number
  totalHeight: number
  onScroll: (event: React.UIEvent<HTMLDivElement>) => void
  scrollContainerRef: React.RefObject<HTMLDivElement | null>
}

export function useVirtualScroll({
  itemHeight,
  totalItems,
  bufferCount = 5,
}: UseVirtualScrollOptions): UseVirtualScrollReturn {
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const prevTotalItems = useRef(totalItems)

  // Measure container height on mount and resize
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const updateHeight = () => {
      const height = container.clientHeight
      if (height > 0) {
        setContainerHeight(height)
      }
    }

    // Initial measurement after layout settles
    updateHeight()

    // Try multiple times to ensure we catch the layout when it's ready
    const timeoutId = setTimeout(updateHeight, 0)
    const rafId = requestAnimationFrame(() => {
      updateHeight()
      requestAnimationFrame(updateHeight)
    })

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.contentRect.height
        if (height > 0) {
          setContainerHeight(height)
        }
      }
    })
    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
      clearTimeout(timeoutId)
      cancelAnimationFrame(rafId)
    }
  }, [])

  // Reset scroll position when total items changes significantly (e.g., after filtering)
  useEffect(() => {
    if (totalItems !== prevTotalItems.current) {
      // If current scroll position would be beyond new content, reset to top
      const maxScrollTop = Math.max(0, totalItems * itemHeight - containerHeight)
      if (scrollTop > maxScrollTop) {
        setScrollTop(0)
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0
        }
      }
      prevTotalItems.current = totalItems
    }
  }, [totalItems, itemHeight, containerHeight, scrollTop])

  // Calculate visible range with buffer
  // Use a minimum of 10 items if container height hasn't been measured yet
  const visibleCount = containerHeight > 0 ? Math.ceil(containerHeight / itemHeight) : 10
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferCount)
  const endIndex = Math.min(
    totalItems - 1,
    Math.floor(scrollTop / itemHeight) + visibleCount + bufferCount
  )

  // Offset for positioning visible items
  const offsetY = startIndex * itemHeight

  // Total height for scrollbar
  const totalHeight = totalItems * itemHeight

  // Scroll handler with useCallback for stability
  const onScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop)
  }, [])

  return {
    startIndex,
    endIndex,
    offsetY,
    totalHeight,
    onScroll,
    scrollContainerRef,
  }
}
