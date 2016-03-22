// ==UserScript==
// @name Keybographer for Klavogonki
// @namespace   klavogonki
// @description A script to record, analyze and present the keybogarm of a Klavogonki race.
// @author MMMAAANNN
// @license 
// @version 
// @include http://klavogonki.ru/g/*
// @run-at      document-end
// ==/UserScript==

var keybogramShower = document.createElement('div');
keybogramShower.setAttribute('id', 'keybogramShower');
document.body.appendChild(keybogramShower);

var keyboAnalysis = document.createElement('div');
keyboAnalysis.setAttribute('id', 'keyboAnalysis');
keyboAnalysis.innerHTML = '<b>Analysis</b>';
keybogramShower.appendChild(keyboAnalysis);

var keyboDetail = document.createElement('div');
keyboDetail.innerHTML = '<b>Detailed Keybogram</b>';
keybogramShower.appendChild(keyboDetail);

var keyboTable = document.createElement('table');
keyboTable.setAttribute('id', 'keyboTable');
keyboTable.setAttribute('border', '1px');
keybogramShower.appendChild(keyboTable);

function keybographer() {
	var keybogram = [];
    var lastEventPoint1 = 0;
    var lastEventPoint2 = 0;
    var finish = false;
    eventRecorder = function(event) {
    	var thisEventPoint1 = event.timeStamp.toFixed(3);
    	var thisEventPoint2 = performance.now().toFixed(3);
    	if (game.gamestatus === 'racing' && !finish) {
	        var line = [game.gamestatus,
        			   game.finished,
        			   game.error ? 'ERROR!' : '&middot;',
        			   event,
        			   event.code,
        			   event.type,
        			   event.target.id,
        			   thisEventPoint1,
        			   thisEventPoint2,
        			   (thisEventPoint1-lastEventPoint1).toFixed(3),
        			   (thisEventPoint2-lastEventPoint2).toFixed(3),
        			   document.getElementById('inputtext').value.replace(' ', '&middot;')];
            keybogram.push(line);
	    }
        lastEventPoint1 = thisEventPoint1;
	    lastEventPoint2 = thisEventPoint2;
	    if (finish != game.finished) { analyze(); }
	    finish = game.finished;
    }
    document.onkeydown = eventRecorder;
    document.onkeypress = eventRecorder;
    document.onkeyup = eventRecorder;

    function analyze() {
    	var keydowns = keybogram.filter(function(event) {
    		return event[5] === "keydown"
    	});
    	var keypresses = keybogram.filter(function(event) {
    		return event[5] === "keypress"
    	});

    	// This is not exactly the clean speed (as in brutto* or gross* in TypingStatistics).
    	// This simplified method does not account for cases where backspace or control-backspace
    	// deletes normal, non-erratic fragments of the text.
    	var totalTime = keypresses[keypresses.length - 1][7] - keypresses[0][7];
    	var errorTime = 0;
    	for (var eventCounter = 1; eventCounter < keydowns.length; eventCounter++) {
    		if (keydowns[eventCounter][2] === 'ERROR!' && keydowns[eventCounter - 1][2] != 'ERROR!') {
    			errorTime -= parseFloat(keydowns[eventCounter - 1][7]);
    			console.log(errorTime);
    		}
    		if (keydowns[eventCounter][2] != 'ERROR!' && keydowns[eventCounter - 1][2] === 'ERROR!') {
    			errorTime += parseFloat(keydowns[eventCounter - 1][7]);
    			console.log(errorTime);
    		}
    	}

    	var netSpeed = 60000 * game.text.length / totalTime;
    	var cleanSpeed = 60000 * game.text.length / (totalTime - errorTime);

    	report = 'Net speed: ' + netSpeed.toFixed(2) + '<br/>';
    	report += 'Error time: ' + errorTime.toFixed(2) + '<br/>';
    	report += 'Clean speed: ' + cleanSpeed.toFixed(2) + '<br/>';

		var analysis = document.createElement('div');
		analysis.innerHTML = report;
		document.getElementById('keyboAnalysis').appendChild(analysis);
		
		// Showing detailed keybogram
		for (var k = 0; k < keybogram.length; k++) {
			line = keybogram[k];
	        printLine = document.createElement('tr');
	        for (var i = 0; i < line.length; i++) {
	        	printCell = document.createElement('td');
	        	printCell.innerHTML = line[i];
	        	printLine.appendChild(printCell);
	        }
        	document.getElementById('keyboTable').appendChild(printLine);
    	}
    }
}

var script = document.createElement("script");
script.innerHTML = "(" + keybographer + ")()";
document.body.appendChild(script);
