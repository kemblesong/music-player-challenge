// Script to generate 10,000 songs sorted A-Z by title
// Run: npx tsx generate-songs.ts

import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Word lists for generating song titles
const adjectives = [
  'Acoustic', 'Amazing', 'Ancient', 'Angry', 'Beautiful', 'Bitter', 'Blazing',
  'Blind', 'Blue', 'Broken', 'Burning', 'Calm', 'Chaotic', 'Cloudy', 'Cold',
  'Cosmic', 'Crazy', 'Crystal', 'Dancing', 'Dark', 'Deep', 'Digital', 'Distant',
  'Divine', 'Dreaming', 'Drifting', 'Dying', 'Electric', 'Endless', 'Eternal',
  'Fading', 'Falling', 'Fast', 'Final', 'Fire', 'Flying', 'Foggy', 'Forever',
  'Frozen', 'Gentle', 'Glowing', 'Golden', 'Good', 'Graceful', 'Grand', 'Green',
  'Grey', 'Happy', 'Heavy', 'Hidden', 'High', 'Hollow', 'Holy', 'Hot', 'Hungry',
  'Hypnotic', 'Icy', 'Infinite', 'Inner', 'Innocent', 'Intense', 'Iron', 'Jazz',
  'Jealous', 'Joyful', 'Kind', 'Last', 'Late', 'Lazy', 'Liquid', 'Little',
  'Living', 'Lonely', 'Long', 'Lost', 'Loud', 'Loving', 'Lucky', 'Lunar', 'Mad',
  'Magic', 'Mellow', 'Melting', 'Midnight', 'Misty', 'Modern', 'Moody', 'Morning',
  'Mystic', 'Natural', 'Neon', 'New', 'Night', 'Northern', 'Ocean', 'Old', 'Open',
  'Orange', 'Pacific', 'Painted', 'Paper', 'Parallel', 'Peaceful', 'Perfect',
  'Pink', 'Plastic', 'Purple', 'Quiet', 'Racing', 'Radiant', 'Rainy', 'Random',
  'Rapid', 'Raw', 'Real', 'Red', 'Rising', 'Rolling', 'Rough', 'Royal', 'Running',
  'Sacred', 'Sad', 'Savage', 'Secret', 'Shadow', 'Shattered', 'Shining', 'Silent',
  'Silver', 'Simple', 'Singing', 'Sinking', 'Sleeping', 'Slow', 'Smoky', 'Smooth',
  'Soft', 'Solar', 'Solid', 'Southern', 'Spinning', 'Spiral', 'Static', 'Stellar',
  'Still', 'Strange', 'Summer', 'Sunny', 'Super', 'Sweet', 'Swift', 'Tangled',
  'Tender', 'Thin', 'Thunder', 'Timeless', 'Tired', 'Toxic', 'Transparent',
  'Traveling', 'Trembling', 'True', 'Twisted', 'Ultimate', 'Under', 'Unknown',
  'Velvet', 'Violent', 'Violet', 'Virtual', 'Vivid', 'Waiting', 'Wandering',
  'Warm', 'Wasted', 'Waving', 'Western', 'White', 'Wicked', 'Wild', 'Winter',
  'Wired', 'Wise', 'Wishing', 'Yellow', 'Young', 'Zero'
]

const nouns = [
  'Angel', 'Arrow', 'Avalanche', 'Bird', 'Blaze', 'Blood', 'Bone', 'Breeze',
  'Bridge', 'Butterfly', 'Canyon', 'Castle', 'Chain', 'Child', 'City', 'Cloud',
  'Coast', 'Comet', 'Crown', 'Crystal', 'Dance', 'Dawn', 'Day', 'Demon', 'Desert',
  'Diamond', 'Door', 'Dragon', 'Dream', 'Driver', 'Dust', 'Eagle', 'Earth',
  'Echo', 'Edge', 'Empire', 'End', 'Enemy', 'Engine', 'Escape', 'Eye', 'Face',
  'Faith', 'Fall', 'Fever', 'Fire', 'Flame', 'Flight', 'Flood', 'Flower', 'Fog',
  'Force', 'Forest', 'Freedom', 'Future', 'Galaxy', 'Game', 'Garden', 'Ghost',
  'Giant', 'Girl', 'Glass', 'Glory', 'Gold', 'Grace', 'Grave', 'Gravity', 'Gun',
  'Hand', 'Harbor', 'Hate', 'Haven', 'Heart', 'Heat', 'Heaven', 'Hero', 'Highway',
  'Hill', 'Hollow', 'Home', 'Honey', 'Hope', 'Horizon', 'Horse', 'Hour', 'House',
  'Hurricane', 'Ice', 'Illusion', 'Island', 'Journey', 'Joy', 'Jungle', 'Justice',
  'Key', 'King', 'Kingdom', 'Kiss', 'Knight', 'Lake', 'Land', 'Lane', 'Legend',
  'Letter', 'Life', 'Light', 'Lightning', 'Line', 'Lion', 'Lips', 'Liquid', 'Love',
  'Machine', 'Magic', 'Man', 'Mask', 'Memory', 'Message', 'Midnight', 'Mile',
  'Mind', 'Mirror', 'Mist', 'Moment', 'Money', 'Monster', 'Moon', 'Morning',
  'Mother', 'Motion', 'Mountain', 'Mouth', 'Murder', 'Music', 'Mystery', 'Name',
  'Nation', 'Nature', 'Night', 'Nightmare', 'Noise', 'Nothing', 'Number', 'Ocean',
  'Outlaw', 'Pain', 'Palace', 'Paradise', 'Passion', 'Path', 'Peace', 'Pearl',
  'Phoenix', 'Picture', 'Pilot', 'Planet', 'Poison', 'Power', 'Prayer', 'Price',
  'Pride', 'Prince', 'Prison', 'Promise', 'Prophet', 'Queen', 'Quest', 'Rain',
  'Rainbow', 'Razor', 'Reason', 'Rebel', 'Reflection', 'Revenge', 'Revolution',
  'Rhapsody', 'Rider', 'Ring', 'River', 'Road', 'Rock', 'Rocket', 'Room', 'Rose',
  'Ruin', 'Rumble', 'Runner', 'Rush', 'Sacrifice', 'Sail', 'Saint', 'Salt', 'Sand',
  'Satellite', 'Savage', 'Scene', 'Sea', 'Season', 'Secret', 'Seeker', 'Shade',
  'Shadow', 'Shape', 'Shell', 'Shelter', 'Shield', 'Ship', 'Shore', 'Shot',
  'Shoulder', 'Silence', 'Silver', 'Sinner', 'Sister', 'Skeleton', 'Skin', 'Sky',
  'Slave', 'Sleep', 'Slide', 'Smoke', 'Snake', 'Snow', 'Soldier', 'Son', 'Song',
  'Sorrow', 'Soul', 'Sound', 'Space', 'Spark', 'Spectrum', 'Speed', 'Spider',
  'Spirit', 'Spring', 'Spy', 'Stain', 'Star', 'State', 'Station', 'Steel', 'Step',
  'Stone', 'Storm', 'Story', 'Stranger', 'Stream', 'Street', 'Strength', 'Strike',
  'String', 'Summer', 'Sun', 'Sunrise', 'Sunset', 'Supernova', 'Surface', 'Surge',
  'Surrender', 'Survivor', 'Swing', 'Sword', 'System', 'Tale', 'Tear', 'Temple',
  'Terror', 'Theory', 'Thief', 'Thing', 'Thorn', 'Thought', 'Throne', 'Thunder',
  'Tide', 'Tiger', 'Time', 'Today', 'Tomorrow', 'Tonight', 'Touch', 'Tower',
  'Town', 'Track', 'Trade', 'Trail', 'Train', 'Trap', 'Traveler', 'Treasure',
  'Tree', 'Trial', 'Tribe', 'Trigger', 'Trip', 'Trouble', 'Trust', 'Truth',
  'Tunnel', 'Turn', 'Twilight', 'Twin', 'Universe', 'Valley', 'Vampire', 'Veil',
  'Velocity', 'Vessel', 'Victory', 'View', 'Village', 'Vine', 'Vintage', 'Violet',
  'Viper', 'Vision', 'Voice', 'Void', 'Volcano', 'Vortex', 'Voyage', 'Wall',
  'Wanderer', 'War', 'Warrior', 'Watch', 'Water', 'Wave', 'Way', 'Weapon',
  'Weather', 'Well', 'Wheel', 'Whisper', 'Widow', 'Wife', 'Wilderness', 'Willow',
  'Wind', 'Window', 'Wine', 'Wing', 'Winter', 'Wire', 'Wish', 'Witch', 'Wolf',
  'Woman', 'Wonder', 'Wood', 'Word', 'World', 'Wound', 'Wraith', 'Wreck', 'Writer',
  'Year', 'Yesterday', 'Youth', 'Zone'
]

const artists = [
  'The Midnight Dreamers', 'Solar Eclipse', 'Neon Pulse', 'Arctic Monkeys',
  'Crystal Visions', 'Electric Storm', 'The Velvet Underground', 'Lunar Echo',
  'Digital Sunrise', 'The Rolling Thunder', 'Cosmic Wanderers', 'Shadow Dancers',
  'The Phoenix Rising', 'Ocean Drive', 'Purple Reign', 'Starlight Express',
  'The Northern Lights', 'Urban Legends', 'Silent Waves', 'The Last Horizon',
  'Midnight Sun', 'Golden Hour', 'The Silver Lining', 'Parallel Universe',
  'Quantum Leap', 'The Infinite Loop', 'Gravity Falls', 'Echo Chamber',
  'The Wandering Souls', 'Twilight Zone', 'Aurora Borealis', 'The Deep End',
  'Phantom Orchestra', 'The Wild Hearts', 'Burning Sky', 'Frozen River',
  'The Glass House', 'Iron Butterfly', 'Velvet Thunder', 'The Paper Kites',
  'Stone Temple', 'The Chain Gang', 'Blue Monday', 'Red Hot Sunday',
  'The Green Machine', 'Yellow Submarine', 'Orange Crush', 'Pink Panther',
  'White Noise', 'Black Mirror', 'Grey Matter', 'The Color Spectrum'
]

const albums = [
  'First Light', 'Midnight Sessions', 'Electric Dreams', 'Lost in Translation',
  'The Great Escape', 'Parallel Lines', 'Infinite Horizons', 'Shadows & Light',
  'Urban Jungle', 'Cosmic Highway', 'Digital Sunset', 'Analog Memories',
  'Future Nostalgia', 'Retro Wave', 'Modern Classic', 'Ancient Future',
  'Crystal Clear', 'Smoke & Mirrors', 'Fire & Ice', 'Earth & Sky',
  'Ocean Deep', 'Mountain High', 'Valley Low', 'Desert Storm',
  'Forest Rain', 'City Lights', 'Country Roads', 'Highway Blues',
  'Subway Sounds', 'Airport Lounge', 'Hotel California', 'Motel 6',
  'Studio Sessions', 'Live at the Apollo', 'Unplugged', 'Plugged In',
  'Volume One', 'Chapter Two', 'Act III', 'Season Finale'
]

interface Song {
  id: string
  title: string
  artist: string
  album: string
  albumArt: string
  duration: number
}

function generateTitle(index: number): string {
  // Generate varied title patterns
  const patterns = [
    () => `${adjectives[index % adjectives.length]} ${nouns[(index * 7) % nouns.length]}`,
    () => `The ${adjectives[(index * 3) % adjectives.length]} ${nouns[(index * 11) % nouns.length]}`,
    () => `${nouns[index % nouns.length]} of ${nouns[(index * 5) % nouns.length]}`,
    () => `${adjectives[(index * 2) % adjectives.length]} ${adjectives[(index * 9) % adjectives.length]} ${nouns[(index * 4) % nouns.length]}`,
    () => nouns[(index * 13) % nouns.length],
    () => `${adjectives[(index * 6) % adjectives.length]}`,
    () => `In the ${nouns[(index * 8) % nouns.length]}`,
    () => `${nouns[(index * 3) % nouns.length]} Song`,
    () => `${adjectives[(index * 5) % adjectives.length]} Night`,
    () => `${nouns[(index * 7) % nouns.length]} Blues`,
  ]

  const pattern = patterns[index % patterns.length]
  return pattern()
}

function generateSongs(count: number): Song[] {
  const songs: Song[] = []
  const usedTitles = new Set<string>()

  let attempts = 0
  let i = 0

  while (songs.length < count && attempts < count * 3) {
    attempts++
    const title = generateTitle(i++)

    // Skip duplicate titles
    if (usedTitles.has(title.toLowerCase())) {
      continue
    }
    usedTitles.add(title.toLowerCase())

    const song: Song = {
      id: `song-${String(songs.length + 1).padStart(5, '0')}`,
      title,
      artist: artists[songs.length % artists.length],
      album: albums[songs.length % albums.length],
      albumArt: `https://picsum.photos/seed/s${songs.length}/300/300`,
      duration: 120 + Math.floor(Math.random() * 300), // 2-7 minutes
    }

    songs.push(song)
  }

  // Sort A-Z by title
  songs.sort((a, b) => a.title.localeCompare(b.title))

  // Re-assign IDs after sorting to maintain order
  songs.forEach((song, index) => {
    song.id = `song-${String(index + 1).padStart(5, '0')}`
  })

  return songs
}

// Generate and save songs
console.log('Generating 10,000 songs...')
const songs = generateSongs(10000)
console.log(`Generated ${songs.length} songs`)

const outputPath = join(__dirname, 'data', 'songs-10000.json')
writeFileSync(outputPath, JSON.stringify(songs, null, 2))
console.log(`Saved to ${outputPath}`)

// Show sample
console.log('\nFirst 5 songs:')
songs.slice(0, 5).forEach(s => console.log(`  - ${s.title} by ${s.artist}`))
console.log('\nLast 5 songs:')
songs.slice(-5).forEach(s => console.log(`  - ${s.title} by ${s.artist}`))
