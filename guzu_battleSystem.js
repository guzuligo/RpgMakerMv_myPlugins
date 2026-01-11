//version 0.0.1
window.guzu=window.guzu||{};

(function(){

    
    function battleSystem(){
        this.initialize.apply(this, arguments);
    }


    battleSystem.prototype.initialize=function(){
        this.om=new window.guzu.object_manager();
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
        
        var bs=new window.guzu.battleSystem();
        bs.start();
    },1000)
    
}