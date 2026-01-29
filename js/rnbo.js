// so nochmal!! create device aus rnbo
const {createDevice} = RNBO;
let device;

// PARAMS
// das der parameter
let recparam;
let playparam; 
let stopparam;
let moodparam;
let blumioparam;
let audioCtx;


export function play(mood) {
    moodparam.value = mood;
    playparam.value = 1;
    stopparam.value = 0;
};

export function stop() {
    stopparam.value = 1;
    playparam.value = 0;
}

export function setMood() {
    moodparam.value = mood;
}

// export function resize() {
//     resizeparam.value = 1;
// };

// async function
export async function initRnbo(context) {
    
    audioCtx = context;
    if (!context) throw new Error("no Audio Context");

    // CREATE RNBO
    // hier den patch importen
    console.log("pulling audio");
    let rawPatcher = await fetch ("export4/wecker3.export.json");
    // console.log(rawPatcher);
    let patcher = await rawPatcher.json();

    // und hier nehmen wir den audio context && patcher und machen das device??
    device = await RNBO.createDevice({ context, patcher });

    // BUFFERS

    // LOCAL BUFFERS
    let dependencies = await fetch("export4/dependencies.json");
    dependencies = await dependencies.json();

    // into device laden
    const results = await device.loadDataBufferDependencies(dependencies);
    results.forEach(result => {
        if (result.type === "success") {
            console.log(`oh yeah mit id ${result.id}`);
        } else {
            console.log(`oh no mit id ${result.id}, ${result.error}`)
        }
    });

    // PARAMS
    recparam = device.parametersById.get("rec");

    playparam = device.parametersById.get("play");
    
    stopparam = device.parametersById.get("stop");

    moodparam = device.parametersById.get("mood");
};

// CONNECT IN/OUTPUT

export function connectInput(source) {
    if (!device) throw new Error("no device")
    source.connect(device.node);
};

export function connectOutput(dest) {
    if (!device) throw new Error("no device")
    device.node.connect(dest);
};

export function disconnectInput() {
    if (!device) throw new Error("no device")
    device.node.disconnect();
};

export function disconnectOutput(dest) {
    if (!device) throw new Error("no device")
    device.node.disconnect();
};


//  DOWNLOAD 

export async function download() {
    try {
        // also wir fetchen audiofile vom serber

        let fileResponse = await fetch("../web2/recordings/recB.wav");
        if (!fileResponse.ok) throw new Error("file no bueno");    

        //  so decoden 
        let arrayBuf = await fileResponse.arrayBuffer();
        let message = await audioCtx.decodeAudioData(arrayBuf);

        // buffer beschreiben
        await device.setDataBuffer("message", message);

        // so hier den audiolength trigger triggern
        blumioparam = device.parametersById.get("blumio")
        console.log("ja sollte gut laufen");
        blumioparam.value = 1;
        
    } catch (err) {
        console.log("pfuhh ne");
    }
   
   
   
   
    // try {
    //     let fileResponse = await fetch("../web2/recordings/recB.wav");
    //     let arrayBuf = await fileResponse.arrayBuffer();
    //     let message = await audioCtx.decodeAudioData(arrayBuf);
    //     console.log(message);

    // } catch {
    //     console.log("kannste knicken");
    // }
};