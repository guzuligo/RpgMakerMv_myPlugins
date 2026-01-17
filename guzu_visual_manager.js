/*
version: 0.0.03e.
About:
This tool will create a scene and control the graphics based on a state variable that can be saved and restored.
How this tool manages graphics:
    Any update to the graphics will be reflected in the save variable and the state variable.
    If state variable is null, the scene will be recreated from the save variable.
    Any update to the state variable will be reflected in the graphics.

    This is how the state variable is structured:
        [
         {//first object
            "path":"parent/parent/child",
            "image":"path/image",
            x:0,y:0,
            frame:[x,y,width,height],// this will be used to crop the image
            scale:{x:1,y:1},
            opacity:1,
         },
         {}\\the next state object
        ]
    Other properties can be added as needed. Such as "class" to specify different sprite classes.

    User need to call saveState before changing the scene and restoreState after going back to a previous state.

    functions:
    edit(id,data): Lightweight edit function to update sprite properties based on data object. Returns updated state object.
    refresh(id): Refresh either all sprites or a specific sprite by ID (Heavyweight refresh to ensure all properties are applied)
    saveState(): Save the current state to internal save variable. Returns saved state.
    restoreState(_save): Restore the state from internal save variable or provided _save variable. 
        Needs refresh to apply changes.
        The save variable can be either provided as a variable, or if null, the internal save variable will be used.
    setup(_state): Static function to setup the initial state variable before creating the scene.


    notes:
    - edit function fails when changing path. Refresh is needed.

    //protips:
    - following sprite properties can be used in the state object:
        x,y,scale,opacity,rotation,blendMode,anchor,frame,image,z

*/

window.guzu=window.guzu||{};

(function(){
    function visual_manager() {
        this.initialize.apply(this, arguments);
    }

    visual_manager.prototype = Object.create(Scene_Base.prototype);
    visual_manager.prototype.constructor = visual_manager;

    visual_manager.setup=function(_state){
        visual_manager.tempState=_state;
    }
    visual_manager.tempState=null;
    visual_manager.prototype.childrenDict=null;

    visual_manager.prototype.initialize = function() {
        Scene_Base.prototype.initialize.call(this); // Call the superclass's initialize method
        this._state = visual_manager.tempState||[];
        this._save = null;
        this.childrenDict={};
        visual_manager.tempState=null;
        console.log("init visual manager");
    }

    visual_manager.prototype.update = function() {
        
    }

    visual_manager.prototype.destroy = function() {
        this._state = null;
        this._save = null;
    }


    //Lightweight edit function to update sprite properties
    visual_manager.prototype.edit=function(id,data){
        //Update sprite and state properties based on data object
        if (data){
            console.log("Editing sprite:",id,data);
            //update state
            var sprite = this.getSpriteById(id);
            var oldPath=this._state[id]["path"];
            if (sprite != null){
                if (data["path"]!=null){
                    //path change requires remove and re-add
                    var key="path";
                    console.log("PP-pre",this._state[id][key],data[key]);
                    if (this._state[id][key]!=data[key]){
                        //remove and re-add
                        console.log("PP",this);
                        this._state[id][key]=oldPath; //reset to old path for removal
                        this.removeSpriteById(id);
                        this._state[id][key]=data[key];
                        this._addSpriteToLayer(id);
                    }
                }
                for (var key in data){
                    this._state[id][key]=data[key];
                    switch (key){
                        case "path":
                            //ignore as handled above
                            //return this._state[id];
                            break;
                        case "image":
                            //fix string to array if needed
                            var q = this._state[id][key];
                            if (typeof q === "string") {
                                var idx = q.lastIndexOf("/");
                                this._state[id][key] = [q.substring(0, idx+1), q.substring(idx + 1)];
                            }
                            //load bitmap
                            sprite.bitmap=(ImageManager.loadBitmap(this._state[id][key][0],this._state[id][key][1]));
                            break;
                        case "frame":
                            sprite.setFrame(this._state[id][key][0],this._state[id][key][1],this._state[id][key][2],this._state[id][key][3]);
                            break;
                        case "scale":
                            if (this._state[id][key].x!=null) sprite.scale.x=this._state[id][key].x;
                            if (this._state[id][key].y!=null) sprite.scale.y=this._state[id][key].y;
                            break;
                        case "class":
                            //ignore class changes for now
                            break;
                        default:
                            var value=this._state[id][key];
                            if (typeof value==="number" || typeof value==="string" || typeof value==="boolean"){
                                sprite[key]=value;
                            }else{
                                //iterate through object properties
                                for (var subkey in value){
                                    sprite[key][subkey]=value[subkey];
                                }
                            }
                            //sprite[key]=this._state[id][key];
                    }
                }

                
            }
        }
        return this._state[id];
    }

    //Refresh either all sprites or a specific sprite by ID (Heavyweight refresh to ensure all properties are applied)
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

    //tool for clearing the scene to support full refresh
    visual_manager.prototype.removeAllLayers=function(topLayer=null){
        if (topLayer==null) topLayer=this;
        //iterate through all layers and sublayers
        for (var key in topLayer.childrenDict){
            this.removeAllLayers(topLayer.childrenDict[key]);
            topLayer.removeChild(topLayer.childrenDict[key]);
            delete topLayer.childrenDict[key];
        }
        return this;
    }

    visual_manager.prototype.saveState=function(){
        this._save = JSON.parse(JSON.stringify(this._state));
        return this._save;
    }

    visual_manager.prototype.restoreState=function(_save){
        this._state = JSON.parse(JSON.stringify(_save || this._save || visual_manager.tempState || []));
    }

    visual_manager.prototype._addSpriteToLayer=function(id){
        
        //TODO: ensure correct layer z depth
        console.log("Adding sprite as layer:",this._state[id].path);
        var layerpath=this._state[id].path.split("/");
        var currentLayer=this;
        var i,j;
        for (i=0; i<layerpath.length; i++){
            //ensure layer exists
            if (currentLayer.childrenDict[layerpath[i]]==null){
                var newLayer=(i==layerpath.length-1 && this._state[id]["class"]!=null)?new this._state[id]["class"]:new Sprite_Base();
                newLayer.name=layerpath[i];
                newLayer.childrenDict={};
                currentLayer.childrenDict[layerpath[i]]=newLayer;
                currentLayer.addChild(newLayer);
            }
            //refer to next layer
            currentLayer=currentLayer.childrenDict[layerpath[i]];
        }
        return currentLayer;
    }

    //Add the sprite in the currect layer and apply its properties
    visual_manager.prototype.addSprite=function(id){
        //var layerpath=this._state[id].path.split("/");
        //add layer if it doesn't exist
        currentLayer=this._addSpriteToLayer(id);
    
        
        var _defaultState={
            scale:{x:1,y:1},
            opacity:255,
            x:0,
            y:0,
        };

        //apply properties and ensure defaults
        for (var key in _defaultState){
            this._state[id][key]=this._state[id][key]||_defaultState[key];
        }

        this.edit(id,this._state[id]);

        
        return this;
    }
    visual_manager.prototype.removeSpriteByPath=function(path,deleteSprite=false){
        //remove sprite
        var layerpath=path.split("/");
        var currentLayer=this;
        var nextLayer=layerpath.shift();
        while (layerpath.length>0){
            currentLayer=currentLayer.childrenDict[nextLayer];
            nextLayer=layerpath.shift();

        }
        currentLayer.removeChild(currentLayer.childrenDict[nextLayer]);
        console.log("Removing",nextLayer,"from:",currentLayer);
        var temp= currentLayer.childrenDict[nextLayer];
        if (deleteSprite){
            delete currentLayer.childrenDict[nextLayer];
        }
        
        currentLayer.childrenDict[nextLayer]=null;
        return temp;
    }

    visual_manager.prototype.removeSpriteById=function(id,deleteSprite=false){
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
            if (currentLayer.childrenDict[layerpath[i]]==null){
                return null;
            }
            currentLayer=currentLayer.childrenDict[layerpath[i]];
        }
        return currentLayer;
    }

 //////////////////////////////
 //////////////////////////////
 // End of visual_manager class
 //////////////////////////////
 //////////////////////////////

    //Expose the class
    window.guzu.visual_manager=visual_manager;
})();










//debug phase. Test code to demonstrate functionality
if (false){
    window.setTimeout(function() {
        //testing setup
        var visual_manager=window.guzu.visual_manager;
        visual_manager.setup ( [
            {
                "path":"layer1/1-1/1",
                "image":["img/characters/","Actor1"],
                x:0,y:0,
                frame:[0,0,100,100],// this will be used to crop the image
                scale:{x:1,y:1},
                opacity:255,
            }
        ]);
        SceneManager .push(visual_manager);


        //testing edit
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
        }, 500);
        //
    }, 500);
}