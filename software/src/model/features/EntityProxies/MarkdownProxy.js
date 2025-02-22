export class MarkdownProxy {
    constructor (data, crdtObj, executor) {
        this.data = data;
        this.crdtObj = { ...crdtObj };
        this.executor = executor;
    }

    setError (err) {
        this.data.err = err;
    }

    // Id param is due to using a map crdt for some reason
    setVal (value) {
        this.data.value = value;
        this.executor.scheduleJob(() => {
            // TODO: set value in the doc
            // this.crdtObj.markdownTextObject.set(value);
        });
    }

    getVal () {
        return this.data.value;
    }
}
