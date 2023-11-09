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
 * FAST FORWARD EDIT
 * In the plugin menu, you can find the fastfarward speed when you press SHIFT during battle
 * 
 */

(function(){
    var _ = PluginManager.parameters('guzu_AltCalculations');

    //#region mods
    //$dataActors[a._actorId].meta
    





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

    
})()