
window.GameData = (() => {
  const classes = {
    knight: { name:'Knight', icon:'🛡️', difficulty:'★★☆☆☆', hp:5, mana:2, stats:{attack:2,defense:4,speed:1,focus:1}, ability:'Shield Block', abilityText:'Automatically blocks one wrong answer during each boss battle.' },
    archer: { name:'Archer', icon:'🏹', difficulty:'★★★☆☆', hp:4, mana:3, stats:{attack:3,defense:2,speed:4,focus:2}, ability:'Streak Shot', abilityText:'Automatically earns bonus coins after every 3 correct answers in a row.' },
    mage: { name:'Mage', icon:'🔮', difficulty:'★★★★☆', hp:3, mana:5, stats:{attack:4,defense:1,speed:2,focus:5}, ability:'Focus Spell', abilityText:'Spend 1 mana to remove two wrong choices once each round or boss attempt.' }
  };

  const areas = [
    { id:'meadow', name:'Meadow', focus:[0,1,2,5,10], boss:'Meadow Slime', requiredRounds:2, requiredAccuracy:70, unlockAfter:null },
    { id:'forest', name:'Forest', focus:[3,4], boss:'Forest Troll', requiredRounds:2, requiredAccuracy:75, unlockAfter:'meadow' },
    { id:'cave', name:'Cave', focus:[6,7], boss:'Cave Golem', requiredRounds:2, requiredAccuracy:75, unlockAfter:'forest' },
    { id:'castle', name:'Castle', focus:[8,9], boss:'Castle Knight', requiredRounds:2, requiredAccuracy:80, unlockAfter:'cave' },
    { id:'dragon', name:'Dragon Mountain', focus:[0,1,2,3,4,5,6,7,8,9,10], boss:'Math Dragon', requiredRounds:3, requiredAccuracy:80, unlockAfter:'castle' }
  ];

  const unlockLabels = {
    start: 'Unlocked at start',
    meadow: 'Defeat the Meadow Boss',
    forest: 'Defeat the Forest Boss',
    cave: 'Defeat the Cave Boss',
    castle: 'Defeat the Castle Boss'
  };

  const items = [
    // Knight gear progression
    { id:'wood_sword', name:'Wooden Sword', type:'weapon', slot:'weapon', cls:['knight'], cost:15, rarity:'Common', tier:1, unlock:'start', stats:{attack:1}, desc:'A beginner sword for brave problem solvers.' },
    { id:'simple_helmet', name:'Simple Helmet', type:'head', slot:'head', cls:['knight'], cost:18, rarity:'Common', tier:1, unlock:'start', stats:{defense:1}, desc:'Basic head protection for new knights.' },
    { id:'training_shield', name:'Training Shield', type:'shield', slot:'cosmetic', cls:['knight'], cost:25, rarity:'Common', tier:1, unlock:'start', stats:{defense:1}, desc:'A shield cosmetic with a small defense bonus.' },
    { id:'iron_sword', name:'Iron Sword', type:'weapon', slot:'weapon', cls:['knight'], cost:45, rarity:'Uncommon', tier:2, unlock:'meadow', stats:{attack:2}, desc:'A stronger knight weapon unlocked after the Meadow Boss.' },
    { id:'iron_helmet', name:'Iron Helmet', type:'head', slot:'head', cls:['knight'], cost:30, rarity:'Uncommon', tier:2, unlock:'meadow', stats:{defense:2}, desc:'Heavy head gear for knights.' },
    { id:'steel_armor', name:'Steel Armor', type:'body', slot:'body', cls:['knight'], cost:55, rarity:'Rare', tier:3, unlock:'forest', stats:{defense:3}, desc:'Heavy armor for knights unlocked after the Forest Boss.' },
    { id:'knight_boots', name:'Knight Boots', type:'legs', slot:'legs', cls:['knight'], cost:40, rarity:'Rare', tier:3, unlock:'forest', stats:{defense:1,speed:1}, desc:'Sturdy boots for knights.' },
    { id:'royal_shield', name:'Royal Shield', type:'shield', slot:'cosmetic', cls:['knight'], cost:75, rarity:'Epic', tier:4, unlock:'cave', stats:{defense:3}, desc:'A powerful shield unlocked after the Cave Boss.' },
    { id:'dragon_plate', name:'Dragon Plate Armor', type:'body', slot:'body', cls:['knight'], cost:110, rarity:'Legendary', tier:5, unlock:'castle', stats:{defense:5,attack:1}, desc:'Legendary armor unlocked after the Castle Boss.' },

    // Archer gear progression
    { id:'practice_bow', name:'Practice Bow', type:'weapon', slot:'weapon', cls:['archer'], cost:15, rarity:'Common', tier:1, unlock:'start', stats:{attack:1,speed:1}, desc:'A beginner bow.' },
    { id:'leather_hood', name:'Leather Hood', type:'head', slot:'head', cls:['archer'], cost:25, rarity:'Common', tier:1, unlock:'start', stats:{speed:1}, desc:'Light head gear for archers.' },
    { id:'leather_armor', name:'Leather Armor', type:'body', slot:'body', cls:['archer'], cost:40, rarity:'Common', tier:1, unlock:'start', stats:{defense:1,speed:1}, desc:'Balanced archer armor.' },
    { id:'forest_bow', name:'Forest Bow', type:'weapon', slot:'weapon', cls:['archer'], cost:50, rarity:'Uncommon', tier:2, unlock:'meadow', stats:{attack:2,speed:1}, desc:'A quick bow unlocked after the Meadow Boss.' },
    { id:'scout_boots', name:'Scout Boots', type:'legs', slot:'legs', cls:['archer'], cost:35, rarity:'Uncommon', tier:2, unlock:'meadow', stats:{speed:2}, desc:'Fast boots for moving through areas.' },
    { id:'reinforced_leather', name:'Reinforced Leather Armor', type:'body', slot:'body', cls:['archer'], cost:65, rarity:'Rare', tier:3, unlock:'forest', stats:{defense:2,speed:2}, desc:'Stronger light armor unlocked after the Forest Boss.' },
    { id:'ranger_hood', name:'Ranger Hood', type:'head', slot:'head', cls:['archer'], cost:55, rarity:'Rare', tier:3, unlock:'forest', stats:{speed:2,focus:1}, desc:'A focused archer hood.' },
    { id:'castle_longbow', name:'Castle Longbow', type:'weapon', slot:'weapon', cls:['archer'], cost:85, rarity:'Epic', tier:4, unlock:'cave', stats:{attack:3,speed:2}, desc:'A powerful bow unlocked after the Cave Boss.' },
    { id:'dragon_quiver', name:'Dragon Quiver', type:'cosmetic', slot:'cosmetic', cls:['archer'], cost:100, rarity:'Legendary', tier:5, unlock:'castle', stats:{attack:2,speed:3}, desc:'Legendary archer gear unlocked after the Castle Boss.' },

    // Mage gear progression
    { id:'training_wand', name:'Training Wand', type:'weapon', slot:'weapon', cls:['mage'], cost:15, rarity:'Common', tier:1, unlock:'start', stats:{focus:1,attack:1}, desc:'A beginner wand.' },
    { id:'apprentice_hat', name:'Apprentice Hat', type:'head', slot:'head', cls:['mage'], cost:20, rarity:'Common', tier:1, unlock:'start', stats:{focus:1}, desc:'A simple cloth mage hat.' },
    { id:'blue_robe', name:'Blue Robe', type:'body', slot:'body', cls:['mage'], cost:40, rarity:'Common', tier:1, unlock:'start', stats:{focus:1,defense:1}, desc:'Cloth armor for mages.' },
    { id:'star_staff', name:'Star Staff', type:'weapon', slot:'weapon', cls:['mage'], cost:50, rarity:'Uncommon', tier:2, unlock:'meadow', stats:{focus:2,attack:1}, desc:'A stronger magical tool unlocked after the Meadow Boss.' },
    { id:'magic_shoes', name:'Magic Shoes', type:'legs', slot:'legs', cls:['mage'], cost:35, rarity:'Uncommon', tier:2, unlock:'meadow', stats:{focus:1,speed:1}, desc:'Light shoes for mages.' },
    { id:'moon_robe', name:'Moon Robe', type:'body', slot:'body', cls:['mage'], cost:65, rarity:'Rare', tier:3, unlock:'forest', stats:{focus:3,defense:1}, desc:'A stronger robe unlocked after the Forest Boss.' },
    { id:'spell_book', name:'Spell Book', type:'cosmetic', slot:'cosmetic', cls:['mage'], cost:55, rarity:'Rare', tier:3, unlock:'forest', stats:{focus:2}, desc:'A mage cosmetic with a focus bonus.' },
    { id:'crystal_staff', name:'Crystal Staff', type:'weapon', slot:'weapon', cls:['mage'], cost:90, rarity:'Epic', tier:4, unlock:'cave', stats:{focus:3,attack:2}, desc:'A powerful staff unlocked after the Cave Boss.' },
    { id:'dragon_spellbook', name:'Dragon Spellbook', type:'cosmetic', slot:'cosmetic', cls:['mage'], cost:105, rarity:'Legendary', tier:5, unlock:'castle', stats:{focus:4,attack:1}, desc:'Legendary mage gear unlocked after the Castle Boss.' },

    // Universal cosmetics
    { id:'tiny_dragon', name:'Tiny Dragon Pet', type:'pet', slot:'pet', cls:['all'], cost:60, rarity:'Epic', tier:2, unlock:'meadow', stats:{}, cosmetic:true, desc:'A friendly dragon companion.' },
    { id:'sparkle_aura', name:'Sparkle Aura', type:'aura', slot:'aura', cls:['all'], cost:35, rarity:'Rare', tier:1, unlock:'start', stats:{}, cosmetic:true, desc:'A bright aura for math champions.' },
    { id:'gold_frame', name:'Gold Name Frame', type:'frame', slot:'frame', cls:['all'], cost:45, rarity:'Rare', tier:2, unlock:'meadow', stats:{}, cosmetic:true, desc:'A shiny frame for your hero name.' },
    { id:'fire_trail', name:'Fire Trail', type:'trail', slot:'cosmetic', cls:['all'], cost:70, rarity:'Epic', tier:3, unlock:'forest', stats:{}, cosmetic:true, desc:'A fiery movement trail.' }
  ];

  const quests = [
    { id:'q_answer10', title:'Answer 10 Facts', target:10, metric:'answers', reward:20 },
    { id:'q_train1', title:'Complete 1 Training Set', target:1, metric:'trainingSets', reward:25 },
    { id:'q_improve1', title:'Improve 1 Fact', target:1, metric:'improvedFacts', reward:20 }
  ];

  return { classes, areas, items, quests, unlockLabels };
})();
