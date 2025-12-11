import { useState, useMemo, useEffect } from 'react'
import type { Song } from '../types'

interface UseSearchReturn {
  searchQuery: string
  setSearchQuery: (query: string) => void
  filteredSongs: Song[]
}

export function useSearch(songs: Song[]): UseSearchReturn {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // Debounce the search query (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Filter songs based on debounced query
  const filteredSongs = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return songs
    }
    const query = debouncedQuery.toLowerCase()
    return songs.filter(
      (song) =>
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query)
    )
  }, [songs, debouncedQuery])

  return {
    searchQuery,
    setSearchQuery,
    filteredSongs,
  }
}
