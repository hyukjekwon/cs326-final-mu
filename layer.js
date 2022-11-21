class Layer {
    constructor(sample, num_notes) {
        this.sample = sample;
        this.sequence = this.init_sequence(num_notes);
        this.layer_volume = {"vol": 50}; // to be passed by reference to setinterval
        this.sampler = this.init_sampler()
    }
    init_sequence(num_notes) {
        return [...Array(num_notes-1)].map(e=>0);
    }
    init_sampler() {
        return new Tone.Sampler({
            urls: {
                A1: this.sample !== "synth.wav" ? this.sample : "kick.wav"
            },
            baseUrl: "/samples/"
        }).toDestination();
    }
    change_sample(new_sample) {
        this.sample = new_sample;
        this.sampler = this.init_sampler();
    }
}

class Note {
    constructor(note) {
        this.note = note; // string in note + octave format i.e. C4
        this.note_volume = {"vol": 50};
        this.duration = 16 // 16th note division
    }
    is_valid() {
        return /(^[A-G])([b,#])?([0-9]$)/.test(this.note);
    }
}

export {Layer, Note};