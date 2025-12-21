// let baseBuffer = null;

// let recorder = null;
// let audioChunks = [];
// let recordedBlob = null;
// let recordingBuffer = null;

// // ======================================
// // base.wav laden und in AudioBuffer dekodieren
// // ======================================

// // Direkt bein oeffnen der seite basewav laden;
// loadBaseWav();

// async function loadBaseWav() {
//   try {
//     statusText.textContent = "Lade base.wav...";
//     let res = await fetch("base.wav");
//     let arrayBuffer = await res.arrayBuffer();
//     baseBuffer = await audioCtx.decodeAudioData(arrayBuffer);
//     statusText.textContent = "base.wav geladen.";
//   } catch (e) {
//     statusText.textContent = "Fehler beim Laden von base.wav.";
//     console.error(e);
//   }
// }

// // ======================================
// // Aufnahme starten
// // ======================================

// export async function startRecording(input) {
//   try {
//     // mein input stream
//     recorder = new MediaRecorder(input);

//     // neue Audio-Chunks sammeln
//     recorder.ondataavailable = onAudioChunk;

//     // wenn Aufnahme fertig ist, verarbeiten
//     recorder.onstop = onRecordingComplete;

//     // Aufnahme starten
//     recorder.start();
//     statusText.textContent = "Aufnahme läuft...";
//   } catch (e) {
//     statusText.textContent = "Fehler: Kein Mikrofon?";
//     console.error(e);
//   }
// };

// // wird aufgerufen, wenn neue Audiodaten ankommen pfuhh keine ahnung was das macht
// function onAudioChunk(event) {
//   audioChunks.push(event.data);
// };

// // ======================================
// // Aufnahme stoppen
// // ======================================

// export function stopRecording() {
//   if (!recorder) return;
//   recorder.stop();
//   statusText.textContent = "Aufnahme gestoppt. Verarbeite...";
// }

// // ======================================
// // Aufnahme fertig: Blob + AudioBuffer erzeugen
// // ======================================

// async function onRecordingComplete() {
//   try {
//     // alle Chunks zu einem Blob (z.B. audio/webm) zusammenfassen
//     recordedBlob = new Blob(audioChunks, { type: recorder.mimeType });
//     // oder: recordedBlob = new Blob(audioChunks);
    
//     // Chunks leeren für nächste Aufnahme
//     audioChunks = [];

//     // Blob in ArrayBuffer umwandeln
//     let rawData = await recordedBlob.arrayBuffer();

//     // ArrayBuffer in AudioBuffer dekodieren
//     recordingBuffer = await audioCtx.decodeAudioData(rawData);

//     // Mikrofon wieder ausschalten
//     if (micStream) {
//       let tracks = micStream.getTracks();
//       for (let i = 0; i < tracks.length; i++) {
//         tracks[i].stop();
//       }
//     }
//   } catch (e) {
//     statusText.textContent = "Fehler bei der Aufnahme-Verarbeitung.";
//     console.error(e);
//   }
// };

// async function uploadFile() {
//     if (!baseBuffer) {
//         statusText.textContent = "Es gibt noch kein gemergtes WAV zum Upload.";
//         return;
//     }

//     try {
//         statusText.textContent = "upload laeuft"

//         // Wav als Datei-Objekt verpacken
//         let file = new File([baseBuffer], "merged.wav", { type: "audio/wav" });

//         let form = new FormData();
//         form.append("file", file);

//         let response = await fetch("upload.php", {
//             method: "POST",
//             body: form
//         });

//         let text = await response.text();

//         if (text === "OK") {
//         statusText.textContent = "Upload des gemergten WAV erfolgreich.";
//         } else {
//         statusText.textContent = "Upload fehlgeschlagen.";
//         }
//     } catch (e) {
//         statusText.textContent = "Fehler beim Upload des gemergten WAV.";
//         console.error(e);
//     }
// };

import { bufferToWav } from "./recorderhelper.js";

// recorder.js
let recorder = null;
let audioChunks = [];
export let recordingBuffer = null;
let recordingStream = null;
let source = null;;

export function connectInput(sourceMain) {
    source = sourceMain;
    // connect a MediaStreamDestination for recording
    const context = sourceMain.context; // AudioContext from the source
    const destination = context.createMediaStreamDestination();
    sourceMain.connect(destination);
    recordingStream = destination.stream;
}

export function startRecording() {
    if (!recordingStream) {
        console.error("Recorder not connected to a source!");
        return;
    }

    audioChunks = [];
    recorder = new MediaRecorder(recordingStream);

    recorder.ondataavailable = (e) => {
        audioChunks.push(e.data);
    };

    // recorder.onstop = async () => {
    //     try {
    //         const blob = new Blob(audioChunks, { type: "audio/wav" });
    //         const url = URL.createObjectURL(blob);
    //         console.log("Recording finished. Blob URL:", url);
    //         // optional: auto-download
    //         const a = document.createElement("a");
    //         a.href = url;
    //         a.download = "recording.wav";
    //         a.click();

    //         // auch audiobuffer breschreiben fuer processing
    //         const arrayBuffer = await blob.arrayBuffer();
    //         recordingBuffer = await source.context.decodeAudioData(arrayBuffer);

    //         console.log("recbuffer",recordingBuffer);

    //     } catch (err) {
    //         console.error("no bueno!", err);
    //     }
    // };
    
    
        recorder.onstop = async () => {
        if (!source) {
            console.error("No source connected, cannot decode");
            return;
        }
        try {
            const arrayBuffer = await new Blob(audioChunks).arrayBuffer();
            const audioCtx = source.context;
            recordingBuffer = await audioCtx.decodeAudioData(arrayBuffer);

            // Convert AudioBuffer to proper WAV
            const wavBlob = bufferToWav(recordingBuffer);

            // Download
            const url = URL.createObjectURL(wavBlob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "recording.wav";
            a.click();

            console.log("Recording finished and converted to WAV");
        } catch (err) {
            console.error("Error processing recording:", err);
        }
    }



    recorder.start();
    console.log("Recording started");
};

export function stopRecording() {
    if (!recorder) return;
    recorder.stop();
    console.log("Recording stopped");
};

export async function uploadFile() {
    if (!recordingBuffer) {
        statusText.textContent = "Es gibt noch kein gemergtes WAV zum Upload.";
        return;
    }

    try {
        statusText.textContent = "upload laeuft"

        // Wav als Datei-Objekt verpacken
        let wavBlob = bufferToWav(recordingBuffer); // recordingBuffer = your AudioBuffer
        let file = new File([wavBlob], "recording.wav", { type: "audio/wav" });

        let form = new FormData();
        form.append("file", file);

        let response = await fetch("upload.php", {
            method: "POST",
            body: form
        });

        let text = await response.text();

        if (text === "OK") {
        statusText.textContent = "Upload des gemergten WAV erfolgreich.";
        } else {
        statusText.textContent = "Upload fehlgeschlagen.";
        }
    } catch (e) {
        statusText.textContent = "Fehler beim Upload des gemergten WAV.";
        console.error(e);
    }
};