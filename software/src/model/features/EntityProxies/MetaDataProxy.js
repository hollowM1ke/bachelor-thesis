export class MetaDataProxy {
    constructor (data) {
        this.data = data;
    }

    changeFlag (flag) {
        this.data.value.connected_flag = flag;
    }
}
