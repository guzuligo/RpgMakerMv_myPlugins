/*:
 * @plugindesc extra
 * @author guzu ligo
 * 
 * 
 * 
 * 
 * 
 * @help
 * Version .231109
 * 
 * To make a skill add state to player, put following in note. 10 means sleep for default
 * <addState:10>
 * To include 50% chance (will be multiplied by stateRate)
 * <addState:10,.5>
 * 
 * REVIVE AFTER BATTLE
 * To make player recover after combat ends, add following to class or actor notes
 * <unko>
 * 
 * 
 * GUARD FORMULA EDIT
 * In the Actor note, write:
 * <guard:a:100,ax:1,b:2>
 * This will subtract 100*guard*ax from attack, then devide 2*guard from the remaining
 * 
 */


(function(){
    var DEBUG_=true;
    var _ = PluginManager.parameters('guzu_extra');


    //#region <addState>
    var BM_startAction=BattleManager.startAction;
    BattleManager.startAction=function(){
        BM_startAction.apply(this);
        var subject = this._subject;
        var action = subject.currentAction();
        var targets = action.makeTargets();
        var meta=$dataSkills[action._item._itemId].meta;
        //console.log( subject,action,targets);
        var addstate=meta.addState || meta.addstate
        if (addstate){
            var c=addstate.split(",");
            var r=Math.random();
            console.log("rate",r,Number(c[1])*subject.stateRate(Number(c[0])))
            if(!c[1] || r< Number(c[1])*subject.stateRate(Number(c[0])) )
                subject.addState(Number(c[0]));
        }

    }
    //#endregion
    //#region  <UNKO>
    var BM_updateBattleEnd=BattleManager.updateBattleEnd;
    BattleManager.updateBattleEnd=function(){
        BM_updateBattleEnd.apply(this,arguments);
        var m=BattleManager.allBattleMembers();
        for (var i=0;i<m.length;i++){
            if (!m[i]._classId)
                continue;//not applicable to enemies
            var unko=$dataClasses[m[i]._classId].meta.unko  || 
                $dataActors[m[i]._actorId].meta.unko;
            if (unko){
                //console.log("revive")
                m[i].revive();
                m[i].removeState(m[i].deathStateId);
                m[i].refresh();
            }
        }

    }
    //#endregion

    //#region <guard>
    var GA_applyGuard=Game_Action.prototype.applyGuard;
    Game_Action.prototype.applyGuard = function(damage, target) {
        
        if(target._actorId!=undefined) try{
            
            var meta=$dataActors[target._actorId].meta;
            var guard=meta.guard;
            if (!target.isGuard() || !guard )
                return GA_applyGuard.apply(this,arguments);
            
            guard=toJson(guard);
            var result=damage;
            if (target.isGuard()){
                result-=(Number(guard.a)|0)*((Number(guard.ax)|1)*target.grd)
                var div=(Number(guard.b)|2)*target.grd;
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
    //#endregion

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

/*
chance *= target.stateRate(stateId);
        chance *= this.subject().attackStatesRate(stateId);
        chance *= this.lukEffectRate(target);
        */