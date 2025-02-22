export class ImageProxy {
    constructor (data, crdtObj, executor) {
        this.data = data;
        this.crdtObj = { ...crdtObj };
        this.executor = executor;
    }

    setError (err) {
        this.data.err = err;
    }

    setUrl (id, value) {
        this.data.url = value;
        this.executor.scheduleJob(() => {
            this.crdtObj.urlObject.doc.transact(() => {
                this.crdtObj.urlObject.set(id, value);
            });
        });
    }

    setDescription (id, value) {
        this.data.description = value;
        this.executor.scheduleJob(() => {
            this.crdtObj.descriptionObject.doc.transact(() => {
                this.crdtObj.descriptionObject.set(id, value);
            });
        });
    }

    setRotation (id, value) {
        this.data.rotation = value;
        this.executor.scheduleJob(() => {
            this.crdtObj.rotationObject.doc.transact(() => {
                this.crdtObj.rotationObject.set(id, value);
            });
        });
    }

    getUrl () {
        return this.data.url;
    }

    getDescription () {
        return this.data.description;
    }

    getRotation () {
        return this.data.rotation;
    }

    getData () {
        return {
            url: this.getUrl(),
            description: this.getDescription(),
            rotation: this.getRotation()
        };
    }
}
