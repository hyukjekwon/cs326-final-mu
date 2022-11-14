import {Layer, Note} from './layer.js';

let master_vol = 75; // between 0 and 100
let metronome_playing = false;

class Looper {
    constructor() {
        this.layers = [new Layer("Kick.wav")];
        this.bpm = 120;
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
    set_bpm_and_period(bpm) {
        this.bpm = bpm;
        if (this.playing) {
            clearInterval(this.interval);
            this.interval = setInterval(this.play_interval, 30000 / this.bpm, this.layers, this.cursor);
        }
    }
    play_interval(layers, cursor) {
        const time = cursor["time"];
        if (metronome_playing) { // metronome setup
            if (!(time % 2)) {
                const metronome = new Tone.Player("/samples/metronome.wav").toDestination();
                metronome.volume.value = (master_vol - 90) / 2;
                metronome.autostart = true;
            }
        }
        layers.forEach(layer => { // iterate through layers
            const itvl = layer.sequence[time];
            if (itvl) { // if note is active
                let note;
                const layer_vol = (layer.layer_volume["vol"] - 30) / 2
                if (layer.sample === "synth.wav") { // if synth
                    note = new Tone.Synth().toDestination();
                    note.triggerAttackRelease(itvl.note, itvl.duration + "n")
                } else {
                    note = new Tone.Player("/samples/" + layer.sample).toDestination();
                    note.autostart = true;
                }
                note.volume.value = layer_vol - (100 - master_vol) / 2;
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
            Tone.start();
            console.log("play");
            this.interval = setInterval(this.play_interval, 30000 / this.bpm, this.layers, this.cursor);
            this.playing = true;
        }
    }
}

function init_key_presses(l) {
    document.addEventListener("keyup", (e) => {
        if (e.code === "Space") {
            l.play_pause();
        }
    });
}


/* INITIALIZES ALL BUTTON EVENT LISTENERS */
function init_buttons(l) {
    document.getElementById("play").addEventListener("mouseup", () => {
        l.play_pause();
    })
    document.getElementById("add-button").addEventListener("click", () => {
        l.add_layer("Kick.wav");
        render_layers(l);
    })
    const layer_vol_inputs = document.getElementsByClassName("layer-volume");
    for (const dom of layer_vol_inputs) {
        dom.addEventListener("input", () => {
            l.layers[dom.id.split('-')[1]].layer_volume["vol"] = parseInt(dom.value);
        });
    }
    const remove_buttons = document.getElementsByClassName("rem");
    for (const dom of remove_buttons) {
        dom.addEventListener("click", () => {
            l.remove_layer(dom.id.split('-')[1])
            render_layers(l);
        });
    }
    const mast_vol_input = document.getElementById("master-vol")
    mast_vol_input.addEventListener("input", () => {
        master_vol = mast_vol_input.value;
    });
    const bpm_input = document.getElementById("bpm")
    bpm_input.addEventListener("input", () => {
        l.set_bpm_and_period(bpm_input.value);
    });
    const metro_btn = document.getElementById("metronome")
    metro_btn.addEventListener("mouseup", () => {
        if (!metronome_playing) {
            metro_btn.classList.add("btn-danger")
            metronome_playing = true;
        } else {
            metro_btn.classList.remove("btn-danger")
            metronome_playing = false;
        }
    });
}

function init_active_layer(i, l) {
    let html = '<div class="layer-info d-flex flex-column">'
    // html += '<div class="layer-label">Layer '+i+'</div>'
    html += '<div class="dropdown" id="drop'+i+'"><button class="btn btn-secondary btn-sm dropdown-toggle" type="button" id="dropdown-menu-'+i+'" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'
    html += l.layers[i].sample.split('.')[0] + '</button><div class="dropdown-menu" aria-labelledby="dropdownMenuButton">'
    html += '<a class="dropdown-item" id="Kick-'+i+'">Kick</a><a class="dropdown-item" id="Hihat-'+i+'">Hihat</a><a class="dropdown-item" id="Snare-'+i+'">Snare</a><a class="dropdown-item" id="synth-'+i+'">synth</a></div></div>'
    html += '<div>V: <input type="range" class="form-control-range layer-volume" min=0 max=100 value-50 id="volume-'+i+'"></div>'
    html += '<button class="rem btn btn-secondary btn-sm" type="submit" id="rem-'+i+'">Remove</button></div>'
    html += '<div class="sequence" id="seq'+i+'"></div>'
    return html;
}

function init_layers(l) {
    let active_layers = l.layers.length;
    for (let i = 0; i < 4; i++) {
        const layer = document.getElementById("layer-" + (i + 1));
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
    for (const sample of ["Kick", "Snare", "Hihat", "synth"]) {
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
                interval.addEventListener("mouseover", () => {
                    interval.classList.add("itvl-hover");
                });
                interval.addEventListener("mouseleave", () => {
                    interval.classList.remove("itvl-hover");
                });
                interval.addEventListener("click", (e) => {
                    if (interval.classList.contains("itvl-activated")) {
                        l.layers[i].sequence[j] = 0;
                        interval.classList.remove("itvl-activated");
                    } else {
                        l.layers[i].sequence[j] = l.layers[i].sequence[j]? l.layers[i].sequence[j]: new Note("C4");
                        interval.classList.add("itvl-activated");
                        if (l.layers[i].sequence[j]) {
                            render_note_control(l.layers[i].sequence[j])
                        }
                    }
                });
                interval.addEventListener("contextmenu", (e) => {
                    e.preventDefault();
                    if (l.layers[i].sequence[j]) {
                        render_note_control(l.layers[i].sequence[j])
                    }
                });
                sequence.appendChild(interval);
            }
        } else { // existing sequence
            for (let j = 0; j < 16; j++) {
                const interval = sequence.childNodes[j];
                if (l.layers[i].sequence[j]) {  // if the note is active
                    if (!interval.classList.contains("itvl-activated")) {
                        interval.classList.add("itvl-activated");
                    }
                } else {  // if the note is empty
                    if (interval.classList.contains("itvl-activated")) {
                        interval.classList.remove("itvl-activated");
                    }
                }
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
                const remove_button = document.getElementById("rem-"+i);
                remove_button.addEventListener("click", (e) => {
                    l.remove_layer(i);
                    render_layers(l);
                });
                for (const sample of ["Kick", "Snare", "Hihat", "synth"]) {
                    const dropdown_item = document.getElementById(sample+"-"+i);
                    dropdown_item.addEventListener("click", (e) => {
                        l.layers[i].sample = sample + '.wav'
                        document.getElementById("dropdown-menu-"+i).innerText = sample;
                    });
                }
                const layer_vol_slider = document.getElementById("volume-"+i)
                layer_vol_slider.addEventListener("input", () => {
                        l.layers[layer_vol_slider.id.split('-')[1]].layer_volume["vol"] = parseInt(layer_vol_slider.value);
                });
            }
        }
        active_layers -= 1;
    }
    render_sequences(l);
    if (document.getElementById("add-button")) {
        document.getElementById("add-button").addEventListener("click", (e) => {
            l.add_layer("Kick.wav");
            render_layers(l);
        });
    }
}

function render_note_control(note) {
    let html ='Note: <input type="tel" placeholder='+note.note+' value='+note.note+' id="note-input">'
    html += 'Volume: <input type="range" class="form-control-range" min=0 max=100 value='+note.note_volume+' id="note-volume">'
    html += 'Delay: <input type="range" class="form-control-range" min=0 max=100 value=0 id="note-delay">'
    html += 'Reverb: <input type="range" class="form-control-range" min=0 max=100 value=0 id="note-reverb">'
    document.getElementById("note-control-panel-container").innerHTML = html;
    const note_input = document.getElementById("note-input");
    note_input.addEventListener("keyup", () => {
        note.note = note_input.value;
    });
    const volume_slider = document.getElementById("note-volume");
    volume_slider.addEventListener("input", () => {
        note.volume = volume_slider.value;
    });
}

function init_all() {
    let l = new Looper();
    init_layers(l);
    init_key_presses(l);
    init_buttons(l);
    render_sequences(l);
}

init_all()