/* eslint-disable indent */
import { TOOL_LIST } from '../components/Board/boardConfig';
import BoardContextManager from '../components/Board/BoardContextManager';
import React from 'react';
import SpreadSheet from '../components/Tools/Full/SpreadSheet/SpreadSheetComponent';
import { Provider } from 'react-redux';
import { render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndProvider } from 'react-dnd-multi-backend';
import { HTML5toTouch } from 'rdndmb-html5-to-touch';
import { FullScreen } from 'react-full-screen';
import { MemoryRouter } from 'react-router-dom';
import TodoList from '../components/Tools/Full/TodoList/TodoList';
import { ErrorBoundary } from 'react-error-boundary';

import { appTheme } from '../theme';
import { ThemeProvider } from '@mui/material/styles';

// mocking der loadComponent function. We have no bard we want to load it in.
export const loadComponent = (boardId, componentId, type, initialState) => {};
// mock setBoardZoomStatus
export const setBoardZoomStatus = (boolean) => {};
// mocked contextMananger
export const contextManager = {
    loadComponent,
    setBoardZoomStatus,
    toolList: TOOL_LIST,
    userRole: 'a',
    adminPreview: false
};

export const colorMap = new Map();
colorMap.set(0, 'rgb(255, 0, 0)');
colorMap.set(1, 'rgb(0, 0, 255)');
colorMap.set(2, 'rgb(0, 255, 0)');
colorMap.set(3, 'yellow');
colorMap.set(4, 'cyan');
colorMap.set(5, 'lime');
colorMap.set(6, 'grey');
colorMap.set(7, 'orange');
colorMap.set(8, 'purple');
colorMap.set(9, 'black');
colorMap.set(11, 'pink');
colorMap.set(12, 'darkblue');
// Standartwert
colorMap.set('default', 'rgb(255, 255, 255)');

export const genRanHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

export function getRandomInt (max) {
    return Math.floor(Math.random() * max);
}

export function simulate (element, eventName) {
    const options = extend(defaultOptions, arguments[2] || {});
    let oEvent; let eventType = null;

    for (const name in eventMatchers) {
        if (eventMatchers[name].test(eventName)) { eventType = name; break; }
    }

    if (!eventType) { throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported'); }

    if (document.createEvent) {
        oEvent = document.createEvent(eventType);
        if (eventType === 'HTMLEvents') {
            oEvent.initEvent(eventName, options.bubbles, options.cancelable);
        } else {
            oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
                options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
                options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
        }
        element.dispatchEvent(oEvent);
    } else {
        options.clientX = options.pointerX;
        options.clientY = options.pointerY;
        const evt = document.createEventObject();
        oEvent = extend(evt, options);
        element.fireEvent('on' + eventName, oEvent);
    }
    return element;
}

function extend (destination, source) {
    for (const property in source) { destination[property] = source[property]; }
    return destination;
}

var eventMatchers = {
    HTMLEvents: /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
    MouseEvents: /^(?:click|contextmenu|dblclick|mouse(?:down|up|over|move|out))$/
};
var defaultOptions = {
    pointerX: 0,
    pointerY: 0,
    button: 0,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    bubbles: true,
    cancelable: true
};

class FakeMouseEvent extends MouseEvent {
    constructor (type, values = {}) {
        const {
            pageX = 0,
            pageY = 0,
            offsetX = 5,
            offsetY = 5,
            x = 10,
            y = 10,
            ...mouseValues
        } = values;
        super(type, mouseValues);

        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.pageX = pageX;
        this.pageY = pageY;
        this.x = x;
        this.y = y;
    }
}

export function getMouseEvent (type, values = {}) {
    const defaultValues = {
        bubbles: true,
        cancelable: true
    };
    const mergedValues = Object.assign({}, defaultValues, values);
    return new FakeMouseEvent(type, mergedValues);
}

// Define the shape of FakeMouseEventInit
const FakeMouseEventInit = {
    bubbles: Boolean,
    cancelable: Boolean,
    composed: Boolean,
    altKey: Boolean,
    button: Number,
    buttons: Number,
    clientX: Number,
    clientY: Number,
    ctrlKey: Boolean,
    metaKey: Boolean,
    movementX: Number,
    movementY: Number,
    offsetX: Number,
    offsetY: Number,
    pageX: Number,
    pageY: Number,
    screenX: Number,
    screenY: Number,
    shiftKey: Boolean,
    x: Number,
    y: Number
}; ;

// https://stackoverflow.com/a/53946549/1179377
function isElement (obj) {
    if (typeof obj !== 'object') {
        return false;
    }
    let prototypeStr, prototype;
    do {
        prototype = Object.getPrototypeOf(obj);
        // to work in iframe
        prototypeStr = Object.prototype.toString.call(prototype);
        // '[object Document]' is used to detect document
        if (
            prototypeStr === '[object Element]' ||
      prototypeStr === '[object Document]'
        ) {
            return true;
        }
        obj = prototype;
    // null is the terminal of object
    } while (prototype !== null);
    return false;
}

function getElementClientCenter (element) {
    const { left, top, width, height } = element.getBoundingClientRect();
    return {
        x: left + width / 2,
        y: top + height / 2
    };
}

const getCoords = charlie =>
    isElement(charlie) ? getElementClientCenter(charlie) : charlie;

const sleep = ms =>
    new Promise(resolve => {
        setTimeout(resolve, ms);
    });

export async function drag (
    element,
    { to: inTo, delta, steps = 20, duration = 5 }
) {
    const from = getElementClientCenter(element);
    const to = delta
        ? {
            x: from.x + delta.x,
            y: from.y + delta.y
        }
        : getCoords(inTo);

    const step = {
        x: (to.x - from.x) / steps,
        y: (to.y - from.y) / steps
    };

    const current = {
        clientX: from.x,
        clientY: from.y,
        pageX: from.x,
        pageY: from.y
    };

    fireEvent.mouseEnter(element, current);
    fireEvent.mouseOver(element, current);
    fireEvent.mouseMove(element, current);
    fireEvent.mouseDown(element, current);
    for (let i = 0; i < steps; i++) {
        current.clientX += step.x;
        current.clientY += step.y;
        // await sleep(duration / steps);
        fireEvent.mouseMove(element, current);
    }
    fireEvent.mouseUp(element, current);
}
export async function drag2 (
    element,
    { to: inTo, delta, from: fromWhere = null, steps = 20, duration = 5 }
) {
    let from;
    if (from === null) {
        from = getElementClientCenter(element);
    } else {
        from = fromWhere;
    }
    const to = delta
        ? {
            x: from.x + delta.x,
            y: from.y + delta.y
        }
        : getCoords(inTo);

    const step = {
        x: (to.x - from.x) / steps,
        y: (to.y - from.y) / steps
    };

    const current = {
        clientX: from.x,
        clientY: from.y,
        pageX: from.x,
        pageY: from.y
    };
    const mouseOver = getMouseEvent('mouseover', { clientX: current.clientX, clientY: current.clientY, pageX: current.pageX, pageY: current.pageY });
    let mouseMove = getMouseEvent('mousemove', { clientX: current.clientX, clientY: current.clientY, pageX: current.pageX, pageY: current.pageY });
    const mouseDown = getMouseEvent('mousedown', { clientX: current.clientX, clientY: current.clientY, pageX: current.pageX, pageY: current.pageY });

    fireEvent.mouseEnter(element, current);
    // fireEvent.mouseOver(element, current);
    fireEvent(element, mouseOver);
    // fireEvent.mouseMove(element, current);
    fireEvent(element, mouseMove);
    // fireEvent.mouseDown(element, current);
    fireEvent(element, mouseDown);

    for (let i = 0; i < steps; i++) {
        current.clientX += step.x;
        current.clientY += step.y;
        current.pageX += step.x;
        current.pageY += step.y;
        mouseMove = getMouseEvent('mousemove', { clientX: current.clientX, clientY: current.clientY, pageX: current.pageX, pageY: current.pageY });
        fireEvent(element, mouseMove);
    }
    const mouseUp = getMouseEvent('mouseup', { clientX: current.clientX, clientY: current.clientY, pageX: current.pageX, pageY: current.pageY });
    fireEvent(element, mouseUp);
}

export const renderBoardWithProviders = ({ rerender, userId = '111', userRole = 'a', localstore, handle = () => { } }) => {
    let renderFunction = render;
    if (rerender !== undefined) {
        renderFunction = rerender;
    }
    return (renderFunction(
        <ErrorBoundary>
        <MemoryRouter initialEntries={[{ pathname: '/my-path', search: '?foo=bar' }]}>
            <Provider store={localstore}>
                <FullScreen handle={handle}>
                    <ThemeProvider theme={appTheme}>
                        <DndProvider options={HTML5toTouch}>
                            <BoardContextManager previewOnly={false} fullScreenHandle={handle} userId={userId} userRole={userRole} view = {1} />
                        </DndProvider>
                    </ThemeProvider>
                </FullScreen>
            </Provider>
        </MemoryRouter>
        </ErrorBoundary>
    ));
};

export const renderToDoListWithProviders = ({ rerender, docName = 'testTodo', boardId = 998, localstore, contextManager }) => {
    let renderFunction = render;
    if (rerender !== undefined) {
        renderFunction = rerender;
    }
    return (renderFunction(
        <ErrorBoundary>
            <Provider store={localstore}>
                <TodoList docName={ docName }
                    boardId={ boardId }
                    contextManager = { contextManager } />
            </Provider>
        </ErrorBoundary>
    ));
};

export function renderSpreadSheetWithProviders ({ rerender, localstore, contextManager, docNameValue = 'testSpreadsheet', boardIdValue = 998, loadSkip = false  }) {
    const settingsObject = {loadSkip: loadSkip};
    let renderFunction = render;
    if (rerender !== undefined) {
        renderFunction = rerender;
    }
    return renderFunction(
        <ErrorBoundary>
        <Provider store={localstore}>
            <SpreadSheet docName={docNameValue} boardId={boardIdValue} contextManager={contextManager} settingsObject={settingsObject} />
        </Provider>
        </ErrorBoundary>);
};

export function writeIntoCell (screen, jest, expect, cell, text, clear = false) {
    // activating DataEditor in the cell
    userEvent.dblClick(cell);
    const activeEditCell = screen.getByTestId('activeEditCell');
    expect(activeEditCell).toBeInTheDocument();
    if (clear) { userEvent.clear(activeEditCell); }
    userEvent.type(activeEditCell, text);
    expect(activeEditCell.value).toEqual(text);
    userEvent.keyboard('{enter}');
    jest.runOnlyPendingTimers();
};

export function openEditView ({ jest, screen, rerender, localstore, expect, componentTestId }) {
    switch (componentTestId) {
    case 'Bild':
        expect(screen.queryByRole('dialog')).toBeNull();
        break;
    default:
        break;
    }
    const component = screen.getByTestId(componentTestId);
    fireEvent.contextMenu(component);
    jest.runOnlyPendingTimers();
    userEvent.click(screen.getByTestId('editComponentButton'));
    jest.runOnlyPendingTimers();
    // renderBoardWithProviders(rerender, '111', 'a', localstore, () => { });
    if (rerender !== null) {
        renderBoardWithProviders({ rerender: rerender, userId: '111', userRole: 'a', localstore: localstore, handle: () => { } });
    }

    switch (componentTestId) {
    case 'Bild':
        expect(screen.getByRole('dialog')).not.toBeNull();
        break;
    default:
        break;
    }
}

export function userEventWithPendingTimers ({ jest, element, event = 'click', options = {}, text = '' }) {
    switch (event) {
    case 'click':
        userEvent.click(element, options);
        jest.runOnlyPendingTimers();
        break;
    case 'dblClick':
        userEvent.dblClick(element, options);
        jest.runOnlyPendingTimers();
        break;
    case 'type':
        userEvent.type(element, options);
        jest.runOnlyPendingTimers();
        break;
    case 'clear':
        userEvent.clear(element, options);
        jest.runOnlyPendingTimers();
        break;
    case 'keyboard':
        userEvent.keyboard(text, options);
        jest.runOnlyPendingTimers();
        break;
    }
    jest.runOnlyPendingTimers();
}
