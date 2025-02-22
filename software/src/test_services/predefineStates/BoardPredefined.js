
import { addComponent, loadBoard, removeComponent, addLabel, removeLabel, updateSize, moveComponent, addConnection, removeConnection, removeAllConnections } from '../../model/features/boards/boardsSlice';
import { DEFAULT_COMPONENT_SIZE } from '../../model/features/EntityProxies/BoardProxy';
import { loadTodoListDispatcher, addItemDispatcher, setCheckedDispatcher } from './ToDoListPredefined';
import { loadSpreadSheetDispatcher, editCellDispatcher, addRowDispatcher, addColumnDispatcher, editHeaderDispatcher, addCellHighlightFormatRuleDispatcher } from './SpreadSheetPredefined';
import { loadMarkdownDispatcher } from './MarkdownPredefined';
// import { loadDiagramDispatcher } from './DiagramPredefined'; to be done
import { loadHTMLDispatcher } from './HTMLPredefined';
import { loadImageDispatcher, setImageDispatcher } from './ImagePredefined';

export function addComponentDispatcher ({ jest, localstore, boardId = 'skript-b1', componentType, innerId = 'innerId', position = { x: 0, y: 0 }, componentInfo = { componentId: 'comp', size: DEFAULT_COMPONENT_SIZE }, createdBy = 'createdBy', createdOn = 'createdOn', labelId = 'Title', loadTestSkip = false }) {
    localstore.dispatch(addComponent({ id: boardId, type: componentType, innerId, position, componentInfo, createdBy, createdOn, componentName: labelId, loadSkip: loadTestSkip }));
    jest.runOnlyPendingTimers();
    // ensures that the load Dispatcher is called fast enough for the tests. If loadTestSkip false the loadComponent could be calles to late
    if (loadTestSkip) {
        switch (componentType) {
        case 'todolist':
            loadTodoListDispatcher({ jest: jest, localstore: localstore, docId: innerId, boardId: boardId });
            break;
        case 'spreadsheet':
            loadSpreadSheetDispatcher({ jest: jest, localstore: localstore, docId: innerId, boardId: boardId });
            break;
        case 'image':
            loadImageDispatcher({ jest: jest, localstore: localstore, docId: innerId, boardId: boardId });
            break;
        case 'checkbox':
            // loadCheckboxDispatcher(jest, localstore, innerId, boardId);
            break;
        case 'markdown':
            loadMarkdownDispatcher({ jest: jest, localstore: localstore, docId: innerId, boardId: boardId });
            break;
        case 'html':
            loadHTMLDispatcher({ jest: jest, localstore: localstore, docId: innerId, boardId: boardId });
            break;
        case 'diagram':
            // loadDiagramDispatcher(jest, localstore, innerId, boardId);
            break;
        default:
            break;
        }
    }
}
export function loadBoardDispatcher ({ jest, localstore, boardId = 'boardId1' }) {
    localstore.dispatch(loadBoard(boardId));
    jest.runOnlyPendingTimers();
}
export function removeComponentDispatcher ({ jest, localstore, boardId = 'boardId1', componentId = 'comp1' }) {
    localstore.dispatch(removeComponent(boardId, componentId));
    jest.runOnlyPendingTimers();
};
export function addLabelDispatcher ({ jest, localstore, boardId = 'boardId1', labelId = 'label1', description = '', componentId = 'comp1', flag = false, count = 0 }) {
    localstore.dispatch(addLabel(boardId, labelId, description, flag, count, componentId));
    jest.runOnlyPendingTimers();
}
export function removeLabelDispatcher ({ jest, localstore, boardId = 'boardId1', labelId = 'label1', componentId = 'comp1' }) {
    localstore.dispatch(removeLabel(boardId, labelId, componentId));
    jest.runOnlyPendingTimers();
}
export function updateSizeDispatcher ({ jest, localstore, boardId = 'boardId1', componentId = 'comp1', newSize = { width: 100, height: 100 } }) {
    localstore.dispatch(updateSize(boardId, componentId, newSize));
    jest.runOnlyPendingTimers();
}
export function moveComponentDispatcher ({ jest, localstore, boardId = 'boardId1', componentId = 'comp1', newPosition = { x: 100, y: 100 }, sync = true }) {
    localstore.dispatch(moveComponent(boardId, componentId, newPosition, sync));
    jest.runOnlyPendingTimers();
}
export function addConnectionDispatcher ({ jest, localstore, boardId, fromId, toId }) {
    localstore.dispatch(addConnection(boardId, fromId, toId));
    jest.runOnlyPendingTimers();
}
export function removeConnectionDispatcher ({ jest, localstore, boardId, fromId, toId }) {
    localstore.dispatch(removeConnection(boardId, fromId, toId));
    jest.runOnlyPendingTimers();
}
export function removeAllConnectionsDispatcher ({ jest, localstore, boardId, componentId }) {
    localstore.dispatch(removeAllConnections(boardId, componentId));
    jest.runOnlyPendingTimers();
}
export function predefinedRTB (jest, localstore) {
    addComponentDispatcher({ jest: jest, localstore: localstore, boardId: 'skript-b1', componentType: 'spreadsheet', innerId: 'testSpreadsheet', position: { x: 0, y: 0 }, componentInfo: { componentId: 'spreadsheet-Comp', size: DEFAULT_COMPONENT_SIZE }, loadTestSkip: true });
    // addComponentDispatcher(jest, localstore, 'skript-b1', 'spreadsheet', 'TestDoc', { x: 0, y: 0 }, { componentId: 'spreadsheet-Comp', size: DEFAULT_COMPONENT_SIZE });
}
export function predefinedBT2u3 (jest, localstore) {
    addComponentDispatcher({ jest: jest, localstore: localstore, boardId: 'skript-b1', componentType: 'todolist', innerId: 'testTodo', position: { x: 0, y: 100 }, componentInfo: { componentId: 'toDo1', size: DEFAULT_COMPONENT_SIZE }, loadTestSkip: true });
    addComponentDispatcher({ jest: jest, localstore: localstore, boardId: 'skript-b1', componentType: 'spreadsheet', innerId: 'testSpreadsheet', position: { x: 300, y: 100 }, componentInfo: { componentId: 'spreadsheet1', size: DEFAULT_COMPONENT_SIZE }, loadTestSkip: true });
    addComponentDispatcher({ jest: jest, localstore: localstore, boardId: 'skript-b1', componentType: 'image', innerId: 'testImage', position: { x: 600, y: 100 }, componentInfo: { componentId: 'image1', size: DEFAULT_COMPONENT_SIZE }, loadTestSkip: true });
    addComponentDispatcher({ jest: jest, localstore: localstore, boardId: 'skript-b1', componentType: 'markdown', innerId: 'testMarkdown', position: { x: 0, y: 300 }, componentInfo: { componentId: 'markdown1', size: DEFAULT_COMPONENT_SIZE }, loadTestSkip: true });
    addComponentDispatcher({ jest: jest, localstore: localstore, boardId: 'skript-b1', componentType: 'diagram', innerId: 'testDiagram', position: { x: 600, y: 300 }, componentInfo: { componentId: 'diagram1', size: DEFAULT_COMPONENT_SIZE }, loadTestSkip: true });
}

export function predefinedBT4a (jest, localstore) {
    addComponentDispatcher({ jest: jest, localstore: localstore, boardId: 'skript-b1', componentType: 'todolist', innerId: 'testTodo', position: { x: 0, y: 100 }, componentInfo: { componentId: 'toDo1', size: DEFAULT_COMPONENT_SIZE }, loadTestSkip: true });
    addItemDispatcher({ jest: jest, localstore: localstore, docId: 'testTodo', afterIdx: -1, text: 'ToDo' });
    setCheckedDispatcher({ jest: jest, localstore: localstore, docId: 'testTodo', atIndex: 0, checked: true });
}

export function predfindedBT4b (jest, localstore) {
}

export function predefinedBT4c (jest, localstore) {
    addComponentDispatcher({ jest: jest, localstore: localstore, boardId: 'skript-b1', componentType: 'image', innerId: 'testImage', position: { x: 0, y: 100 }, componentInfo: { componentId: 'image1', size: DEFAULT_COMPONENT_SIZE }, loadTestSkip: true });
    setImageDispatcher({ jest: jest, localstore: localstore, docId: 'testImage', URL: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/RPTU_Logo.svg', discription: 'TestDiscription', rotation: 90 });
}

export function predefinedBT4d (jest, localstore) {
    addComponentDispatcher({ jest: jest, localstore: localstore, boardId: 'skript-b1', componentType: 'spreadsheet', innerId: 'testSpreadsheet', position: { x: 0, y: 100 }, componentInfo: { componentId: 'spreadsheet1', size: DEFAULT_COMPONENT_SIZE }, loadTestSkip: true });
    addColumnDispatcher({ jest, localstore });
    addColumnDispatcher({ jest, localstore });
    // addColumnDispatcher(jest, localstore, 'testSpreadsheet');
    // addColumnDispatcher(jest, localstore, 'testSpreadsheet');
    addRowDispatcher({ jest, localstore });
    addRowDispatcher({ jest, localstore });
    // addRowDispatcher(jest, localstore, 'testSpreadsheet');
    // addRowDispatcher(jest, localstore, 'testSpreadsheet');
    editCellDispatcher({ jest, localstore, row: 0, column: 0, value: '1' });
    // editCellDispatcher(jest, localstore, 'testSpreadsheet', 0, 0, '1', 'text', '#ffffff');
    editCellDispatcher({ jest, localstore, row: 0, column: 1, value: 'coloring' });
    // editCellDispatcher(jest, localstore, 'testSpreadsheet', 0, 1, 'coloring', 'text', '#ffffff');
    editCellDispatcher({ jest, localstore, row: 0, column: 2, value: 'coloring' });
    // editCellDispatcher(jest, localstore, 'testSpreadsheet', 0, 2, 'coloring', 'text', '#ffffff');
    editCellDispatcher({ jest, localstore, row: 1, column: 0, value: '4.5' });
    // editCellDispatcher(jest, localstore, 'testSpreadsheet', 1, 0, '4.5', 'text', '#ffffff');
    editCellDispatcher({ jest, localstore, row: 1, column: 1, value: '!farbig' });
    // editCellDispatcher(jest, localstore, 'testSpreadsheet', 1, 1, '!farbig', 'text', '#ffffff');
    editCellDispatcher({ jest, localstore, row: 1, column: 2, value: '=sum(A1)' });
    // editCellDispatcher(jest, localstore, 'testSpreadsheet', 1, 2, '=sum(A1)', 'text', '#ffffff');
    editCellDispatcher({ jest, localstore, row: 2, column: 0, value: '8' });
    // editCellDispatcher(jest, localstore, 'testSpreadsheet', 2, 0, '8', 'text', '#ffffff');
    editCellDispatcher({ jest, localstore, row: 2, column: 1, value: '4' });
    // editCellDispatcher(jest, localstore, 'testSpreadsheet', 2, 1, '4', 'text', '#ffffff');
    editCellDispatcher({ jest, localstore, row: 2, column: 2, value: '=(POWER(2,5))' });
    editHeaderDispatcher({ jest, localstore, column: 0, value: 'Header 1' });
    editHeaderDispatcher({ jest, localstore, column: 1, value: 'Header 2' });
    editHeaderDispatcher({ jest, localstore, column: 2, value: 'Header 3' });
    // editCellDispatcher(jest, localstore, 'testSpreadsheet', 2, 2, '=(POWER(2,5))', 'text', '#ffffff');
    addCellHighlightFormatRuleDispatcher({ jest, localstore, cellMatchType: 'Cell Value', cellRangeSelectionType: 'Selected Range', color: '#00ff00', selectedRange: { 0: { 0: true }, 1: { 0: true }, 2: { 0: true } }, matchCellValueRange: ['1', '7'], matchCellText: '' });
    // addCellHighlightFormatRuleDispatcher(jest, localstore, 'testSpreadsheet', 'Cell Value', 'Selected Range', '#00ff00', { 0: { 0: true }, 1: { 0: true }, 2: { 0: true } }, { matchCellValueRange: ['1', '7'], matchCellText: '' });
    addCellHighlightFormatRuleDispatcher({ jest, localstore, cellMatchType: 'Specific Text', cellRangeSelectionType: 'Entire Spreadsheet', color: '#ff0000', selectedRange: {}, matchCellValueRange: [], matchCellText: 'coloring' });
    // addCellHighlightFormatRuleDispatcher(jest, localstore, 'testSpreadsheet', 'Specific Text', 'Entire Spreadsheet', '#ff0000', {}, {}, 'coloring');
}
export function predefinedBT5u6u7u8u12 (jest, localstore) {
    addComponentDispatcher({ jest: jest, localstore: localstore, boardId: 'skript-b1', componentType: 'markdown', innerId: 'testMarkdown', position: { x: 0, y: 100 }, componentInfo: { componentId: 'Markdown1', size: DEFAULT_COMPONENT_SIZE }, loadTestSkip: true });
    addComponentDispatcher({ jest: jest, localstore: localstore, boardId: 'skript-b1', componentType: 'spreadsheet', innerId: 'testSpreadsheet', position: { x: 0, y: 300 }, componentInfo: { componentId: 'Spreadsheet1', size: DEFAULT_COMPONENT_SIZE }, loadTestSkip: true });
}
export function predefinedBT8 (jest, localstore) {
}
export const CopyCheckboxPrelodestate = {
    boards: {
        ids: ['skript-b1'],
        entities: {
            'skript-b1': {
                id: 'skript-b1',
                data: {
                    components: { checkbox1Id: { type: 'checkbox', innerId: 'checkbox1', position: { x: 100, y: 300 } } },
                    connections: {},
                    sizes: { checkbox1Id: { width: 200, height: 200 } }
                }
            }
        },
        test: true
    },
    spreadsheets: {
        ids: [],
        entities: {}
    },
    images: {
        ids: [],
        entities: {}
    },
    checkboxes: {
        ids: ['checkbox1'],
        entities: { checkbox1: { id: 'checkbox1', data: { checked: true } } },
        test: true
    },
    todolists: {
        ids: [],
        entities: {}
    },
    markdowns: {
        ids: [],
        entities: {}
    },
    htmls: {
        ids: [],
        entities: {}
    },
    diagrams: {
        ids: [],
        entities: {}
    },
    test: true
};
export const copyImagePrelodestate = {
    boards: {
        ids: [
            'skript-b1'
        ],
        entities: {
            'skript-b1': {
                id: 'skript-b1',
                data: {
                    components: {
                        'Image-Id': {
                            type: 'image',
                            innerId: 'Image-1',
                            position: {
                                x: 1172,
                                y: 456
                            }
                        }
                    },
                    connections: {},
                    sizes: {
                        'Image-Id': {
                            width: 311,
                            height: 129
                        }
                    }
                }
            }
        },
        test: true
    },
    spreadsheets: {
        ids: [],
        entities: {}
    },
    images: {
        ids: [
            'Image-1'
        ],
        entities: {
            'Image-1': {
                id: 'Image-1',
                data: {
                    url: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/RPTU_Logo.svg',
                    description: 'RPTU LOGO',
                    rotation: 90
                }
            }
        },
        test: true
    },
    checkboxes: {
        ids: [],
        entities: {}
    },
    todolists: {
        ids: [],
        entities: {}
    },
    markdowns: {
        ids: [],
        entities: {}
    },
    htmls: {
        ids: [],
        entities: {}
    },
    diagrams: {
        ids: [],
        entities: {}
    },
    test: true
};
export const copyMarkdownPrelodestate = {
    boards: {
        ids: [
            'skript-b1'
        ],
        entities: {
            'skript-b1': {
                id: 'skript-b1',
                data: {
                    components: {
                        'markdown-id': {
                            type: 'markdown',
                            innerId: 'markdown-1',
                            position: {
                                x: 615,
                                y: 361
                            }
                        }
                    },
                    connections: {},
                    sizes: {
                        'markdown-id': {
                            width: 619,
                            height: 79
                        }
                    }
                }
            }
        },
        test: true
    },
    spreadsheets: {
        ids: [],
        entities: {}
    },
    images: {
        ids: [],
        entities: {}
    },
    checkboxes: {
        ids: [],
        entities: {}
    },
    todolists: {
        ids: [],
        entities: {}
    },
    markdowns: {
        ids: [
            'markdown-1'
        ],
        entities: {
            'markdown-1': {
                id: 'markdown-1',
                data: {
                    textObject: [
                        {
                            children: [
                                {
                                    type: 'h1',
                                    children: [
                                        {
                                            text: 'Hallo. Ich bin ein MarkdownEditor.'
                                        }
                                    ]
                                },
                                {
                                    type: 'p',
                                    children: [
                                        {
                                            text: ''
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            }
        },
        test: true
    },
    htmls: {
        ids: [],
        entities: {}
    },
    diagrams: {
        ids: [],
        entities: {}
    },
    test: true
};
export const copySpreadsheetPrelodestate = {
    boards: {
        ids: [
            'skript-b1'
        ],
        entities: {
            'skript-b1': {
                id: 'skript-b1',
                data: {
                    components: {
                        'Spreadsheet-Test1': {
                            type: 'spreadsheet',
                            innerId: '87097182-4e2d-4d86-a7e5-1ff517f2018b',
                            position: {
                                x: 748,
                                y: 287
                            }
                        }
                    },
                    connections: {},
                    sizes: {
                        'Spreadsheet-Test1': {
                            width: 200,
                            height: 200
                        }
                    }
                }
            }
        },
        test: true
    },
    spreadsheets: {
        ids: [
            '87097182-4e2d-4d86-a7e5-1ff517f2018b'
        ],
        entities: {
            '87097182-4e2d-4d86-a7e5-1ff517f2018b': {
                id: '87097182-4e2d-4d86-a7e5-1ff517f2018b',
                headers: [
                    'Header 1',
                    'Header 2',
                    'Header 3'
                ],
                data: [
                    [
                        {
                            value: '1',
                            type: 'text',
                            timestamp: 1681663313865,
                            color: '#ffffff'
                        },
                        {
                            value: 'coloring',
                            type: 'text',
                            timestamp: 1681663325812,
                            color: '#ffffff'
                        },
                        {
                            value: 'coloring',
                            type: 'text',
                            timestamp: 1681663365014,
                            color: '#0000ff'
                        }
                    ],
                    [
                        {
                            value: '4.5',
                            type: 'text',
                            timestamp: 1681663316236,
                            color: '#ffffff'
                        },
                        {
                            value: '!farbig',
                            type: 'text',
                            timestamp: 1681663328684,
                            color: '#ffffff'
                        },
                        {
                            value: '=sum(A1)',
                            type: 'text',
                            timestamp: 1681663337052,
                            color: '#ffffff'
                        }
                    ],
                    [
                        {
                            value: '8',
                            type: 'text',
                            timestamp: 1681663321116,
                            color: '#ffffff'
                        },
                        {
                            value: '4',
                            type: 'text',
                            timestamp: 1681663384013,
                            color: '#ffffff'
                        },
                        {
                            value: '=(POWER(2,5))',
                            type: 'text',
                            timestamp: 1681663341779,
                            color: '#ffffff'
                        }
                    ]
                ],
                meta: {
                    rows: 3,
                    columns: 3
                },
                cellhighlightformatrules: {
                    '2a629270-ccc6-4537-a56e-8118296256ad': {
                        cellMatchType: 'Specific Text',
                        cellRangeSelectionType: 'Entire Spreadsheet',
                        color: '#ff0000',
                        selectedRange: {
                            0: {
                                2: true
                            }
                        },
                        matchCellValueRange: [
                            null,
                            null
                        ],
                        matchCellText: 'coloring'
                    },
                    '1b57191a-c69c-4f05-a6ae-01268bc0491c': {
                        cellMatchType: 'Cell Value',
                        cellRangeSelectionType: 'Selected Range',
                        color: '#00ff00',
                        selectedRange: {
                            0: {
                                0: true
                            },
                            1: {
                                0: true
                            },
                            2: {
                                0: true
                            }
                        },
                        matchCellValueRange: [
                            '1',
                            '7'
                        ],
                        matchCellText: ''
                    }
                },
                fullWidthColumns: {}
            }
        },
        test: true
    },
    images: {
        ids: [],
        entities: {}
    },
    checkboxes: {
        ids: [],
        entities: {}
    },
    todolists: {
        ids: [],
        entities: {}
    },
    markdowns: {
        ids: [],
        entities: {}
    },
    htmls: {
        ids: [],
        entities: {}
    },
    diagrams: {
        ids: [],
        entities: {}
    },
    test: true
};
export const copyDiagramPrelodestate = {
    boards: {
        ids: [
            'skript-b1'
        ],
        entities: {
            'skript-b1': {
                id: 'skript-b1',
                data: {
                    components: {
                        'a0d0cd46-56d6-4c2b-a88b-5bc3cc63c78d': {
                            type: 'spreadsheet',
                            innerId: '24aa7333-abe8-4e33-bacc-cc0eb04fb286',
                            position: {
                                x: 437,
                                y: 240
                            }
                        },
                        'c9263562-7c7c-4be3-ac18-19a365faffdf': {
                            type: 'diagram',
                            innerId: '905f489f-0719-4eb9-a53e-3d994ae73296',
                            position: {
                                x: 1133,
                                y: 388
                            }
                        }
                    },
                    connections: {},
                    sizes: {
                        'a0d0cd46-56d6-4c2b-a88b-5bc3cc63c78d': {
                            width: 200,
                            height: 200
                        },
                        'c9263562-7c7c-4be3-ac18-19a365faffdf': {
                            width: 450,
                            height: 450
                        }
                    }
                }
            }
        },
        test: true
    },
    spreadsheets: {
        ids: [
            '24aa7333-abe8-4e33-bacc-cc0eb04fb286'
        ],
        entities: {
            '24aa7333-abe8-4e33-bacc-cc0eb04fb286': {
                id: '24aa7333-abe8-4e33-bacc-cc0eb04fb286',
                headers: [
                    'header B'
                ],
                data: [
                    [
                        {
                            value: '1',
                            type: 'text',
                            timestamp: 1681717825768,
                            color: '#ffffff'
                        },
                        {
                            value: '6.7',
                            type: 'text',
                            timestamp: 1681717828548,
                            color: '#ffffff'
                        }
                    ],
                    [
                        {
                            value: '4.8',
                            type: 'text',
                            timestamp: 1681717831488,
                            color: '#ffffff'
                        },
                        {
                            value: '9',
                            type: 'text',
                            timestamp: 1681717834557,
                            color: '#ffffff'
                        }
                    ]
                ],
                meta: {
                    rows: 2,
                    columns: 2
                },
                cellhighlightformatrules: {},
                fullWidthColumns: {}
            }
        },
        test: true
    },
    images: {
        ids: [],
        entities: {}
    },
    checkboxes: {
        ids: [],
        entities: {}
    },
    todolists: {
        ids: [],
        entities: {}
    },
    markdowns: {
        ids: [],
        entities: {}
    },
    htmls: {
        ids: [],
        entities: {}
    },
    diagrams: {
        ids: [
            '905f489f-0719-4eb9-a53e-3d994ae73296'
        ],
        entities: {
            '905f489f-0719-4eb9-a53e-3d994ae73296': {
                id: '905f489f-0719-4eb9-a53e-3d994ae73296',
                data: {
                    type: 'linechart',
                    ssid: '24aa7333-abe8-4e33-bacc-cc0eb04fb286',
                    settings: '{"rows":[0,1],"cols":[0,1],"categoryColumn":-1,"xLabel":"x-Achse","yLabel":"y-Achse","yMin":6.7,"yMax":9}'
                }
            }
        },
        test: true
    },
    test: true
};
export const labelsTestPreloadState = {
    boards: {
        ids: [
            'skript-b1'
        ],
        entities: {
            'skript-b1': {
                id: 'skript-b1',
                data: {
                    components: {
                        Spreadsheet1: {
                            type: 'spreadsheet',
                            innerId: '6a364f77-9421-4356-b6f3-83a39ae7aaad',
                            position: {
                                x: 500,
                                y: 250
                            }
                        },
                        Spreadsheet2: {
                            type: 'spreadsheet',
                            innerId: '835d400d-bd36-40b7-aac1-126ef3db2815',
                            position: {
                                x: 900,
                                y: 370
                            }
                        }
                    },
                    connections: {},
                    sizes: {
                        Spreadsheet1: {
                            width: 200,
                            height: 200
                        },
                        Spreadsheet2: {
                            width: 200,
                            height: 200
                        }
                    }
                }
            }
        },
        test: true
    },
    spreadsheets: {
        ids: [
            '6a364f77-9421-4356-b6f3-83a39ae7aaad',
            '835d400d-bd36-40b7-aac1-126ef3db2815'
        ],
        entities: {
            '6a364f77-9421-4356-b6f3-83a39ae7aaad': {
                id: '6a364f77-9421-4356-b6f3-83a39ae7aaad',
                headers: [],
                data: [
                    [
                        {
                            value: '',
                            type: 'text',
                            timestamp: 1682090385970,
                            color: '#ffffff'
                        }
                    ]
                ],
                meta: {
                    rows: 1,
                    columns: 1
                },
                cellhighlightformatrules: {},
                fullWidthColumns: {}
            },
            '835d400d-bd36-40b7-aac1-126ef3db2815': {
                id: '835d400d-bd36-40b7-aac1-126ef3db2815',
                headers: [],
                data: [
                    [
                        {
                            value: '',
                            type: 'text',
                            timestamp: 1682090388457,
                            color: '#ffffff'
                        }
                    ]
                ],
                meta: {
                    rows: 1,
                    columns: 1
                },
                cellhighlightformatrules: {},
                fullWidthColumns: {}
            }
        },
        test: true
    },
    images: {
        ids: [],
        entities: {}
    },
    checkboxes: {
        ids: [],
        entities: {}
    },
    todolists: {
        ids: [],
        entities: {}
    },
    markdowns: {
        ids: [],
        entities: {}
    },
    htmls: {
        ids: [],
        entities: {}
    },
    diagrams: {
        ids: [],
        entities: {}
    },
    test: true
};
export const connectionsTestPreloadState = {
    boards: {
        ids: [
            'skript-b1'
        ],
        entities: {
            'skript-b1': {
                id: 'skript-b1',
                data: {
                    components: {
                        'Markdown-1': {
                            type: 'markdown',
                            innerId: '4788aedf-4b37-4cc5-bea8-0ec77981928e',
                            position: {
                                x: 500,
                                y: 250
                            }
                        },
                        'Markdown-2': {
                            type: 'markdown',
                            innerId: 'd6ecd4b7-ed7c-42ee-bee9-05663eccb326',
                            position: {
                                x: 900,
                                y: 360
                            }
                        }
                    },
                    connections: {},
                    sizes: {
                        'Markdown-1': {
                            width: 200,
                            height: 200
                        },
                        'Markdown-2': {
                            width: 200,
                            height: 200
                        }
                    }
                }
            }
        },
        test: true
    },
    spreadsheets: {
        ids: [],
        entities: {}
    },
    images: {
        ids: [],
        entities: {}
    },
    checkboxes: {
        ids: [],
        entities: {}
    },
    todolists: {
        ids: [],
        entities: {}
    },
    markdowns: {
        ids: [
            '4788aedf-4b37-4cc5-bea8-0ec77981928e',
            'd6ecd4b7-ed7c-42ee-bee9-05663eccb326'
        ],
        entities: {
            '4788aedf-4b37-4cc5-bea8-0ec77981928e': {
                id: '4788aedf-4b37-4cc5-bea8-0ec77981928e',
                data: {
                    textObject: [
                        {
                            children: [
                                {
                                    type: 'p',
                                    children: [
                                        {
                                            text: ''
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            },
            'd6ecd4b7-ed7c-42ee-bee9-05663eccb326': {
                id: 'd6ecd4b7-ed7c-42ee-bee9-05663eccb326',
                data: {
                    textObject: [
                        {
                            children: [
                                {
                                    type: 'p',
                                    children: [
                                        {
                                            text: ''
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            }
        },
        test: true
    },
    htmls: {
        ids: [],
        entities: {}
    },
    diagrams: {
        ids: [],
        entities: {}
    }
};
export const removeComponentTestPreloadState = {
    boards: {
        ids: [
            'skript-b1'
        ],
        entities: {
            'skript-b1': {
                id: 'skript-b1',
                data: {
                    components: {
                        '6814d0e5-2736-477d-a305-76ec588dc360': {
                            type: 'markdown',
                            innerId: 'f3a4376f-0b8d-44ff-b25b-ec2b679ef72d',
                            position: {
                                x: 164,
                                y: 199
                            }
                        },
                        '0ae178fb-dd93-4864-96a9-e5394bb7f375': {
                            type: 'markdown',
                            innerId: '9a4c8a30-eb83-4ee0-a5c0-11e24c39ecd0',
                            position: {
                                x: 193,
                                y: 542
                            }
                        },
                        'da8427c0-d77f-49ba-a8fb-9f4a35ee4204': {
                            type: 'spreadsheet',
                            innerId: '570f4d72-0159-4409-9249-0078b967cafa',
                            position: {
                                x: 513,
                                y: 223
                            }
                        },
                        '60fd287a-69d5-49a9-8169-b26907afcd49': {
                            type: 'spreadsheet',
                            innerId: '555cedce-3f3c-41dc-a197-34c95878fc63',
                            position: {
                                x: 539,
                                y: 539
                            }
                        },
                        '6697c04a-5c7d-4514-9c13-2eea1dc85ef2': {
                            type: 'image',
                            innerId: '2d96a384-32b7-484c-8aee-db1742ce55ce',
                            position: {
                                x: 1120,
                                y: 239
                            }
                        },
                        'd1ea3661-4feb-48f5-a280-fe8cae6be19a': {
                            type: 'image',
                            innerId: 'a76ffec2-7d9c-4c8d-a7b5-c197db683080',
                            position: {
                                x: 1172,
                                y: 562
                            }
                        },
                        '52439990-5bbd-45c0-887f-eae03c8e496b': {
                            type: 'todolist',
                            innerId: 'e6b3ffe6-36c3-42d6-a9e3-26a745914cb7',
                            position: {
                                x: 550.2142857142857,
                                y: 858.6428571428571
                            }
                        },
                        '989707fe-9143-4be6-a17f-f925940d69a8': {
                            type: 'todolist',
                            innerId: '83f2f58b-3a87-419d-9a0e-7719fda57107',
                            position: {
                                x: 885.9285714285713,
                                y: 854.3571428571429
                            }
                        },
                        'c351b343-7950-44ff-ba38-92f6e825e25f': {
                            type: 'diagram',
                            innerId: '69b1a0a2-1a74-4853-b083-ec34f43e4a23',
                            position: {
                                x: 1703.6428571428567,
                                y: 322.07142857142856
                            }
                        },
                        '8b3bb890-4d96-498d-b668-44544095c246': {
                            type: 'diagram',
                            innerId: '9f50a69f-604c-4c16-b8d9-40384ec3d9e4',
                            position: {
                                x: 1769.6428571428567,
                                y: 994.0714285714283
                            }
                        }
                    },
                    connections: {},
                    sizes: {
                        '6814d0e5-2736-477d-a305-76ec588dc360': {
                            width: 200,
                            height: 200
                        },
                        '0ae178fb-dd93-4864-96a9-e5394bb7f375': {
                            width: 200,
                            height: 200
                        },
                        'da8427c0-d77f-49ba-a8fb-9f4a35ee4204': {
                            width: 200,
                            height: 200
                        },
                        '60fd287a-69d5-49a9-8169-b26907afcd49': {
                            width: 200,
                            height: 200
                        },
                        '6697c04a-5c7d-4514-9c13-2eea1dc85ef2': {
                            width: 200,
                            height: 200
                        },
                        'd1ea3661-4feb-48f5-a280-fe8cae6be19a': {
                            width: 200,
                            height: 200
                        },
                        '52439990-5bbd-45c0-887f-eae03c8e496b': {
                            width: 200,
                            height: 200
                        },
                        '989707fe-9143-4be6-a17f-f925940d69a8': {
                            width: 200,
                            height: 200
                        },
                        'c351b343-7950-44ff-ba38-92f6e825e25f': {
                            width: 450,
                            height: 450
                        },
                        '8b3bb890-4d96-498d-b668-44544095c246': {
                            width: 450,
                            height: 450
                        }
                    }
                }
            }
        },
        test: true
    },
    spreadsheets: {
        ids: [
            '570f4d72-0159-4409-9249-0078b967cafa',
            '555cedce-3f3c-41dc-a197-34c95878fc63'
        ],
        entities: {
            '570f4d72-0159-4409-9249-0078b967cafa': {
                id: '570f4d72-0159-4409-9249-0078b967cafa',
                headers: [
                    'header B'
                ],
                data: [
                    [
                        {
                            value: '5',
                            type: 'text',
                            timestamp: 1682251870235,
                            color: '#ffffff'
                        },
                        {
                            value: '6',
                            type: 'text',
                            timestamp: 1682251870797,
                            color: '#ffffff'
                        }
                    ],
                    [
                        {
                            value: '7',
                            type: 'text',
                            timestamp: 1682251871373,
                            color: '#ffffff'
                        },
                        {
                            value: '8',
                            type: 'text',
                            timestamp: 1682251875012,
                            color: '#ffffff'
                        }
                    ]
                ],
                meta: {
                    rows: 2,
                    columns: 2
                },
                cellhighlightformatrules: {},
                fullWidthColumns: {}
            },
            '555cedce-3f3c-41dc-a197-34c95878fc63': {
                id: '555cedce-3f3c-41dc-a197-34c95878fc63',
                headers: [
                    'header A',
                    'header B'
                ],
                data: [
                    [
                        {
                            value: '1',
                            type: 'text',
                            timestamp: 1682251865869,
                            color: '#ffffff'
                        },
                        {
                            value: '2',
                            type: 'text',
                            timestamp: 1682251866493,
                            color: '#ffffff'
                        }
                    ],
                    [
                        {
                            value: '3',
                            type: 'text',
                            timestamp: 1682251867205,
                            color: '#ffffff'
                        },
                        {
                            value: '4',
                            type: 'text',
                            timestamp: 1682251877475,
                            color: '#ffffff'
                        }
                    ]
                ],
                meta: {
                    rows: 2,
                    columns: 2
                },
                cellhighlightformatrules: {},
                fullWidthColumns: {}
            }
        },
        test: true
    },
    images: {
        ids: [
            '2d96a384-32b7-484c-8aee-db1742ce55ce',
            'a76ffec2-7d9c-4c8d-a7b5-c197db683080'
        ],
        entities: {
            '2d96a384-32b7-484c-8aee-db1742ce55ce': {
                id: '2d96a384-32b7-484c-8aee-db1742ce55ce',
                data: {
                    url: 'https://cdn.pixabay.com/photo/2017/03/12/04/59/one-2136425_1280.png',
                    description: 'Eins',
                    rotation: 0
                }
            },
            'a76ffec2-7d9c-4c8d-a7b5-c197db683080': {
                id: 'a76ffec2-7d9c-4c8d-a7b5-c197db683080',
                data: {
                    url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAmVBMVEX////rACnrACfqAADqABXrACbqAAv96+zrACT1parqABzrACDqABnqABHqAA7qABj++vr4yc399PX2uL3xanfyg4z2o6v85ef0k5zxeYPsK0D5ztH72t34vsT0jZbvWGb2rbL74OHuQVP61truOU3tJj7sHTfsJj/ycX33tLvwZXLzgIvwXGv1qq/vU2HvTFv1m6PvRVfuOlBAo8etAAAHf0lEQVR4nO2de3viKBSHDSQYwSQarfe7aapttbrf/8NtbKedbbdaOBwCs8v718zzzJPJT+Bc4BzSaHg8Ho/H4/F4PB6Px+PxeDz/ETrraW+wuOsvN5P7sgwCciEIyvKh2Cx3d6PDfNq0/Y5A8tl+9LiJKWVJmHEh4jiOooi8Uf2p+rsQPAtZ9S/ul0+HaW77jRXoTAe7MqRpW8TVcP0MiQUPWVL2BzPbry5Bp7s4pzTkkZS2TzojEVLxfBjalnCL5uHIWFtu4K7IrFTej9a2hXxPPtjQRGioeyfO6KTl3qqcH2kY66t7FxnS/ta2pH+SjwIm0OS9Iei5a1vXO8MxzSJkfW8aCyc0NnesjbD4viWmL9aNTmdBuSl9FwR9siuwF4cm9V0IA4tTtflCTay/L8R0bEvgCt1+XiGc2AnO+9T0BP1AJBZm6rBs16WvgtBB3QKnGV4AIwVd1CtwX4eJ+SKxVntzqG8J/obVKLFlQ2AlsTbn37MjsJqoo3oEdm0JrCT26hA4ZNYEVk6jho2cTlmzm/hEFHSMK1xyiwKDgD+bFjigVgVWS3FlVuDQnpX5BaFm96g2NWUTN+CPJgW2mG19FXRqTmCe2p6jF+KJOYXjOhOm65jz+/bNzBvxvSmFfbuu8Dd0bkbg0LYr/CDemFE4dmUIq0E0Ep7mxndG5eFGkuFWovteJL6A8TsRbkLhg0ZOQWKeUho9FEVxzylNuG5+wgzYmhnczkQhK+7m6/e8pzPrPT3QTGssRR9f4R3U28dpcPr30fx6wROdw/AIXyE08W0HqytPPGUaYTxFPyEGTlJCd9efmZ9TsMIMfVPqlEHeI2K3Q8gFeHGLI7bCDWSSEvZTojOCSiQMWWAOMQtEIpMbh0CJ2GFNF5L60pbEkydAC5bscRWOAMuQL2WevAbO0wz5LGqpbthJIndwu4MF9ELq95MnUF+GoeSPDEzKIty9jKb6W5BEdncaMD8uzxeou4oAQyOf4PRgfp+hKjyp23R5a57Dtn8oarWUenqvslsEcxgMtTzjrPwO/E7+6U8ga5qipoilcl1CqvALH0BxDarLz9WL81TOT0ABU5CsEBWqO4uIKDwelpmFMjGhLFvlH1moHGQCvC22wrmyQq5SGJLbV7hS3kgMVcrQHFConlkkKsdDsFmKamnUHZaSs4IlUEo/4k/0lWNjpYAD5i1QPb569K+ksAc6L0CN2tS3oZT++wVosxk18r43q/AIShBTzOxJ/bxISSFoe5+g1n+pl2ComIEpyNDEBaLAhro1VzHlsLNljnn6BIg5VAIOWMtidkJU2KRcsqH3g7Z8ArwHbtNgOot8NF4Wr03ZbRHL9fcK+eIz4KY3xW+jyWfd1qJfBFmlNPtpUKNS9rE9WKmc/H8AUDqc7k+75SSsBjW8OqjSOT7w5JXfOJdEI992B4vHImi/DepnpT+eq/3iBKzwwD6YuUk+7O5Hu2VJKU1fB/XyBpJntE1gtSNhVrrZmtv5YPFclGE1qKlcYdYZeJSP6++VeR3UvkxQNYBW5KJ6Q4NsweWc1OmrJT7oBNDSKFPFidi8gOtp0jotKZwxuBSQZOY7ZxA4wQvlFKJei/TgAomBmBQfnRa/WiI2XeB+4jKEf4CrmCUajdJ/whDOmIZA2Todm2y1brORrdOxyJbqVHlHge33/5GuzhStIlInrh26xVyveQp1E9EIKz2Bcex6vDbSbH9zfo6ONZvDEtcD0mfNxiJhd+/iR/JCswU1wi24RGcYaPaByxTG26Sb6nZzmb5rQBP9K22Y21ZmrC0wcdrVd160uzMz9C4gTNaldgdx+2xbxC3mWrnEm0Cn90cX+vcUOC0wP8J7DN/JXmyruMEs0G/iT5D7f1A5IFzNx1zeeEK4HZNQhx398B7UWftF4Mq2jOv09J1EEIcOZ7w7hMtseOnu7vbwQX+GBuzo7qbMHuGGYVL3nawqYNwwLDJDFwkhsEawoUFSuHs60UKwoS57wc4zhg0V7s7QKdGPQwk9uruntkCYoYJhNjTh0jzrX09L2F/uevkeghMUzOGCNYQwjbDC+gc7rrIN9G+N5InDAzjSNzERfXHXyQ83+hebtkUtd3XD2KfaJiamO3fzCIQohrCJU5+v+kw31o5ieFr75zkUGGvvpsX00V0L09iWuokSSScun3vqh6Fc6j4wW6wnumdmgu7czSIajRPTHMCIFg5b0EZzo5lHkDBwuuB+oOvkOXN4J+31e2t6A+i2h9D/3lqVJLm8ABv5UW8ASRg7vQC1w2yeOr0AG/lScwBTtxdgNYB6YTYJTtv5vLdfHU6jxdN4t+s/Hs/FpAxEShUxsl+lO4AXiRljaZIkYZi1OeeCi8snyS8fJFd8kJEu2T3D+GAzEgYU6ppQZPAVrhJ3vv1wAVth88Xix9a+BVnhILH/macvoCoc6qYRJkBVCG6aNwmqwhb02nSTeIVeoVdoH6/QK/QK7eMVeoVeoX28Qq/QK7SPV+gVeoX28Qq9Qq/QPl6hV+gV2scr9Ao/K0yIeyCPoW0535C6XVrl8Xg8Ho/H4/F4PB6Px+P53/E3v42ZxQIH/+UAAAAASUVORK5CYII=',
                    description: 'Zwei',
                    rotation: 0
                }
            }
        },
        test: true
    },
    checkboxes: {
        ids: [],
        entities: {}
    },
    todolists: {
        ids: [
            'e6b3ffe6-36c3-42d6-a9e3-26a745914cb7',
            '83f2f58b-3a87-419d-9a0e-7719fda57107'
        ],
        entities: {
            'e6b3ffe6-36c3-42d6-a9e3-26a745914cb7': {
                id: 'e6b3ffe6-36c3-42d6-a9e3-26a745914cb7',
                list: [
                    {
                        id: '75d1364c-db35-4164-a419-0b638c6f3b94',
                        checked: true,
                        text: 'Todo1'
                    }
                ]
            },
            '83f2f58b-3a87-419d-9a0e-7719fda57107': {
                id: '83f2f58b-3a87-419d-9a0e-7719fda57107',
                list: [
                    {
                        id: '3b846886-efac-4374-bd6c-0616fc765953',
                        checked: false,
                        text: 'Todo2'
                    }
                ]
            }
        },
        test: true
    },
    markdowns: {
        ids: [
            'f3a4376f-0b8d-44ff-b25b-ec2b679ef72d',
            '9a4c8a30-eb83-4ee0-a5c0-11e24c39ecd0'
        ],
        entities: {
            'f3a4376f-0b8d-44ff-b25b-ec2b679ef72d': {
                id: 'f3a4376f-0b8d-44ff-b25b-ec2b679ef72d',
                data: {
                    textObject: [
                        {
                            children: [
                                {
                                    type: 'h1',
                                    children: [
                                        {
                                            text: 'Text1'
                                        }
                                    ]
                                },
                                {
                                    type: 'p',
                                    children: [
                                        {
                                            text: ''
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            },
            '9a4c8a30-eb83-4ee0-a5c0-11e24c39ecd0': {
                id: '9a4c8a30-eb83-4ee0-a5c0-11e24c39ecd0',
                data: {
                    textObject: [
                        {
                            children: [
                                {
                                    type: 'h1',
                                    children: [
                                        {
                                            text: 'Text2'
                                        }
                                    ]
                                },
                                {
                                    type: 'p',
                                    children: [
                                        {
                                            text: ''
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            }
        },
        test: true
    },
    htmls: {
        ids: [],
        entities: {}
    },
    diagrams: {
        ids: [
            '69b1a0a2-1a74-4853-b083-ec34f43e4a23',
            '9f50a69f-604c-4c16-b8d9-40384ec3d9e4'
        ],
        entities: {
            '69b1a0a2-1a74-4853-b083-ec34f43e4a23': {
                id: '69b1a0a2-1a74-4853-b083-ec34f43e4a23',
                data: {
                    type: 'linechart',
                    ssid: '570f4d72-0159-4409-9249-0078b967cafa',
                    settings: '{"rows":[0,1],"cols":[0,1],"categoryColumn":-1,"xLabel":"x-Achse","yLabel":"y-Achse","yMin":6,"yMax":8}'
                }
            },
            '9f50a69f-604c-4c16-b8d9-40384ec3d9e4': {
                id: '9f50a69f-604c-4c16-b8d9-40384ec3d9e4',
                data: {
                    type: 'groupedbarchart',
                    ssid: '570f4d72-0159-4409-9249-0078b967cafa',
                    settings: '{"rows":[0,1],"cols":[1],"categoryColumn":0,"xLabel":"x-Achse","yLabel":"y-Achse","yMin":0,"yMax":8}'
                }
            }
        },
        test: true
    },
    test: true
};
export const resizingComponentAndScaleTestPreloadState = {
    boards: {
        ids: [
            'skript-b1',
            'notizbuch-b1-a111'
        ],
        entities: {
            'skript-b1': {
                id: 'skript-b1',
                boardObject: {
                    _type: 'Board',
                    _crdt: true,
                    data: {
                        components: {
                            Markdown1: {
                                type: 'markdown',
                                innerId: '6c770d59-de16-4c11-9207-b287a680d170',
                                position: {
                                    x: 200,
                                    y: 300
                                },
                                createdBy: 'a111',
                                createdOn: '29/06/23, 14:34',
                                componentInfo: {
                                    width: 200,
                                    height: 200
                                },
                                componentName: 'Text',
                                label: {
                                    labelId: '73d74d0b-f8b5-4250-9e2d-57be66499b29',
                                    description: 'Text-29/06/23, 14:34'
                                }
                            },
                            Spreadsheet1: {
                                type: 'spreadsheet',
                                innerId: '4e00fd33-132d-4848-a716-1776309a0647',
                                position: {
                                    x: 700,
                                    y: 350
                                },
                                createdBy: 'a111',
                                createdOn: '29/06/23, 14:35',
                                componentInfo: {
                                    width: 200,
                                    height: 200
                                },
                                componentName: 'Tabelle',
                                label: {
                                    labelId: '1983f618-c749-468b-98a3-8f362a88ad98',
                                    description: 'Tabelle-29/06/23, 14:35'
                                }
                            }
                        },
                        connections: {}
                    },
                    crdtObjects: {
                        componentsInfoObject: {
                            Markdown1: '{"type":"markdown","innerId":"6c770d59-de16-4c11-9207-b287a680d170","position":{"x":200,"y":300},"createdBy":"a111","createdOn":"29/06/23, 14:34","size":{"width":200,"height":200},"componentName":"Text","label":{"labelId":"73d74d0b-f8b5-4250-9e2d-57be66499b29","description":"Text-29/06/23, 14:34"}}',
                            Spreadsheet1: '{"type":"spreadsheet","innerId":"4e00fd33-132d-4848-a716-1776309a0647","position":{"x":700,"y":350},"createdBy":"a111","createdOn":"29/06/23, 14:35","size":{"width":200,"height":200},"componentName":"Tabelle","label":{"labelId":"1983f618-c749-468b-98a3-8f362a88ad98","description":"Tabelle-29/06/23, 14:35"}}'
                        },
                        connectionsObject: {}
                    }
                }
            },
            'notizbuch-b1-a111': {
                id: 'notizbuch-b1-a111',
                boardObject: {
                    _type: 'Board',
                    _crdt: true,
                    data: {
                        components: {},
                        connections: {}
                    },
                    crdtObjects: {
                        componentsInfoObject: {},
                        connectionsObject: {}
                    }
                }
            }
        }
    },
    spreadsheets: {
        ids: [
            '4e00fd33-132d-4848-a716-1776309a0647'
        ],
        entities: {
            '4e00fd33-132d-4848-a716-1776309a0647': {
                id: '4e00fd33-132d-4848-a716-1776309a0647',
                spreadSheetObject: {
                    _type: 'Spreadsheet',
                    _crdt: true,
                    data: {
                        value: {
                            headers: [
                                'XYZ'
                            ],
                            data: [
                                [
                                    {
                                        value: '',
                                        type: 'string',
                                        timestamp: 1688042104216,
                                        color: '#ffffff'
                                    }
                                ]
                            ],
                            meta: {
                                rows: [
                                    'r1'
                                ],
                                columns: [
                                    'c1'
                                ]
                            },
                            cellHighlightFormatRules: {}
                        }
                    },
                    crdtObjects: {
                        dataObject: {},
                        rowsObject: [],
                        columnsObject: []
                    }
                }
            }
        }
    },
    images: {
        ids: [],
        entities: {}
    },
    checkboxes: {
        ids: [],
        entities: {}
    },
    todolists: {
        ids: [],
        entities: {}
    },
    markdowns: {
        ids: [
            '6c770d59-de16-4c11-9207-b287a680d170'
        ],
        entities: {
            '6c770d59-de16-4c11-9207-b287a680d170': {
                id: '6c770d59-de16-4c11-9207-b287a680d170',
                textObject: {
                    _type: 'Markdown',
                    _crdt: true,
                    data: {
                        value: {
                            quill: ''
                        }
                    },
                    crdtObjects: {
                        markdownTextObject: {
                            quill: ''
                        }
                    }
                }
            }
        }
    },
    htmls: {
        ids: [],
        entities: {}
    },
    diagrams: {
        ids: [],
        entities: {}
    }
};
/*
const resizingComponentAndScaleTestPreloadState = {
    boards: {
        ids: [
            'skript-b1'
        ],
        entities: {
            'skript-b1': {
                id: 'skript-b1',
                data: {
                    components: {
                        Markdown1: {
                            type: 'markdown',
                            innerId: 'f73f379c-d02b-4186-ae2d-d261620ba9bf',
                            position: {
                                x: 200,
                                y: 300
                            }
                        },
                        Spreadsheet1: {
                            type: 'spreadsheet',
                            innerId: 'a9ff1f7b-dc91-4838-833d-68194c27053e',
                            position: {
                                x: 700,
                                y: 350
                            }
                        }
                    },
                    connections: {},
                    sizes: {
                        Markdown1: {
                            width: 200,
                            height: 200
                        },
                        Spreadsheet1: {
                            width: 200,
                            height: 200
                        }
                    }
                }
            }
        },
        test: true
    },
    spreadsheets: {
        ids: [
            'a9ff1f7b-dc91-4838-833d-68194c27053e'
        ],
        entities: {
            'a9ff1f7b-dc91-4838-833d-68194c27053e': {
                id: 'a9ff1f7b-dc91-4838-833d-68194c27053e',
                headers: [],
                data: [
                    [
                        {
                            value: '',
                            type: 'text',
                            timestamp: 1682256450318,
                            color: '#ffffff'
                        }
                    ]
                ],
                meta: {
                    rows: 1,
                    columns: 1
                },
                cellhighlightformatrules: {},
                fullWidthColumns: {}
            }
        },
        test: true
    },
    images: {
        ids: [],
        entities: {}
    },
    checkboxes: {
        ids: [],
        entities: {}
    },
    todolists: {
        ids: [],
        entities: {}
    },
    markdowns: {
        ids: [
            'f73f379c-d02b-4186-ae2d-d261620ba9bf'
        ],
        entities: {
            'f73f379c-d02b-4186-ae2d-d261620ba9bf': {
                id: 'f73f379c-d02b-4186-ae2d-d261620ba9bf',
                data: {
                    textObject: [
                        {
                            children: [
                                {
                                    type: 'p',
                                    children: [
                                        {
                                            text: ''
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            }
        },
        test: true
    },
    htmls: {
        ids: [],
        entities: {}
    },
    diagrams: {
        ids: [],
        entities: {}
    }
};
*/
export const addingComponentTestPreloadState = {
    boards: {
        ids: [
            'skript-b1',
            'notizbuch-b1-a111'
        ],
        entities: {
            'skript-b1': {
                id: 'skript-b1',
                boardObject: {
                    _type: 'Board',
                    _crdt: true,
                    data: {
                        components: {
                            '97637f8c-16dc-4f1d-966f-3ea1a20807d9': {
                                type: 'markdown',
                                innerId: '96f7368a-f42f-49d7-a3cc-ad3e88de9ba1',
                                position: {
                                    x: 765,
                                    y: 317
                                },
                                createdBy: 'a111',
                                createdOn: '29/06/23, 14:01',
                                componentInfo: {
                                    width: 200,
                                    height: 200
                                },
                                componentName: 'Text',
                                label: {
                                    labelId: '44bce9c1-ace8-453f-9769-fc125cabbaa4',
                                    description: 'Text-29/06/23, 14:01'
                                }
                            },
                            '341bc44b-edb8-4f3b-95b6-feb33e7eab7e': {
                                type: 'spreadsheet',
                                innerId: 'a978ca97-305e-4cab-8021-b961b1442e02',
                                position: {
                                    x: 988.3333333333336,
                                    y: 321.6666666666668
                                },
                                createdBy: 'a111',
                                createdOn: '29/06/23, 14:01',
                                componentInfo: {
                                    width: 200,
                                    height: 200
                                },
                                componentName: 'Tabelle',
                                label: {
                                    labelId: '7491abfc-9381-4850-ae2b-f0ff2180bda4',
                                    description: 'Tabelle-29/06/23, 14:01'
                                }
                            },
                            'b0d7b743-39ef-4cff-ba2e-203f2a814adb': {
                                type: 'diagram',
                                innerId: 'e6e38cec-256b-4d21-858c-0a52e19954b9',
                                position: {
                                    x: 1210,
                                    y: 320
                                },
                                createdBy: 'a111',
                                createdOn: '29/06/23, 14:01',
                                componentInfo: {
                                    width: 200,
                                    height: 200
                                },
                                componentName: 'Diagram',
                                label: {
                                    labelId: 'a607fe2c-dd08-4316-a6b5-b3ebc159bd89',
                                    description: 'Diagram-29/06/23, 14:01'
                                }
                            },
                            'fb5c716b-eaeb-47e6-b585-75edf385eaa3': {
                                type: 'image',
                                innerId: 'e0c48a0f-b0f1-4101-a36b-3cffdc286e06',
                                position: {
                                    x: 980.0000000000002,
                                    y: 530.0000000000001
                                },
                                createdBy: 'a111',
                                createdOn: '29/06/23, 14:01',
                                componentInfo: {
                                    width: 200,
                                    height: 200
                                },
                                componentName: 'Bild',
                                label: {
                                    labelId: 'a631c284-bd8b-481b-b52f-516cb42b2f84',
                                    description: 'Bild-29/06/23, 14:01'
                                }
                            },
                            '0fee1054-d378-4396-af33-16bc0d10eb49': {
                                type: 'todolist',
                                innerId: 'd6198e51-e206-4464-b55f-62db4c714d27',
                                position: {
                                    x: 1206.666666666668,
                                    y: 543.333333333334
                                },
                                createdBy: 'a111',
                                createdOn: '29/06/23, 14:02',
                                componentInfo: {
                                    width: 200,
                                    height: 200
                                },
                                componentName: 'ToDo Liste',
                                label: {
                                    labelId: 'af17a9aa-c69b-4e7d-a14c-3f373b83294d',
                                    description: 'ToDo Liste-29/06/23, 14:02'
                                }
                            },
                            'a032f67c-e09e-4954-806b-e47ebd51ae1f': {
                                type: 'htmlcomp',
                                innerId: '5df23b54-62b5-47db-bd0a-4b4d63c86429',
                                position: {
                                    x: 1440.0000000000005,
                                    y: 437.5000000000003
                                },
                                createdBy: 'a111',
                                createdOn: '29/06/23, 14:02',
                                componentInfo: {
                                    width: 200,
                                    height: 200
                                },
                                componentName: 'HTML',
                                label: {
                                    labelId: 'f0b8c03b-91c9-43cc-b388-b6b0a40a26eb',
                                    description: 'HTML-29/06/23, 14:02'
                                }
                            }
                        },
                        connections: {}
                    },
                    crdtObjects: {
                        componentsInfoObject: {
                            '97637f8c-16dc-4f1d-966f-3ea1a20807d9': '{"type":"markdown","innerId":"96f7368a-f42f-49d7-a3cc-ad3e88de9ba1","position":{"x":765,"y":317},"createdBy":"a111","createdOn":"29/06/23, 14:01","size":{"width":200,"height":200},"componentName":"Text","label":{"labelId":"44bce9c1-ace8-453f-9769-fc125cabbaa4","description":"Text-29/06/23, 14:01"}}',
                            '341bc44b-edb8-4f3b-95b6-feb33e7eab7e': '{"type":"spreadsheet","innerId":"a978ca97-305e-4cab-8021-b961b1442e02","position":{"x":988.3333333333336,"y":321.6666666666668},"createdBy":"a111","createdOn":"29/06/23, 14:01","size":{"width":200,"height":200},"componentName":"Tabelle","label":{"labelId":"7491abfc-9381-4850-ae2b-f0ff2180bda4","description":"Tabelle-29/06/23, 14:01"}}',
                            'b0d7b743-39ef-4cff-ba2e-203f2a814adb': '{"type":"diagram","innerId":"e6e38cec-256b-4d21-858c-0a52e19954b9","position":{"x":1210,"y":320},"createdBy":"a111","createdOn":"29/06/23, 14:01","size":{"width":200,"height":200},"componentName":"Diagram","label":{"labelId":"a607fe2c-dd08-4316-a6b5-b3ebc159bd89","description":"Diagram-29/06/23, 14:01"}}',
                            'fb5c716b-eaeb-47e6-b585-75edf385eaa3': '{"type":"image","innerId":"e0c48a0f-b0f1-4101-a36b-3cffdc286e06","position":{"x":980.0000000000002,"y":530.0000000000001},"createdBy":"a111","createdOn":"29/06/23, 14:01","size":{"width":200,"height":200},"componentName":"Bild","label":{"labelId":"a631c284-bd8b-481b-b52f-516cb42b2f84","description":"Bild-29/06/23, 14:01"}}',
                            '0fee1054-d378-4396-af33-16bc0d10eb49': '{"type":"todolist","innerId":"d6198e51-e206-4464-b55f-62db4c714d27","position":{"x":1206.666666666668,"y":543.333333333334},"createdBy":"a111","createdOn":"29/06/23, 14:02","size":{"width":200,"height":200},"componentName":"ToDo Liste","label":{"labelId":"af17a9aa-c69b-4e7d-a14c-3f373b83294d","description":"ToDo Liste-29/06/23, 14:02"}}',
                            'a032f67c-e09e-4954-806b-e47ebd51ae1f': '{"type":"htmlcomp","innerId":"5df23b54-62b5-47db-bd0a-4b4d63c86429","position":{"x":1440.0000000000005,"y":437.5000000000003},"createdBy":"a111","createdOn":"29/06/23, 14:02","size":{"width":200,"height":200},"componentName":"HTML","label":{"labelId":"f0b8c03b-91c9-43cc-b388-b6b0a40a26eb","description":"HTML-29/06/23, 14:02"}}'
                        },
                        connectionsObject: {}
                    }
                }
            },
            'notizbuch-b1-a111': {
                id: 'notizbuch-b1-a111',
                boardObject: {
                    _type: 'Board',
                    _crdt: true,
                    data: {
                        components: {},
                        connections: {}
                    },
                    crdtObjects: {
                        componentsInfoObject: {},
                        connectionsObject: {}
                    }
                }
            }
        }
    },
    spreadsheets: {
        ids: [
            'a978ca97-305e-4cab-8021-b961b1442e02'
        ],
        entities: {
            'a978ca97-305e-4cab-8021-b961b1442e02': {
                id: 'a978ca97-305e-4cab-8021-b961b1442e02',
                spreadSheetObject: {
                    _type: 'Spreadsheet',
                    _crdt: true,
                    data: {
                        value: {
                            headers: [
                                'XYZ'
                            ],
                            data: [
                                [
                                    {
                                        value: '',
                                        type: 'string',
                                        timestamp: 1688040087290,
                                        color: '#ffffff'
                                    }
                                ]
                            ],
                            meta: {
                                rows: [
                                    'r1'
                                ],
                                columns: [
                                    'c1'
                                ]
                            },
                            cellHighlightFormatRules: {}
                        }
                    },
                    crdtObjects: {
                        dataObject: {},
                        rowsObject: [
                            'r1'
                        ],
                        columnsObject: [
                            'c1'
                        ]
                    }
                }
            }
        }
    },
    images: {
        ids: [
            'e0c48a0f-b0f1-4101-a36b-3cffdc286e06'
        ],
        entities: {
            'e0c48a0f-b0f1-4101-a36b-3cffdc286e06': {
                id: 'e0c48a0f-b0f1-4101-a36b-3cffdc286e06',
                imageObject: {
                    _type: 'Image',
                    _crdt: true,
                    data: {
                        rotation: null
                    },
                    crdtObjects: {
                        urlObject: {},
                        descriptionObject: {},
                        rotationObject: {}
                    }
                }
            }
        }
    },
    checkboxes: {
        ids: [],
        entities: {}
    },
    todolists: {
        ids: [
            'd6198e51-e206-4464-b55f-62db4c714d27'
        ],
        entities: {
            'd6198e51-e206-4464-b55f-62db4c714d27': {
                id: 'd6198e51-e206-4464-b55f-62db4c714d27',
                todoListObject: {
                    _type: 'TodoList',
                    _crdt: true,
                    data: {
                        value: []
                    },
                    crdtObjects: {
                        todoListArray: [],
                        todoListTextMap: {},
                        todoListCheckedMap: {}
                    }
                }
            }
        }
    },
    markdowns: {
        ids: [
            '96f7368a-f42f-49d7-a3cc-ad3e88de9ba1'
        ],
        entities: {
            '96f7368a-f42f-49d7-a3cc-ad3e88de9ba1': {
                id: '96f7368a-f42f-49d7-a3cc-ad3e88de9ba1',
                textObject: {
                    _type: 'Markdown',
                    _crdt: true,
                    data: {
                        value: {
                            quill: ''
                        }
                    },
                    crdtObjects: {
                        markdownTextObject: {
                            quill: ''
                        }
                    }
                }
            }
        }
    },
    htmls: {
        ids: [
            '5df23b54-62b5-47db-bd0a-4b4d63c86429'
        ],
        entities: {
            '5df23b54-62b5-47db-bd0a-4b4d63c86429': {
                id: '5df23b54-62b5-47db-bd0a-4b4d63c86429',
                htmlObject: {
                    _type: 'HTML',
                    _crdt: true,
                    data: {
                        value: ''
                    },
                    crdtObjects: {
                        htmlTextObject: {}
                    }
                }
            }
        }
    },
    diagrams: {
        ids: [
            'e6e38cec-256b-4d21-858c-0a52e19954b9'
        ],
        entities: {
            'e6e38cec-256b-4d21-858c-0a52e19954b9': {
                id: 'e6e38cec-256b-4d21-858c-0a52e19954b9',
                diagramObject: {
                    _type: 'Diagram',
                    _crdt: true,
                    data: {
                        value: {
                            type: '',
                            ssid: '',
                            settings: '{}'
                        }
                    },
                    crdtObjects: {
                        diagramTypeObject: {},
                        SSIdObject: {},
                        settingsObject: {}
                    }
                }
            }
        }
    }
};
