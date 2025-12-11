function App() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Music Player</h1>

      {/*
        Your implementation goes here!

        See README.md for the full challenge requirements.

        Suggested component structure:
        - Playlist: Display all songs from the API
        - NowPlaying: Show the currently playing song
        - Queue: Show upcoming songs
        - Player controls: Play/Pause, Previous, Next, Shuffle
      */}

      <p className="text-gray-400">
        Start by fetching the playlist from <code className="bg-gray-800 px-2 py-1 rounded">/api/playlists/1</code>
      </p>
    </div>
  )
}

export default App
