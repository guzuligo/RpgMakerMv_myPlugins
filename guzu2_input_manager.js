
window.guzu=window.guzu||{};
//TODO: use TouchInput to handle input
(function(){

    function guzu2_input_manager(){
        this.initialize.apply(this, arguments);
    }

    guzu2_input_manager.prototype.constructor=guzu2_input_manager;
    guzu2_input_manager.prototype._keyAreas={};//key definitions
    guzu2_input_manager.prototype.keyArea={};//key states
    guzu2_input_manager.prototype.initialize=function(visual_manager){
        window.guzu.object_manager.prototype.initialize.call(this);
        //this._visual_manager = visual_manager;
        //this._setupInputListeners();
    }

    

    guzu2_input_manager.prototype._handleMouseDown=function(x, y){
        console.log("Mouse down at: ", x, y);
        // Here you can add logic to interact with objects in the visual manager
    }

    guzu2_input_manager.prototype.add=function(key,bounds, callback){
        this._keyAreas[key]={bounds:bounds, callback:callback};
        this.keyArea[key]=false;
    }

    guzu2_input_manager.prototype._isPointInBounds=function(bounds, x, y){
        //if bounds is array, use format [x,y,x2,y2]

        if (bounds instanceof Array){
            return x >= bounds[0] && x <= bounds[2] &&
                   y >= bounds[1] && y <= bounds[3];
        }

        //if bounds is object, use format {x:,y:,width:,height:}, if x2 exists, use that instead of width
        else if (typeof bounds === 'object'){
            var x2 = bounds.x2 !== undefined ? bounds.x2 : bounds.x + bounds.width;
            var y2 = bounds.y2 !== undefined ? bounds.y2 : bounds.y + bounds.height;
            return x >= bounds.x && x <= x2 &&
                   y >= bounds.y && y <= y2;
        }

    }
    guzu2_input_manager.prototype.update=function(){
        // Check each key's bounds to see if it was pressed
        for (var key in this._keyAreas) {
            var keyData = this._keyAreas[key];
            if ( TouchInput.isPressed() && this._isPointInBounds(keyData.bounds, TouchInput.x, TouchInput.y)) {
                this.keyArea[key] = true;
                console.log("Key pressed: ", key);
                if (keyData.callback) {
                    keyData.callback();
                }
            } else {
                this.keyArea[key] = false;
            }
        }
    }

    guzu2_input_manager.prototype.xy=function(){
        return {x:TouchInput.x, y:TouchInput.y};
    }


    //////////////////////////////
    //////////////////////////////
    // End of guzu2_input_manager class
    //////////////////////////////
    //////////////////////////////
    window.guzu.input_manager = guzu2_input_manager;
})();