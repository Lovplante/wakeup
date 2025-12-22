// so nochmal!! create device aus rnbo
console.log("RNO", RNBO);
const {createDevice} = RNBO;
let device;

// PARAMS
// das der parameter
let recparam;
let playparam; 
let resizeparam;
let audioCtx;

export function startRec() {
    recparam.value = 1;
}

export function stopRec() {
    recparam.value = 0;
};

export function play() {
    playparam.value = 1;
};

export function stop() {
    playparam.value = 0;
}

export function resize() {
    resizeparam.value = 1;
};

// async function
export async function initRnbo(context) {
    audioCtx = context;
    if (!context) throw new Error("no Audio Context");

    // CREATE RNBO
    // hier den patch importen
    let rawPatcher = await fetch ("export/wecker2.export.json");
    // console.log(rawPatcher);
    let patcher = await rawPatcher.json();

    // und hier nehmen wir den audio context && patcher und machen das device??
    device = await RNBO.createDevice({ context, patcher });

    // BUFFERS

    // LOCAL BUFFERS
    let dependencies = await fetch("export/dependencies.json");
    dependencies = await dependencies.json();

    // into device laden
    const results = await device.loadDataBufferDependencies(dependencies);
    results.forEach(result => {
        if (result.type === "success") {
            console.log('oh yeah mit id ${result.id}');
        } else {
            console.log('oh no mit id ${result.id}, ${result.error}')
        }
    });

    // PARAMS
    recparam = device.parametersById.get("rec");

    playparam = device.parametersById.get("play");

    resizeparam = device.parametersById.get("resize");
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


export async function download() {
    try {
        let fileResponse = await fetch("../web2/recordings/recB.wav");
        if (!fileResponse.ok) throw new Error("file no bueno");    

        let arrayBuf = await fileResponse.arrayBuffer();
        let message = await audioCtx.decodeAudioData(arrayBuf);

        await device.setDataBuffer("record", message);
        console.log("ja sollte gut laufen");
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