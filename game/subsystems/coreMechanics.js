/*global CONSTS*/
/*global CONFIG*/
/*global Phaser*/
/*global MusicHandler*/
/*global game*/

var gameStateAnyLevel = {
    level:  null,
    starttype: null,
    init: function(start_level){
        this.level = start_level;
        
        let newStartType = levelsData[start_level].startType;
        if(newStartType == CONSTS.TYPES_STARTGAME.RANDOM) {
            const newTypeId = Phaser.Math.between(1,3);
            for (const type in CONSTS.TYPES_STARTGAME) {
                if(CONSTS.TYPES_STARTGAME[type].id == newTypeId) { 
                    newStartType = CONSTS.TYPES_STARTGAME[type]; 
                }
            }
        }
        this.starttype = newStartType;
        console.log("Init level: "+this.level+" with startType: "+this.starttype.id);
    },
    create: function(){
        game.time.advancedTiming = true;
        
        game.stage.backgroundColor = CONSTS.DATA_COLORS.BLACK;
        
        let backgroundStage = game.add.sprite(0, 0, 'worksite');
            backgroundStage.inputEnabled = true;
            backgroundStage.events.onInputDown.add(onDownFunction, this);
        
        let pauseKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
            pauseKey.onDown.add(CoreMechanics.PauseHandler.invoke, this, 2, null, true);
        
        CoreMechanics.MapHandler.init(this.level);

        CardsMechanics.Decks.boot();
        
        visualMechanics.CardControlUI.init();
        
        visualMechanics.StageHandler.boot();
        
        CardsMechanics.Decks.init();
        
        visualMechanics.CardControlUI.init();
        
        CardsMechanics.initCards(this.level, CardsMechanics.Decks.group_playerDeck);
        CardsMechanics.initCards(this.level, CardsMechanics.Decks.group_enemyDeck);
        
        visualMechanics.hud.init();
        
        CoreMechanics.GameControlHandler.initGame();
        
        MusicHandler.playMusic();
        MusicHandler.playSound(null, true, MusicHandler.SOUNDS_TYPES.SURROUND);
        showState();
    },
    update: function(){
        
    },
    render: function(){
        if(game.showDebug)
            game.debug.text(CONFIG.gameName+" "+CONFIG.gameVersion+" FPS: " + game.time.fps || '--' , 10, 990);
    },
    shutdown: function(){
        visualMechanics.reset();
        CoreMechanics.reset();
        CardsMechanics.reset();
        
        MusicHandler.resetSounds();
    }
};

var CardsMechanics = {
    reset: function() {
        this.group_graveyardCards = null;
        this.group_playerDeck = null;
        this.group_enemyDeck = null;
    },
    
    Decks: {
        group_graveyardCards: null,
        group_playerDeck: null,
        group_enemyDeck: null,
        
        group_stageCards: null,
        
        boot: function() {
            this.group_graveyardCards = game.add.group();
            this.group_playerDeck = game.add.group();
            this.group_enemyDeck = game.add.group();
        },
        init: function() {
            this.group_stageCards = game.add.group();
        }
    },
    
    defaultScaleInDeck: 0.65,
    defaultScaleInStage: 0.55,
  
    selectedCard: null, 
    focusedCard: null,
    cardRangeGraphics: null,
    
    initCards: function (level, deck) {
        
        let startCards;
        
        if(level) { 
            if(deck == CardsMechanics.Decks.group_playerDeck)
            {
                startCards = levelsData[level].playerCards; 
            }
            else
            {
                startCards = levelsData[level].enemyCards; 
            }
        }
        else {
            startCards = new Array( Phaser.Math.between(3, 6) );
            startCards.fill(0);
        }
        
        for(let [index, newCardID] of startCards.entries()) {
            
            while(newCardID == 0) {
                
                const cardsArray = cardStats.slice();
                      cardsArray.sort( (a,b) => { return b.rare-a.rare } );
                      
                for(const cardData of cardsArray) {
                    if(cardData.id == 0) continue;
                    
                    let chance = (100 - cardStats[cardData.id].rare);
                    
                    if(startCards.length == 5) {
                        if(cardData.tier == 3) continue;
                    }
                    else
                        if(startCards.length == 6) {
                            if(cardData.tier == 2 || cardData.tier == 3) continue;
                        } 
                        else 
                            if(startCards.length == 4) {
                                if(cardData.tier == 1) continue;
                            }
                        else 
                            if(startCards.length == 3) {
                                if(cardData.tier == 1 || cardData.tier == 2) continue;
                            }
                    
                    //console.log(`Roll with ${chance}% id: ${cardData.id}`);
                    if(Phaser.Utils.chanceRoll(chance))
                    {
                        //console.log(`Passed`);
                        newCardID = cardData.id;
                        startCards[index] = newCardID;
                        break;
                    }
                }
            }
            
            this.addCard(deck, newCardID);
        }
        
        return startCards;
  },
    addCard: function (deck, cardID) {
        if(deck.length < 8)
        {
            cardID = cardID || Math.floor((Math.random() * 4) + 1);
            
            let spawnPosition, setControl, imageKey, frameColor;
            if(deck == CardsMechanics.Decks.group_playerDeck) {
                spawnPosition = new Phaser.Point(500, 950);
                setControl = CONSTS.TYPES_CARDCONTROL.PLAYER;
                imageKey = cardID;
                frameColor = 0x00FF00;
            }
            else {
                spawnPosition = new Phaser.Point(500, 235);
                setControl = CONSTS.TYPES_CARDCONTROL.ENEMY;
                imageKey = "empty";
                frameColor = 0xFF0000;
            }
            
            let newCard = deck.create(spawnPosition.x, spawnPosition.y, 'card_image_'+imageKey);
                newCard.anchor.setTo(0.5);
                newCard.scale.setTo(0.65);
                
                newCard.id = cardID;
                newCard.control = setControl;
                newCard.nextMove = 0;
                
                newCard.type = cardStats[cardID].type
                newCard.range = cardStats[cardID].range;
                newCard.currentHP = cardStats[cardID].hp; 
                
                newCard.combatAtributesDef = cardStats[cardID].def;
                
                newCard.inputEnabled = true;
                newCard.input.useHandCursor = true;
                newCard.input.priorityID = 2;
                newCard.events.onInputDown.add(CardsMechanics.selectCard, this);
                newCard.events.onInputOver.add( function(invokerPtr, inputerPtr) { invokerPtr.scale.setTo(0.70); }, this);
                newCard.events.onInputOut.add( function(invokerPtr, inputerPtr) { invokerPtr.scale.setTo(0.65); }, this);
                
                if(deck == CardsMechanics.Decks.group_enemyDeck) {
                    newCard.input.useHandCursor = false;
                    newCard.events.onInputDown.active = false;
                    newCard.events.onInputOver.active = false;
                    newCard.events.onInputOut.active = false;
                }
                
            let newCardGraphic = game.make.graphics();
                newCardGraphic.lineStyle(5, frameColor, 0.5);
                newCardGraphic.drawRect(-50, -70, 50*2, 70*2);
            newCard.addChild(newCardGraphic);
                
            if(deck == CardsMechanics.Decks.group_playerDeck)  { visualMechanics.hud.updateCardsPosistionInPlayerDeck(); }
            if(deck == CardsMechanics.Decks.group_enemyDeck)   { visualMechanics.hud.updateCardsPosistionInEnemyDeck(); }
        }
    },
    
    getLowestHPCard: function(skipThisControl, skipThisCard) {
        let lowestHP = 100;
        let lowestIndex;
        for(let i=(CardsMechanics.Decks.group_stageCards.length-1); i >= 0; i--)
        {
            let card = CardsMechanics.Decks.group_stageCards.getChildAt(i);
            
            if(skipThisCard != null)
            {
                if(card == skipThisCard)
                {
                    continue;
                }
            }
            if(skipThisControl != null)
            {
                if(card.control != skipThisControl)
                {
                    continue;
                }
            }
            
            if(card.currentHP < lowestHP)
            {
                lowestHP = card.currentHP;
                lowestIndex = i;
            }
        }
        return CardsMechanics.Decks.group_stageCards.getChildAt(lowestIndex);
    },
    
    selectCard: function(selectedCardPtr, pointer) {
    let traceEnabled = false;
        if(selectedCardPtr.owner != null)
        {
            if(traceEnabled) { console.log("[selectCard] - trace1 - Card cLicked on timebar"); }
            selectedCardPtr = selectedCardPtr.owner;
        }
            
        if(traceEnabled) { console.log("[selectCard] Card selected! CardID:"+selectedCardPtr.id); }
        CardsMechanics.selectedCard = selectedCardPtr;
        CardsMechanics.highlightCard(selectedCardPtr);
        CardsMechanics.showCardRange(selectedCardPtr);
        visualMechanics.hud.update();
        visualMechanics.StageHandler.highlightStage();
    },
    showCardRange: function(selectedCardPtr) {
        const modifyCardRangeGraphics = this.cardRangeGraphics;
            modifyCardRangeGraphics.clear();   
            
        if(selectedCardPtr != null)
        {
            if(selectedCardPtr.parent == this.Decks.group_stageCards && (selectedCardPtr.i != null && selectedCardPtr.j != null))
            {
                for(let rowIndex=(-selectedCardPtr.range); rowIndex < selectedCardPtr.range+1; rowIndex++) {
                    if(selectedCardPtr.i+rowIndex < 0 || selectedCardPtr.i+rowIndex > 5) continue;
                    for(let columnIndex=(Math.abs(rowIndex) - selectedCardPtr.range); columnIndex < Math.abs(Math.abs(rowIndex) - selectedCardPtr.range)+1; columnIndex++) {
                        if(selectedCardPtr.j+columnIndex < 0 || selectedCardPtr.j+columnIndex > 9) continue;
                        
                        const extraOffset = -5;
                        const startPoint = visualMechanics.StageHandler.getStageSpot(selectedCardPtr.i+rowIndex, selectedCardPtr.j+columnIndex);
                        const stageInterval = visualMechanics.StageHandler.spotsStageData.interval;
                        
                        modifyCardRangeGraphics.lineStyle(2, 0x330000, 0.2);
                        modifyCardRangeGraphics.beginFill(0x330000, 0.1);
                        modifyCardRangeGraphics.drawRect(startPoint.x-(stageInterval.x/2)-extraOffset, startPoint.y-(stageInterval.y/2)-extraOffset, stageInterval.x+(extraOffset*2), stageInterval.y+(extraOffset*2));
                        modifyCardRangeGraphics.endFill();
                    }
                }
            }
        }
    },
    unselectCard: function() {
        CardsMechanics.selectedCard = null;
            
        CardsMechanics.highlightCard(null);
        CardsMechanics.showCardRange(null);
        visualMechanics.StageHandler.clearStageHighlight();
        visualMechanics.hud.update();
    },
    
    highlightCard: function(cardToHighlightPtr) {
        let highlightTint = 0xb2b2b2;

        CardsMechanics.Decks.group_graveyardCards.forEach( function(item) {
            if(item == cardToHighlightPtr) 
            {  
                item.tint = highlightTint;
            } 
            else { item.tint = 0xffffff; }
        });
        CardsMechanics.Decks.group_playerDeck.forEach( function(item) {
            if(item == cardToHighlightPtr) 
            {  
                item.tint = highlightTint;
            } 
            else { item.tint = 0xffffff; }
        });
        CardsMechanics.Decks.group_stageCards.forEach( function(item) {
            if(item == cardToHighlightPtr) 
            {  
                item.tint = highlightTint;
            } 
            else { item.tint = 0xffffff; }
        });
        visualMechanics.hud.TimeBarHandler.cards.forEach(function(item) {
            if(item.owner == cardToHighlightPtr) 
            {  
                item.tint = highlightTint;
            } 
            else { item.tint = 0xffffff; }
        });
        
    },
    
    focusCard: function(cardToFocusPtr) {
        if(cardToFocusPtr != null)
        {
            cardToFocusPtr.events.onInputOver.active = false;
            cardToFocusPtr.events.onInputOut.active = false;
            
            let newFocusTween = game.add.tween(cardToFocusPtr.scale);
                newFocusTween.to( {x: 0.6, y: 0.6}, 500, "Sine", true, 0, -1);
                newFocusTween.yoyo(true, 100);
                
            this.focusedCard = cardToFocusPtr;
        }
        else
        {
            if(this.focusedCard != null)
            {
                let focusedCard = this.focusedCard;
                
                game.tweens.removeFrom(focusedCard.scale);
                
                    focusedCard.events.onInputOver.active = true;
                    focusedCard.events.onInputOut.active = true;
                    focusedCard.scale.setTo( this.defaultScaleInStage );
                    
                this.focusedCard = null;
            }
        }
    },
    
    moveCard: function(updatedCard, targetSpot) {
        if(CoreMechanics.MapHandler.mapData[targetSpot.i][targetSpot.j] == CONSTS.TYPES_MAPSPOTS.FREE)
        {  
            if(updatedCard.i != null || updatedCard.j != null) 
            {
                CoreMechanics.MapHandler.mapData[updatedCard.i][updatedCard.j] = CONSTS.TYPES_MAPSPOTS.FREE; 
            }
            else
            {
                visualMechanics.hud.TimeBarHandler.addCard(updatedCard);
            }
            
            CoreMechanics.MapHandler.mapData[targetSpot.i][targetSpot.j] = CONSTS.TYPES_MAPSPOTS.TAKEN;
            
            updatedCard.i = targetSpot.i;
            updatedCard.j = targetSpot.j;
            
            MusicHandler.playSound(null, false, MusicHandler.SOUNDS_TYPES.MOVEMENT);
            
            let moveTween = game.add.tween(updatedCard);
                moveTween.to({ x: targetSpot.x, y: targetSpot.y }, 450, "Sine", true);
            
            if(CardsMechanics.selectedCard == updatedCard) { CardsMechanics.showCardRange(updatedCard); }
            visualMechanics.StageHandler.highlightStage();
        }
    },
    attackCard: function(attackingCard, targetCard) {
        
        let attackTween = game.add.tween(attackingCard);
            attackTween.to({ x: [targetCard.x, attackingCard.x], y: [targetCard.y, attackingCard.y] }, 450, "Sine", true);
        
        if(!Phaser.Utils.chanceRoll(cardStats[targetCard.id].agi))
        {
            let soundType;
            if(attackingCard.type == CONSTS.TYPES_CARDTYPE.MELEE) soundType = MusicHandler.SOUNDS_TYPES.SWORD;
            if(attackingCard.type == CONSTS.TYPES_CARDTYPE.RANGED) soundType = MusicHandler.SOUNDS_TYPES.BOW;
                
            MusicHandler.playSound(null, false, soundType);
            
            let dmgFormula = cardStats[attackingCard.id].att - cardStats[targetCard.id].def + 1;
            if(dmgFormula < 1) { dmgFormula = 1; }    
                
            targetCard.currentHP -= dmgFormula;
                
            const dmgTween = game.add.tween(targetCard);
                dmgTween.to({ x: [targetCard.x+8, targetCard.x-8, targetCard.x+8, targetCard.x-8, targetCard.x], y: [targetCard.y+1, targetCard.y-1, targetCard.y+1, targetCard.y-1, targetCard.y] }, 200, Phaser.Easing.Bounce.Out, true, 250);
            
            MusicHandler.playSound(null, false, MusicHandler.SOUNDS_TYPES.HIT);
                
            CardsMechanics.showHit(dmgFormula, targetCard);
            
            const blooddropOffset = 20;
            const blooddropScaleMin = 7+(dmgFormula);
            const blooddropScaleMax = 7+(dmgFormula*1.75)+2;
            const newBloodDrop = game.make.sprite( Phaser.Math.between(-targetCard.width+blooddropOffset, targetCard.width-blooddropOffset), Phaser.Math.between(-targetCard.height+blooddropOffset, targetCard.height-blooddropOffset), "blooddrop");
                newBloodDrop.anchor.setTo(0.5);
                newBloodDrop.scale.setTo(Phaser.Math.between(blooddropScaleMin,blooddropScaleMax)/10);
                newBloodDrop.angle = Phaser.Math.between(-170, 170);
            targetCard.addChild(newBloodDrop);
                
            if(targetCard.currentHP <= 0)
            {
                targetCard.currentHP = 0;
                CardsMechanics.cardKilled(targetCard);
            }
                
            visualMechanics.hud.update();
        }
        else 
        {
            let soundType;
            if(attackingCard.type == CONSTS.TYPES_CARDTYPE.RANGED) soundType = MusicHandler.SOUNDS_TYPES.BOW;
            else soundType = MusicHandler.SOUNDS_TYPES.MISS;
                
            MusicHandler.playSound(null, false, soundType);
            
            let doggeTween = game.add.tween(targetCard);
                doggeTween.to({ x: [( targetCard.x+ (targetCard.x - attackingCard.x)/3 ), targetCard.x], y: [( targetCard.y + (targetCard.y - attackingCard.y)/3), targetCard.y] }, 450, "Sine", true);
            
            //MusicHandler.playSound(null, false, MusicHandler.SOUNDS_TYPES.DOGGE);
            
            CardsMechanics.showHit("dogge!", targetCard);
        }
    },
    cardKilled: function(cardToUpdate) {
        if(cardToUpdate.currentHP <= 0)
        {
            CoreMechanics.MapHandler.mapData[cardToUpdate.i][cardToUpdate.j] = CONSTS.TYPES_MAPSPOTS.FREE;
            
            cardToUpdate.events.onInputOver.active = false;
            cardToUpdate.events.onInputOut.active = false;
            
            MusicHandler.playSound(null, false, MusicHandler.SOUNDS_TYPES.DEATH);
            
            let killTween = game.add.tween(cardToUpdate);
                killTween.to({ angle: Phaser.Math.between(-90, 90) }, 300, "Sine", true);
            let killTweenScale = game.add.tween(cardToUpdate.scale);
                killTweenScale.to({ x: 0.35, y: 0.35 }, 300, "Sine", true);
                     
            visualMechanics.hud.TimeBarHandler.removeCard(cardToUpdate);
            
            CardsMechanics.Decks.group_graveyardCards.add(cardToUpdate);
            
            if(CardsMechanics.selectedCard == cardToUpdate) { CardsMechanics.showCardRange(); }
        }
    },
    
    showHit: function(message, targetCard) {
        let hitLabel = game.add.text(targetCard.x, targetCard.y, message, 
                            {font: '24px '+CONFIG.globalFont, fill: '#000000'});         
            hitLabel.anchor.setTo(0.5, 0.5);
            hitLabel.alpha = 0.8;
        
        let hitTween = game.add.tween(hitLabel);
            hitTween.to({x: targetCard.x, y: targetCard.y-50 }, 250, "Sine", true);
                            
        let hitTweenAlpha = game.add.tween(hitLabel);
            hitTweenAlpha.to( {  alpha: 0.0 }, 400, "Sine", true, 600);
            hitTweenAlpha.onComplete.add(function(object, tween) { object.destroy(); }, this);
    },
};


var visualMechanics = {
    reset: function() {
        this.hud.reset();
        this.PopupHandler.reset();
        this.StageHandler.reset();
    },
    
    hud: {
        reset: function() { 
            this.button_Start = null;
            this.button_AutoFight = null;
            this.button_Menu  = null;

            this.cardDataBackground = null;
            
            this.speedHud = null;
            
            this.pauseGraphics = null;
            
            this.TimeBarHandler.reset();
        },
        
        button_Start: null,
        button_AutoFight: null,
        button_Menu:  null,
        
        cardDataBackground: null,
        
        speedHud: null,
        
        pauseGraphics: null,
        messagePtr: null,
        
        buttonHandling: {
            defaultStyle: {font: '30px '+CONFIG.globalFont, fill: '#cccccc'},
            
            create: function(position, text, mainStyle, hoverStyle, clickFunction, clickFunctionArgs) {
                var newHoverStyle = CloneObj(hoverStyle);
                var newMainStyle = CloneObj(mainStyle);
                
                var createdButton = game.add.text(position.x, position.y, text, newMainStyle);         
                    createdButton.anchor.setTo(0.5, 0.5);
                    createdButton.inputEnabled = true;
                    createdButton.input.useHandCursor = true;
                    createdButton.events.onInputOver.add( visualMechanics.hud.buttonHandling.changeStyle, this, 2, newHoverStyle);
                    createdButton.events.onInputOut.add(  visualMechanics.hud.buttonHandling.changeStyle, this, 2, newMainStyle);
                    createdButton.events.onInputDown.add( clickFunction, this , 2, clickFunctionArgs);
                
                return createdButton;
            },
            changeStyle: function(button, dummy, newStyle) {
                button.setStyle( newStyle );
            },
            setOn: function(button, newStyle) {
                
                button.events.onInputOver.active = false;
                button.events.onInputOut.active  = false;
                button.events.onInputDown.active = false;
                button.input.useHandCursor = false;
                
                button.setStyle( newStyle );
            },
            setOff: function(button, newStyle) {
                button.events.onInputOver.active = true;
                button.events.onInputOut.active  = true;
                button.events.onInputDown.active = true;
                button.input.useHandCursor = true;
                
                button.setStyle( newStyle );
            }
        },
        
        TimeBarHandler: {
            isBackgroundShowed: false,
            backgroundPtr: null,
            cards: [],
            
            reset: function() {
                this.isBackgroundShowed = false;
                this.backgroundPtr = null;
                this.cards = [];
            },
            init: function() {
                this.backgroundPtr = game.add.graphics(1050, 300);
                    visualMechanics.hud.createBox(this.backgroundPtr, 50, 570);
                this.backgroundPtr.alpha = 0;
                this.isBackgroundShowed = false;
            },
            addCard: function(newMainCardPtr) {
                
                if(!this.isBackgroundShowed)
                {
                    visualMechanics.hud.showTween(this.backgroundPtr, {x: 920, y: this.backgroundPtr.y}, 200);
                    this.isBackgroundShowed = true;
                }
                
                let isAlreadyInTimeBar = false;
                this.cards.forEach(function(item) {
                    if(item.owner == newMainCardPtr)
                    {
                        isAlreadyInTimeBar = true;
                    }
                });
                
                if(!isAlreadyInTimeBar)
                {
                    let frameColor;
                    if(newMainCardPtr.control == CONSTS.TYPES_CARDCONTROL.PLAYER) { frameColor = 0x00FF00; }
                    else if(newMainCardPtr.control == CONSTS.TYPES_CARDCONTROL.ENEMY) { frameColor = 0xFF0000; }
                    
                    let miniatureCard = game.make.sprite( this.backgroundPtr.boxWidth/2, 45, newMainCardPtr.key);
                        miniatureCard.anchor.setTo(0.5);
                        miniatureCard.scale.setTo(0.3);                                                    
                        miniatureCard.inputEnabled = true;
                        miniatureCard.input.useHandCursor = true;
                        miniatureCard.owner = newMainCardPtr;
                        miniatureCard.events.onInputDown.add(CardsMechanics.selectCard, this);
                    this.backgroundPtr.addChild(miniatureCard);
                    this.cards.push(miniatureCard);
                    
                    let newCardGraphic = game.make.graphics();
                        newCardGraphic.lineStyle(5, frameColor, 0.5);
                        newCardGraphic.drawRect(-50, -70, 50*2, 70*2);
                        
                        miniatureCard.addChild(newCardGraphic);
                        
                    this.update();
                }
            },
            removeCard: function(deletedMainCardPtr) {
                
                this.cards.forEach(function(item, index) {
                    if(item.owner == deletedMainCardPtr)
                    {
                        let hideCardTween = visualMechanics.hud.hideTween(item, item.position, 200);
                            hideCardTween.onComplete.add( function() { item.destroy(); }, this, 5);
                        visualMechanics.hud.TimeBarHandler.cards.splice(index, 1);
                    }
                });
                
                if(this.cards.length == 0)
                {
                    let hideBackgroundTween = visualMechanics.hud.hideTween(this.backgroundPtr, {x: 1050, y: this.backgroundPtr.y}, 200);
                        hideBackgroundTween.onComplete.add( function() { this.isBackgroundShowed = false; }, this, 5);
                }
                
                this.update();
            },
            update: function() {
                if(this.cards.length > 0)
                {
                    this.cards.sort( function(a, b) {return a.owner.nextMove - b.owner.nextMove}, this);
                    
                    this.cards.forEach(function(item, index) {
                        
                        let targetY = 540 - (index*46);
                        
                        let moveTween = game.add.tween(item);
                            moveTween.to({ y: targetY }, 500, "Sine", true);
                    });
                }
            }
        },
        
        init: function() {
            let hudButtons_MainStyle = {font: '40px '+CONFIG.globalFont, fill: '#cccccc'};
            let hudButtons_HoverStyle = {font: '44px '+CONFIG.globalFont, fill: '#ffffff'};
            
            let buttonData = {x: 500, y: 1100, width: 140, height: 60};
            
            //button_Start
            if(true) {
                let hudButtons_MainStyle = {font: '60px '+CONFIG.globalFont, fill: '#cccccc'};
                let hudButtons_HoverStyle = {font: '64px '+CONFIG.globalFont, fill: '#ffffff'};
                
                let buttonData = {x: 500, y: 1100, width: 220, height: 100};
                
                this.button_Start = game.add.graphics(buttonData.x-(buttonData.width/2), buttonData.y-(buttonData.height/2));
                    this.createBox(this.button_Start, buttonData.width, buttonData.height);
                    let buttonLabel = this.buttonHandling.create({x: (buttonData.width/2), y: (buttonData.height/2)}, 'start', hudButtons_MainStyle, hudButtons_HoverStyle, CoreMechanics.GameControlHandler.startGame);
                        buttonLabel.input.priorityID = 3;
                this.button_Start.addChild(buttonLabel);
                this.button_Start.inputEnabled = true;
                this.button_Start.input.priorityID = 2;
            }
            
            //button_Menu
            if(true) {
                let hudButtons_MainStyle = {font: '40px '+CONFIG.globalFont, fill: '#cccccc'};
                let hudButtons_HoverStyle = {font: '44px '+CONFIG.globalFont, fill: '#ffffff'};
                
                let buttonData = {x: 900, y: 65, width: 140, height: 60};
                this.button_Menu = game.add.graphics(buttonData.x-(buttonData.width/2), buttonData.y-(buttonData.height/2));
                    this.createBox(this.button_Menu, buttonData.width, buttonData.height);
                    let buttonLabel = this.buttonHandling.create({x: (buttonData.width/2), y: (buttonData.height/2)}, 'menu', hudButtons_MainStyle, hudButtons_HoverStyle, function() { 
                        if(!CoreMechanics.GameControlHandler.isGameFinished)
                        {
                            visualMechanics.PopupHandler.show(POPUPS.gameExit); 
                        }
                        else
                        {
                            changeState('mainMenu');
                        }
                    });
                this.button_Menu.addChild(buttonLabel);
            }
            
            //button_AutoFight
            if(true) {
                let anyLabel = game.add.text(5, 10, 'auto\nfight', {font: '14px '+CONFIG.globalFont, fill: '#cccccc'});   
                
                buttonData = {x: 900, y: 1050, width: 140, height: 60};
            
                this.button_AutoFight = game.add.graphics(buttonData.x-(buttonData.width/2), buttonData.y-(buttonData.height/2));
                    this.createBox(this.button_AutoFight, buttonData.width, buttonData.height);
                    let buttonLabel = this.buttonHandling.create({x: (buttonData.width/2)+20, y: (buttonData.height/2)}, 'null', {font: '30px '+CONFIG.globalFont, fill: '#cccccc'}, {font: '34px '+CONFIG.globalFont, fill: '#ffffff'}, function() { CoreMechanics.AutoFightHandler.change(); });
                this.button_AutoFight.addChild(buttonLabel);
                this.button_AutoFight.addChild(anyLabel);
            }
            
            //SpeedControlHud
            if(true) {
                const buttonData= {x: 500, y: 1050, width: 500, height: 60};
                
                const speedhudButtons_MainStyle = {font: '30px '+CONFIG.globalFont, fill: '#cccccc'};
                const speedhudButtons_HoverStyle = {font: '34px '+CONFIG.globalFont, fill: '#ffffff'};
                
                this.speedHud = game.add.graphics(buttonData.x-(buttonData.width/2), buttonData.y-(buttonData.height/2));
                    this.createBox(this.speedHud, buttonData.width, buttonData.height);
                    const anyLabel = game.add.text(5, 10, 'game\nspeed', 
                                    {font: '14px '+CONFIG.globalFont, fill: '#cccccc'});         

                    const buttonLabel0 = this.buttonHandling.create({x: 110, y: (buttonData.height/2)}, 'x0.5', speedhudButtons_MainStyle, speedhudButtons_HoverStyle, CoreMechanics.GameSpeedHandler.changeSpeed, CONSTS.DATA_GAMESPEEDS.SLOW);
                this.speedHud.addChild(buttonLabel0);
                    const buttonLabel1 = this.buttonHandling.create({x: 180+10, y: (buttonData.height/2)}, 'x1', speedhudButtons_MainStyle, speedhudButtons_HoverStyle, CoreMechanics.GameSpeedHandler.changeSpeed, CONSTS.DATA_GAMESPEEDS.NORMAL);
                this.speedHud.addChild(buttonLabel1);
                    const buttonLabel2 = this.buttonHandling.create({x: 250+10, y: (buttonData.height/2)}, 'x2', speedhudButtons_MainStyle, speedhudButtons_HoverStyle, CoreMechanics.GameSpeedHandler.changeSpeed, CONSTS.DATA_GAMESPEEDS.FAST);
                this.speedHud.addChild(buttonLabel2);
                    const buttonLabel3 = this.buttonHandling.create({x: 400, y: (buttonData.height/2)}, 'pause', speedhudButtons_MainStyle, speedhudButtons_HoverStyle, CoreMechanics.PauseHandler.invoke, true);
                this.speedHud.addChild(buttonLabel3);  
                
                this.speedHud.addChild(anyLabel);
            }
            
            //CardDataHud
            if(true) {
                const cardDataLabelColor = '#cccccc';
                
                this.cardDataBackground = game.add.graphics(500-(400/2), -200);
                    this.createBox(this.cardDataBackground, 400, 150);
                    
                    const label_CardName = game.add.text(252.5, 24, '',
                                        {font: '34px '+CONFIG.globalFont, fill: cardDataLabelColor});
                        label_CardName.anchor.setTo(0.5, 0.5);
                this.cardDataBackground.addChild(label_CardName);
                    
                    const graphics_CardHP = game.add.graphics(120, label_CardName.y + (34/2));
                        graphics_CardHP.maxWidth = 265;
                this.cardDataBackground.addChild(graphics_CardHP);
                        const label_CardHP = game.add.text((graphics_CardHP.maxWidth/2), 8, '', 
                                            {font: '14px '+CONFIG.globalFont, fill: cardDataLabelColor});
                            label_CardHP.anchor.setTo(0.5, 0.5);
                    graphics_CardHP.addChild(label_CardHP);    
                    
                
                const createLabels = [
                    { text: 'Attack',   relativePosistion: {x: 50,  y: 40}},
                    { text: 'Defence',  relativePosistion: {x: 230, y: 40}},
                    { text: 'Speed',    relativePosistion: {x: 50,  y: 90}},
                    { text: 'Agility',  relativePosistion: {x: 230, y: 90}},
                    { text: 'Range',    relativePosistion: {x: 135, y: 40}}
                ];
                
                for(const labelData of createLabels) {
                    let newLabel = game.add.text(   graphics_CardHP.x + labelData.relativePosistion.x, 
                                                    graphics_CardHP.y + labelData.relativePosistion.y, 
                                                    labelData.text,
                                                    {font: '12px '+CONFIG.globalFont, fill: cardDataLabelColor});
                        newLabel.anchor.setTo(1, 0.5);
                        
                        let newLabelValue = game.add.text(15, 0, '', {font: '25px '+CONFIG.globalFont, fill: '#ffffff'});
                            newLabelValue.anchor.setTo(0.5, 0.5);
                    newLabel.addChild(newLabelValue);
                    
                this.cardDataBackground.addChild(newLabel);
                }
                
            }
            
            this.TimeBarHandler.init();
        },
        update: function() {
            if(CardsMechanics.selectedCard) 
            {
                const cardPtr = CardsMechanics.selectedCard;
                
                if(game.tweens.isTweening(this.cardDataBackground))
                {
                    game.tweens.removeFrom(this.cardDataBackground);
                }
                this.showTween(this.cardDataBackground, {x: this.cardDataBackground.x, y: 20}, 0);
                
                const cardDataBackground = this.cardDataBackground;
                
                    cardDataBackground.getChildAt(0).text = cardStats[cardPtr.id].name;
                
                    const percentHP = cardPtr.currentHP / cardStats[cardPtr.id].hp;
                    const hpBar = cardDataBackground.getChildAt(1);
                        hpBar.clear();
                        hpBar.beginFill(0x00FF00, 0.6);
                        hpBar.drawRect(0, 0, percentHP * hpBar.maxWidth, 11);
                        hpBar.endFill();
                        hpBar.beginFill(0xFF0000, 0.6);
                        hpBar.drawRect(percentHP * hpBar.maxWidth, 0, hpBar.maxWidth - (percentHP * hpBar.maxWidth), 11);
                        hpBar.endFill();
                
                    cardDataBackground.getChildAt(1).getChildAt(0).text = cardPtr.currentHP+" / "+cardStats[cardPtr.id].hp;
                    
                    cardDataBackground.getChildAt(2).getChildAt(0).text = cardStats[cardPtr.id].att;
                    cardDataBackground.getChildAt(3).getChildAt(0).text = cardStats[cardPtr.id].def;
                    cardDataBackground.getChildAt(4).getChildAt(0).text = cardStats[cardPtr.id].spd;
                    cardDataBackground.getChildAt(5).getChildAt(0).text = cardStats[cardPtr.id].agi;
                    cardDataBackground.getChildAt(6).getChildAt(0).text = cardStats[cardPtr.id].range;
                
                if(cardDataBackground.children.length > 7) {
                    cardDataBackground.getChildAt(7).destroy(true, false);
                }
                
                    const cardImage = game.add.sprite(10, 10, 'card_image_'+cardPtr.id);
                          cardImage.scale.setTo(0.94);
                    cardDataBackground.addChild(cardImage);
                        
                        let frameColor;
                        if(cardPtr.control == CONSTS.TYPES_CARDCONTROL.PLAYER) { frameColor = 0x00FF00; }
                        else if(cardPtr.control == CONSTS.TYPES_CARDCONTROL.ENEMY) { frameColor = 0xFF0000; }
                    
                        let newCardGraphic = game.make.graphics();
                            newCardGraphic.lineStyle(4, frameColor, 0.5);
                            newCardGraphic.drawRect(0, 0, 50*2, 70*2);
                        cardImage.addChild(newCardGraphic);
            }
            else 
            {
                if(game.tweens.isTweening(this.cardDataBackground))
                {
                    game.tweens.removeFrom(this.cardDataBackground);
                }
                this.hideTween(this.cardDataBackground, {x: this.cardDataBackground.x, y: -170}, 0);
            }
        },
        
        updateCardsPosistionInPlayerDeck: function() {
            let playerDeckPtr = CardsMechanics.Decks.group_playerDeck;
            let total_x = ((playerDeckPtr.length-1) * 100) + ((playerDeckPtr.length-1) * 10);
            
            playerDeckPtr.forEach(function(item) {
                let targetX = 500 - (total_x/2) + (playerDeckPtr.getChildIndex(item)*110);
                let targetY = 940;
                
                let moveTween = game.add.tween(item);
                    moveTween.to({ x: targetX, y: targetY }, 450, "Sine", true);
                
                item.scale.setTo(0.65);
            });
        },
        updateCardsPosistionInEnemyDeck: function() {
            let enemyDeckPtr = CardsMechanics.Decks.group_enemyDeck;
            let total_x = ((enemyDeckPtr.length-1) * 100) + ((enemyDeckPtr.length-1) * 10);
            
            enemyDeckPtr.forEach(function(item) {
                let targetX = 500 - (total_x/2) + (enemyDeckPtr.getChildIndex(item)*110);
                let targetY = 235;
                
                let moveTween = game.add.tween(item);
                    moveTween.to({ x: targetX, y: targetY }, 450, "Sine", true);
                
                item.scale.setTo(0.65);
            });
        },
    
        createBox: function(graphicsObject, boxWidth, boxHeight) {
            var frameColor = 0xCCCCCC;
            if(graphicsObject && boxWidth && boxHeight)
            {
                var creatingBackground = graphicsObject;
                creatingBackground.boxWidth = boxWidth;
                creatingBackground.boxHeight = boxHeight;
                
                creatingBackground.lineStyle(2, frameColor, 0.7);
                creatingBackground.beginFill(0x000000, 0.7);
                creatingBackground.drawRect(0, 0, boxWidth, boxHeight);
                creatingBackground.endFill();
                
                var randMin = 4; var randMax = 12;
                creatingBackground.moveTo(-Math.floor((Math.random() * (randMax-randMin))+randMin), 0);  
                creatingBackground.lineTo(boxWidth+Math.floor((Math.random() * (randMax-randMin))+randMin), 0);
                
                creatingBackground.moveTo(0, -Math.floor((Math.random() * (randMax-randMin))+randMin));  
                creatingBackground.lineTo(0, boxHeight+Math.floor((Math.random() * (randMax-randMin))+randMin));
                
                creatingBackground.moveTo(boxWidth, -Math.floor((Math.random() * (randMax-randMin))+randMin));  
                creatingBackground.lineTo(boxWidth, boxHeight+Math.floor((Math.random() * (randMax-randMin))+randMin));
                
                creatingBackground.moveTo(-Math.floor((Math.random() * (randMax-randMin))+randMin), boxHeight);  
                creatingBackground.lineTo(boxWidth+Math.floor((Math.random() * (randMax-randMin))+randMin), boxHeight);
            }
        },
        showTween: function(object, position, delay) {
            let extraDelay = delay+100;
            let noExtraDelay = delay;
            if(game.tweens.isTweening(object))
            {
                game.tweens.removeFrom(object);
                extraDelay = 0;
                noExtraDelay = 0;
            }
            
            var showTweenMovement = game.add.tween(object);
                showTweenMovement.to( position, 400, "Sine", true, extraDelay);
                
            var showTweenAlpha = game.add.tween(object);
                showTweenAlpha.to( { alpha: 1.0 }, 250, "Sine", true, noExtraDelay);
                
            return showTweenMovement;
        },
        hideTween: function(object, position, delay) {
            
            let extraDelay = delay+100;
            let noExtraDelay = delay;
            if(game.tweens.isTweening(object))
            {
                game.tweens.removeFrom(object);
                extraDelay = 0;
                noExtraDelay = 0;
            }
            
            var hideTweenMovement = game.add.tween(object);
                hideTweenMovement.to( position, 400, "Sine", true, extraDelay);
                
            var hideTweenAlpha = game.add.tween(object);
                hideTweenAlpha.to( { alpha: 0.0 }, 250, "Sine", true, noExtraDelay);
                
            return hideTweenMovement;
        },
        
        visualPause: function(pregamePopup) {
            pregamePopup = pregamePopup || false;
            if((CoreMechanics.GameFlowHandler.mainTimer.paused && CoreMechanics.GameControlHandler.isGameLaunched) || pregamePopup)
            {
                if(visualMechanics.hud.pauseGraphics == null)
                {
                    let newPauseGraphics = game.add.graphics();
                        newPauseGraphics.lineStyle(4, 0xE3E3E3, 0.5);
                        newPauseGraphics.beginFill(0xE3E3E3, 0.2);
                        newPauseGraphics.drawRect(100, 300-15, 1000-100-100, 1000-300+5-100);
                        newPauseGraphics.endFill();
                    visualMechanics.hud.pauseGraphics = newPauseGraphics;
                }
            }
            else
            {
                if(visualMechanics.hud.pauseGraphics != null)
                {
                    visualMechanics.hud.pauseGraphics.clear();
                    visualMechanics.hud.pauseGraphics.destroy(true, true);
                    visualMechanics.hud.pauseGraphics = null;
                }
            }
        },
        
        createMessage: function() {
            
            let labelText = gameStateAnyLevel.starttype.infoText;
            
            if(gameStateAnyLevel.starttype == CONSTS.TYPES_STARTGAME.SAMETIME) {
                CoreMechanics.PreGameFlowHandler.isPlayerTurn = Phaser.Utils.chanceRoll();
                
                if(CoreMechanics.PreGameFlowHandler.isPlayerTurn) { labelText = "We have spoted enemy!"+labelText; }
                else { labelText = "Enemy spoted us!"+labelText; }
            }
            
            const messageData = { x: 500, y: 500, width: 400, height: 200};
            
            const background = game.add.graphics();
                background.beginFill(0x000000, 0.3);
                background.drawRect(0, 0, 1000, 1000);
                background.endFill();
                background.alpha = 0;
                background.inputEnabled = true;
                background.input.priorityID = 5;
                background.events.onInputDown.addOnce( function() { 
                    game.tweens.removeFrom(boxPtr.scale);
                    game.tweens.removeFrom(boxPtr);
                    game.tweens.removeFrom(background);
                    
                    const hideTween_BackgroundAlpha = game.add.tween(background);
                        hideTween_BackgroundAlpha.to( { alpha: 0.0 }, 1000, "Sine", true, 0);
                        hideTween_BackgroundAlpha.onComplete.addOnce( function() { 
                                background.destroy(true);
                                CoreMechanics.PreGameFlowHandler.postActionCheck();
                    }, this, 5);
                    
                    const hideTween_Scale = game.add.tween(boxPtr.scale);
                        hideTween_Scale.to( { x: 0.6, y: 0.6 }, 1000, "Sine", true, 0);  
                       
                    const hideTween_Movement = game.add.tween(boxPtr);
                        hideTween_Movement.to( { x: 20, y: 20 }, 1000, "Sine", true, 0);
                        
                }, this, 5 );
                
                const boxPtr = game.add.graphics(messageData.x - (messageData.width/2), messageData.y - (messageData.height/2));
                visualMechanics.hud.createBox(boxPtr, messageData.width, messageData.height);
                    boxPtr.alpha = 0;
                    
                    const label = game.add.text(0, 0, labelText,
                                        {font: '30px '+CONFIG.globalFont, fill: '#cccccc', 
                                         align: "center", boundsAlignH: 'center', boundsAlignV: 'middle',
                                         wordWrap: true, wordWrapWidth: messageData.width-10});
                        label.setTextBounds(10, 10, messageData.width-10, messageData.height-10);
                        
                boxPtr.addChild(label);
            
            if(gameStateAnyLevel.starttype == CONSTS.TYPES_STARTGAME.ENEMYFIRST) { ArtificialIntelligence.swapEnemyCards(true); }
            const showBox = game.add.tween(boxPtr);
                showBox.to( { alpha : 1.0 }, 1000, "Sine", true, 500);
            
            const showBackground = game.add.tween(background);
                showBackground.to( { alpha : 1.0 }, 1000, "Sine", true, 500);
                showBackground.onComplete.addOnce( function() { 
                    game.tweens.removeFrom(boxPtr.scale);
                    game.tweens.removeFrom(boxPtr);
                    game.tweens.removeFrom(background);
                    
                    const hideTween_BackgroundAlpha = game.add.tween(background);
                        hideTween_BackgroundAlpha.to( { alpha: 0.0 }, 1000, "Sine", true, 2000);
                        hideTween_BackgroundAlpha.onComplete.addOnce( function() { 
                                background.destroy(true);
                                CoreMechanics.PreGameFlowHandler.postActionCheck();
                    }, this, 5);
                    
                    const hideTween_Scale = game.add.tween(boxPtr.scale);
                        hideTween_Scale.to( { x: 0.6, y: 0.6 }, 1000, "Sine", true, 2000);  
                       
                    const hideTween_Movement = game.add.tween(boxPtr);
                        hideTween_Movement.to( { x: 20, y: 20 }, 1000, "Sine", true, 2000);

                }, this, 5 );
            this.messagePtr = boxPtr;
        },
        hideMessage: function() {
            const messagePtr = this.messagePtr;
            
            const hideTween_Alpha = game.add.tween(messagePtr);
                  hideTween_Alpha.to( { alpha: 0.0 }, 1000, "Sine", true, 100);
                  hideTween_Alpha.onComplete.addOnce( function() { 
                                messagePtr.destroy(true);
                  }, this, 5);
        }
    },
    
    PopupHandler: { 
        reset: function() {
            this.popupShadow = null;
            this.isPopupShowed = false;
        },
        
        popupShadow: null,
        isPopupShowed: false,
        
        show: function(popupData) { 
            CoreMechanics.PauseHandler.popupPause = true;
            CoreMechanics.PauseHandler.invoke();
            
            if(!this.isPopupShowed)
            {
                
                let newPopupShadow = game.add.graphics();
                    newPopupShadow.beginFill(0x000000, 0.3);
                    newPopupShadow.drawRect(0, 0, 1000, 1000);
                    newPopupShadow.endFill();
                    newPopupShadow.alpha = 0;
                    newPopupShadow.inputEnabled = true;
                    newPopupShadow.input.priorityID = 5;
                        
                this.popupShadow = newPopupShadow;
                    
                    let PopupDimensions = { x: 500, y: 500, width: 400, height: 300, offset: 15};
                    
                    let boxPtr = game.add.graphics(PopupDimensions.x - (PopupDimensions.width/2), PopupDimensions.y - (PopupDimensions.height/2));
                        visualMechanics.hud.createBox(boxPtr, PopupDimensions.width, PopupDimensions.height);
                    newPopupShadow.addChild(boxPtr);
                    
                    
                        let mainLabel = game.add.text(0, 0, popupData[0],
                                            {font: '30px '+CONFIG.globalFont, fill: '#cccccc', 
                                            align: "center", boundsAlignH: 'center', boundsAlignV: 'middle',
                                            wordWrap: true, wordWrapWidth: PopupDimensions.width-10});
                        mainLabel.setTextBounds(PopupDimensions.offset, PopupDimensions.offset, PopupDimensions.width-(PopupDimensions.offset*2), PopupDimensions.height-50-(PopupDimensions.offset*2));
                        
                    boxPtr.addChild(mainLabel);
                        
                        
                        let ButtonDimensions = {x: 0, y: 0, width: 170, height: 50};
                        if(popupData.length == 5)
                        {
                            ButtonDimensions.x = PopupDimensions.width/4 - ButtonDimensions.width/2;
                            ButtonDimensions.y = PopupDimensions.height - ButtonDimensions.height - PopupDimensions.offset;
                        }
                        else if(popupData.length == 3)
                        {
                            ButtonDimensions.x = PopupDimensions.width/2 - ButtonDimensions.width/2;
                            ButtonDimensions.y = PopupDimensions.height - ButtonDimensions.height - PopupDimensions.offset;
                        }
                        
                        for(let i=1; i < popupData.length; i=i+2)
                        {
                            let popupButton_MainStyle = {font: '30px '+CONFIG.globalFont, fill: '#cccccc'};
                            let popupButton_HoverStyle = {font: '32px '+CONFIG.globalFont, fill: '#ffffff'};
                            
                            let popupButtonFrame = game.add.graphics(ButtonDimensions.x, ButtonDimensions.y);
                                visualMechanics.hud.createBox(popupButtonFrame, ButtonDimensions.width, ButtonDimensions.height);
                        boxPtr.addChild(popupButtonFrame);
                            
                                let popupButton = visualMechanics.hud.buttonHandling.create({x: ButtonDimensions.width/2, y: ButtonDimensions.height/2}, popupData[i], 
                                                                                popupButton_MainStyle, popupButton_HoverStyle, popupData[(i+1)]);
                                    popupButton.input.priorityID = 5;
                                                
                            popupButtonFrame.addChild(popupButton);
    
                            ButtonDimensions.x += 200;
                        }
                    
                    this.isPopupShowed = true;
                    
                    let showTween = game.add.tween(newPopupShadow);
                        showTween.to( { alpha : 1.0 }, 1000, "Sine", true, 100);
            }
        },
        close: function() {
            
            let hideTween = game.add.tween(visualMechanics.PopupHandler.popupShadow);
                hideTween.to( { alpha : 0.0 }, 1000, "Sine", true, 100);
                hideTween.onComplete.addOnce( function() { 
                        visualMechanics.PopupHandler.popupShadow.destroy(true);
                        
                        visualMechanics.PopupHandler.isPopupShowed = false;
                        CoreMechanics.PauseHandler.popupPause = false; 
                        
                        if(CoreMechanics.GameControlHandler.isGameFinished)
                        {
                            CoreMechanics.PauseHandler.invoke(null, null, true);
                            return;
                        }
                        if(CoreMechanics.GameControlHandler.isGameLaunched)
                        {
                            CoreMechanics.PauseHandler.invoke();
                            return;
                        }
                    }, this, 5);
        },
    },
    
    StageHandler: {
        reset: function() {
            this.isStageHighlighted = false;
            this.isDrawbackSpotCreated = false;
        },
        boot: function() { 
            this.group_mapHighlight = game.add.group();
        },
        spotsStageData: { start: {x: 155, y: 345}, interval: {x: (57+20), y: (76+20)} },
        
        group_mapHighlight: null,
        
        isStageHighlighted: false,
        isDrawbackSpotCreated: false,
        
        highlightStage: function() {
        let traceEnabled = false;
            this.clearStageHighlight();
         
            let performHightlight = false;
            let performDrawbackSpotHighlight = false;
            let selectedCardPtr = CardsMechanics.selectedCard;
            if(!CoreMechanics.GameControlHandler.isGameLaunched && selectedCardPtr)
            {
                if(selectedCardPtr.parent == CardsMechanics.Decks.group_playerDeck)
                {   
                    if(CoreMechanics.PreGameFlowHandler.isPlayerTurn || gameStateAnyLevel.starttype != CONSTS.TYPES_STARTGAME.SAMETIME)
                    {
                        if(traceEnabled) { console.log("[highlightStage] - trace1 - PreGame - stage unclocked for player deck"); }
                        performHightlight = true;
                    }
                }
                else 
                    if(selectedCardPtr.parent == CardsMechanics.Decks.group_stageCards)
                    {
                        if(selectedCardPtr.control == CONSTS.TYPES_CARDCONTROL.PLAYER)
                        {
                            if(gameStateAnyLevel.starttype == CONSTS.TYPES_STARTGAME.PLAYERFIRST) {
                                if(traceEnabled) { console.log("[highlightStage] - trace1 - PreGame - PLAYERFIRST type - stage fully unclocked"); }
                                performHightlight = true;
                                performDrawbackSpotHighlight = true;
                            }
                        }
                    }
            }
            else { if(traceEnabled) { console.log("[highlightStage] - trace1 - Game is running or no card is selected!"); } }
            
            if(performHightlight)
            {
                if(!visualMechanics.StageHandler.isStageHighlighted)
                {
                    for (let i = 0; i < 6; i++) 
                    {
                        for (let j = 0; j < 10; j++) 
                        {
                            if(CoreMechanics.MapHandler.mapData[i][j] == CONSTS.TYPES_MAPSPOTS.FREE)
                            {
                                let newSpot = visualMechanics.StageHandler.group_mapHighlight.create( visualMechanics.StageHandler.spotsStageData.start.x + (j * visualMechanics.StageHandler.spotsStageData.interval.x), 
                                                                                visualMechanics.StageHandler.spotsStageData.start.y + (i * visualMechanics.StageHandler.spotsStageData.interval.y),  
                                                                                'spotHighlight');
                                    newSpot.anchor.setTo(0.5);
                                    newSpot.alpha = 0.4;
                                    newSpot.i = i;
                                    newSpot.j = j;
                                        
                                if(i < 3) 
                                { 
                                    newSpot.alpha = 0.05; 
                                }
                                else 
                                {
                                    newSpot.inputEnabled = true;
                                    newSpot.input.useHandCursor = true;
                                    newSpot.events.onInputOver.add( function(invokerPtr, inputerPtr) { invokerPtr.scale.setTo(1.1); }, this);
                                    newSpot.events.onInputOut.add( function(invokerPtr, inputerPtr) { invokerPtr.scale.setTo(1.0); }, this);
                                    newSpot.events.onInputDown.add(visualMechanics.StageHandler.putCardIntoStage, this);
                                }
                            }
                        }
                    }
                    visualMechanics.StageHandler.isStageHighlighted = true;
                    if(traceEnabled) { console.log("[highlightStage] - trace1 - Stage highlighted"); } 
                }
            }
            else { if(traceEnabled) { console.log("[highlightStage] - trace1 - Highlight aborted"); } }
            
            if(performDrawbackSpotHighlight)
            {
                if(!visualMechanics.StageHandler.isDrawbackSpotCreated)
                {
                    let playerDeckPtr = CardsMechanics.Decks.group_playerDeck;
                    let total_x = ((playerDeckPtr.length-1) * 100) + ((playerDeckPtr.length-1) * 10);
                                    
                    let newSpot = visualMechanics.StageHandler.group_mapHighlight.create( (500-(total_x/2)+playerDeckPtr.length*110), 940, 'spotHighlight');
                        newSpot.anchor.setTo(0.5);
                        newSpot.alpha = 0.4;
                        newSpot.inputEnabled = true;
                        newSpot.input.useHandCursor = true;
                        newSpot.events.onInputOver.add( function(invokerPtr, inputerPtr) { invokerPtr.scale.setTo(1.1); }, this);
                        newSpot.events.onInputOut.add( function(invokerPtr, inputerPtr) { invokerPtr.scale.setTo(1.0); }, this);
                        newSpot.events.onInputDown.add(visualMechanics.StageHandler.drawbackCardFromStage, this);
                                
                    visualMechanics.StageHandler.isDrawbackSpotCreated = true;
                    if(traceEnabled) { console.log("[highlightStage] - trace1 - drawbackSpot highlighted"); } 
                }
            }
            else { if(traceEnabled) { console.log("[highlightStage] - trace1 - drawbackSpot Highlight aborted"); } }
        },
        clearStageHighlight: function() {
            if(visualMechanics.StageHandler.isStageHighlighted)
            {
                visualMechanics.StageHandler.group_mapHighlight.destroy(true, true);
                
                visualMechanics.StageHandler.isStageHighlighted = false;
                visualMechanics.StageHandler.isDrawbackSpotCreated = false;
            }
        },
        
        getStageSpot: function(given_i,given_j) {
            let spot = {
                x: (visualMechanics.StageHandler.spotsStageData.start.x + (given_j * visualMechanics.StageHandler.spotsStageData.interval.x)),
                y: (visualMechanics.StageHandler.spotsStageData.start.y + (given_i * visualMechanics.StageHandler.spotsStageData.interval.y)),
                i: given_i,
                j: given_j };
                
            return spot;
        },
        getCardInSpot: function(givenSpot) {
            for(let i=(CardsMechanics.Decks.group_stageCards.length-1); i >= 0; i--)
            {
                let item = CardsMechanics.Decks.group_stageCards.getChildAt(i);
                if( (item.i == givenSpot.i) && (item.j == givenSpot.j))
                {
                    return item;
                }
            }
            return null;
        },
        
        putCardIntoStage: function(targetSpot, dummy, cardPtr) {
            cardPtr = cardPtr || CardsMechanics.selectedCard;
            if(cardPtr != null)
            {
                CardsMechanics.Decks.group_stageCards.add(cardPtr);
                CardsMechanics.moveCard(cardPtr, targetSpot);
                
                cardPtr.scale.setTo(0.55);
                
                CoreMechanics.GameFlowHandler.updateCardNextMove(cardPtr); 
                
                cardPtr.input.useHandCursor = true;
                cardPtr.events.onInputDown.active = true;
                cardPtr.events.onInputOver.active = true;
                cardPtr.events.onInputOut.active = true;
                cardPtr.events.onInputOver.removeAll();
                cardPtr.events.onInputOut.removeAll();
                cardPtr.events.onInputOver.add( function(invokerPtr, inputerPtr) { invokerPtr.scale.setTo(0.60); }, this);
                cardPtr.events.onInputOut.add( function(invokerPtr, inputerPtr) { invokerPtr.scale.setTo(0.55); }, this);
                
                visualMechanics.hud.updateCardsPosistionInPlayerDeck();
                visualMechanics.hud.updateCardsPosistionInEnemyDeck();
                
                CoreMechanics.PreGameFlowHandler.changeTurn();
            }
        },
        drawbackCardFromStage: function() {
            let updatedCard = CardsMechanics.selectedCard;
            if(!CoreMechanics.GameControlHandler.isGameLaunched && (updatedCard != null))
            {
                updatedCard.scale.setTo(0.65);
                 
                if(updatedCard.i || updatedCard.j) { CoreMechanics.MapHandler.mapData[updatedCard.i][updatedCard.j] = CONSTS.TYPES_MAPSPOTS.FREE; }
                updatedCard.i = null;
                updatedCard.j = null;
                
                visualMechanics.hud.TimeBarHandler.removeCard(updatedCard);
                
                CardsMechanics.Decks.group_playerDeck.add(updatedCard);
                visualMechanics.hud.updateCardsPosistionInPlayerDeck();
                visualMechanics.StageHandler.highlightStage();
                CardsMechanics.showCardRange();
                
                CoreMechanics.PreGameFlowHandler.changeTurn();
            }
        }
    },

    CardControlUI: {
        group_cardControlUI: null,
        
        init: function() {
            this.group_cardControlUI = game.add.group();
        },
        showControls: function(controlingCardPtr) {
            let imageKey;
            if(controlingCardPtr.type == CONSTS.TYPES_CARDTYPE.OBJECT) { imageKey = ''; }
            if(controlingCardPtr.type == CONSTS.TYPES_CARDTYPE.MELEE)  { imageKey = 'icon_meleeAttack'; }
            if(controlingCardPtr.type == CONSTS.TYPES_CARDTYPE.RANGED) { imageKey = 'icon_rangedAttack'; }
            
            let availActions = ArtificialIntelligence.getAvailActions(controlingCardPtr);
            
            if((availActions.attackableCards.length == 0) && (availActions.moveableSpots.length == 0))
            {
                CoreMechanics.GameFlowHandler.doUserAction(null, null, ["stuck", controlingCardPtr, null]);
                return;
            }
            
            CardsMechanics.focusCard(controlingCardPtr);
            
                this.createControl(controlingCardPtr, 'icon_skipTurn', ["wait", controlingCardPtr, null]);
                
            availActions.attackableCards.forEach( (attackableCardPtr) => {
                this.createControl(attackableCardPtr, imageKey, ["Attack", controlingCardPtr, attackableCardPtr]);
            });
                
            availActions.moveableSpots.forEach( function(moveableSpotPtr, index) {
                    
                    let newSpot = visualMechanics.CardControlUI.group_cardControlUI.create( visualMechanics.StageHandler.spotsStageData.start.x + (moveableSpotPtr.j * visualMechanics.StageHandler.spotsStageData.interval.x), 
                                                                                            visualMechanics.StageHandler.spotsStageData.start.y + (moveableSpotPtr.i * visualMechanics.StageHandler.spotsStageData.interval.y),  
                                                                                            'spotHighlight');                        
                        newSpot.anchor.setTo(0.5);
                        newSpot.alpha = 0;
                        
                        newSpot.inputEnabled = true;
                        newSpot.input.useHandCursor = true;
                        newSpot.input.priorityID = 4;
                        newSpot.events.onInputOver.add( function(invokerPtr, inputerPtr) { invokerPtr.scale.setTo(1.1); }, this);
                        newSpot.events.onInputOut.add( function(invokerPtr, inputerPtr) { invokerPtr.scale.setTo(1.0); }, this);
                        newSpot.events.onInputDown.add(CoreMechanics.GameFlowHandler.doUserAction, this, 2, ["Movement", controlingCardPtr, moveableSpotPtr]);
                        newSpot.events.onInputOver.active = false;
                        newSpot.events.onInputOut.active = false;
                        newSpot.events.onInputDown.active = false;
                        
                        let showTweenAlpha = game.add.tween(newSpot);
                            showTweenAlpha.to( { alpha: 0.4 }, 250, "Sine", true, 100);
                            showTweenAlpha.onComplete.add( 
                                function() 
                                { 
                                    newSpot.events.onInputOver.active = true;
                                    newSpot.events.onInputOut.active = true;
                                    newSpot.events.onInputDown.active = true;
                                });
                });
        },
        createControl: function(cardToCreateControlTo, iconKey, argsForOnDownFnc) {
            const newControl = game.add.graphics( cardToCreateControlTo.x, cardToCreateControlTo.y+(cardToCreateControlTo.height/2)-5, this.group_cardControlUI);
                    newControl.beginFill(0x000000, 0.4);
                    newControl.drawRect(-25, -25, 50, 50);
                    newControl.endFill();
                        
                    newControl.alpha = 0;
                    newControl.scale.setTo(0.85);
                    newControl.inputEnabled = true;
                    newControl.input.useHandCursor = true;
                    newControl.input.priorityID = 4;
                    newControl.events.onInputOver.add( function(invokerPtr, inputerPtr) { invokerPtr.scale.setTo(1.0); }, this);
                    newControl.events.onInputOut.add( function(invokerPtr, inputerPtr) { invokerPtr.scale.setTo(0.85); }, this);
                    newControl.events.onInputDown.add(CoreMechanics.GameFlowHandler.doUserAction, this, 2, argsForOnDownFnc);
                    newControl.events.onInputOver.active = false;
                    newControl.events.onInputOut.active = false;
                    newControl.events.onInputDown.active = false;
                
                    const newControlIcon = game.add.sprite( 0, 0, iconKey);
                          newControlIcon.anchor.setTo(0.5);
                        
                    newControl.addChild(newControlIcon);
                        
              const showTweenAlpha = game.add.tween(newControl);
                    showTweenAlpha.to( { alpha: 0.95 }, 250, "Sine", true, 100);
                    showTweenAlpha.onComplete.add( function() { 
                        newControl.events.onInputOver.active = true;
                        newControl.events.onInputOut.active = true;
                        newControl.events.onInputDown.active = true;
                    });
        },
        hideControls: function() {
            CardsMechanics.focusCard();
            
            this.group_cardControlUI.forEach( function(controlPtr) {
                controlPtr.events.onInputOver.active = false;
                controlPtr.events.onInputOut.active = false;
                controlPtr.events.onInputDown.active = false;
                    
                const showTweenAlpha = game.add.tween(controlPtr);
                    showTweenAlpha.to( { alpha: 0.0 }, 250, "Sine", true, 0);
                    showTweenAlpha.onComplete.add( function() { controlPtr.destroy(true); });
            });
        }
    },
    
};


var CoreMechanics = {
    reset: function() {
        this.MapHandler.reset();
        this.GameSpeedHandler.reset();
        this.PauseHandler.reset();
        this.AutoFightHandler.reset();
        this.PreGameFlowHandler.reset();
        this.GameFlowHandler.reset();
        this.GameControlHandler.reset();
    },
    
    MapHandler: {
        reset: function() {
            this.mapData = null;
        },
        mapData: null,
        
        group_mapObjects: null,
        
        init: function(level) {
        
            this.group_mapObjects = game.add.group();
        
            this.mapData = new Array(6);
            for (let i = 0; i < 6; i++) {
                this.mapData[i] = new Array(10);
            }
            
            for (let i = 0; i < 6; i++) {
                for (let j = 0; j < 10; j++) {
                    
                    if(level == 0)
                    {
                        this.mapData[i][j] = CONSTS.TYPES_MAPSPOTS.FREE;
                        
                        let spawnPercent = 5;
                        if(i == 0 || i == 5 || j == 0 || j == 9) { spawnPercent = 40; }
                        if(Phaser.Utils.chanceRoll(spawnPercent)) 
                        {
                            let newMapSpotID = Phaser.Math.between(10, 13); //10-13 CONSTS.TYPES_MAPSPOTS.(objects)
                            this.mapData[i][j] = newMapSpotID;
                        }
                    }
                    else 
                    {
                        this.mapData[i][j] = levelsData[level].mapData[i][j];
                    }
                        
                    if(this.mapData[i][j] >= 10)
                    {
                        
                        let varX = Phaser.Math.between(-2, 2);
                        let varY = Phaser.Math.between(-2, 2);
                        let mapObjectId = this.mapData[i][j]-10;
                        let spriteKey = mapObjects[mapObjectId].filename;
                                    
                        let newMapObject = this.group_mapObjects.create(  visualMechanics.StageHandler.spotsStageData.start.x + (j * visualMechanics.StageHandler.spotsStageData.interval.x) + varX, 
                                                                    visualMechanics.StageHandler.spotsStageData.start.y + (i * visualMechanics.StageHandler.spotsStageData.interval.y) + varY,  
                                                                    spriteKey);
                            newMapObject.anchor.setTo(0.5);
                            newMapObject.scale.setTo( 1 );
                    }
                }
            }
        CardsMechanics.cardRangeGraphics = game.add.graphics();
        }
    },
    
    GameSpeedHandler: {
        reset: function() {
            this.speedLvl = null;
            this.mainDelay = null;
        },
        speedLvl: null,
        mainDelay: null,
        
        init: function() {
            this.changeSpeed(visualMechanics.hud.speedHud.getChildAt(CONSTS.DATA_GAMESPEEDS.NORMAL.id), null, CONSTS.DATA_GAMESPEEDS.NORMAL);
        },
        changeSpeed: function(invokerObj, dummy, newSpeedObj) {
            if(CoreMechanics.GameSpeedHandler.speedLvl != newSpeedObj.id)
            {
                CoreMechanics.GameSpeedHandler.speedLvl = newSpeedObj.id;
                CoreMechanics.GameSpeedHandler.mainDelay = newSpeedObj.delay;
                
                visualMechanics.hud.buttonHandling.setOff(visualMechanics.hud.speedHud.getChildAt(0), {font: '30px '+CONFIG.globalFont, fill: '#cccccc'});
                visualMechanics.hud.buttonHandling.setOff(visualMechanics.hud.speedHud.getChildAt(1), {font: '30px '+CONFIG.globalFont, fill: '#cccccc'});
                visualMechanics.hud.buttonHandling.setOff(visualMechanics.hud.speedHud.getChildAt(2), {font: '30px '+CONFIG.globalFont, fill: '#cccccc'});
 
                visualMechanics.hud.buttonHandling.setOn(invokerObj, {font: '40px '+CONFIG.globalFont, fill: '#ffffff'});
           }
        },
    },
    
    PauseHandler: {
        reset: function() {
            this.userPause = false;
            this.popupPause = false;
        },
        userPause: false,
        popupPause: false,
        
        invoke: function(dummy1, dummy2, userPauseFlag) {
            userPauseFlag = userPauseFlag || false;
            
            if(CoreMechanics.GameControlHandler.isGameLaunched)
            {
                if(userPauseFlag) 
                { 
                    CoreMechanics.PauseHandler.userPause = !CoreMechanics.PauseHandler.userPause;
                    if(CoreMechanics.PauseHandler.userPause)
                    {
                        visualMechanics.hud.speedHud.getChildAt(3).setText("unpause");
                    }
                    else
                    {
                        visualMechanics.hud.speedHud.getChildAt(3).setText("pause");
                    }
                }
                
                if(CoreMechanics.PauseHandler.checkPauses())
                {
                    CoreMechanics.PauseHandler.perform(CONSTS.TYPES_PERFORMPAUSE.PAUSE);
                    return;                    
                }
                
                if(CoreMechanics.GameFlowHandler.mainTimer.paused)
                {
                    //console.log("System unpause");
                    CoreMechanics.PauseHandler.perform(CONSTS.TYPES_PERFORMPAUSE.UNPAUSE);
                }
                else
                {
                    //console.log("System pause");
                    CoreMechanics.PauseHandler.perform(CONSTS.TYPES_PERFORMPAUSE.PAUSE);
                }
            }
        }, 
        perform: function(action) {
            if(action == CONSTS.TYPES_PERFORMPAUSE.UNPAUSE)
            {
                CoreMechanics.GameFlowHandler.mainTimer.resume();    
            }
            else if(action == CONSTS.TYPES_PERFORMPAUSE.PAUSE)
            {
                CoreMechanics.GameFlowHandler.mainTimer.pause();
            }
            //console.log("Timer paused: "+CoreMechanics.GameFlowHandler.mainTimer.paused);
            visualMechanics.hud.visualPause();
        },
        checkPauses: function() {
            if(CoreMechanics.PauseHandler.popupPause || CoreMechanics.PauseHandler.userPause)
                return true;
            else
                return false;
        }
    },
    
    AutoFightHandler: { 
        reset: function() {
            this.autoFightEnabled =  false;
        },
        autoFightEnabled: false,
        
        isAutoFightEnabled: function() {
            return this.autoFightEnabled;
        },
        change: function() {
            if(CoreMechanics.AutoFightHandler.isAutoFightEnabled())
            {
                CoreMechanics.AutoFightHandler.setOff();
            }
            else
            {
                CoreMechanics.AutoFightHandler.setOn();
            }
        },
        setOn: function() {
            visualMechanics.CardControlUI.hideControls();
            this.autoFightEnabled = true;
            visualMechanics.hud.button_AutoFight.getChildAt(0).setText("On");
            CoreMechanics.GameFlowHandler.checkAction();
        },
        setOff: function() {
            this.autoFightEnabled = false;
            visualMechanics.hud.button_AutoFight.getChildAt(0).setText("Off");
        }
    },
    
    PreGameFlowHandler: {
        reset: function() {
            this.isPlayerTurn = null;
        },
        isPlayerTurn: null,
    
        postActionCheck: function() {
        //console.log("[postActionCheck] - trace1 - fnc invoked - starting"); 
        
            if( (gameStateAnyLevel.starttype == CONSTS.TYPES_STARTGAME.PLAYERFIRST || gameStateAnyLevel.starttype == CONSTS.TYPES_STARTGAME.ENEMYFIRST) && CardsMechanics.Decks.group_playerDeck.length == 0)
            {
                let startY = 510;
                if(gameStateAnyLevel.starttype == CONSTS.TYPES_STARTGAME.PLAYERFIRST) { startY = 460; }
                visualMechanics.hud.showTween(visualMechanics.hud.button_Start, {x: visualMechanics.hud.button_Start.x, y: startY}, 200);
            }
            else
            {
                if(gameStateAnyLevel.starttype == CONSTS.TYPES_STARTGAME.SAMETIME && CardsMechanics.Decks.group_enemyDeck.length == 0 && CardsMechanics.Decks.group_playerDeck.length == 0) 
                {
                    let startY = 510;
                    if(gameStateAnyLevel.starttype == CONSTS.TYPES_STARTGAME.PLAYERFIRST) { startY = 460; }
                    visualMechanics.hud.showTween(visualMechanics.hud.button_Start, {x: visualMechanics.hud.button_Start.x, y: startY}, 200);
                }
                else
                {
                    visualMechanics.hud.hideTween(visualMechanics.hud.button_Start, {x: visualMechanics.hud.button_Start.x, y: 1100}, 200);
                }
            }
            
            if(gameStateAnyLevel.starttype == CONSTS.TYPES_STARTGAME.SAMETIME) {
                if(!this.isPlayerTurn)
                {
                    if(CardsMechanics.Decks.group_enemyDeck.length != 0)
                    {
                        let delayTimer = game.time.create(true);
                            delayTimer.add(600, ArtificialIntelligence.swapEnemyCards, this);
                            delayTimer.start();
                    }
                    else
                    {
                        this.changeTurn();
                    }
                }
                else
                {
                    if(CardsMechanics.Decks.group_playerDeck.length == 0 && CardsMechanics.Decks.group_enemyDeck.length != 0)
                    {
                        this.changeTurn();
                    }
                }
            }
        },
        changeTurn: function() {
            if(gameStateAnyLevel.starttype == CONSTS.TYPES_STARTGAME.SAMETIME)
            {
                this.isPlayerTurn = !this.isPlayerTurn;
                visualMechanics.StageHandler.highlightStage();
                //console.log("[changeTurn] - trace1 - isPlayerTurn: "+this.isPlayerTurn);
            }
            this.postActionCheck();
        }
    },
    
    GameFlowHandler: {
        reset: function() { 
            this.preActionDelayTimer = null;
            this.postActionDelayTimer = null;
            this.gameTick = 0;
        },
        preActionDelayTimer: null,
        postActionDelayTimer: null,
        gameTick: 0,
        
        mainTimer: null,
        
        updateGameTick: function() {
        let traceEnabled = false;
            
            CoreMechanics.GameFlowHandler.mainTimer.pause();
            
            CardsMechanics.Decks.group_stageCards.customSort( function(a, b) {return a.nextMove - b.nextMove}, this);
            
            CoreMechanics.GameFlowHandler.gameTick = CardsMechanics.Decks.group_stageCards.getChildAt(0).nextMove;
    
            if(traceEnabled) { console.log("[updateGameTick] - trace1 - newGameTick: "+CoreMechanics.GameFlowHandler.gameTick); }
            
            CoreMechanics.GameFlowHandler.checkAction();
        },
        
        checkAction: function() {
        let traceEnabled = false;
            
            if(!CoreMechanics.PauseHandler.checkPauses())
            {
                if(CardsMechanics.Decks.group_stageCards.getChildAt(0).nextMove > CoreMechanics.GameFlowHandler.gameTick)
                {
                    if(traceEnabled) { console.log("[checkAction] - trace1 - resuming main loop"); }
                    CoreMechanics.PauseHandler.invoke();
                }
                else
                {
                    if(traceEnabled) { console.log("[checkAction] - trace1 - starting turn"); }
                    CoreMechanics.GameFlowHandler.startTurn();
                }
            }
        },
        startTurn: function() {
            if(this.preActionDelayTimer != null)
            {
                this.preActionDelayTimer.destroy();
            }
            let newPreActionDelayTimer = game.time.create(true);
                newPreActionDelayTimer.add(CoreMechanics.GameSpeedHandler.mainDelay, CoreMechanics.GameFlowHandler.selectAction, this);
                newPreActionDelayTimer.start();
            this.preActionDelayTimer = newPreActionDelayTimer;
        },
        selectAction: function() {
            if(!CoreMechanics.PauseHandler.checkPauses())
            {
                let cardToUpdate = CardsMechanics.Decks.group_stageCards.getChildAt(0);
                
                if(cardToUpdate != null)
                {
                    let endGameCheckResult = CoreMechanics.GameControlHandler.endGameCheck();
                    if(endGameCheckResult != 0)
                    {
                        CoreMechanics.GameControlHandler.isGameFinished = true;
                        MusicHandler.playSound(null, false, MusicHandler.SOUNDS_TYPES.HORN);
                        
                        if(endGameCheckResult == CONSTS.TYPES_ENDGAME.WIN)
                        {
                            CoreMechanics.GameControlHandler.gameWon();
                            return;
                        }
                        else 
                            if(endGameCheckResult == CONSTS.TYPES_ENDGAME.LOSE)
                            {
                                visualMechanics.PopupHandler.show(POPUPS.gameLost);
                                return;
                            }
                        else 
                            if(endGameCheckResult == CONSTS.TYPES_ENDGAME.DRAW)
                            {
                                visualMechanics.PopupHandler.show(POPUPS.gameDraw);
                                return;
                            }
                    }
                    
                    if(cardToUpdate.nextMove <= CoreMechanics.GameFlowHandler.gameTick)
                    {
                        if(!CoreMechanics.AutoFightHandler.isAutoFightEnabled() && (cardToUpdate.control == CONSTS.TYPES_CARDCONTROL.PLAYER)) 
                        {
                            visualMechanics.CardControlUI.showControls(cardToUpdate);
                            return;
                        }
                        else
                        {
                            ArtificialIntelligence.performAction(cardToUpdate);
                        }
                    }
                    CoreMechanics.GameFlowHandler.updateCardNextMove(cardToUpdate);
                    CoreMechanics.GameFlowHandler.finishTurn();
                }
            }
        },
        doUserAction: function(invokerPtr, inputerPtr, dataArray) { 
            if(invokerPtr != null)
            {
                invokerPtr.events.onInputOver.active = false;
                invokerPtr.events.onInputOut.active = false;
                invokerPtr.events.onInputDown.active = false;
            }
            
            let actionType = dataArray[0];
            let updatedCardPtr = dataArray[1];
            let actionTargetPtr = dataArray[2];
            
            visualMechanics.CardControlUI.hideControls();
            
            if(actionType == "wait" || actionType == "stuck")
            {
                CardsMechanics.showHit(actionType, updatedCardPtr);
            }
            else if(actionType == "Attack")
            {
                CardsMechanics.attackCard(updatedCardPtr, actionTargetPtr);
            }
            else if(actionType == "Movement")
            {
                CardsMechanics.moveCard(updatedCardPtr, actionTargetPtr);
            }
            
            CoreMechanics.GameFlowHandler.updateCardNextMove(updatedCardPtr);
            CoreMechanics.GameFlowHandler.finishTurn();
        },
        
        updateCardNextMove: function(updatedCardPtr) {
        let traceEnabled = false;
            if(updatedCardPtr.nextMove <= CoreMechanics.GameFlowHandler.gameTick)
            {
                let nextMoveCandidate = CoreMechanics.GameFlowHandler.gameTick+(105-cardStats[updatedCardPtr.id].spd);
                
                let isCandidateCorrect;
                while(true)
                {
                    isCandidateCorrect = true;
                    for(let i=0; i < CardsMechanics.Decks.group_stageCards.length; i++)
                    {
                        let card = CardsMechanics.Decks.group_stageCards.getChildAt(i);
                        if(card.nextMove == nextMoveCandidate)
                        {
                            isCandidateCorrect = false;
                            break;
                        }
                    }
                    if(!isCandidateCorrect)
                    {
                        nextMoveCandidate++;
                    }
                    else
                    {
                        break;
                    }
                }
                updatedCardPtr.nextMove = nextMoveCandidate;
                if(traceEnabled) { console.log("[updateCardNextMove] - Current tick: "+CoreMechanics.GameFlowHandler.gameTick+", newNextMove is: "+updatedCardPtr.nextMove+", cardID: "+updatedCardPtr.id); }
                visualMechanics.hud.TimeBarHandler.update();
            }
            else
            {
                if(traceEnabled) {
                    console.log("[updateCardNextMove] - newNextMove skipped");
                    console.log("Current tick: "+CoreMechanics.GameFlowHandler.gameTick+", card.nextMove: "+updatedCardPtr.nextMove+", cardID: "+updatedCardPtr.id);
                }
            }
        },
        
        finishTurn: function() {
            if(this.postActionDelayTimer != null)
            {
                this.postActionDelayTimer.destroy();
            }
            let newPostActionDelayTimer = game.time.create(true);
                newPostActionDelayTimer.add(CoreMechanics.GameSpeedHandler.mainDelay, CoreMechanics.GameFlowHandler.checkAction, this);
                newPostActionDelayTimer.start();
            this.postActionDelayTimer = newPostActionDelayTimer;
        },
    },
    
    GameControlHandler: {
        reset: function() {
            this.isGameLaunched = false;
            this.isGameFinished = false;
        },
        
        isGameLaunched: false,
        isGameFinished: false,

        initGame: function() {
            
            CoreMechanics.GameFlowHandler.mainTimer = game.time.create(false);
            CoreMechanics.GameFlowHandler.mainTimer.loop(5, CoreMechanics.GameFlowHandler.updateGameTick, this);
            
            visualMechanics.hud.createMessage();
        },

        startGame: function() {
            if(!CoreMechanics.GameControlHandler.isGameLaunched)
            {
                if(CardsMechanics.Decks.group_playerDeck.length == 0)
                {
                    CoreMechanics.AutoFightHandler.setOff();
                    
                    CoreMechanics.GameControlHandler.isGameLaunched = true;
                    
                    MusicHandler.playSound(`sfx-battlestart01`);
                    MusicHandler.playSound(null, false, MusicHandler.SOUNDS_TYPES.HORN);
                    
                    MusicHandler.playSound(null, true, MusicHandler.SOUNDS_TYPES.COMBAT);
                    
                    
                    CoreMechanics.GameSpeedHandler.init();
                    
                    if(gameStateAnyLevel.starttype == CONSTS.TYPES_STARTGAME.PLAYERFIRST) { ArtificialIntelligence.swapEnemyCards(true); }
                    
                    visualMechanics.hud.hideTween(visualMechanics.hud.messagePtr, {x: visualMechanics.hud.messagePtr.x, y: -100}, 200);
                    visualMechanics.hud.hideTween(visualMechanics.hud.button_Start, {x: visualMechanics.hud.button_Start.x, y: 1100}, 200);
                    visualMechanics.hud.showTween(visualMechanics.hud.speedHud, {x: visualMechanics.hud.speedHud.x, y: 910}, 200);
                    visualMechanics.hud.showTween(visualMechanics.hud.button_AutoFight, {x: visualMechanics.hud.button_AutoFight.x, y: 910}, 200);
                    visualMechanics.StageHandler.clearStageHighlight();
                    
                    CoreMechanics.GameFlowHandler.mainTimer.start();
                }
                else 
                { 
                    visualMechanics.PopupHandler.show(POPUPS.cantStart);
                }
            }
        },
        
        nextGame: function() {
            if(gameStateAnyLevel.level != 0)
            {
                if(gameStateAnyLevel.level != CONSTS.LASTLEVEL)
                {
                    changeState('someLevel', gameStateAnyLevel.level+1);
                }
                else
                {
                    //t0d0 -> showLastCampainCutscene
                    CoreMechanics.GameControlHandler.exitGame();
                }
            }
            else
            {
                CoreMechanics.GameControlHandler.exitGame();
            }
        },
        exitGame: function() {
            changeState('mainMenu');
        },
        
        gameWon: function() { 
            if(gameStateAnyLevel.level != 0)
            {
                if(LocalStorageHandler.get(LocalStorageHandler.PROPERTIES.UNLOCKED_CAMPAIN_LVL) == gameStateAnyLevel.level && gameStateAnyLevel.level != CONSTS.LASTLEVEL)
                {
                    LocalStorageHandler.set(LocalStorageHandler.PROPERTIES.UNLOCKED_CAMPAIN_LVL, gameStateAnyLevel.level+1);
                }
            }
            visualMechanics.PopupHandler.show(POPUPS.gameWon);
        },
        restartGame: function() {
            if(gameStateAnyLevel.level != 0)
            {
                changeState('someLevel', gameStateAnyLevel.level);
            }
            else
            {
                //save gameType, map and start cards
                changeState('someLevel', gameStateAnyLevel.level);
            }
        },
        
        endGameCheck: function() {
        const traceEnabled = false;    
            let playerCardsCount = 0;
            let enemyCardsCount = 0;
            
            let allCardsAreStuck = true;
            
            CardsMechanics.Decks.group_stageCards.forEach( function(cardPtr, cardIndex) {
                    if(cardPtr.control == CONSTS.TYPES_CARDCONTROL.PLAYER)
                    {
                        playerCardsCount++;
                    }
                    else if(cardPtr.control == CONSTS.TYPES_CARDCONTROL.ENEMY)
                    {
                        enemyCardsCount++;
                    }
                    
                    if(allCardsAreStuck)
                    {
                        if(ArtificialIntelligence.getAvailActions(cardPtr).attackableCards.length > 0)
                        {
                            allCardsAreStuck = false;
                        }
                        else
                        {
                            if(ArtificialIntelligence.routeFinder(cardPtr, true) != null)
                            {
                                allCardsAreStuck = false;
                            }
                        }
                    }
                });
            if(traceEnabled) { console.log("[endGameCheck] - trace1 - "+playerCardsCount+" "+enemyCardsCount+" "+allCardsAreStuck); }
            if(enemyCardsCount == 0) 
            { 
                return CONSTS.TYPES_ENDGAME.WIN; 
            }
            if(playerCardsCount == 0) 
            { 
                return CONSTS.TYPES_ENDGAME.LOSE; 
            }
            
            if(allCardsAreStuck)
            {
                if(playerCardsCount > enemyCardsCount)
                {
                    return CONSTS.TYPES_ENDGAME.WIN;
                }
                else 
                    if(playerCardsCount < enemyCardsCount)
                    {
                        return CONSTS.TYPES_ENDGAME.LOSE;
                    }
                else 
                    if(playerCardsCount == enemyCardsCount)
                    {
                        return CONSTS.TYPES_ENDGAME.DRAW;
                    }
            }
            
            return 0;
        },
    }
    
};


var ArtificialIntelligence = {
    
    swapEnemyCards: function(putAll) {
        //console.log("[swapEnemyCards] - trace1 - fnc invoked - starting");
        putAll = putAll || false;
        
        CardsMechanics.Decks.group_enemyDeck.sort('combatAtributesDef', Phaser.Group.SORT_ASCENDING);
        
        
        
        for(let i=(CardsMechanics.Decks.group_enemyDeck.length-1); i >= 0; i--)
        {
            let card = CardsMechanics.Decks.group_enemyDeck.getChildAt(i);
                card.loadTexture('card_image_'+card.id);
                    
            let isPutDone = ArtificialIntelligence.putEnemyCard(card);
            if(!isPutDone) { console.log("[swapEnemyCards] - traceError - put is not done "); }
            
            if(!putAll)
            {
                break;
            }
        }
    },
    putEnemyCard: function(item) {
        
        let meleeRow = 2;
        let rangedRow = 1;
        
            let targetPoint;
            if(item.type == CONSTS.TYPES_CARDTYPE.RANGED)
            {
                targetPoint = new Phaser.Point(rangedRow, Phaser.Math.between(4, 5));
            }
            if(item.type == CONSTS.TYPES_CARDTYPE.MELEE)
            {
                targetPoint = new Phaser.Point(meleeRow, Phaser.Math.between(4, 5));
            }
            let freeSpotFinder = 0;
            let checkLeftSide = false;
            let isDone = false;
            
            while(!isDone)
            {
                if(CoreMechanics.MapHandler.mapData[targetPoint.x][targetPoint.y+freeSpotFinder] == CONSTS.TYPES_MAPSPOTS.FREE)
                {
                    let isSpotGood = false;
                    if( item.type == CONSTS.TYPES_CARDTYPE.MELEE &&
                        (CoreMechanics.MapHandler.mapData[targetPoint.x+1][targetPoint.y+freeSpotFinder] == CONSTS.TYPES_MAPSPOTS.FREE ||
                         CoreMechanics.MapHandler.mapData[targetPoint.x+1][targetPoint.y+freeSpotFinder] == CONSTS.TYPES_MAPSPOTS.TAKEN) )
                    {
                        isSpotGood = true;
                    }
                    if( item.type == CONSTS.TYPES_CARDTYPE.RANGED &&
                        (CoreMechanics.MapHandler.mapData[targetPoint.x+2][targetPoint.y+freeSpotFinder] == CONSTS.TYPES_MAPSPOTS.FREE ||
                         CoreMechanics.MapHandler.mapData[targetPoint.x+2][targetPoint.y+freeSpotFinder] == CONSTS.TYPES_MAPSPOTS.TAKEN) )
                    {
                        isSpotGood = true;
                    }
                    
                    if(isSpotGood)
                    {
                        visualMechanics.StageHandler.putCardIntoStage(visualMechanics.StageHandler.getStageSpot(targetPoint.x, (targetPoint.y+freeSpotFinder)), null, item);
                        return true;
                    }
                }
                
                
                if(checkLeftSide)
                {
                    freeSpotFinder = freeSpotFinder * -1;
                    checkLeftSide  = false;
                }
                else
                {
                    freeSpotFinder = freeSpotFinder * -1;
                    freeSpotFinder = freeSpotFinder + 1;
                    checkLeftSide  = true;
                }
                    
                if(freeSpotFinder > 5) 
                {  
                    targetPoint.x--;
                    if(targetPoint.x < 0) { return false; }
                    freeSpotFinder = 0;
                    checkLeftSide  = false;
                }
            }
    },
    
    performAction: function(card) {
        let availActions = ArtificialIntelligence.getAvailActions(card);
        
        let attackableCards = availActions.attackableCards;
        let moveableSpots = availActions.moveableSpots;
        
        if(attackableCards.length > 0)
        {
            attackableCards.sort(function(a, b) {return a.currentHP - b.currentHP});
            CardsMechanics.attackCard(card, attackableCards[0]);
        }
        else
        {
            if(moveableSpots.length > 0)
            {
                    let firstMoveInFoundPath = ArtificialIntelligence.routeFinder(card);
                    if(firstMoveInFoundPath != null)
                    {
                        CardsMechanics.moveCard(card, visualMechanics.StageHandler.getStageSpot(firstMoveInFoundPath.i, firstMoveInFoundPath.j));
                    }
                    else
                    {
                        CardsMechanics.showHit("waiting", card);
                    }
            }
            else
            {
                CardsMechanics.showHit("stuck", card);
            }
        }
    },
    
    routeFinder: function(myCard, skipFriendMovement) {
    let traceEnabled = false;
        if(traceEnabled) { console.log("[routeFinder] - trace1 - fnc invoked "); }
        skipFriendMovement = skipFriendMovement || false;
        let checkedSpots = [];
        let oldPaths = [];
        let newPaths = [];
        
        let attackProspects = [];
        
                      let checkingSpot = { i: myCard.i, j: myCard.j, control: myCard.control, range: myCard.range };
        checkedSpots.push(checkingSpot);
        
        let availActions = ArtificialIntelligence.getAvailActions(checkingSpot);
        let moveableSpots = availActions.moveableSpots;
        
        let friendlyCardsOnPaths = [];
        if(!skipFriendMovement)
        {
            availActions.friendlyCards.forEach( function(newCandidate) {
                                      let newFriendlyCardObject = {card: newCandidate, route: [null]};
                friendlyCardsOnPaths.push(newFriendlyCardObject);
            });
            if(traceEnabled) { console.log( "[routeFinder] - trace1 - friendsCards array init! "+JSON.stringify(friendlyCardsOnPaths.length) ); }
        }
        
        for(let gotItemLoop=0; gotItemLoop < moveableSpots.length; gotItemLoop++)
        {
            let startPath = [];
            checkedSpots.push(moveableSpots[gotItemLoop]);
            startPath.push(moveableSpots[gotItemLoop]);
            oldPaths.push(startPath);
        }

        let distance = 0;
        while(true)
        {
            for(let currentPath = 0; currentPath < oldPaths.length; currentPath++)
            {
                checkingSpot.i = oldPaths[currentPath][distance].i;
                checkingSpot.j = oldPaths[currentPath][distance].j;
                
                let availActions = ArtificialIntelligence.getAvailActions(checkingSpot);
        
                let attackableCards = availActions.attackableCards;
                let moveableSpots = availActions.moveableSpots;
                let friendlyCards = availActions.friendlyCards;
                
                if(attackableCards.length > 0)
                {
                    let newAttackProspect = {route: oldPaths[currentPath], attackOptions: attackableCards.length };
                    attackProspects.push(newAttackProspect);
                    if(traceEnabled) { console.log( "[routeFinder] - trace1 - found route to attack! "+JSON.stringify(newAttackProspect) ); }
                }
                else
                {
                    if(friendlyCards.length > 0 && !skipFriendMovement)
                    {
                        friendlyCards.forEach( function(newCandidate) {
                            if( !(newCandidate.i == myCard.i && newCandidate.j == myCard.j) ) 
                            {
                                if(traceEnabled) { console.log( "[routeFinder] - trace1 - friend cards found on path! Id:"+newCandidate.id ); }
                                let isAlreadyInArray = false;
                                friendlyCardsOnPaths.forEach( function(item) {
                                    if(item.card == newCandidate) 
                                    { 
                                        isAlreadyInArray = true; 
                                        if(traceEnabled) { console.log( "[routeFinder] - trace1 - this friend card is already in array! " ); }
                                    }
                                });
                                
                                let newFriendlyCardObject = {card: newCandidate, route: oldPaths[currentPath]};
                                if(!isAlreadyInArray) { friendlyCardsOnPaths.push(newFriendlyCardObject); }
                            }
                        });
                    }
                    
                    if(moveableSpots.length > 0)
                    {
                        for(let gotItemLoop=0; gotItemLoop < moveableSpots.length; gotItemLoop++)
                        {
                            let addNewPath = true;
                            for(let alreadyInArrloop=0; alreadyInArrloop < checkedSpots.length; alreadyInArrloop++)
                            {
                                if(moveableSpots[gotItemLoop].i == checkedSpots[alreadyInArrloop].i && moveableSpots[gotItemLoop].j == checkedSpots[alreadyInArrloop].j)
                                {
                                    if(traceEnabled) { console.log("[routeFinder] - trace1 - this spot is already checked! "+JSON.stringify(moveableSpots[gotItemLoop])); }
                                    addNewPath = false;
                                    break;
                                }
                            }
                            
                            if(addNewPath)
                            {
                                checkedSpots.push(moveableSpots[gotItemLoop]);
                                
                                let pushNewPath = oldPaths[currentPath].concat( moveableSpots[gotItemLoop] );
                                newPaths.push(pushNewPath);
                                if(traceEnabled) { console.log("[routeFinder] - trace1 - new path found! "+JSON.stringify(pushNewPath)); }
                            }
                        }
                    }
                }
            }
            
            if(attackProspects.length > 0)
            {
                attackProspects.sort( function(a, b) { return a.attackOptions - b.attackOptions; } );
                if(traceEnabled) { console.log( "[routeFinder] - trace1 - returning route to attack! "+JSON.stringify(attackProspects[0].route[0]) ); }
                return attackProspects[0].route[0];
            }
            
            oldPaths = newPaths;
            newPaths = [];
            distance++;
            
            
            if(distance > 40 || (oldPaths.length == 0)) 
            { 
                if(traceEnabled) { console.log("[routeFinder] - trace1 - friendlyCardsOnPaths: "+JSON.stringify(friendlyCardsOnPaths.length)); }
                if(friendlyCardsOnPaths.length > 0)
                {
                    friendlyCardsOnPaths.sort( function(a, b) { return a.card.currentHP - b.card.currentHP; } );
                    if(traceEnabled) { console.log( "[routeFinder] - trace1 - returning route to lowest hp friendly card! "+JSON.stringify(friendlyCardsOnPaths[0].route[0]) ); }
                    return friendlyCardsOnPaths[0].route[0];
                }
                
                if(traceEnabled) { console.log("[routeFinder] - trace1 - nothing found! breaking main searching loop "); }
                break; 
            }
        }
        
    },
    
    getAvailActions: function(card) {
    let traceEnabled = false;
        if(traceEnabled) { console.log("[getAvailActions] - trace1 - fnc invoked "); }
        let checkSpot = { i: card.i, j: card.j };
        
        let attackableCards = [];
        let moveableSpots = [];
        let friendlyCards = [];
        let enemyControl;
        
        if(card.control == CONSTS.TYPES_CARDCONTROL.PLAYER) { enemyControl = CONSTS.TYPES_CARDCONTROL.ENEMY; }
        if(card.control == CONSTS.TYPES_CARDCONTROL.ENEMY) { enemyControl = CONSTS.TYPES_CARDCONTROL.PLAYER; }
        
        let longRangeChecks = [];

        let prepareNewRangeChecks = [];
            prepareNewRangeChecks.push(checkSpot);
        for(let distance=0; distance < card.range; distance++)
        {
            longRangeChecks = prepareNewRangeChecks.slice(0);
            prepareNewRangeChecks = [];
            
            while(longRangeChecks.length > 0)
            {
                checkSpot = longRangeChecks.shift();
                if(traceEnabled) { console.log("[getAvailActions] - trace1 - checkSpot: "+checkSpot.i+","+checkSpot.j); }
                for(let crossLoop=0; crossLoop < 4; crossLoop++)
                {
                        switch(crossLoop)
                        {
                            case 0:
                                checkSpot.i--;
                                if(checkSpot.i < 0) 
                                {
                                    if(traceEnabled) { console.log("[getAvailActions] - trace1 - Cant check - top border! spot: "+checkSpot.i+","+checkSpot.j); }
                                    continue;
                                }
                                break;
                                
                            case 1:
                                checkSpot.i++;
                                checkSpot.j--;
                                if(checkSpot.j < 0) 
                                {
                                    if(traceEnabled) { console.log("[getAvailActions] - trace1 - Cant check - west border! spot: "+checkSpot.i+","+checkSpot.j); }
                                    continue;
                                }
                                break;
                            
                            case 2:
                                checkSpot.j = checkSpot.j + 2;
                                if(checkSpot.j > 9) 
                                {
                                    if(traceEnabled) { console.log("[getAvailActions] - trace1 - Cant check - east border! spot: "+checkSpot.i+","+checkSpot.j); }
                                    continue;
                                }
                                break;
                            
                            case 3:
                                checkSpot.i++;
                                checkSpot.j--;
                                if(checkSpot.i > 5) 
                                {
                                    if(traceEnabled) { console.log("[getAvailActions] - trace1 - Cant check - south border! spot: "+checkSpot.i+","+checkSpot.j); }
                                    continue;
                                }
                                break;
                        }
                    if(checkSpot.j < 0 || checkSpot.i > 5 || checkSpot.j < 0 || checkSpot.j > 9) 
                    {
                        if(traceEnabled) { console.log("[getAvailActions] - trace1 - Cant check - out of map! spot: "+checkSpot.i+","+checkSpot.j); }
                        continue;
                    }
                    if(CoreMechanics.MapHandler.mapData[checkSpot.i][checkSpot.j] == CONSTS.TYPES_MAPSPOTS.TAKEN)
                    {
                        let checkCard = visualMechanics.StageHandler.getCardInSpot(checkSpot);
                        if(checkCard.control == enemyControl)
                        {
                            let isAlreadyInArray = false;
                            attackableCards.forEach( function(item, index) {
                                if(item == checkCard) { isAlreadyInArray = true; }
                            });
                            
                            if(!isAlreadyInArray) { attackableCards.push(checkCard); }
                        }
                        else
                        {
                            if(traceEnabled) { console.log("[getAvailActions] - trace1 - friend card check: "+checkCard.i+" vs "+card.i+" AND "+checkCard.j+" vs "+card.j); }
                            if(!(checkCard.i == card.i && checkCard.j == card.j)) 
                            {
                                let isAlreadyInArray = false;
                                friendlyCards.forEach( function(item, index) {
                                    if(item == checkCard) { isAlreadyInArray = true; }
                                });
                                
                                if(!isAlreadyInArray) { friendlyCards.push(checkCard); }
                            }
                        }
                    }
                    
                    if(distance == 0)
                    {
                        if(CoreMechanics.MapHandler.mapData[checkSpot.i][checkSpot.j] == CONSTS.TYPES_MAPSPOTS.FREE)
                        {
                            let freeSpot = visualMechanics.StageHandler.getStageSpot(checkSpot.i, checkSpot.j);
                            moveableSpots.push(freeSpot);
                        }
                    }
                    
                    let checkSpotCopy = { i: checkSpot.i, j: checkSpot.j };
                    prepareNewRangeChecks.push(checkSpotCopy);
                }
            }
        }
        let returnPackage = { attackableCards: attackableCards, moveableSpots: moveableSpots, friendlyCards: friendlyCards };
        if(traceEnabled) { 
            console.log("[getAvailActions] - trace1 - returnPackage:");
            console.log(returnPackage);
        }
        return returnPackage;
    },
};

function onDownFunction(arg) {
    console.log("BackstageClicked!");
    if(CardsMechanics.selectedCard) { CardsMechanics.unselectCard(); }
}