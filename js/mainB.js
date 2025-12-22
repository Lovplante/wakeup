import * as rnbo from "./rnbo.js";
import * as recorder from "./recorderB.js";

// AUDIO CONTEXT
let WAContext = window.AudioContext || window.webkitAudioContext;
let context = new WAContext();

// INIT JS
await rnbo.initRnbo(context);


// IN/OUTPUT SETUP
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const micSource = context.createMediaStreamSource(stream);

rnbo.connectInput(micSource);
rnbo.connectOutput(context.destination);
recorder.connectInput(micSource);



// BUTTONS
let recordbtn = document.getElementById("record");
let playbtn = document.getElementById("play");
let resbutton = document.getElementById("resize");
let uploadbtn = document.getElementById("upload");


let recindex = false;

recordbtn.onclick = async () => {
    await context.resume();
    recindex = !recindex;

    if (recindex) {
        rnbo.startRec();
        recorder.startRecording();
    } else {
        rnbo.stopRec();
        recorder.stopRecording();
    }
};

let playindex = false;

playbtn.onclick = async () => {
    await context.resume();
    playindex = !playindex;

    if (playindex) {
        rnbo.play();
    } else {
        rnbo.stop();
    }
};

resbutton.onclick = async () => {
    await context.resume();

    rnbo.resize;
}

uploadbtn.onclick = async () => {
    recorder.uploadFile();
};


// RECORDER STUFF