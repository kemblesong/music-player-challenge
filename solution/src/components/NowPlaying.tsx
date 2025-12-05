import type { Song } from '../types'
import { formatDuration } from '../utils/formatDuration'

interface NowPlayingProps {
  song: Song | null
}

export function NowPlaying({ song }: NowPlayingProps) {
  if (!song) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-24 w-24 mb-4 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
        <p>Select a song to play</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center text-center">
      <img
        src={song.albumArt}
        alt={song.album}
        className="h-48 w-48 rounded-lg shadow-lg object-cover mb-4"
      />
      <h2 className="text-xl font-bold truncate max-w-full">{song.title}</h2>
      <p className="text-gray-400 truncate max-w-full">{song.artist}</p>
      <p className="text-sm text-gray-500 truncate max-w-full">{song.album}</p>
      <p className="text-sm text-gray-500 mt-2">{formatDuration(song.duration)}</p>
    </div>
  )
}
