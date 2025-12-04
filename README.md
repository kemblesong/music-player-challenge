# Music Player Challenge

Build a music player application similar to Spotify. This challenge tests your ability to work with data structures, manage application state, and build intuitive user interfaces.

**Time Limit:** 1.5 hours

## Getting Started

You'll need **two terminal windows** to run this project.

### Terminal 1: Start the API server

```bash
cd api
pnpm install
pnpm dev
```

The API will run at `http://localhost:3001`

### Terminal 2: Start the frontend

```bash
pnpm install
pnpm dev
```

The frontend will run at `http://localhost:5173`

---

## API Endpoints

### `GET /api/playlists/1`

Returns a playlist with 20 songs.

```typescript
interface Playlist {
  id: string
  name: string
  songs: Song[]
}

interface Song {
  id: string
  title: string
  artist: string
  album: string
  albumArt: string    // URL to album artwork
  duration: number    // Duration in seconds
}
```

### `GET /api/songs`

Returns all 10,000 songs sorted A-Z by title. Used for Part 2.

---

## Part 1: Core Music Player (~40 mins)

Build a music player with the following features:

### Task 1: Fetch & Display Playlist

- Fetch the playlist from `/api/playlists/1`
- Display all songs with album art, title, artist, and duration
- Show a loading state while fetching
- Handle errors gracefully

### Task 2: Play a Song & Populate Queue

- When a user clicks on a song, it becomes the "now playing" song
- All songs **after** the selected song should populate the queue
- Display the current song prominently (album art, title, artist)
- Show the queue of upcoming songs
- NOTE: we're not actually streaming any audio in this exercise!

**Example:** If the playlist has songs [A, B, C, D, E] and the user clicks on C:
- Now playing: C
- Queue: [D, E]

### Task 3: Play Next

- Add a "Play Next" action to each song (button, context menu, or similar)
- When triggered, the song is inserted at the **front** of the queue
- After the "play next" song finishes, the normal queue resumes

**Example:** If queue is [D, E] and user adds B as "Play Next":
- Queue becomes: [B, D, E]

### Task 4: Shuffle

- Add a shuffle button/toggle
- When enabled, shuffle the remaining queue (not the currently playing song)
- When disabled, restore the original queue order
- The shuffle should be randomized each time

### Task 5: Additional Operations (Pick Any)

Implement any of these features if you have time:

- **Previous/Next:** Navigate through songs
- **Remove from Queue:** Remove a song from the queue
- **Clear Queue:** Remove all songs from the queue
- **Repeat Mode:** Off → Repeat All → Repeat One

---

## Part 2: Scrolling Music Library (~40 mins)

- Fetch all 10,000 songs from `/api/songs`
- Display them in a scrollable list sorted A-Z
- **Only render the visible items** (virtual scrolling)
- The scrollbar should represent the full list height
- Clicking on the scrollbar should jump to that position

**Why virtual scrolling?** Rendering 10,000 DOM elements would freeze the browser. Only render what's visible!

---

## Bonus: Integrated Music Player (~20 mins)

If you've completed both Part 1 and Part 2, integrate them together:

- Allow users to play songs directly from the full 10,000-song library
- When a song is clicked in the library, it becomes the "now playing" song
- All songs **after** the selected song in the sorted list should populate the queue
- Maintain all Part 1 functionality (play next, shuffle, queue management) with the full library
- Consider adding search/filter functionality to help users find songs in the large library

**Example:** If a user searches for "Beatles" and clicks on "Hey Jude" (which appears at position 4,523 in the sorted list):
- Now playing: "Hey Jude"
- Queue: All songs from position 4,524 onwards (approximately 5,477 songs)

This bonus challenge tests your ability to refactor for reuse, combine multiple features, and handle edge cases with large datasets.

---

## Hints

### Formatting Duration

```typescript
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
```

### Fisher-Yates Shuffle

```typescript
function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
```

### Virtual Scrolling Formula

```typescript
const startIndex = Math.floor(scrollTop / itemHeight)
const endIndex = Math.min(
  startIndex + Math.ceil(containerHeight / itemHeight) + 1,
  totalItems - 1
)
```

---

## Evaluation Criteria

| Criteria | What We Look For |
|----------|------------------|
| **Correctness** | Features work as described |
| **Code Quality** | Clean, readable, well-organized |
| **State Management** | Proper handling of player/queue state |
| **Edge Cases** | Empty queue, single song, rapid clicks |
| **Algorithm Choice** | Appropriate data structures |

---

## TypeScript Types

Types are provided in `src/types/index.ts`:

```typescript
export interface Song {
  id: string
  title: string
  artist: string
  album: string
  albumArt: string
  duration: number
}

export interface Playlist {
  id: string
  name: string
  songs: Song[]
}
```

---

## Project Structure

```
├── api/                    # API server (already complete)
│   ├── server.ts
│   └── data/
│       ├── playlist.json   # 20 songs for Part 1
│       └── songs-10000.json # 10,000 songs for Part 2
├── src/
│   ├── types/index.ts      # TypeScript types (provided)
│   ├── App.tsx             # Start here!
│   ├── main.tsx
│   └── index.css
└── README.md               # This file
```

---

Good luck! 🎵
