interface PlayerControlsProps {
  isShuffled: boolean
  onToggleShuffle: () => void
  hasCurrentSong: boolean
}

export function PlayerControls({
  isShuffled,
  onToggleShuffle,
  hasCurrentSong,
}: PlayerControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4 py-4">
      <button
        onClick={onToggleShuffle}
        disabled={!hasCurrentSong}
        className={`p-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
          ${isShuffled ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-400'}
          ${!hasCurrentSong ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label={isShuffled ? 'Disable shuffle' : 'Enable shuffle'}
        aria-pressed={isShuffled}
        title="Shuffle"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
    </div>
  )
}
