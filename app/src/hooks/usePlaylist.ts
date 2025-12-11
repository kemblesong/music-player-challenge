import { useState, useEffect, useCallback } from 'react'
import type { Playlist, Song } from '../types'

interface UsePlaylistReturn {
  playlist: Playlist | null
  songs: Song[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function usePlaylist(): UsePlaylistReturn {
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPlaylist = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/playlists/1')
      if (!response.ok) {
        throw new Error(`Failed to fetch playlist: ${response.status}`)
      }
      const data: Playlist = await response.json()
      setPlaylist(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPlaylist()
  }, [fetchPlaylist])

  return {
    playlist,
    songs: playlist?.songs ?? [],
    isLoading,
    error,
    refetch: fetchPlaylist,
  }
}
