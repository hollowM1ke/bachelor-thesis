export class TodoListProxy {
    constructor (data, crdtObj, executor) {
        this.data = data;
        this.crdtObj = { ...crdtObj };
        this.executor = executor;
    }

    setError (err) {
        this.data.err = err;
    }

    addItem (atIdx, newItem) {
        this.data.value.splice(atIdx, 0, newItem);
        // const item = this.data.value[atIdx];
        this.executor.scheduleJob(() => {
            this.crdtObj.todoListArray.doc.transact(() => {
                this.crdtObj.todoListArray.insert(atIdx, [newItem.id]);
                this.crdtObj.todoListTextMap.set(newItem.id, newItem.text);
                this.crdtObj.todoListCheckedMap.set(newItem.id, newItem.checked);
                const processNestedItems = (items) => {
                    for (const nestedItem of items) {
                        const index = this.crdtObj.todoListChildArray.length;
                        this.crdtObj.todoListChildArray.insert(index, [nestedItem]);
                        this.crdtObj.todoListDummyChildArray.insert(index, [nestedItem]);
                        this.crdtObj.todoListChildItemCheckedMap.set(nestedItem.id, nestedItem.checked);
                        this.crdtObj.todoListChildTextMap.set(nestedItem.id, nestedItem.text);
                        if (nestedItem.nestedItems && nestedItem.nestedItems.length > 0) {
                            processNestedItems.call(this, nestedItem.nestedItems);
                        }
                    }
                };
                if (newItem.nestedItems && newItem.nestedItems.length > 0) {
                    processNestedItems.call(this, newItem.nestedItems);
                }
            });
        });
    }

    removeItem (atIdx, itemId) {
        this.data.value.splice(atIdx, 1);
        this.executor.scheduleJob(() => {
            this.crdtObj.todoListArray.doc.transact(() => {
                this.crdtObj.todoListArray.delete(atIdx, 1);
                this.crdtObj.todoListTextMap.delete(itemId);
                this.crdtObj.todoListCheckedMap.delete(itemId);
            });
        });
    }

    setChecked (atIdx, checked) {
        const itemId = this._getItemId(atIdx);
        if (this.data.value[atIdx]) {
            this.data.value[atIdx].checked = checked;
        }
        this.executor.scheduleJob(() => {
            this.crdtObj.todoListArray.doc.transact(() => {
                this.crdtObj.todoListCheckedMap.set(itemId, checked);
            });
        });
    }

    editText (atIdx, newText) {
        const itemId = this._getItemId(atIdx);
        if (this.data.value[atIdx]) {
            this.data.value[atIdx].text = newText;
        }
        this.executor.scheduleJob(() => {
            this.crdtObj.todoListArray.doc.transact(() => {
                this.crdtObj.todoListTextMap.set(itemId, newText);
            });
        });
    }

    _getItemId (atIdx) {
        return this.data.value[atIdx].id;
    }

    addChildItem (parentId, newItem) {
        const stack = Object.values(this.data.value);
        while (stack.length > 0) {
            const item = stack.pop();
            if (item.id === parentId) {
                if (!item.nestedItems) {
                    item.nestedItems = [];
                }
                item.nestedItems.push(newItem);
                break; // Object added, exit the loop
            }
            if (item.nestedItems) {
                stack.push(...item.nestedItems);
            }
        }
        this.executor.scheduleJob(() => {
            this.crdtObj.todoListChildArray.doc.transact(() => {
                const index = this.crdtObj.todoListChildArray.length;
                this.crdtObj.todoListChildArray.insert(index, [newItem]);
                this.crdtObj.todoListDummyChildArray.insert(index, [newItem]);
                this.crdtObj.todoListChildItemCheckedMap.set(newItem.id, newItem.checked);
                this.crdtObj.todoListChildTextMap.set(newItem.id, newItem.text);
            });
        });
    };

    removeChildItem (itemId, parentId) {
        const stack = Object.values(this.data.value);
        while (stack.length > 0) {
            const item = stack.pop();
            if (item.id === parentId) {
                if (item.nestedItems) {
                    item.nestedItems = item.nestedItems.filter(childItem => childItem.id !== itemId);
                }
                break;
            }
            if (item.nestedItems) {
                stack.push(...item.nestedItems);
            }
        }
        this.executor.scheduleJob(() => {
            this.crdtObj.todoListChildArray.doc.transact(() => {
                const temp = this.crdtObj.todoListChildArray.toArray();
                const index = temp.findIndex(item => item.id === itemId);
                this.crdtObj.todoListChildArray.delete(index, 1);
            });
        });
    }

    removeDummyChildItem (index) {
        this.executor.scheduleJob(() => {
            this.crdtObj.todoListDummyChildArray.doc.transact(() => {
                this.crdtObj.todoListDummyChildArray.delete(index, 1);
            });
        });
    }

    setChildItemChecked (itemId, checked) {
        // const itemId = this._getItemId(atIdx);
        // if (this.data.value[atIdx]) {
        //     this.data.value[atIdx].checked = checked;
        // }
        const stack = Object.values(this.data.value);
        while (stack.length > 0) {
            const item = stack.pop();
            if (item.id === itemId) {
                item.checked = checked;
                break; // Object added, exit the loop
            }
            if (item.nestedItems) {
                stack.push(...item.nestedItems);
            }
        }
        this.executor.scheduleJob(() => {
            this.crdtObj.todoListChildArray.doc.transact(() => {
                this.crdtObj.todoListChildItemCheckedMap.set(itemId, checked);
            });
        });
    }

    editChildItemText (itemId, text) {
        // const itemId = this._getItemId(atIdx);
        // if (this.data.value[atIdx]) {
        //     this.data.value[atIdx].checked = checked;
        // }
        const stack = Object.values(this.data.value);
        while (stack.length > 0) {
            // console.log('entered stack in proxy for child', stack);
            const item = stack.pop();
            if (item.id === itemId) {
                item.text = text;
                break; // Object added, exit the loop
            }
            if (item.nestedItems) {
                stack.push(...item.nestedItems);
            }
        }
        this.executor.scheduleJob(() => {
            this.crdtObj.todoListChildArray.doc.transact(() => {
                this.crdtObj.todoListChildTextMap.set(itemId, text);
            });
        });
    }
};
