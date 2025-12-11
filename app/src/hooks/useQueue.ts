import { useState, useCallback } from 'react'
import type { Song } from '../types'

interface UseQueueReturn {
  currentSong: Song | null
  queue: Song[]
  isShuffled: boolean
  playSong: (song: Song, sourceSongs: Song[]) => void
  toggleShuffle: () => void
}

export function useQueue(): UseQueueReturn {
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [queue, setQueue] = useState<Song[]>([])
  const [isShuffled, setIsShuffled] = useState(false)

  const playSong = useCallback((song: Song, sourceSongs: Song[]) => {
    // Find the index of the clicked song
    const clickedIndex = sourceSongs.findIndex((s) => s.id === song.id)

    // Set current song and populate queue with songs after the clicked one
    setCurrentSong(song)
    // BUG #1: Off-by-one error - includes current song in queue
    const newQueue = sourceSongs.slice(clickedIndex)
    setQueue(newQueue)
    setIsShuffled(false)
  }, [])

  const toggleShuffle = useCallback(() => {
    if (!isShuffled) {
      // BUG #2: TWO ISSUES:
      // 1. Mutates state with sort() instead of using immutable shuffle
      // 2. Shuffles current song into queue (should only shuffle queue)
      const allSongs = [currentSong, ...queue]
      allSongs.sort(() => Math.random() - 0.5)
      setQueue(allSongs)
      setIsShuffled(true)
    } else {
      // When disabling shuffle, restore original order
      // Note: Original order is lost, so this won't work correctly
      setIsShuffled(false)
    }
  }, [currentSong, queue, isShuffled])

  return {
    currentSong,
    queue,
    isShuffled,
    playSong,
    toggleShuffle,
  }
}
