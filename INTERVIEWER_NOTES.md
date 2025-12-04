# Interviewer Notes

This document outlines how to evaluate candidate solutions, what an ideal implementation looks like, and specific signals to watch for during the interview. Because the project is large, make it clear to the candidate that they are not expected to cover everything in detail. Instead, once the core requirements are met, ask them to choose 2 or 3 areas to pay extra attention to (for example, accessibility and styling, or component structure and state management). For areas they don't dive into, encourage them to briefly describe what their "ideal" approach would be, to demonstrate their broader understanding.

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
- Uses a reasonable shuffling strategy, like the hinted Fisher-Yates shuffle algorithm (O(n), unbiased)

**Strong signals:**
- Saves original queue before first shuffle
- Implements shuffling correctly
- Handles toggle on/off cleanly

**Red flags:**
- Uses `array.sort(() => Math.random() - 0.5)` (biased shuffle)
- Doesn't preserve original order (can't un-shuffle)
- Shuffles the currently playing song

## Virtual Scrolling Implementation

The virtual scrolling challenge (Part 2) tests understanding of performance optimization and DOM manipulation.

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

The challenge uses Tailwind CSS. Look for proper layout patterns, accessibility, and virtual scroll CSS implementation.

### Layout Patterns

**Scrollable Containers:**
- **Strong signal:** Uses `overflow-y-auto` with fixed or calculated height for scrollable lists
- **Red flag:** Missing overflow, content overflows viewport, scroll doesn't work

**List Layout:**
- **Strong signal:** Uses `flex flex-col` or `space-y-*` utilities for consistent song list spacing
- **Red flag:** Inconsistent spacing, manual margins, layout breaks on different screen sizes

**Now Playing Section:**
- **Strong signal:** Uses sticky or fixed positioning, clear visual hierarchy with proper spacing
- **Red flag:** Now playing section scrolls away, gets lost in the UI, poor visual separation

### Virtual Scroll CSS

**Positioning:**
- **Strong signal:** Uses `transform: translateY()` or `style={{ top: ... }}` for positioning visible items
- **Red flag:** Uses `margin-top` on inner container (causes scroll jump issues)

**Container Heights:**
- **Strong signal:** Sets explicit container height (`h-[600px]` or calculated) for correct scrollbar behavior
- **Red flag:** Missing height, scrollbar doesn't match content height

### Accessibility & UX

**Interactive Elements:**
- **Strong signal:** Visible focus states (`focus:ring-2`), hover states (`hover:bg-gray-800`), cursor pointer (`cursor-pointer`)
- **Red flag:** No visual feedback on click/hover, can't tell what's clickable, poor keyboard navigation

**Text Handling:**
- **Strong signal:** Truncates long text with `text-ellipsis overflow-hidden truncate`, maintains layout integrity
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
| **Styling** | Proper Tailwind layout (`overflow-y-auto`, `space-y-*`), uses `transform` for virtual scroll positioning |
| **Accessibility** | Visible focus states, hover feedback, cursor pointer, text truncation |
| **Error Handling** | Shows loading states, handles API errors, provides user feedback |
| **Code Organization** | Logical file structure, reusable functions, clear naming |

## Red Flags (Concerns)

| Area | Signal |
|------|--------|
| **State Mutations** | Mutates arrays with `.push()`, `.splice()`, `.pop()` directly on state |
| **Shuffle Algorithm** | Uses `array.sort(() => Math.random() - 0.5)` (biased shuffle) |
| **Shuffle Logic** | Doesn't preserve original order (can't un-shuffle) |
| **React Hooks** | Missing `useEffect` dependencies, infinite loops, no cleanup functions, stale closures |
| **React Keys** | Uses array indices as keys in virtual scroll (causes flicker/bugs) |
| **React Performance** | No `React.memo` for list items, re-renders entire list on scroll, no `useCallback` for handlers |
| **Virtual Scroll** | Renders all 10K items instead of only visible ones |
| **Virtual Scroll** | Wrong height calculation (scrollbar doesn't match content) |
| **Virtual Scroll CSS** | Uses `margin-top` for positioning (causes scroll jumps), missing container height |
| **Styling** | Missing `overflow-y-auto`, no hover/focus states, text breaks layout, no truncation |
| **Error Handling** | No loading states, silent failures, unhandled promise rejections |
| **Type Safety** | Uses `any` types, missing type annotations, ignores TypeScript errors |
| **Queue Logic** | Incorrect queue population (includes current song or wrong slice) |
| **Play Next** | Inserts at wrong position (end instead of front) |

## Time Expectations

| Task | Expected Time | Notes |
|------|---------------|-------|
| Task 1 (Fetch/Display) | 8-10 min | Basic React setup, API call, loading/error states |
| Task 2 (Play/Queue) | 12-15 min | Core logic, state management, UI updates |
| Task 3 (Play Next) | 5-7 min | Queue manipulation, UI action (button/menu) |
| Task 4 (Shuffle) | 10-12 min | Algorithm implementation, toggle logic, state preservation |
| Task 5 (Additional) | 5-8 min | Pick 1-2 features from the list (optional if time is tight) |
| Part 2 (Virtual Scroll) | 35-40 min | Required: Performance optimization, virtual scrolling implementation |

**Total for Part 1:** ~40-52 minutes  
**Total with Part 2:** ~75-92 minutes

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

