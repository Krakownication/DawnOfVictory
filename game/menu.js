/*global CONSTS*/
/*global CONFIG*/
/*global Phaser*/
/*global game*/

var mainMenuState = {
    unlockedL: null,
    menuLevel:  null,
    init: function(openLevel) {
        this.menuLevel = openLevel;
        this.unlockedL = LocalStorageHandler.get(LocalStorageHandler.PROPERTIES.UNLOCKED_CAMPAIN_LVL);
    },
    create: function(){
        
        game.time.advancedTiming = true;
        
        game.stage.backgroundColor = CONSTS.DATA_COLORS.BLACK;
        
        MenuHud.init(this.menuLevel);
        
        let smokeTimer = game.time.create(true);
            smokeTimer.loop(100, MenuHud.menuSmokeAnimation, this);
            smokeTimer.start();
        
        MusicHandler.playMusic('music');
        showState();
    },
    update: function() {
        
    },
    render: function() {
        if(game.showDebug)
            game.debug.text(CONFIG.gameName+" "+CONFIG.gameVersion+" FPS: " + game.time.fps || '--' , 10, 990);
    },
    shutdown: function() {
        MenuHud.reset();
    }
};

var MenuHud = {
    reset: function() {
        this.objects = [];
        this.displayedLvl = null;
        this.smokeGroup = null;
    },
    
    objects: [],
    displayedLvl: null,
    smokeGroup: null,
    
    init: function(openLevel) {
        openLevel = openLevel || MAINMENU.FIRSTLVL;
        this.smokeGroup = game.add.group();
        
        this.objects[0] = [];
        this.objects[1] = [];
        this.objects[2] = [];
        this.objects[3] = [];
        
        var mainMenuGameTitleLabel = game.add.text(500, 100, "Dawn of Victory", {font: '90px '+CONFIG.globalFont, fill: '#ffffff', align: "center"});         
            mainMenuGameTitleLabel.anchor.setTo(0.5, 0.5);
        
        if(openLevel == MAINMENU.FIRSTLVL) 
        {
            this.showLvl(MAINMENU.FIRSTLVL);
        }
        else 
        {
            MAINMENU_BUTTONS[MAINMENU.FIRSTLVL].forEach( function(item, index) {
                let createdButton = visualMechanics.hud.buttonHandling.create({x: 120, y: item.posistion.y}, item.title, item.mainStyle, item.hoverStyle, item.callBackFunction);
                    createdButton.alpha = 1.0;
                    createdButton.fontSize = 20;
                
                MenuHud.objects[MAINMENU.FIRSTLVL].push(createdButton);
            });
            this.displayedLvl = MAINMENU.FIRSTLVL;
            this.changeLvl(openLevel);
        }
    },
    menuSmokeAnimation: function() {
        let posistion_Start = {x: 400, y: 1100};
            posistion_Start.x = posistion_Start.x + Math.floor((Math.random() * 400)-200);
    
        let startAlpha = Math.floor((Math.random() * 2)+4);
    
        let position_Finish = {x: posistion_Start.x+Math.floor((Math.random() * 100)+300), y: 150+Math.floor((Math.random() * 100)-50)};
        
    
        let smoke = MenuHud.smokeGroup.create(posistion_Start.x, posistion_Start.y, 'smoke');
            smoke.anchor.setTo(0.5, 0.5);
            smoke.alpha = (startAlpha/10);
        
        let moveSmokeTween = game.add.tween(smoke);
            moveSmokeTween.to({ x: position_Finish.x, y: position_Finish.y }, Math.floor((Math.random() * 1500)+7000), "Sine", true);
                                
        let alphaSmokeTween = game.add.tween(smoke);
            alphaSmokeTween.to( {  alpha: 0.0 }, Math.floor((Math.random() * 1000)+4500), "Sine", true, Math.floor((Math.random() * 500)+1000));
            alphaSmokeTween.onComplete.add(function(object, tween) { object.destroy(); }, this);
    },
    
    changeLvl: function(newLvlId) {
        if(newLvlId != this.displayedLvl)
        {
            this.hideLvl();
            this.showLvl(newLvlId);
        }
    },
    showLvl: function(newLvlId) {
        if(MenuHud.displayedLvl == null)
        {
            MenuHud.objects[newLvlId] = [];
            
            if(newLvlId == MAINMENU.SECONDLVL_CAMPAIN_MAIN)
            {
                if(mainMenuState.unlockedL == 1)
                {
                    MAINMENU_BUTTONS[newLvlId][0].title = "Start";
                }
                if(mainMenuState.unlockedL == CONSTS.LASTLEVEL)
                {
                    MAINMENU_BUTTONS[newLvlId][0].title = "Completed";
                }
                else
                {
                    MAINMENU_BUTTONS[newLvlId][0].title = "Continue";
                }
            }
            else if(newLvlId == MAINMENU.SECONDLVL_CAMPAIN_LEVELSSELECT)
            {
                this.CustomLvlsHandler.show_SECONDLVL_CAMPAIN_LEVELSSELECT();
                return;
            }
            else if(newLvlId == MAINMENU.SECONDLVL_SETTINGS)
            {
                this.CustomLvlsHandler.show_SECONDLVL_SETTINGS();
                return;
            }
            else if(newLvlId == MAINMENU.SECONDLVL_CREDITS)
            {
                this.CustomLvlsHandler.show_SECONDLVL_CREDITS();
                return;
            }
            
            //create buttons
            MAINMENU_BUTTONS[newLvlId].forEach( function(item, index) {
                
                let createdButton = visualMechanics.hud.buttonHandling.create(item.posistion, item.title, item.mainStyle, item.hoverStyle, item.callBackFunction);
                    createdButton.alpha = 0.0;
                    createdButton.inputEnabled = false;
                
                MenuHud.objects[newLvlId].push(createdButton);
            });
            
            //animate buttons
            let baseDelay = 1000; if(newLvlId == MAINMENU.FIRSTLVL) { baseDelay = 2000; }
            
            MenuHud.objects[newLvlId].forEach( function(item, index) {
                                            let alphaObjectsTween = game.add.tween(item);
                                                alphaObjectsTween.to( { alpha: 1.0 }, 400, "Sine", true, baseDelay+(400*index));
                                                alphaObjectsTween.onComplete.add( function() { item.inputEnabled = true; item.input.useHandCursor = true;} );
                                        });
                                        
            MenuHud.displayedLvl = newLvlId;
        }
    },
    hideLvl: function() {
        if(this.displayedLvl != null)
        {
            if(this.displayedLvl == MAINMENU.FIRSTLVL)
            {
                this.objects[this.displayedLvl].forEach( function(item, index) {
                    const newFontSize = 20;
                    const newMainStyle = {font: newFontSize+'px '+CONFIG.globalFont, fill: '#cccccc'};
                    const newHoverStyle = {font: (newFontSize+2)+'px '+CONFIG.globalFont, fill: '#ffffff'};
                        
                        //visualMechanics.hud.buttonHandling.changeStyle(item, null, newMainStyle);
                                                
                        item.events.onInputOver.removeAll();
                        //item.events.onInputOver.add( visualMechanics.hud.buttonHandling.changeStyle, this, 2, newHoverStyle);
                        item.events.onInputOut.removeAll();
                        //item.events.onInputOut.add( visualMechanics.hud.buttonHandling.changeStyle, this, 2, newMainStyle);
                                                
                    const moveFirstLvlObjectsTween = game.add.tween(item);
                          moveFirstLvlObjectsTween.to( {x: 120 }, 250, "Sine", true, 50+(250*index));
                          moveFirstLvlObjectsTween.onComplete.add( function() { 
                                item.events.onInputOver.add( visualMechanics.hud.buttonHandling.changeStyle, this, 2, newHoverStyle);
                                item.events.onInputOut.add( visualMechanics.hud.buttonHandling.changeStyle, this, 2, newMainStyle);
                          });
                                                    
                    const fontTween = game.add.tween(item);
                          fontTween.to( { fontSize: newFontSize }, 250, "Sine", true, 50+(250*index));
                });
            }
            else
            {
                game.tweens.removeFrom(this.objects[this.displayedLvl]);
                
                this.objects[this.displayedLvl].forEach( function(item, index) {
                    item.inputEnabled = false;
                    
                    let alphaObjectsTween = game.add.tween(item);
                        alphaObjectsTween.to( { alpha: 0.0 }, 400, "Sine", true, 50+(400*index));
                        alphaObjectsTween.onComplete.add( function() { item.destroy(); } );
                });
            }
            
            this.displayedLvl = null;
        }
    },
    
    CustomLvlsHandler: {
        show_SECONDLVL_CAMPAIN_LEVELSSELECT: function() {
            
            let lvlId = MAINMENU.SECONDLVL_CAMPAIN_LEVELSSELECT;
            
            let lastCampains;
            if(mainMenuState.unlockedL >= 4)
            {
                lastCampains = MAINMENU_BUTTONS[lvlId].slice(mainMenuState.unlockedL-4,mainMenuState.unlockedL);
            }
            else
            {
                lastCampains = MAINMENU_BUTTONS[lvlId].slice(0,mainMenuState.unlockedL);
            }
            
            switch(lastCampains.length) {
                case 1:
                    lastCampains[0].posistion = {x: 600, y: 500};
                    break;
                case 2:
                    lastCampains[0].posistion = {x: 600, y: 400};
                    lastCampains[1].posistion = {x: 600, y: 600};
                    break;
                case 3:
                    lastCampains[0].posistion = {x: 600, y: 350};
                    lastCampains[1].posistion = {x: 600, y: 550};
                    lastCampains[2].posistion = {x: 600, y: 750};
                    break;
                default:
                    lastCampains[0].posistion = {x: 600, y: 300};
                    lastCampains[1].posistion = {x: 600, y: 500};
                    lastCampains[2].posistion = {x: 600, y: 700};
                    lastCampains[3].posistion = {x: 600, y: 900};
            }
            
            //create buttons
            lastCampains.forEach( function(item, index) {
                
                let createdButton = visualMechanics.hud.buttonHandling.create(item.posistion, item.title, item.mainStyle, item.hoverStyle, item.callBackFunction);
                    createdButton.alpha = 0.0;
                    createdButton.inputEnabled = false;
                
                MenuHud.objects[lvlId].push(createdButton);
            });
            
            //animate buttons
            let baseDelay = 1000;
            
            MenuHud.objects[lvlId].forEach( function(item, index) {
                                            let alphaObjectsTween = game.add.tween(item);
                                                alphaObjectsTween.to( { alpha: 1.0 }, 400, "Sine", true, baseDelay+(400*index));
                                                alphaObjectsTween.onComplete.add( function() { item.inputEnabled = true; item.input.useHandCursor = true;} );
                                        });
                                        
            MenuHud.displayedLvl = lvlId;
        },
        show_SECONDLVL_SETTINGS: function() {
            let lvlId = MAINMENU.SECONDLVL_SETTINGS;
            
            let settingsLabels = [
                    { posistion: {x: 700, y: 400},
                      labelText: "Music\nVolume",                       labelStyle: {font: '25px '+CONFIG.globalFont, fill: '#cccccc', align: "center"},
                      volumeDefault: MusicHandler.MusicManager.volume,  valueStyle: {font: '55px '+CONFIG.globalFont, fill: '#cccccc', align: "center"} },
                      
                    { posistion: {x: 700, y: 600},
                      labelText: "Sounds\nVolume",                      labelStyle: {font: '25px '+CONFIG.globalFont, fill: '#cccccc', align: "center"},
                      volumeDefault: MusicHandler.SoundManager.volume,  valueStyle: {font: '55px '+CONFIG.globalFont, fill: '#cccccc', align: "center"} },
                      
                    { posistion: {x: 700, y: 800},
                      labelText: "Show\nInfo",                          labelStyle: {font: '25px '+CONFIG.globalFont, fill: '#cccccc', align: "center"},
                      volumeDefault: null,                              valueStyle: {font: '55px '+CONFIG.globalFont, fill: '#cccccc', align: "center"} },  
                ];
            
            //create groups
            for(let groupIndex=0; groupIndex < settingsLabels.length; groupIndex++) 
            {
                let group = MAINMENU_BUTTONS[lvlId][groupIndex];
                
                let newGroup = game.add.group();
                    newGroup.alpha = 0;
                    newGroup.inputEnabled = false;
                    
                    let settingLabel = game.add.text(settingsLabels[groupIndex].posistion.x-250, settingsLabels[groupIndex].posistion.y, settingsLabels[groupIndex].labelText, settingsLabels[groupIndex].labelStyle);         
                        settingLabel.anchor.setTo(0.5, 0.5);
                newGroup.add(settingLabel);
                    
                    if(settingsLabels[groupIndex].volumeDefault)
                    {
                        let valueLabel = game.add.text(settingsLabels[groupIndex].posistion.x, settingsLabels[groupIndex].posistion.y, settingsLabels[groupIndex].volumeDefault, settingsLabels[groupIndex].valueStyle);         
                            valueLabel.anchor.setTo(0.5, 0.5);
                    newGroup.add(valueLabel);
                    }
                    
                    for(let index=0; index < group.length; index++) 
                    {
                        let item = group[index];
                        if(groupIndex == 2) { item.title = game.showDebug ? "True" : "False" }
                        
                        let buttonPosistion = {x: settingsLabels[groupIndex].posistion.x-100+(200*index), y: settingsLabels[groupIndex].posistion.y};
                        if(group.length == 1)   buttonPosistion.x += 100;
                        
                        let createdButton = visualMechanics.hud.buttonHandling.create(buttonPosistion, item.title, item.mainStyle, item.hoverStyle, item.callBackFnc);
                            createdButton.input.useHandCursor = true;
                            
                        newGroup.add(createdButton);
                    }
                
                MenuHud.objects[lvlId].push(newGroup);
            }


            //show groups
            let baseDelay = 1000;
            MenuHud.objects[lvlId].forEach( function(item, index) {
                                                let alphaObjectsTween = game.add.tween(item);
                                                    alphaObjectsTween.to( { alpha: 1.0 }, 400, "Sine", true, baseDelay+(400*index));
                                                    alphaObjectsTween.onComplete.add( function() { item.inputEnabled = true;} );
                                        });
                                      
            MenuHud.displayedLvl = lvlId;
        },
        show_SECONDLVL_CREDITS: function() {
            const lvlId = MAINMENU.SECONDLVL_CREDITS;
            
            const textLines = ["SFX Source\nfreesound.org",
                               "Images Source\ndeviantart.com",
                               "Everything else\nKarol Krakownication Dlugosz"
            ];
            const mainStyle = {font: '40px '+CONFIG.globalFont, fill: '#cccccc', align: "center"};
            
            textLines.forEach( (item, index) => { 
                
                var createdLine = game.add.text(600, 350+(index*200), item, mainStyle);
                    createdLine.anchor.setTo(0.5, 0.5);
                    createdLine.alpha = 0.0;
              
                MenuHud.objects[lvlId].push(createdLine);
            });
            
            //animate lines
            let baseDelay = 1000;
            
            MenuHud.objects[lvlId].forEach( function(item, index) {
                                            let alphaObjectsTween = game.add.tween(item);
                                                alphaObjectsTween.to( { alpha: 1.0 }, 400, "Sine", true, baseDelay+(400*index));
                                                //alphaObjectsTween.onComplete.add( function() { item.inputEnabled = true; item.input.useHandCursor = true;} );
                                        });
            
            
            MenuHud.displayedLvl = lvlId;
        }
    },
    
    continueCampain: function() {
        changeState('someLevel', mainMenuState.unlockedL);
    }
};


var introState = {
    
    create: function(){
        game.time.advancedTiming = true;
        
        game.stage.backgroundColor = CONSTS.DATA_COLORS.BLACK;
        
        this.IntroSmokeHandler.init();
        
        //MusicHandler.playMusic('music');
        showState();
        
        let smokeTimer = game.time.create(true);
            smokeTimer.loop(6000, () => changeState('mainMenu'), this);
            smokeTimer.start();
    },
    render: function() {
        if(game.showDebug)
            game.debug.text(CONFIG.gameName+" "+CONFIG.gameVersion+" FPS: " + game.time.fps || '--' , 10, 990);
    },

    
    IntroSmokeHandler: {
        
        frontGroup: null,
        backGroup: null,
        
        init() { 
            
            this.backGroup = game.add.group();
            
            let firstLabel = game.add.text(500, 450, "XRK", {font: '350px '+CONFIG.globalFont, fill: '#ffffff', align: "center"});         
                firstLabel.anchor.setTo(0.5, 0.5);
            let secondLabel = game.add.text(500, 650, "S T U D I O", {font: '145px '+CONFIG.globalFont, fill: '#ffffff', align: "center"});         
                secondLabel.anchor.setTo(0.5, 0.5);
            
            this.frontGroup = game.add.group();
            
            for(let i=0; i<10; i++)
            {
                this.createNew();
            }
        },
        
        createNew() {
            let posistion_Start = {x: Phaser.Math.between(-50, 1050), y: Phaser.Math.between(-50, 1050)};
            
            let startAlpha = (Phaser.Math.between(5, 10))/10;
                
            let smoke = this.frontGroup.create(posistion_Start.x, posistion_Start.y, 'smoke', null, true, 0);
                smoke.anchor.setTo(0.5, 0.5);
                smoke.scaleMax = null;
                smoke.scale.setTo(5, 5);
                smoke.alpha = startAlpha;
            
            
            let moveSmokeTween = game.add.tween(smoke.scale);
                moveSmokeTween.to({ x: 10, y: 10}, 5000, "Linear", true);
                                    
            let alphaSmokeTween = game.add.tween(smoke);
                alphaSmokeTween.to( {  alpha: 0 }, 5000, "Linear", true);
                alphaSmokeTween.onComplete.add( (object, tween) => { 
                    object.destroy();
                }, this);
        }
    }
};