class Layer {
    constructor(sample, num_notes) {
        this.sample = sample;
        this.sequence = this.init_sequence(num_notes);
        this.layer_volume = {"vol": 50}; // to be passed by reference to setinterval
        this.sampler = new Tone.Sampler({
            urls: {
                C4: sample
            },
            baseUrl: "/samples/"
        }).toDestination()
    }
    init_sequence(num_notes) {
        return [...Array(num_notes-1)].map(e=>0);
    }
    change_sample(new_sample) {
        this.sample = new_sample;
    }
}

class Note {
    constructor(note) {
        this.note = note; // string in note + octave format i.e. C4
        this.note_volume = {"vol": 50};
        this.duration = 16 // 16th note division
    }
}

export {Layer, Note};