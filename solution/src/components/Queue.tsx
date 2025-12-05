import type { Song } from '../types'
import { SongRow } from './SongRow'

interface QueueProps {
  queue: Song[]
  currentSong: Song | null
  onPlaySong: (song: Song) => void
}

export function Queue({ queue, currentSong, onPlaySong }: QueueProps) {
  if (queue.length === 0) {
    return (
      <div className="py-8 text-center text-gray-400">
        <p>Queue is empty</p>
        <p className="text-sm mt-2">Songs you play will appear here</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Up Next</h3>
        <span className="text-sm text-gray-400">{queue.length} songs</span>
      </div>
      <div className="space-y-1 overflow-y-auto flex-1">
        {queue.map((song) => (
          <SongRow
            key={song.id}
            song={song}
            isCurrentSong={currentSong?.id === song.id}
            onPlay={() => onPlaySong(song)}
            showPlayNext={false}
          />
        ))}
      </div>
    </div>
  )
}
