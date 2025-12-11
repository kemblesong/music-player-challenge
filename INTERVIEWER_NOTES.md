# Interviewer Notes

This document outlines how to evaluate candidate solutions for the debug-build hybrid challenge. The challenge tests both code comprehension (debugging) and feature implementation (building).

## Suggested Discussion Guide

Use this as a rough guide for pacing the interview:

### Before Coding (5 mins)
- Introduce yourself and set expectations
- Let them know they can look up APIs/documentation as needed
- Explain they should ask questions if anything is unclear
- Mention hints are provided in the README and can be used directly
- Clarify that starter code is provided with bugs to fix

### During Coding (~50 mins)
- **Part 1 (Debug):** ~35 mins - Let them work independently, observe their debugging process
- **Part 2 (Build):** ~20 mins - Watch how they implement Play Next feature
- Stay available for questions but let them work through problems
- Note their debugging approach and how they handle obstacles
- Observe how they break down problems and manage their time

### Code Review & Discussion (5 mins)
- Ask them to walk through each bug they found and how they fixed it
- Discuss their debugging process - how did they identify the bugs?
- Ask about their Play Next implementation choices
- Use the discussion questions below to probe deeper understanding

### Wrap Up (5 mins)
- Answer any questions they have about the role or team
- Explain next steps in the process

## Debugging Signals

This section covers what to look for when candidates are debugging the starter code.

### Bug Identification Process

**Strong signals:**
- Uses browser DevTools to inspect React warnings/errors
- Systematically tests each feature to reproduce bugs
- Reads through code methodically to understand structure
- Uses console.log or breakpoints strategically
- Tests edge cases (first song, last song, empty queue)
- Identifies root cause, not just symptoms

**Weak signals:**
- Randomly changes code hoping something works
- Doesn't read error messages or warnings
- Fixes symptoms without understanding the problem
- Doesn't test after making changes
- Gets stuck on one bug for too long without asking for help

### Testing Approach

**Strong signals:**
- Tests each fix individually before moving to next bug
- Verifies fixes work with both playlist and library
- Tests edge cases after fixing
- Checks that fixes don't break other functionality

**Red flags:**
- Doesn't test fixes at all
- Only tests happy path
- Introduces new bugs while fixing old ones
- Doesn't verify fixes work with shuffle enabled

## Bug Solutions

This section documents the 3 bugs in the starter code, their locations, and expected fixes.

### Bug #1: Off-by-One Error in Queue Population

**Location:** `app/src/hooks/useQueue.ts` - `playSong` function

**The Bug:**
```typescript
const newQueue = sourceSongs.slice(clickedIndex)
```

**Why it's wrong:**
- Includes the clicked song in the queue
- Should only include songs that come AFTER the clicked song
- Example: Clicking song C in [A, B, C, D, E] should give queue [D, E], not [C, D, E]

**Expected Fix:**
```typescript
const newQueue = sourceSongs.slice(clickedIndex + 1)
```

**What it tests:**
- Array manipulation understanding
- Attention to requirements (queue = songs AFTER current)
- Off-by-one error recognition (common programming mistake)

**Strong signals:**
- Identifies bug quickly by testing with a small playlist
- Understands array slicing semantics
- Fixes correctly on first try

**Red flags:**
- Doesn't notice the bug until testing
- Fixes with wrong approach (e.g., filtering by ID)
- Doesn't understand why +1 is needed

### Bug #2: State Mutation + Shuffle Includes Current Song

**Location:** `app/src/hooks/useQueue.ts` - `toggleShuffle` function

**The Bug:**
```typescript
const toggleShuffle = useCallback(() => {
  if (!isShuffled) {
    const allSongs = [currentSong, ...queue]
    allSongs.sort(() => Math.random() - 0.5)  // Mutates array
    setQueue(allSongs)  // Includes currentSong in queue
    setIsShuffled(true)
  } else {
    setIsShuffled(false)  // Can't restore original order
  }
}, [currentSong, queue, isShuffled])
```

**Why it's wrong:**
1. **State mutation:** `sort()` mutates the array directly, causing React warnings
2. **Includes current song:** Shuffles currentSong into queue (should only shuffle queue)
3. **Can't restore:** No `originalQueue` saved, so disabling shuffle doesn't work

**Expected Fix:**
```typescript
const [originalQueue, setOriginalQueue] = useState<Song[]>([])

const toggleShuffle = useCallback(() => {
  if (!isShuffled) {
    // Save original order before first shuffle
    setOriginalQueue(queue)
    // Only shuffle the queue, not currentSong
    setQueue(shuffle(queue))  // Use immutable shuffle function
    setIsShuffled(true)
  } else {
    // Restore original order
    setQueue(originalQueue)
    setIsShuffled(false)
  }
}, [queue, isShuffled, originalQueue])
```

**What it tests:**
- React immutability principles
- Understanding of state management
- Business logic comprehension (shuffle should only affect queue)
- Ability to fix multiple related issues

**Strong signals:**
- Notices React warning about state mutation
- Understands that shuffle should exclude current song
- Saves originalQueue before shuffling
- Uses provided shuffle utility function

**Red flags:**
- Doesn't notice React warnings
- Shuffles current song into queue
- Doesn't preserve original order
- Mutates state directly

### Bug #3: Missing Buffer in Virtual Scroll Calculation

**Location:** `app/src/hooks/useVirtualScroll.ts` - `endIndex` calculation

**The Bug:**
```typescript
const endIndex = Math.min(
  totalItems - 1,
  startIndex + visibleCount
  // Missing: + bufferCount
)
```

**Why it's wrong:**
- Doesn't account for buffer when calculating endIndex
- Causes items to disappear when scrolling fast
- No buffer below viewport means flickering during scroll
- Buffer is needed to render items slightly outside viewport for smooth scrolling

**Expected Fix:**
```typescript
const endIndex = Math.min(
  totalItems - 1,
  startIndex + visibleCount + bufferCount
)
```

**What it tests:**
- Performance optimization understanding
- Virtual scrolling algorithm comprehension
- Math/calculation skills
- Understanding of why buffers are needed in virtual scrolling

**Strong signals:**
- Notices flickering/disappearing items when scrolling
- Understands virtual scrolling concept
- Recognizes buffer is needed for smooth scrolling
- Checks the startIndex calculation (which correctly uses buffer) and applies same logic to endIndex

**Red flags:**
- Doesn't notice the performance issue
- Doesn't understand why buffer is needed
- Changes wrong part of the calculation
- Breaks virtual scrolling entirely

## Part 2: Play Next Feature Implementation

### Expected Implementation

**What to look for:**
- Adds "Play Next" button to `SongRow` component
- Button appears in both Playlist and Library views
- Inserts song at front of queue: `setQueue((q) => [song, ...q])` or `setQueue([song, ...queue])`
- Works correctly with shuffle enabled
- Provides visual feedback (button styling, hover states)

**Strong signals:**
- Uses functional update for queue state
- Adds button to SongRow component (reusable)
- Handles edge cases (empty queue, duplicate songs)
- Maintains correct behavior with shuffle
- Clean UI integration

**Red flags:**
- Inserts at wrong position (end instead of front)
- Doesn't work with shuffle enabled
- Breaks existing functionality
- Poor UI/UX (no visual feedback, hard to click)

### Optional: Grouping Features

If candidate implements grouping features, look for:

**Alphabetical Jump:**
- Builds index map efficiently (single pass)
- Uses `scrollToIndex` from virtual scroll hook
- Disables letters with no matching songs
- Works correctly with virtual scrolling

**Group by Album/Artist:**
- Flattens groups into single list for virtual scrolling
- Headers and songs have consistent height
- Maintains correct play queue (only songs, not headers)
- Sorts groups alphabetically

## Ideal State Structure

A well-structured solution should maintain these key state variables:

- `currentSong: Song | null` - Currently playing song
- `queue: Song[]` - Upcoming songs in the queue
- `originalQueue: Song[]` - Preserved original queue order for un-shuffle functionality (added during Bug #2 fix)
- `isShuffled: boolean` - Toggle state for shuffle mode

## React Patterns

### Hooks Usage

**useEffect:**
- **Strong signal:** Proper dependency arrays, cleanup functions
- **Red flag:** Missing dependencies causing stale closures, infinite loops

**useState:**
- **Strong signal:** Functional updates for state derived from previous state (`setQueue(q => [...q, newSong])`)
- **Red flag:** Direct mutation, stale closure issues

**useCallback:**
- **Strong signal:** Uses `useCallback` for event handlers, proper dependencies
- **Red flag:** Missing dependencies causing stale closures

**Custom Hooks:**
- **Strong signal:** Understands existing hooks structure, adds to it cleanly
- **Red flag:** Duplicates logic instead of reusing hooks

### Component Patterns

**Component Extraction:**
- **Strong signal:** Adds Play Next button to existing `SongRow` component
- **Red flag:** Creates duplicate components or breaks existing structure

**List Keys:**
- **Strong signal:** Uses stable keys (song IDs), never array indices
- **Red flag:** Uses array index as key (causes flicker/bugs)

**Component Composition:**
- **Strong signal:** Works with existing component structure
- **Red flag:** Breaks existing component hierarchy

## Virtual Scrolling Implementation

Virtual scrolling is already implemented but has a bug. Candidates should understand:

### Key Formula

```typescript
const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferCount)
const endIndex = Math.min(
  totalItems - 1,
  startIndex + visibleCount + bufferCount  // Buffer needed here!
)
```

### Why Buffer is Needed

- Renders items slightly outside viewport
- Prevents flickering during fast scrolling
- Smooths the scrolling experience
- Both startIndex and endIndex need buffer

### Strong Signals

- Understands why rendering 10K DOM nodes is problematic
- Recognizes buffer is needed for smooth scrolling
- Correctly applies buffer to endIndex calculation
- Tests scrolling performance after fix

### Red Flags

- Doesn't understand why virtual scrolling is needed
- Breaks virtual scrolling entirely
- Doesn't test scrolling after fix
- Doesn't recognize the performance issue

## Time Expectations

### Part 1: Debug the Player (~35 mins)

| Bug | Expected Time | Notes |
|-----|---------------|-------|
| Bug #1 (Off-by-one) | 8-10 min | Should be quick - test with small playlist |
| Bug #2 (Shuffle) | 12-15 min | More complex - multiple issues, requires understanding state |
| Bug #3 (Virtual scroll) | 10-12 min | Requires understanding virtual scrolling algorithm |
| Testing & verification | 5-8 min | Test all fixes together |

**Part 1 Total:** ~35 minutes

### Part 2: Add Features (~20 mins)

| Task | Expected Time | Notes |
|------|---------------|-------|
| Play Next implementation | 15-18 min | Add button, implement logic, test |
| Optional grouping | 10-15 min | If time permits |

**Part 2 Total:** ~20 minutes

**Combined Total:** ~55 minutes (5 min buffer)

## Discussion Questions

Use these questions to probe deeper understanding:

1. **"Walk me through how you identified each bug. What was your debugging process?"**
   - *Look for:* Systematic approach, use of tools, testing strategy

2. **"Why did you need to save `originalQueue` for the shuffle feature?"**
   - *Look for:* Understanding of state management, requirement comprehension

3. **"What would happen if we removed the buffer from virtual scrolling entirely?"**
   - *Look for:* Understanding of performance optimization, virtual scrolling mechanics

4. **"How would you handle a duplicate song being added via Play Next?"**
   - *Look for:* Edge case thinking, user experience consideration

5. **"If we had 1M songs instead of 10K, would your virtual scroll fix still work?"**
   - *Look for:* Understanding of scalability, algorithm complexity

6. **"How would you add unit tests for the queue management logic?"**
   - *Look for:* Testing knowledge, understanding of testable code

7. **"What would you do differently if you were building this from scratch?"**
   - *Look for:* Architectural thinking, understanding of trade-offs

## Green Flags (Strong Signals)

| Area | Signal |
|------|--------|
| **Debugging** | Systematic approach, uses DevTools, tests fixes |
| **Bug Fixes** | Correct fixes, doesn't introduce new bugs |
| **State Management** | Keeps `originalQueue` separate for un-shuffle functionality |
| **Immutability** | Uses spread operator (`[...array]`) or `slice()`, never mutates state directly |
| **Edge Cases** | Handles empty queue, single song, last song gracefully |
| **React Hooks** | Proper `useEffect` dependencies, functional `useState` updates |
| **React Performance** | Understands virtual scrolling, uses `React.memo` appropriately |
| **TypeScript** | Properly types new code, maintains existing types |
| **Code Quality** | Clean, readable, well-organized code |
| **Testing** | Tests fixes thoroughly, verifies edge cases |
| **Feature Implementation** | Play Next works correctly, good UI/UX |

## Red Flags (Concerns)

| Area | Signal |
|------|--------|
| **Debugging** | Random changes, doesn't read errors, doesn't test |
| **State Mutations** | Mutates arrays with `.push()`, `.splice()`, `.sort()` directly on state |
| **Shuffle Logic** | Shuffles the currently playing song, doesn't preserve original order |
| **React Hooks** | Missing `useEffect` dependencies, infinite loops, stale closures |
| **Virtual Scroll** | Doesn't understand buffer concept, breaks virtual scrolling |
| **Queue Logic** | Incorrect queue population (includes current song or wrong slice) |
| **Play Next** | Inserts at wrong position (end instead of front) |
| **Code Quality** | Messy code, breaks existing structure, poor naming |
| **Testing** | Doesn't test fixes, only tests happy path |

## Evaluation Rubric

| Level | Description |
|-------|-------------|
| **Excellent** | Fixes all 3 bugs correctly, implements Play Next feature, handles edge cases, clean code, tests thoroughly |
| **Good** | Fixes all 3 bugs correctly, implements Play Next, minor issues or missing edge cases, readable code |
| **Satisfactory** | Fixes 2-3 bugs (may have issues), implements Play Next with some problems, works but messy |
| **Needs Work** | Struggles to identify bugs, incorrect fixes, doesn't complete Play Next feature, introduces new bugs |
