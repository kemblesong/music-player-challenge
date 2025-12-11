import { useState } from 'react'
import { PlayerProvider, usePlayer } from './context/PlayerContext'
import { Playlist } from './components/Playlist'
import { SongLibrary } from './components/SongLibrary'
import { NowPlaying } from './components/NowPlaying'
import { Queue } from './components/Queue'
import { PlayerControls } from './components/PlayerControls'

type Tab = 'playlist' | 'library'

function PlayerPanel() {
  const { currentSong, queue, isShuffled, toggleShuffle } = usePlayer()

  const handlePlayFromQueue = (song: typeof queue[0]) => {
    // This will be implemented in Part 2
  }

  return (
    <div className="flex flex-col h-full">
      <NowPlaying song={currentSong} />
      <PlayerControls
        isShuffled={isShuffled}
        onToggleShuffle={toggleShuffle}
        hasCurrentSong={!!currentSong}
      />
      <div className="flex-1 overflow-hidden mt-4">
        <Queue
          queue={queue}
          currentSong={currentSong}
          onPlaySong={handlePlayFromQueue}
        />
      </div>
    </div>
  )
}

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('playlist')

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      <header className="border-b border-gray-700 p-4">
        <h1 className="text-2xl font-bold">Music Player</h1>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel - Song Source */}
        <div className="w-1/2 border-r border-gray-700 flex flex-col overflow-hidden">
          <nav className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('playlist')}
              className={`px-6 py-3 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500
                ${activeTab === 'playlist'
                  ? 'bg-gray-800 text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
            >
              Playlist
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={`px-6 py-3 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500
                ${activeTab === 'library'
                  ? 'bg-gray-800 text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
            >
              Library (10K)
            </button>
          </nav>

          <div className="flex-1 p-4 overflow-hidden">
            {activeTab === 'playlist' ? <Playlist /> : <SongLibrary />}
          </div>
        </div>

        {/* Right Panel - Player */}
        <div className="w-1/2 p-4 overflow-hidden">
          <PlayerPanel />
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <PlayerProvider>
      <AppContent />
    </PlayerProvider>
  )
}
