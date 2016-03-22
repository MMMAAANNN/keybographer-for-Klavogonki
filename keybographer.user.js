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

function keybographer() {
    var keybogram = [];
    document.onkeydown =  function(ev) {
        keybogram.push(ev.code, performance.now());
        $('footer') = keybogram;
    };
}

var script = document.createElement("script");
script.innerHTML = "(" + keybographer + ")()";
document.body.appendChild(script);
