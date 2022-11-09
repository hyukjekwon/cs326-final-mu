class Layer {
    constructor(sample) {
        this.sample = sample;
        this.sequence = this.init_sequence();
        this.layer_volume = 50;
    }
    init_sequence() {
        return [...Array(15)].map(e=>0);
    }
    change_sample(new_sample) {
        this.sample = new_sample;
    }
}

export {Layer};