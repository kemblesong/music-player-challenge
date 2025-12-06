import { useMemo, useCallback, useState } from 'react'
import { useSongLibrary } from '../hooks/useSongLibrary'
import { useVirtualScroll } from '../hooks/useVirtualScroll'
import { useSearch } from '../hooks/useSearch'
import { usePlayer } from '../context/PlayerContext'
import { LoadingSpinner } from './LoadingSpinner'
import { ErrorMessage } from './ErrorMessage'
import { SearchBar } from './SearchBar'
import { SongRow } from './SongRow'
import { AlphabeticalJump } from './AlphabeticalJump'
import type { Song } from '../types'

const ITEM_HEIGHT = 64

type GroupBy = 'none' | 'artist' | 'album'

type ListItem =
  | { type: 'header'; label: string }
  | { type: 'song'; song: Song }

export function SongLibrary() {
  const { songs, isLoading, error, refetch } = useSongLibrary()
  const { searchQuery, setSearchQuery, filteredSongs } = useSearch(songs)
  const { currentSong, playSong, playNext } = usePlayer()
  const [groupBy, setGroupBy] = useState<GroupBy>('none')

  // Build grouped list items (headers + songs)
  const listItems = useMemo((): ListItem[] => {
    if (groupBy === 'none') {
      return filteredSongs.map((song) => ({ type: 'song', song }))
    }

    const grouped = new Map<string, Song[]>()
    for (const song of filteredSongs) {
      const key = groupBy === 'artist' ? song.artist : song.album
      if (!grouped.has(key)) {
        grouped.set(key, [])
      }
      grouped.get(key)!.push(song)
    }

    // Sort groups alphabetically
    const sortedKeys = Array.from(grouped.keys()).sort((a, b) =>
      a.localeCompare(b)
    )

    const items: ListItem[] = []
    for (const key of sortedKeys) {
      items.push({ type: 'header', label: key })
      for (const song of grouped.get(key)!) {
        items.push({ type: 'song', song })
      }
    }

    return items
  }, [filteredSongs, groupBy])

  // Extract just songs for play functionality
  const songsInList = useMemo(
    () => listItems.filter((item): item is { type: 'song'; song: Song } => item.type === 'song').map((item) => item.song),
    [listItems]
  )

  const {
    startIndex,
    endIndex,
    offsetY,
    totalHeight,
    onScroll,
    scrollContainerRef,
    scrollToIndex,
  } = useVirtualScroll({
    itemHeight: ITEM_HEIGHT,
    totalItems: listItems.length,
    bufferCount: 5,
  })

  // Build letter index map and available letters (only when not grouped)
  const { letterIndexMap, availableLetters } = useMemo(() => {
    const indexMap = new Map<string, number>()
    const letters = new Set<string>()

    if (groupBy !== 'none') {
      return { letterIndexMap: indexMap, availableLetters: letters }
    }

    listItems.forEach((item, index) => {
      if (item.type === 'song') {
        const firstChar = item.song.title.charAt(0).toUpperCase()
        if (/[A-Z]/.test(firstChar)) {
          letters.add(firstChar)
          if (!indexMap.has(firstChar)) {
            indexMap.set(firstChar, index)
          }
        }
      }
    })

    return { letterIndexMap: indexMap, availableLetters: letters }
  }, [listItems, groupBy])

  const handleLetterClick = useCallback((letter: string) => {
    const index = letterIndexMap.get(letter)
    if (index !== undefined) {
      scrollToIndex(index)
    }
  }, [letterIndexMap, scrollToIndex])

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

  const visibleItems = listItems.slice(startIndex, endIndex + 1)

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
        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm text-gray-400">Group by:</span>
          <div className="flex gap-2">
            {(['none', 'artist', 'album'] as const).map((option) => (
              <button
                key={option}
                onClick={() => setGroupBy(option)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  groupBy === option
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {option === 'none' ? 'None' : option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {listItems.length === 0 ? (
        <div className="py-8 text-center text-gray-400">
          <p>No songs found matching "{searchQuery}"</p>
        </div>
      ) : (
        <div className="flex flex-1 min-h-0">
          <div
            ref={scrollContainerRef}
            onScroll={onScroll}
            className="flex-1 overflow-y-auto"
          >
            <div style={{ height: totalHeight, position: 'relative' }}>
              <div style={{ transform: `translateY(${offsetY}px)` }}>
                {visibleItems.map((item) => {
                  if (item.type === 'header') {
                    return (
                      <div
                        key={`header-${item.label}`}
                        style={{ height: ITEM_HEIGHT }}
                        className="flex items-center px-4 bg-gray-800 border-b border-gray-700"
                      >
                        <h3 className="text-lg font-semibold text-white truncate">
                          {item.label}
                        </h3>
                      </div>
                    )
                  }
                  return (
                    <div key={item.song.id} style={{ height: ITEM_HEIGHT }}>
                      <SongRow
                        song={item.song}
                        isCurrentSong={currentSong?.id === item.song.id}
                        onPlay={(s) => playSong(s, songsInList)}
                        onPlayNext={playNext}
                        showPlayNext={true}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          {groupBy === 'none' && (
            <div className="flex-shrink-0 ml-1">
              <AlphabeticalJump
                availableLetters={availableLetters}
                onLetterClick={handleLetterClick}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
