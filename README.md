# Music Player Challenge

Debug and enhance a music player application similar to Spotify. This challenge tests your ability to read and understand existing code, identify and fix bugs, and add new features.

**Time Limit:** 1 hour

## Getting Started

The challenge uses a hosted API, so you only need to run the frontend:

```bash
pnpm install
pnpm dev
```

The frontend will run at `http://localhost:5173`

The API endpoints are automatically proxied to the hosted API:
- `GET https://music-player-challenge-api.vercel.app/api/playlists/1`
- `GET https://music-player-challenge-api.vercel.app/api/songs`

### Using Local API (Optional)

If you prefer to run the API server locally, you can use:

```bash
# Terminal 1: Start the API server
pnpm --filter api dev

# Terminal 2: Start the frontend with local API
pnpm dev:local
```

This will proxy API requests to `http://localhost:3001` instead of the hosted API.

---

## API Endpoints

The frontend uses relative paths (`/api/playlists/1`, `/api/songs`) which are automatically proxied to the hosted API.

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

Returns all 10,000 songs sorted A-Z by title.

---

## Part 1: Debug the Player (~35 mins)

The music player has been partially implemented, but it contains **3 bugs** that prevent it from working correctly. Your task is to identify and fix all of them.

### Bug Symptoms

1. **Queue includes current song**: When you click on a song to play it, the queue includes the song you just clicked. The queue should only contain songs that come **after** the selected song.

2. **Shuffle has issues**: When you enable shuffle, you may notice:
   - React warnings about state mutation
   - The currently playing song appears in the shuffled queue (it shouldn't)
   - Disabling shuffle doesn't restore the original order

3. **Virtual scrolling glitches**: When scrolling through the 10K song library, items may disappear or flicker, especially when scrolling quickly. The scrollbar may also not match the actual content height.

### Your Task

- Identify where each bug is located in the codebase
- Fix all 3 bugs
- Test your fixes to ensure everything works correctly
- The player should work smoothly with both the 20-song playlist and the 10K song library

**Hints:**
- Use browser DevTools to inspect React warnings
- Test edge cases (first song, last song, empty queue)
- Pay attention to array slicing and state immutability
- Check virtual scroll calculations for buffer handling

---

## Part 2: Add Features (~20 mins)

Once you've fixed all the bugs, implement the following feature:

### Required: Play Next Functionality

Add a "Play Next" button to each song in both the Playlist and Library views. When clicked:

- The song should be inserted at the **front** of the queue (before all other queued songs)
- The button should provide clear visual feedback
- The feature should work correctly even when shuffle is enabled

**Example:** If the queue is `[D, E]` and the user clicks "Play Next" on song B:
- Queue becomes: `[B, D, E]`

### Optional: Grouping Features (if time permits)

If you finish early, add one or more of these features to the song library:

- **Alphabetical Jump**: Display an A-Z navigation bar. Clicking a letter scrolls to songs starting with that letter.
- **Group by Album**: Add a toggle to group songs by album with section headers.
- **Group by Artist**: Add a toggle to group songs by artist with section headers.

**Note:** If implementing grouping, make sure virtual scrolling still works correctly with the grouped layout.

---

## Hints

These hints are provided as helpers—you're not expected to know these algorithms by heart. Feel free to use these snippets directly, look up documentation, or use any approach you're comfortable with.

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

### Virtualized Scrolling

```typescript
function useVirtualScroll(itemHeight: number, totalItems: number, containerHeight: number) {
  const [scrollTop, setScrollTop] = useState(0)
  
  // Calculate visible range
  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 5) // buffer
  const endIndex = Math.min(totalItems - 1, startIndex + visibleCount + 10) // buffer
  
  // Render only items from startIndex to endIndex
  const visibleItems = items.slice(startIndex, endIndex + 1)
  const offsetY = startIndex * itemHeight
  const totalHeight = totalItems * itemHeight
  
  return {
    visibleItems,
    offsetY,
    totalHeight,
    onScroll: (e: React.UIEvent<HTMLDivElement>) => setScrollTop(e.currentTarget.scrollTop)
  }
}

// Usage in component:
// <div onScroll={onScroll} style={{ height: '600px', overflow: 'auto' }}>
//   <div style={{ height: totalHeight, position: 'relative' }}>
//     <div style={{ transform: `translateY(${offsetY}px)` }}>
//       {visibleItems.map(item => <Item key={item.id} {...item} />)}
//     </div>
//   </div>
// </div>
```

### Debugging Tips

- **React DevTools**: Use React DevTools to inspect component state and props
- **Console Warnings**: Pay attention to React warnings about state mutations or missing dependencies
- **Step Through Code**: Use breakpoints to understand the flow of data
- **Test Incrementally**: Fix one bug at a time and test before moving to the next
- **Check Array Methods**: Verify that array operations (slice, map, filter) are used correctly

---

## Evaluation Criteria

| Criteria | What We Look For |
|----------|------------------|
| **Bug Identification** | Can you systematically find and understand the bugs? |
| **Fix Correctness** | Do your fixes solve the problems without introducing new issues? |
| **Code Quality** | Clean, readable, well-organized code |
| **State Management** | Proper handling of player/queue state, immutability |
| **Testing** | Do you test your fixes thoroughly? |
| **Feature Implementation** | Correct implementation of Play Next functionality |

---

## TypeScript Types

Types are provided in `app/src/types/index.ts`:

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

This project uses pnpm workspaces and vite:

```
├── app/                    # Frontend application (start here!)
│   ├── src/
│   │   ├── types/index.ts  # TypeScript types (provided)
│   │   ├── App.tsx         # Main app component
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks (contains bugs!)
│   │   ├── context/        # React context
│   │   └── utils/          # Utility functions
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── postcss.config.js
├── api/                    # API server (already complete)
│   ├── server.ts
│   └── data/
│       ├── playlist.json   # 20 songs
│       └── songs-10000.json # 10,000 songs
├── package.json            # Workspace root
├── pnpm-workspace.yaml     # Workspace configuration
└── README.md               # This file
```

---

Good luck! 🎵
