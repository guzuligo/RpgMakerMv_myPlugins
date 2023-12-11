/*:
 * @plugindesc comic show maker
 * @author guzu ligo
 * 
 * @help
 * Version .231211
 *
*/
(function(){
    var DEBUG_=true;
    //#region initialize
    var _ = PluginManager.parameters('guzu_comic');
    console.log("COMICS")
    Game_Interpreter.prototype.setupComic=function(addAt=2){
        if (this._comic!=null)
            return this._comic;//shouldn't initialize twice
        //initialize
        var scene=SceneManager._scene;
        var a=this._comic=new Guzu_Comic();
        console.log(scene,scene._spriteset)
        scene._spriteset.addChildAt(a,addAt);
        a.addLayer();
        a.interpreter=this;
        return a;
    }

    function Guzu_Comic(){
        this.initialize.apply(this, arguments);
    }
    var g=Guzu_Comic.prototype = Object.create(Sprite.prototype);
    g.constructor =Guzu_Comic; 


    g.addLayer=function(at){
        if (at)
            this.addChildAt(new Guzu_Comic_Sprite(),at)
        else
            this.addChild(new Guzu_Comic_Sprite())
        return this;
    }

    g.loadPicture=function(filename, hue=0,path="img/pictures/"){
        //make sure path provided is ending with /
        if (path[path.length-1]!="/")
            path+="/";
        return ImageManager.loadBitmap(path, filename, hue, true);
    }


    //data={hue,path,at}// the rest will be applied to sprite
    g.addToLayer=function(filenameOrSprite,layer=0,data={},returnSprite=false){
        data=data||{};//make sure it is not null
        
        //use filenameOrSprite variable to get the correct sprite
        var sprite=(typeof(filenameOrSprite)!='string')?filenameOrSprite:
            new Guzu_Comic_Sprite(this.loadPicture(filenameOrSprite,data.hue||0,data.path||undefined));
        //delete to avoid sending them to sprite
        delete data.hue;
        delete data.path;

        if (data.at){
            this.children[layer].addChildAt(sprite,data.at);
            delete data.at;
        }
        else
            this.children[layer].addChild(sprite);

        //use the remaining to adjust sprite
        for (var i in data)
            //either assign the variable
            if (typeof(sprite[i])!='function')
                sprite[i]=data[i];
            //or use the variable as array of params for the function
            else
                sprite.apply(sprite,data[i]);
        return returnSprite?sprite:this;
    }
    
    g.get=function(SpriteIndex=0,layer=0){
        return this.children[layer].children[SpriteIndex];
    }
    
    g.replace=function(sprite,filename,hue=0,path="img/pictures/"){
        sprite=this.getSprite(sprite);//make sure we are using Sprite object
        sprite.bitmap=this.loadPicture(filename,hue,path);
        return this;
    }

    //simplifies getting sprite
    g.getSprite=function(sprite){
        //[index,layer]
        if (Array.isArray( sprite))
            return this.get(sprite[0],sprite[1]);
        //index at layer 1
        if (!isNaN(sprite))
            return this.get(sprite);

        //if nothing fits, just return the input
        return sprite;
    }


    //




    function Guzu_Comic_Sprite(){
        this.initialize.apply(this, arguments);
    }

    var cs=Guzu_Comic_Sprite.prototype = Object.create(Sprite.prototype);
    cs.constructor=Guzu_Comic_Sprite;
    
    cs.initialize=function(){
        Sprite.prototype.initialize.apply(this,arguments);
        this.homeX=this.homeY=0;
        this.homeScaleX=this.homeScaleY=100;
        this.time=0;
        this.animations=[];//array of animation info. Each one is layered animation
    }

    cs.update=function(){
        Sprite.prototype.update.apply(this,arguments);
        for(var i=0;i<this.animations.length;i++)
            this.animations[i][0](this,this.animations[i][1]);
        this.time++;
    }

    var timeLimit=function(time,start,duration,ease){
        //limit time
        time-=start;
        time=time<duration?time:duration;
        //ease
        var ease=ease||1;
        if (ease<0)
            ease=1/-ease;
        var T=time/duration;//0 to 1
        time=Math.pow(T,ease)*duration;
        return time;
    }
    cs.add=function(name,data){
        name=name.toLowerCase();
        switch (name){
            case "move":
                function_=function(t,data){//t is the sprite to animate
                    //set defaults
                    data.start=data.start||0;//start time
                    if (t.time<data.start)
                        return this;//no need to change anything if shouldn't start yet

                    data.time=data.time||data.duration||60;
                    data.x =data.x  ||t.homeX;
                    data.y =data.y  ||t.homeY;
                    data.x2=data.x2 ||t.homeX;
                    data.y2=data.y2 ||t.homeY;
                    
                    //limit time
                    //var time=t.time-data.start;
                    //time=time<data.time?
                    //    time:data.time;
                    //ease
                    //var ease=(data.ease||1);
                    //if (ease<0)
                    //    ease=1/-ease;
                    //var T=time/data.time;//0 to 1
                    //time=Math.pow(T,ease)*data.time;
                    var time=timeLimit(t.time,data.start,data.time,data.ease);
                    
                    //move
                    t.x=(data.x*(data.time-time) + data.x2*time)    /data.time;
                    t.y=(data.y*(data.time-time) + data.y2*time)    /data.time;

                }
                break;
        }
        this.animations.push([function_,data]);
    }
    

    
//end
})();