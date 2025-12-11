import { useState, useEffect, useCallback } from 'react'
import type { Song } from '../types'

interface UseSongLibraryReturn {
  songs: Song[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useSongLibrary(): UseSongLibraryReturn {
  const [songs, setSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSongs = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/songs')
      if (!response.ok) {
        throw new Error(`Failed to fetch songs: ${response.status}`)
      }
      const data: Song[] = await response.json()
      setSongs(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSongs()
  }, [fetchSongs])

  return {
    songs,
    isLoading,
    error,
    refetch: fetchSongs,
  }
}
