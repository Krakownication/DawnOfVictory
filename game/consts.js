const CONSTS = {
  LASTLEVEL: 4,
  
  DATA_COLORS: {
    BLACK: "#000000",
    WHITE: "#ffffff",
    GREY: "cccccc"
  },
  DATA_GAMESPEEDS: {
    SLOW:   {id: 0, delay: 1000},
    NORMAL: {id: 1, delay: 500},
    FAST:   {id: 2, delay: 250},
  },
  
  TYPES_PERFORMPAUSE: {
    UNPAUSE: 0,
    PAUSE: 1
  },
  TYPES_CARDCONTROL: {
    ENEMY: 0,
    PLAYER: 1
  },
  TYPES_STARTGAME: {
    RANDOM:       {id: 0, infoText: "dummy"},
    PLAYERFIRST:  {id: 1, infoText: "This is the place.\nThink out attack."},
    SAMETIME:     {id: 2, infoText: "\nBattle incoming!\nMove!"},
    ENEMYFIRST:   {id: 3, infoText: "Enemy is here!\nPrepare defend! Fast!"}
  },

  TYPES_ENDGAME: {
    WIN: 1,
    DRAW: 2,
    LOSE: 3,
  },
  TYPES_CARDTYPE: {
    OBJECT: 0,
    MELEE: 1,
    RANGED: 2
  },
  TYPES_MAPSPOTS: {
    FREE:      0,
    TAKEN:     1,
    UNAVAIL:   2,
    TREE1:    10,
    TREE2:    11,
    MOUNTAIN: 12,
    WATER:    13,
  },
};

const  levelsData = [
  //Unused dummy lvl
  { mapData: [[0,   0,  0,  0,  0,  0,  0,  0,  0,  0],
              [0,   0,  0,  0,  0,  0,  0,  0,  0,  0],
              [0,   0,  0,  0,  0,  0,  0,  0,  0,  0],
              [0,   0,  0,  0,  0,  0,  0,  0,  0,  0],
              [0,   0,  0,  0,  0,  0,  0,  0,  0,  0],
              [0,   0,  0,  0,  0,  0,  0,  0,  0,  0]],
    playerCards: [0],
    enemyCards:  [0],
    startType: CONSTS.TYPES_STARTGAME.RANDOM
  },
        
  { mapData: [[10,   0,   0,   0,   0,  10,  10,  10,  10,  10],
              [10,  10,   0,   0,   0,   0,  10,  10,  10,  10],
              [10,  10,   0,   0,   0,   0,   0,  10,  10,  10],
              [10,  10,  10,   0,   0,   0,   0,  10,  10,  10],
              [10,  10,  10,   0,   0,   0,   0,   0,  10,  10],
              [10,  10,  10,  10,  10,  10,   0,   0,   0,  10]],
    playerCards: [1,1,1,2],
    enemyCards:  [7,7,7],
    startType: CONSTS.TYPES_STARTGAME.SAMETIME
  },
  
  { mapData: [[10,  13,   0,   0,  10,  13,   0,   0,   0,  10],
              [ 0,   0,   0,   0,   0,   0,   0,   0,   0,  10],
              [10,   0,   0,   0,   0,   0,   0,   0,   0,   0],
              [10,  10,   0,   0,   0,   0,   0,   0,   0,  10],
              [10,  10,  10,   0,   0,   0,   0,   0,   0,  10],
              [10,  10,  10,  10,   0,   0,   0,  10,  13,  10]],
    playerCards: [1,2,2,2],
    enemyCards:  [7,7,1,7],
    startType: CONSTS.TYPES_STARTGAME.PLAYERFIRST
  },
  
  { mapData: [[12,  12,  10,   0,   0,   0,   0,  12,  12,  12],
              [10,   0,   0,   0,   0,   0,   0,   0,  10,  12],
              [ 0,   0,   0,   0,  13,  13,   0,   0,   0,   0],
              [ 0,  13,   0,   0,   0,   0,   0,  13,   0,   0],
              [10,   0,   0,   0,   0,   0,   0,   0,   0,  13],
              [10,   0,  10,   0,   0,   0,  13,  13,   0,  10]],
    playerCards: [2,2,2,3,3],
    enemyCards:  [2,2,3,7,7],
    startType: CONSTS.TYPES_STARTGAME.ENEMYFIRST
  },
  
  { mapData:     [  [12,  12,  12,   0,   0,   0,   0,  12,  12,  12],
                    [12,  12,   0,   0,   0,   0,   0,   0,  12,  12],
                    [12,  12,   0,   0,   0,   0,   0,   0,  12,  12],
                    [10,  10,   0,   0,   0,   0,   0,   0,   0,  10],
                    [10,  10,  10,   0,   0,   0,   0,  12,   0,  10],
                    [12,   0,   0,   0,  13,   0,   0,  13,   0,  12] ],
    playerCards: [2,2,2,2,6,6],
    enemyCards:  [3,3,3,3,4,4],
    startType: CONSTS.TYPES_STARTGAME.SAMETIME
  }
  
  ];

const  mapObjects = [
  { filename: "mapObject_tree1" },
  { filename: "mapObject_tree1" },
  { filename: "mapObject_mountain1" },
  { filename: "mapObject_water1" },
];

const  cardStats = [
  {name: "dummy",       id: 0,  type: CONSTS.TYPES_CARDTYPE.OBJECT,  rare: 100,
    att: 0, range: 0, def: 1, spd: 10,  agi:  0, hp: 10},
    
  {name: "Farmer",      id: 1,  type: CONSTS.TYPES_CARDTYPE.MELEE,   tier: 1, rare: 5,    
    att: 3, range: 1, def: 2, spd: 60,  agi: 10, hp: 14},
    
  {name: "Blacksmith",  id: 2,  type: CONSTS.TYPES_CARDTYPE.MELEE,   tier: 1, rare: 20,   
    att: 4, range: 1, def: 3, spd: 40,  agi:  2, hp: 15},
    
  {name: "Guard",       id: 3,  type: CONSTS.TYPES_CARDTYPE.MELEE,   tier: 2, rare: 50,
    att: 5, range: 1, def: 3, spd: 35,  agi:  5, hp: 15},
    
  {name: "Knight",      id: 4,  type: CONSTS.TYPES_CARDTYPE.MELEE,   tier: 3, rare: 85,   
    att: 7, range: 1, def: 3, spd: 30,  agi:  4, hp: 15},
    
  {name: "Ranger",      id: 5,  type: CONSTS.TYPES_CARDTYPE.RANGED,  tier: 1, rare: 30,   
    att: 3, range: 3, def: 2, spd: 55,  agi: 15, hp: 14},
    
  {name: "Crossbowman", id: 6,  type: CONSTS.TYPES_CARDTYPE.RANGED,  tier: 2, rare: 55,   
    att: 5, range: 2, def: 2, spd: 35,  agi:  5, hp: 12},
    
  {name: "Rogue",       id: 7,  type: CONSTS.TYPES_CARDTYPE.RANGED,  tier: 1, rare: 20,
    att: 4, range: 2, def: 2, spd: 40,  agi: 15, hp: 10},
    
  {name: "Cavalry",     id: 8,  type: CONSTS.TYPES_CARDTYPE.RANGED,  tier: 3, rare: 75,
    att: 6, range: 2, def: 1, spd: 65,  agi:  5, hp: 10},
    
  {name: "Shieldman",   id: 9,  type: CONSTS.TYPES_CARDTYPE.MELEE,   tier: 2, rare: 75,
    att: 3, range: 1, def: 5, spd: 25,  agi:  1, hp: 16}
];