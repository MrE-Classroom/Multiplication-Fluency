window.GAME_DATA = {
  classes: {
    knight: {
      name: 'Knight', icon: '🛡️', difficulty: 2,
      description: 'Strong defense and steady progress.',
      ability: { name: 'Shield Block', description: 'Blocks one wrong answer during a boss battle.', resource: 'Guard' },
      baseStats: { hp: 5, mana: 1, attack: 2, defense: 3, speed: 1, focus: 1 }
    },
    archer: {
      name: 'Archer', icon: '🏹', difficulty: 3,
      description: 'Fast and balanced. Great for streaks.',
      ability: { name: 'Streak Shot', description: 'Earns bonus coins after 3 correct answers in a row.', resource: 'Focus' },
      baseStats: { hp: 4, mana: 2, attack: 2, defense: 2, speed: 3, focus: 2 }
    },
    mage: {
      name: 'Mage', icon: '🪄', difficulty: 4,
      description: 'High focus and magic support. Lower defense.',
      ability: { name: 'Focus Spell', description: 'Removes two wrong choices once during a boss battle.', resource: 'Mana' },
      baseStats: { hp: 3, mana: 4, attack: 3, defense: 1, speed: 1, focus: 4 }
    }
  },
  areas: [
    { id: 'meadow', name: 'Meadow', icon: '🌼', focus: [0,1,2,5,10], roundsNeeded: 2, accuracyNeeded: 75, boss: 'Meadow Slime' },
    { id: 'forest', name: 'Forest', icon: '🌲', focus: [3,4], roundsNeeded: 3, accuracyNeeded: 80, boss: 'Forest Troll' },
    { id: 'cave', name: 'Cave', icon: '🪨', focus: [6,7], roundsNeeded: 3, accuracyNeeded: 80, boss: 'Cave Golem' },
    { id: 'castle', name: 'Castle', icon: '🏰', focus: [8,9], roundsNeeded: 3, accuracyNeeded: 85, boss: 'Castle Guardian' },
    { id: 'dragon', name: 'Dragon Mountain', icon: '🐉', focus: [0,1,2,3,4,5,6,7,8,9,10], roundsNeeded: 4, accuracyNeeded: 85, boss: 'Multiplication Dragon' }
  ],
  items: {
    wood_sword: { name:'Wooden Sword', icon:'🗡️', type:'weapon', slot:'weapon', classAllowed:['knight'], cost:25, rarity:'Common', stats:{attack:1}, description:'A reliable beginner sword.' },
    iron_sword: { name:'Iron Sword', icon:'⚔️', type:'weapon', slot:'weapon', classAllowed:['knight'], cost:60, rarity:'Uncommon', stats:{attack:2}, description:'A stronger knight weapon.' },
    shield: { name:'Training Shield', icon:'🛡️', type:'shield', slot:'cosmetic', classAllowed:['knight'], cost:40, rarity:'Common', stats:{defense:1}, description:'A shield for brave problem solvers.' },
    iron_helmet: { name:'Iron Helmet', icon:'⛑️', type:'helmet', slot:'head', classAllowed:['knight'], cost:35, rarity:'Common', stats:{defense:1}, description:'Heavy head gear for knights.' },
    steel_armor: { name:'Steel Armor', icon:'🥋', type:'armor', slot:'body', classAllowed:['knight'], cost:70, rarity:'Rare', stats:{defense:2}, description:'Strong knight armor.' },
    knight_boots: { name:'Knight Boots', icon:'🥾', type:'legs', slot:'legs', classAllowed:['knight'], cost:35, rarity:'Common', stats:{defense:1}, description:'Sturdy boots for steady steps.' },

    practice_bow: { name:'Practice Bow', icon:'🏹', type:'weapon', slot:'weapon', classAllowed:['archer'], cost:25, rarity:'Common', stats:{speed:1}, description:'A beginner bow for archers.' },
    forest_bow: { name:'Forest Bow', icon:'🏹', type:'weapon', slot:'weapon', classAllowed:['archer'], cost:65, rarity:'Uncommon', stats:{attack:1,speed:1}, description:'A faster bow for streaks.' },
    leather_hood: { name:'Leather Hood', icon:'🧢', type:'helmet', slot:'head', classAllowed:['archer'], cost:30, rarity:'Common', stats:{speed:1}, description:'Light head gear for archers.' },
    light_armor: { name:'Light Armor', icon:'🎽', type:'armor', slot:'body', classAllowed:['archer'], cost:55, rarity:'Uncommon', stats:{defense:1,speed:1}, description:'Flexible armor that does not slow you down.' },
    scout_boots: { name:'Scout Boots', icon:'👢', type:'legs', slot:'legs', classAllowed:['archer'], cost:40, rarity:'Common', stats:{speed:1}, description:'Boots made for quick movement.' },
    quiver: { name:'Quiver Pack', icon:'🎒', type:'cosmetic', slot:'cosmetic', classAllowed:['archer'], cost:35, rarity:'Common', stats:{}, description:'A ranger-style cosmetic pack.' },

    training_wand: { name:'Training Wand', icon:'🪄', type:'weapon', slot:'weapon', classAllowed:['mage'], cost:25, rarity:'Common', stats:{focus:1}, description:'A beginner wand for mages.' },
    star_staff: { name:'Star Staff', icon:'✨', type:'weapon', slot:'weapon', classAllowed:['mage'], cost:70, rarity:'Rare', stats:{attack:1,focus:2}, description:'A focused magic staff.' },
    wizard_hat: { name:'Wizard Hat', icon:'🎩', type:'helmet', slot:'head', classAllowed:['mage'], cost:30, rarity:'Common', stats:{focus:1}, description:'Classic mage head gear.' },
    blue_robe: { name:'Blue Robe', icon:'🧥', type:'armor', slot:'body', classAllowed:['mage'], cost:55, rarity:'Uncommon', stats:{focus:2}, description:'Cloth robe for magic focus.' },
    magic_shoes: { name:'Magic Shoes', icon:'👟', type:'legs', slot:'legs', classAllowed:['mage'], cost:40, rarity:'Common', stats:{mana:1}, description:'Shoes with a small mana boost.' },
    spellbook: { name:'Spellbook', icon:'📘', type:'cosmetic', slot:'cosmetic', classAllowed:['mage'], cost:45, rarity:'Uncommon', stats:{focus:1}, description:'A magical study companion.' },

    tiny_dragon: { name:'Tiny Dragon Pet', icon:'🐲', type:'pet', slot:'pet', classAllowed:['all'], cost:100, rarity:'Epic', stats:{}, description:'A small dragon that follows your hero.' },
    owl_pet: { name:'Owl Pet', icon:'🦉', type:'pet', slot:'pet', classAllowed:['all'], cost:80, rarity:'Rare', stats:{}, description:'A wise companion.' },
    sparkle_aura: { name:'Sparkle Aura', icon:'🌟', type:'aura', slot:'aura', classAllowed:['all'], cost:60, rarity:'Rare', stats:{}, description:'A bright cosmetic aura.' },
    gold_frame: { name:'Gold Name Frame', icon:'🏅', type:'frame', slot:'frame', classAllowed:['all'], cost:75, rarity:'Rare', stats:{}, description:'A shiny name frame.' }
  },
  starterItems: ['wood_sword','practice_bow','training_wand'],
  quests: [
    { id:'daily10', name:'Daily Quest', desc:'Answer 10 multiplication facts.', target:10, type:'answers', reward:{coins:20} },
    { id:'accuracy80', name:'Accuracy Quest', desc:'Finish a round with 80% accuracy or higher.', target:1, type:'accuracy80', reward:{coins:25} },
    { id:'train1', name:'Training Quest', desc:'Complete one Training Area set.', target:1, type:'training', reward:{coins:20} },
    { id:'improve1', name:'Mastery Quest', desc:'Improve one weak fact.', target:1, type:'improve', reward:{coins:30} }
  ]
};
