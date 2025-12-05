import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useQueue } from '../useQueue'
import type { Song } from '../../types'

// Mock the shuffle function
vi.mock('../../utils/shuffle', () => ({
  shuffle: vi.fn((array) => [...array].reverse()), // Simple mock: just reverse for predictability
}))

describe('useQueue', () => {
  const mockSongs: Song[] = [
    {
      id: '1',
      title: 'Song A',
      artist: 'Artist A',
      album: 'Album A',
      albumArt: 'art-a.jpg',
      duration: 180,
    },
    {
      id: '2',
      title: 'Song B',
      artist: 'Artist B',
      album: 'Album B',
      albumArt: 'art-b.jpg',
      duration: 200,
    },
    {
      id: '3',
      title: 'Song C',
      artist: 'Artist C',
      album: 'Album C',
      albumArt: 'art-c.jpg',
      duration: 220,
    },
    {
      id: '4',
      title: 'Song D',
      artist: 'Artist D',
      album: 'Album D',
      albumArt: 'art-d.jpg',
      duration: 240,
    },
    {
      id: '5',
      title: 'Song E',
      artist: 'Artist E',
      album: 'Album E',
      albumArt: 'art-e.jpg',
      duration: 260,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Part 1 - Task 2: Play a Song & Populate Queue', () => {
    it('initializes with no current song and empty queue', () => {
      const { result } = renderHook(() => useQueue())

      expect(result.current.currentSong).toBeNull()
      expect(result.current.queue).toEqual([])
      expect(result.current.isShuffled).toBe(false)
    })

    it('sets current song and populates queue with songs after clicked song', () => {
      const { result } = renderHook(() => useQueue())

      // Click on Song C (index 2)
      act(() => {
        result.current.playSong(mockSongs[2], mockSongs)
      })

      expect(result.current.currentSong).toEqual(mockSongs[2]) // Song C
      expect(result.current.queue).toEqual([mockSongs[3], mockSongs[4]]) // Songs D and E
    })

    it('creates empty queue when clicking the last song', () => {
      const { result } = renderHook(() => useQueue())

      // Click on Song E (last song, index 4)
      act(() => {
        result.current.playSong(mockSongs[4], mockSongs)
      })

      expect(result.current.currentSong).toEqual(mockSongs[4])
      expect(result.current.queue).toEqual([])
    })

    it('creates full queue when clicking the first song', () => {
      const { result } = renderHook(() => useQueue())

      // Click on Song A (first song, index 0)
      act(() => {
        result.current.playSong(mockSongs[0], mockSongs)
      })

      expect(result.current.currentSong).toEqual(mockSongs[0])
      expect(result.current.queue).toEqual([
        mockSongs[1],
        mockSongs[2],
        mockSongs[3],
        mockSongs[4],
      ])
    })
  })

  describe('Part 1 - Task 3: Play Next', () => {
    it('inserts song at the front of the queue', () => {
      const { result } = renderHook(() => useQueue())

      // Set up initial state: playing Song C, queue has D and E
      act(() => {
        result.current.playSong(mockSongs[2], mockSongs)
      })

      expect(result.current.queue).toEqual([mockSongs[3], mockSongs[4]])

      // Add Song B as "Play Next"
      act(() => {
        result.current.playNext(mockSongs[1])
      })

      expect(result.current.queue).toEqual([
        mockSongs[1], // B (play next)
        mockSongs[3], // D
        mockSongs[4], // E
      ])
    })

    it('adds song to empty queue', () => {
      const { result } = renderHook(() => useQueue())

      // Playing last song with empty queue
      act(() => {
        result.current.playSong(mockSongs[4], mockSongs)
      })

      expect(result.current.queue).toEqual([])

      // Add Song A as "Play Next"
      act(() => {
        result.current.playNext(mockSongs[0])
      })

      expect(result.current.queue).toEqual([mockSongs[0]])
    })

    it('allows multiple play next operations', () => {
      const { result } = renderHook(() => useQueue())

      act(() => {
        result.current.playSong(mockSongs[0], mockSongs)
      })

      // Add multiple songs via play next
      act(() => {
        result.current.playNext(mockSongs[4]) // E
      })
      act(() => {
        result.current.playNext(mockSongs[3]) // D
      })

      // Most recent play next should be at front
      expect(result.current.queue[0]).toEqual(mockSongs[3]) // D
      expect(result.current.queue[1]).toEqual(mockSongs[4]) // E
    })
  })

  describe('Part 1 - Task 4: Shuffle', () => {
    it('shuffles the queue when toggling shuffle on', () => {
      const { result } = renderHook(() => useQueue())

      // Set up queue
      act(() => {
        result.current.playSong(mockSongs[0], mockSongs)
      })

      const originalQueue = [...result.current.queue]

      // Toggle shuffle on
      act(() => {
        result.current.toggleShuffle()
      })

      expect(result.current.isShuffled).toBe(true)
      // Queue should be different (in our mock, it's reversed)
      expect(result.current.queue).not.toEqual(originalQueue)
    })

    it('restores original order when toggling shuffle off', () => {
      const { result } = renderHook(() => useQueue())

      // Set up queue
      act(() => {
        result.current.playSong(mockSongs[0], mockSongs)
      })

      const originalQueue = [...result.current.queue]

      // Shuffle on
      act(() => {
        result.current.toggleShuffle()
      })

      const shuffledQueue = [...result.current.queue]
      expect(shuffledQueue).not.toEqual(originalQueue)

      // Shuffle off - should restore original
      act(() => {
        result.current.toggleShuffle()
      })

      expect(result.current.isShuffled).toBe(false)
      expect(result.current.queue).toEqual(originalQueue)
    })

    it('resets shuffle state when playing a new song', () => {
      const { result } = renderHook(() => useQueue())

      // Set up and shuffle
      act(() => {
        result.current.playSong(mockSongs[0], mockSongs)
      })

      act(() => {
        result.current.toggleShuffle()
      })

      expect(result.current.isShuffled).toBe(true)

      // Play a different song
      act(() => {
        result.current.playSong(mockSongs[2], mockSongs)
      })

      // Shuffle should be reset
      expect(result.current.isShuffled).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('handles single song in playlist', () => {
      const { result } = renderHook(() => useQueue())
      const singleSong = [mockSongs[0]]

      act(() => {
        result.current.playSong(singleSong[0], singleSong)
      })

      expect(result.current.currentSong).toEqual(singleSong[0])
      expect(result.current.queue).toEqual([])
    })

    it('handles empty source array gracefully', () => {
      const { result } = renderHook(() => useQueue())

      act(() => {
        result.current.playSong(mockSongs[0], [])
      })

      // Should set current song even if not in source
      expect(result.current.currentSong).toEqual(mockSongs[0])
      expect(result.current.queue).toEqual([])
    })

    it('maintains queue integrity with rapid play next calls', () => {
      const { result } = renderHook(() => useQueue())

      act(() => {
        result.current.playSong(mockSongs[0], mockSongs)
      })

      // Rapid play next calls
      act(() => {
        result.current.playNext(mockSongs[4])
        result.current.playNext(mockSongs[3])
        result.current.playNext(mockSongs[2])
      })

      // All songs should be in queue
      expect(result.current.queue).toContain(mockSongs[2])
      expect(result.current.queue).toContain(mockSongs[3])
      expect(result.current.queue).toContain(mockSongs[4])
    })
  })
})
