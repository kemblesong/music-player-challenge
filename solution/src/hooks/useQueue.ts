import { useState, useCallback } from 'react'
import type { Song } from '../types'
import { shuffle } from '../utils/shuffle'

interface UseQueueReturn {
  currentSong: Song | null
  queue: Song[]
  isShuffled: boolean
  playSong: (song: Song, sourceSongs: Song[]) => void
  playNext: (song: Song) => void
  toggleShuffle: () => void
}

export function useQueue(): UseQueueReturn {
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [queue, setQueue] = useState<Song[]>([])
  const [originalQueue, setOriginalQueue] = useState<Song[]>([])
  const [isShuffled, setIsShuffled] = useState(false)

  const playSong = useCallback((song: Song, sourceSongs: Song[]) => {
    // Find the index of the clicked song
    const clickedIndex = sourceSongs.findIndex((s) => s.id === song.id)

    // Set current song and populate queue with songs after the clicked one
    setCurrentSong(song)
    const newQueue = sourceSongs.slice(clickedIndex + 1)
    setQueue(newQueue)
    setOriginalQueue(newQueue)

    // Reset shuffle state when starting a new song from source
    setIsShuffled(false)
  }, [])

  const playNext = useCallback((song: Song) => {
    // Insert song at the front of the queue
    setQueue((q) => [song, ...q])
    // Also update original queue if we're not shuffled
    setOriginalQueue((q) => [song, ...q])
  }, [])

  const toggleShuffle = useCallback(() => {
    setIsShuffled((prev) => {
      if (!prev) {
        // Turning shuffle ON - shuffle the current queue
        setQueue((q) => shuffle(q))
        return true
      } else {
        // Turning shuffle OFF - restore original order
        setQueue(originalQueue)
        return false
      }
    })
  }, [originalQueue])

  return {
    currentSong,
    queue,
    isShuffled,
    playSong,
    playNext,
    toggleShuffle,
  }
}
