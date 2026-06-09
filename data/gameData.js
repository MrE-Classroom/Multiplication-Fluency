window.GameData = (() => {
  const classes = {
    knight: { name:'Knight', icon:'🛡️', difficulty:'★★☆☆☆', hp:5, mana:2, stats:{attack:2,defense:4,speed:1,focus:1}, ability:'Shield Block', abilityText:'Blocks one wrong answer during each boss battle.' },
    archer: { name:'Archer', icon:'🏹', difficulty:'★★★☆☆', hp:4, mana:3, stats:{attack:3,defense:2,speed:4,focus:2}, ability:'Streak Shot', abilityText:'Earns bonus coins after 3 correct answers in a row.' },
    mage: { name:'Mage', icon:'🔮', difficulty:'★★★★☆', hp:3, mana:5, stats:{attack:4,defense:1,speed:2,focus:5}, ability:'Focus Spell', abilityText:'Can remove two wrong choices once during each boss battle.' }
  };

  const areas = [
    { id:'meadow', name:'Meadow', focus:[0,1,2,5,10], boss:'Meadow Slime', requiredRounds:2, requiredAccuracy:70, unlockAfter:null },
    { id:'forest', name:'Forest', focus:[3,4], boss:'Forest Troll', requiredRounds:2, requiredAccuracy:75, unlockAfter:'meadow' },
    { id:'cave', name:'Cave', focus:[6,7], boss:'Cave Golem', requiredRounds:2, requiredAccuracy:75, unlockAfter:'forest' },
    { id:'castle', name:'Castle', focus:[8,9], boss:'Castle Knight', requiredRounds:2, requiredAccuracy:80, unlockAfter:'cave' },
    { id:'dragon', name:'Dragon Mountain', focus:[0,1,2,3,4,5,6,7,8,9,10], boss:'Math Dragon', requiredRounds:3, requiredAccuracy:80, unlockAfter:'castle' }
  ];

  const items = [
    { id:'wood_sword', name:'Wooden Sword', type:'weapon', slot:'weapon', cls:['knight'], cost:15, rarity:'Common', stats:{attack:1}, desc:'A beginner sword for brave problem solvers.' },
    { id:'iron_sword', name:'Iron Sword', type:'weapon', slot:'weapon', cls:['knight'], cost:45, rarity:'Uncommon', stats:{attack:2}, desc:'A stronger knight weapon.' },
    { id:'wood_shield', name:'Training Shield', type:'shield', slot:'cosmetic', cls:['knight'], cost:25, rarity:'Common', stats:{defense:1}, desc:'A knight shield cosmetic with a small defense bonus.' },
    { id:'iron_helmet', name:'Iron Helmet', type:'head', slot:'head', cls:['knight'], cost:30, rarity:'Common', stats:{defense:1}, desc:'Heavy head gear for knights.' },
    { id:'steel_armor', name:'Steel Armor', type:'body', slot:'body', cls:['knight'], cost:55, rarity:'Rare', stats:{defense:2}, desc:'Heavy armor for knights.' },
    { id:'knight_boots', name:'Knight Boots', type:'legs', slot:'legs', cls:['knight'], cost:30, rarity:'Common', stats:{defense:1}, desc:'Sturdy boots for knights.' },

    { id:'practice_bow', name:'Practice Bow', type:'weapon', slot:'weapon', cls:['archer'], cost:15, rarity:'Common', stats:{attack:1,speed:1}, desc:'A beginner bow.' },
    { id:'forest_bow', name:'Forest Bow', type:'weapon', slot:'weapon', cls:['archer'], cost:50, rarity:'Uncommon', stats:{attack:2,speed:1}, desc:'A quick bow for accurate archers.' },
    { id:'leather_hood', name:'Leather Hood', type:'head', slot:'head', cls:['archer'], cost:25, rarity:'Common', stats:{speed:1}, desc:'Light head gear for archers.' },
    { id:'leather_armor', name:'Leather Armor', type:'body', slot:'body', cls:['archer'], cost:40, rarity:'Common', stats:{defense:1,speed:1}, desc:'Balanced archer armor.' },
    { id:'scout_boots', name:'Scout Boots', type:'legs', slot:'legs', cls:['archer'], cost:35, rarity:'Common', stats:{speed:2}, desc:'Fast boots for moving through areas.' },
    { id:'quiver', name:'Quiver Pack', type:'cosmetic', slot:'cosmetic', cls:['archer'], cost:25, rarity:'Common', stats:{speed:1}, desc:'A class cosmetic for archers.' },

    { id:'training_wand', name:'Training Wand', type:'weapon', slot:'weapon', cls:['mage'], cost:15, rarity:'Common', stats:{focus:1,attack:1}, desc:'A beginner wand.' },
    { id:'star_staff', name:'Star Staff', type:'weapon', slot:'weapon', cls:['mage'], cost:50, rarity:'Uncommon', stats:{focus:2,attack:1}, desc:'A stronger magical tool.' },
    { id:'wizard_hat', name:'Wizard Hat', type:'head', slot:'head', cls:['mage'], cost:25, rarity:'Common', stats:{focus:1}, desc:'A classic mage hat.' },
    { id:'blue_robe', name:'Blue Robe', type:'body', slot:'body', cls:['mage'], cost:40, rarity:'Common', stats:{focus:1,defense:1}, desc:'Cloth armor for mages.' },
    { id:'magic_shoes', name:'Magic Shoes', type:'legs', slot:'legs', cls:['mage'], cost:35, rarity:'Common', stats:{focus:1,speed:1}, desc:'Light shoes for mages.' },
    { id:'spell_book', name:'Spell Book', type:'cosmetic', slot:'cosmetic', cls:['mage'], cost:30, rarity:'Uncommon', stats:{focus:1}, desc:'A mage cosmetic with a focus bonus.' },

    { id:'tiny_dragon', name:'Tiny Dragon Pet', type:'pet', slot:'pet', cls:['all'], cost:60, rarity:'Epic', stats:{}, cosmetic:true, desc:'A friendly dragon companion.' },
    { id:'sparkle_aura', name:'Sparkle Aura', type:'aura', slot:'aura', cls:['all'], cost:35, rarity:'Rare', stats:{}, cosmetic:true, desc:'A bright aura for math champions.' },
    { id:'gold_frame', name:'Gold Name Frame', type:'frame', slot:'frame', cls:['all'], cost:45, rarity:'Rare', stats:{}, cosmetic:true, desc:'A shiny frame for your hero name.' }
  ];

  const quests = [
    { id:'q_answer10', title:'Answer 10 Facts', target:10, metric:'answers', reward:20 },
    { id:'q_train1', title:'Complete 1 Training Set', target:1, metric:'trainingSets', reward:25 },
    { id:'q_improve1', title:'Improve 1 Fact', target:1, metric:'improvedFacts', reward:20 }
  ];

  return { classes, areas, items, quests };
})();
