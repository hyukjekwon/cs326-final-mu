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

function init_layers(l) {
    let active_layers = l.layers.length;
    for (let i = 0; i < 4; i++) {
        const layer = document.getElementById("layer" + (i + 1));
        layer.classList.add("layer")
        if (active_layers < 1) {
            if (active_layers === 0) {
                layer.innerHTML = '<button class="btn btn-secondary" type="submit">Add Layer</button>';
            }
            layer.classList.add("inactive")
        } else {
            layer.innerHTML = '<div class="layer-info d-flex flex-column"><div class="layer-label">Layer '+i+'</div><div class="dropdown" id="drop'+i+'"><button class="btn btn-secondary btn-sm dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Sample</button><div class="dropdown-menu" aria-labelledby="dropdownMenuButton"><a class="dropdown-item" href="#">Kick</a><a class="dropdown-item" href="#">Hi-Hat</a><a class="dropdown-item" href="#">Snare</a><a class="dropdown-item" href="#">Synth</a></div><button class="btn btn-secondary btn-sm" type="submit" id="rem'+i+'">Remove</button></div>L/R<input type="range" class="form-control-range" id="lr'+i+'">Volume<input type="range" class="form-control-range" id="volume'+i+'"></div><div class="sequence" id="seq'+i+'"></div>'
        }
        active_layers -= 1;
    }
}

function render_sequences() {
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
    l.add_layer("hihat.wav")
    l.add_layer("hihat.wav")
    console.log(l)
    init_key_presses(l);
    init_master_buttons();
    init_layers(l);
    render_sequences();
}

init_all()