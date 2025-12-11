import { memo } from 'react'
import type { Song } from '../types'
import { formatDuration } from '../utils/formatDuration'

interface SongRowProps {
  song: Song
  isCurrentSong?: boolean
  onPlay: (song: Song) => void
  showPlayNext?: boolean
}

export const SongRow = memo(function SongRow({
  song,
  isCurrentSong = false,
  onPlay,
  showPlayNext = true,
}: SongRowProps) {
  return (
    <div
      className={`flex items-center gap-4 p-2 rounded-lg cursor-pointer transition-colors
        hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500
        ${isCurrentSong ? 'bg-gray-700' : ''}`}
      onClick={() => onPlay(song)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onPlay(song)
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Play ${song.title} by ${song.artist}`}
      aria-current={isCurrentSong ? 'true' : undefined}
    >
      <img
        src={song.albumArt}
        alt={song.album}
        className="h-12 w-12 rounded object-cover flex-shrink-0"
        loading="lazy"
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{song.title}</p>
        <p className="text-sm text-gray-400 truncate">{song.artist}</p>
      </div>
      <span className="text-sm text-gray-400 flex-shrink-0">
        {formatDuration(song.duration)}
      </span>
    </div>
  )
})
