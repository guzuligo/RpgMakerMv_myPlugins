/*:
 * @plugindesc Show Enemy HP in the menu
 * @author guzu ligo
 * 
 * @param show hp
 * @type boolean
 * @default true
 * @param show mp
 * @type boolean
 * @default true
 * 
 * @param bar colors
 * @type struct<colorRange>
 * @default {"hp color1":"FF3300","hp color2":"FFDDDD","mp color1":"442277","mp color2":"DDDDFF"}
 * 
 * @param hp text visible
 * @type boolean
 * @default true
 */ 

 /*~struct~colorRange:
 * {
 * @param hp color1
 * @default FF3300
 * 
 * @param hp color2
 * @default FFDDDD
* @param mp color1
 * @default 442277
 * 
 * @param mp color2
 * @default DDDDFF
 * }
 */

(function(){
    var DEBUG_=true;
    var _ = PluginManager.parameters('EnemyBar');
    var c=_["bar colors"];
    //console.log("C",c);
    c=JSON.parse(_["bar colors"])
    //console.log(c);
    c=[
        "#"+(c["hp color1"]||0),
        "#"+(c["hp color2"]||0),
        "#"+(c["mp color1"]||0),
        "#"+(c["mp color2"]||0)
    ]
    if(DEBUG_)console.log(c);
    //console.log("Done C")
    var alias_WBD=Window_BattleEnemy.prototype.drawItem;
    Window_BattleEnemy.prototype.drawItem = function(index) {
        var r = this.itemRectForText(index);
        window.eb=c;
        //console.log(_);
        var e=this._enemies[index]
        
        var w;
        w=e.hp/e.mhp;if (isNaN(w))w=1;//console.log("w=",w)
        if (_["show hp"]=="true")
            this.drawGauge(r.x,r.y-2,r.width,w,
            c[0],c[1]);
    
        w=e.mp/e.mmp;if (isNaN(w))w=1;//console.log("w=",w)
        if (_["show mp"]=="true")
            this.drawGauge(r.x,r.y+4,r.width,w,
            c[2],c[3]);
        //(text, x, y, maxWidth, lineHeight, align)
        //console.log(this._context)
        if (_["hp text visible"]=='true'){
            this.contents.fontSize/=2;
            w=e.hp+"/"+e.mhp;
            this.drawText(w,r.x,r.y,r.width,'right')
            //w=e.mp+"/"+e.mmp;
            //this.drawText(w,r.x,r.y+14,r.width,'right')
            this.contents.fontSize*=2;
        }
        //console.log("Done?")
        alias_WBD.apply(this,arguments);
    }
})()
