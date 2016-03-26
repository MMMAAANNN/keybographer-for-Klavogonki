// ==UserScript==
// @name Keybographer for Klavogonki
// @namespace   klavogonki
// @description A script to record, analyze and present the keybogarm of a Klavogonki race.
// @author MMMAAANNN
// @license 
// @version 0.0.4.1
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
  	var watchedTarget = document.getElementById('inputtext');
    var keybogram = [];
    var finish = false;
    eventRecorder = function(event) {
    	if (keybogram.length === 1) {
    		game.lag = (new Date).getTime() - game.begintime;
    	}
    	if (game.gamestatus === 'racing' && !finish) {
	        event.game = {
                                status: game.gamestatus,
                                error:  game.error,
                                inputStatus:  document.getElementById('inputtext').value
                             };
                keybogram.push(event);
        }
        if (finish != game.finished) { analyze(); }
        finish = game.finished;
        if (!(keybogram.length % 300)) console.log(keybogram);
    }
    watchedTarget.addEventListener('keydown', eventRecorder, true);
    watchedTarget.addEventListener('keypress', eventRecorder, true);
    watchedTarget.addEventListener('keyup', eventRecorder, true);
    watchedTarget.addEventListener('blur', eventRecorder, true);
    watchedTarget.addEventListener('focus', eventRecorder, true);

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
    	for (var eventCounter = 1; eventCounter < keypresses.length; eventCounter++) {
    		if (keypresses[eventCounter].game.error && !keypresses[eventCounter - 1].game.error) {
    			errorTime -= keypresses[eventCounter - 1].timeStamp;
    		}
    		if (!keypresses[eventCounter].game.error && keypresses[eventCounter - 1].game.error) {
    			errorTime += keypresses[eventCounter - 1].timeStamp;
    		}
    	}

    	var typedTextLength = game.input_words.join(' ').replace(/\s+/g, ' ').length + game.last_correct_char + 1;
        var netSpeed = 60000 * typedTextLength / totalTime;
        var cleanSpeed = 60000 * typedTextLength / (totalTime - errorTime);

    	report  = 'Start lag: '     + game.lag                      + ' ms<br/>';
        report += 'Total time: '    + (totalTime/1000).toFixed(3)   + ' s<br/>';
    	report += 'Error time: '    + (errorTime/1000).toFixed(3)   + ' s<br/>';
    	report += 'Net speed: '     + netSpeed.toFixed(2)           + ' cpm<br/>';
    	report += 'Clean speed: '   + cleanSpeed.toFixed(2)         + ' cpm<br/>';
    	report += 'Typed text length: ' + typedTextLength           + ' characters<br/>';
    	report += 'Full text length: '  + game.text.length          + ' characters<br/>';
    	report += 'No. of keydowns: '   + keydowns.length           + ' events<br/>';
    	report += 'No. of keypresses: ' + keypresses.length         + ' events<br/>';

		var analysis = document.createElement('div');
		analysis.innerHTML = report;
		document.getElementById('keyboAnalysis').appendChild(analysis);
		
		// Showing detailed keybogram
		tableHeader = document.createElement('tr');
		tableHeader.innerHTML = '<th>Type</th>' + 
								'<th>Code</th>' + 
								'<th>Shift</th>' + 
								'<th>Ctrl</th>' + 
								'<th>Alt</th>' + 
								'<th>Time</th>' + 
								'<th>Pause</th>' +
								'<th>Error state</th>' + 
								'<th>Result in inputtext</th>';
		document.getElementById('keyboTable').appendChild(tableHeader);
		for (var k = 0; k < keybogram.length; k++) {
			var ev = keybogram[k];
			var line = [ ev.type,
						 ev.code,
						 ev.shiftKey ? 'Shift' : '',
						 ev.ctrlKey  ? 'Ctrl'  : '',
						 ev.altKey   ? 'Alt'   : '',
						(ev.timeStamp - keybogram[1].timeStamp + game.lag).toFixed(3),
						k ? (ev.timeStamp - keybogram[k-1].timeStamp).toFixed(3) : 'N/A',
						 ev.game.error ? "ERROR" : " ",
						 ev.game.inputStatus]
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
}

var script = document.createElement("script");
script.innerHTML = "(" + keybographer + ")()";
document.body.appendChild(script);