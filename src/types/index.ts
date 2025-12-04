/**
 * Represents a single song in the music player
 */
export interface Song {
  /** Unique identifier for the song */
  id: string
  /** Song title */
  title: string
  /** Artist name */
  artist: string
  /** Album name */
  album: string
  /** URL to the album artwork image */
  albumArt: string
  /** Duration of the song in seconds */
  duration: number
}

/**
 * Represents a playlist containing multiple songs
 */
export interface Playlist {
  /** Unique identifier for the playlist */
  id: string
  /** Playlist name */
  name: string
  /** Array of songs in the playlist */
  songs: Song[]
}
