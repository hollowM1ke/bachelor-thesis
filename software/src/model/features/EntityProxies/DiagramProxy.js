
export class DiagramProxy {
    constructor (data, crdtObj, executor) {
        this.data = data;
        this.crdtObj = { ...crdtObj };
        this.executor = executor;
    }

    setError (err) {
        this.data.err = err;
    }

    setDiagramType (id, type) {
        this.data.value.type = type;
        this.executor.scheduleJob(() => {
            this.crdtObj.diagramTypeObject.doc.transact(() => {
                this.crdtObj.diagramTypeObject.set(id, type);
            });
        });
    }

    setDiagramSSID (id, ssid) {
        this.data.value.ssid = ssid;
        this.executor.scheduleJob(() => {
            this.crdtObj.SSIdObject.doc.transact(() => {
                this.crdtObj.SSIdObject.set(id, ssid);
            });
        });
    }

    setDiagramSettings (id, settings) {
        this.data.value.settings = settings;
        this.executor.scheduleJob(() => {
            this.crdtObj.settingsObject.doc.transact(() => {
                this.crdtObj.settingsObject.set(id, settings);
            });
        });
    }
};
