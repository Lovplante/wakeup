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
let alarmbtn = document.getElementById("setAlarm");
let stopAlarmbtn = document.getElementById("stopAlarm");

recordbtn.onclick = async () => {
    await context.resume();

    if (!recorder.isRecording) {
        // 60 sekunden recorden
        recorder.recordFor(60_000, (progress) => {
            barFill.style.width = `${progress * 100}%`;
        });

        recordbtn.textContent = "Stop recording";
        } else {
        recorder.stopRecording();

        recordbtn.textContent = "Start recording";
        uploadbtn.classList.add("visible");
    }
};

uploadbtn.onclick = async () => {
    await recorder.uploadFile();

    ui.goToStep("recordSctn", "timerSctn");
};



// ALARM 

alarmbtn.onclick = async () => {
    const [hours, minutes] = ui.setTime();
    
    const alarmDate = alarm.getNextAlarmDate(hours, minutes);
    const now = Date.now();
    
    // also hier schedulen wir den alarm 
    alarm.scheduleAlarm(alarmDate, () => {
        rnbo.play();
        ui.goToStep("AlarmSet", "Alarm");
    }); 
    
    const fMin = 5 * 60 * 1000;
    const preloadDate = Math.max(now, alarmDate.getTime() - fMin);
    
    // hier schedulen wir den download vor dem alarm
    alarm.scheduleAlarm(new Date(preloadDate), () => {
        rnbo.download();
    }); 

    // advance ui (haengt mit der id von unseren html ab)
    ui.goToStep("timerSctn", "AlarmSet")
}


stopAlarmbtn.onclick = async () => {
    await context.resume();
    rnbo.stop();
    ui.goToStep("Alarm", "recordSctn")
};
