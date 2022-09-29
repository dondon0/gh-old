function addEvent(element, event, delegate ) {
    if (typeof (window.event) != 'undefined' && element.attachEvent)
        element.attachEvent('on' + event, delegate);
    else 
        element.addEventListener(event, delegate, false);
}        
    
function Game(){
    var game = document.querySelector("section#game");
    var score = game.querySelector("section#game span.score");
    var high_scores = game.querySelector("section#game ol.high-scores");
    var time = game.querySelector("section#game span.time");
    var start = game.querySelector("section#game span.start");
    
    function Gem(Class, Value, MaxTTL) {
        this.Class = Class;
        this.Value = Value;
        this.MaxTTL = MaxTTL;
    };            
    
    var gems = new Array();
    gems[0] = new Gem('green', 10, 1.2);
    gems[1] = new Gem('blue', 20, 1);
    gems[2] = new Gem('orange', 50, 0.75);
    
    function Click(event)
    {
        if(event.preventDefault) event.preventDefault();
        if (event.stopPropagation) event.stopPropagation();
        else event.cancelBubble = true;
        
        var target = event.target || event.srcElement;
        
        if(target.className.indexOf('gem') > -1){
            var value = parseInt(target.getAttribute('data-value'));
            var current = parseInt( score.innerHTML );
            score.innerHTML = current + value;
            target.parentNode.removeChild(target);
        }
        
        return false;
    }
    
    function Remove(id) {
        var gem = game.querySelector("#" + id);
        
        if(typeof(gem) != 'undefined')
            gem.parentNode.removeChild(gem);
    }
    
    function Spawn() {
        var index = Math.floor( ( Math.random() * 3 ) );
        var gem = gems[index];
        
        var id = Math.floor( ( Math.random() * 1000 ) + 1 ); 
        var ttl = Math.floor( ( Math.random() * parseInt(gem.MaxTTL) * 1000 ) + 1000 ); //between 1s and MaxTTL                
        var x = Math.floor( ( Math.random() * ( game.offsetWidth - 40 ) ) );
        var y = Math.floor( ( Math.random() * ( game.offsetHeight -  44 ) ) );
        
        var fragment = document.createElement('span');
        fragment.id = "gem-" + id;
        fragment.setAttribute('class', "gem " + gem.Class);
        fragment.setAttribute('data-value', gem.Value);        
        
        game.appendChild(fragment);

        fragment.style.left = x + "px";
        fragment.style.top = y + "px";

        setTimeout( function(){
            Remove(fragment.id);
        }, ttl)
    }
    
    function HighScores() {
        if(typeof(Storage)!=="undefined"){
            var scores = false;
            if(localStorage["high-scores"]) {
                high_scores.style.display = "block";
                high_scores.innerHTML = '';
                scores = JSON.parse(localStorage["high-scores"]);
                scores = scores.sort(function(a,b){return parseInt(b)-parseInt(a)});

                for(var i = 0; i < 10; i++){
                    var s = scores[i];                        
                    var fragment = document.createElement('li');
                    fragment.innerHTML = (typeof(s) != "undefined" ? s : "" );
                    high_scores.appendChild(fragment);
                }
            }
        } else {
            high_scores.style.display = "none";
        }
    }
    
    function UpdateScore() {
        if(typeof(Storage)!=="undefined"){
            var current = parseInt(score.innerHTML);
            var scores = false;
            if(localStorage["high-scores"]) {
    
                scores = JSON.parse(localStorage["high-scores"]);
                scores = scores.sort(function(a,b){return parseInt(b)-parseInt(a)});
                
                for(var i = 0; i < 10; i++){
                    var s = parseInt(scores[i]);
                    
                    var val = (!isNaN(s) ? s : 0 );
                    if(current > val)
                    {
                        val = current;
                        scores.splice(i, 0, parseInt(current));
                        break;
                    }
                }
                
                scores.length = 10;                                
                localStorage["high-scores"] = JSON.stringify(scores);

            } else {                        
                var scores = new Array();
                scores[0] = current;
                localStorage["high-scores"] = JSON.stringify(scores);
            }
            
            HighScores();
        } 
    }

    function Stop(interval) {
        clearInterval(interval);
    }
    
    this.Start = function() {
        score.innerHTML = "0";
        start.style.display = "none";
        var interval = setInterval(Spawn, 750);
        
        var count = 10;
        var counter = null;
        
        function timer()
        {
            count = count-1;
            if (count <= 0)
            {
                var left = document.querySelectorAll("section#game .gem");
                
                for (var i = 0; i < left.length; i++) {
                    if(left[i] && left[i].parentNode) {
                        left[i].parentNode.removeChild(left[i]);
                    }
                }
                Stop(interval);
                Stop(counter);
                time.innerHTML = "Game Over!";
                start.style.display = "block";
                
                UpdateScore();
                
                return;
            } else {
                time.innerHTML = count + "s left";
            }
        }
        
        counter = setInterval(timer, 1000); 
        
        setTimeout( function(){
            Stop(interval);
        }, count * 1000)
    };
    
    addEvent(game, 'click', Click);
    addEvent(start, 'click', this.Start);
    HighScores();
}

addEvent(document, 'readystatechange', function() {
    if ( document.readyState !== "complete" ) 
        return true;
        
    var game = new Game();        
});
