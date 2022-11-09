import {Layer} from './layer.js';

class Looper {
    constructor() {
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
            for (const dom of document.getElementsByClassName("itvl-" + time)) {
                dom.classList.add("itvl-cursor");
            }
            for (const dom of document.getElementsByClassName("itvl-" + (time+15)%16)) {
                dom.classList.remove("itvl-cursor");
            }
        });
        cursor["time"] = (time + 1) % 16;
    }
    play_pause() {
        if (this.playing) {
            console.log("pause");
            clearInterval(this.interval);
            this.playing = false;
            this.cursor = {"time": 0};
            for (const dom of document.getElementsByClassName("itvl")) {
                dom.classList.remove("itvl-cursor");
            }
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

function init_buttons(l) {
    const play = document.getElementById("play");
    play.addEventListener("mouseup", (e) => {
        l.play_pause();
    })
    const add_layer = document.getElementById("add-button");
    add_layer.addEventListener("click", (e) => {
        l.add_layer("kick.wav");
        render_layers(l);
    })
    const remove_buttons = document.getElementsByClassName("rem");
    for (const dom of remove_buttons) {
        dom.addEventListener("click", (e) => {
            l.remove_layer(dom.id.split('.')[1])
            render_layers(l);
        });
    }
}

function init_active_layer(i, l) {
    let html = '<div class="layer-info d-flex flex-column"><div class="layer-label">Layer '+i+'</div><div class="dropdown" id="drop'+i+'"><button class="btn btn-secondary btn-sm dropdown-toggle" type="button" id="dropdown-menu-'+i+'" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'
    html += l.layers[i].sample.split('.')[0] + '</button><div class="dropdown-menu" aria-labelledby="dropdownMenuButton">'
    html += '<a class="dropdown-item" href="#" id="kick-'+i+'">kick</a><a class="dropdown-item" href="#" id="hihat-'+i+'">hihat</a><a class="dropdown-item" href="#" id="snare-'+i+'">snare</a><a class="dropdown-item" href="#" id="synth-'+i+'">synth</a></div>'
    html += '<button class="rem btn btn-secondary btn-sm" type="submit" id="rem'+i+'">Remove</button></div>L/R<input type="range" class="form-control-range" id="lr'+i+'">Volume<input type="range" class="form-control-range" id="volume'+i+'"></div><div class="sequence" id="seq'+i+'"></div>'
    return html;
}

function init_layers(l) {
    let active_layers = l.layers.length;
    for (let i = 0; i < 4; i++) {
        const layer = document.getElementById("layer" + (i + 1));
        layer.classList.add("layer");
        if (active_layers < 1) {
            if (active_layers === 0) {
                layer.innerHTML = '<button class="btn btn-secondary" type="submit" id="add-button">Add Layer</button>';
            }
            layer.classList.add("inactive");
        } else {
            layer.innerHTML = init_active_layer(i, l);
        }
        active_layers -= 1;
    }
    for (const sample of ["kick", "snare", "hihat", "synth"]) {
        const dropdown_item = document.getElementById(sample+"-"+0);
        dropdown_item.addEventListener("click", (e) => {
            l.layers[0].sample = sample + '.wav'
            document.getElementById("dropdown-menu-"+0).innerText = sample;
        });
    }
}

function render_sequences(l) {
    for (let i = 0; i < l.layers.length; i++) {
        const sequence = document.getElementById("seq" + i)
        if (sequence.childNodes.length === 0) {
            for (let j = 0; j < 16; j++) {
                const interval = document.createElement("div");
                interval.classList.add("itvl");
                interval.classList.add("itvl-"+j);
                interval.addEventListener("mouseover", (e) => {
                    interval.classList.add("itvl-hover");
                });
                interval.addEventListener("mouseleave", (e) => {
                    interval.classList.remove("itvl-hover");
                });
                interval.addEventListener("click", (e) => {
                    if (interval.classList.contains("itvl-activated")) {
                        l.layers[i].sequence[j] = 0;
                        interval.classList.remove("itvl-activated")
                    } else {
                        l.layers[i].sequence[j] = 1;
                        interval.classList.add("itvl-activated")
                    }
                });
                sequence.appendChild(interval);
            }
        }
    }
}

function render_layers(l) {
    let active_layers = l.layers.length;
    const layers = document.getElementsByClassName("layer");
    for (let i = 0; i < 4; i++) {
        const layer = layers[i];
        if (active_layers < 1) {
            if (active_layers === 0) {
                layer.innerHTML = '<button class="btn btn-secondary" type="submit" id="add-button">Add Layer</button>';
            } else if (layer.innerHTML) {
                layer.innerHTML = '';
            }
            layer.classList.add("inactive");
        } else {
            if (layer.classList.contains("inactive")) { // new active layer is made
                layer.classList.remove("inactive");
                layer.innerHTML = init_active_layer(i, l);
                render_sequences(l);
                const remove_button = document.getElementById("rem"+i);
                remove_button.addEventListener("click", (e) => {
                    l.remove_layer("rem"+i);
                    render_layers(l);
                });
                for (const sample of ["kick", "snare", "hihat", "synth"]) {
                    const dropdown_item = document.getElementById(sample+"-"+i);
                    dropdown_item.addEventListener("click", (e) => {
                        l.layers[i].sample = sample + '.wav'
                        document.getElementById("dropdown-menu-"+i).innerText = sample;
                    });
                }
            }
        }
        active_layers -= 1;
    }
    if (document.getElementById("add-button")) {
        document.getElementById("add-button").addEventListener("click", (e) => {
            l.add_layer("kick.wav");
            render_layers(l);
        });
    }
}

function init_all() {
    let l = new Looper();
    Tone.start();
    // l.add_layer("hihat.wav")
    console.log(l);
    init_layers(l);
    init_key_presses(l);
    init_buttons(l);
    render_sequences(l);
}

init_all()