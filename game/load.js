/*global game*/

    WebFontConfig = { google: {families: [CONFIG.globalFont]} };

var loadState = {
    preload:function(){
        
        game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
        
        var loadingLabel = game.add.text(500, 500, 'loading 0 %', 
                            {font: '30px Courier', fill: '#ffffff'}); 
        loadingLabel.anchor.setTo(0.5);
        //  This sets a limit on the up-scale
        game.scale.maxWidth  = 2000;
        game.scale.maxHeight = 2000;
        game.scale.minWidth  = 300;
        game.scale.minHeight = 300;
        
        //  Then we tell Phaser that we want it to scale up to whatever the browser can handle, but to do it proportionally
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.refresh();
        game.scale.updateLayout();
        //game.scale.setScreenSize();
        
        game.load.onFileComplete.add( (progress) => {  
            loadingLabel.setText(`loading ${progress} %`);
        }, this);
        
        game.load.pack('songs', 'assets/assets-pack.json', null, this);
        game.load.pack('sounds', 'assets/assets-pack.json', null, this);

        game.load.pack('menu', 'assets/assets-pack.json', null, this);

        game.load.image('worksite',"assets/worksite.png");
        
        game.load.image('spotHighlight',"assets/spotHighlight.png");
        game.load.image('blooddrop',"assets/blooddrop.png");
        
        game.load.image('card_image_empty',"assets/anycard.png");
        game.load.image('card_image_1',"assets/card_image_1.png");
        game.load.image('card_image_2',"assets/card_image_2.png");
        game.load.image('card_image_3',"assets/card_image_3.png");
        game.load.image('card_image_4',"assets/card_image_4.png");
        game.load.image('card_image_5',"assets/card_image_5.png");
        game.load.image('card_image_6',"assets/card_image_6.png");
        game.load.image('card_image_7',"assets/card_image_7.png");
        game.load.image('card_image_8',"assets/card_image_8.png");
        game.load.image('card_image_9',"assets/card_image_9.png");
        
        game.load.image('icon_skipTurn',"assets/icon_skipTurn.png");
        game.load.image('icon_rangedAttack',"assets/icon_rangedAttack.png");
        game.load.image('icon_meleeAttack',"assets/icon_meleeAttack.png");
        
        game.load.image('mapObject_tree1',"assets/mapObject_tree1.png");
        //game.load.image('mapObject_tree2',"assets/mapObject_tree2.png");
        game.load.image('mapObject_water1',"assets/mapObject_water1.png");
        game.load.image('mapObject_mountain1',"assets/mapObject_mountain1.png");
        
        game.showDebug = LocalStorageHandler.get(LocalStorageHandler.PROPERTIES.SHOWDEBUG);
    },
    create:function(){
        
        MusicHandler.init();
        
        changeState('intro');
    }
};

var MusicHandler = {
    SOUNDS_TYPES: {
        SWORD:      {id: 0, keyString: `sword`,     totalSounds: 5},
        BOW:        {id: 1, keyString: `bow`,       totalSounds: 3},
        HORN:       {id: 2, keyString: `horn`,      totalSounds: 4},
        HIT:        {id: 3, keyString: `hit`,       totalSounds: 5},
        MISS:       {id: 4, keyString: `miss`,      totalSounds: 4}, 
        DEATH:      {id: 5, keyString: `death`,     totalSounds: 4},
        SELECT:     {id: 6, keyString: `select`,    totalSounds: 0},
        MOVEMENT:   {id: 7, keyString: `movement`,  totalSounds: 1},
        COMBAT:     {id: 8, keyString: `combat`,    totalSounds: 1},
        SURROUND:   {id: 9, keyString: `surround`,  totalSounds: 3}
    },
    
    MusicManager: null,
    SoundManager: null,
    
    playingSongInfo: { objectPtr: null, startTime: null }, 
    
    lastPlayedSong: null,
    loopedSounds: [],
    
    init: function() {
        this.SoundManager = new Phaser.SoundManager(game);
        this.SoundManager.volume = LocalStorageHandler.get(LocalStorageHandler.PROPERTIES.VOLUME_SOUND);
        this.SoundManager.onVolumeChange.add(   function(newVolume) {
                                                    LocalStorageHandler.set(LocalStorageHandler.PROPERTIES.VOLUME_SOUND, newVolume);
                                                    MenuHud.objects[4][1].getChildAt(1).text = newVolume;
                                                });
        
        this.MusicManager = new Phaser.SoundManager(game);
        this.MusicManager.volume = LocalStorageHandler.get(LocalStorageHandler.PROPERTIES.VOLUME_MUSIC);
        this.MusicManager.onVolumeChange.add(   function(newVolume) {  
                                                    if(MusicHandler.playingSongInfo.objectPtr != null)
                                                    {
                                                        MusicHandler.playingSongInfo.objectPtr.volume = newVolume;
                                                        LocalStorageHandler.set(LocalStorageHandler.PROPERTIES.VOLUME_MUSIC, newVolume);
                                                        MenuHud.objects[4][0].getChildAt(1).text = newVolume;
                                                    }
                                                });
    },
    
    playMusic: function(newSongKey) {
        if(newSongKey == null) {
            newSongKey = this.randomMusic();
        }
        
        if(this.playingSongInfo.objectPtr == null)
        {
            let MusicPtr = this.MusicManager.add(newSongKey, 0, true);
                MusicPtr.play();
                MusicPtr.fadeTo(2000, this.MusicManager.volume);
                
                MusicPtr.onFadeComplete.add( (MusicPtr, newVolume) => {
                    if(newVolume == 0)
                    {
                        const result = this.MusicManager.removeByKey(MusicPtr.key);
                    }
                }, this);
            
            this.playingSongInfo.objectPtr = MusicPtr;
            let date = new Date();
            this.playingSongInfo.startTime = date.getTime();
        }
    },
    stopMusic: function() {
        let MusicPtr = this.playingSongInfo.objectPtr;
        if(MusicPtr != null)
        {
            MusicPtr.fadeOut(1000);
            this.playingSongInfo.objectPtr = null;
        }
    },
    randomMusic: function() {
        let newRandomSongKey;
        while(true)
        {
            const newRandomSong = Phaser.Math.between(1,5);
            if(newRandomSong != this.lastPlayedSong)
            {
                newRandomSongKey = `music0${newRandomSong}`;
                this.lastPlayedSong = newRandomSong;
                return newRandomSongKey;
            }
        }
    },
    
    playSound: function(newSoundKey, loopSound = false, randomType = this.SOUNDS_TYPES.SWORD) {
        if(newSoundKey == null)
        {
            newSoundKey = this.randomSound(randomType);
        }
        
        let soundVolume = this.SoundManager.volume;
        if(loopSound)
        {
            soundVolume = soundVolume * 0.5;
        }
        
        let SoundPtr = this.SoundManager.add(newSoundKey, soundVolume, loopSound);
            SoundPtr.play();
            SoundPtr.onFadeComplete.add( (SoundPtr, newVolume) => {
                    if(newVolume == 0)
                    {
                        const result = this.SoundManager.removeByKey(SoundPtr.key);
                    }
                }, this);
        if(loopSound) {
            this.loopedSounds.push(SoundPtr);
        }
    },
    stopSounds: function() {
        for(const SoundToFadePtr of this.loopedSounds)
        {
            SoundToFadePtr.fadeOut(1000);
        }
        this.loopedSounds = [];
    },
    resetSounds: function() {
        this.SoundManager.destroy();
                
        this.SoundManager = new Phaser.SoundManager(game);
        this.SoundManager.volume = LocalStorageHandler.get(LocalStorageHandler.PROPERTIES.VOLUME_SOUND);
        this.SoundManager.onVolumeChange.add(   function(newVolume) {
                                                    LocalStorageHandler.set(LocalStorageHandler.PROPERTIES.VOLUME_SOUND, newVolume);
                                                    MenuHud.objects[4][1].getChildAt(1).text = newVolume;
                                                });
    },
    randomSound: function(type) {
        if(type != null)
        {
            if(type.totalSounds > 0)
            {
                const addon = (type.totalSounds < 10) ? `0` : ``;
                return `sfx-${type.keyString}${addon}${Phaser.Math.between(1, type.totalSounds)}`;
            }
            else throw "type.totalSounds invalid";
        }
    }
};

const showState = function() {
    let createdFade = game.add.graphics();
        createdFade.beginFill(0x000000, 1);
        createdFade.drawRect(0, 0, 1000, 1000);
        createdFade.endFill();
        createdFade.alpha = 1;
        createdFade.inputEnabled = true;
        createdFade.input.priorityID = 5;
        
    let alphaTween = game.add.tween(createdFade);
        alphaTween.to( { alpha : 0.0 }, 900, "Sine", true, 100);
        alphaTween.onComplete.addOnce( function() { createdFade.destroy(); }, this, 5);
};

var changeState = function(nextState, arg) {
    MusicHandler.stopMusic();
    MusicHandler.stopSounds();
    
    var createdFade = game.add.graphics();
            createdFade.beginFill(0x000000, 1);
            createdFade.drawRect(0, 0, 1000, 1000);
            createdFade.endFill();
            createdFade.alpha = 0;
            createdFade.inputEnabled = true;
            createdFade.input.priorityID = 5;
    
    var alphaTween = game.add.tween(createdFade);
        alphaTween.to( { alpha : 1.0 }, 1000, "Sine", true, 100);
        alphaTween.onComplete.addOnce( function() { game.state.start(nextState, true, false, arg); }, this, 5);
};