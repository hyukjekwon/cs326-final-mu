import {Layer} from './layer.js';
let l;

class Looper {
    constructor() {
        // each sequence will contain the type of the sample along with a map for which notes are active
        // types of samples will just be the name of the file
        this.layers = [new Layer("kick.wav")];
        this.bpm = 120;
        this.master_volume = 75;
        this.playing = false;
        this.interval;
        this.cursor = {"time": 0}; // obj to alter by reference
    }
    add_layer(sample) {
        this.layers.push(new Layer(sample));
    }
    remove_layer(index) {
        if (this.layers.length > 1) {
            return this.layers.splice(index, 1);
        }
    }
    play_interval(layers, cursor) {
        const time = cursor["time"];
        const metronome = new Tone.Player("/samples/metronome.wav").toDestination();
        metronome.autostart = true;
        layers.forEach(layer => {
            if (layer.sequence[time]) {
                const sample = new Tone.Player("/samples/" + layer.sample).toDestination();
                sample.autostart = true;
            }
        });
        console.log(time)
        cursor["time"] = (time + 1) % 16;
    }
    play_pause() {
        if (this.playing) {
            console.log("pause");
            clearInterval(this.interval);
            this.playing = false;
            this.cursor = {"time": 0};
        } else {
            console.log("play");
            this.interval = setInterval(this.play_interval, Math.floor(this.bpm * 2.0833), this.layers, this.cursor);
            this.playing = true;
        }
    }
}

function init_key_presses(l) {
    document.addEventListener("keyup", (e) => {
        if (e.code === "Space") {
            l.play_pause();
        }
    })
}

function init_master_buttons(l) {
    const play = document.getElementById("play");
    play.addEventListener("mouseup", (e) => {
        l.play_pause();
    })
}

function render_layers() {
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

function init_all() {
    Tone.start();
    l = new Looper()
    l.add_layer("hihat.wav")
    console.log(l)
    init_key_presses(l);
    init_master_buttons();
    render_layers();
}

init_all()