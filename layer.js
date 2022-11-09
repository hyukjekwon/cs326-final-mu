class Looper {
    constructor(sample) {
        this.sample = sample;
        this.sequence = init_sequence(sample);
    }
    init_sequence(sample_name) {
        return {"sample": sample_name, "sequence": [...Array(15)].map(e=>0)};
    }
}