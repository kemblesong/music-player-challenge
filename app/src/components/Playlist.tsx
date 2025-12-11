import { usePlaylist } from '../hooks/usePlaylist'
import { usePlayer } from '../context/PlayerContext'
import { LoadingSpinner } from './LoadingSpinner'
import { ErrorMessage } from './ErrorMessage'
import { SongRow } from './SongRow'

export function Playlist() {
  const { playlist, songs, isLoading, error, refetch } = usePlaylist()
  const { currentSong, playSong } = usePlayer()

  if (isLoading) {
    return <LoadingSpinner message="Loading playlist..." />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} />
  }

  if (!playlist || songs.length === 0) {
    return (
      <div className="py-8 text-center text-gray-400">
        <p>No songs in playlist</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-xl font-bold">{playlist.name}</h2>
        <p className="text-sm text-gray-400">{songs.length} songs</p>
      </div>
      <div className="space-y-1 overflow-y-auto flex-1">
        {songs.map((song) => (
          <SongRow
            key={song.id}
            song={song}
            isCurrentSong={currentSong?.id === song.id}
            onPlay={(s) => playSong(s, songs)}
            showPlayNext={false}
          />
        ))}
      </div>
    </div>
  )
}
