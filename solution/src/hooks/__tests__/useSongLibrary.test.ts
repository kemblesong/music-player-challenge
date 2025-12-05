import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useSongLibrary } from '../useSongLibrary'
import type { Song } from '../../types'

// Mock fetch
global.fetch = vi.fn()

describe('useSongLibrary', () => {
  const mockSongs: Song[] = Array.from({ length: 100 }, (_, i) => ({
    id: `${i + 1}`,
    title: `Song ${String.fromCharCode(65 + (i % 26))}${i}`, // A0, B1, C2, etc.
    artist: `Artist ${i + 1}`,
    album: `Album ${i + 1}`,
    albumArt: `art${i + 1}.jpg`,
    duration: 180 + i * 5,
  }))

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Part 2: Fetch 10,000 Songs', () => {
    it('starts with loading state', () => {
      ;(global.fetch as any).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      const { result } = renderHook(() => useSongLibrary())

      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBeNull()
      expect(result.current.songs).toEqual([])
    })

    it('fetches songs successfully', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSongs,
      })

      const { result } = renderHook(() => useSongLibrary())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.songs).toEqual(mockSongs)
      expect(result.current.error).toBeNull()
    })

    it('fetches from correct endpoint', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSongs,
      })

      renderHook(() => useSongLibrary())

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/songs')
      })
    })

    it('handles fetch errors gracefully', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      })

      const { result } = renderHook(() => useSongLibrary())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeTruthy()
      expect(result.current.songs).toEqual([])
    })

    it('handles network errors', async () => {
      ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useSongLibrary())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeTruthy()
      expect(result.current.songs).toEqual([])
    })

    it('handles large dataset of 10,000 songs', async () => {
      const largeSongList: Song[] = Array.from({ length: 10000 }, (_, i) => ({
        id: `${i + 1}`,
        title: `Song ${i + 1}`,
        artist: `Artist ${i + 1}`,
        album: `Album ${i + 1}`,
        albumArt: `art${i + 1}.jpg`,
        duration: 180,
      }))

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => largeSongList,
      })

      const { result } = renderHook(() => useSongLibrary())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.songs).toHaveLength(10000)
    })

    it('only fetches once on mount', async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockSongs,
      })

      const { rerender } = renderHook(() => useSongLibrary())

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1)
      })

      // Rerender shouldn't trigger another fetch
      rerender()
      rerender()

      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('Part 2: Sorting Requirement', () => {
    it('receives songs sorted A-Z by title', async () => {
      const sortedSongs: Song[] = [
        {
          id: '1',
          title: 'Abbey Road',
          artist: 'The Beatles',
          album: 'Abbey Road',
          albumArt: 'abbey.jpg',
          duration: 180,
        },
        {
          id: '2',
          title: 'Bohemian Rhapsody',
          artist: 'Queen',
          album: 'A Night at the Opera',
          albumArt: 'bohemian.jpg',
          duration: 354,
        },
        {
          id: '3',
          title: 'Come Together',
          artist: 'The Beatles',
          album: 'Abbey Road',
          albumArt: 'come.jpg',
          duration: 259,
        },
      ]

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => sortedSongs,
      })

      const { result } = renderHook(() => useSongLibrary())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Verify songs are in alphabetical order
      const titles = result.current.songs.map((s) => s.title)
      expect(titles).toEqual(['Abbey Road', 'Bohemian Rhapsody', 'Come Together'])
    })
  })

  describe('Performance with Large Datasets', () => {
    it('handles 10,000 songs efficiently', async () => {
      const largeSongList: Song[] = Array.from({ length: 10000 }, (_, i) => ({
        id: `${i + 1}`,
        title: `Song ${String(i).padStart(5, '0')}`, // Song 00000, Song 00001, etc.
        artist: `Artist ${i + 1}`,
        album: `Album ${i + 1}`,
        albumArt: `art${i + 1}.jpg`,
        duration: 180,
      }))

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => largeSongList,
      })

      const startTime = performance.now()
      const { result } = renderHook(() => useSongLibrary())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const loadTime = performance.now() - startTime

      expect(result.current.songs).toHaveLength(10000)
      // Loading should complete reasonably quickly
      expect(loadTime).toBeLessThan(5000) // 5 seconds max for fetch + render
    })
  })

  describe('Data Validation', () => {
    it('validates song structure', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSongs,
      })

      const { result } = renderHook(() => useSongLibrary())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const song = result.current.songs[0]
      expect(song).toHaveProperty('id')
      expect(song).toHaveProperty('title')
      expect(song).toHaveProperty('artist')
      expect(song).toHaveProperty('album')
      expect(song).toHaveProperty('albumArt')
      expect(song).toHaveProperty('duration')
      expect(typeof song.duration).toBe('number')
    })
  })
})
