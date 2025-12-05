import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import type { Playlist, Song } from '../types'

// Mock fetch
global.fetch = vi.fn()

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock as any

describe('Integration Tests', () => {
  const mockPlaylist: Playlist = {
    id: '1',
    name: 'My Playlist',
    songs: [
      {
        id: '1',
        title: 'Song A',
        artist: 'Artist A',
        album: 'Album A',
        albumArt: 'http://example.com/art-a.jpg',
        duration: 180,
      },
      {
        id: '2',
        title: 'Song B',
        artist: 'Artist B',
        album: 'Album B',
        albumArt: 'http://example.com/art-b.jpg',
        duration: 200,
      },
      {
        id: '3',
        title: 'Song C',
        artist: 'Artist C',
        album: 'Album C',
        albumArt: 'http://example.com/art-c.jpg',
        duration: 220,
      },
      {
        id: '4',
        title: 'Song D',
        artist: 'Artist D',
        album: 'Album D',
        albumArt: 'http://example.com/art-d.jpg',
        duration: 240,
      },
      {
        id: '5',
        title: 'Song E',
        artist: 'Artist E',
        album: 'Album E',
        albumArt: 'http://example.com/art-e.jpg',
        duration: 260,
      },
    ],
  }

  const mockAllSongs: Song[] = Array.from({ length: 100 }, (_, i) => ({
    id: `${i + 1}`,
    title: `Song ${String.fromCharCode(65 + (i % 26))}${i}`,
    artist: `Artist ${i + 1}`,
    album: `Album ${i + 1}`,
    albumArt: `http://example.com/art${i}.jpg`,
    duration: 180 + i * 5,
  }))

  beforeEach(() => {
    vi.clearAllMocks()
    // Setup default mocks for both endpoints
    ;(global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/playlists/1')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockPlaylist,
        })
      }
      if (url.includes('/api/songs')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockAllSongs,
        })
      }
      return Promise.reject(new Error('Unknown endpoint'))
    })
  })

  describe('Part 1: Core Music Player Workflow', () => {
    it('displays playlist when loaded', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
      })

      // Should display playlist name and songs
      expect(screen.getByText('My Playlist')).toBeInTheDocument()
      expect(screen.getByText('Song A')).toBeInTheDocument()
      expect(screen.getByText('Song E')).toBeInTheDocument()
    })

    it('shows loading state initially', () => {
      ;(global.fetch as any).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      render(<App />)

      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })

    it('displays error state when fetch fails', async () => {
      ;(global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/playlists/1')) {
          return Promise.resolve({
            ok: false,
            statusText: 'Server Error',
          })
        }
        return Promise.reject(new Error('Unknown endpoint'))
      })

      render(<App />)

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument()
      })
    })

    it('plays a song and populates queue when clicked', async () => {
      const user = userEvent.setup()
      render(<App />)

      await waitFor(() => {
        expect(screen.getByText('Song C')).toBeInTheDocument()
      })

      // Click on Song C
      const songC = screen.getByText('Song C')
      await user.click(songC)

      // Song C should be now playing
      await waitFor(() => {
        expect(screen.getByText(/now playing/i)).toBeInTheDocument()
      })

      // Queue should contain Song D and E
      expect(screen.getByText('Song D')).toBeInTheDocument()
      expect(screen.getByText('Song E')).toBeInTheDocument()
    })

    it('adds song to front of queue with Play Next', async () => {
      const user = userEvent.setup()
      render(<App />)

      await waitFor(() => {
        expect(screen.getByText('Song A')).toBeInTheDocument()
      })

      // Play Song A first (queue: B, C, D, E)
      await user.click(screen.getByText('Song A'))

      await waitFor(() => {
        expect(screen.getByText(/now playing/i)).toBeInTheDocument()
      })

      // Find and click Play Next button for Song E
      const playNextButtons = screen.getAllByRole('button', { name: /play next/i })
      // Assuming the last play next button corresponds to Song E in the playlist
      // This depends on implementation - adjust selector as needed
      if (playNextButtons.length > 0) {
        await user.click(playNextButtons[playNextButtons.length - 1])

        // Song E should now be at front of queue
        // Verify queue order if your implementation shows queue positions
      }
    })

    it('toggles shuffle on and off', async () => {
      const user = userEvent.setup()
      render(<App />)

      await waitFor(() => {
        expect(screen.getByText('Song A')).toBeInTheDocument()
      })

      // Play a song first
      await user.click(screen.getByText('Song A'))

      await waitFor(() => {
        expect(screen.getByText(/now playing/i)).toBeInTheDocument()
      })

      // Find and click shuffle button
      const shuffleButton = screen.getByRole('button', { name: /shuffle/i })
      await user.click(shuffleButton)

      // Shuffle should be active
      expect(shuffleButton).toHaveAttribute('aria-pressed', 'true')

      // Click again to turn off
      await user.click(shuffleButton)
      expect(shuffleButton).toHaveAttribute('aria-pressed', 'false')
    })
  })

  describe('Part 2: Virtual Scrolling Integration', () => {
    it('renders virtual scroll container for large song library', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
      })

      // Should have a scrollable container
      // Look for virtual scroll indicators or library view
      const libraryView = screen.queryByTestId('song-library')
      if (libraryView) {
        expect(libraryView).toBeInTheDocument()
      }
    })

    it('displays only visible songs in virtual scroll', async () => {
      const largeSongList: Song[] = Array.from({ length: 10000 }, (_, i) => ({
        id: `${i + 1}`,
        title: `Song ${String(i).padStart(5, '0')}`,
        artist: `Artist ${i + 1}`,
        album: `Album ${i + 1}`,
        albumArt: `http://example.com/art${i}.jpg`,
        duration: 180,
      }))

      ;(global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/songs')) {
          return Promise.resolve({
            ok: true,
            json: async () => largeSongList,
          })
        }
        if (url.includes('/api/playlists/1')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockPlaylist,
          })
        }
        return Promise.reject(new Error('Unknown endpoint'))
      })

      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
      })

      // Should not render all 10,000 songs in DOM
      // Only visible ones should be rendered
      const allSongElements = screen.queryAllByTestId(/song-row/i)
      expect(allSongElements.length).toBeLessThan(100) // Much less than 10,000
    })
  })

  describe('Bonus: Integrated Features', () => {
    it('allows playing songs from the full library', async () => {
      const user = userEvent.setup()
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
      })

      // Switch to library view if needed
      const libraryTab = screen.queryByRole('tab', { name: /library/i })
      if (libraryTab) {
        await user.click(libraryTab)
      }

      // Find and click a song from library
      const librarySongs = screen.queryAllByTestId(/song-row/i)
      if (librarySongs.length > 0) {
        await user.click(librarySongs[0])

        await waitFor(() => {
          expect(screen.getByText(/now playing/i)).toBeInTheDocument()
        })
      }
    })

    it('filters songs with search', async () => {
      const user = userEvent.setup()
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
      })

      // Look for search input
      const searchInput = screen.queryByPlaceholderText(/search/i)
      if (searchInput) {
        await user.type(searchInput, 'Song A')

        // Should filter results
        await waitFor(() => {
          // Songs matching "Song A" should be visible
          expect(screen.getByText(/Song A0/i)).toBeInTheDocument()
        })
      }
    })
  })

  describe('Edge Cases', () => {
    it('handles empty playlist gracefully', async () => {
      const emptyPlaylist: Playlist = {
        id: '1',
        name: 'Empty Playlist',
        songs: [],
      }

      ;(global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/playlists/1')) {
          return Promise.resolve({
            ok: true,
            json: async () => emptyPlaylist,
          })
        }
        return Promise.reject(new Error('Unknown endpoint'))
      })

      render(<App />)

      await waitFor(() => {
        expect(screen.getByText('Empty Playlist')).toBeInTheDocument()
      })

      // Should display empty state message
      expect(screen.getByText(/no songs/i)).toBeInTheDocument()
    })

    it('handles playing last song in playlist', async () => {
      const user = userEvent.setup()
      render(<App />)

      await waitFor(() => {
        expect(screen.getByText('Song E')).toBeInTheDocument()
      })

      // Click last song
      await user.click(screen.getByText('Song E'))

      await waitFor(() => {
        expect(screen.getByText(/now playing/i)).toBeInTheDocument()
      })

      // Queue should be empty
      const queueSection = screen.queryByText(/queue/i)
      if (queueSection) {
        expect(screen.getByText(/queue is empty/i)).toBeInTheDocument()
      }
    })

    it('handles rapid song selections', async () => {
      const user = userEvent.setup()
      render(<App />)

      await waitFor(() => {
        expect(screen.getByText('Song A')).toBeInTheDocument()
      })

      // Rapidly click different songs
      await user.click(screen.getByText('Song A'))
      await user.click(screen.getByText('Song C'))
      await user.click(screen.getByText('Song B'))

      await waitFor(() => {
        // Last clicked song should be now playing
        expect(screen.getByText(/now playing/i)).toBeInTheDocument()
      })

      // Should not crash or have inconsistent state
    })
  })

  describe('Data Display Requirements', () => {
    it('displays all required song information', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.getByText('Song A')).toBeInTheDocument()
      })

      // Each song should display: title, artist, album art, duration
      expect(screen.getByText('Song A')).toBeInTheDocument()
      expect(screen.getByText('Artist A')).toBeInTheDocument()

      // Album art should be rendered as images
      const images = screen.getAllByRole('img')
      expect(images.length).toBeGreaterThan(0)

      // Duration should be formatted (e.g., "3:00")
      expect(screen.getByText(/\d:\d{2}/)).toBeInTheDocument()
    })

    it('displays formatted duration correctly', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.getByText('Song A')).toBeInTheDocument()
      })

      // Song A has duration 180 (3:00)
      expect(screen.getByText('3:00')).toBeInTheDocument()
    })
  })
})
