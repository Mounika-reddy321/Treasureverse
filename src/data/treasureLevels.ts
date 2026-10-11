import { TreasureLevel, TreasureWorld } from '../types/game';

export const TREASURE_WORLDS: TreasureWorld[] = [
  {
    id: 1,
    name: 'Enchanted Forest',
    levelRange: [1, 10],
    themeColor: 'from-emerald-950 via-teal-900 to-slate-950',
    accentColor: '#10b981',
    lore: 'A lush canopy of ancient glowing trees with cheerful fireflies and sleeping treants.',
    icon: '🌲',
  },
  {
    id: 2,
    name: 'Lost Desert',
    levelRange: [11, 20],
    themeColor: 'from-amber-950 via-yellow-900 to-slate-950',
    accentColor: '#f59e0b',
    lore: 'Golden sunlit sand dunes with ancient pyramids and shiny scarab amulets.',
    icon: '🏜️',
  },
  {
    id: 3,
    name: 'Crystal Caves',
    levelRange: [21, 30],
    themeColor: 'from-cyan-950 via-indigo-900 to-slate-950',
    accentColor: '#06b6d4',
    lore: 'Sparkling caverns filled with radiant gemstones that glow in shades of blue and purple.',
    icon: '💎',
  },
  {
    id: 4,
    name: 'Pirate Islands',
    levelRange: [31, 40],
    themeColor: 'from-blue-950 via-sky-900 to-slate-950',
    accentColor: '#0284c7',
    lore: 'Sunny tropical islands where privateers hid chests of gold doubloons.',
    icon: '🏴‍☠️',
  },
  {
    id: 5,
    name: 'Frozen Kingdom',
    levelRange: [41, 50],
    themeColor: 'from-slate-900 via-sky-950 to-indigo-950',
    accentColor: '#38bdf8',
    lore: 'A glistening ice palace illuminated by the vibrant dancing lights of the northern aurora.',
    icon: '❄️',
  },
  {
    id: 6,
    name: 'Sunken City',
    levelRange: [51, 60],
    themeColor: 'from-blue-950 via-teal-950 to-slate-950',
    accentColor: '#14b8a6',
    lore: 'An underwater coral palace with friendly sea turtles and glowing pearls.',
    icon: '🏛️',
  },
  {
    id: 7,
    name: 'Volcano Valley',
    levelRange: [61, 70],
    themeColor: 'from-red-950 via-orange-950 to-slate-950',
    accentColor: '#f97316',
    lore: 'Warm volcanic hills where fire-forged golden keys unlock obsidian chests.',
    icon: '🌋',
  },
  {
    id: 8,
    name: 'Ancient Temple',
    levelRange: [71, 80],
    themeColor: 'from-amber-950 via-stone-900 to-slate-950',
    accentColor: '#eab308',
    lore: 'Golden courtyards built by celestial stargazers to honor the sun and moon.',
    icon: '⛩️',
  },
  {
    id: 9,
    name: 'Shadow Realm',
    levelRange: [81, 90],
    themeColor: 'from-purple-950 via-violet-950 to-slate-950',
    accentColor: '#a855f7',
    lore: 'A mysterious twilight grove lit by floating starlight lanterns and crystal spheres.',
    icon: '🔮',
  },
  {
    id: 10,
    name: 'Dragon Kingdom',
    levelRange: [91, 100],
    themeColor: 'from-rose-950 via-amber-950 to-slate-950',
    accentColor: '#ef4444',
    lore: 'A majestic mountain fortress protected by gentle golden dragons.',
    icon: '🐉',
  },
  {
    id: 11,
    name: 'Starlight Galaxy',
    levelRange: [101, 110],
    themeColor: 'from-indigo-950 via-purple-900 to-slate-950',
    accentColor: '#818cf8',
    lore: 'Floating cosmic islands connected by sparkling rainbow bridges.',
    icon: '✨',
  },
  {
    id: 12,
    name: 'Cloud Haven',
    levelRange: [111, 120],
    themeColor: 'from-sky-950 via-blue-900 to-slate-950',
    accentColor: '#38bdf8',
    lore: 'Fluffy cloud kingdoms where winged guardians watch over sky shrines.',
    icon: '☁️',
  },
  {
    id: 13,
    name: 'Clockwork Citadel',
    levelRange: [121, 130],
    themeColor: 'from-amber-950 via-orange-900 to-slate-950',
    accentColor: '#fbbf24',
    lore: 'A marvelous city of polished brass gears, windup music boxes, and gold pendulum clocks.',
    icon: '⚙️',
  },
  {
    id: 14,
    name: 'Emerald Jungle',
    levelRange: [131, 140],
    themeColor: 'from-emerald-950 via-green-900 to-slate-950',
    accentColor: '#34d399',
    lore: 'Deep rainforest filled with exotic flowers, laughing monkeys, and hidden stone altars.',
    icon: '🌴',
  },
  {
    id: 15,
    name: 'Celestial Crown',
    levelRange: [141, 150],
    themeColor: 'from-yellow-950 via-amber-900 to-slate-950',
    accentColor: '#facc15',
    lore: 'The supreme peak of the TreasureVerse, where the Grand Adventurer Crown awaits.',
    icon: '👑',
  },
];

// Simple, clear, fun, progressive questions tailored to each world and level
export interface SimpleTreasureQuestion {
  prompt: string;
  options: string[];
  answer: string;
  hint: string;
  explanation: string;
}

export const SIMPLE_QUESTIONS: SimpleTreasureQuestion[] = [
  // World 1: Enchanted Forest (Levels 1-10) - Very simple nature & everyday items
  {
    prompt: "What shines brightly in the daytime sky and gives warmth to the trees?",
    options: ["The Sun ☀️", "A Rain Cloud 🌧️", "The Moon 🌙", "The Wind 💨"],
    answer: "The Sun ☀️",
    hint: "It rises in the morning and sets in the evening.",
    explanation: "The sun brings bright light and warmth to the forest every day!",
  },
  {
    prompt: "What metal tool is turned inside a keyhole to open a treasure chest?",
    options: ["A Golden Key 🗝️", "A Heavy Stone 🪨", "A Wooden Stick 🪵", "A Leaf 🍃"],
    answer: "A Golden Key 🗝️",
    hint: "It fits directly inside the keyhole.",
    explanation: "A golden key turns the tumblers inside the lock to open the chest!",
  },
  {
    prompt: "What falls softly from gray clouds to give water to flowers and rivers?",
    options: ["Raindrops 🌧️", "Fire Sparks 🔥", "Sand Dust 🏜️", "Fallen Leaves 🍂"],
    answer: "Raindrops 🌧️",
    hint: "It makes a gentle pitter-patter sound on the leaves.",
    explanation: "Rain brings fresh water that plants and forest animals drink!",
  },
  {
    prompt: "I have green leaves, a strong brown trunk, and birds build nests in my branches. What am I?",
    options: ["A Tree 🌲", "A River 🌊", "A Cloud ☁️", "A Boulder 🪨"],
    answer: "A Tree 🌲",
    hint: "Squirrels climb me and birds rest in my shade.",
    explanation: "Forest trees provide shelter and clean air for everyone!",
  },
  {
    prompt: "What has a clock face and two moving hands that show you the time of day?",
    options: ["A Clock ⏰", "A Mirror 🪞", "A Painting 🖼️", "A Window 🪟"],
    answer: "A Clock ⏰",
    hint: "Tick-tock, it rings when an alarm goes off.",
    explanation: "A clock's hands move around the numbers 1 to 12 to tell the hour!",
  },
  {
    prompt: "If you shout inside a quiet mountain canyon, what brings your voice right back to you?",
    options: ["An Echo 🗣️", "A Shadow 👤", "The Wind 💨", "A River 🌊"],
    answer: "An Echo 🗣️",
    hint: "It repeats the exact words you just said.",
    explanation: "Sound waves bounce off the canyon walls creating an echo!",
  },
  {
    prompt: "What opens up above your head to keep you dry when it starts to rain?",
    options: ["An Umbrella ☂️", "A Kite 🪁", "A Balloon 🎈", "A Hat 🎩"],
    answer: "An Umbrella ☂️",
    hint: "It has a handle and a waterproof canopy.",
    explanation: "An umbrella shields you from raindrops falling from above!",
  },
  {
    prompt: "What follows you in the bright sunshine, but disappears when you step into the dark?",
    options: ["Your Shadow 👤", "Your Shoes 👟", "Your Glasses 👓", "Your Backpack 🎒"],
    answer: "Your Shadow 👤",
    hint: "Your body blocks sunlight to create this dark silhouette on the grass.",
    explanation: "Your shadow copies your movements in the light!",
  },
  {
    prompt: "What has many pages filled with exciting adventure stories and knowledge?",
    options: ["A Book 📖", "A Mirror 🪞", "A Box 📦", "A Shield 🛡️"],
    answer: "A Book 📖",
    hint: "You read its chapters from front to back.",
    explanation: "Books hold ancient tales, riddles, and maps of treasure islands!",
  },
  {
    prompt: "What has many teeth, but never bites, and is used every morning to comb your hair?",
    options: ["A Comb 🪮", "A Saw 🪚", "A Fork 🍴", "A Zipper 🤐"],
    answer: "A Comb 🪮",
    hint: "It keeps your hair neat and untangled.",
    explanation: "A hair comb has a row of smooth teeth to style hair!",
  },

  // World 2: Lost Desert (Levels 11-20) - Travel tools, sand, desert landmarks
  {
    prompt: "What has rivers without water, mountains without trees, and maps out hidden treasure?",
    options: ["A Treasure Map 🗺️", "A Mirror 🪞", "A Desert Rock 🪨", "A Clock ⏰"],
    answer: "A Treasure Map 🗺️",
    hint: "It has an 'X' marking where the chest is buried.",
    explanation: "A parchment map guides adventurers across uncharted dunes!",
  },
  {
    prompt: "What small pocket tool has a magnetic needle pointing North to guide lost travelers?",
    options: ["A Compass 🧭", "A Watch ⌚", "A Coin 🪙", "A Whistle 🪈"],
    answer: "A Compass 🧭",
    hint: "Its needle always points to magnetic North.",
    explanation: "A compass ensures you never lose your direction in the desert!",
  },
  {
    prompt: "In the hot desert, what cool pool of freshwater is surrounded by shady palm trees?",
    options: ["An Oasis 🌴", "A Mirage 🌫️", "A Canyon 🏜️", "A Cave 🕳️"],
    answer: "An Oasis 🌴",
    hint: "Camels and travelers rest here for fresh water.",
    explanation: "An oasis is a lush paradise nestled among desert sands!",
  },
  {
    prompt: "What round glass tool uses sand falling between two glass bulbs to count time?",
    options: ["An Hourglass ⏳", "A Telescope 🔭", "A Bottle 🍾", "A Lantern 🏮"],
    answer: "An Hourglass ⏳",
    hint: "Turn it upside down to start the timer again.",
    explanation: "Golden sand grains trickle through the narrow neck to measure time!",
  },
  {
    prompt: "What large animal is called 'the Ship of the Desert' and can travel days without water?",
    options: ["A Camel 🐪", "A Lion 🦁", "A Falcon 🦅", "A Horse 🐎"],
    answer: "A Camel 🐪",
    hint: "It has humps on its back and wide padded hooves.",
    explanation: "Camels are perfectly adapted to trek across hot sandy dunes!",
  },
  {
    prompt: "Feed me dry wood and I burn warm and bright, but splash me with water and I go out. What am I?",
    options: ["A Campfire 🔥", "A Stone 🪨", "A Tree 🌲", "A Blanket ⛺"],
    answer: "A Campfire 🔥",
    hint: "Adventurers sit around it at night to cook and keep warm.",
    explanation: "A campfire gives light and warmth under the starry night sky!",
  },
  {
    prompt: "What gets wetter and wetter the more it dries you after washing up?",
    options: ["A Towel 🧖", "A Sponge 🧽", "A Blanket 🛏️", "A Soap 🧼"],
    answer: "A Towel 🧖",
    hint: "You use it after a shower or swim to dry off.",
    explanation: "A towel absorbs moisture while drying your hands and face!",
  },
  {
    prompt: "What shiny round gold piece was used by ancient merchant caravans to trade?",
    options: ["A Gold Coin 🪙", "A Pebble 🪨", "A Ring 💍", "A Button 🔘"],
    answer: "A Gold Coin 🪙",
    hint: "Pirates and kings fill their treasure chests with them.",
    explanation: "Gold coins are the classic currency of treasure hunts!",
  },
  {
    prompt: "What wooden stick with a blazing flame on top lights up dark desert tombs?",
    options: ["A Torch 🔦", "A Staff 🪄", "An Arrow 🏹", "A Spear 🗡️"],
    answer: "A Torch 🔦",
    hint: "You hold it in your hand to light up dark corridors.",
    explanation: "A blazing torch drives away darkness in ancient tombs!",
  },
  {
    prompt: "What ancient stone monument has four triangular sides that meet at a sharp top point?",
    options: ["A Pyramid 🔺", "A Castle 🏰", "A Bridge 🌉", "A Tower 🗼"],
    answer: "A Pyramid 🔺",
    hint: "Famous desert monument built by ancient pharaohs.",
    explanation: "Pyramids have guarded desert secrets and treasures for millennia!",
  },

  // World 3: Crystal Caves (Levels 21-30) - Crystals, sound, underground wonders
  {
    prompt: "What precious stone is clear as ice, hard as rock, and sparkles in rainbow colors?",
    options: ["A Crystal Gem 💎", "A Sea Shell 🐚", "A Soft Clay 🧱", "A Glass Pebble 🪨"],
    answer: "A Crystal Gem 💎",
    hint: "It shines brilliantly when lantern light hits it.",
    explanation: "Cave crystals refract light into dazzling rainbow beams!",
  },
  {
    prompt: "What has a thumb and four fingers, but has no bones or blood?",
    options: ["A Glove 🧤", "A Clock ⏰", "A Tree Branch 🌿", "A Fork 🍴"],
    answer: "A Glove 🧤",
    hint: "You wear it on your hand to protect from cold cave walls.",
    explanation: "A warm glove fits your five fingers to keep you safe!",
  },
  {
    prompt: "What can fill an entire dark cavern, but takes up zero space and weighs nothing?",
    options: ["Lantern Light 💡", "River Water 💧", "Sand Boulders 🪨", "Cave Air 💨"],
    answer: "Lantern Light 💡",
    hint: "Turn on your lamp and darkness vanishes.",
    explanation: "Light illuminates every nook and cranny without taking up room!",
  },
  {
    prompt: "Look into me and you will see your own smiling face looking right back at you. What am I?",
    options: ["A Mirror 🪞", "A Window 🪟", "A Wall 🧱", "A Map 🗺️"],
    answer: "A Mirror 🪞",
    hint: "Clear calm water can also act like this shiny surface.",
    explanation: "A reflective mirror bounces back your exact likeness!",
  },
  {
    prompt: "When you strike me with a tiny hammer, I ring out with a clear chime that echoes. What am I?",
    options: ["A Golden Bell 🔔", "A Wooden Log 🪵", "A Soft Pillow 🛏️", "A Canvas Bag 🎒"],
    answer: "A Golden Bell 🔔",
    hint: "Church towers and alarm clocks have one of these.",
    explanation: "A metal bell vibrates to produce a clear, ringing chime!",
  },
  {
    prompt: "What has a neck, wears a bottle cap, but has no head, and holds drinking water?",
    options: ["A Canteen Bottle 🍼", "A Shirt 👕", "A Guitar 🎸", "A Vase 🏺"],
    answer: "A Canteen Bottle 🍼",
    hint: "You drink fresh water from it during cave treks.",
    explanation: "A canteen bottle has a neck and cap to keep your drink safe!",
  },
  {
    prompt: "What breaks the very instant you speak its name out loud?",
    options: ["Silence 🤫", "A Window 🪟", "A Secret 🗝️", "A Promise 🤝"],
    answer: "Silence 🤫",
    hint: "Any sound or whisper ends it immediately.",
    explanation: "The moment a sound is made, silence is broken!",
  },
  {
    prompt: "What valuable green gemstone is found glowing deep within crystal cavern walls?",
    options: ["An Emerald 🟢", "A Pearl ⚪", "A Coal 🪨", "A Ruby 🔴"],
    answer: "An Emerald 🟢",
    hint: "It has the color of lush green leaves.",
    explanation: "Emeralds are famous vibrant green gemstones treasured worldwide!",
  },
  {
    prompt: "What hangs from the roof of a cave like an icicle, formed by dripping mineral water?",
    options: ["A Stalactite 🧊", "A Root 🌿", "A Rope 🪢", "A Chandelier 🕯️"],
    answer: "A Stalactite 🧊",
    hint: "It 'holds tight' to the cave ceiling.",
    explanation: "Stalactites form over thousands of years from mineral water drops!",
  },
  {
    prompt: "What flying creature sleeps upside down in caves during the day and flies at night?",
    options: ["A Bat 🦇", "An Owl 🦉", "A Butterfly 🦋", "A Falcon 🦅"],
    answer: "A Bat 🦇",
    hint: "It has wings and uses echolocation to navigate in the dark.",
    explanation: "Bats roost upside down in caverns and help keep insect counts low!",
  },

  // World 4: Pirate Islands (Levels 31-40)
  {
    prompt: "What heavy iron hook is thrown overboard from a pirate ship to keep it from drifting?",
    options: ["An Anchor ⚓", "A Cannonball 💣", "A Net 🕸️", "A Barrel 🛢️"],
    answer: "An Anchor ⚓",
    hint: "It digs into the ocean seabed.",
    explanation: "The ship's anchor grips the sea floor so the boat stays in harbor!",
  },
  {
    prompt: "What colorful bird sits on a pirate's shoulder and can mimic human words?",
    options: ["A Parrot 🦜", "A Seagull 🐦", "A Pelican 🦤", "A Duck 🦆"],
    answer: "A Parrot 🦜",
    hint: "It has bright green, blue, and red feathers and squawks 'Ahoy!'",
    explanation: "Friendly tropical parrots are the classic companions of pirate captains!",
  },
  {
    prompt: "What large wooden vessel with white sails crosses the ocean waves?",
    options: ["A Pirate Ship ⛵", "A Rowboat 🛶", "A Raft 🪵", "A Canoe 🛶"],
    answer: "A Pirate Ship ⛵",
    hint: "It has masts, sails, and a ship's steering wheel.",
    explanation: "Sturdy galleons and pirate sloops sail across uncharted waters!",
  },
  {
    prompt: "What glass tube with lenses lets sailors spot distant islands across the sea?",
    options: ["A Spyglass Telescope 🔭", "A Microscope 🔬", "A Lantern 🏮", "A Mirror 🪞"],
    answer: "A Spyglass Telescope 🔭",
    hint: "You hold it up to one eye to see far away.",
    explanation: "A brass spyglass brings distant horizons and treasure islands into view!",
  },
  {
    prompt: "What round wooden wheel on the ship deck does the captain turn to steer the vessel?",
    options: ["The Ship's Wheel ☸️", "The Anchor ⚓", "The Compass 🧭", "The Flag 🏴‍☠️"],
    answer: "The Ship's Wheel ☸️",
    hint: "Turn it left to go port, turn it right to go starboard.",
    explanation: "The helm or ship wheel turns the rudder in the water to steer!",
  },
  {
    prompt: "What shiny round gemstone is found inside ocean oyster shells?",
    options: ["A Pearl 🦪", "A Diamond 💎", "An Amber 🟡", "A Sapphire 🔷"],
    answer: "A Pearl 🦪",
    hint: "It is smooth, round, and has a milky white sheen.",
    explanation: "Oysters create lustrous pearls deep under ocean waves!",
  },
  {
    prompt: "What black flag with a skull and crossbones is flown by pirate crews?",
    options: ["The Jolly Roger 🏴‍☠️", "A White Banner 🏳️", "A Rainbow Flag 🏳️‍🌈", "A Signal Pennant 🚩"],
    answer: "The Jolly Roger 🏴‍☠️",
    hint: "It warns other vessels that buccaneers are approaching.",
    explanation: "The Jolly Roger is the legendary flag of adventurous sea raiders!",
  },
  {
    prompt: "What large wooden container holds sweet island water or treasure on a pirate deck?",
    options: ["A Barrel 🛢️", "A Bucket 🪣", "A Box 📦", "A Chest 💼"],
    answer: "A Barrel 🛢️",
    hint: "It is round, made of oak staves and metal hoops.",
    explanation: "Wooden barrels stored provisions, rum, and fresh water on voyages!",
  },
  {
    prompt: "What sea creature has eight long tentacles with suction cups?",
    options: ["An Octopus 🐙", "A Crab 🦀", "A Lobster 🦞", "A Starfish ⭐️"],
    answer: "An Octopus 🐙",
    hint: "It can change colors and squirt dark ink to escape.",
    explanation: "An octopus is super smart and uses eight tentacles to explore reefs!",
  },
  {
    prompt: "What letter on a pirate map traditionally marks the exact spot of buried gold?",
    options: ["The Letter 'X' ❌", "The Letter 'O' ⭕️", "The Letter 'A' 🅰️", "The Letter 'Z' 💤"],
    answer: "The Letter 'X' ❌",
    hint: "'X marks the spot!'",
    explanation: "'X' is the world-famous marker where treasure hunters dig for chests!",
  },

  // World 5: Frozen Kingdom (Levels 41-50)
  {
    prompt: "What dancing green and purple lights illuminate the northern winter sky at night?",
    options: ["The Aurora Lights 🌌", "A Sunset 🌅", "A Lightning Bolt ⚡️", "A Fireworks 🎆"],
    answer: "The Aurora Lights 🌌",
    hint: "Also known as the Northern Lights or Aurora Borealis.",
    explanation: "The magical aurora shimmers across polar night skies in vivid colors!",
  },
  {
    prompt: "What delicate six-pointed ice crystal falls gently from winter clouds?",
    options: ["A Snowflake ❄️", "A Hailstone 🧊", "A Raindrop 💧", "A Frost Pearl ⚪️"],
    answer: "A Snowflake ❄️",
    hint: "No two snowflakes in the world are exactly alike.",
    explanation: "Snowflakes form intricate hexagonal crystal patterns in chilly air!",
  },
  {
    prompt: "What arctic bird wears a black-and-white 'tuxedo' and waddles across the ice?",
    options: ["A Penguin 🐧", "A Puffin 🦜", "A Seagull 🐦", "An Owl 🦉"],
    answer: "A Penguin 🐧",
    hint: "It swims like a fish and slides on its belly across snow.",
    explanation: "Penguins are expert swimmers and huddle together to stay warm!",
  },
  {
    prompt: "What dome-shaped shelter is built out of packed snow blocks in polar regions?",
    options: ["An Igloo 🛖", "A Tent ⛺️", "A Cabin 🪵", "A Castle 🏰"],
    answer: "An Igloo 🛖",
    hint: "Inuit hunters build them from ice and snow blocks.",
    explanation: "An igloo traps body heat inside, keeping dwellers surprisingly warm!",
  },
  {
    prompt: "What solid state does liquid water turn into when frozen below zero degrees?",
    options: ["Ice 🧊", "Steam 💨", "Mist 🌫️", "Snow slush 🍧"],
    answer: "Ice 🧊",
    hint: "Ponds freeze into it in deep winter so you can ice-skate.",
    explanation: "Water freezes into solid ice at 0 degrees Celsius!",
  },
  {
    prompt: "What large white bear has thick fur and hunts across floating arctic sea ice?",
    options: ["A Polar Bear 🐻‍❄️", "A Grizzly Bear 🐻", "A Panda 🐼", "A Wolf 🐺"],
    answer: "A Polar Bear 🐻‍❄️",
    hint: "The world's largest land carnivore with thick white fur.",
    explanation: "Polar bears are powerful arctic swimmers adapted to freezing waters!",
  },
  {
    prompt: "What long spike of frozen ice hangs pointing downward from snowy rooftops?",
    options: ["An Icicle 🍦", "A Stalagmite 🪨", "A Spear 🗡️", "A Snowball ❄️"],
    answer: "An Icicle 🍦",
    hint: "It forms when melting snow drips and freezes again in the cold air.",
    explanation: "Dripping water freezes in layers to create sharp, clear icicles!",
  },
  {
    prompt: "What wooden runners are attached to a sled or your feet to glide across snow?",
    options: ["Skis & Sled Runners 🎿", "Wheels 🛞", "Rollers 🛹", "Stilts 🪵"],
    answer: "Skis & Sled Runners 🎿",
    hint: "Cross-country explorers use them to travel swiftly over deep snow.",
    explanation: "Skis distribute weight so you slide smoothly across fluffy powder!",
  },
  {
    prompt: "What thick woolen wrap do you wear around your neck to stay warm in a blizzard?",
    options: ["A Warm Scarf 🧣", "A Belt 🥋", "A Tie 👔", "A Ribbon 🎗️"],
    answer: "A Warm Scarf 🧣",
    hint: "You wrap it snug around your neck along with a warm coat.",
    explanation: "A cozy scarf blocks icy winter winds from chilling your neck!",
  },
  {
    prompt: "What warm steaming drink with marshmallows warms adventurers after an icy quest?",
    options: ["Hot Cocoa ☕️", "Cold Lemonade 🥤", "Ice Water 🧊", "Fruit Juice 🧃"],
    answer: "Hot Cocoa ☕️",
    hint: "Sweet chocolate beverage served in a steaming mug.",
    explanation: "Hot chocolate warms you up from the inside out after a frosty adventure!",
  },
];

// Helper to generate levels 1 to 150 with rich simple questions and understandable quest setups
export function getTreasureLevel(lvl: number): TreasureLevel {
  const levelNum = Math.max(1, Math.min(150, lvl));
  const worldId = Math.min(15, Math.ceil(levelNum / 10));
  const worldIndex = (levelNum - 1) % 10;
  const world = TREASURE_WORLDS[worldId - 1] || TREASURE_WORLDS[0];

  const questTitles = [
    'The Guardian Gate', 'The Sun Dial', 'Golden Key Clearing', 'The Ancient Tablet',
    'Whispering Alcove', 'The Starlight Shrine', 'The Sacred Altar', 'The Hidden Vault',
    'The Echo Cavern', 'The Grand Treasure Room',
  ];
  const title = `${world.name}: ${questTitles[worldIndex]}`;

  // Pick question based on level
  const questionData = SIMPLE_QUESTIONS[(levelNum - 1) % SIMPLE_QUESTIONS.length];

  // Hotspots setup with very clear roles:
  // Key Spot (where key is found), Clue Spot (where hint is read), Chest Spot (where chest is opened)
  const keyX = 18 + ((levelNum * 11) % 50);
  const keyY = 32 + ((levelNum * 7) % 36);

  const chestX = 72 - ((levelNum * 5) % 25);
  const chestY = 48 + ((levelNum * 8) % 24);

  const clueX = 45 + ((levelNum * 9) % 20);
  const clueY = 22 + ((levelNum * 6) % 20);

  const hotspots = [
    {
      id: 'spot-key',
      label: 'Golden Vault Key',
      x: keyX,
      y: keyY,
      type: 'key' as const,
      icon: '🗝️',
      discovered: false,
      dialogue: 'You found the Golden Key! It fits the locked treasure chest.',
    },
    {
      id: 'spot-chest',
      label: 'Gilded Treasure Chest',
      x: chestX,
      y: chestY,
      type: 'chest' as const,
      icon: '💎',
      discovered: false,
      dialogue: 'The Treasure Chest! Insert the key and answer the question to claim the diamonds.',
    },
    {
      id: 'spot-clue',
      label: 'Helpful Clue Scroll',
      x: clueX,
      y: clueY,
      type: 'clue' as const,
      icon: '📜',
      discovered: false,
      dialogue: `Pip reads the scroll: "${questionData.hint}"`,
    },
  ];

  return {
    level: levelNum,
    worldId,
    title,
    story: `Welcome to ${world.name}! Pip the Explorer needs your help. Tap the Golden Key in the scene, then open the Treasure Chest!`,
    objective: `Find the Golden Key, then answer the question on the chest to claim your diamonds!`,
    puzzleType: 'guardian-riddle',
    clues: [
      `Hint: ${questionData.hint}`,
      `Answer Clue: ${questionData.explanation}`,
    ],
    hotspots,
    riddle: {
      prompt: questionData.prompt,
      options: questionData.options,
      answer: questionData.answer,
      explanation: questionData.explanation,
    },
    switches: {
      labels: ['First Rune', 'Second Rune', 'Third Rune'],
      sequence: [0, 1, 2],
    },
    rewardDiamonds: 20 + Math.floor(levelNum * 0.25),
    hint1: `First step: Tap the glowing Golden Key 🗝️ in the scene to pick it up!`,
    hint2: `Question hint: ${questionData.hint}`,
    hint3: `The correct answer to the chest's riddle is: "${questionData.answer}".`,
  };
}

export const ALL_TREASURE_LEVELS: TreasureLevel[] = Array.from({ length: 150 }, (_, i) => getTreasureLevel(i + 1));
