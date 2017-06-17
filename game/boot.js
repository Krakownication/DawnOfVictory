/*global localStorage*/
/*global CONSTS*/
/*global CONFIG*/
/*global Phaser*/
/*global game*/

var bootState = {
    create: function(){
        document.body.oncontextmenu = function() { return false; };
        
        game.stage.disableVisibilityChange = true;
        
        Phaser.Canvas.setUserSelect(game.canvas, 'none');
        Phaser.Canvas.setTouchAction(game.canvas, 'none');
        
        LocalStorageHandler.checkData();
        
        game.state.start('load');
    }
};

const CloneObj = function(Obj) {
    return JSON.parse(JSON.stringify(Obj));
};

var LocalStorageHandler = {
    
    PROPERTIES: {
        UNLOCKED_CAMPAIN_LVL: 0,
        VOLUME_MUSIC: 1,
        VOLUME_SOUND: 2,
        SHOWDEBUG: 3,
        TUTORIAL_ENABLED: 4
    },
    KEYS: {
        SETTINGS: "DoVx00",
        CAMPAINDATA: "DoVx01",
    },
  
    get: function(property) {
        switch(property) {
            
            case this.PROPERTIES.UNLOCKED_CAMPAIN_LVL:
                return JSON.parse(localStorage.getItem(this.KEYS.CAMPAINDATA)).cLvl;
            break;
                
            case this.PROPERTIES.VOLUME_MUSIC:
                return JSON.parse(localStorage.getItem(this.KEYS.SETTINGS)).volumeMusic;
            break;
                
            case this.PROPERTIES.VOLUME_SOUND:
                return JSON.parse(localStorage.getItem(this.KEYS.SETTINGS)).volumeSounds;
            break;
            
            case this.PROPERTIES.TUTORIAL_ENABLED:
                return JSON.parse(localStorage.getItem(this.KEYS.SETTINGS)).tutorialFlag;
            break;
            
            case this.PROPERTIES.SHOWDEBUG:
                return JSON.parse(localStorage.getItem(this.KEYS.SETTINGS)).showDebug;
            break;
                
        default:
            throw "Undefined get property";
        }
    },
    set: function(property, newValue) {
        switch(property) {
            
            case this.PROPERTIES.UNLOCKED_CAMPAIN_LVL:
                {
                    let campainObj = JSON.parse(localStorage.getItem(this.KEYS.CAMPAINDATA));
                        campainObj.cLvl = newValue;
                    localStorage.setItem(this.KEYS.CAMPAINDATA, JSON.stringify(campainObj));
                }
            break;
                
            case this.PROPERTIES.VOLUME_MUSIC:
                {
                    let settingsObj = JSON.parse(localStorage.getItem(this.KEYS.SETTINGS));
                        settingsObj.volumeMusic = newValue;
                    localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settingsObj));
                }
            break;
                
            case this.PROPERTIES.VOLUME_SOUND:
                {
                    let settingsObj = JSON.parse(localStorage.getItem(this.KEYS.SETTINGS));
                        settingsObj.volumeSounds = newValue;
                    localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settingsObj));
                }
            break;
                
            case this.PROPERTIES.TUTORIAL_ENABLED:
                {
                    let settingsObj = JSON.parse(localStorage.getItem(this.KEYS.SETTINGS));
                        settingsObj.tutorialFlag = newValue;
                    localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settingsObj));
                }
            break;
            
            case this.PROPERTIES.SHOWDEBUG:
                {
                    let settingsObj = JSON.parse(localStorage.getItem(this.KEYS.SETTINGS));
                        settingsObj.showDebug = newValue;
                    localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settingsObj));
                }
            break;
                
        default:
            throw "Undefined get property";
        }
    },
    
    checkData: function() {
        let settingsObj = JSON.parse(localStorage.getItem(this.KEYS.SETTINGS));
        let defaultSettingsObj = { volumeMusic: 0.4, volumeSounds: 0.6, showDebug: false, tutorialFlag: false };
        if(settingsObj == null)
        {
            localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(defaultSettingsObj));
        }
        else
        {
            if( (settingsObj.volumeMusic < 0 || settingsObj.volumeMusic > 1) || settingsObj.volumeMusic == null)
            {
                settingsObj.volumeMusic = defaultSettingsObj.volumeMusic;
                localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settingsObj));
            }
            if( (settingsObj.volumeSounds < 0 || settingsObj.volumeSounds > 1) || settingsObj.volumeSounds == null)
            {
                settingsObj.volumeSounds = defaultSettingsObj.volumeSounds;
                localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settingsObj));
            }
            if(  settingsObj.tutorialFlag == null)
            {
                settingsObj.tutorialFlag = defaultSettingsObj.tutorialFlag;
                localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settingsObj));
            }
        }
        
        let campainObj = JSON.parse(localStorage.getItem(this.KEYS.CAMPAINDATA));
        let defaultCampainObj = { cLvl: 1 };
        if(campainObj == null)
        {
            localStorage.setItem(this.KEYS.CAMPAINDATA, JSON.stringify(defaultCampainObj));
        }
        else 
        {
            if( (campainObj.cLvl < 0 || campainObj.cLvl > CONSTS.LASTLEVEL) || campainObj.cLvl == null)
            {
                campainObj.cLvl = defaultCampainObj.cLvl;
                localStorage.setItem(this.KEYS.CAMPAINDATA, JSON.stringify(campainObj));
            }
        }
    }
    //localStorage.removeItem("propertyName");
};