import type { Song } from '../types'
import { SongRow } from './SongRow'
import { useVirtualScroll } from '../hooks/useVirtualScroll'

const ITEM_HEIGHT = 64

interface QueueProps {
  queue: Song[]
  currentSong: Song | null
  onPlaySong: (song: Song) => void
}

export function Queue({ queue, currentSong, onPlaySong }: QueueProps) {
  const {
    startIndex,
    endIndex,
    offsetY,
    totalHeight,
    onScroll,
    scrollContainerRef,
  } = useVirtualScroll({
    itemHeight: ITEM_HEIGHT,
    totalItems: queue.length,
    bufferCount: 5,
  })

  if (queue.length === 0) {
    return (
      <div className="py-8 text-center text-gray-400">
        <p>Queue is empty</p>
        <p className="text-sm mt-2">Songs you play will appear here</p>
      </div>
    )
  }

  const visibleSongs = queue.slice(startIndex, endIndex + 1)

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Up Next</h3>
        <span className="text-sm text-gray-400">{queue.length.toLocaleString()} songs</span>
      </div>
      <div
        ref={scrollContainerRef}
        onScroll={onScroll}
        className="overflow-y-auto flex-1"
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {visibleSongs.map((song) => (
              <div key={song.id} style={{ height: ITEM_HEIGHT }}>
                <SongRow
                  song={song}
                  isCurrentSong={currentSong?.id === song.id}
                  onPlay={() => onPlaySong(song)}
                  showPlayNext={false}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
