// ==UserScript==
// @name Keybographer for Klavogonki
// @namespace   klavogonki
// @description A script to record, analyze and present the keybogarm of a Klavogonki race.
// @author MMMAAANNN
// @license 
// @version 0.0.6.2
// @include http://klavogonki.ru/g/*
// @run-at      document-end
// ==/UserScript==

var keybogramShower = document.createElement('div');
keybogramShower.id = 'keybogramShower';
document.getElementById('status-block').appendChild(keybogramShower);

var cleanSpeedIndicator = document.createElement('div');
cleanSpeedIndicator.innerHTML = 'Кейбографер запущен';
cleanSpeedIndicator.id = 'cleanSpeedIndicator';
keybogramShower.appendChild(cleanSpeedIndicator);

var keyboAnalysis = document.createElement('div');
keyboAnalysis.id = 'keyboAnalysis';
keyboAnalysis.style.display = 'none';
keyboAnalysis.innerHTML = '<b>Keybogram Analysis</b>';
keybogramShower.appendChild(keyboAnalysis);

var keyboDetail = document.createElement('div');
keyboDetail.id = 'keyboDetail';
keyboDetail.style.display = 'none';
keyboDetail.innerHTML = '<b>Detailed Keybogram</b>';
keybogramShower.appendChild(keyboDetail);

var keyboTable = document.createElement('table');
keyboTable.id = 'keyboTable';
keyboTable.setAttribute('border', '1px');
keyboDetail.appendChild(keyboTable);

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
            event.isDeleted = false;
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
    	// Backspace and Control-Backspace markup
    	for (var eventCounter = 0; eventCounter < keybogram.length; eventCounter++) {
    		var currentEvent = keybogram[eventCounter];
    		if (currentEvent.code === 'Backspace' && currentEvent.type === 'keydown') {
    			var backwardsSeeker = eventCounter - 1;
    			var deletedChars = '';
    			while (backwardsSeeker > -1) {
    				if (keybogram[backwardsSeeker + 1].game.inputStatus === '') {
    					console.log(backwardsSeeker, 'Input field empty, cannot delete backwards no more!')
    					break;
    				}
    				if ( keybogram[backwardsSeeker].type === 'keypress' &&
    					!keybogram[backwardsSeeker].isDeleted) {
    					deletedChars = String.fromCharCode(keybogram[backwardsSeeker].charCode) + deletedChars;
    					if (currentEvent.ctrlKey) {
    						console.log(backwardsSeeker, deletedChars);
    						if (deletedChars.match(/[^a-zA-Zа-яА-ЯёЁ][a-zA-Zа-яА-ЯёЁ]/)) {
    							break;
    						} else {
    							keybogram[backwardsSeeker].isDeleted = true;
    						}
    					} else {
    						keybogram[backwardsSeeker].isDeleted = true;
    						break;
    					}
    				}
    				backwardsSeeker--;
    			}
    		}
    	}

    	// To be used for debug
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

    	// This is buggy, needs attention.
    	var errorTime = 0;
    	for (var eventCounter = 1; eventCounter < keypresses.length; eventCounter++) {
    		if (keypresses[eventCounter].game.error && !keypresses[eventCounter - 1].game.error) {
    			errorTime -= keypresses[eventCounter - 1].timeStamp;
    		}
    		if (!keypresses[eventCounter].game.error && keypresses[eventCounter - 1].game.error) {
    			errorTime += keypresses[eventCounter - 1].timeStamp;
    		}
    	}

    	// This is exactly how brutto* is calculated in Typing Statistics.
    	// It completely removes everything related to the correction,
    	// including the normal keypress preceding it
    	// (probably because the pause after it is not representative).
    	var correctionLossTime = 0;
    	var correctionSeriesCounter = 0;
    	for (var eventCounter = 0; eventCounter < keypresses.length; eventCounter++) {
    		var thisDeleted = keypresses[eventCounter].isDeleted;
    		var previousDeleted;
    		if (eventCounter === 0) {
    			previousDeleted = false;
    		} else {
    			previousDeleted = keypresses[eventCounter - 1].isDeleted;
    		}
    		if (thisDeleted && !previousDeleted) {
    			correctionLossTime -= keypresses[eventCounter].timeStamp;
    			if (eventCounter > 0) {
    				correctionLossTime += keypresses[eventCounter].timeStamp - keypresses[eventCounter-1].timeStamp;
    			}
    			console.log('Detected start of a correction at keypress no.', eventCounter,
    						'Timestamp:', keypresses[eventCounter].timeStamp,
    						'Current sum of correction loss:', (correctionLossTime/1000).toFixed(3));
    			correctionSeriesCounter++;
    		}
    		if (!thisDeleted && previousDeleted) {
    			correctionLossTime += keypresses[eventCounter].timeStamp;
	    		console.log('Detected end of a correction at keypress no.', eventCounter,
							'Timestamp:', keypresses[eventCounter].timeStamp,
							'Current sum of correction loss:', (correctionLossTime/1000).toFixed(3));
    		}keypresses[eventCounter].isDeleted;
    		var previousDeleted;
    		if (eventCounter === 0) {
    			previousDeleted = false;
    		} else if (keypresses[eventCounter - 1].isDeleted) {
    			previousDeleted = true;
    		} else {
    			previousDeleted = false;
    		}
    	}

    	var typedTextLength = game.input_words.join(' ').replace(/\s+/g, ' ').length + game.last_correct_char + 1;
        var netSpeed = 60000 * typedTextLength / totalTime;
        var cleanSpeed = 60000 * (typedTextLength - correctionSeriesCounter) /
        						 (totalTime - correctionLossTime);

        // Show clean speed at a visible spot
		var toggleAnalysis = function() {
			$('keyboAnalysis').style.display = $('keyboAnalysis').style.display === 'none' ? 'block' : 'none';
		}
		var toggleKeyboDetail = function() {
			$('keyboDetail').style.display = $('keyboDetail').style.display === 'none' ? 'block' : 'none';
		}
		cleanSpeedIndicator.innerHTML = "Чистовая скорость: <b>" + cleanSpeed.toFixed(2) + '</b> зн./мин&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
			'<button id = "keyboAnalysisButton" onclick="(' + toggleAnalysis + ')()">Анализ кейбограммы</button> ' +
			'<button id = "keyboDetailButton" onclick="(' + toggleKeyboDetail + ')()">Подробная кейбограмма</button><br/>';


        // Showing report
    	report  = 'Start lag: '       + game.lag                               + ' ms<br/>';
        report += 'Total time: '      + (totalTime/1000).toFixed(3)            + ' s<br/>';
    	report += 'Correction loss: ' + (correctionLossTime/1000).toFixed(3)   + ' s<br/>';
    	report += 'Series of correctons: ' + correctionSeriesCounter		   + '<br/>';
    	report += 'Error time: '      + (errorTime/1000).toFixed(3)            + ' s<br/>';
		report += 'Net speed: '       + netSpeed.toFixed(2)                    + ' cpm<br/>';
    	report += 'Clean speed: <b>'  + cleanSpeed.toFixed(2)                  + '</b> cpm<br/>';
    	report += 'Typed text length: ' + typedTextLength           + ' characters<br/>';
    	report += 'Full text length: '  + game.text.length          + ' characters<br/>';
    	report += 'No. of keydowns: '   + keydowns.length           + ' events<br/>';
    	report += 'No. of keypresses: ' + keypresses.length         + ' events<br/>';

		var analysis = document.createElement('div');
		analysis.innerHTML = report;
		document.getElementById('keyboAnalysis').appendChild(analysis);
		
		// Showing detailed keybogram
		tableHeader = document.createElement('tr');
		tableHeader.innerHTML = '<th>Index</th>' + 
								'<th>Type</th>' + 
								'<th>Key</th>' + 								
								'<th>Code</th>' +
								'<th>Char</th>' +
								'<th>Shift</th>' + 
								'<th>Ctrl</th>' + 
								'<th>Alt</th>' + 
								'<th>Time</th>' + 
								'<th>Pause</th>' +
								'<th>Error state</th>' + 
								'<th>Deleted?</th>' + 
								'<th>Result in inputtext</th>';
		document.getElementById('keyboTable').appendChild(tableHeader);
		for (var k = 0; k < keybogram.length; k++) {
			var ev = keybogram[k];
			var line = [ k,
						 ev.type,
						 ev.code,
						 ev.charCode,
						 ev.charCode === 32 ? '[ ]' : String.fromCharCode(ev.charCode),
						 ev.shiftKey ? 'Shift' : '',
						 ev.ctrlKey  ? 'Ctrl'  : '',
						 ev.altKey   ? 'Alt'   : '',
						(ev.timeStamp - keybogram[1].timeStamp + game.lag).toFixed(3),
						k ? (ev.timeStamp - keybogram[k-1].timeStamp).toFixed(3) : 'N/A',
						 ev.game.error ? "ERROR" : " ",
						 ev.isDeleted ? 'DELETED' : '',
						 ev.game.inputStatus.replace(' ', '&middot;')]
	        var printLine = document.createElement('tr');
	        var style = '';
	        if (ev.type === 'keyup') {
	        	style = 'color: #cccccc;';
	        }
	        if (ev.type === 'keydown') {
	        	style = 'color: #666999;';
	        }
	        if (ev.isDeleted) {
	        	style = 'color: #ff3333;';
	        }
	        if (ev.game.error) {
	        	style += ' background: #ff9999';
	        }
	        printLine.style = style;
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