window.GAME_DATA = {
  classes: {
    knight: {
      name: "Knight",
      stars: "★★☆☆☆",
      description: "Strong defense. Great for beginners who want extra protection.",
      abilityName: "Shield Block",
      ability: "One wrong answer is blocked during each battle or boss attempt.",
      baseStats: { attack: 2, defense: 4, speed: 1, focus: 1 }
    },
    archer: {
      name: "Archer",
      stars: "★★★☆☆",
      description: "Fast and balanced. Great for students who like streak rewards.",
      abilityName: "Streak Shot",
      ability: "Earns bonus coins after every 3 correct answers in a row.",
      baseStats: { attack: 2, defense: 2, speed: 4, focus: 1 }
    },
    mage: {
      name: "Mage",
      stars: "★★★★☆",
      description: "High focus. Great for students who want hints during bosses.",
      abilityName: "Focus Spell",
      ability: "Gets one hint during each boss attempt.",
      baseStats: { attack: 3, defense: 1, speed: 1, focus: 4 }
    }
  },
  areas: [
    { id: "meadow", name: "Meadow", focus: [0,1,2,5,10], unlockLevel: 1, boss: "Meadow Troll" },
    { id: "forest", name: "Forest", focus: [3,4], unlockLevel: 2, boss: "Forest Golem" },
    { id: "cave", name: "Cave", focus: [6,7], unlockLevel: 3, boss: "Crystal Bat" },
    { id: "castle", name: "Castle", focus: [8,9], unlockLevel: 4, boss: "Castle Guardian" },
    { id: "dragon", name: "Dragon Mountain", focus: [0,1,2,3,4,5,6,7,8,9,10,11,12], unlockLevel: 5, boss: "Times Table Dragon" }
  ],
  items: {
    wooden_sword: { name: "Wooden Sword", type: "weapon", slot: "weapon", classAllowed: ["knight"], rarity: "Common", cost: 20, stats: { attack: 1 }, cosmeticOnly: false, description: "A beginner sword for brave problem solvers." },
    iron_helmet: { name: "Iron Helmet", type: "helmet", slot: "hat", classAllowed: ["knight"], rarity: "Uncommon", cost: 35, stats: { defense: 2 }, cosmeticOnly: false, description: "Protects a Knight during tough rounds." },
    steel_armor: { name: "Steel Armor", type: "armor", slot: "body", classAllowed: ["knight"], rarity: "Rare", cost: 60, stats: { defense: 3 }, cosmeticOnly: false, description: "Heavy armor for boss battles." },
    training_shield: { name: "Training Shield", type: "shield", slot: "cosmetic", classAllowed: ["knight"], rarity: "Common", cost: 25, stats: { defense: 1 }, cosmeticOnly: false, description: "A small shield for new Knights." },
    knight_greaves: { name: "Knight Greaves", type: "leg armor", slot: "legs", classAllowed: ["knight"], rarity: "Uncommon", cost: 35, stats: { defense: 1 }, cosmeticOnly: false, description: "Simple leg armor for Knights." },

    practice_bow: { name: "Practice Bow", type: "weapon", slot: "weapon", classAllowed: ["archer"], rarity: "Common", cost: 20, stats: { speed: 1 }, cosmeticOnly: false, description: "A starter bow for quick thinkers." },
    leather_hood: { name: "Leather Hood", type: "helmet", slot: "hat", classAllowed: ["archer"], rarity: "Common", cost: 25, stats: { speed: 1 }, cosmeticOnly: false, description: "Light gear for moving fast." },
    scout_armor: { name: "Scout Armor", type: "armor", slot: "body", classAllowed: ["archer"], rarity: "Uncommon", cost: 45, stats: { defense: 1, speed: 1 }, cosmeticOnly: false, description: "Leather armor for Archers." },
    forest_bow: { name: "Forest Bow", type: "weapon", slot: "weapon", classAllowed: ["archer"], rarity: "Rare", cost: 65, stats: { attack: 1, speed: 2 }, cosmeticOnly: false, description: "A stronger bow earned by steady practice." },
    scout_boots: { name: "Scout Boots", type: "leg armor", slot: "legs", classAllowed: ["archer"], rarity: "Uncommon", cost: 35, stats: { speed: 1 }, cosmeticOnly: false, description: "Light boots for quick Archers." },

    apprentice_wand: { name: "Apprentice Wand", type: "weapon", slot: "weapon", classAllowed: ["mage"], rarity: "Common", cost: 20, stats: { focus: 1 }, cosmeticOnly: false, description: "A wand for new Mages." },
    blue_robe: { name: "Blue Robe", type: "armor", slot: "body", classAllowed: ["mage"], rarity: "Common", cost: 25, stats: { focus: 1 }, cosmeticOnly: false, description: "Cloth gear for focused practice." },
    star_hat: { name: "Star Hat", type: "helmet", slot: "hat", classAllowed: ["mage"], rarity: "Uncommon", cost: 40, stats: { focus: 2 }, cosmeticOnly: false, description: "A magical hat for careful problem solving." },
    moon_staff: { name: "Moon Staff", type: "weapon", slot: "weapon", classAllowed: ["mage"], rarity: "Rare", cost: 70, stats: { attack: 1, focus: 2 }, cosmeticOnly: false, description: "A staff that helps with boss focus." },
    soft_slippers: { name: "Soft Slippers", type: "leg armor", slot: "legs", classAllowed: ["mage"], rarity: "Uncommon", cost: 35, stats: { focus: 1 }, cosmeticOnly: false, description: "Quiet cloth shoes for focused Mages." },

    sparkle_aura: { name: "Sparkle Aura", type: "aura", slot: "aura", classAllowed: ["all"], rarity: "Uncommon", cost: 30, stats: {}, cosmeticOnly: true, description: "A bright aura for any hero." },
    tiny_dragon: { name: "Tiny Dragon Pet", type: "pet", slot: "pet", classAllowed: ["all"], rarity: "Epic", cost: 100, stats: {}, cosmeticOnly: true, description: "A tiny dragon that follows your hero." },
    gold_frame: { name: "Gold Name Frame", type: "frame", slot: "frame", classAllowed: ["all"], rarity: "Rare", cost: 75, stats: {}, cosmeticOnly: true, description: "A shiny frame for your hero profile." },
    leaf_trail: { name: "Leaf Trail", type: "trail", slot: "trail", classAllowed: ["archer"], rarity: "Rare", cost: 55, stats: {}, cosmeticOnly: true, description: "A forest trail for Archers." },
    shield_aura: { name: "Shield Aura", type: "aura", slot: "aura", classAllowed: ["knight"], rarity: "Rare", cost: 55, stats: {}, cosmeticOnly: true, description: "A protective glow for Knights." },
    magic_glow: { name: "Magic Glow", type: "aura", slot: "aura", classAllowed: ["mage"], rarity: "Rare", cost: 55, stats: {}, cosmeticOnly: true, description: "A soft magical glow for Mages." }
  },
  quests: [
    { id: "q_answer10", title: "Daily Quest", text: "Answer 10 multiplication facts.", reward: { coins: 15 } },
    { id: "q_accuracy", title: "Accuracy Quest", text: "Score 80% or higher in a round.", reward: { coins: 20 } },
    { id: "q_training", title: "Training Quest", text: "Complete one Training Area set.", reward: { coins: 15 } },
    { id: "q_mastery", title: "Mastery Quest", text: "Improve one weak fact.", reward: { coins: 20 } },
    { id: "q_bosskey", title: "Boss Prep Quest", text: "Earn a boss key for your current area.", reward: { coins: 25 } }
  ]
};
