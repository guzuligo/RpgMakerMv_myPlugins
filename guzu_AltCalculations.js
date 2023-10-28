/*:
 * @plugindesc Different calculations
 * @author guzu ligo
 *
 * @param Battle Fast Forward Speed
 * @type Number
 * @default 3
 * 
 * @help
 * Version Date 20OCT2028
 * 
 * GUARD EDIT
 * In the Actor note, write:
 * <guard:a:100,ax:1,b:2>
 * This will subtract 100*guard*ax from attack, then devide 2*guard from the remaining
 * 
 * FAST FORWARD EDIT
 * In the plugin menu, you can find the fastfarward speed when you press SHIFT during battle
 * 
 */

(function(){
    var _ = PluginManager.parameters('guzu_AltCalculations');

    //#region mods
    //$dataActors[a._actorId].meta
    var GA_applyGuard=Game_Action.prototype.applyGuard;
    Game_Action.prototype.applyGuard = function(damage, target) {
        
        if(target._actorId!=undefined) try{
            
            var meta=$dataActors[target._actorId].meta;
            var guard=meta.guard;
            if (!guard )
                return GA_applyGuard.apply(this,arguments);
            
            guard=toJson(guard);
            var result=damage;
            if (target.isGuard()){
                result-=(Number(guard.a)|0)*((Number(guard.ax)|1)*target.grd)
                var div=(Number(guard.b)|1)*target.grd;
                console.log((Number(guard.a)|0),((Number(guard.ax)|1),target.grd),div)
                if (div<=0)div=1;
                result/=div;
                if (result<0)
                result=0;
            }
            
            window.aaa=[result,guard]
            return result;//GA_applyGuard.apply(this,arguments);
        }
        catch(XX){
            console.error(XX);
        }
        return GA_applyGuard.apply(this,arguments);
    };





    //Only modify fast forward if it is set other that default
    if (Number(_["Battle Fast Forward Speed"])!=3){
        Window_BattleLog.prototype.updateWaitCount = function() {
            if (this._waitCount > 0) {
                this._waitCount -= this.isFastForward() ? Number(_["Battle Fast Forward Speed"]) : 1;
                if (this._waitCount < 0) {
                    this._waitCount = 0;
                }
                return true;
            }
            return false;
        };
    }

    //#endregion mods




    if(false){
    var qq=Sprite_Animation.prototype.isPlaying;
    Sprite_Animation.prototype.isPlaying=function(){
        qq.apply(this,arguments);
        console.log(this.name,"Skill is playing")
        window.qq=this;
    }
}


    
    //ensures the animation knows the caster
    //Game_Battler.prototype.startAnimation = function(animationId, mirror, delay) {
    var GB_startAnimation=Game_Battler.prototype.startAnimation;
    Game_Battler.prototype.startAnimation=function(){
        GB_startAnimation.apply(this,arguments);
        //this._animations[this._animations.length-1]._battler_=this;
        //this._sprite_.hide()
        
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
})()