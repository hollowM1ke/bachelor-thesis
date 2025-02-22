import { decodeComponentInfo, encodeComponentInfo, encodeConnection } from '../boards/boardFunctions';

export const DEFAULT_COMPONENT_SIZE = { width: 200, height: 200 };

export class BoardProxy {
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

    // TODO: figure out if creating ids and such remains in the reducer's prep function or here
    addComponent (componentId, type, position, innerId, createdBy, createdOn, componentName, description, size = DEFAULT_COMPONENT_SIZE, labelId, flag, count, loadSkip = false, isExternal = false) {
        let componentInfo;
        labelId
            ? componentInfo = {
                type,
                innerId,
                position,
                createdBy,
                createdOn,
                size: type === 'comment' ? { width: 200, height: 20 } : size,
                componentName,
                label: { labelId, description: (description || `${componentName}-${createdOn}`), flag: flag || false, count: count || 0 },
                loadSkip,
                isExternal
            }
            : componentInfo = {
                type,
                innerId,
                position,
                createdBy,
                createdOn,
                size: type === 'comment' ? { width: 200, height: 20 } : size,
                componentName,
                loadSkip,
                isExternal
            };
        this.data.components[componentId] = componentInfo;
        this.executor.scheduleJob(() => {
            this.crdtObjects.componentsInfoObject.doc.transact(() => {
                this.crdtObjects.componentsInfoObject.set(componentId, encodeComponentInfo(componentInfo));
            });
        });
    }

    removeComponent (componentId) {
        delete this.data.components[componentId];
        this.executor.scheduleJob(() => {
            this.crdtObjects.componentsInfoObject.doc.transact(() => {
                this.crdtObjects.componentsInfoObject.delete(componentId);
            });
        });
    }

    addComponentLabel (componentId, labelId, description, flag, count) {
        const componentInfo = this.data.components[componentId];
        componentInfo.label = {
            labelId,
            description,
            flag,
            count
        };
        this.executor.scheduleJob(() => {
            const info = this.crdtObjects.componentsInfoObject.get(componentId);
            const decodeInfo = decodeComponentInfo(info);
            decodeInfo.label = {
                labelId,
                description,
                flag,
                count
            };
            const encodeInfo = encodeComponentInfo(decodeInfo);
            this.crdtObjects.componentsInfoObject.doc.transact(() => {
                this.crdtObjects.componentsInfoObject.set(componentId, encodeInfo);
            });
            // this.crdtObjects.componentsInfoObject.set(componentId, componentInfoCopy);
        });
    }

    removeComponentLabel (componentId) {
        const componentInfo = this.data.components[componentId];
        delete componentInfo.label;
        this.executor.scheduleJob(() => {
            const info = this.crdtObjects.componentsInfoObject.get(componentId);
            const decodeInfo = decodeComponentInfo(info);
            delete decodeInfo.label;
            const encodeInfo = encodeComponentInfo(decodeInfo);
            this.crdtObjects.componentsInfoObject.doc.transact(() => {
                this.crdtObjects.componentsInfoObject.set(componentId, encodeInfo);
            });
        });
    }

    setComponentSize (componentId, size) {
        const componentInfo = this.data.components[componentId];
        componentInfo.size = size;
        this.executor.scheduleJob(() => {
            const info = this.crdtObjects.componentsInfoObject.get(componentId);
            const decodeInfo = decodeComponentInfo(info);
            decodeInfo.size = size;
            const encodeInfo = encodeComponentInfo(decodeInfo);
            this.crdtObjects.componentsInfoObject.doc.transact(() => {
                this.crdtObjects.componentsInfoObject.set(componentId, encodeInfo);
            });
        });
    }

    moveComponent (componentId, position) {
        const componentInfo = this.data.components[componentId];
        componentInfo.position = position;
        this.executor.scheduleJob(() => {
            const info = this.crdtObjects.componentsInfoObject.get(componentId);
            const decodeInfo = decodeComponentInfo(info);
            decodeInfo.position = position;
            const encodeInfo = encodeComponentInfo(decodeInfo);
            this.crdtObjects.componentsInfoObject.doc.transact(() => {
                this.crdtObjects.componentsInfoObject.set(componentId, encodeInfo);
            });
        });
    }

    addArrow (fromComponentId, toComponentId, connectionId) {
        const componentsInfo = this.data.components;
        if (componentsInfo[fromComponentId] && componentsInfo[toComponentId]) {
            this.data.connections[connectionId] = true;
            this.executor.scheduleJob(() => {
                // setting a char probably uses less data than the stringified bool
                this.crdtObjects.componentsInfoObject.doc.transact(() => {
                    this.crdtObjects.connectionsObject.set(connectionId, JSON.stringify(true));
                });
            });
        }
    }

    removeAllComponentArrows (componentId) {
        const connections = this.data.connections;
        Object.keys(this.data.components).forEach(targetComponentId => {
            // Note: the redundant removes may cause slight performance issues
            const encodedConnectionFrom = encodeConnection(componentId, targetComponentId);
            const encodedConnectionTo = encodeConnection(targetComponentId, componentId);
            delete connections[encodedConnectionFrom];
            delete connections[encodedConnectionTo];
            this.executor.scheduleJob(() => {
                this.crdtObjects.componentsInfoObject.doc.transact(() => {
                    this.crdtObjects.connectionsObject.delete(encodedConnectionFrom);
                    this.crdtObjects.connectionsObject.delete(encodedConnectionTo);
                });
            });
        });
    }

    removeArrow (connectionId) {
        delete this.data.connections[connectionId];
        this.executor.scheduleJob(() => {
            this.crdtObjects.componentsInfoObject.doc.transact(() => {
                this.crdtObjects.connectionsObject.delete(connectionId);
            });
        });
    }
}
