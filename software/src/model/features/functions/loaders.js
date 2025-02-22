import { loadCheckbox, unloadCheckbox, selectFullContext as selectCheckbox } from '../checkboxes/checkboxesSlice';
import { loadHTML, unloadHTML, selectFullContext as selectHTML } from '../htmls/htmlsSlice';
import { loadImage, unloadImage, selectFullContext as selectImage } from '../images/imagesSlice';
import { loadMarkdown, unloadMarkdown, selectFullContext as selectMarkdown } from '../markdowns/markdownsSlice';
import { loadSpreadSheet, unloadSpreadsheet, selectFullContext as selectSpreadsheet } from '../spreadsheets/spreadsheetsSlice';
import { loadTodoList, unloadTodoList, selectFullContext as selectTodoList } from '../todolists/todolistsSlice';
import { loadDiagram, unloadDiagram, selectFullContext as selectDiagram } from '../diagrams/diagramsSlice';

export const COMPONENT_TYPES = {
    TODO_LIST: 'todolist',
    SPREADSHEET: 'spreadsheet',

    MARKDOWN: 'markdown',
    IMAGE: 'image',
    HTML: 'htmlcomp',
    CHECKBOX: 'checkbox',
    DIAGRAM: 'diagram',
    PROGRESS_TRACKER: 'progresstracker'
};

const LOAD_REDUCERS = {
    todolist: loadTodoList,
    spreadsheet: loadSpreadSheet,
    markdown: loadMarkdown,
    image: loadImage,
    htmlcomp: loadHTML,
    checkbox: loadCheckbox,
    diagram: loadDiagram,
    progresstracker: loadTodoList
};

const UNLOAD_REDUCERS = {
    todolist: unloadTodoList,
    spreadsheet: unloadSpreadsheet,

    markdown: unloadMarkdown,
    image: unloadImage,
    htmlcomp: unloadHTML,
    checkbox: unloadCheckbox,
    diagram: unloadDiagram,
    progresstracker: unloadTodoList
};

const CONTEXT_SELECTORS = {
    todolist: selectTodoList,
    spreadsheet: selectSpreadsheet,
    markdown: selectMarkdown,
    image: selectImage,
    htmlcomp: selectHTML,
    checkbox: selectCheckbox,
    diagram: selectDiagram,
    progresstracker: selectTodoList
};

export function getLoadReducerForSlice (type) {
    return LOAD_REDUCERS[type];
}

export function getUnloadReducerForSlice (type) {
    return UNLOAD_REDUCERS[type];
}

export function getContextSelectorForSlice (type) {
    return CONTEXT_SELECTORS[type];
}
