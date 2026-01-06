import * as rnbo from "./rnbo.js";
import * as recorder from "./recorder.js";
import * as alarm from "./alarm.js";
import * as ui from "./ui.js";

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
let uploadbtn = document.getElementById("upload");
let moodbtn = document.getElementById("mood");
let alarmbtn = document.getElementById("setAlarm");
let cancelbtn = document.getElementById("AlarmSet");
let stopAlarmbtn = document.getElementById("stopAlarm");

recordbtn.onclick = async () => {
    await context.resume();

    if (!recorder.isRecording) {
        // 60 sekunden recorden
        recorder.recordFor(60_000, (progress) => {
            // barFill.style.width = `${progress * 100}%`;
            recorder.updateBar(progress);
        }, recordbtn, uploadbtn);

        

        recordbtn.textContent = "Stop recording";
        } else {
        recorder.stopRecording();

        recordbtn.textContent = "Record Again";
        uploadbtn.classList.add("visible");
    }
};

uploadbtn.onclick = async () => {
    await recorder.uploadFile();

    ui.goToStep("recordSctn", "mood");
};

// jetzt hier eval into

let mood;

moodbtn.onclick = async () => {
    const slider = document.getElementById("timeSlider");
    const value = Number(slider.value);


    if (value < 33) {
        mood = 0;
    } else if (value < 66) {
        mood = 1;
    } else {
        mood = 2;
    };


    ui.goToStep("mood", "timerSctn");
}

// ALARM 
let alarmTimeoutId;
let preloadTimeoutId;

alarmbtn.onclick = async () => {
    const [hours, minutes] = ui.setTime();
    const alarmDate = alarm.getNextAlarmDate(hours, minutes);
    const now = Date.now();
    
    // also hier schedulen wir den alarm 
    alarmTimeoutId = alarm.scheduleAlarm(alarmDate, () => {
        rnbo.play(mood);
        ui.goToStep("AlarmSet", "Alarm");
    }); 
    
    const fMin = 5 * 60 * 1000;
    const preloadDate = Math.max(now, alarmDate.getTime() - fMin);
    
    // hier schedulen wir den download vor dem alarm
    preloadTimeoutId = alarm.scheduleAlarm(new Date(preloadDate), () => {
        rnbo.download();
    }); 

    // advance ui (haengt mit der id von unseren html ab)
    ui.goToStep("timerSctn", "AlarmSet")
}


cancelbtn.onclick = async () => {
    if (alarmTimeoutId !== null) clearTimeout(alarmTimeoutId);
    if (preloadTimeoutId !== null) clearTimeout(preloadTimeoutId);

    alarmTimeoutId = null;
    preloadTimeoutId = null;

    ui.goToStep("AlarmSet", "timerSctn")
}


stopAlarmbtn.onclick = async () => {
    await context.resume();
    rnbo.stop();
    ui.goToStep("Alarm", "recordSctn")
};
