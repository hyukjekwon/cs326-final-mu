let playing = false;
let interval;

class Looper {
    constructor() {
        // each sequence will contain the type of the sample along with a map for which notes are active
        // types of samples will just be the name of the file
        this.layers = [new Layer("kick.wav")];
    }
    add_layer(sample) {
        this.layers.add(new Layer(sample));
    }
}

function init_key_presses() {
    document.addEventListener("keyup", (e) => {
        if (e.code === "Space") {
            play_pause();
        }
    })
}

function init_master_buttons() {
    const play = document.getElementById("play");
    play.addEventListener("mouseup", (e) => {
        play_pause();
    })
}


function play_pause() {
    console.log("play/pause");
    if (playing) {
        clearInterval(interval);
        playing = false;
    } else {
        interval = setInterval(play_sample, 300, "./samples/Hihat.wav");
        playing = true;
    }
}

function play_sample(sample_name) {
    const sample = new Tone.Player(sample_name).toDestination();
    sample.restart();
    sample.autostart = true;
}

function init_sequences() {
    const layer = document.getElementById("layer-control");
    const sequences = document.getElementsByClassName("sequence");
    for (let sequence of sequences) {
        for (let i = 0; i < 16; i++) {
            const interval = document.createElement("div");
            interval.classList.add("interval");
            sequence.appendChild(interval);
        }
    }
}

init_key_presses();
init_sequences();
init_master_buttons();