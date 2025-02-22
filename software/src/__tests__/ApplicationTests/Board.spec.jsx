import { screen, fireEvent } from '@testing-library/react';
import { setupStore } from '../../model/app/store';
import { getMouseEvent, colorMap, drag, drag2, renderBoardWithProviders } from '../../services/test-utils';
import { cleanUpProviderCollection, initDocument } from '../../services/collectionprovider';
import userEvent from '@testing-library/user-event';
import { DEFAULT_COMPONENT_SIZE } from '../../model/features/EntityProxies/BoardProxy';
import {
    CopyCheckboxPrelodestate,
    copyMarkdownPrelodestate,
    copyDiagramPrelodestate,
    labelsTestPreloadState,
    connectionsTestPreloadState,
    removeComponentTestPreloadState,
    predefinedBT2u3,
    predefinedBT4a,
    predefinedRTB,
    predefinedBT4d,
    predefinedBT4c,
    predefinedBT5u6u7u8u12
} from '../../test_services/predefineStates/BoardPredefined';

let localstore;
// set the environment variables because they are not set in the cdci environment
process.env.REACT_APP_HOMEPAGE = '/hhyedz7ynlijlb26';
process.env.REACT_APP_SERVERPORT = ':10180';
beforeEach(() => {
    initDocument('13a');
    localstore = setupStore();
    process.env.APP_TEST = 'true';
    jest.useFakeTimers();
    // set the environment variables because they are not set in the cdci environment
    process.env.REACT_APP_HOMEPAGE = '/hhyedz7ynlijlb26';
    process.env.REACT_APP_SERVERPORT = ':10180';
});
afterEach(() => {
    // restore the spy created with spyOn
    jest.restoreAllMocks();
    jest.useRealTimers();
    jest.clearAllTimers();
    cleanUpProviderCollection();
});

/* future idea
const dragAndDrop = (src, dst) => {
    jest.spyOn(monitor);
    fireEvent.dragStart(src);
    jest.runOnlyPendingTimers();
    fireEvent;
    jest.runOnlyPendingTimers();
    setTimeout(() => { fireEvent.drop(dst); });
    fireEvent.dragLeave(dst);
    jest.runOnlyPendingTimers();
    fireEvent.dragEnd(src);
    jest.runOnlyPendingTimers();
};

*/
// get all Buttons that are needed on the board. It does not test if they are found.
// if a button is not found the variable contains null.
// so you need to test if the button is found in the test case
function getNeededBoardButtons (screen) {
    /* get the needed buttons. if here an error is occuring the button is not in the initaial render and there is a problem */
    const drawerOpen = screen.queryAllByRole('button', { name: 'open drawer' });
    const fullscreen = screen.queryAllByTestId('fullscreenButten');
    const skript = screen.queryAllByRole('button', { name: 'Skript' });
    const notizen = screen.queryAllByRole('button', { name: 'Notizen' });
    const tafel = screen.queryAllByRole('button', { name: 'Tafel' });
    const experimentTitle = screen.queryAllByRole('button', { name: 'experiment title' });
    const help = screen.queryAllByTestId('help');
    const bewegen = screen.queryAllByRole('button', { name: 'Bewegen' });
    const zentrieren = screen.queryAllByRole('button', { name: 'Zentrieren' });
    const zurücksetzten = screen.queryAllByRole('button', { name: 'Zurücksetzen' });
    const minusButton = screen.queryAllByRole('button', { name: '-' });
    const plusButton = screen.queryAllByRole('button', { name: '+' });

    return {
        drawerOpen,
        fullscreen,
        skript,
        notizen,
        tafel,
        experimentTitle,
        help,
        bewegen,
        zentrieren,
        zurücksetzten,
        minusButton,
        plusButton
    };
};
// same as above for all Buttons in the TabBoard
function getNeededTabBoardButtons (screen) {
    /* check if the expected buttons in toolbox are there */
    const text = screen.queryAllByRole('button', { name: 'Text' });
    const tabelle = screen.queryAllByRole('button', { name: 'Tabelle' });
    const diagram = screen.queryAllByRole('button', { name: 'Diagram' });
    const bild = screen.queryAllByRole('button', { name: 'Bild' });
    const toDoListe = screen.queryAllByRole('button', { name: 'ToDo Liste' });

    return {
        text,
        tabelle,
        diagram,
        bild,
        toDoListe
    };
};
// needed executions to open the Drawer
function openDrawer (screen, expect, drawerOpen, splitBoardFlag = true) {
    // opens the drawer
    userEvent.click(drawerOpen[0]);

    /* hekck if the new buttons are there */
    const closeDrawer = screen.queryAllByTestId('closeDrawer');
    const toolBox = screen.queryAllByRole('button', { name: 'ToolBox' });
    let importExport;
    if (!splitBoardFlag) {
        importExport = screen.queryAllByRole('button', { name: 'Importieren/Exportieren' });
        expect(importExport.length).toEqual(1);
    }

    expect(closeDrawer.length).toEqual(1);
    expect(toolBox.length).toEqual(1);
    return { closeDrawer, toolBox, importExport };
};
// all executions that are needed to click on the Board with a specific position (needed because of a bug in JSDOM)
// xCoordinate and yCoordinate are the coordinates of the click
//
function clickPositionAndInsertComponentEvent ({ xCoordinate, yCoordinate, componentButton, workAreaTestId = 'workArea-skript-b1' }) {
    // blub
    userEvent.click(screen.queryByTestId(workAreaTestId), { clientX: 700, clientY: 300, debug: true });
    /*
            selbstkreiertes Event um die Position des Klicks zu bestimmen ab dem Zeitpunkt wenn JSDOM 21 in Jest integriert wird ist das nicht
            mehr nötig uns es kann einfach userEvent.click(screen.queryByTestId('workArea-skript-b1'), { clientX: 700, clientY: 300, pageX: 0, pageY: 0 });
            verwendet werden
            */
    const event = getMouseEvent('click', { clientX: xCoordinate, clientY: yCoordinate, pageX: xCoordinate, pageY: yCoordinate });
    fireEvent(screen.queryByTestId(workAreaTestId), event);
    fireEvent.click(componentButton);
    fireEvent(screen.queryByTestId(workAreaTestId), event);
};
// open the COntext Menu on a specific position on a board
// xCoordinate and yCoordinate are the coordinates of the click
// workAreaTestId is the testId of the workArea default on the script
function openContextMenuWithPosition ({ xCoordinate, yCoordinate, workAreaTestId = 'workArea-skript-b1' }) {
    userEvent.click(screen.queryByTestId(workAreaTestId), { clientX: 300, clientY: 700, pageX: 300, pageY: 700 });
    // open the context menu
    const initialClick = getMouseEvent('click', { clientX: 300, clientY: 700, pageX: 300, pageY: 700 });
    const MoauseMove = getMouseEvent('mousemove', { clientX: xCoordinate, clientY: yCoordinate, pageX: xCoordinate, pageY: yCoordinate });
    const contextMenuEvent = getMouseEvent('contextmenu', { clientX: xCoordinate, clientY: yCoordinate, pageX: xCoordinate, pageY: yCoordinate });

    fireEvent(screen.queryByTestId(workAreaTestId), initialClick);
    fireEvent(screen.queryByTestId(workAreaTestId), MoauseMove);
    fireEvent(screen.queryByTestId(workAreaTestId), contextMenuEvent);
    jest.runOnlyPendingTimers();
};
// opens the context Menu on a specific component
// workAreaTestId needed because of a JSDOM Bug
function openContextMenuOnComponent ({ component, workAreaTestId = 'workArea-skript-b1', index = 0 }) {
    /* open context menu on the TodoList */
    const workArea = screen.getAllByTestId(workAreaTestId);
    userEvent.click(workArea[0]);
    // open context menu
    fireEvent.contextMenu(screen.getAllByTestId(component)[index]);
    jest.runOnlyPendingTimers();
};
// presses a Button of the context Menu
// buttonId is the testId of the button
// index is needed if more that one occurence of this button exsists. Default is 0
function pressContextMenuButton ({ jest, expect, screen, buttonId, index = 0 }) {
    const Button = screen.getAllByTestId(buttonId)[index];
    expect(Button).not.toBeDisabled();
    userEvent.click(Button);
    jest.runOnlyPendingTimers();
}
/* Array enthält  alle möglichen hinzufügbaren Komponenten identifiziert über den Namen */
const componentsName = ['Text', 'Tabelle', 'Diagram', 'Bild', 'ToDo Liste'];
process.env.MTests = true;
beforeEach(async () => {
    process.env.MTests = true;
});
describe('reducer Test (the ones needed for the other test cases)', () => {
    test.skip('RTB: testing preload functionality', () => {
        renderBoardWithProviders({ localstore: localstore });
        predefinedRTB(jest, localstore);
        expect(localstore.getState().spreadsheets.entities.testSpreadsheet).toBeDefined();
        expect(localstore.getState().boards.entities['skript-b1'].boardObject.data.components['spreadsheet-Comp'].type).toEqual('spreadsheet');
        expect(localstore.getState().boards.entities['skript-b1'].boardObject.data.components['spreadsheet-Comp'].innerId).toEqual('testSpreadsheet');
        expect(localstore.getState().boards.entities['skript-b1'].boardObject.data.components['spreadsheet-Comp'].position).toEqual({ x: 0, y: 0 });
        expect(localstore.getState().boards.entities['skript-b1'].boardObject.data.components['spreadsheet-Comp'].createdBy).toEqual('createdBy');
        expect(localstore.getState().boards.entities['skript-b1'].boardObject.data.components['spreadsheet-Comp'].createdOn).toEqual('createdOn');
        expect(localstore.getState().boards.entities['skript-b1'].boardObject.data.components['spreadsheet-Comp'].size).toEqual(DEFAULT_COMPONENT_SIZE);
        expect(localstore.getState().boards.entities['skript-b1'].boardObject.data.components['spreadsheet-Comp'].componentName).toEqual('Title');
        expect(localstore.getState().boards.entities['skript-b1'].boardObject.data.components['spreadsheet-Comp'].label.description).toEqual('Title-createdOn');
        expect(localstore.getState().spreadsheets.entities.testSpreadsheet.spreadSheetObject.data.value.headers).toEqual(['XYZ']);
        expect(localstore.getState().spreadsheets.entities.testSpreadsheet.spreadSheetObject.data.value.data[0][0].value).toEqual('');
        expect(localstore.getState().spreadsheets.entities.testSpreadsheet.spreadSheetObject.data.value.data[0][0].type).toEqual('string');
        expect(localstore.getState().spreadsheets.entities.testSpreadsheet.spreadSheetObject.data.value.data[0][0].timestamp).toBeDefined();
        expect(localstore.getState().spreadsheets.entities.testSpreadsheet.spreadSheetObject.data.value.data[0][0].color).toEqual('#ffffff');
        expect(localstore.getState().spreadsheets.entities.testSpreadsheet.spreadSheetObject.data.value.meta.rows).toEqual(['r1']);
        expect(localstore.getState().spreadsheets.entities.testSpreadsheet.spreadSheetObject.data.value.meta.columns).toEqual(['c1']);
        expect(localstore.getState().spreadsheets.entities.testSpreadsheet.spreadSheetObject.data.value.cellHighlightFormatRules).toEqual({});
    });
});

describe('Adding - Removing (Components, Labels, Connections)', () => {
    test.skip('BT1 renders the board initally empty', () => {
        /* mock the location to be able to test the board */
        // no predefined state needed
        renderBoardWithProviders({ localstore: localstore });
        // no component is exsisting in the rndered board (empty array)
        expect(screen.queryAllByTestId('workComponent').length).toEqual(0);

        /* img BASF logo beeing there */
        const basfLogoImg = screen.queryAllByRole('img');
        const {
            drawerOpen,
            fullscreen,
            skript,
            notizen,
            tafel,
            experimentTitle,
            help,
            bewegen,
            zentrieren,
            zurücksetzten,
            minusButton,
            plusButton
        } = getNeededBoardButtons(screen);
        /* expect them all to exsist ;D */
        expect(drawerOpen.length).toEqual(1);
        expect(fullscreen.length).toEqual(1);
        expect(skript.length).toEqual(1);
        expect(notizen.length).toEqual(1);
        expect(tafel.length).toEqual(1);
        expect(experimentTitle.length).toEqual(1);
        expect(help.length).toEqual(1);
        expect(bewegen.length).toEqual(2);
        expect(zentrieren.length).toEqual(2);
        expect(zurücksetzten.length).toEqual(2);
        expect(minusButton.length).toEqual(2);
        expect(plusButton.length).toEqual(2);
        expect(basfLogoImg.length).toEqual(1);
        /*
        // opens the drawer
        fireEvent.click(drawerOpen[0]);

        /* hekck if the new buttons are there
        const closeDrawer = screen.queryAllByTestId('closeDrawer');
        const toolBox = screen.queryAllByRole('button', { name: 'ToolBox' });
        const importExport = screen.queryAllByRole('button', { name: 'Importieren/Exportieren' });

        expect(closeDrawer.length).toEqual(1);
        expect(toolBox.length).toEqual(1);
        expect(importExport.length).toEqual(1);
        */
        const {
            toolBox
        } = openDrawer(screen, expect, drawerOpen);
        // opens ToolBox and importExport
        fireEvent.click(toolBox[0]);
        const {
            text,
            tabelle,
            diagram,
            bild,
            toDoListe
        } = getNeededTabBoardButtons(screen);

        expect(text.length).toEqual(1);
        expect(tabelle.length).toEqual(1);
        expect(diagram.length).toEqual(1);
        expect(bild.length).toEqual(1);
        expect(toDoListe.length).toEqual(1);
        /* is the shortcut menu opening with right click? */
        const workArea = screen.getAllByTestId('workArea-skript-b1');
        fireEvent.contextMenu(workArea[0]);

        // TODOTEST Context menu aurufen :C
    });
    let xCoordinate = 100;
    const yCoordinate = 300;
    // FutureTest: maybe testing unmount()
    test.skip.each(componentsName)('BT2a - e:  adding of components', (component) => {
        renderBoardWithProviders({ localstore: localstore });
        predefinedBT2u3(jest, localstore);

        let tables = screen.queryAllByTestId('Tabelle');
        let todos = screen.queryAllByTestId('ToDo Liste');
        let markdowns = screen.queryAllByTestId('Text');
        let images = screen.queryAllByTestId('Bild');
        let diagrams = screen.queryAllByTestId('Diagram');
        expect(tables.length).toEqual(1);
        expect(todos.length).toEqual(1);
        expect(markdowns.length).toEqual(1);
        expect(images.length).toEqual(1);
        expect(diagrams.length).toEqual(1);

        const {
            drawerOpen
        } = getNeededBoardButtons(screen);

        // add a component
        const {
            toolBox
        } = openDrawer(screen, expect, drawerOpen);

        /* get the toolBox button if the new buttons are there */

        userEvent.click(toolBox[0]);

        const componentButton = screen.queryByRole('button', { name: component });

        clickPositionAndInsertComponentEvent({ xCoordinate, yCoordinate, componentButton });
        // check if the component is added
        tables = screen.queryAllByTestId('Tabelle');
        todos = screen.queryAllByTestId('ToDo Liste');
        markdowns = screen.queryAllByTestId('Text');
        images = screen.queryAllByTestId('Bild');
        diagrams = screen.queryAllByTestId('Diagram');
        // updates position for next component
        xCoordinate += 200;
        switch (component) {
        case 'Tabelle':
            expect(tables.length).toEqual(2);
            expect(todos.length).toEqual(1);
            expect(markdowns.length).toEqual(1);
            expect(images.length).toEqual(1);
            expect(diagrams.length).toEqual(1);
            break;
        case 'ToDo Liste':
            expect(tables.length).toEqual(1);
            expect(todos.length).toEqual(2);
            expect(markdowns.length).toEqual(1);
            expect(images.length).toEqual(1);
            expect(diagrams.length).toEqual(1);
            break;
        case 'Text':
            expect(tables.length).toEqual(1);
            expect(todos.length).toEqual(1);
            expect(markdowns.length).toEqual(2);
            expect(images.length).toEqual(1);
            expect(diagrams.length).toEqual(1);
            break;
        case 'Bild':
            expect(tables.length).toEqual(1);
            expect(todos.length).toEqual(1);
            expect(markdowns.length).toEqual(1);
            expect(images.length).toEqual(2);
            expect(diagrams.length).toEqual(1);
            break;
        case 'Diagram':
            expect(tables.length).toEqual(1);
            expect(todos.length).toEqual(1);
            expect(markdowns.length).toEqual(1);
            expect(images.length).toEqual(1);
            expect(diagrams.length).toEqual(2);
            break;
        default:
            throw new Error('component not found' + component);
        }
        /* future tests
        unmount();
        jest.runOnlyPendingTimers();
        expect(localstore.getState().boards).toEqual({});
        */
    });
    // TODOTest : TypeError: _c.getTotalLength is not a function
    test.skip('BT9 : adding and removing connections', () => {
        localstore = setupStore(connectionsTestPreloadState);
        renderBoardWithProviders({ localstore: localstore });
        jest.runOnlyPendingTimers();

        expect(screen.queryAllByTestId('Text').length).toEqual(2);
        /* pre defined clicks because of a JSDOM issue */
        const MoauseMove1 = getMouseEvent('mousemove', { clientX: 500, clientY: 250, pageX: 500, pageY: 250 });
        const contextMenuEvent1 = getMouseEvent('contextmenu', { clientX: 500, clientY: 250, pageX: 500, pageY: 250 });
        const click1 = getMouseEvent('click', { clientX: 500, clientY: 250, pageX: 500, pageY: 250 });

        const contextMenuEvent2 = getMouseEvent('contextmenu', { clientX: 900, clientY: 370, pageX: 900, pageY: 370 });
        const click2 = getMouseEvent('click', { clientX: 900, clientY: 370, pageX: 900, pageY: 370 });
        // one userEvent as initalclick so that it does not crash why.... dont know exactly some JSDOM issue
        userEvent.click(screen.queryByTestId('workArea-skript-b1'), { clientX: 300, clientY: 250, pageX: 300, pageY: 250 });
        fireEvent(screen.queryByTestId('workArea-skript-b1'), MoauseMove1);
        jest.runOnlyPendingTimers();

        /* test starts here */
        const markdowns = screen.queryAllByTestId('Text');
        expect(markdowns.length).toEqual(2);
        fireEvent(markdowns[0], contextMenuEvent1);
        jest.runOnlyPendingTimers();

        expect(screen.queryAllByTestId('connection').length).toEqual(1);
        fireEvent(screen.getByTestId('workArea-skript-b1'), MoauseMove1);
        userEvent.click(screen.queryAllByTestId('connection')[0]);

        jest.runOnlyPendingTimers();

        fireEvent(markdowns[1], click2);
        jest.runOnlyPendingTimers();
        // console.log(localstore.getState().boards.entities['skript-b1']);
    });
    const quickAccessComponents = [0, 1, 3]; // Text, Tabelle, Bild the ordering in the tooltips
    test.skip.each(quickAccessComponents)('BT3: QuickAccess menu', (position) => {
        renderBoardWithProviders({ localstore: localstore });
        predefinedBT2u3(jest, localstore);
        let tables = screen.queryAllByTestId('Tabelle');
        let todos = screen.queryAllByTestId('ToDo Liste');
        let markdowns = screen.queryAllByTestId('Text');
        let images = screen.queryAllByTestId('Bild');
        let diagrams = screen.queryAllByTestId('Diagram');
        expect(tables.length).toEqual(1);
        expect(todos.length).toEqual(1);
        expect(markdowns.length).toEqual(1);
        expect(images.length).toEqual(1);
        expect(diagrams.length).toEqual(1);
        openContextMenuWithPosition({ xCoordinate: 500, yCoordinate: 500 });
        const addingComponentQuickAccessButton = screen.getByTestId('Komp' + position);
        expect(addingComponentQuickAccessButton).toBeInTheDocument();
        clickPositionAndInsertComponentEvent({ xCoordinate: xCoordinate, yCoordinate: yCoordinate, componentButton: addingComponentQuickAccessButton });
        // check if the component is added
        tables = screen.queryAllByTestId('Tabelle');
        todos = screen.queryAllByTestId('ToDo Liste');
        markdowns = screen.queryAllByTestId('Text');
        images = screen.queryAllByTestId('Bild');
        diagrams = screen.queryAllByTestId('Diagram');
        // updates position for next component
        xCoordinate += 200;
        switch (position) {
        case 1:
            expect(tables.length).toEqual(2);
            expect(todos.length).toEqual(1);
            expect(markdowns.length).toEqual(1);
            expect(images.length).toEqual(1);
            expect(diagrams.length).toEqual(1);
            break;
        case 4:
            expect(tables.length).toEqual(1);
            expect(todos.length).toEqual(2);
            expect(markdowns.length).toEqual(1);
            expect(images.length).toEqual(1);
            expect(diagrams.length).toEqual(1);
            break;
        case 0:
            expect(tables.length).toEqual(1);
            expect(todos.length).toEqual(1);
            expect(markdowns.length).toEqual(2);
            expect(images.length).toEqual(1);
            expect(diagrams.length).toEqual(1);
            break;
        case 3:
            expect(tables.length).toEqual(1);
            expect(todos.length).toEqual(1);
            expect(markdowns.length).toEqual(1);
            expect(images.length).toEqual(2);
            expect(diagrams.length).toEqual(1);
            break;
        case 2:
            expect(tables.length).toEqual(1);
            expect(todos.length).toEqual(1);
            expect(markdowns.length).toEqual(1);
            expect(images.length).toEqual(1);
            expect(diagrams.length).toEqual(2);
            break;
        default:
            throw new Error('position not found' + position);
        }
    });
    test.skip('BT8: adding, displaying and removing labels', () => {
        localstore = setupStore(labelsTestPreloadState);
        jest.spyOn(window, 'prompt').mockImplementation(() => 'Tabelle1');
        renderBoardWithProviders({ localstore: localstore });
        /* pre defined clicks because of a JSDOM issue */
        const MoauseMove1 = getMouseEvent('mousemove', { clientX: 500, clientY: 250, pageX: 500, pageY: 250 });
        const contextMenuEvent1 = getMouseEvent('contextmenu', { clientX: 500, clientY: 250, pageX: 500, pageY: 250 });
        const click1 = getMouseEvent('click', { clientX: 500, clientY: 250, pageX: 500, pageY: 250 });

        const contextMenuEvent2 = getMouseEvent('contextmenu', { clientX: 900, clientY: 370, pageX: 900, pageY: 370 });
        const click2 = getMouseEvent('click', { clientX: 900, clientY: 370, pageX: 900, pageY: 370 });
        // one userEvent as initalclick so that it does not crash why.... dont know exactly some JSDOM issue
        userEvent.click(screen.queryByTestId('workArea-skript-b1'), { clientX: 300, clientY: 250, pageX: 300, pageY: 250 });
        fireEvent(screen.queryByTestId('workArea-skript-b1'), MoauseMove1);
        jest.runOnlyPendingTimers();

        /* test starts here */
        const tables = screen.queryAllByTestId('Tabelle');
        expect(tables.length).toEqual(2);
        fireEvent(tables[0], contextMenuEvent1);
        jest.runOnlyPendingTimers();
        fireEvent(screen.queryAllByTestId('labeling')[0], click1);
        jest.runOnlyPendingTimers();

        fireEvent(tables[1], contextMenuEvent2);
        jest.runOnlyPendingTimers();
        // noch ein Bug das contextmenu wird nicht geschlossen
        expect(screen.queryAllByTestId('labeling').length).toEqual(2);
        jest.spyOn(window, 'prompt').mockImplementation(() => 'Tabelle2');
        fireEvent(screen.queryAllByTestId('labeling')[1], click2);
        jest.runOnlyPendingTimers();

        const drawerOpen = screen.queryAllByRole('button', { name: 'open drawer' });
        fireEvent.click(drawerOpen[0]);
        const labelExpandsion = screen.getByTestId('labelExpandsion');
        fireEvent.click(labelExpandsion);
        expect(screen.getByTestId('labelTabelle1')).toBeInTheDocument();
        expect(screen.getByTestId('labelTabelle2')).toBeInTheDocument();

        // jump to label
        expect(screen.getAllByTestId('workComponent')[1].style.transform).toContain('translate3d(900px, 370px, 0)');
        userEvent.click(screen.getByTestId('labelTabelle2'));
        expect(screen.getAllByTestId('workComponent')[1].style.transform).toContain('translate3d(0px, 0px, 0)');
        // delete label test first one not confirming
        jest.spyOn(window, 'confirm').mockImplementation(() => false);
        fireEvent.click(screen.getByTestId('labelTabelle1').getElementsByClassName('MuiChip-deleteIcon')[0]);
        expect(screen.getByTestId('labelTabelle1')).toBeInTheDocument();
        expect(screen.getByTestId('labelTabelle2')).toBeInTheDocument();
        // now confirming
        jest.spyOn(window, 'confirm').mockImplementation(() => true);
        // deleting the Label of Table 1
        fireEvent.click(screen.getByTestId('labelTabelle1').getElementsByClassName('MuiChip-deleteIcon')[0]);
        expect(screen.queryByTestId('labelTabelle1')).toBeNull();
        expect(screen.getByTestId('labelTabelle2')).toBeInTheDocument();
    });
    test.skip.each(componentsName)('BT11a-e: removing of a abitrary component', (component) => {
        /* predefined store */

        /* test starts here */
        let tables;
        let todos;
        let markdowns;
        let images;
        let diagrams;

        // componentsName.forEach(component => {
        localstore = setupStore(removeComponentTestPreloadState);
        renderBoardWithProviders({ localstore: localstore });
        jest.runOnlyPendingTimers();
        // console.log(component);
        tables = screen.queryAllByTestId('Tabelle');
        todos = screen.queryAllByTestId('ToDo Liste');
        markdowns = screen.queryAllByTestId('Text');
        images = screen.queryAllByTestId('Bild');
        diagrams = screen.queryAllByTestId('DiagramVisual');
        // needed for comparison
        const diagramsSafe = screen.queryAllByTestId('DiagramVisual');
        expect(tables.length).toEqual(2);
        expect(todos.length).toEqual(2);
        expect(markdowns.length).toEqual(2);
        expect(images.length).toEqual(2);
        expect(diagrams.length).toEqual(2);
        if (component === 'Diagram') {
            component = 'DiagramVisual';
        };
        const focusedComponend = screen.queryAllByTestId(component)[1];
        // remove a component
        userEvent.click(screen.queryByTestId('workArea-skript-b1'), { clientX: 300, clientY: 250, pageX: 300, pageY: 250 });
        jest.runOnlyPendingTimers();
        fireEvent.contextMenu(focusedComponend);
        jest.runOnlyPendingTimers();
        userEvent.click(screen.getByTestId('removeComponentButton'));
        jest.runOnlyPendingTimers();
        // check if the component is removed
        tables = screen.queryAllByTestId('Tabelle');
        todos = screen.queryAllByTestId('ToDo Liste');
        markdowns = screen.queryAllByTestId('Text');
        images = screen.queryAllByTestId('Bild');
        diagrams = screen.queryAllByTestId('DiagramVisual');

        switch (component) {
        case 'Tabelle':
            expect(tables.length).toEqual(1);
            expect(todos.length).toEqual(2);
            expect(markdowns.length).toEqual(2);
            expect(images.length).toEqual(2);
            expect(diagrams.length).toEqual(2);
            expect(screen.getByTestId('c00')).toHaveTextContent('5');
            expect(screen.getByTestId('c01')).toHaveTextContent('6');
            expect(screen.getByTestId('c10')).toHaveTextContent('7');
            expect(screen.getByTestId('c11')).toHaveTextContent('8');
            break;
        case 'ToDo Liste':
            expect(tables.length).toEqual(2);
            expect(todos.length).toEqual(1);
            expect(markdowns.length).toEqual(2);
            expect(images.length).toEqual(2);
            expect(diagrams.length).toEqual(2);
            expect(screen.getAllByTestId('todoTextField')[0].getElementsByTagName('input')[0].value).toEqual('Todo1');
            break;
        case 'Text':
            expect(tables.length).toEqual(2);
            expect(todos.length).toEqual(2);
            expect(markdowns.length).toEqual(1);
            expect(images.length).toEqual(2);
            expect(diagrams.length).toEqual(2);
            expect(markdowns[0]).toHaveTextContent('Text1');
            break;
        case 'Bild':
            expect(tables.length).toEqual(2);
            expect(todos.length).toEqual(2);
            expect(markdowns.length).toEqual(2);
            expect(images.length).toEqual(1);
            expect(diagrams.length).toEqual(2);
            expect(images[0].getElementsByTagName('img')[0]).toHaveAttribute('src', 'https://cdn.pixabay.com/photo/2017/03/12/04/59/one-2136425_1280.png');
            break;
        case 'DiagramVisual':
            expect(tables.length).toEqual(2);
            expect(todos.length).toEqual(2);
            expect(markdowns.length).toEqual(2);
            expect(images.length).toEqual(2);
            expect(diagrams.length).toEqual(1);
            expect(diagrams[0].isEqualNode(diagramsSafe[0])).toEqual(true);
            break;
        default:
            throw new Error('component not found' + component);
        }
    });
});

describe('Copy Component Tests', () => {
    // TestFuture: maybe deletion of the copied component
    test.skip('BT4a: CopyTodoList', async () => {
        renderBoardWithProviders({ localstore: localstore });
        predefinedBT4a(jest, localstore);
        // TodoList 1
        let todoCheckboxInput = screen.getAllByTestId('todoCheckboxInput');
        // Texxtfield
        expect(screen.getAllByTestId('todoTextField')[0]).toBeDefined();
        expect(todoCheckboxInput[0]).toBeChecked();
        // const hi = screen.getByTestId('ToDo Liste');
        openContextMenuOnComponent({ component: 'ToDo Liste' });
        pressContextMenuButton({ jest: jest, expect: expect, screen: screen, buttonId: 'copyComponentButton' });
        openContextMenuWithPosition({ xCoordinate: 500, yCoordinate: 500 });
        pressContextMenuButton({ jest: jest, expect: expect, screen: screen, buttonId: 'insertButton' });

        const todoList = screen.getAllByTestId('ToDo Liste');
        todoCheckboxInput = screen.getAllByTestId('todoCheckboxInput');
        expect(todoList.length).toEqual(2);
        expect(todoCheckboxInput[0]).toBeChecked();
        expect(todoCheckboxInput[1]).toBeChecked();
        expect(screen.getAllByTestId('todoTextField')[0]).toBeDefined();
        expect(screen.getAllByTestId('todoTextField')[1]).toBeDefined();

        openContextMenuOnComponent({ component: 'ToDo Liste', index: 1 });
        pressContextMenuButton({ jest: jest, expect: expect, screen: screen, buttonId: 'removeComponentButton' });
        // there sould be only one ToDoList left
        expect(screen.getAllByTestId('ToDo Liste').length).toEqual(1);
    });
    // checkbox not used right now
    test.skip('BT4b: CopyCheckbox', () => {
        localstore = setupStore(CopyCheckboxPrelodestate);
        jest.runOnlyPendingTimers();
        /*
        console.log('state', localstore.getState());
        console.log('boards', localstore.getState().boards);
        console.log('b1', localstore.getState().boards.entities['skript-b1']);
        */
        /* crrating a board with some default exsisting components */
        renderBoardWithProviders({ localstore: localstore });
        /* predefine a ToDoList with one item   */
        jest.runOnlyPendingTimers();
        jest.runOnlyPendingTimers();

        let todoCheckboxInput = screen.getAllByTestId('checkboxInput');
        expect(todoCheckboxInput[0]).toBeChecked();
        const workArea = screen.getAllByTestId('workArea-skript-b1');
        userEvent.click(workArea[0]);
        fireEvent.contextMenu(screen.getAllByTestId('checkbox')[0]);
        jest.runOnlyPendingTimers();
        const copyComponentButton = screen.getByTestId('copyComponentButton');

        expect(copyComponentButton).not.toBeDisabled();
        fireEvent.click(copyComponentButton);
        jest.runOnlyPendingTimers();
        // const workArea = screen.getAllByTestId('workArea-skript-b1');

        fireEvent.contextMenu(workArea[0]);
        jest.runOnlyPendingTimers();
        const insertButton = screen.getByTestId('insertButton');

        fireEvent.click(insertButton);
        jest.runOnlyPendingTimers();
        /*
        selbstkreiertes Event um die Position des Klicks zu bestimmen ab dem Zeitpunkt wenn JSDOM 21 in Jest integriert wird ist das nicht
        mehr nötig uns es kann einfach userEvent.click(screen.queryByTestId('workArea-skript-b1'), { clientX: 700, clientY: 300, pageX: 0, pageY: 0 });
        verwendet werden
        */
        const event = getMouseEvent('click', { clientX: 500, clientY: 500, pageX: 500, pageY: 500 });
        fireEvent(screen.queryByTestId('workArea-skript-b1'), event);
        fireEvent(screen.queryByTestId('workArea-skript-b1'), event);
        jest.runOnlyPendingTimers();
        todoCheckboxInput = screen.getAllByTestId('checkboxInput');
        expect(todoCheckboxInput.length).toEqual(2);
        expect(todoCheckboxInput[0]).toBeChecked();
        expect(todoCheckboxInput[1]).toBeChecked();
        // console.log('checkbox', screen.getAllByTestId('checkbox')[0].isEqualNode(screen.getAllByTestId('checkbox')[1]));
    });
    // TestFuture future: Bildunterschrift testen
    test.skip('BT4c: CopyImage', () => {
        renderBoardWithProviders({ localstore: localstore });
        predefinedBT4c(jest, localstore);
        let img = screen.getAllByTestId('imageComponentImage');
        expect(img[0]).toHaveAttribute('src', 'https://upload.wikimedia.org/wikipedia/commons/1/1c/RPTU_Logo.svg');
        expect(img[0]).toHaveStyle('transform: rotate(90deg);');
        // TODOMicha: BildUnterschrift testing
        openContextMenuOnComponent({ component: 'Bild' });
        pressContextMenuButton({ jest, expect, screen, buttonId: 'copyComponentButton' });
        openContextMenuWithPosition({ xCoordinate: 500, yCoordinate: 500 });
        pressContextMenuButton({ jest, expect, screen, buttonId: 'insertButton' });
        // test if the image is correctly copied
        img = screen.getAllByTestId('imageComponentImage');
        expect(img.length).toEqual(2);
        expect(img[0]).toHaveAttribute('src', 'https://upload.wikimedia.org/wikipedia/commons/1/1c/RPTU_Logo.svg');
        expect(img[1]).toHaveAttribute('src', 'https://upload.wikimedia.org/wikipedia/commons/1/1c/RPTU_Logo.svg');
        expect(img[0]).toHaveStyle('transform: rotate(90deg);');
        expect(img[1]).toHaveStyle('transform: rotate(90deg);');
        // TODOMicha: BildUnterschrift testen
        // deleting the copied component
        // open context menu
        openContextMenuOnComponent({ component: 'Bild', index: 1 });
        pressContextMenuButton({ jest, expect, screen, buttonId: 'removeComponentButton' });
        // fireEvent(screen.getAllByTestId('Bild')[1], contextMenuEvent);
        jest.runOnlyPendingTimers();
        // fireEvent.click(screen.queryAllByTestId('removeComponentButton')[1]);

        expect(screen.getAllByTestId('Bild').length).toEqual(1);
    });
    function checkSpreadsheet (screen, expect, numberOfSpreadsheets = 1) {
        let headerNumber = 0;
        for (let i = 0; i < numberOfSpreadsheets; i++) {
            const headers = screen.getAllByTestId('coll');
            const tabelle = screen.getAllByTestId('Tabelle');
            const c00 = screen.getAllByTestId('c00');
            const c01 = screen.getAllByTestId('c01');
            const c02 = screen.getAllByTestId('c02');
            const c10 = screen.getAllByTestId('c10');
            const c11 = screen.getAllByTestId('c11');
            const c12 = screen.getAllByTestId('c12');
            const c20 = screen.getAllByTestId('c20');
            const c21 = screen.getAllByTestId('c21');
            const c22 = screen.getAllByTestId('c22');
            // table 1
            expect(headers[headerNumber]).toHaveTextContent('Header 1');
            headerNumber++;
            expect(headers[headerNumber]).toHaveTextContent('Header 2');
            headerNumber++;
            expect(headers[headerNumber]).toHaveTextContent('Header 3');
            headerNumber++;
            expect(tabelle.length).toEqual(numberOfSpreadsheets);
            expect(c00[i]).toHaveTextContent('1');
            expect(c00[i].style._values.background).toEqual(colorMap.get(2));
            expect(c01[i]).toHaveTextContent('coloring');
            expect(c01[i].style._values.background).toEqual(colorMap.get(0));
            expect(c02[i]).toHaveTextContent('coloring');
            expect(c02[i].style._values.background).toEqual(colorMap.get(0));
            expect(c10[i]).toHaveTextContent('4.5');
            expect(c10[i].style._values.background).toEqual(colorMap.get(2));
            expect(c11[i]).toHaveTextContent('!farbig');
            expect(c11[i].style._values.background).toEqual(colorMap.get('default'));
            expect(c12[i]).toHaveTextContent('1');
            expect(c12[i].style._values.background).toEqual(colorMap.get('default'));
            expect(c20[i]).toHaveTextContent('8');
            expect(c20[i].style._values.background).toEqual(colorMap.get('default'));
            expect(c21[i]).toHaveTextContent('4');
            expect(c21[i].style._values.background).toEqual(colorMap.get('default'));
            expect(c22[i]).toHaveTextContent('32');
            expect(c22[i].style._values.background).toEqual(colorMap.get('default'));
        }
    }
    test.skip('BT4d: CopySpreadsheet', () => {
        renderBoardWithProviders({ localstore: localstore });
        jest.runOnlyPendingTimers();
        predefinedBT4d(jest, localstore);
        checkSpreadsheet(screen, expect);
        // copy the component
        openContextMenuOnComponent({ component: 'Tabelle' });
        pressContextMenuButton({ jest, expect, screen, buttonId: 'copyComponentButton' });
        openContextMenuWithPosition({ xCoordinate: 500, yCoordinate: 500 });
        pressContextMenuButton({ jest, expect, screen, buttonId: 'insertButton' });
        checkSpreadsheet(screen, expect, 2);
        // deleting the copied component
        // open context menu
        openContextMenuOnComponent({ component: 'Tabelle', index: 1 });
        pressContextMenuButton({ jest, expect, screen, buttonId: 'removeComponentButton' });
        expect(screen.getAllByTestId('Tabelle').length).toEqual(1);
    });

    test.skip('BT4e: CopyDiagram', () => {
        localstore = setupStore(copyDiagramPrelodestate);
        jest.runOnlyPendingTimers();

        /* crrating a board with some default exsisting components */
        renderBoardWithProviders({ localstore: localstore });
        jest.runOnlyPendingTimers();

        let diagram = screen.getByTestId('DiagramVisual');
        expect(diagram).toBeDefined();

        /* open context menu */
        const workArea = screen.getAllByTestId('workArea-skript-b1');
        userEvent.click(workArea[0]);
        // open context menu
        fireEvent.contextMenu(diagram);
        jest.runOnlyPendingTimers();
        const copyComponentButton = screen.getByTestId('copyComponentButton');
        // pressing 'Kopieren' button
        expect(copyComponentButton).not.toBeDisabled();
        fireEvent.click(copyComponentButton);
        jest.runOnlyPendingTimers();
        // context menu closed
        // open context menu
        /*
        selbstkreiertes Event um die Position des Klicks zu bestimmen ab dem Zeitpunkt wenn JSDOM 21 in Jest integriert wird ist das nicht
        mehr nötig uns es kann einfach userEvent.click(screen.queryByTestId('workArea-skript-b1'), { clientX: 700, clientY: 300, pageX: 0, pageY: 0 });
        verwendet werden
        */
        const initialClick = getMouseEvent('click', { clientX: 300, clientY: 700, pageX: 300, pageY: 700 });
        const MoauseMove = getMouseEvent('mousemove', { clientX: 500, clientY: 500, pageX: 500, pageY: 500 });
        const contextMenuEvent = getMouseEvent('contextmenu', { clientX: 500, clientY: 500, pageX: 500, pageY: 500 });
        fireEvent(screen.queryByTestId('workArea-skript-b1'), initialClick);
        fireEvent(screen.queryByTestId('workArea-skript-b1'), MoauseMove);
        fireEvent(screen.queryByTestId('workArea-skript-b1'), contextMenuEvent);
        jest.runOnlyPendingTimers();

        // pressing 'Einfügen' button
        expect(screen.getByTestId('insertButton')).not.toBeDisabled();
        fireEvent.click(screen.getByTestId('insertButton'));
        jest.runOnlyPendingTimers();
        /* einfügen Prozess abgeschlossen */
        // test if the diagram was correctly copied
        diagram = screen.getAllByTestId('DiagramVisual');
        expect(diagram[0].isEqualNode(diagram[1])).toBeTruthy();

        // deleting the copied component
        // open context menu
        fireEvent(screen.getAllByTestId('DiagramVisual')[1], contextMenuEvent);
        jest.runOnlyPendingTimers();
        // deleting the copied component
        fireEvent.click(screen.queryAllByTestId('removeComponentButton')[1]);
        jest.runOnlyPendingTimers();
        expect(screen.getAllByTestId('DiagramVisual').length).toEqual(1);
    });

    test.skip('BT4f: CopyMarkdown', () => {
        localstore = setupStore(copyMarkdownPrelodestate);
        jest.runOnlyPendingTimers();

        /* crrating a board with some default exsisting components */
        renderBoardWithProviders({ localstore: localstore });
        /* predefine a ToDoList with one item */
        jest.runOnlyPendingTimers();
        jest.runOnlyPendingTimers();
        let markdown = screen.getAllByTestId('Text');
        expect(markdown[0]).toHaveTextContent('Hallo. Ich bin ein MarkdownEditor.');
        let workArea = screen.getAllByTestId('workArea-skript-b1');
        userEvent.click(workArea[0]);
        fireEvent.contextMenu(screen.getAllByTestId('Text')[0]);
        jest.runOnlyPendingTimers();
        const copyComponentButton = screen.getByTestId('copyComponentButton');

        expect(copyComponentButton).not.toBeDisabled();
        fireEvent.click(copyComponentButton);
        jest.runOnlyPendingTimers();
        // const workArea = screen.getAllByTestId('workArea-skript-b1');

        // open context menu
        /*
        selbstkreiertes Event um die Position des Klicks zu bestimmen ab dem Zeitpunkt wenn JSDOM 21 in Jest integriert wird ist das nicht
        mehr nötig uns es kann einfach userEvent.click(screen.queryByTestId('workArea-skript-b1'), { clientX: 700, clientY: 300, pageX: 0, pageY: 0 });
        verwendet werden
        */
        const initialClick = getMouseEvent('click', { clientX: 300, clientY: 700, pageX: 300, pageY: 700 });
        const MoauseMove = getMouseEvent('mousemove', { clientX: 500, clientY: 500, pageX: 500, pageY: 500 });
        const contextMenuEvent = getMouseEvent('contextmenu', { clientX: 500, clientY: 500, pageX: 500, pageY: 500 });
        fireEvent(workArea[0], initialClick);
        fireEvent(workArea[0], MoauseMove);
        fireEvent(workArea[0], contextMenuEvent);
        jest.runOnlyPendingTimers();
        // kopieren
        const insertButton = screen.getByTestId('insertButton');
        fireEvent.click(insertButton);
        jest.runOnlyPendingTimers();

        workArea = screen.getAllByTestId('workArea-skript-b1');
        markdown = screen.getAllByTestId('Text');
        expect(markdown[0]).toHaveTextContent('Hallo. Ich bin ein MarkdownEditor.');
        expect(markdown[1]).toHaveTextContent('Hallo. Ich bin ein MarkdownEditor.');
        // deleting the copied component
        // open context menu
        fireEvent(screen.getAllByTestId('Text')[1], contextMenuEvent);
        jest.runOnlyPendingTimers();
        // deleting the copied component
        fireEvent.click(screen.queryAllByTestId('removeComponentButton')[1]);
        jest.runOnlyPendingTimers();
        expect(screen.getAllByTestId('Text').length).toEqual(1);
    });
});
describe('Movement, Scaling and Board Switching Tests', () => {
    test.skip('BT10 : switching between Tafel, Skript and Notizen and Board-Instanzen', () => {
        /* crrating a board with some default exsisting components */
        renderBoardWithProviders({ localstore: localstore });
        /* swtching between tafel, skript and notizen */
        // default is split board with skript and notizen
        expect(screen.getByTestId('workArea-skript-b1')).toBeInTheDocument();
        expect(screen.queryByTestId('workArea-tafel-b1-undefined')).toBeNull();
        expect(screen.queryByTestId('workArea-notizbuch-b1-111')).toBeInTheDocument();

        // switching to tafel
        userEvent.click(screen.getByTestId('switchToTafel'));
        jest.runOnlyPendingTimers();

        expect(screen.queryByTestId('workArea-skript-b1')).toBeNull();
        expect(screen.getByTestId('workArea-tafel-b1-undefined')).toBeInTheDocument();
        expect(screen.queryByTestId('workArea-notizbuch-b1-111')).toBeNull();

        // switching to notizen

        userEvent.click(screen.getByTestId('switchToNotizen'));
        jest.runOnlyPendingTimers();

        expect(screen.queryByTestId('workArea-skript-b1')).toBeNull();
        expect(screen.queryByTestId('workArea-tafel-b1-undefined')).toBeNull();
        expect(screen.getByTestId('workArea-notizbuch-b1-111')).toBeInTheDocument();

        // switching to skript
        userEvent.click(screen.getByTestId('switchToSkript'));
        jest.runOnlyPendingTimers();
        expect(screen.getByTestId('workArea-skript-b1')).toBeInTheDocument();
        expect(screen.queryByTestId('workArea-tafel-b1-undefined')).toBeNull();
        expect(screen.queryByTestId('workArea-notizbuch-b1-111')).toBeNull();

        /* split board test */
        // skript + Notizen
        userEvent.click(screen.getByTestId('splitBoardButton'));
        jest.runOnlyPendingTimers();
        expect(screen.getByTestId('workArea-skript-b1')).toBeInTheDocument();
        expect(screen.getByTestId('workArea-notizbuch-b1-111')).toBeInTheDocument();
        expect(screen.queryByTestId('workArea-tafel-b1-undefined')).toBeNull();
        // Tafel + Notizen
        userEvent.selectOptions(
            // Find the select element
            screen.getAllByTestId('boardSelection')[0],
            // Find and select the Tafel option
            screen.getAllByRole('option', { name: 'Tafel' })[0]
        );
        // screen.debug(undefined, 100000);
        expect(screen.queryByTestId('workArea-skript-b1')).toBeNull();
        expect(screen.queryByTestId('workArea-notizbuch-b1-111')).toBeInTheDocument();
        expect(screen.getByTestId('workArea-tafel-b1-undefined')).toBeInTheDocument();
        // Tafel + Skript
        userEvent.selectOptions(
            // Find the select element
            screen.getAllByTestId('boardSelection')[1],
            // Find and select the Skript option
            screen.getAllByRole('option', { name: 'Skript' })[1]
        );
        jest.runOnlyPendingTimers();
        expect(screen.getByTestId('workArea-skript-b1')).toBeInTheDocument();
        expect(screen.queryByTestId('workArea-notizbuch-b1-111')).toBeNull();
        expect(screen.getByTestId('workArea-tafel-b1-undefined')).toBeInTheDocument();
        // close split board
        userEvent.click(screen.getByTestId('switchToSkript'));
        jest.runOnlyPendingTimers();
        expect(screen.getByTestId('workArea-skript-b1')).toBeInTheDocument();
        expect(screen.queryByTestId('workArea-notizbuch-b1-111')).toBeNull();
        expect(screen.queryByTestId('workArea-tafel-b1-undefined')).toBeNull();

        /* switching between board instances aka experiments */
        // switching to experiment 2 B2
        userEvent.click(screen.getByTestId('experiment-selection-button'));
        jest.runOnlyPendingTimers();
        expect(screen.getByRole('menu')).toBeInTheDocument();
        // screen.debug(undefined, 100000);
        userEvent.click(screen.getByTestId('experiment-B2'));
        jest.runOnlyPendingTimers();
        expect(screen.getByTestId('workArea-skript-b2')).toBeInTheDocument();
    });
    test.skip('BT12 : scaling board', () => {
        renderBoardWithProviders({ localstore: localstore });
        predefinedBT5u6u7u8u12(jest, localstore);
        const { minusButton, plusButton } = getNeededBoardButtons(screen);
        const minusButtonScript = minusButton[0];
        const plusButtonScript = plusButton[0];
        expect(minusButtonScript).toBeInTheDocument();
        expect(plusButtonScript).toBeInTheDocument();
        fireEvent.click(plusButtonScript);
        jest.runOnlyPendingTimers();
        expect(screen.getAllByTestId('workComponent')[0].style.transform).toContain('scale(1.1)');
        expect(screen.getAllByTestId('workComponent')[1].style.transform).toContain('scale(1.1)');
        fireEvent.click(plusButtonScript);
        jest.runOnlyPendingTimers();
        expect(screen.getAllByTestId('workComponent')[0].style.transform).toContain('scale(1.20');
        expect(screen.getAllByTestId('workComponent')[1].style.transform).toContain('scale(1.20');
        fireEvent.click(minusButtonScript);
        jest.runOnlyPendingTimers();
        expect(screen.getAllByTestId('workComponent')[0].style.transform).toContain('scale(1.1)');
        expect(screen.getAllByTestId('workComponent')[1].style.transform).toContain('scale(1.1)');
        fireEvent.click(minusButtonScript);
        jest.runOnlyPendingTimers();
        expect(screen.getAllByTestId('workComponent')[0].style.transform).toContain('scale(1)');
        expect(screen.getAllByTestId('workComponent')[1].style.transform).toContain('scale(1)');
        fireEvent.click(minusButtonScript);
        jest.runOnlyPendingTimers();
        expect(screen.getAllByTestId('workComponent')[0].style.transform).toContain('scale(0.9)');
        expect(screen.getAllByTestId('workComponent')[1].style.transform).toContain('scale(0.9)');
    });
    test.skip('BT5 : resizing a component', async () => {
        renderBoardWithProviders({ localstore: localstore });
        predefinedBT5u6u7u8u12(jest, localstore);
        /* resizing a component */
        const workComponents = screen.getAllByTestId('workComponent');
        expect(workComponents.length).toEqual(2);
        expect(workComponents[0].id).toEqual('Markdown1');
        expect(workComponents[1].id).toEqual('Spreadsheet1');
        const seHandle = screen.getAllByTestId('workComponent')[0].getElementsByClassName('react-resizable-handle-se')[0];
        const noSeHandle = screen.getAllByTestId('workComponent')[1].getElementsByClassName('react-resizable-handle-se');
        expect(noSeHandle.length).toEqual(0);
        expect(screen.getAllByTestId('workComponent')[0].style.width).toEqual('200px');
        expect(screen.getAllByTestId('workComponent')[0].style.height).toEqual('200px');

        expect(screen.getAllByTestId('workComponent')[0].style.width);
        await drag(seHandle, { delta: { x: 100, y: 100 } });
        jest.runOnlyPendingTimers();
        expect(screen.getAllByTestId('workComponent').length).toEqual(2);
        expect(screen.getAllByTestId('workComponent')[0].style.width).toEqual('300px');
        expect(screen.getAllByTestId('workComponent')[0].style.height).toEqual('300px');
    });
    // TODOTest: Find a way to simulate Dragging
    test.skip('BT6 : Moving a component', async () => {
        renderBoardWithProviders({ localstore: localstore });
        predefinedBT5u6u7u8u12(jest, localstore);
        // basic position check
        expect(screen.getAllByTestId('workComponent')[0].style.transform).toContain('translate3d(200px, 300px');
        expect(screen.getAllByTestId('workComponent')[1].style.transform).toContain('translate3d(700px, 350px');
        const buttonGroup = screen.getByTestId('smallButtonGroup');
        expect(buttonGroup).toBeInTheDocument();
        // default mode is Schwenken
        let switchModeButton = buttonGroup.getElementsByTagName('button')[4];
        // console.log(switchModeButton.title);
        expect(switchModeButton.title).toEqual('Bewegen');
        fireEvent.click(switchModeButton);
        jest.runOnlyPendingTimers();
        // mode is now Bewegen
        switchModeButton = buttonGroup.getElementsByTagName('button')[4];
        // console.log(switchModeButton.title);
        expect(switchModeButton.title).toEqual('Schwenken');
        /* moving a component */
        userEvent.click(screen.getAllByTestId('workComponent')[0]);
        fireEvent.mouseDown(screen.getAllByTestId('workComponentCard')[0]);
        const mousemove = getMouseEvent('mousemove', { clientX: 100, clientY: 100, pageX: 100, pageY: 100 });
        fireEvent(screen.getAllByTestId('workComponentCard')[0], mousemove);
        const mouseup = getMouseEvent('mouseup', { clientX: 100, clientY: 100, pageX: 100, pageY: 100 });
        fireEvent(screen.getAllByTestId('workComponentCard')[0], mouseup);
        // await drag2(screen.getAllByTestId('workComponentCard')[0], { delta: { x: 100, y: 100 }, from: { x: 200, y: 300 } });
        // dragAndDrop(screen.getAllByTestId('workComponent')[0], screen.getAllByTestId('workComponent')[1]);
        jest.runOnlyPendingTimers();
        expect(screen.getAllByTestId('workComponent')[0].style.transform).toContain('translate3d(300px, 400px');
        expect(screen.getAllByTestId('workComponent')[1].style.transform).toContain('translate3d(700px, 350px');
    });
    test.skip('BT7 : Moving board around', async () => {
        renderBoardWithProviders({ localstore: localstore });
        predefinedBT5u6u7u8u12(jest, localstore);
        expect(screen.getAllByTestId('workComponent')[0].style.transform).toContain('translate3d(0px, 100px');
        expect(screen.getAllByTestId('workComponent')[1].style.transform).toContain('translate3d(0px, 300px');

        /* moving the board */
        userEvent.click(screen.getAllByTestId('workArea-skript-b1')[0]);
        await drag2(screen.getAllByTestId('workArea-skript-b1')[0], { delta: { x: 100, y: 100 }, from: { x: 500, y: 600 } });
        jest.runOnlyPendingTimers();
        expect(screen.getAllByTestId('workComponent')[0].style.transform).toContain('translate3d(95px, 195px');
        expect(screen.getAllByTestId('workComponent')[1].style.transform).toContain('translate3d(95px, 395px');
    });
});
describe('Special Encountered Bugs', () => {
    test('Opening a editView while other component are on a board', () => {
    });
});
