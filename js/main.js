import * as rnbo from "./rnbo.js";
import * as recorder from "./recorder.js";

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
let uploadbtn = document.getElementById("upload");
let downloadbtn = document.getElementById("download");

recordbtn.onclick = async () => {
    await context.resume();

    if (!recorder.isRecording) {
        // 60 sekunden recorden
        recorder.recordFor(60_000, (progress) => {
            barFill.style.width = `${progress * 100}%`;
        });
        } else {
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

uploadbtn.onclick = async () => {
    recorder.uploadFile();
};

downloadbtn.onclick = async () => {
    rnbo.download();
};

// PSEUDO
// ALARM async {
// await rnbo.download(); (was wenn wlan reinkackt, nach einer minute download fail einfach ignorieren?)
// blumio = 1; NVM IST SCHON IN DOWNLOAD
// rnbo.play();
// };


// RECORDER STUFF