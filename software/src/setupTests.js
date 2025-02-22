// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
import { TextDecoder, TextEncoder } from 'util';

global.console = {
    ...global.console,
    warn: jest.fn(),
    error: jest.fn(),
    log: console.log // Allow logging of all console.log statements
};

const nodeCrypto = require('crypto');
window.crypto = {
    getRandomValues: function (buffer) {
        return nodeCrypto.randomFillSync(buffer);
    }
};

Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
    get () { return this.parentNode; }
});

window.TextEncoder = TextEncoder;
window.TextDecoder = TextDecoder;
