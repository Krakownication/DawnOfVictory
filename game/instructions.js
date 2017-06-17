const  POPUPS = {
  gameWon:  ["You won battle!",
              "Hide",         visualMechanics.PopupHandler.close,
              "Continue",     CoreMechanics.GameControlHandler.nextGame      ],
              
  gameLost: ["You lost battle!", 
              "Exit",         CoreMechanics.GameControlHandler.exitGame,
              "Restart",      CoreMechanics.GameControlHandler.restartGame   ],
              
  gameDraw: ["Battle cant be finished!\n It is draw!", 
              "Exit",         CoreMechanics.GameControlHandler.exitGame,
              "Restart",      CoreMechanics.GameControlHandler.restartGame   ],
              
  gameExit: ["This battle will be lost.\nAre you sure?", 
              "No",           visualMechanics.PopupHandler.close,
              "Yes",          CoreMechanics.GameControlHandler.exitGame      ],
              
  cantStart: ["Put all your cards before start battle!",   
              "Afformative",  visualMechanics.PopupHandler.close  ],
};

const MAINMENU = {
  FIRSTLVL: 0,
  SECONDLVL_CAMPAIN_MAIN: 1,
  SECONDLVL_CAMPAIN_LEVELSSELECT: 2,
  SECONDLVL_RANDOMGAME: 3,
  SECONDLVL_SETTINGS: 4,
  SECONDLVL_CREDITS: 5
};

const MAINMENU_BUTTONS = [
  //FIRSTLVL: 0
  [ 
    {title: 'Campain',    posistion: {x: 500, y: 300}, mainStyle: {font: '50px '+CONFIG.globalFont, fill: '#cccccc'}, hoverStyle: {font: '54px '+CONFIG.globalFont, fill: '#ffffff'}, 
      callBackFunction: function () { MenuHud.changeLvl(MAINMENU.SECONDLVL_CAMPAIN_MAIN); }},
    {title: 'Random battle',   posistion: {x: 500, y: 500}, mainStyle: {font: '50px '+CONFIG.globalFont, fill: '#cccccc'}, hoverStyle: {font: '54px '+CONFIG.globalFont, fill: '#ffffff'}, 
      callBackFunction: function () { changeState('someLevel', 0); }},
    {title: 'Settings',   posistion: {x: 500, y: 700}, mainStyle: {font: '50px '+CONFIG.globalFont, fill: '#cccccc'}, hoverStyle: {font: '54px '+CONFIG.globalFont, fill: '#ffffff'}, 
      callBackFunction: function () { MenuHud.changeLvl(MAINMENU.SECONDLVL_SETTINGS); }},
    {title: 'Credits',   posistion: {x: 500, y: 900}, mainStyle: {font: '50px '+CONFIG.globalFont, fill: '#cccccc'}, hoverStyle: {font: '54px '+CONFIG.globalFont, fill: '#ffffff'}, 
      callBackFunction: function () { MenuHud.changeLvl(MAINMENU.SECONDLVL_CREDITS); }}
  ],
      
  //SECONDLVL_CAMPAIN_MAIN: 1
  [ 
    {title: 'Start/Continue', posistion: {x: 600, y: 400}, mainStyle: {font: '50px '+CONFIG.globalFont, fill: '#cccccc'}, hoverStyle: {font: '54px '+CONFIG.globalFont, fill: '#ffffff'}, 
      callBackFunction: MenuHud.continueCampain },
    {title: 'Select level',   posistion: {x: 600, y: 600}, mainStyle: {font: '50px '+CONFIG.globalFont, fill: '#cccccc'}, hoverStyle: {font: '54px '+CONFIG.globalFont, fill: '#ffffff'}, 
      callBackFunction: function () { MenuHud.changeLvl(MAINMENU.SECONDLVL_CAMPAIN_LEVELSSELECT); }} 
  ],
  
  //SECONDLVL_CAMPAIN_LEVELSSELECT: 2  
  [ 
    {title: 'Ambush',  posistion: {x: 600, y: 950}, mainStyle: {font: '40px '+CONFIG.globalFont, fill: '#cccccc'}, hoverStyle: {font: '42px '+CONFIG.globalFont, fill: '#ffffff'}, 
      callBackFunction: function () { changeState('someLevel', 1); }},
    {title: 'Revenge',  posistion: {x: 600, y: 950}, mainStyle: {font: '40px '+CONFIG.globalFont, fill: '#cccccc'}, hoverStyle: {font: '42px '+CONFIG.globalFont, fill: '#ffffff'}, 
      callBackFunction: function () { changeState('someLevel', 2); }},
    {title: 'Grind',  posistion: {x: 600, y: 950}, mainStyle: {font: '40px '+CONFIG.globalFont, fill: '#cccccc'}, hoverStyle: {font: '42px '+CONFIG.globalFont, fill: '#ffffff'}, 
      callBackFunction: function () { changeState('someLevel', 3); }},
    {title: 'Crush',  posistion: {x: 600, y: 950}, mainStyle: {font: '40px '+CONFIG.globalFont, fill: '#cccccc'}, hoverStyle: {font: '42px '+CONFIG.globalFont, fill: '#ffffff'}, 
      callBackFunction: function () { changeState('someLevel', 4); }}
  ],
      
  //SECONDLVL_RANDOMGAME: 3  
  [
  
  ],
  
  //SECONDLVL_SETTINGS: 4 
  [
    [  
      {title: '-', mainStyle: {font: '55px '+CONFIG.globalFont, fill: '#cccccc'}, hoverStyle: {font: '60px '+CONFIG.globalFont, fill: '#ffffff'}, 
        callBackFnc: function ()  { 
                                    if(MusicHandler.MusicManager.volume > 0)
                                    {
                                      let newVolume = MusicHandler.MusicManager.volume - 0.1;
                                      MusicHandler.MusicManager.volume = Math.round(newVolume*10)/10;
                                    }
                                  }
       },
       {title: '+', mainStyle: {font: '55px '+CONFIG.globalFont, fill: '#cccccc'}, hoverStyle: {font: '60px '+CONFIG.globalFont, fill: '#ffffff'}, 
        callBackFnc: function () { 
                                    if(MusicHandler.MusicManager.volume < 1)
                                    {
                                      let newVolume = MusicHandler.MusicManager.volume + 0.1;
                                      MusicHandler.MusicManager.volume = Math.round(newVolume*10)/10;
                                    }
                                  }
        }
    ],
    
    [  
      {title: '-', mainStyle: {font: '55px '+CONFIG.globalFont, fill: '#cccccc'}, hoverStyle: {font: '60px '+CONFIG.globalFont, fill: '#ffffff'}, 
        callBackFnc: function ()  { 
                                    if(MusicHandler.SoundManager.volume > 0)
                                    {
                                      let newVolume = MusicHandler.SoundManager.volume - 0.1;
                                      MusicHandler.SoundManager.volume = Math.round(newVolume*10)/10;
                                      MusicHandler.playSound();
                                    }
                                  }
       },
       {title: '+', mainStyle: {font: '55px '+CONFIG.globalFont, fill: '#cccccc'}, hoverStyle: {font: '60px '+CONFIG.globalFont, fill: '#ffffff'}, 
        callBackFnc: function () { 
                                    if(MusicHandler.SoundManager.volume < 1)
                                    {
                                      let newVolume = MusicHandler.SoundManager.volume + 0.1;
                                      MusicHandler.SoundManager.volume = Math.round(newVolume*10)/10;
                                      MusicHandler.playSound();
                                    }
                                  }
        }
    ],
    
    [  
      {title: "", mainStyle: {font: '55px '+CONFIG.globalFont, fill: '#cccccc'}, hoverStyle: {font: '60px '+CONFIG.globalFont, fill: '#ffffff'}, 
        callBackFnc: function ()  { 
                                    game.showDebug = !game.showDebug;
                                    MenuHud.objects[4][2].getChildAt(1).text = game.showDebug;
                                    LocalStorageHandler.set(LocalStorageHandler.PROPERTIES.SHOWDEBUG, game.showDebug);
                                  }
       }
    ]
  ]
  
];