/*
    varsion 0.0.1
*/
//uses visual_manager and tracks game objects and their status. This isolates the user from using visual_manager

window.guzu=window.guzu||{};

(function(){

    function object_manager(){
        this.initialize.apply(this, arguments);
    }

    object_manager.prototype.constructor=object_manager;

    object_manager.prototype.objects=[];

    object_manager.prototype.functions={};//function library

    object_manager.prototype.scene=null;
    object_manager.prototype.initialize=function(){
        //this.scene=new window.guzu.visual_manager();
        SceneManager.push(guzu.visual_manager);
        this.scene=SceneManager._scene;
    }

    object_manager.prototype.update=function(){
        //this.scene.update();
        for (var i=0;i<this.objects.length;i++){
            this.functions[this.objects[i].call].call(this.objects[i]);
        }
    }

    object_manager.prototype.add=function(object){
        this.objects.push(object);
    }

    object_manager.prototype.remove=function(object){
        this.objects.splice(this.objects.indexOf(object),1);
    }

    //data={}
    object_manager.prototype.createObject=function(data){
        var defaults={
            name:"",
            type:"",
            call:"",//function to call on update
            state:{},//arguments to be used in function
            manager:this
        }
        var object=Object.assign(defaults,data);
        this.add(object);
        return object;
    }





    //////////////////////////////
    //////////////////////////////
    // End of object_manager class
    //////////////////////////////
    //////////////////////////////
    window.guzu.object_manager=object_manager;
})();