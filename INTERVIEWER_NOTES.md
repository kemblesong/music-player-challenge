# Interviewer Notes

This document provides guidance on evaluating candidate solutions, ideal implementation patterns, and signals to look for during the interview.

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
- Uses Fisher-Yates shuffle algorithm (O(n), unbiased)

**Strong signals:**
- Saves original queue before first shuffle
- Implements Fisher-Yates correctly
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

## Green Flags (Strong Signals)

| Area | Signal |
|------|--------|
| **State Management** | Keeps `originalQueue` separate for un-shuffle functionality |
| **Immutability** | Uses spread operator (`[...array]`) or `slice()`, never mutates state directly |
| **Edge Cases** | Handles empty queue, single song, last song, rapid clicks gracefully |
| **Component Design** | Separates concerns: `NowPlaying`, `Queue`, `SongList` components |
| **TypeScript** | Properly types state, event handlers, and function parameters |
| **Virtual Scroll** | Understands why DOM node count matters for performance |
| **Error Handling** | Shows loading states, handles API errors, provides user feedback |
| **Code Organization** | Logical file structure, reusable functions, clear naming |

## Red Flags (Concerns)

| Area | Signal |
|------|--------|
| **State Mutations** | Mutates arrays with `.push()`, `.splice()`, `.pop()` directly on state |
| **Shuffle Algorithm** | Uses `array.sort(() => Math.random() - 0.5)` (biased shuffle) |
| **Shuffle Logic** | Doesn't preserve original order (can't un-shuffle) |
| **Virtual Scroll** | Renders all 10K items instead of only visible ones |
| **Virtual Scroll** | Wrong height calculation (scrollbar doesn't match content) |
| **Error Handling** | No loading states, silent failures, unhandled promise rejections |
| **Type Safety** | Uses `any` types, missing type annotations, ignores TypeScript errors |
| **Queue Logic** | Incorrect queue population (includes current song or wrong slice) |
| **Play Next** | Inserts at wrong position (end instead of front) |

## Time Expectations

| Task | Expected Time | Notes |
|------|---------------|-------|
| Task 1 (Fetch/Display) | 10-15 min | Basic React setup, API call, loading/error states |
| Task 2 (Play/Queue) | 15-20 min | Core logic, state management, UI updates |
| Task 3 (Play Next) | 5-10 min | Queue manipulation, UI action (button/menu) |
| Task 4 (Shuffle) | 10-15 min | Algorithm implementation, toggle logic, state preservation |
| Task 5 (Additional) | 10-15 min | Pick 1-2 features from the list |
| Part 2 (Virtual Scroll) | 20-30 min | Bonus if time permits, performance optimization |

**Total for Part 1:** ~50-75 minutes  
**With Part 2:** ~70-105 minutes

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

## Evaluation Rubric

| Level | Description |
|-------|-------------|
| **Excellent** | Completes all Part 1 tasks correctly, handles edge cases, clean code structure, considers Part 2 |
| **Good** | Completes core tasks (1-3), minor issues with shuffle or edge cases, readable code |
| **Satisfactory** | Completes basic functionality (1-2), some bugs or missing edge cases, works but messy |
| **Needs Work** | Struggles with state management, incorrect queue logic, doesn't complete core features |

