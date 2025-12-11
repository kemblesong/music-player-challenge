import { createContext, useContext, type ReactNode } from 'react'
import { useQueue } from '../hooks/useQueue'
import type { Song } from '../types'

interface PlayerContextValue {
  currentSong: Song | null
  queue: Song[]
  isShuffled: boolean
  playSong: (song: Song, sourceSongs: Song[]) => void
  toggleShuffle: () => void
}

const PlayerContext = createContext<PlayerContextValue | null>(null)

interface PlayerProviderProps {
  children: ReactNode
}

export function PlayerProvider({ children }: PlayerProviderProps) {
  const queueState = useQueue()

  return (
    <PlayerContext.Provider value={queueState}>
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer(): PlayerContextValue {
  const context = useContext(PlayerContext)
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider')
  }
  return context
}
