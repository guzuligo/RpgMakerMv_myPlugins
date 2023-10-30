/*:
 * @plugindesc Adds extra effects to animations
 * @author guzu ligo
 *
 * @param shakeY
 * @type float
 * @default 0
 * @desc Choose a number between 0 and 2 to shake in Y axis as well. 0.5 is prefered
 * 
 * @param shake
 * @type struct<shake>[]
 * @desk assign a shake effect to animation. Specify the animation ID, frame number and shake power
 * 
 * @help
 * Version Date 20OCT2030
 * EFFECT 1 
 * To make a skill hide battler when being executed,
 *  write following in skill notes:
 *      <hideBattler>
 * 
 * EFFECT 2
 * To modify the shake effect to move Y as well,
 *  specify it in the parameters to the right
 * 
 * EFFECT 3
 * To make an animation shake the screen,
 *  see the shake parameter on the right
 * 
 * 
 * 
 */

/*~struct~shake:
 * {
 * @param animationId
 * @type Number
 * 
 * @param frame
 * @type Number
 * 
 * @param power
 * @type Number
 * @default 1
 * 
 * @param speed
 * @type Number
 * @default 20
 * 
 * @param duration
 * @type Number
 * @default 20
 * }
 */ 



(function(){

    
    var _ = PluginManager.parameters('guzu_AnimationsExtraEffects');
    //Put the shake in the animation data
    _onload=DataManager.onLoad;
    DataManager.onLoad=function(){
        var i;
        _onload.apply(this,arguments);
        var q=toJson("all:"+_["shake"]);q=q.all;
        for (i in q){
            q[i]=toJson(q[i]);
        }


        var d=$dataAnimations;
        //console.log("calling this:",d)
        for ( i in d)if (d[i]){
            for (var j in q){
                //console.log((q[j]["animationId"]),d[i].id)
                if (Number(q[j]["animationId"])==d[i].id){
                    if(!d[i].shakeAt)d[i].shakeAt={};
                    //console.log("test")
                    d[i].shakeAt[Number(q[j]["frame"])]=[
                        Number(q[j]["power"]),
                        Number(q[j]["speed"]),
                        Number(q[j]["duration"])
                    ]
                }
            }
        }
    }

    var SA_update=Sprite_Animation.prototype.update;
    Sprite_Animation.prototype.update = function() {
        SA_update.apply(this,arguments);
        window.f=this;
        //console.log(this.currentFrameIndex())
        var s=$dataAnimations[this._animation.id].shakeAt;
        if (this.currentFrameIndex()==0){
            if (this._prevFrame_==0 && unhide)
                _sprite(unhide)._hiding=true;
            if (tozoom)
                $gameScreen.startZoom(this.x+Number(tozoom[0]),
            this.y+Number(tozoom[1]),
            Number(tozoom[2]),
            Number(tozoom[3]),
            )
        }

        if (this._duration==1){
            if(unhide){
                _sprite(unhide)._hiding=false
                unhide=null;
            }

            if (tozoom){
                if (tozoom)
                $gameScreen.startZoom(this.x+Number(tozoom[0]),
                    this.y+Number(tozoom[1]),
                    1,
                    Number(tozoom[3]),
                    );
            }

        }



        if (this._prevFrame_!= this.currentFrameIndex()){
            //Shake effect
            if (s && s[this.currentFrameIndex()]){
                    s=s[this.currentFrameIndex()];
                    //console.log("SHADE",$gameScreen.startShake,s);
                    $gameScreen.startShake(s[0],s[1],s[2]);
            }
            
        }

        this._prevFrame_=this.currentFrameIndex();
        
    }


    //#region Allow Hiding Battler
    //ensure battler knows its sprite
    var _sprites={};//all actors, {_actorId:sprite}
    function _sprite(actor){
        return _sprites[actor._actorId];
    }

    
    var SB_setBattler=Sprite_Battler.prototype.setBattler;
    
    Sprite_Battler.prototype.setBattler = function(battler) {
        //console.log("set battler:",battler)
        SB_setBattler.apply(this,arguments);
        if (battler)_sprites[battler._actorId]=this;
    }

    var BM_startAction=BattleManager.startAction;
    var unhide=null;
    var tozoom=null;
    BattleManager.startAction=function(){
        BM_startAction.apply(this);
        var subject = this._subject;
        var action = subject.currentAction();
        var targets = action.makeTargets();
        var meta=$dataSkills[action._item._itemId].meta;
        //console.log( subject,action,targets);
        
        if (meta.hideBattler && !_sprite(subject)._hiding)
            unhide=subject;

        tozoom=!meta.zoom?null:meta.zoom.split(",");

    }

    var BM_endAction=BattleManager.endAction;
    BattleManager.endAction=function(){
        BM_endAction.apply(this);
        //console.log(unhide)
        //if (unhide)
        //    unhide._sprite_._hiding=!true;
        //unhide=null;
    }

    //#endregion Allow Hiding Battler



    SB_updatePosition=Spriteset_Base.prototype.updatePosition;
    Spriteset_Base.prototype.updatePosition = function() {
        SB_updatePosition.apply(this);
        var shakeY=Number(_["shakeY"]);
        if (!shakeY)
            return;


        var screen = $gameScreen;
        this._shakeDirectionY=this._shakeDirectionY|1;
        this.y += Math.abs(Math.round(screen.shake())*shakeY)*this._shakeDirectionY;
        

        if (this.y > screen._shakePower * 2) {
            this._shakeDirectionY = -1;
        }
        if (this.y < - screen._shakePower * 2) {
            this._shakeDirectionY = 1;
        }
        
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
    window.toJson=toJson;

})()