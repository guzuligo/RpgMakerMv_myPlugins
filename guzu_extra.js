/*:
 * @plugindesc extra
 * @author guzu ligo
 * 
 * 
 * 
 * 
 * 
 * @help
 * Version Date 20OCT2028
 * To make a skill add state to player, put following in note. 10 means sleep for default
 * <addState:10>
 * To include 50% chance (will be multiplied by stateRate)
 * <addState:10,.5>
 */


(function(){
    var DEBUG_=true;
    var _ = PluginManager.parameters('guzu_extra');



    var BM_startAction=BattleManager.startAction;
    BattleManager.startAction=function(){
        BM_startAction.apply(this);
        var subject = this._subject;
        var action = subject.currentAction();
        var targets = action.makeTargets();
        var meta=$dataSkills[action._item._itemId].meta;
        //console.log( subject,action,targets);
        
        if (meta.addState){
            var c=meta.addState.split(",");
            var r=Math.random();
            console.log("rate",r,Number(c[1])*subject.stateRate(Number(c[0])))
            if(!c[1] || r< Number(c[1])*subject.stateRate(Number(c[0])) )
                subject.addState(Number(c[0]));
        }

    }
})()

/*
chance *= target.stateRate(stateId);
        chance *= this.subject().attackStatesRate(stateId);
        chance *= this.lukEffectRate(target);
        */