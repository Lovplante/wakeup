import * as rnbo from "./rnbob.js";
import * as recorder from "./recorderb.js";
import * as alarm from "./alarm.js";
import * as ui from "./ui.js";

// AUDIO CONTEXT
let WAContext = window.AudioContext || window.webkitAudioContext;
let context = new WAContext();

// INIT JS
rnbo.initRnbo(context);

let stream;
let micSource;

let audioUnlocked = false;

let recordbtn = document.getElementById("record");
let uploadbtn = document.getElementById("upload");
let moodbtn = document.getElementById("moodBtn");
let alarmbtn = document.getElementById("setAlarm");
let cancelbtn = document.getElementById("cancelBtn");
let stopAlarmbtn = document.getElementById("stopAlarm");
let alarmSet = document.getElementById("alarmSetText");
let testmp3 = document.getElementById("testmp3");

// testmp3.onclick = async () => {

// }

recordbtn.onclick = async () => {
    await unlockAudio();
    await context.resume();
    if (!stream) {
        // IN/OUTPUT SETUP
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    micSource = context.createMediaStreamSource(stream);

    rnbo.connectInput(micSource);
    rnbo.connectOutput(context.destination);
    recorder.connectInput(micSource);
    } else {
        stream.getTracks().forEach(t => t.stop());

        micSource.disconnect();
        rnbo.disconnectInput();
        recorder.disconnectInput();

        micSource = null;
        stream = null;
    }


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
    await context.resume();

    // uploadbtn.disabled = true;
    // uploadbtn.textContent = "Uploading...";

    

    recorder.uploadFile();

    // uploadbtn.textContent = "Uploaded";
    ui.goToStep("recordSctn", "mood");
    uploadbtn.classList.remove("visible");

    // pullMood();
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

    // upload ein file was von anderer page accessed werden kann
    fetch ("states/stateA.php", {
        method: "POST", 
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({mood})
    });

    ui.goToStep("mood", "timerSctn");
    uploadbtn.classList.remove("visible");

}

// ALARM 
let alarmTimeoutId;
let preloadTimeoutId;

alarmbtn.onclick = async () => {

    pullMood();

    await context.resume();
    
    const [hours, minutes] = ui.setTime();
    const alarmDate = alarm.getNextAlarmDate(hours, minutes);
    const now = Date.now();
    
    // also hier schedulen wir den alarm 
    alarmTimeoutId = alarm.scheduleAlarm(alarmDate, () => {
        context.resume();
        // OBACHT HIER MUSST DU NOCH MOOD ZU MOOD VON ANDERE DING MACHEN
        console.log(mood);
        rnbo.play(mood);
        ui.goToStep("AlarmSet", "Alarm");
    }); 
    
    // wie viele minuten fuer den prefire
    const fMin = 5 * 60 * 1000;
    // halt die zeit bis zum alarm minus 5 minuten
    const preloadDate = Math.max(now, alarmDate.getTime() - fMin);
    
    // hier schedulen wir den download vor dem alarm
    preloadTimeoutId = alarm.scheduleAlarm(new Date(preloadDate), () => {

        context.resume();
        rnbo.download();
    }); 

    // advance ui (haengt mit der id von unseren html ab)
    ui.goToStep("timerSctn", "AlarmSet")
    // alarmSet.textContent = `${alarmDate}`;
    
    // wie viel uhr mein freund!
    alarmSet.textContent = alarmDate.toLocaleDateString([], {
        hour: "2-digit",
        minute:"2-digit"
    });
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


async function unlockAudio() {
    if (audioUnlocked) return;

    await context.resume();

    const buffer = context.createBuffer(1, 1, 22050);
    const src = context.createBufferSource();
    src.buffer = buffer;
    src.connect(context.destination);
    src.start(0);

    audioUnlocked = true;
}

async function pullMood() {
    // fetch the latest mood from the server right now
    const res = await fetch("states/getStateA.php");
    const data = await res.json();
    mood = data.mood;
}