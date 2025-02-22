import {
    encodeBoolean
} from '../functions/booleanFunctions';

export class CheckboxProxy {
    constructor (data, crdtObj, executor) {
        this.data = data;
        this.crdtObj = { ...crdtObj };
        this.executor = executor;
    }

    setError (err) {
        this.data.err = err;
    }

    // Id param is due to using a map crdt for some reason
    setCheckbox (id, checked) {
        this.data.checked = checked;
        this.executor.scheduleJob(() => {
            this.crdtObj.checkboxObjectMap.doc.transact(() => {
                this.crdtObj.checkboxObjectMap.set(id, encodeBoolean(checked));
            });
        });
    }

    getChecked () {
        return this.data.checked;
    }
}
