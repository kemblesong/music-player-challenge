# Interviewer Notes

This document outlines how to evaluate candidate solutions, what an ideal implementation looks like, and specific signals to watch for during the interview. Because the project is large, make it clear to the candidate that they are not expected to cover everything in detail. Instead, once the core requirements are met, ask them to choose 2 or 3 areas to pay extra attention to (for example, accessibility and styling, or component structure and state management). For areas they don't dive into, encourage them to briefly describe what their "ideal" approach would be, to demonstrate their broader understanding.

## Suggested Discussion Guide

Use this as a rough guide for pacing the interview:

### Before Coding (5 mins)
- Introduce yourself and set expectations
- Let them know they can look up APIs/documentation as needed
- Explain they should ask questions if anything is unclear
- Mention hints are provided in the README and can be used directly

### During Coding (~80 mins)
- Let the candidate work independently, but stay available for questions
- If they get stuck, offer gentle nudges before revealing hints
- Note their debugging approach and how they handle obstacles
- Observe how they break down problems and manage their time

### Code Review & Discussion (5 mins)
- Ask them to walk through their implementation choices
- Discuss trade-offs they considered
- Ask about areas they'd improve given more time
- Use the discussion questions below to probe deeper understanding

### Wrap Up (5 mins)
- Answer any questions they have about the role or team
- Explain next steps in the process

## Ideal State Structure

A well-structured solution should maintain these key state variables:

- `currentSong: Song | null` - Currently playing song
- `queue: Song[]` - Upcoming songs in the queue
- `originalQueue: Song[]` - Preserved original queue order for un-shuffle functionality
- `isShuffled: boolean` - Toggle state for shuffle mode
- `playlist: Song[]` - Source playlist data

## Data Structure Signals by Task

### Task 2 (Play Song & Populate Queue)

**What to look for:** Candidates who understand array slicing. When clicking song C in `[A, B, C, D, E]`, they should use `playlist.slice(clickedIndex + 1)` to get `[D, E]`.

**Strong signal:** Uses `findIndex` or tracks index, then slices correctly.

**Weak signal:** Filters by comparing IDs or uses inefficient search.

### Task 3 (Play Next)

**What to look for:** Inserting at the front of the queue. Ideal: `[newSong, ...queue]` or `queue.unshift(newSong)`.

**Note:** `unshift` is O(n) but acceptable for small lists (20 songs). For larger datasets, consider a deque or linked list, but that's over-engineering here.

**Strong signal:** Understands queue semantics (FIFO) and maintains order correctly.

### Task 4 (Shuffle)

**What to look for:**
- Preserves `originalQueue` before shuffling
- Restores original order when toggle is disabled
- Implements shuffling (the Fisher-Yates algorithm is provided in the hints)

**Strong signals:**
- Saves original queue before first shuffle
- Handles toggle on/off cleanly

**Red flags:**
- Doesn't preserve original order (can't un-shuffle)
- Shuffles the currently playing song

## Part 2: Song Library Implementation

Part 2 tests performance optimization, DOM manipulation, and handling large datasets. Tasks are listed in order of increasing difficulty.

### Task 1: Fetch & Display Songs (Easy)

**What to look for:** Standard data fetching with loading/error states. Most candidates should complete this quickly.

**Implementation approach:**
- Fetch 10K songs from `/api/songs`
- Display in a scrollable list
- Performance becomes an issue here — naive rendering will lag

**Strong signals:**
- Recognizes performance problem without prompting
- Implements virtual scrolling or pagination
- Proper loading/error states

**Red flags:**
- Renders all 10K items in DOM without noticing lag
- No loading state while fetching

### Task 2: Search (Easy-Medium)

**What to look for:** Filtering logic with performance considerations.

**Implementation approach:**
```typescript
const filteredSongs = useMemo(() =>
  songs.filter(song =>
    song.title.toLowerCase().includes(query.toLowerCase()) ||
    song.artist.toLowerCase().includes(query.toLowerCase())
  ),
  [songs, query]
)
```

**Strong signals:**
- Uses `useMemo` to avoid re-filtering on every render
- Debounces search input to avoid filtering on every keystroke
- Case-insensitive matching

**Red flags:**
- Filters on every render without memoization
- No debouncing — UI freezes while typing
- Case-sensitive search (misses obvious matches)

### Task 3: Alphabetical Jump (Medium)

**What to look for:** Building an index map and programmatic scrolling.

**Implementation approach:**
```typescript
// Build index map
const letterIndexMap = useMemo(() => {
  const map = new Map<string, number>()
  songs.forEach((song, index) => {
    const letter = song.title.charAt(0).toUpperCase()
    if (!map.has(letter)) map.set(letter, index)
  })
  return map
}, [songs])

// Scroll to letter
const scrollToLetter = (letter: string) => {
  const index = letterIndexMap.get(letter)
  if (index !== undefined) {
    scrollContainerRef.current.scrollTop = index * ITEM_HEIGHT
  }
}
```

**Strong signals:**
- Builds index map efficiently (single pass)
- Correctly calculates scroll position based on item height
- Disables letters with no matching songs

**Red flags:**
- Searches entire array on each letter click (O(n) per click)
- Doesn't account for virtual scrolling offset
- No visual feedback for unavailable letters

### Task 4: Group by Artist/Album (Hard)

**What to look for:** This is significantly harder because grouping changes the data structure. With virtual scrolling, candidates must handle a mixed list of headers and songs.

**Implementation approach:**
```typescript
type ListItem =
  | { type: 'header'; label: string }
  | { type: 'song'; song: Song }

const listItems = useMemo((): ListItem[] => {
  if (groupBy === 'none') {
    return songs.map(song => ({ type: 'song', song }))
  }

  const grouped = new Map<string, Song[]>()
  for (const song of songs) {
    const key = groupBy === 'artist' ? song.artist : song.album
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(song)
  }

  const items: ListItem[] = []
  for (const [label, groupSongs] of grouped) {
    items.push({ type: 'header', label })
    groupSongs.forEach(song => items.push({ type: 'song', song }))
  }
  return items
}, [songs, groupBy])
```

**Strong signals:**
- Flattens groups into a single list for virtual scrolling
- Headers and songs have consistent height (or variable height handling)
- Maintains correct play queue (extracts only songs, not headers)
- Considers interaction with alphabetical jump (disables or adapts)

**Red flags:**
- Breaks virtual scrolling when grouping is enabled
- Headers don't scroll correctly with content
- Play queue includes header items
- Doesn't sort groups alphabetically

### Task Difficulty Summary

| Task | Difficulty | Time Estimate | Notes |
|------|------------|---------------|-------|
| Task 1: Fetch & Display | Easy | 10-15 min | Standard pattern, performance awareness key |
| Task 2: Search | Easy-Medium | 8-12 min | Debouncing + memoization |
| Task 3: Alphabetical Jump | Medium | 10-15 min | Index building + scroll calculation |
| Task 4: Group by Artist/Album | Hard | 15-20 min | Consider making optional |

**Recommendation:** Tasks 1-3 are required (~30-40 min). Task 4 can be offered as a bonus for candidates who finish early.

## Virtual Scrolling Implementation

Virtual scrolling (used in Task 1) tests understanding of performance optimization and DOM manipulation.

### Key Formula

```typescript
const startIndex = Math.floor(scrollTop / itemHeight)
const endIndex = Math.min(
  startIndex + Math.ceil(containerHeight / itemHeight) + buffer,
  totalItems - 1
)
const visibleItems = items.slice(startIndex, endIndex)
```

### Implementation Patterns

1. **Outer container:** Fixed height with `overflow-y: auto`
2. **Inner container:** Height set to `totalItems * itemHeight` (creates correct scrollbar)
3. **Visible items container:** Positioned using `transform: translateY(startIndex * itemHeight)` or `paddingTop`
4. **Buffer:** Render 1-3 extra items above/below viewport to prevent flicker during fast scrolling

### Strong Signals

- Understands why rendering 10K DOM nodes is problematic
- Correctly calculates total height for scrollbar
- Uses transform/positioning to offset visible items
- Implements buffer for smooth scrolling
- Handles edge cases (scrolling to top/bottom)

### Red Flags

- Renders all 10,000 items in the DOM
- Scrollbar height doesn't match total items
- Items jump or flicker during scroll
- Doesn't handle scroll position restoration

## React Patterns

The challenge tests React fundamentals: hooks usage, component composition, and performance optimization.

### Hooks Usage

**useEffect:**
- **Strong signal:** Proper dependency arrays, cleanup functions for event listeners or timers
- **Red flag:** Missing dependencies causing stale closures, infinite loops, no cleanup

**useState:**
- **Strong signal:** Functional updates for state derived from previous state (`setQueue(q => [...q, newSong])`)
- **Red flag:** Direct mutation, stale closure issues, not using functional updates when needed

**useMemo/useCallback:**
- **Strong signal:** Uses `useCallback` for scroll handlers (throttling/debouncing), `useMemo` for expensive calculations
- **Red flag:** Premature optimization everywhere OR missing optimization for virtual scroll performance

**Custom Hooks:**
- **Strong signal:** Extracts reusable logic into `usePlaylist`, `useVirtualScroll`, `useQueue` hooks
- **Red flag:** All logic crammed in one component, no separation of concerns

### Component Patterns

**Component Extraction:**
- **Strong signal:** Separates `SongRow` component for list items, uses `React.memo` for performance (critical for virtual scroll)
- **Red flag:** Everything in one monolithic component, no component reuse

**List Keys:**
- **Strong signal:** Uses stable keys (song IDs), never array indices
- **Red flag:** Uses array index as key in virtual scroll (causes flicker/bugs when items shift)

**Component Composition:**
- **Strong signal:** Appropriate component separation (`NowPlaying`, `Queue`, `SongList`), uses context or props for shared state
- **Red flag:** Prop drilling 5+ levels deep without extracting context or using composition

## Styling Signals

The project is set up with Tailwind CSS, but candidates are not expected to use Tailwind. They may use CSS modules, plain CSS, styled-components, or any other styling approach they're comfortable with. Look for proper layout patterns, accessibility, and virtual scroll CSS implementation regardless of the styling method chosen.

### Layout Patterns

**Scrollable Containers:**
- **Strong signal:** Uses `overflow-y: auto` (or Tailwind's `overflow-y-auto`) with fixed or calculated height for scrollable lists
- **Red flag:** Missing overflow, content overflows viewport, scroll doesn't work

**List Layout:**
- **Strong signal:** Uses flexbox with column direction and consistent spacing for song lists
- **Red flag:** Inconsistent spacing, manual margins, layout breaks on different screen sizes

**Now Playing Section:**
- **Strong signal:** Uses sticky or fixed positioning, clear visual hierarchy with proper spacing
- **Red flag:** Now playing section scrolls away, gets lost in the UI, poor visual separation

### Virtual Scroll CSS

**Positioning:**
- **Strong signal:** Uses `transform: translateY()` or `style={{ top: ... }}` for positioning visible items
- **Red flag:** Uses `margin-top` on inner container (causes scroll jump issues)

**Container Heights:**
- **Strong signal:** Sets explicit container height (e.g., `height: 600px` or calculated value) for correct scrollbar behavior
- **Red flag:** Missing height, scrollbar doesn't match content height

### Accessibility & UX

**Interactive Elements:**
- **Strong signal:** Visible focus states, hover states, and cursor changes on interactive elements
- **Red flag:** No visual feedback on click/hover, can't tell what's clickable, poor keyboard navigation

**Text Handling:**
- **Strong signal:** Truncates long text with `text-overflow: ellipsis` and `overflow: hidden`, maintains layout integrity
- **Red flag:** Text breaks layout, no truncation for long song titles/artists

## Green Flags (Strong Signals)

| Area | Signal |
|------|--------|
| **State Management** | Keeps `originalQueue` separate for un-shuffle functionality |
| **Immutability** | Uses spread operator (`[...array]`) or `slice()`, never mutates state directly |
| **Edge Cases** | Handles empty queue, single song, last song, rapid clicks gracefully |
| **Component Design** | Separates concerns: `NowPlaying`, `Queue`, `SongList` components |
| **React Hooks** | Proper `useEffect` dependencies, functional `useState` updates, `useCallback` for scroll handlers |
| **React Performance** | Uses `React.memo` for list items, stable keys (IDs not indices), extracts custom hooks |
| **TypeScript** | Properly types state, event handlers, and function parameters |
| **Virtual Scroll** | Understands why DOM node count matters for performance |
| **Styling** | Proper CSS layout (scrollable containers, flexbox), uses `transform` for virtual scroll positioning |
| **Accessibility** | Visible focus states, hover feedback, cursor changes, text truncation |
| **Error Handling** | Shows loading states, handles API errors, provides user feedback |
| **Code Organization** | Logical file structure, reusable functions, clear naming |

## Red Flags (Concerns)

| Area | Signal |
|------|--------|
| **State Mutations** | Mutates arrays with `.push()`, `.splice()`, `.pop()` directly on state |
| **Shuffle Logic** | Shuffles the currently playing song |
| **Shuffle Logic** | Doesn't preserve original order (can't un-shuffle) |
| **React Hooks** | Missing `useEffect` dependencies, infinite loops, no cleanup functions, stale closures |
| **React Keys** | Uses array indices as keys in virtual scroll (causes flicker/bugs) |
| **React Performance** | No `React.memo` for list items, re-renders entire list on scroll, no `useCallback` for handlers |
| **Virtual Scroll** | Renders all 10K items instead of only visible ones |
| **Virtual Scroll** | Wrong height calculation (scrollbar doesn't match content) |
| **Virtual Scroll CSS** | Uses `margin-top` for positioning (causes scroll jumps), missing container height |
| **Styling** | Missing overflow handling, no hover/focus states, text breaks layout, no truncation |
| **Error Handling** | No loading states, silent failures, unhandled promise rejections |
| **Type Safety** | Uses `any` types, missing type annotations, ignores TypeScript errors |
| **Queue Logic** | Incorrect queue population (includes current song or wrong slice) |
| **Play Next** | Inserts at wrong position (end instead of front) |

## Time Expectations

### Part 1: Core Music Player

| Task | Expected Time | Notes |
|------|---------------|-------|
| Task 1 (Fetch/Display) | 8-10 min | Basic React setup, API call, loading/error states |
| Task 2 (Play/Queue) | 12-15 min | Core logic, state management, UI updates |
| Task 3 (Play Next) | 5-7 min | Queue manipulation, UI action (button/menu) |
| Task 4 (Shuffle) | 10-12 min | Algorithm implementation, toggle logic, state preservation |
| Task 5 (Additional) | 5-8 min | Pick 1-2 features from the list (optional if time is tight) |

**Part 1 Total:** ~40-52 minutes

### Part 2: Song Library

| Task | Expected Time | Notes |
|------|---------------|-------|
| Task 1 (Fetch/Display) | 10-15 min | Performance awareness is key — should recognize need for optimization |
| Task 2 (Search) | 8-12 min | Debouncing + memoization |
| Task 3 (Alphabetical Jump) | 10-15 min | Index building + scroll calculation |
| Task 4 (Group by Artist/Album) | 15-20 min | Hard — consider making optional/bonus |

**Part 2 Total:** ~35-50 minutes (Tasks 1-3 required, Task 4 optional)

**Combined Total:** ~75-100 minutes

## Discussion Questions

Use these questions to probe deeper understanding:

1. **"What happens if the user clicks Play Next on the currently playing song?"**
   - *Look for:* Edge case handling, whether they prevent duplicates or handle gracefully

2. **"How would you handle very long song titles in the UI?"**
   - *Look for:* CSS truncation, ellipsis, responsive design thinking

3. **"If we had 1M songs instead of 10K, would your virtual scroll approach still work?"**
   - *Look for:* Understanding of browser limits, potential need for pagination or windowing

4. **"How would you add drag-to-reorder for the queue?"**
   - *Look for:* Knowledge of drag-and-drop APIs, state management for reordering

5. **"What data structure would you use if the queue could have 100K songs?"**
   - *Look for:* Understanding of performance trade-offs, consideration of linked lists vs arrays

6. **"How would you persist the queue state if the user refreshes the page?"**
   - *Look for:* Knowledge of localStorage, sessionStorage, or other persistence strategies

7. **"How would you prevent unnecessary re-renders when scrolling through 10K items?"**
   - *Look for:* Understanding of `React.memo`, stable callbacks with `useCallback`, throttling scroll events, memoization strategies

## Evaluation Rubric

| Level | Description |
|-------|-------------|
| **Excellent** | Completes all Part 1 and Part 2 tasks correctly, handles edge cases, clean code structure, implements virtual scrolling properly |
| **Good** | Completes Part 1 tasks (1-4) and Part 2, minor issues with shuffle or edge cases, readable code |
| **Satisfactory** | Completes basic Part 1 functionality (1-2) and attempts Part 2, some bugs or missing edge cases, works but messy |
| **Needs Work** | Struggles with state management, incorrect queue logic, doesn't complete core features or Part 2 |
