"use strict";

let btn = document.getElementById("myButton");

function sendText(){
    let input = document.getElementById("myInput").value;
    let output = document.getElementById("myOutput");
    output.value = input;
}

btn.addEventListener("click", sendText);     