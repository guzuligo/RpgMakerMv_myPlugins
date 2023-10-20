/*:
 * @plugindesc Enemy Animation allowes enemies to be animated and use different images
 * @author guzu ligo
 *
 * 
 * @param root folder
 * @default img/enemies
 * 
 * @param default wait frames
 * @type Number
 * @default 3
 * 
 * @param test
 * @type json
 * 
 * @help
 * To use, you need to use the notes of the enemy.
 * Following is an example use. Copy and pase to see it in action:
 * 
 * Example 1: will alternate between bat and orc
 * <enemation:*:["Bat","Orc"]>
 * By providing array of images, all images will be played
 * 
 * 
 * Example 2: Will alternate on 30 frames delay
 * <enemation:*:[30,"Bat","Orc"]>
 * A number will be treated as desired delay. 
 * You can add numbers before each image name to have different delays.
 * Example: <enemation:*:[10,"Bat",30,"Orc"]>
 *  
 * 
 * Example 3: Will alternate only if is acting
 * <enemation:
 * isActing:[5,"Bat","Orc"]
 * , *:["Orc"]
 * >
 * The * means everything else, while isActing is a function from battler class.
 * You can find all possible action checks here
 * https://kinoar.github.io/rmmv-doc-web/classes/game_battler.html
 * 
 * 
 * Example 4: Will move foreward when attacking
 *  * <enemation:
*   isActing:[999,[40,0,5],"Orc"]
 *  , *:[1,[0,0,5],"Orc"]
 *   >
 *
 * Emaple 5: Negative number for stepping back
 * <enemation:*:[100,"Orc","Slime","Bat",-2]>
 *    
 * 
 * Emaple 6:You can also delay using 0
 * <enemation:*:["Orc",0,0,"Slime","Bat"]>
 * 
 */

(function(){
    var DEBUG_=true;
    //#region initialize
    var _ = PluginManager.parameters('Enemation');


    var SE=Sprite_Enemy.prototype;
    var cfg=SE.enemationConfig={
        root:_["root folder"],
        waitFrames:Number(_["default wait frames"]),
    };
    _fix_cfg();
    if(DEBUG_)console.log(cfg)


    //console.log(cfg.root)
    //#endregion

    //#region Functions
    SE.enemationStep=function(a){//returns true if bitmap updated
        var enm=this.enemation;
        aes=a[enm.step]
        if (isNaN(aes)){
            if (Array.isArray(aes)){
                
                //case array, it is movement [x,y,duration]
                //var a=aes[enm.step];
                this.startMove.apply(this,aes)
                return false;
            }else if (typeof(aes)=='string'){
                //TODO: use strings as commands.
                //Note that incoming strings will start with *
                return false;
            }else{
            //case bitmap
                //console.log("load bitmap",a[enm.step],enm.step)
                this.bitmap=a[enm.step];
                return true; 
            }
        }else{
            //case number positive, it is a delay update
            if (a[enm.step]>0)
                this.enemation.delayMax=Number(a[enm.step]);
            else{
                if (a[enm.step]==0) return true;//stop processing on 0
            //negative to step back
                enm.step+=a[enm.step]-1;
                if (enm.step<-1)a[enm.step]=-1;
            }

            return false;
        }
    }
    //#endregion

    //#region OVERRIDES

    //Update Function
    var alias_SEU=SE.update;
    SE.update=function(){var i;
        alias_SEU.apply(this,arguments);
        var enm=this.enemation;
        var anm=enm.animations;
        if (anm.length==0)
            return;
        for (i=-1;++i<anm.length;){
            var _c;_c=anm[i][0];//get name
            //check which animation to play
            if (_c=="*" || _validateAction(this._battler,_c)){
                enm.currentAnimation=i;
                if (enm.currentAnimation!=enm.lastAnimation){
                    //reset if new animation
                    enm.delay=0;//enm.delayMax;
                    enm.step=0;
                }

                break;
            }
        }

        //time to update?
        if (--enm.delay<=0){
            i=3;//precauting for endless loop
            var canm=anm[enm.currentAnimation][1];
            //update animation
            while(!this.enemationStep(canm) && i>0){
                i--;
                enm.step++;if (enm.step>=canm.length)enm.step=0;
            }
            enm.step=(enm.step+1)%canm.length;
            //var a=anm[enm.currentAnimation][1];//get the animation part
            enm.delay=enm.delayMax;//reset delay
        }

        enm.lastAnimation=enm.currentAnimation;
        
    }

    //Initialize
    var alias_SEI=SE.initialize
    SE.initialize=function(){
        alias_SEI.apply(this,arguments);

        
        var i;
        var anm=[];//format [[isThing,[things]]]
        //prepare data
        this.enemation={
            config:{meta:null},
            animations:anm,
            delay:0,//cfg.waitFrames,
            delayMax:cfg.waitFrames,
            lastAnimation:null,
            currentAnimation:null,
            step:0,
        };


        if(DEBUG_)window["ff"]=this
        var _meta=
            this.enemation.config.meta=
                $dataEnemies[this._battler.enemyId()].meta;
        


        //Fill data
        
        try{
            //get enemation config
            var e=_meta["enemation"];
            if (e){
                //TODO
                var anim=toJson(e);
                for (i in anim){
                    anm.push([i,_prepareAnimationFiles(anim[i])] );
                }
                    //console.log(i,anim[i])
            }
        }catch(XX){
            console.error("failed to fill\n",XX);
        }
    }

    //LoadBitmap

    var alias_SELoadBitmap=Sprite_Enemy.prototype.loadBitmap;
    Sprite_Enemy.prototype.loadBitmap=function(){
        alias_SELoadBitmap.apply(this,arguments);
        this.enemation.config.hue=arguments[1];
        //console.log(arguments,this.enemation.config.hue)
    }

    //#endregion

    //#region HELPER FUNCTIONS


    function _validateAction(battler,action){
        switch(typeof(battler[action])){
            case 'function':
                return battler[action]();
            default:
                return !!battler[action];
        }
    }

    //gets array for animation and return files
    function _prepareAnimationFiles(a,hue){
        var waitFrames=cfg.waitFrames;
        result=[];
        for (var i=0;i<a.length;i++){
            if (isNaN(a[i])){
                if(typeof(a[i])=='string' && a[i].charAt(0)!="*")
                    a[i]=ImageManager.loadBitmap(cfg.root,a[i],hue||0);
            }
            else
                a[i]=Number(a[i]);
        }
        return a;
            
    }

    //for debug:
    if(DEBUG_)window._prepareAnimationFiles=_prepareAnimationFiles; 

    //Fix config issues
    function _fix_cfg(){
        //Fix root folder
        cfg.root=cfg.root.trim().replace(/\\/g,"/");
        if (!cfg.root[cfg.root.length-1]!="/")
            cfg.root+="/";
        while(cfg.root[0]=="/")
            cfg.root=cfg.root.slice(1);
    }

    function toJson(J){
        
        J=J.trim();
        if (J[0]!="{")
            J="{"+J;
        if (J[J.length-1]!="}")
            J=J+"}";
        //source: https://stackoverflow.com/a/24175850/8060624
        return JSON.parse(
        J.replace(/(['"])?([a-zA-Z0-9_\*]+)(['"])?:([^\/])/g, '"$2":$4')
        );
    }
    if(DEBUG_)window.toJson=toJson;
    function getNotes(enemySprite,htmlTag="enemation"){
        try{
        var n=$dataEnemies[enemySprite._battler._enemyId].note
        var _=n.toLowerCase();
        return n.slice(_.indexOf(`<${htmlTag}>`)+htmlTag.length+3
        ,_.indexOf(`</${htmlTag}>`))
        }catch(XX){
            console.error(XX);
        }
        return "";
    }
    //#endregion


})();