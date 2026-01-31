//version 0.0.1
window.guzu=window.guzu||{};

(function(){

    
    function battleSystem(){
        this.initialize.apply(this, arguments);
    }


    battleSystem.prototype = Object.create(window.guzu.visual_manager.prototype);
    battleSystem.prototype.initialize=function(){
        window.guzu.visual_manager.prototype.initialize.call(this);
        this._initializeFunctions();
    }

    battleSystem.prototype.start=function(){
        
    }

    battleSystem.prototype.addPlayer=function(){
        this.om.createObject({
            type:"player",
            name:"player",
            call:"initPlayer"
        });
    }



    ///
    battleSystem.prototype._initializeFunctions=function(){
        var om=this.om;
        var fn=om.functions;
        fn["initPlayer"]=function(o){
            console.log("init player");
            o.call="updatePlayer";
        }
    }

    //////////////////////////////
    //////////////////////////////
    // End of battleSystem class
    //////////////////////////////
    //////////////////////////////
    window.guzu.battleSystem=battleSystem;
})();



//debug
if (true){
    
    window.setTimeout(function() {
        
        SceneManager.push(window.guzu.battleSystem);
        window.setTimeout(function() {
            SceneManager._scene._state.push({
                    "path":"layer1/1-1/1",
                    "image":["img/characters/","Actor1"],
                    x:0,y:0,
                    frame:[0,0,100,100],// this will be used to crop the image
                    scale:{x:1,y:1},
                    opacity:255,
                })

            SceneManager._scene.refresh();
            //bs.start();

            s=SceneManager._scene
            var ss={"path":"layer1/1-1/2","image":["img/characters/","Actor2"],x:0,y:200,frame:[100,0,200,100]}
            s._state.push(ss);
            s.refresh();
        }, 500);
    },1000)
    
    
}