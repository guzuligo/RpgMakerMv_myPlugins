//TODO
/*:
 * @plugindesc jump
 * @author guzu ligo
 * 
 * 
 * @help
 * Version .231207
 * **Jumping mechanics**
 * To allow player to jump over this obsticle, add a script in the event with code: 
 * this.jumpover()
 * Also, put following in the notes
 * <d:direction> in the direction, use L,R,U,D,O for left right up down and all directions
 * or LR for left and right or UD for up and down. Example: <d:LR>
 * 
 * <p:#> for the number of tiles to jump over. Typically, this should be <p:2>
 * 
 * <o:x,y> for additional offset. This is useful to offset player for high elevations
 * example: <o:0,-1>
 * 
 * <offset:x,y> this will offset the event by x and y.
 * Example <offset:0.5,0.5> will put the event in a location you can't usually place
 * 
 * You can also put the code in a condition as this.jumpover() will return true if jump successful.
 * This could help decide to add additional sfx or vfx to the jump.
 * 
 * 
 * 
 * Scripts:
 * You can use the following functions in the script
 * 
 * this.delta(a_number)
 * Returns following based on the number starting from 0 
 * [x difference, y difference, dx but positive, dy positive, dx sign, dy sign, dx+dy as distance]
 * 
 * this.getMeta(metaName,toNumber)
 * Returns the meta from the notes of the event
 * 
 * this.getEventData()
 * Returns event data from database
 * 
 * this.getEvent()
 * Returns current event
 * 
 * this.inRect(x,y,x2,y2)
 * Returns true if current event is in the boundries specified
 * 
 * 
 * gameVariables extended
 * flags start from 1
 * $gameVariables.setFlag(variable,flag,true or false)
 * $gameVariables.getFlag(variable,flag) returns true or false
 * $gameVariables.getFlagGroup(variable,flagGroup) flag group is either an array of flags
 *  or bitwise check.
 *  Example of array:
 *      $gameVariables.getFlagGroup(1,[1,2,3])
 *  Example of bitwise:
 *      $gameVariables.getFlagGroup(1,7)
 *      flags 1,2 and 3 are actually 1+2+4, which is bitwise 7
 */
(function(){
    var _ = PluginManager.parameters('guzu_mechanics');

    Game_Interpreter.prototype.getMeta=function(metaName,toNumber){
        var result=metaName?
        $dataMap.events[this._eventId].meta[metaName]
       :$dataMap.events[this._eventId].meta;
        return toNumber?Number(result):result;
    }
    Game_Interpreter.prototype.getEventData=function(){
        return $dataMap.events[this._eventId];
    }

    Game_Interpreter.prototype.getEvent=function(id_or_name,asArray=false){
        if(!id_or_name)
            return $gameMap._events[this._eventId];
        if (!isNaN(id_or_name))
            $gameMap._events[id_or_name];
        else{
            var results=[];
            for (var i=1;i<$dataMap.events.length;i++)
                if ($dataMap.events[i].name==id_or_name)
                    results.push($gameMap._events[i]);
            return asArray?results:results[0];
        }
    }

    /* returns distance to player
     * v specifies which part of the array to return
     * otherwise, returns array 
     * [
     * 0: deltaX,
     * 1: deltaY,
     * 2: distanceX,
     * 3: distanceY,
     * 4: signDX,
     * 5: signDY,
     * 6: dx+dy]
    */
    Game_Interpreter.prototype.delta=function(v){
        var x=$gameMap._events[this._eventId].x-$gamePlayer.x;
        var y=$gameMap._events[this._eventId].y-$gamePlayer.y;
        var result=[x,y
            ,Math.abs(x),Math.abs(y)
            ,Math.sign(x),Math.sign(y)
        ];
        result.push(
            result[2]+result[3],//distance
            0//unused
        )
        return (v==undefined)?result:result[v&7]
    }

    //TODO: add it to Game_Event too
    Game_Event.prototype.jumpover=function(){
        console.warn("NOT IMPLEMENTED YET")
        return ;
    }
    Game_Interpreter.prototype.jumpover=function(){
       return jumpover($dataMap.events[this._eventId]);
    }
    Game_Event.prototype.inRect=function(x,y,x2,y2){
        e=this;
        return e.x>=x && e.x<=(x2||x) && e.y>=y && e.y<=(y2||y);
    }
    Game_Interpreter.prototype.inRect=function(x,y,x2,y2){
        return this.getEvent().inRect(x,y,x2,y2);
        
    }
    
    Game_Event.prototype.setSelfSwitch=function(_switch,value=true){
        var key = [this._mapId, this._eventId,_switch];
        return $gameSelfSwitches.setValue(key,value);
    }
    Game_Event.prototype.getSelfSwitch=function(_switch){
        var key = [this._mapId, this._eventId,_switch];
        return !!$gameSelfSwitches.value(key);
    }

    var Game_Event_initialize=Game_Event.prototype.initialize;
    Game_Event.prototype.initialize = function(){
        
        Game_Event_initialize.apply(this,arguments);
        var e=$dataMap.events[this._eventId];
        //console.log(e)
        var meta=e.meta;
        
        if (meta&& meta.offset){
            var p=meta.offset.split(",");
            //console.log(p)
            this.jump(
                0*this.x+Number(p[0]||0)
                ,
                0*this.y+Number(p[1]||0)
            );
            this.refresh();
        }
    }
    function jumpover(event){
        var e=$gameMap._events[event.id];
        //console.log("e:",e,event)
        var __xd=(e.x-$gamePlayer.x);
        var __yd=(e.y-$gamePlayer.y);
        var meta =event.meta;
        var Jump__success__=false;
        
        var __j=meta.j||meta.d;//d direction or j for backward compatibility
        if(__j)
            __j=(__j).trim().toLowerCase();
        else //if not set
            __j=__xd>0?"r":__xd<0?"l":__yd>0?"d":__yd<0?"u":null;
        //console.log("__j:",__j)
        if (!__j){//all direction assignments failed?
           
            return false;
        }
    
        var __o=(meta.o||"0,0").split(",");
        var __p=Number(meta.p||1);
        
        var u=__j.indexOf("u")!=-1;var l=__j.indexOf("l")!=-1;
        var d=__j.indexOf("d")!=-1;var r=__j.indexOf("r")!=-1;
        var o=__j.indexOf("o")!=-1;
        //var __x=__p*((__j=="r")-(__j=="l")  + (__j=="lr" || __j=="rl" || __j=="o")*Math.sign(__xd));
        //var __y=__p*((__j=="d")-(__j=="u")  + (__j=="ud" || __j=="du" || __j=="o")*Math.sign(__yd));
        var __x=__p*Math.sign(__xd)*(l||r||o);
        var __y=__p*Math.sign(__yd)*(u||d||o);

        __x*=(__xd!=0)&&(Math.sign(__x)==Math.sign(__xd))
        __y*=__yd!=0&&(Math.sign(__y)==Math.sign(__yd))
        if(__x || __y){ 
            Jump__success__=true;
            $gamePlayer.jump(__x+Number(__o[0]),__y+Number(__o[1]))
        }
        return Jump__success__;
    }

    var Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    //TODO: test again
    Game_Interpreter.prototype.pluginCommand = function( command, args ) {
        Game_Interpreter_pluginCommand.call( this, command, args );
        //console.log("fest \""+command+"\"")
        command=command.trim().toLowerCase()
        switch ( command ) {
            case 'jumpover' :
            //console.log("test",$dataMap.events[this._eventId].meta)
            jumpover($dataMap.events[this._eventId]);
            break;

            case 'jumpoverv2':

                break;

        }
    }


    //TODO: Test again
    //sets in one variable
    Game_Variables.prototype.setFlag=function(_var,_flag,_bool=true){
        //flags start from 1
        if (_bool)
            $gameVariables.setValue(_var,$gameVariables.value(_var)|(1<<--_flag));
        else
            $gameVariables.setValue(_var,$gameVariables.value(_var)&~(1<<--_flag));
    }
    Game_Variables.prototype.getFlag=function(_var,_flag){
        //flags start from 1
        return ($gameVariables.value(_var)&(1<<--_flag))!=0;
    }
    //flag group will check binary check. Example 7 is 0,1 and 2
    Game_Variables.prototype.getFlagGroup=function(_var,_flagGroup){

        if (Array.isArray(_flagGroup)){
            var a=_flagGroup;_flagGroup=0;
            for (var i=0;i<a.length;i++)
                _flagGroup|=1<<(a[i]-1);
        }

        return ($gameVariables.value(_var)&(_flagGroup))==_flagGroup;
    }



    return "love"
}

)();