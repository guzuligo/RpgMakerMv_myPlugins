/*:
 * 
 * @plugindesc SVG enabler
 * @author guzu ligo
 * 
 * 
 * @help
 * 
 * Add your svg file besides your png file. 
 * Name your png file as "filename@svg.png".
 * 
 * Once you publish your files, you can delete all your @svg.png files
 * 
 */
(function(){
    var _ = PluginManager.parameters('enable svg');
    var HHH=Bitmap.prototype._requestImage;
    Bitmap.prototype._requestImage = function(){
        //console.log("path",arguments[0])
        if (arguments[0].length>8)
            if(arguments[0].slice(-8).slice(0,4)=="@svg")
                arguments[0]=arguments[0].slice(0,-8)+".svg"
        
        HHH.apply(this,arguments);

    }
})()