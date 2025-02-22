export class HTMLProxy {
    constructor (data, crdtObj, executor) {
        this.data = data;
        this.crdtObj = { ...crdtObj };
        this.executor = executor;
    }

    setHTMLValue (id, value) {
        this.data.value = value;
        this.executor.scheduleJob(() => {
            this.crdtObj.htmlTextObject.doc.transact(() => {
                this.crdtObj.htmlTextObject.set(id, value);
            });
        });
    }

    getHTMLValue () {
        return this.data.value;
    }
}
