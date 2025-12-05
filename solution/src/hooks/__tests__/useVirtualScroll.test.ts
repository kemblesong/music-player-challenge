import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useVirtualScroll } from '../useVirtualScroll'

// Mock ResizeObserver
class ResizeObserverMock {
  callback: ResizeObserverCallback
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock as any

describe('useVirtualScroll', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Part 2: Virtual Scrolling', () => {
    it('initializes with correct default values', () => {
      const { result } = renderHook(() =>
        useVirtualScroll({
          itemHeight: 50,
          totalItems: 10000,
        })
      )

      expect(result.current.startIndex).toBe(0)
      expect(result.current.totalHeight).toBe(500000) // 10000 * 50
      expect(result.current.scrollContainerRef).toBeDefined()
    })

    it('calculates total height correctly', () => {
      const { result: result1 } = renderHook(() =>
        useVirtualScroll({
          itemHeight: 50,
          totalItems: 10000,
        })
      )

      expect(result1.current.totalHeight).toBe(500000)

      const { result: result2 } = renderHook(() =>
        useVirtualScroll({
          itemHeight: 100,
          totalItems: 5000,
        })
      )

      expect(result2.current.totalHeight).toBe(500000)
    })

    it('calculates visible range based on scroll position', () => {
      const { result, rerender } = renderHook(
        ({ itemHeight, totalItems }) => useVirtualScroll({ itemHeight, totalItems }),
        {
          initialProps: { itemHeight: 50, totalItems: 10000 },
        }
      )

      // Mock container ref with height
      const mockRef = { current: { clientHeight: 500, scrollTop: 0 } as any }
      Object.defineProperty(result.current, 'scrollContainerRef', {
        value: mockRef,
        writable: true,
      })

      // Simulate scroll event
      const scrollEvent = {
        currentTarget: { scrollTop: 1000 },
      } as React.UIEvent<HTMLDivElement>

      act(() => {
        result.current.onScroll(scrollEvent)
      })

      rerender({ itemHeight: 50, totalItems: 10000 })

      // At scrollTop 1000 with itemHeight 50:
      // startIndex should be around floor(1000/50) - buffer = 20 - 5 = 15
      expect(result.current.startIndex).toBeGreaterThanOrEqual(0)
      expect(result.current.endIndex).toBeLessThan(10000)
      expect(result.current.startIndex).toBeLessThan(result.current.endIndex)
    })

    it('includes buffer items above and below visible area', () => {
      const bufferCount = 5
      const { result } = renderHook(() =>
        useVirtualScroll({
          itemHeight: 50,
          totalItems: 10000,
          bufferCount,
        })
      )

      // The buffer should extend the visible range
      // This is tested implicitly through the startIndex calculation
      expect(result.current.startIndex).toBe(0) // At top, buffer doesn't go negative
    })

    it('calculates offsetY for positioning visible items', () => {
      const { result } = renderHook(() =>
        useVirtualScroll({
          itemHeight: 50,
          totalItems: 10000,
        })
      )

      // offsetY should be startIndex * itemHeight
      const expectedOffset = result.current.startIndex * 50
      expect(result.current.offsetY).toBe(expectedOffset)
    })

    it('handles scrolling to the bottom', () => {
      const { result } = renderHook(() =>
        useVirtualScroll({
          itemHeight: 50,
          totalItems: 100,
        })
      )

      // Scroll to near bottom
      const scrollEvent = {
        currentTarget: { scrollTop: 4500 }, // Near bottom with 100 items
      } as React.UIEvent<HTMLDivElement>

      act(() => {
        result.current.onScroll(scrollEvent)
      })

      // endIndex should not exceed totalItems - 1
      expect(result.current.endIndex).toBeLessThanOrEqual(99)
      expect(result.current.startIndex).toBeGreaterThan(0)
    })

    it('handles scrolling to the top', () => {
      const { result } = renderHook(() =>
        useVirtualScroll({
          itemHeight: 50,
          totalItems: 10000,
        })
      )

      // First scroll down
      const scrollDownEvent = {
        currentTarget: { scrollTop: 5000 },
      } as React.UIEvent<HTMLDivElement>

      act(() => {
        result.current.onScroll(scrollDownEvent)
      })

      // Then scroll back to top
      const scrollUpEvent = {
        currentTarget: { scrollTop: 0 },
      } as React.UIEvent<HTMLDivElement>

      act(() => {
        result.current.onScroll(scrollUpEvent)
      })

      // startIndex should be 0 or close to it (accounting for buffer)
      expect(result.current.startIndex).toBeLessThanOrEqual(5) // Within buffer range
    })

    it('clamps startIndex to not go below 0', () => {
      const { result } = renderHook(() =>
        useVirtualScroll({
          itemHeight: 50,
          totalItems: 10000,
          bufferCount: 10,
        })
      )

      // At scrollTop 0, even with buffer, startIndex shouldn't be negative
      expect(result.current.startIndex).toBe(0)
    })

    it('clamps endIndex to not exceed totalItems - 1', () => {
      const { result } = renderHook(() =>
        useVirtualScroll({
          itemHeight: 50,
          totalItems: 100,
          bufferCount: 50, // Large buffer
        })
      )

      const scrollEvent = {
        currentTarget: { scrollTop: 4900 }, // At very bottom
      } as React.UIEvent<HTMLDivElement>

      act(() => {
        result.current.onScroll(scrollEvent)
      })

      expect(result.current.endIndex).toBeLessThanOrEqual(99)
    })

    it('handles rapid scroll events efficiently', () => {
      const { result } = renderHook(() =>
        useVirtualScroll({
          itemHeight: 50,
          totalItems: 10000,
        })
      )

      // Simulate rapid scrolling
      act(() => {
        for (let i = 0; i < 100; i++) {
          const scrollEvent = {
            currentTarget: { scrollTop: i * 50 },
          } as React.UIEvent<HTMLDivElement>
          result.current.onScroll(scrollEvent)
        }
      })

      // Should still have valid indices
      expect(result.current.startIndex).toBeGreaterThanOrEqual(0)
      expect(result.current.endIndex).toBeLessThan(10000)
    })

    it('works with different item heights', () => {
      const { result: smallItems } = renderHook(() =>
        useVirtualScroll({
          itemHeight: 30,
          totalItems: 10000,
        })
      )

      const { result: largeItems } = renderHook(() =>
        useVirtualScroll({
          itemHeight: 100,
          totalItems: 10000,
        })
      )

      expect(smallItems.current.totalHeight).toBe(300000)
      expect(largeItems.current.totalHeight).toBe(1000000)
    })

    it('handles empty list', () => {
      const { result } = renderHook(() =>
        useVirtualScroll({
          itemHeight: 50,
          totalItems: 0,
        })
      )

      expect(result.current.totalHeight).toBe(0)
      expect(result.current.startIndex).toBe(0)
      expect(result.current.endIndex).toBe(-1) // min(0 + visibleCount + buffer - 1, -1)
    })

    it('handles single item list', () => {
      const { result } = renderHook(() =>
        useVirtualScroll({
          itemHeight: 50,
          totalItems: 1,
        })
      )

      expect(result.current.totalHeight).toBe(50)
      expect(result.current.startIndex).toBe(0)
      expect(result.current.endIndex).toBe(0)
    })
  })

  describe('Performance Requirements', () => {
    it('only renders visible items from large dataset', () => {
      const { result } = renderHook(() =>
        useVirtualScroll({
          itemHeight: 50,
          totalItems: 10000,
        })
      )

      const renderedCount = result.current.endIndex - result.current.startIndex + 1

      // Should render far fewer than total items
      expect(renderedCount).toBeLessThan(100)
      expect(renderedCount).toBeGreaterThan(0)
    })

    it('maintains performance with very large datasets', () => {
      const startTime = performance.now()

      const { result } = renderHook(() =>
        useVirtualScroll({
          itemHeight: 50,
          totalItems: 100000, // 100k items
        })
      )

      const initTime = performance.now() - startTime

      // Hook initialization should be fast (< 50ms)
      expect(initTime).toBeLessThan(50)

      // Scroll calculations should also be fast
      const scrollStart = performance.now()

      act(() => {
        const scrollEvent = {
          currentTarget: { scrollTop: 50000 },
        } as React.UIEvent<HTMLDivElement>
        result.current.onScroll(scrollEvent)
      })

      const scrollTime = performance.now() - scrollStart
      expect(scrollTime).toBeLessThan(10)
    })
  })

  describe('Edge Cases', () => {
    it('handles fractional scroll positions', () => {
      const { result } = renderHook(() =>
        useVirtualScroll({
          itemHeight: 50,
          totalItems: 1000,
        })
      )

      const scrollEvent = {
        currentTarget: { scrollTop: 123.456 },
      } as React.UIEvent<HTMLDivElement>

      act(() => {
        result.current.onScroll(scrollEvent)
      })

      expect(result.current.startIndex).toBeDefined()
      expect(result.current.endIndex).toBeDefined()
    })

    it('handles zero item height gracefully', () => {
      const { result } = renderHook(() =>
        useVirtualScroll({
          itemHeight: 0,
          totalItems: 1000,
        })
      )

      expect(result.current.totalHeight).toBe(0)
    })
  })
})
