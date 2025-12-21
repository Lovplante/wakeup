// so nochmal!! create device aus rnbo
console.log("RNO", RNBO);
const {createDevice} = RNBO;
let device;

// PARAMS
// das der parameter
let recparam;
let playparam; 
let resizeparam;

<<<<<<< Updated upstream

// button der webaudio id hat vorher in html machen und dann funzt das auch
// quasi der button der 
let button = document.getElementById("webaudio");
button.onpointerdown = () => {context.resume()};


// das playbutton
let recordbtn = document.getElementById("record");
let recindex = 0;
recordbtn.onpointerdown = () => {
    if (recindex == 0) {
        rec.value = 1;
        recindex = 1;
    } else {
        rec.value = 0;
        recindex = 0;
        saveAudio();
    }
    console.log(rec.value);
=======
export function startRec() {
    recparam.value = 1;
    console.log(recparam);
>>>>>>> Stashed changes
};

export function stopRec() {
    recparam.value = 0;
    console.log(recparam);
};

export function play() {
    playparam.value = 1;
    console.log(playparam);
};

export function stop() {
    playparam.value = 0;
    console.log(playparam);
}

export function resize() {
    resizeparam.value = 1;
};

// async function
export async function initRnbo(context) {
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

<<<<<<< Updated upstream
const saveAudio = async () => {

};
=======
// CONNECT IN/OUTPUT
>>>>>>> Stashed changes

export function connectInput(source) {
    if (!device) throw new Error("no device")
    source.connect(device.node);
}

<<<<<<< Updated upstream
setup();
=======
export function connectOutput(dest) {
    if (!device) throw new Error("no device")
    device.node.connect(dest);
}
>>>>>>> Stashed changes
