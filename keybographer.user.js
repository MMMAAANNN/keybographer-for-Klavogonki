// ==UserScript==
// @name Keybographer for Klavogonki
// @namespace   klavogonki
// @description A script to record, analyze and present the keybogarm of a Klavogonki race.
// @author MMMAAANNN
// @license 
// @version 0.0.7.7
// @include http://klavogonki.ru/g/*
// @run-at      document-end
// ==/UserScript==

function mainK() {
    var Keybographer = {    

        verboseStatus: false,

        keybogram: [],

        watchedTarget: document.getElementById('inputtext'),

        interimReports: 0,

        status: function(message){
            if (game.gamestatus != 'racing' || game.finished || Keybographer.verboseStatus) {
                document.getElementById('keybographerStatus').innerHTML = message;
            } else {
                document.getElementById('keybographerStatus').innerHTML = '...';
            }
        },

        initialize: function (){
            var keybogramShower = document.createElement('div');
            keybogramShower.id = 'keybogramShower';
            document.getElementById('status-block').appendChild(keybogramShower);

            var keybographerStatus = document.createElement('div');
            keybographerStatus.innerHTML = 'Keybographer status line initialized.';
            keybographerStatus.id = 'keybographerStatus';
            keybogramShower.appendChild(keybographerStatus);

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

            Keybographer.lag = false;
            this.record();
        },

        record: function () {
            this.status('Keybographer is waiting for the start of the race...');
            this.watchedTarget.addEventListener('keydown', this.eventRecorder, true);
            this.watchedTarget.addEventListener('keypress', this.eventRecorder, true);
            this.watchedTarget.addEventListener('keyup', this.eventRecorder, true);
            this.watchedTarget.addEventListener('focus', this.eventRecorder, true);
            this.watchedTarget.addEventListener('blur', this.eventRecorder, true);
            this.timer = setInterval(Keybographer.initiateAnalysis, 500);
        },

        eventRecorder: function(event) {
            Keybographer.status('Recording event no. ' + (Keybographer.keybogram.length + 1));
            if (event.type === 'keypress' && !Keybographer.lag) {
                Keybographer.lag = (new Date()).getTime() - game.begintime;
        	}
	        event.game = {
                                status: game.gamestatus,
                                error:  game.error,
                                inputStatus:  document.getElementById('inputtext').value
                             };
            // Backspace and Control-Backspace markup.
            // Known issue: does not handle situations like "b.8" well for Ctrl+BS.
            // Known issue: any characters outside standard Russian and English charsets.
            event.isDeleted = false;
            if (event.code === 'Backspace' && event.type === 'keydown') {
                var backwardsSeeker = Keybographer.keybogram.length - 2;
                var deletedChars = '';
                while (backwardsSeeker > -1) {
                    if (Keybographer.keybogram[backwardsSeeker + 1].game.inputStatus === '') {
                        console.log('Klavogonki-specific behaviour at', backwardsSeeker,
                                    '- Input field empty, cannot delete backwards no more!');
                        break;
                    }
                    if (Keybographer.keybogram[backwardsSeeker].type === 'keypress' &&
                        !Keybographer.keybogram[backwardsSeeker].isDeleted) {
                        deletedChars = String.fromCharCode(Keybographer.keybogram[backwardsSeeker].charCode)
                                        + deletedChars;
                        console.log(Keybographer.keybogram.length-1, backwardsSeeker, deletedChars);
                        if (event.ctrlKey) {
                            if (deletedChars.match(/[^a-zA-Zа-яА-ЯёЁ0-9][a-zA-Zа-яА-ЯёЁ0-9]/)) {
                                break;
                            } else {
                                Keybographer.keybogram[backwardsSeeker].isDeleted = true;
                            }
                        } else {
                            Keybographer.keybogram[backwardsSeeker].isDeleted = true;
                            break;
                        }
                    }
                    backwardsSeeker--;
                }
            }
            Keybographer.keybogram.push(event);
            Keybographer.status('Recorded event no. ' +
                                (Keybographer.keybogram.length) + ": " +
                                event.type + ' ' +
                                (['focus', 'blur'].indexOf(event.type) === -1 ? event.code : ''));
        },

        initiateAnalysis: function () {
            if (game.finished) {
                clearInterval(Keybographer.timer);
                console.log('Repetitive analysis timer (id', Keybographer.timer, ')stopped.');
                Keybographer.status('Final analysis started');
                var analysis = document.createElement('div');
                analysis.innerHTML = "<b>Final analysis</b>";
                document.getElementById('keyboAnalysis').appendChild(analysis);
                Keybographer.analyze();
            } else if (game.gamestatus === 'racing' && Keybographer.interimReports) {
                Keybographer.status('Interim analysis started');
                var analysis = document.createElement('div');
                analysis.innerHTML = "<b>Interim analysis</b>";
                document.getElementById('keyboAnalysis').appendChild(analysis);
                Keybographer.analyze();
            }
        },

        analyze: function() {
            // A part of what is now in 'Keybographer.report()' must be moved up here,
            // with the result as an object containing multiple calculated parameters.
            Keybographer.report();
        },

        report: function(){
            // A big part of this bloated function must be moved to .analyze().
            // This function will ultimately only receive the paramenters and
            // present them in an easily readable way to the user, without any calculations.

        	var keydowns = Keybographer.keybogram.filter(function(downSeeker) {
        		return downSeeker.type === "keydown";
        	});

        	var keypresses = Keybographer.keybogram.filter(function(pressSeeker) {
        		return pressSeeker.type === "keypress";
        	});

            // This is the totalTime algorithm used in TypingStatistics.
            // It does not account for preceding keydown of a Shift.
            // This is why 'keypresses' are used.
        	var totalTime = keypresses[keypresses.length - 1].timeStamp - keypresses[0].timeStamp;

        	// This is buggy, needs attention.
        	var errorTime = 0;
        	for (var eventCounter = 1; eventCounter < Keybographer.keybogram.length; eventCounter++) {
        		if (Keybographer.keybogram[eventCounter].game.error && !Keybographer.keybogram[eventCounter - 1].game.error) {
        			errorTime -= Keybographer.keybogram[eventCounter - 1].timeStamp;
        		}
        		if (!Keybographer.keybogram[eventCounter].game.error && Keybographer.keybogram[eventCounter - 1].game.error) {
        			errorTime += Keybographer.keybogram[eventCounter - 1].timeStamp;
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
        				correctionLossTime += keypresses[eventCounter].timeStamp -
                                              keypresses[eventCounter-1].timeStamp;
        			}
        			correctionSeriesCounter++;
        		}
        		if (!thisDeleted && previousDeleted) {
        			correctionLossTime += keypresses[eventCounter].timeStamp;
        		}
        	}

        	var typedTextLength = game.input_words.join(' ').replace(/\s+/g, ' ').length + game.last_correct_char + 1;
            var netSpeed = 60000 * typedTextLength / totalTime;
            var cleanSpeed = 60000 * (typedTextLength - correctionSeriesCounter) /
            						 (totalTime - correctionLossTime);

            // Show clean speed at a visible spot
    		var toggleAnalysis = function() {
    			$('keyboAnalysis').style.display = $('keyboAnalysis').style.display === 'none' ? 'block' : 'none';
    		};
    		var toggleKeyboDetail = function() {
    			$('keyboDetail').style.display = $('keyboDetail').style.display === 'none' ? 'block' : 'none';
    		};
    		
            Keybographer.status("Clean speed: <b>" + cleanSpeed.toFixed(2) + '</b> cpm&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
    			'<button id = "keyboAnalysisButton" onclick="(' + toggleAnalysis + ')()">Keybogram analysis</button> ' +
    			'<button id = "keyboDetailButton" onclick="(' + toggleKeyboDetail + ')()">Detailed keybogram</button><br/>');


            // Showing report
            var report;
            report  = 'Start lag: '       + Keybographer.lag                               + ' ms<br/>';
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
    		var tableHeader = document.createElement('tr');
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
    		for (var k = 0; k < Keybographer.keybogram.length; k++) {
    			var ev = Keybographer.keybogram[k];
    			var line = [ k,
    						 ev.type,
    						 ev.code,
    						 ev.charCode,
    						 ev.charCode === 32 ? '[ ]' : String.fromCharCode(ev.charCode),
    						 ev.shiftKey ? 'Shift' : '',
    						 ev.ctrlKey  ? 'Ctrl'  : '',
    						 ev.altKey   ? 'Alt'   : '',
    						(ev.timeStamp - Keybographer.keybogram[1].timeStamp + Keybographer.lag).toFixed(3),
    						k ? (ev.timeStamp - Keybographer.keybogram[k-1].timeStamp).toFixed(3) : 'N/A',
    						 ev.game.error ? "ERROR" : " ",
    						 ev.isDeleted ? 'DELETED' : '',
    						 ev.game.inputStatus.replace(' ', '&middot;')];
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
                if (ev.code === 'Backspace' && ev.type === 'keydown') {
                    style = 'background: #cccccc;';
                    if (ev.ctrlKey) {
                        style = 'background: #999999;';
                    }
                }
    	        printLine.style = style;
    	        for (var i = 0; i < line.length; i++) {
    	        	var printCell = document.createElement('td');
    	        	printCell.innerHTML = line[i];
    	        	printLine.appendChild(printCell);
    	        }
            	document.getElementById('keyboTable').appendChild(printLine);
        	}
        },
    };
    Keybographer.initialize();
}

var script = document.createElement("script");
script.id = 'keybographerScript';
script.innerHTML = "(" + mainK + ")()";
document.body.appendChild(script);