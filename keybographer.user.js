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
keyboAnalysis.innerHTML = '<b>Keybogram Analysis</b>';
keybogramShower.appendChild(keyboAnalysis);

var keyboDetail = document.createElement('div');
keyboDetail.innerHTML = '<b>Detailed Keybogram</b>';
keybogramShower.appendChild(keyboDetail);

var keyboTable = document.createElement('table');
keyboTable.setAttribute('id', 'keyboTable');
keyboTable.setAttribute('border', '1px');
keybogramShower.appendChild(keyboTable);

function keybographer() {
  setTimeout(function() {
    var keybogram = [];
    var finish = false;
    eventRecorder = function(event) {
    	if (keybogram.length === 0) {
    		game.lag = (new Date).getTime() - game.begintime;
    	}
    	if (game.gamestatus === 'racing' && !finish) {
	        event.game = {
                                status: game.gamestatus,
                                error:  game.error,
                                input:  document.getElementById('inputtext').value
                             };
                keybogram.push(event);
        }
        if (finish != game.finished) { analyze(); }
        finish = game.finished;
    }
    document.onkeydown = eventRecorder;
    document.onkeypress = eventRecorder;
    document.onkeyup = eventRecorder;

    function analyze() {
    	game.keybogram = keybogram;
    	var keydowns = keybogram.filter(function(downSeeker) {
    		return downSeeker.type === "keydown";
    	});

    	var keypresses = keybogram.filter(function(pressSeeker) {
    		return pressSeeker.type === "keypress";
    	});
        
        // This is the totalTime algorithm used in TypingStatistics.
        // It does not account for preceding keydown of a Shift. This is why 'keypresses' are used.
    	var totalTime = keypresses[keypresses.length - 1].timeStamp - keypresses[0].timeStamp;

    	// This is not the full time needed for the clean speed
    	// (as in brutto* or gross* in TypingStatistics).
    	// This simplified method does not account for cases where backspace or control-backspace
    	// deletes normal, non-erratic fragments of the text ("overcorrection time").
    	var errorTime = 0;
    	for (var eventCounter = 1; eventCounter < keydowns.length; eventCounter++) {
    		if (keydowns[eventCounter].game.error && !keydowns[eventCounter - 1].game.error) {
    			errorTime -= keydowns[eventCounter - 1].timeStamp;
    		}
    		if (!keydowns[eventCounter].game.error && keydowns[eventCounter - 1].game.error) {
    			errorTime += keydowns[eventCounter - 1].timeStamp;
    		}
    	}

        var netSpeed = 60000 * game.text.length / totalTime;
        var cleanSpeed = 60000 * game.text.length / (totalTime - errorTime);

    	report  = 'Start lag: '     + game.lag                      + ' ms<br/>';
        report += 'Total time: '    + (totalTime/1000).toFixed(3)   + ' ms<br/>';
    	report += 'Error time: '    + (errorTime/1000).toFixed(3)   + ' ms<br/>';
    	report += 'Net speed: '     + netSpeed.toFixed(2)           + ' cpm<br/>';
    	report += 'Clean speed: '   + cleanSpeed.toFixed(2)         + ' cpm<br/>';
    	report += 'Text length: '   + game.text.length              + ' characters<br/>';
    	report += 'No. of keydowns: ' + keydowns.length             + ' events<br/>';
    	report += 'No. of keypresses: ' + keypresses.length         + ' events<br/>';

		var analysis = document.createElement('div');
		analysis.innerHTML = report;
		document.getElementById('keyboAnalysis').appendChild(analysis);
		
		// Showing detailed keybogram
		tableHeader = document.createElement('tr');
		tableHeader.innerHTML = '<th>Type</th><th>Code</th><th>Time</th><th>Error state</th><th>Result in inputtext</th>';
		document.getElementById('keyboTable').appendChild(tableHeader);
		for (var k = 0; k < keybogram.length; k++) {
			var ev = keybogram[k];
			var line = [ ev.type,
						 ev.code,
						(ev.timeStamp - keybogram[0].timeStamp + game.lag).toFixed(3),
						 ev.game.error ? "ERROR" : " ",
						 ev.game.input]
	        printLine = document.createElement('tr');
	        if (ev.type === 'keyup') {
	        	printLine.setAttribute('style', 'color: #cccccc');
	        }
	        if (ev.type === 'keydown') {
	        	printLine.setAttribute('style', 'color: #666999');
	        }
	        if (ev.game.error) {
	        	printLine.setAttribute('style', 'background: #ff9999');
	        }
	        for (var i = 0; i < line.length; i++) {
	        	printCell = document.createElement('td');
	        	printCell.innerHTML = line[i];
	        	printLine.appendChild(printCell);
	        }
        	document.getElementById('keyboTable').appendChild(printLine);
    	}
    }
  }, 100);
}

var script = document.createElement("script");
script.innerHTML = "(" + keybographer + ")()";
document.body.appendChild(script);