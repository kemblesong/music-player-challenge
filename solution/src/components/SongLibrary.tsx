import { useSongLibrary } from '../hooks/useSongLibrary'
import { useVirtualScroll } from '../hooks/useVirtualScroll'
import { useSearch } from '../hooks/useSearch'
import { usePlayer } from '../context/PlayerContext'
import { LoadingSpinner } from './LoadingSpinner'
import { ErrorMessage } from './ErrorMessage'
import { SearchBar } from './SearchBar'
import { SongRow } from './SongRow'

const ITEM_HEIGHT = 64

export function SongLibrary() {
  const { songs, isLoading, error, refetch } = useSongLibrary()
  const { searchQuery, setSearchQuery, filteredSongs } = useSearch(songs)
  const { currentSong, playSong, playNext } = usePlayer()

  const {
    startIndex,
    endIndex,
    offsetY,
    totalHeight,
    onScroll,
    scrollContainerRef,
  } = useVirtualScroll({
    itemHeight: ITEM_HEIGHT,
    totalItems: filteredSongs.length,
    bufferCount: 5,
  })

  if (isLoading) {
    return <LoadingSpinner message="Loading song library..." />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} />
  }

  if (songs.length === 0) {
    return (
      <div className="py-8 text-center text-gray-400">
        <p>No songs available</p>
      </div>
    )
  }

  const visibleSongs = filteredSongs.slice(startIndex, endIndex + 1)

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 mb-4">
        <h2 className="text-xl font-bold mb-2">Song Library</h2>
        <p className="text-sm text-gray-400 mb-4">
          {filteredSongs.length.toLocaleString()} songs
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by title or artist..."
        />
      </div>

      {filteredSongs.length === 0 ? (
        <div className="py-8 text-center text-gray-400">
          <p>No songs found matching "{searchQuery}"</p>
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          onScroll={onScroll}
          className="flex-1 overflow-y-auto"
        >
          <div style={{ height: totalHeight, position: 'relative' }}>
            <div style={{ transform: `translateY(${offsetY}px)` }}>
              {visibleSongs.map((song) => (
                <div key={song.id} style={{ height: ITEM_HEIGHT }}>
                  <SongRow
                    song={song}
                    isCurrentSong={currentSong?.id === song.id}
                    onPlay={(s) => playSong(s, filteredSongs)}
                    onPlayNext={playNext}
                    showPlayNext={true}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
