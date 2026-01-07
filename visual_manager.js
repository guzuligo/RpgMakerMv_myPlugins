/*
version: 0.0.01
About:
This tool will create a scene and control the graphics based on a state variable that can be saved and restored.
How this tool manages graphics:
    Any update to the graphics will be reflected in the save variable and the state variable.
    If state variable is null, the scene will be recreated from the save variable.
    Any update to the state variable will be reflected in the graphics.

    This is how the state variable is structured:
        [{//first object
            "path":"parent/parent/child",
            "image":"path/image",
            x:0,y:0,
            frame:[x,y,width,height],// this will be used to crop the image
            scale:1,
            opacity:1,

        },
        the next state object
        ]

    
    User need to call saveState before changing the scene and restoreState after going back

*/
function visual_manager() {
    this.initialize.apply(this, arguments);
}

visual_manager.prototype = Object.create(Scene_Base.prototype);
visual_manager.prototype.constructor = visual_manager;

visual_manager.setup=function(_state){
    visual_manager.tempState=_state;
}
visual_manager.tempState=null;


visual_manager.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this); // Call the superclass's initialize method
    this._state = visual_manager.tempState;
    this._save = null;
    visual_manager.tempState=null;
    
}

visual_manager.prototype.update = function() {
    
}

visual_manager.prototype.destroy = function() {
    this._state = null;
    this._save = null;
}



visual_manager.prototype.edit=function(id){
    return this._state[id];
}

visual_manager.prototype.refresh=function(id){
    if (id==null){
        console.log("Refreshing all,",this._state)

        //refresh all
        for (i in this._state){
            this.refresh(i);
            console.log(i)
        }

        //no need to continue
        return;
    }
    //If ID is specified, add the sprite
    if (this._state[id]!==null){
        this.addSprite(id);
    }
}

visual_manager.prototype.saveState=function(){
    this._save = JSON.parse(JSON.stringify(this._state));
    return this._save;
}

visual_manager.prototype.restoreState=function(_save){
    this._state = JSON.parse(JSON.stringify(_save || this._save || visual_manager.tempState));
}

//Add the sprite in the currect layer and apply its properties
visual_manager.prototype.addSprite=function(id){
    var layerpath=this._state[id].path.split("/");
    //add layer if it doesn't exist
    currentLayer=this;
    for (i in layerpath){
        console.log(layerpath[i])
        if (currentLayer[layerpath[i]]==null){
            currentLayer[layerpath[i]]=new Sprite();
            currentLayer.addChild(currentLayer[layerpath[i]]);
        }
        currentLayer=currentLayer[layerpath[i]];
    }
    
    //format sprite
    var sprite=currentLayer//[id];
    var img=this._state[id].image;
    sprite.bitmap=(ImageManager.loadBitmap(img[0],img[1]));//ImageManager.loadBitmap(this._state[id].image);
    if (this._state[id].frame){
        sprite.setFrame(this._state[id].frame[0],this._state[id].frame[1],this._state[id].frame[2],this._state[id].frame[3]);    
    }
    sprite.scale.x=this._state[id].scale.x||1;
    sprite.scale.y=this._state[id].scale.y||1;
    sprite.opacity=this._state[id].opacity||255;
    sprite.x=this._state[id].x||0;
    sprite.y=this._state[id].y||0;
    //add the sprite to scene using _state[id].id format to push in the correct layer
}




visual_manager.prototype.removeSpriteByPath=function(path){
    //remove sprite
    var layerpath=path.split("/");
    var currentLayer=this;
    var lastLayer;
    for (var i=0;i<layerpath.length-1;i++){
        if (currentLayer && currentLayer.hasOwnProperty(layerpath[i])) {
            lastLayer = currentLayer;
            currentLayer=currentLayer[layerpath[i]];
        } else {
            break;
        }
    }
    if (lastLayer && currentLayer) {
        lastLayer.removeChild(currentLayer);
    }
}

visual_manager.prototype.removeSpriteById=function(id){
    this.removeSpriteByPath(this._state[id].path);
}

visual_manager.prototype.create = function() {
    if(this._save !== null){
        this._state = JSON.parse(JSON.stringify(this._save));
    }
    this.refresh();
}

visual_manager.prototype.getSpriteById=function(id){
    //return null if it doesn't exist
    var layerpath=this._state[id].path.split("/");
    var currentLayer=this;
    for (i in layerpath){
        if (currentLayer[layerpath[i]]==null){
            return null;
        }
        currentLayer=currentLayer[layerpath[i]];
    }
    return currentLayer;
}

//debug phase

window.setTimeout(function() {
    
    visual_manager.setup ( [
        {
            "path":"layer1/1-1/player",
            "image":["img/characters/","Actor1"],
            x:0,y:0,
            frame:[0,0,100,100],// this will be used to crop the image
            scale:{x:1,y:1},
            opacity:255,
        }
    ]);
    SceneManager .push(visual_manager);
    //window.setTimeout(function() {
    //    SceneManager._scene.referesh();
    //},50);
    
}, 500);

window.setTimeout(function() {
    s=SceneManager._scene;
    s._state.push({
            "path":"layer1/1-1/2",
            "image":["img/characters/","Actor1"],
            x:0,y:100,
            frame:[100,0,200,100],// this will be used to crop the image
            scale:{x:1,y:1},
            opacity:255,
        })
    s.refresh();
}, 1000);