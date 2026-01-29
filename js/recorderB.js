import { bufferToWav } from "./recorderhelper.js";

// recorder.js
let recorder = null;
let audioChunks = [];
export let recordingBuffer = null;
let recordingStream = null;
let source = null;
let context = null;
let destination = null;
export let isRecording = false;

// Audio IN/OUTPU

export function connectInput(sourceMain) {
    source = sourceMain;
    context = sourceMain.context; // AudioContext herstellen
    // hmm ich raff echt nicht warum ich mit .context da dran muss
    // so hier die destination ist quasi eine media strem node
    // heisst das ist wie ein audio device, was man noch effektieren koennte auf jeden fall koennen wir das abgreifen um zu recorden
    destination = context.createMediaStreamDestination();
    sourceMain.connect(destination);
    recordingStream = destination.stream;
};

export function disconnectInput() {
    if (!source || !destination) return;

    // source.disconnect(destination);
    destination.disconnect();
    // recordingStream.getTracks().forEach(t => t.stop());
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

// TimedRecord

export async function recordFor(ms, onProgress, recordbtn, uploadbtn) {
    if (isRecording) return;

    startRecording();

    const step = 50;
    let elapsed = 0;

    // also quasi alle 50ms wird dieser loop ausgefuehrt bis time elapsed groesser ist als wie lang der timer halt gehen soll
    while (isRecording && elapsed < ms) {
        await sleep(step);
        elapsed += step;

        // onProgress native js callbackfunction die eben shit zurueck gibt wenn hier was abgeht (habs noch nicht ganz verstanden wie man merkt)
        if (onProgress) {
            onProgress(elapsed / ms);
        }
    }

    if (isRecording) {
        stopRecording();

        recordbtn.textContent = "Record Again";
        uploadbtn.classList.add("visible");
    }

    // progressbar wird auf 1 gesetzt wenn recording finished
    if (onProgress) {
        onProgress(1);
    }
};


export function startRecording() {

    // ja obv wenn wir keinen stream haben kann auch nicht recorded werden
    if (!recordingStream) {
        console.error("Recorder not connected to a source!");
        return;
    }

    isRecording = true;

    audioChunks = [];
    recorder = new MediaRecorder(recordingStream);

    // okay also! wenn wir recorded bekommen wir in kleinen zeitabständen blobs
    // die packen wir uns immer wenn wir die bekommen und pushen die in den array so lang das recording halt geht
    recorder.ondataavailable = (e) => {
        audioChunks.push(e.data);
    };
    
    recorder.onstop = async () => {
    if (!source) {
        console.error("No source connected, cannot decode");
        return;
    } try {
        // machen aus den vielen blobstuecken einen grossen blob und den spass into raw bytes
        const arrayBuffer = await new Blob(audioChunks).arrayBuffer();

        // erstelle und beschreibe den buffer mit unseren recorded daten
        recordingBuffer = await context.decodeAudioData(arrayBuffer);

        console.log("recording successful");
    } catch (err) {
            console.error("recording no bueno", err);
        }
    };

    recorder.start();
    console.log("Recording started");
};

export function stopRecording() {
    isRecording = false;
    if (!recorder) return;
    recorder.stop();
    console.log("Recording stopped");
};

export async function uploadFile() {
    if (!recordingBuffer) {
        // statusText.textContent = "Es gibt noch kein gemergtes WAV zum Upload.";
        return;
    }

        try {

            // Wav als Datei-Objekt verpacken, quasi raw binary daten soweit ich checke
            let wavBlob = bufferToWav(recordingBuffer); // recordingBuffer = your AudioBuffer
            // nun kreieren wir ein audiofile aus den daten
            let file = new File([wavBlob], "recB.wav", { type: "audio/wav" });

            // datenkreierung fuer unseren php amigo
            let form = new FormData();
            form.append("file", file);

            // war gut?
            let response = await fetch("upload.php", {
                method: "POST",
                body: form
            });

            let text = await response.text();

            if (text.includes("OK")) {
            console.log("Upload des gemergten WAV erfolgreich.");
        } else {
            console.log("no bueno");
        }
    } catch (e) {
            console.log("Fehler beim Upload des gemergten WAV.");
            console.error(e);
        }
};

// THIS AINT WORKING BRUVVVVVV
export function updateBar(progress) {
    const bar = document.getElementById("bar");
    const barFill = document.getElementById("barFill");
    const barText = document.getElementById("barText");

    const barWidth = bar.offsetWidth;
    const fillWidth = progress * barWidth;

    // update fill width
    barFill.style.width = `${progress * 100}%`;

    // get the horizontal position of the text (center)
    // const textX = barWidth / 2;
}



