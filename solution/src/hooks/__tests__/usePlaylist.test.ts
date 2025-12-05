import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { usePlaylist } from '../usePlaylist'
import type { Playlist } from '../../types'

// Mock fetch
global.fetch = vi.fn()

describe('usePlaylist', () => {
  const mockPlaylist: Playlist = {
    id: '1',
    name: 'Test Playlist',
    songs: [
      {
        id: '1',
        title: 'Song 1',
        artist: 'Artist 1',
        album: 'Album 1',
        albumArt: 'art1.jpg',
        duration: 180,
      },
      {
        id: '2',
        title: 'Song 2',
        artist: 'Artist 2',
        album: 'Album 2',
        albumArt: 'art2.jpg',
        duration: 200,
      },
    ],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Part 1 - Task 1: Fetch & Display Playlist', () => {
    it('starts with loading state', () => {
      ;(global.fetch as any).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      const { result } = renderHook(() => usePlaylist())

      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBeNull()
      expect(result.current.playlist).toBeNull()
    })

    it('fetches playlist successfully', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlaylist,
      })

      const { result } = renderHook(() => usePlaylist())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.playlist).toEqual(mockPlaylist)
      expect(result.current.error).toBeNull()
    })

    it('fetches from correct endpoint', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlaylist,
      })

      renderHook(() => usePlaylist())

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/playlists/1')
      })
    })

    it('handles fetch errors gracefully', async () => {
      const errorMessage = 'Failed to fetch playlist'
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: errorMessage,
      })

      const { result } = renderHook(() => usePlaylist())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeTruthy()
      expect(result.current.playlist).toBeNull()
    })

    it('handles network errors', async () => {
      ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => usePlaylist())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeTruthy()
      expect(result.current.playlist).toBeNull()
    })

    it('handles JSON parse errors', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON')
        },
      })

      const { result } = renderHook(() => usePlaylist())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeTruthy()
      expect(result.current.playlist).toBeNull()
    })

    it('handles empty playlist', async () => {
      const emptyPlaylist: Playlist = {
        id: '1',
        name: 'Empty Playlist',
        songs: [],
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => emptyPlaylist,
      })

      const { result } = renderHook(() => usePlaylist())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.playlist).toEqual(emptyPlaylist)
      expect(result.current.playlist?.songs).toHaveLength(0)
    })

    it('only fetches once on mount', async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockPlaylist,
      })

      const { rerender } = renderHook(() => usePlaylist())

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1)
      })

      // Rerender shouldn't trigger another fetch
      rerender()
      rerender()

      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('Data Validation', () => {
    it('validates playlist structure', async () => {
      const validPlaylist = {
        id: '1',
        name: 'Test',
        songs: [
          {
            id: '1',
            title: 'Song',
            artist: 'Artist',
            album: 'Album',
            albumArt: 'art.jpg',
            duration: 180,
          },
        ],
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => validPlaylist,
      })

      const { result } = renderHook(() => usePlaylist())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.playlist).toEqual(validPlaylist)
      expect(result.current.playlist?.songs[0]).toHaveProperty('id')
      expect(result.current.playlist?.songs[0]).toHaveProperty('title')
      expect(result.current.playlist?.songs[0]).toHaveProperty('artist')
      expect(result.current.playlist?.songs[0]).toHaveProperty('album')
      expect(result.current.playlist?.songs[0]).toHaveProperty('albumArt')
      expect(result.current.playlist?.songs[0]).toHaveProperty('duration')
    })

    it('handles playlist with 20 songs (spec requirement)', async () => {
      const largPlaylist: Playlist = {
        id: '1',
        name: 'Large Playlist',
        songs: Array.from({ length: 20 }, (_, i) => ({
          id: `${i + 1}`,
          title: `Song ${i + 1}`,
          artist: `Artist ${i + 1}`,
          album: `Album ${i + 1}`,
          albumArt: `art${i + 1}.jpg`,
          duration: 180 + i * 10,
        })),
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => largPlaylist,
      })

      const { result } = renderHook(() => usePlaylist())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.playlist?.songs).toHaveLength(20)
    })
  })
})
