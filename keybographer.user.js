// ==UserScript==
// @name Keybographer for Klavogonki
// @description A script to record, analyze and present the keybogarm of a Klavogonki race.
// @author MMMAAANNN
// @license 
// @version 
// @include http://klavogonki.ru/g/?gmid=*

(function (window, undefined) {
    var w;
    if (typeof unsafeWindow != undefined) {
        w = unsafeWindow
    } else {
        w = window;
    }
    if (w.self != w.top) {
        return;
    }
    // [4] дополнительная проверка наряду с @include
    if (/http:\/\/klavogonki.ru\/g\//.test(w.location.href)) {
        //Ниже идёт непосредственно код скрипта
        alert("Test of basic userscript template.");
    }
})(window);
