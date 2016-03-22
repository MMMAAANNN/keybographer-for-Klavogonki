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
    document.onkeydown = function(ev) {console.log(ev.code, performance.now())}
}

var script = document.createElement("script");
script.innerHTML = "(" + keybographer + ")()";
document.body.appendChild(script);
