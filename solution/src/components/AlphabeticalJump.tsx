const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

interface AlphabeticalJumpProps {
  availableLetters: Set<string>
  onLetterClick: (letter: string) => void
}

export function AlphabeticalJump({ availableLetters, onLetterClick }: AlphabeticalJumpProps) {
  return (
    <div className="flex flex-col justify-between h-full">
      {LETTERS.map((letter) => {
        const isAvailable = availableLetters.has(letter)
        return (
          <button
            key={letter}
            onClick={() => isAvailable && onLetterClick(letter)}
            disabled={!isAvailable}
            className={`w-6 flex-1 text-xs font-medium rounded transition-colors ${
              isAvailable
                ? 'hover:bg-gray-600 text-white cursor-pointer'
                : 'text-gray-600 cursor-not-allowed'
            }`}
          >
            {letter}
          </button>
        )
      })}
    </div>
  )
}
