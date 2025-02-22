import { createSlice } from '@reduxjs/toolkit';
import CRDTExecutor from './CRDTExecutor';
import { BoardProxy } from '../../../features/EntityProxies/BoardProxy';
import { CheckboxProxy } from '../../../features/EntityProxies/CheckboxProxy';
import { HTMLProxy } from '../../../features/EntityProxies/HTMLProxy';
import { ImageProxy } from '../../../features/EntityProxies/ImageProxy';
import { MarkdownProxy } from '../../../features/EntityProxies/MarkdownProxy';
import { TodoListProxy } from '../../../features/EntityProxies/TodoListProxy';
import { DiagramProxy } from '../../../features/EntityProxies/DiagramProxy';
import { SpreadsheetProxy } from '../../../features/EntityProxies/SpreadsheetProxy';
import { CommentProxy } from '../../../features/EntityProxies/CommentProxy';
import { PersonalDataProxy } from '../../../features/EntityProxies/PersonalDataProxy';
import { MetaDataProxy } from '../../../features/EntityProxies/MetaDataProxy';

// TODO: implement this in a less ad-hoc manner, data should be
export const CRDTSyncMiddleware = (...interceptors) => ({ getState, dispatch }) => next => action => {
    const [sliceName, actionName] = action.type.split('/');
    const interceptorFunc = getInterceptor(interceptors, sliceName, actionName);

    next(action);
    // Update crdt at the end to avoid duplicated action
    if (interceptorFunc && action.payload.sync) {
        interceptorFunc(getState()[sliceName], action); // TODO: use immutable proxies (immer) instead of state, otherwise state is read-only
    }
};

function getInterceptor (interceptors, forSlice, actionName) {
    const sliceInterceptors = interceptors
        .filter(interceptorClass => interceptorClass.forSlice === forSlice)
        .reduce((interceptorClass, acc) => ({ ...interceptorClass.functions, ...acc }), {});

    if (sliceInterceptors && sliceInterceptors.functions) { // Check that there are actually crdt actions defined
        const interceptor = sliceInterceptors.functions[actionName];
        if (interceptor) {
            return interceptor;
        }
    }
}

export const CRDTToolsMiddleware = (crdtStorage) => () => next => action => {
    const executor = CRDTExecutor();
    action.crdtStore = crdtStorage;
    action.executor = executor;
    next(action);
    if ((!action.payload || !action.payload.skipSync) && !process.env.appltest) {
        executor.startTransaction();
    }
};

const PROXY_CLASSES = {
    Board: BoardProxy,
    Checkbox: CheckboxProxy,
    HTML: HTMLProxy,
    Image: ImageProxy,
    Markdown: MarkdownProxy,
    TodoList: TodoListProxy,
    Diagram: DiagramProxy,
    Spreadsheet: SpreadsheetProxy,
    Comment: CommentProxy,
    PersonalData: PersonalDataProxy,
    MetaData: MetaDataProxy
};

function proxifyReducer (reducer) {
    return (state, action) => {
        const PROXY_OBJECTS = new Map();
        const proxyHandler = {
            get (target, prop, receiver) {
                if (typeof target[prop] === 'object' && target[prop] !== null) {
                    const key = target[prop];
                    if (!PROXY_OBJECTS.has(key)) {
                        if (target[prop]._crdt) {
                            PROXY_OBJECTS.set(key, new PROXY_CLASSES[target[prop]._type](target[prop].data, target[prop].crdtObjects, action.executor));
                        } else if (target[prop]._type === 'MetaData') {
                            PROXY_OBJECTS.set(key, new PROXY_CLASSES[target[prop]._type](target[prop].data));
                        } else {
                            PROXY_OBJECTS.set(key, new Proxy(target[prop], proxyHandler));
                        }
                    }
                    return PROXY_OBJECTS.get(key);
                }
                return target[prop];
            },
            set (obj, prop, value) {
                return Reflect.set(obj, prop, value);
            }
        };
        const proxyState = new Proxy(state, proxyHandler);
        return reducer(proxyState, action);
    };
}

export const createCRDTSupportedSlice = (slice) => {
    const sliceReducers = slice.reducers;

    const newReducers = Object.entries(sliceReducers).reduce((reducers, [actionName, actionFuncs]) => {
        if (typeof slice.reducers[actionName] === 'function') {
            reducers[actionName] = proxifyReducer(slice.reducers[actionName]);
        } else {
            reducers[actionName] = slice.reducers[actionName];
            reducers[actionName].reducer = proxifyReducer(slice.reducers[actionName].reducer);
        }
        return reducers;
    }, {});

    const newSlice = { ...slice };
    newSlice.reducers = newReducers;
    return createSlice(newSlice);
};
