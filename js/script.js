// // context ist mein audio kontext 
// // device ist rnbo device
// // source ist die audiosource


// // audio kontext kreieren, tyler the creator indisch rhein
// let WAContext = window.AudioContext || window.webkitAudioContext;
// let context = new WAContext();

// // gain regler
// const gainNode = context.createGain();
// gainNode.connect(context.destination);
// device.node.connect(gainNode);

// // web audio wird erst nach user input aktiviert thank god
// let button = document.getElementById("webaudio");
// button.onpointerdown = () => {context.resume()};

// // rnbo setup
// const { createDevice } = require("@rnbo/js");
// const device = await createDevice({ audioContext, patcher});

// // hier verbinden wir uns mit dem audio input vom computer
// const handleSuccess = (stream) => {
//     const source = context.createMediaStreamSource(stream);
//     source.connect(device.node);
// }
// navigator.mediaDevices.getUserMedia({ audio: true, video: false})
//     .then(handleSuccess);

//=====================================================================

// so nochmal!! create device aus rnbo
console.log("RNO", RNBO);
const {createDevice} = RNBO;

// audio kontext machen
let WAContext = window.AudioContext || window.webkitAudioContext;
let context = new WAContext();

let device;


// button der webaudio id hat vorher in html machen und dann funzt das auch
// quasi der button der 
let button = document.getElementById("webaudio");
button.onpointerdown = () => {context.resume()};

// PARAMS
// das der parameter
let rec;
let play; 
let resize;

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
    }
    console.log(rec.value);
};

// das recbutton
let playbtn = document.getElementById("play");
let playindex = 0;
playbtn.onpointerdown = () => {
    if (playindex == 0) {
        play.value = 1;
        playindex = 1;
    } else {
        play.value = 0;
        playindex = 0;
    }
    console.log(play.value);
};

// das buffer resize button
let resbutton = document.getElementById("resize");
resbutton.onpointerdown = () => {
    resize.value = 1;
}

// document.getElementById("play");

// document.getElementById("purge");

// document.getElementById("replay");

// async function
const setup = async ()=> {

    // CREATE RNBO
    // hier den patch importen
    let rawPatcher = await fetch ("../export/wecker2.export.json");
    // console.log(rawPatcher);
    let patcher = await rawPatcher.json();

    // und hier nehmen wir den audio context && patcher und machen das device??
    device = await RNBO.createDevice({ context, patcher });

    // BUFFERS
    // buffer dependencies natzen
    let dependencies = await fetch("../export/dependencies.json");
    dependencies = await dependencies.json();

    // // into device laden
    // const results = await device.loadDataBufferDependencies(dependencies);
    // results.forEach(result => {
    //     if (result.type === "success") {
    //         console.log('oh yeah mit id ${result.id}');
    //     } else {
    //         console.log('oh no mit id ${result.id}, ${result.error}')
    //     }
    // });

    let samp = await fetch("https://fettesbrot.site/s/szj5D8qd5x8qtaX/download");
    console.log(samp);
    // await device.setDataBuffer("mus1", await fetch("https://fettesbrot.site/s/szj5D8qd5x8qtaX/download"));


    // AUDIO IN/OUTPUT
    
    // lasset uns ans mic connecten!
    const stream = await navigator.mediaDevices.getUserMedia({audio:true});
    const micSource = context.createMediaStreamSource(stream);
    micSource.connect(device.node);
    // connect das device mit audio output (muss man mayb noch resumen durch button press)
    // also device.node ist mein device output und context.destination ist der computer output
    device.node.connect(context.destination);
    

    // // parameter printen
    // device.parameters.forEach(parameter => {

    //     console.log(parameter.id);
    //     console.log(parameter.name);
    // });

    // parameter changen
    // const toggle = device.parametersById.get("toggle");

    rec = device.parametersById.get("rec");

    play = device.parametersById.get("play");

    resize = device.parametersById.get("resize");

};


setup();