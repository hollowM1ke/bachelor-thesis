export class PersonalDataProxy {
    constructor (data, crdtObjects, executor) {
        this.data = data;
        this.crdtObjects = {
            ...crdtObjects
        }; // extract the objects explicitly to trigger the immer proxy
        this.executor = executor;
    }

    setError (err) {
        this.data.err = err;
    }

    addFlag (componentId, flag, count) {
        // const FlagsList = this.data.flags;
        // FlagsList[componentId] = flag;
        const componentInfo = this.data.flags;
        componentInfo[componentId] = {
            flag,
            count
        };
        this.executor.scheduleJob(() => {
            this.crdtObjects.flagsInfoObject.doc.transact(() => {
                const flagDetails = {
                    flag,
                    count
                };
                this.crdtObjects.flagsInfoObject.set(componentId, flagDetails);
            });
        });
    }

    removeFlag (componentId) {
        const flags = this.data ? this.data.flags : 'none';
        delete flags[componentId];
        this.executor.scheduleJob(() => {
            this.crdtObjects.flagsInfoObject.doc.transact(() => {
                this.crdtObjects.flagsInfoObject.delete(componentId);
            });
        });
    }

    addProgressTrackerItem (componentId, progressValue, label) {
        const ProgressList = this.data.progressTracker;
        const progressInfo = {
            progressValue,
            label
        };
        ProgressList[componentId] = progressInfo;
        this.executor.scheduleJob(() => {
            this.crdtObjects.progressInfoObject.doc.transact(() => {
                this.crdtObjects.progressInfoObject.set(componentId, JSON.stringify(progressInfo));
            });
        });
    }

    removeProgressTrackerItem (componentId) {
        const progress = this.data ? this.data.progressTracker : 'none';
        delete progress[componentId];
        this.executor.scheduleJob(() => {
            this.crdtObjects.progressInfoObject.doc.transact(() => {
                this.crdtObjects.progressInfoObject.delete(componentId);
            });
        });
    }
}
