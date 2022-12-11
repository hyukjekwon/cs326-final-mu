import {Layer, Note} from './layer.js';

let master_vol = 75; // between 0 and 100
let metronome_playing = false;
let num_notes = 16;
let num_layers = 6;
const sample_lookup = {
    "kick.wav": "A1",
    "hihat.wav": "A2",
    "snare.wav": "A3"
};
let recording = false;
const notes = ['A0', 'A#0', 'B0',
    'C1', 'C#1', 'D1', 'D#1', 'E1', 'F1', 'F#1', 'G1', 'G#1', 'A1', 'A#1', 'B1',
    'C2', 'C#2', 'D2', 'D#2', 'E2', 'F2', 'F#2', 'G2', 'G#2', 'A2', 'A#2', 'B2',
    'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3',
    'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4',
    'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5',
    'C6', 'C#6', 'D6', 'D#6', 'E6', 'F6', 'F#6', 'G6', 'G#6', 'A6', 'A#6', 'B6',
    'C7', 'C#7', 'D7', 'D#7', 'E7', 'F7', 'F#7', 'G7', 'G#7', 'A7', 'A#7', 'B7', 'C8']

let last_note_used = 39;

class Looper {
    constructor() {
        this.layers = [new Layer("kick.wav", num_notes)];
        this.bpm = 120;
        this.playing = false;
        this.interval;
        this.cursor = {"time": 0}; // obj to alter by reference
        this.sampler = new Tone.Sampler({
            urls: {
                A1: "kick.wav",
                A2: "hihat.wav",
                A3: "snare.wav"
            },
            baseUrl: "/samples/"
        }).toDestination();
        this.synth = new Tone.PolySynth().toDestination();
        this.metronome_loop = new Tone.Loop(time => {
            this.metronome_sampler.triggerAttack(time)
        }, '4n')
        this.metronome_sampler = new Tone.Sampler({
            urls: {
                C4: "metronome.wav"
            },
            baseUrl: "/samples/"
        }).toDestination()
        this.metronome_sampler.volume.value = -1024;
    }
    add_layer(sample) {
        this.layers.push(new Layer(sample, num_notes));
    }
    remove_layer(index) {
        if (this.layers.length > 1) {
            return this.layers.splice(index, 1);
        }
    }
    set_bpm_and_period(bpm) {
        this.bpm = bpm;
        Tone.Transport.bpm.value = bpm;
    }
    set_metronome() {
        this.metronome_sampler.volume.value = metronome_playing ? 1: -1024
    }
    set_master_volume() {
        Tone.Master.volume.value = (master_vol - 75) / 4;
    }
    init_loops() {
        console.log('init loops')
        this.metronome_loop = new Tone.Loop(time => {
            this.metronome_sampler.triggerAttack('C4', time);
            this.play_itvls(this.cursor);
        }, '8n');
    }
    play_itvls(cursor) {
        const time = cursor["time"];
        for (const dom of document.getElementsByClassName("itvl-" + time)) {
            dom.classList.add("itvl-cursor");
        }
        for (const dom of document.getElementsByClassName("itvl-" + (time+num_notes-1)%num_notes)) {
            dom.classList.remove("itvl-cursor");
        }
        cursor["time"] = (time + 1) % num_notes;
        for (const layer of this.layers) {
            const note = layer.sequence[time];
            if (note) {
                if (layer.sample.startsWith("synth")) {
                    if (note.is_valid()) {
                        this.synth.triggerAttackRelease(note.note, "8n");
                    }
                } else {
                    layer.sampler.triggerAttack('A1', Tone.now());
                }
            }
        }
    }
    async play_pause() {
        if (this.playing) {
            console.log("pause");
            this.metronome_loop.dispose();
            Tone.Transport.stop();
            Tone.Transport.clear(0);
            this.playing = false;
            this.cursor = {"time": 0};
            for (const dom of document.getElementsByClassName("itvl")) {
                dom.classList.remove("itvl-cursor");
            }
        } else {
            this.init_loops();
            this.metronome_loop.start(0);
            Tone.Transport.start(Tone.now());
            console.log("play");
            this.playing = true;
        }
    }
}

function init_key_presses(l) {
    document.addEventListener("keyup", async e => {
        if (e.code === "Space" && !recording) {
            l.play_pause();
            return;
        }
        if (e.key === 'ArrowDown') {
            last_note_used--;
        } else if(e.key === 'ArrowUp') {
            last_note_used++;
        }
        const selected = document.getElementById("note-selected");
        if (selected) {
            const i = parseInt(selected.parentElement.id.split('-')[1])
            const j = parseInt(selected.classList[1].split('-')[1])
            l.layers[i].sequence[j].note = notes[last_note_used];
            render_note_control(l.layers[i], i, j);
            if (l.layers[i].sample === "synth.wav") {
                render_synth_note(selected, l.layers[i].sequence[j].note);
            }
        }
    });
}


/* INITIALIZES ALL BUTTON EVENT LISTENERS */
function init_buttons(l) {
    console.log('init_buttons')
    document.getElementById("play").addEventListener("mouseup", async () => {
        if (!recording) {
            l.play_pause();
        }
    })
    document.getElementById("add-button").addEventListener("click", () => {
        l.add_layer("kick.wav");
        render_layers(l);
    })
    const layer_vol_inputs = document.getElementsByClassName("layer-volume");
    for (const dom of layer_vol_inputs) {
        dom.addEventListener("input", () => {
            l.layers[dom.id.split('-')[1]].sampler.volume.value = (parseInt(dom.value) - 50) / 4;
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
        l.set_master_volume();
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
        l.set_metronome();
    });
    const save_btn = document.getElementById("save");
    save_btn.addEventListener("click", (e) => {
        recording = true;
        const main = document.getElementById("main");
        const loading = document.getElementById("loading");
        loading.innerHTML = '<img src="https://i.gifer.com/origin/34/34338d26023e5515f6cc8969aa027bca_w200.gif">'
        loading.innerHTML += '<div>Your project is recording...<\div>'
        const block = document.createElement("div");
        block.id = "block";
        main.appendChild(block);
        const recorder = new Tone.Recorder();
        Tone.Destination.connect(recorder);
        if (l.playing) {
            l.play_pause();
        }
        l.play_pause();
        recorder.start();
        setTimeout(async () => {
            const blob = await recorder.stop();
            const options = {
                suggestedName: 'weblooper_proj.webm',
                types: [{
                    description: 'Web Media Audio file',
                    accept: {
                        'audio/webm': ['.webm']
                    }
                }]
            }
            l.play_pause();
            loading.innerHTML = '';
            const download_btn = document.createElement("button");
            download_btn.classList.add("btn");
            download_btn.classList.add("btn-success");
            download_btn.classList.add("btn-lg");
            download_btn.id = "download-btn";
            download_btn.innerText = "Download your project!";
            download_btn.type = "submit";
            block.appendChild(download_btn);
            download_btn.addEventListener('click', async () => {
                const handle = await window.showSaveFilePicker(options);
                save_file(handle, blob)
                main.removeChild(block);
                recording = false;
            })
        }, 960000 / l.bpm)  // record 2 measures
    })
}

async function save_file(handle, data) {
    const writable = await handle.createWritable();
    await writable.write(data)
    await writable.close();
}

function init_active_layer(i, l) {
    console.log('init_active_layer')
    let html = '<div class="layer-info d-flex flex-column">'
    html += '<div class="dropdown" id="drop'+i+'"><button class="btn btn-primary btn-sm dropdown-toggle" type="button" id="dropdown-menu-'+i+'" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'
    html += l.layers[i].sample.split('.')[0] + '</button><div class="dropdown-menu" aria-labelledby="dropdownMenuButton">'
    html += '<a class="dropdown-item" id="kick-'+i+'">kick</a><a class="dropdown-item" id="hihat-'+i+'">hihat</a><a class="dropdown-item" id="snare-'+i+'">snare</a><a class="dropdown-item" id="synth-'+i+'">synth</a></div></div>'
    html += '<div>V: <input type="range" class="form-control-range layer-volume" min=0 max=100 value-50 id="volume-'+i+'"></div>'
    html += '<button class="rem btn btn-secondary btn-sm" type="submit" id="rem-'+i+'">Remove</button></div>'
    html += '<div class="sequence" id="seq-'+i+'"></div>'
    return html;
}

function init_layers(l) {
    console.log('init_layers')
    let active_layers = l.layers.length;
    for (let i = 0; i < num_layers; i++) {
        // const layer = document.getElementById("layer-" + (i + 1));
        const layer = document.createElement("div");
        layer.id = "layer-" + (i + 1);
        document.getElementById("layer-panel").appendChild(layer);
        layer.classList.add("layer");
        if (active_layers < 1) {
            if (active_layers === 0) {
                layer.innerHTML = '<button class="btn btn-secondary" type="submit" id="add-button">Add Layer</button>';
            }
            layer.classList.add("inactive");
        } else {
            layer.innerHTML = init_active_layer(i, l);
            const remove_button = document.getElementById("rem-"+i);
            remove_button.addEventListener("mouseenter", () => {
                remove_button.classList.add('btn-danger');
            });
            remove_button.addEventListener("mouseleave", () => {
                remove_button.classList.remove('btn-danger');
            });
        }
        active_layers -= 1;
    }
    for (const sample of ["kick", "snare", "hihat", "synth"]) {  // init samples
        const dropdown_item = document.getElementById(sample+"-"+0);
        dropdown_item.addEventListener("click", () => {
            console.log('dropdown clicked')
            l.layers[0].change_sample(sample + '.wav');
            document.getElementById("dropdown-menu-"+0).innerText = sample;
        });
    }
}

/* With the looper class as input, this function renders every sequence. */
function render_sequences(l) {
    console.log('render_sequences')
    for (let i = 0; i < l.layers.length; i++) {  // iterate over every layer
        const sequence = document.getElementById("seq-" + i)  // select corres. sequence dom
        if (sequence.childNodes.length === 0) {  // if it's an empty sequence
            for (let j = 0; j < num_notes; j++) {  // iterate over every interval in the sequence
                const interval = document.createElement("div");
                interval.classList.add("itvl");
                interval.classList.add("itvl-"+j);
                interval.addEventListener("mouseover", () => {
                    interval.classList.add("itvl-hover");
                });
                interval.addEventListener("mouseleave", () => {
                    interval.classList.remove("itvl-hover");
                });
                interval.addEventListener("click", () => {
                    if (interval.classList.contains("itvl-activated")) {
                        l.layers[i].sequence[j] = 0;
                        if (interval.id === "note-selected") {
                            interval.id = "";
                        }
                        interval.classList.remove("itvl-activated");
                        interval.innerHTML = "";
                    } else {  // initalize activated interval
                        l.layers[i].sequence[j] = l.layers[i].sequence[j]? l.layers[i].sequence[j]: new Note(notes[last_note_used]);
                        const last_selected = document.getElementById("note-selected")
                        if (last_selected) {
                            last_selected.id = "";
                        }
                        interval.id = "note-selected";
                        interval.classList.add("itvl-activated");
                        if (l.layers[i].sequence[j]) {
                            render_note_control(l.layers[i], i, j);
                            if (l.layers[i].sample === "synth.wav") {
                                render_synth_note(interval, l.layers[i].sequence[j].note);
                            }
                        }
                    }
                });
                interval.addEventListener("contextmenu", (e) => {
                    if (interval.classList.contains("itvl-activated")) {
                        const last_selected = document.getElementById("note-selected");
                        if (last_selected) {
                            last_selected.id = "";
                        }
                        interval.id = "note-selected";
                    }
                    e.preventDefault();
                    if (l.layers[i].sequence[j]) {
                        render_note_control(l.layers[i], i, j)
                    }
                });
                sequence.appendChild(interval);
            }
        } else { // existing sequence
            for (let j = 0; j < num_notes; j++) {  // iterate over every interval
                const interval = sequence.childNodes[j];
                if (l.layers[i].sequence[j]) {  // if the note is active
                    if (!interval.classList.contains("itvl-activated")) {
                        interval.classList.add("itvl-activated");
                        if (l.layers[i].sample === "synth.wav") {
                            render_synth_note(interval, l.layers[i].sequence[j].note);
                        }
                    }
                } else {  // if the note is empty
                    if (interval.classList.contains("itvl-activated")) {
                        interval.classList.remove("itvl-activated");
                        interval.innerHTML = "";
                    }
                }
            }
        }
    }
}

/* Takes in looper class and renders each layer. Invokes render_sequences. */
function render_layers(l) {
    console.log('render_layers')
    let active_layers = l.layers.length;
    const layers = document.getElementsByClassName("layer");
    for (let i = 0; i < num_layers; i++) {
        const layer = layers[i];
        if (active_layers < 1) {  // if layer is inactive
            if (active_layers === 0) {  // set button for topmost inactive layer
                layer.innerHTML = '<button class="btn btn-secondary" type="submit" id="add-button">Add Layer</button>';
            } else if (layer.innerHTML) {  // no buttons for other inactive layers
                layer.innerHTML = '';
            }
            layer.classList.add("inactive");
        } else {  // if layer is active
            if (layer.classList.contains("inactive")) { // new active layer is made
                layer.classList.remove("inactive");
                layer.innerHTML = init_active_layer(i, l);
                const remove_button = document.getElementById("rem-"+i);
                remove_button.addEventListener("click", () => {
                    l.remove_layer(i);
                    render_layers(l);
                });
                remove_button.addEventListener("mouseenter", () => {
                    remove_button.classList.add('btn-danger');
                });
                remove_button.addEventListener("mouseleave", () => {
                    remove_button.classList.remove('btn-danger');
                });
                for (const sample of ["kick", "snare", "hihat", "synth"]) {
                    const dropdown_item = document.getElementById(sample+"-"+i);
                    dropdown_item.addEventListener("click", (e) => {
                        console.log('dropdown clicked')
                        l.layers[i].change_sample(sample + '.wav');
                        document.getElementById("dropdown-menu-"+i).innerText = sample;
                    });
                }
                const layer_vol_slider = document.getElementById("volume-"+i)
                layer_vol_slider.addEventListener("input", () => {
                        l.layers[layer_vol_slider.id.split('-')[1]].sampler.volume.value = (parseInt(layer_vol_slider.value) - 50) / 4;
                });
            }
        }
        active_layers -= 1;
    }
    render_sequences(l);
    if (document.getElementById("add-button")) {
        document.getElementById("add-button").addEventListener("click", () => {
            l.add_layer("kick.wav");
            render_layers(l);
        });
    }
}

function render_synth_note(itvl, note) {
    return itvl.innerHTML = `<div class="synth_note">${note}<\div>`;
}

function render_note_control(layer, l_num, i_num) {
    let note = layer.sequence[i_num];
    console.log('render_note_control')
    let html ='Note: <input type="tel" placeholder='+note.note+' value='+note.note+' id="note-input">'
    html += 'Volume: <input type="range" class="form-control-range" min=0 max=100 value='+note.note_volume+' id="note-volume">'
    document.getElementById("note-dash-container").innerHTML = html;
    const note_input = document.getElementById("note-input");
    note_input.addEventListener("input", () => {
        note.note = note_input.value;
        if (layer.sample === 'synth.wav') {
            const itvl = document.getElementById(`seq-${l_num}`).childNodes[i_num];
            last_note_used = notes.indexOf(note.note);
            render_synth_note(itvl, note.note);
        }
    });
    const volume_slider = document.getElementById("note-volume");
    volume_slider.addEventListener("input", () => {
        note.volume = volume_slider.value;
    });
}

function init_all() {
    console.log('init_all')
    let l = new Looper();
    init_layers(l);
    init_key_presses(l);
    init_buttons(l);
    render_sequences(l);
}

init_all()