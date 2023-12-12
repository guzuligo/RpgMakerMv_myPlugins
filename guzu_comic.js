/*:
 * @plugindesc comic show maker
 * @author guzu ligo
 * 
 * @help
 * Version .231212 or 3cc
 * 
 * plugin part://TODO
 * 
 * Code part: [You need to use scripts to activate]
 * To initialize in current event:
 * this.comic=this.setupComic(); //now you can access it using this.comic
 * 
 * Comic functions:
 *      addLayer() //increases the number of layers
 *      
 *      addToLayer("filename",targetLayer#,data,returnSprite)
 *           adds a sprite using filename. You can use sprite instead of a file name, though
 *           filename is the name of the image
 *           targetLayer defaults to 0
 *           data={hue,path,at,id}// the rest will be applied to sprite
 *               hue[Number]: apply color hue.
 *               path: if specified, any change to image will look into this path
 *               at: depth among children
 *               id: if specified, you can access the added sprite using:
 *                   this.comic.ids[id]
 *           returnSprite: defaults to false. Weather return this comic or the sprite created
 *      
 *      clear(): deletes everything
 *      
 *      get(spriteIndex,layerIndex=0): returns the sprite indicated
 * 
 * 
 * Sprite Functions
 *      Config part
 *          setDefaultPath(path);   //Specifies a path to refer to if no path specified
 *          setHomeFrame(frame_array);      //Home frame size
 *          setPivot(x,y);      // sets the pivot, where x and y from 0 to 1 depending
 *                              // on bitmap size
 * 
 * 
 *      Animation part
 *        Control part
 *          reset();    //  resets time to 0
 *          stop();     //  stops animation
 *          play();     //  plays the animation
 *          clear();    //  removes all the animations
 *        Creation part
 *          add(animationName,data) //creates animation based on bellow
 * 
 *          data has common values you can optionally set
 *          data.{
 *                  start: time to start,
 *                  duration,
 *                  ease,clipStart:bool,
 *                  clipEnd:bool,
 *                  loops:0 for infinite
 *          }
 *          
 *          animation name  |   data                |   comment
 *          move            |   x,y,x2,y2           |   Moves from x to x2
 *          scale           |   scale:[x,y],scale2:[x,y]
 *          file            |   {frame#:"file1",frame#,"file2"}
 *          ".property":{x} and x can be array. Adding '.' will call a property or a function instead
 *          function: {x as ARRAY of args}
 *                  same as property, but name is a function that gets results applied to sprite    
 * 
 *          example: lets say you have image "pic1" in img/pictures
 * 
 * 
 *          //create the comic and add "pic1"
 *          this.comic=this.setupComic();
 *          var c=this.comic;
 *          c.addToLayer("pic1");
 * 
 *          //get the sprite and at the same time set its pivot
 *          var sprite=c.get(0).setPivot(.5,.5);
 * 
 *          //adding animation
 *          sprite.add("move":{
 *              x:0,y:0,
 *              x2:500,y2:500,
 *              duration:60,
 *              ease:2
 *          })
 * 
 *
*/
(function(){
    var DEBUG_=true;
    //#region initialize
    var _ = PluginManager.parameters('guzu_comic');
    if(DEBUG_)console.log("COMICS")
    Game_Interpreter.prototype.setupComic=function(addAt=2,parent=null){
        if (this._comic!=null)
            return this._comic;//shouldn't initialize twice
        //initialize
        var a=this._comic=new Guzu_Comic();
        //console.log(scene,scene._spriteset)
        parent=(parent?parent:SceneManager._scene._spriteset);
        //make sure addAt is in correct range
        addAt=addAt<0?0:(addAt<parent.children.length?addAt:parent.children.length)
        parent.addChildAt(a,addAt);
        //a.addLayer();
        a.interpreter=this;
        return a;
    }

    //#region Guzu_Comic
    function Guzu_Comic(){
        this.initialize.apply(this, arguments);
    }
    var g=Guzu_Comic.prototype = Object.create(Sprite.prototype);
    g.constructor =Guzu_Comic; 
    g.initialize=function(){
        Sprite.prototype.initialize.apply(this,arguments);
        this.addLayer();
        this.defaultPath="img/pictures/";
        this.ids={};
    }

    g.addLayer=function(at){
        var sprite=(new Guzu_Comic_Sprite()).setComic(this);
        if (at)
            this.addChildAt(sprite,at)
        else
            this.addChild(sprite)
        return this;
    }

    g.loadPicture=function(filename, hue=0,path=undefined){
        //make sure path provided is ending with /
        if(!path)path=this.defaultPath;
        console.log(path,this)
        if (path[path.length-1]!="/")
            path+="/";
        return ImageManager.loadBitmap(path, filename, hue, true);
    }

    //returns this, removes everything in layers
    //TODO: check if enough clean up
    g.clear=function(){
        this.ids={};
        for (var i=0;i<this.children.length;i++)
            this.children[i].removeChildren();
        
        return this;
    }

    //data={hue,path,at,id}// the rest will be applied to sprite
    g.addToLayer=function(filenameOrSprite,layer=0,data={},returnSprite=false){
        data=data||{};//make sure it is not null
        
        //use filenameOrSprite variable to get the correct sprite
        var sprite=(typeof(filenameOrSprite)!='string')?filenameOrSprite:
            (new Guzu_Comic_Sprite(
                this.loadPicture(filenameOrSprite,data.hue||0,data.path||this.defaultPath))
            ).setDefaultPath(data.path||this.defaultPath).setComic(this);
        //delete to avoid sending them to sprite
        delete data.hue;
        delete data.path;

        //
        if (data.id){
            this.ids[data.id]=sprite;
            delete data.id;
        }

        //at specific layer
        if (data.at){
            this.children[layer].addChildAt(sprite,data.at);
            delete data.at;
        }
        else
            this.children[layer].addChild(sprite);

        //use the remaining to adjust sprite
        for (var i in data){
            //either assign the variable
            if (typeof(sprite[i])!='function')
                sprite[i]=data[i];
            //or use the variable as array of params for the function
            else
                sprite.apply(sprite,data[i]);
        }
        return returnSprite?sprite:this;
    }
    
    //get sprite by index
    g.get=function(SpriteIndex=0,layer=0){
        return this.children[layer].children[SpriteIndex];
    }
    
    g.replace=function(sprite,filename,hue=0,path=null){
        if(path==null)
            path=sprite.defaultPath||this.defaultPath;
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
    //#endregion Guzu_Comic

    //



    //#region Guzu_Comic_Sprite
    function Guzu_Comic_Sprite(){
        this.initialize.apply(this, arguments);
    }


    var cs=Guzu_Comic_Sprite.prototype = Object.create(Sprite.prototype);
    cs.constructor=Guzu_Comic_Sprite;
    
    cs.initialize=function(){
        Sprite.prototype.initialize.apply(this,arguments);
        this.homeX=this.homeY=0;
        this.homeScale=[1,1];
        var f=this._frame;
        this.homeFrame=f?[f.x,f.y,f.width,f.height]:null;
        this.time=0;
        this.animations=[];//array of animation info. Each one is layered animation
        this.defaultPath="img/pictures/";
        this._active=true;
        this.comic=null;//to be set
    }

    cs.reset=function(){
        this.time=0;
        return this;
    };

    cs.setComic=function(comic){this.comic=comic;return this;}

    cs.setDefaultPath=function(path){
        this.defaultPath=path;
        return this;
    }
    //if f==undefined, use bitmap, if ==0, use _frame,
    //if array or number use it, otherwise object
    cs.setHomeFrame=function(f){
        if (f===undefined){
            f=this.bitmap;
            this.homeFrame=[0,0,f.width,f.height]
        }
        else if (f===0){
            f=this._frame;
            this.homeFrame=[f.x,f.y,f.width||f.w,f.height||f.h];
        }
        else if (Array.isArray(f))
            this.homeFrame=f;
        else if (!isNaN(f))
            this.homeFrame=[0,0,f,f];
        else
            this.homeFrame=[f.x,f.y,f.width||f.w,f.height||f.h];

        return this;
    }

    cs.clear=function(){
        this.animations=[];
        return this;
    }

    //set pivot 0 to 1
    cs.setPivot=function(x,y){
        [this.pivot.x,this.pivot.y]=
            [x*this.bitmap.width,y*this.bitmap.height];
        return this;
    }

    cs.play=function(){this._active=true;};
    cs.stop=function(){this._active=false;};
    cs.update=function(){
        Sprite.prototype.update.apply(this,arguments);
        //initialize location
        this.x=this.homeX;this.y=this.homeY;
        [this.scale.x,this.scale.y]=this.homeScale;
        
        //run functions and parameters
        for(var i=0;i<this.animations.length;i++)
            this.animations[i][0](this,this.animations[i][1]);
        //only count time if active
        if (this._active)
            this.time++;
    }



    //returns the current time from 0 to 1 with ease and loops applied
    var timeLimit=function(time,start,duration,ease,loops=1){
        //in case data provided
        var step=1;
        if (typeof(start)=='object'){
            var data=start;
            start=data.start;
            duration=data.time;
            ease=data.ease;
            loops=data.loops;
            step=data.steps||data.step||step;
        }
        
        //limit time
        //time=Math.min(duration+start,Math.max(start,time))-start;
        time-=start;
        if (time<0)return 0;

        time=Math.floor(Math.floor(time/step)*step)
        time=time/duration<loops?time%duration:duration;
        //ease
        var ease=ease||1;
        if (ease<0)
            ease=1/-ease;
        var T=time/duration;//0 to 1
        time=Math.pow(T,ease);//*duration;
        return time;
    }

    //returns the currect value provided time, duration, start and end values
    var timeXval=function(x1,x2,time,duration=1){
        if (duration!=1)
            time/=duration;
        //var xr=x1*(1-time) + x2*time;
        return x1*(1-time) + x2*time;;
    }

    var nonNull=function(array){
        //console.log(array)
        for (var i=-1;++i<array.length;)
            if (array[i] || array[i]===0)
                return array[i];
        return undefined;
    }

    //gets data:{start,duration or time,clipStart,clipEnd}
    //returns true if time is within duration
    var dataSetDefaults=function(data,time){
        data.start=data.start||0;//start time
        data.time=data.time||data.duration||60;
        data.loops=data.loops||data.loop||1;//forgive plurol
        if (time!=undefined ||time===0){
            if (!!data.clipStart && time<data.start) return false;
            if (!!data.clipEnd && time>data.start+data.time*(data.loops)) return false;
        }

        return true;
    }

    //data.x is the start and data.x2 is the end. Can be array
    //TODO:test
    //this function gets data and returns values;
    cs.calculate=function(data){
        var t=this;
        if (!dataSetDefaults(data,t.time))return null;
        var time=timeLimit(t.time,data);
        var x=Array.isArray(data.x)?data.x:[data.x];
        var x2=Array.isArray(data.x2)?data.x2:[data.x2];
        var result=[];
        for (var i=0;i<x.length;i++){
            result.push(timeXval(x[i],x2[i],time));
        }
        return Array.isArray(data.x)?result:result[0];
    }
    /*
    *   
    *   returns this
    *   function names and data:
    *   common:{start,duration,ease,clipStart,clipEnd,loops:0 for infinite}
    *   "move":{x,y,x2,y2}
    *   "scale":{scale:[x,y],scale2:[x,y]}
    *   "shake":{scale:[x,y],scale2:[x,y]}
    *   "file":{frame#:"file1",frame#,"file2"}
    *   "frame":{x ,y ,w ,h ,x2,y2,w2,h2}
    *   ".property":{x} and x can be array. Adding '.' will call a property or a function instead
    *   function: {x as ARRAY of args}
    *        same as property, but name is a function that gets results applied to sprite
    */
    cs.add=function(name,data){
        if (typeof(name)!='function')
            name=name.toLowerCase();

        if (typeof(name)=='function'){
            function_=function(t,data){
                var results=t.calculate(data);
                name.apply(t,results);
                return t;
            }
        }
        //if name starts with . then it is a feature
        else if (name[0]=="."){
            function_=function(t,data){
                var v=name.substr(1);
                if (typeof(t[v]=='function'))
                    t[v].apply(t,t.calculate(data));
                else
                    t[v]=t.calculate(data);

                return t;
            }
        }

        else switch (name){
            case "move"://create move function
                function_=function(t,data){//t is the sprite to animate
                    //set defaults
                    if (!dataSetDefaults(data,t.time))
                        return t;
                    data.x =nonNull([data.x,t.homeX  ]);
                    data.y =nonNull([data.y  ,t.homeY]);
                    data.x2=nonNull([data.x2 ,t.homeX]);
                    data.y2=nonNull([data.y2 ,t.homeY]);
                    //move
                    var time=timeLimit(t.time,data);
                    t.x+=timeXval(data.x,data.x2,time)-t.homeX;
                    t.y+=timeXval(data.y,data.y2,time)-t.homeY;
                    return t;
                }
                break;
            case "scale":
                function_=function(t,data){
                    //set defaults
                    if (!dataSetDefaults(data,t.time))return t;
                    data.scale =nonNull([data.scale  ,t.homeScale]);
                    data.scale2=nonNull([data.scale2 ,t.homeScale]);

                    var time=timeLimit(t.time,data);
                    t.scale.x+=timeXval(data.scale[0],data.scale2[0],time)-t.homeScale[0];
                    t.scale.y+=timeXval(data.scale[1],data.scale2[1],time)-t.homeScale[1];
                    return t;
                }
                break;
            case "shake":
                function_=function(t,data){
                    if (!dataSetDefaults(data,t.time))return t;
                    if (data.scale==undefined)data.scale=[0,0];
                    data.scale=Array.isArray(data.scale)?data.scale:[data.scale,data.scale];
                    if (data.scale2==undefined)data.scale2=[0,0];
                    data.scale2=Array.isArray(data.scale2)?data.scale2:[data.scale2,data.scale2];

                    var time=timeLimit(t.time,data)
                    t.x+=timeXval(data.scale[0],data.scale2[0],time)* ((t.time&2)==0?-1:1);
                    t.y+=timeXval(data.scale[1],data.scale2[1],time)* ((t.time&1)==0?-1:1);
                    return t;
                }
                break;
            case "file":case "files":
                function_=function(t,data){
                    if (!dataSetDefaults(data,t.time))return t;
                    var time=Math.floor(timeLimit(t.time,data)*data.time);
                    var f=data.file||data.files;
                    if (f[time])//if
                        t.comic.replace(t,f[time]);
                    return t;
                }
                break;
            case "frame":case "rect":
                function_=function(t,data){
                    if (!t.homeFrame)
                        t.setHomeFrame(0);//use t._frame

                    //make start and end frames
                    var F=t._frame;
                    var f=F;var f2=F;
                    f=[
                        nonNull([data.x,f.x                  ]),
                        nonNull([data.y,f.y                  ]),
                        nonNull([data.w,data.width  ,f.width ]),
                        nonNull([data.h,data.height ,f.height])
                    ];

                    f2=[
                        nonNull([data.x2,f2.x                   ] ),
                        nonNull([data.y2,f2.y                   ] ),
                        nonNull([data.w2,data.width2  ,f2.width ] ),
                        nonNull([data.h2,data.height2 ,f2.height] )
                    ];
                    var d=Object.assign({},data)
                    d.x=f;d.x2=f2;
                    var r=t.calculate(d);
                    if (r)t.setFrame.apply(t,r)
                    //[F.x,F.y,F.width,F.height]=t.calculate(d);
                    //t._refresh();
                    return t;
                }

                break;
        }
        this.animations.push([function_,data]);
        return this;
    }
    //#endregion Guzu_Comic_Sprite

    
//end
})();