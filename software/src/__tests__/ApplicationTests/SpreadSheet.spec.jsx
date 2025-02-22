import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupStore } from '../../model/app/store';
import { contextManager, getRandomInt, renderSpreadSheetWithProviders, colorMap, genRanHex, writeIntoCell } from '../../services/test-utils';
import { cleanUpProviderCollection, initDocument } from '../../services/collectionprovider';
import {
    editCellDispatcher,
    addCellHighlightFormatRuleDispatcher,
    se1Dispatches,
    predefinedST1,
    predefinedST2,
    predefinedST5u6,
    predefinedST8,
    predefinedST9,
    predefinedST11,
    predefinedST12,
    predefinedST7aucud,
    predefinedST7bue,
    predefinedST3u4u10
} from '../../test_services/predefineStates/SpreadSheetPredefined';

let localstore;
// set the environment variables because they are not set in the cdci environment
process.env.REACT_APP_HOMEPAGE = '/hhyedz7ynlijlb26';
process.env.REACT_APP_SERVERPORT = ':10180';
beforeEach(() => {
    initDocument('13a');
    // clean localstore for each test
    process.env.APP_TEST = 'true';
    localstore = setupStore();
    jest.useFakeTimers();
});
afterEach(() => {
    // restore the spy created with spyOn
    jest.restoreAllMocks();
    // restore the Timers and clean all exsisting
    jest.useRealTimers();
    jest.clearAllTimers();
    // clean up the collection provider
    cleanUpProviderCollection();
});
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn()
}));

describe('Needed reducer Tests (try if you may get undefined errors)', () => {
    test('E1: store dispatch tests ', () => {
        se1Dispatches(jest, localstore);
        expect(localstore.getState().spreadsheets.entities.testSpreadsheet).toBeDefined();
        expect(localstore.getState().spreadsheets.entities.testSpreadsheet.spreadSheetObject.data.value.meta.columns.length).toEqual(2);
        expect(localstore.getState().spreadsheets.entities.testSpreadsheet.spreadSheetObject.data.value.meta.rows.length).toEqual(2);
        expect(localstore.getState().spreadsheets.entities.testSpreadsheet.spreadSheetObject.data.value.data[0][0].color).toEqual('#0000ff');
        expect(localstore.getState().spreadsheets.entities.testSpreadsheet.spreadSheetObject.data.value.data[0][0].value).toEqual('coloring');
        expect(localstore.getState().spreadsheets.entities.testSpreadsheet.spreadSheetObject.data.value.headers[0]).toEqual('Column0');
        let key = Object.keys(localstore.getState().spreadsheets.entities.testSpreadsheet.spreadSheetObject.data.value.cellHighlightFormatRules)[0];
        expect(localstore.getState().spreadsheets.entities.testSpreadsheet.spreadSheetObject.data.value.cellHighlightFormatRules[key].cellMatchType).toEqual('Specific Text');
        expect(localstore.getState().spreadsheets.entities.testSpreadsheet.spreadSheetObject.data.value.cellHighlightFormatRules[key].cellRangeSelectionType).toEqual('Entire Spreadsheet');
        expect(localstore.getState().spreadsheets.entities.testSpreadsheet.spreadSheetObject.data.value.cellHighlightFormatRules[key].color).toEqual('#ff0000');
        expect(localstore.getState().spreadsheets.entities.testSpreadsheet.spreadSheetObject.data.value.cellHighlightFormatRules[key].selectedRange).toEqual({});
        expect(localstore.getState().spreadsheets.entities.testSpreadsheet.spreadSheetObject.data.value.cellHighlightFormatRules[key].matchCellValueRange).toEqual({});
        expect(localstore.getState().spreadsheets.entities.testSpreadsheet.spreadSheetObject.data.value.cellHighlightFormatRules[key].matchCellText).toEqual('coloring');
        /* differnet type of rule Dispatch */
        addCellHighlightFormatRuleDispatcher({ jest: jest, localstore: localstore, docId: 'testSpreadsheet', cellMatchType: 'Cell Value', cellRangeSelectionType: 'Selected Range', color: '#ff0000', selectedRange: { 0: { 0: true }, 1: { 0: true } }, matchCellValueRange: ['1', '5'], matchCellText: '' });
        // addCellHighlightFormatRuleDispatcher(jest, localstore, 'testSpreadsheet', 'Cell Value', 'Selected Range', '#ff0000', { 0: { 0: true }, 1: { 0: true } }, ['1', '5'], '');
        /* */
        key = Object.keys(localstore.getState().spreadsheets.entities.testSpreadsheet.spreadSheetObject.data.value.cellHighlightFormatRules)[1];
        expect(localstore.getState().spreadsheets.entities.testSpreadsheet.spreadSheetObject.data.value.cellHighlightFormatRules[key].cellMatchType).toEqual('Cell Value');
        expect(localstore.getState().spreadsheets.entities.testSpreadsheet.spreadSheetObject.data.value.cellHighlightFormatRules[key].cellRangeSelectionType).toEqual('Selected Range');
        expect(localstore.getState().spreadsheets.entities.testSpreadsheet.spreadSheetObject.data.value.cellHighlightFormatRules[key].color).toEqual('#ff0000');
        expect(localstore.getState().spreadsheets.entities.testSpreadsheet.spreadSheetObject.data.value.cellHighlightFormatRules[key].selectedRange).toEqual({ 0: { 0: true }, 1: { 0: true } });
        expect(localstore.getState().spreadsheets.entities.testSpreadsheet.spreadSheetObject.data.value.cellHighlightFormatRules[key].matchCellValueRange).toEqual(['1', '5']);
        expect(localstore.getState().spreadsheets.entities.testSpreadsheet.spreadSheetObject.data.value.cellHighlightFormatRules[key].matchCellText).toEqual('');
    });
});
describe('Testing adding and removing Rows/Columns, cell values and header naming: ', () => {
    test('ST1: Spreadsheet renders initial, add rows and columns arbitrarily', () => {
        predefinedST1(jest, localstore);
        renderSpreadSheetWithProviders({ localstore: localstore, contextManager: contextManager });
        const c00 = screen.getByTestId('c00');
        expect(c00).toBeInTheDocument();
        let headers = screen.getAllByTestId('coll');
        expect(headers[0]).toHaveTextContent('XYZ');
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBe(6);
        // hinzufügen einer Reihe und einer Spalte am Ende des Spreadsheets
        const rowAddButton = screen.getAllByTestId('plusRow')[0];
        const colAddButton = screen.getAllByTestId('plusCol')[0];
        userEvent.click(rowAddButton);
        jest.runOnlyPendingTimers();
        userEvent.click(colAddButton);
        jest.runOnlyPendingTimers();
        // are the rows added?
        const c10 = screen.getByTestId('c10');
        const c11 = screen.getByTestId('c11');
        const c01 = screen.getByTestId('c01');
        // do they have the right headers?
        headers = screen.getAllByTestId('coll');
        expect(headers[0]).toHaveTextContent('XYZ');
        expect(headers[1]).toHaveTextContent('XYZ');
        /* necessary Ttexts dispatsching */
        editCellDispatcher({ jest: jest, localstore: localstore, row: 1, column: 1, value: 'Zelle11' });
        /* */
        // double click on c00 to activate the DataEditor
        userEvent.dblClick(c11);
        jest.runOnlyPendingTimers();

        expect(c00).toHaveTextContent('Zelle00');
        expect(c01).toHaveTextContent('');
        expect(c10).toHaveTextContent('');
        expect(c11).toHaveTextContent('Zelle11');
        const rowButton = screen.getAllByTestId('row');
        const colButton = screen.getAllByTestId('col1');
        // adding a column infront of the active cell c01
        userEvent.click(colButton[0]);
        jest.runOnlyPendingTimers();

        const c12 = screen.getByTestId('c12');
        expect(c01).toHaveTextContent('');
        expect(c12).toHaveTextContent('Zelle11');
        // do they have the right headers?
        headers = screen.getAllByTestId('coll');
        expect(headers[0]).toHaveTextContent('XYZ');
        expect(headers[1]).toHaveTextContent('XYZ');
        expect(headers[2]).toHaveTextContent('XYZ');

        // adding a row infront of the active cell
        userEvent.click(rowButton[0]);
        jest.runOnlyPendingTimers();

        expect(c00).toHaveTextContent('Zelle00');
        expect(c01).toHaveTextContent('');
        expect(screen.getByTestId('c02')).toHaveTextContent('');
        expect(c11).toHaveTextContent('');
        expect(c12).toHaveTextContent('');
        expect(screen.getByTestId('c20')).toHaveTextContent('');
        expect(screen.getByTestId('c21')).toHaveTextContent('');
        expect(screen.getByTestId('c22')).toHaveTextContent('Zelle11');
    });
    test('ST2: Cell movement tests', () => {
        predefinedST2(jest, localstore);
        renderSpreadSheetWithProviders({ localstore: localstore, contextManager: contextManager });
        const spreadsheet = screen.getByTestId('Tabelle');
        const c00 = screen.getByTestId('c00');
        const c01 = screen.getByTestId('c01');
        const c10 = screen.getByTestId('c10');
        const c11 = screen.getByTestId('c11');
        userEvent.click(c00);
        // testing arrow keys
        fireEvent.keyDown(spreadsheet, { key: 'ArrowRight', keyCode: 39 });
        userEvent.click(c01);
        expect(screen.getByTestId('activeEditCell').value).toEqual('c01');

        userEvent.click(c00);
        fireEvent.keyDown(spreadsheet, { key: 'ArrowDown', keyCode: 40 });
        userEvent.click(c10);
        expect(screen.getByTestId('activeEditCell').value).toEqual('c10');

        userEvent.click(c11);
        fireEvent.keyDown(spreadsheet, { key: 'ArrowLeft', keyCode: 37 });
        userEvent.click(c10);
        expect(screen.getByTestId('activeEditCell').value).toEqual('c10');

        userEvent.click(c11);
        fireEvent.keyDown(spreadsheet, { key: 'ArrowUp', keyCode: 38 });
        userEvent.click(c01);
        expect(screen.getByTestId('activeEditCell').value).toEqual('c01');

        // testing Enter key active-cell-mode change and acts like tab key while in edit mode
        userEvent.click(c00);
        expect(screen.getByTestId('active-cell-mode').classList.contains('view')).toEqual(true);
        userEvent.click(c00);
        expect(screen.getByTestId('active-cell-mode').classList.contains('edit')).toEqual(true);
        expect(screen.getByTestId('activeEditCell').value).toEqual('c00');

        // testing tab key in view and edit mode
        userEvent.click(c10);
        expect(screen.getByTestId('active-cell-mode').classList.contains('view')).toEqual(true);
        fireEvent.keyDown(spreadsheet, { key: 'Tab', code: 'Tab' });
        userEvent.click(c11);
        expect(screen.getByTestId('activeEditCell').value).toEqual('c11');

        userEvent.dblClick(c00);
        expect(screen.getByTestId('active-cell-mode').classList.contains('edit')).toEqual(true);
        fireEvent.keyDown(spreadsheet, { key: 'Tab', code: 'Tab' });
        expect(screen.getByTestId('active-cell-mode').classList.contains('view')).toEqual(true);
        userEvent.click(c01);
        expect(screen.getByTestId('activeEditCell').value).toEqual('c01');

        // testing backspace key
        userEvent.click(c00);
        fireEvent.keyDown(spreadsheet, { key: 'Backspace', code: 'Backspace' });
        userEvent.click(c00);
        expect(screen.getByTestId('activeEditCell').value).toEqual('');

        // testing Escape key
        userEvent.dblClick(c11);
        expect(screen.getByTestId('active-cell-mode').classList.contains('edit')).toEqual(true);
        fireEvent.keyDown(spreadsheet, { key: 'Escape', code: 'Escape' });
        expect(screen.getByTestId('active-cell-mode').classList.contains('view')).toEqual(true);
        fireEvent.keyDown(spreadsheet, { key: 'Escape', code: 'Escape' });
        expect(screen.queryByTestId('active-cell-mode')).toBeNull();
    });
    test('ST3 arbitrarily adding strings or numbers', () => {
        const valueMap = new Map();
        predefinedST3u4u10(jest, localstore);
        // stores the random numbers/strings
        renderSpreadSheetWithProviders({ localstore: localstore, contextManager: contextManager });
        const c00 = screen.getByTestId('c00');
        const c10 = screen.getByTestId('c10');
        userEvent.click(c00);
        // testing if a alphabetic keypress changes the active cell mode
        expect(screen.getByTestId('active-cell-mode').classList.contains('view')).toBe(true);
        fireEvent.keyPress(c00, { key: 'e', code: 'KeyE', charCode: 101 });
        expect(screen.getByTestId('active-cell-mode').classList.contains('edit')).toBe(true);
        /* random Strings in c00 c11 */
        valueMap.set(c00, genRanHex(10));
        /* random numeric values in c01, c10 */
        valueMap.set(c10, 2.6);

        valueMap.forEach((value, cell, _) => {
            writeIntoCell(screen, jest, expect, cell, value.toString());
        });

        expect(c00).toHaveTextContent(valueMap.get(c00).toString());
        expect(c00.style.textAlign).toEqual('left');
        expect(c10).toHaveTextContent(valueMap.get(c10).toString());
        expect(c10.style.textAlign).toEqual('right');
        valueMap.set(c10, '2,6');

        valueMap.forEach((value, cell, _) => {
            writeIntoCell(screen, jest, expect, cell, value.toString(), true);
        });

        expect(c00).toHaveTextContent(valueMap.get(c00).toString());
        expect(c00.style.textAlign).toEqual('left');
        expect(c10).toHaveTextContent(valueMap.get(c10).toString());
        expect(c10.style.textAlign).toEqual('left');
    });
    /* TODOtest ST4: Testing if the wanted range is selected right now only that something is selected ist tested and arrow key select does not work in tests but in the app */
    test.skip('ST4: Range Select', async () => {
        predefinedST3u4u10(jest, localstore);
        renderSpreadSheetWithProviders({ localstore: localstore, contextManager: contextManager });

        const c00 = screen.getByTestId('c00');
        const c11 = screen.getByTestId('c11');
        expect(document.getElementsByClassName('FloatingRect hidden selected').length).toEqual(1);
        expect(document.getElementsByClassName('FloatingRect selected')[0].style.width).toEqual('0px');
        // expect(document.getElementsByClassName('FloatingRect selected')[0].style.height).toEqual('0px');

        /* activating c00 */
        userEvent.click(c00);

        expect(document.getElementsByClassName('FloatingRect hidden selected').length).toEqual(1);
        expect(document.getElementsByClassName('FloatingRect selected')[0].style.width).toEqual('84px');
        // expect(document.getElementsByClassName('FloatingRect selected')[0].style.height).toEqual('29px');

        /* selecting c00,c10,c10,c11 */
        userEvent.click(c11, { shiftKey: true });

        expect(document.getElementsByClassName('FloatingRect hidden selected').length).toEqual(0);
        // expect(document.getElementsByClassName('FloatingRect selected')[0].style.width).toEqual('168px');
        // expect(document.getElementsByClassName('FloatingRect selected')[0].style.height).toEqual('58px');

        // resetting the selection and testing right and down
        // userEvent.click(c00);
        userEvent.keyboard('{Escape}');
        expect(document.getElementsByClassName('FloatingRect hidden selected').length).toEqual(1);
        // expect(document.getElementsByClassName('FloatingRect selected')[0].style.width).toEqual('84px');
        // expect(document.getElementsByClassName('FloatingRect selected')[0].style.height).toEqual('29px');

        /* selecting c00,c10,c10,c11 */
        console.log('test');
        await userEvent.type(c00, '{Shift>}{arrowright}{arrowdown}{/Shift}');
        // userEvent.keyboard('{Shift>}{arrowright}{arrowdown}{/Shift}');
        expect(document.getElementsByClassName('FloatingRect hidden selected').length).toEqual(0);
        expect(document.getElementsByClassName('FloatingRect selected').length).toEqual(1);
        // expect(document.getElementsByClassName('FloatingRect selected')[0].style.width).toEqual('168px');
        // expect(document.getElementsByClassName('FloatingRect selected')[0].style.height).toEqual('58px');

        // resetting the selection and left right and up
        userEvent.click(c11);
        expect(document.getElementsByClassName('FloatingRect hidden selected').length).toEqual(1);
        // expect(document.getElementsByClassName('FloatingRect selected')[0].style.width).toEqual('84px');
        // expect(document.getElementsByClassName('FloatingRect selected')[0].style.height).toEqual('29px');

        /* selecting c00,c10,c10,c11 */
        userEvent.keyboard('{Shift>}{arrowright}{/Shift}');
        expect(document.getElementsByClassName('FloatingRect hidden selected').length).toEqual(0);
        // expect(document.getElementsByClassName('FloatingRect selected')[0].style.width).toEqual('168px');
        // expect(document.getElementsBy ClassName('FloatingRect selected')[0].style.height).toEqual('58px');
    });
    test('ST10: manual Header Change', async () => {
        predefinedST3u4u10(jest, localstore);
        renderSpreadSheetWithProviders({ localstore: localstore, contextManager: contextManager });
        const headers = screen.getAllByTestId('coll');
        expect(headers[0]).toHaveTextContent('XYZ');
        // window.propmpt returns empty string when nothing is enteres and the user presses ok
        // user just presses ok without entering a new header
        jest.spyOn(window, 'prompt').mockImplementation(() => '');
        userEvent.click(headers[0]);
        expect(headers[0]).toHaveTextContent('XYZ');
        // change the value of the header of column A to "header X"
        jest.spyOn(window, 'prompt').mockImplementation(() => 'header X');
        userEvent.click(headers[0]);
        expect(headers[0]).toHaveTextContent('header X');
        expect(headers[1]).toHaveTextContent('XYZ');
    });
    test('ST11: delete rows and columns arbitrarily', async () => {
        predefinedST11(jest, localstore);
        renderSpreadSheetWithProviders({ localstore: localstore, contextManager: contextManager });
        const buttons = screen.getAllByRole('button');
        // thest the case when you cancel the row/column deletion
        jest.spyOn(window, 'confirm').mockImplementation(() => false);
        // column
        userEvent.click(buttons[3]);
        jest.runOnlyPendingTimers();
        expect(screen.queryByTestId('c03')).toBeDefined();
        expect(screen.queryByTestId('c13')).toBeDefined();
        expect(screen.queryByTestId('c23')).toBeDefined();
        expect(screen.queryByTestId('c33')).toBeDefined();
        // row
        userEvent.click(buttons[2]);
        jest.runOnlyPendingTimers();
        expect(screen.queryByTestId('c30')).toBeDefined();
        expect(screen.queryByTestId('c31')).toBeDefined();
        expect(screen.queryByTestId('c32')).toBeDefined();
        expect(screen.queryByTestId('c33')).toBeDefined();

        jest.spyOn(window, 'confirm').mockImplementation(() => true);
        // deleting last Column
        userEvent.click(buttons[3]);
        jest.runOnlyPendingTimers();
        expect(screen.queryByTestId('c03')).toBeNull();
        expect(screen.queryByTestId('c13')).toBeNull();
        expect(screen.queryByTestId('c23')).toBeNull();
        expect(screen.queryByTestId('c33')).toBeNull();

        expect(screen.getByTestId('c00')).toHaveTextContent('ColumnRow0');
        expect(screen.getByTestId('c01')).toHaveTextContent('Column1');
        expect(screen.getByTestId('c02')).toHaveTextContent('Column2');
        expect(screen.getByTestId('c10')).toHaveTextContent('Row1');
        expect(screen.getByTestId('c20')).toHaveTextContent('Row2');
        expect(screen.getByTestId('c30')).toHaveTextContent('Row3');

        // deleting last Row
        userEvent.click(buttons[2]);
        jest.runOnlyPendingTimers();
        expect(screen.queryByTestId('c30')).toBeNull();
        expect(screen.queryByTestId('c31')).toBeNull();
        expect(screen.queryByTestId('c32')).toBeNull();

        expect(screen.getByTestId('c00')).toHaveTextContent('ColumnRow0');
        expect(screen.getByTestId('c01')).toHaveTextContent('Column1');
        expect(screen.getByTestId('c02')).toHaveTextContent('Column2');
        expect(screen.getByTestId('c10')).toHaveTextContent('Row1');
        expect(screen.getByTestId('c20')).toHaveTextContent('Row2');

        // delete Column1 active cell 01
        userEvent.click(screen.getByTestId('c01'));
        userEvent.click(buttons[3]);
        jest.runOnlyPendingTimers();
        expect(screen.queryByTestId('c02')).toBeNull();
        expect(screen.queryByTestId('c12')).toBeNull();
        expect(screen.queryByTestId('c22')).toBeNull();

        expect(screen.getByTestId('c00')).toHaveTextContent('ColumnRow0');
        expect(screen.getByTestId('c01')).toHaveTextContent('Column2');
        expect(screen.getByTestId('c10')).toHaveTextContent('Row1');
        expect(screen.getByTestId('c20')).toHaveTextContent('Row2');

        // delete Row1 active cell 10
        userEvent.click(screen.getByTestId('c10'));
        userEvent.click(buttons[2]);
        jest.runOnlyPendingTimers();
        expect(screen.queryByTestId('c02')).toBeNull();
        expect(screen.queryByTestId('c12')).toBeNull();
        expect(screen.queryByTestId('c22')).toBeNull();

        expect(screen.getByTestId('c00')).toHaveTextContent('ColumnRow0');
        expect(screen.getByTestId('c01')).toHaveTextContent('Column2');
        expect(screen.getByTestId('c10')).toHaveTextContent('Row2');
    });
});
describe('coloring and rules tests:', () => {
    test('ST7a:  S3A6 rule (completeSpreadsheet and specific Text)', async () => {
        predefinedST7aucud(jest, localstore);
        renderSpreadSheetWithProviders({ localstore: localstore, contextManager: contextManager });

        const c00 = screen.getByTestId('c00');
        const c10 = screen.getByTestId('c10');
        const c01 = screen.getByTestId('c01');
        const c11 = screen.getByTestId('c11');
        const buttons = screen.getAllByRole('button');

        expect(screen.queryByTestId('colorRulesPopover')).toBeNull();
        expect(screen.queryByTestId('colorPopOver')).toBeNull();

        userEvent.click(buttons[5]);
        jest.runOnlyPendingTimers();
        // Range Rule Pop up opened
        expect(screen.getByTestId('colorRulesPopover')).toBeDefined();
        // color Popover should not be opened
        expect(screen.queryByTestId('colorPopOver')).toBeNull();

        const rangeSelect = screen.getByTestId('rangeSelect');
        const typeSelect = screen.getByTestId('typeSelect');
        const confirmButton = screen.getByTestId('confirmButton');
        const closeButton = screen.getByTestId('schliessen');
        const openPalett = screen.getByTestId('colorOpen');

        expect(confirmButton).toBeDisabled();

        // select entire Spreacsheet and Specific Text
        fireEvent.change(rangeSelect, { target: { value: 'Entire Spreadsheet' } });
        fireEvent.change(typeSelect, { target: { value: 'Specific Text' } });

        // openedColorPalette
        userEvent.click(openPalett);
        expect(screen.getByTestId('colorPopOver')).toBeDefined();
        const colorButton = screen.getAllByTestId('colorbutton');
        const colorConfirmButton = screen.getAllByRole('button', { name: 'Bestätigen' });

        // choose red
        userEvent.click(colorButton[0]);

        // confirm
        userEvent.click(colorConfirmButton[0]);
        jest.runOnlyPendingTimers();
        expect(screen.queryByTestId('colorPopOver')).toBeNull();

        // write 'coloring' in the specific text
        const textfield = screen.getByRole('textbox');
        userEvent.type(textfield, 'coloring');

        expect(confirmButton).not.toBeDisabled();

        userEvent.click(confirmButton);

        /* testing display of the rule */
        expect(screen.getByTestId('ruleMatchType')).toHaveTextContent('coloring');
        expect(screen.getByTestId('ruleColorShow')).toBeDefined();
        expect(screen.getByTestId('ruleRangeSelection')).toHaveTextContent('Entire Spreadsheet');

        fireEvent.click(closeButton);
        jest.runOnlyPendingTimers();
        expect(screen.queryByTestId('colorRulesPopover')).toBeNull();
        expect(c00.style._values.background).toEqual(colorMap.get('default'));
        expect(c10.style._values.background).toEqual(colorMap.get(0));
        expect(c11.style._values.background).toEqual(colorMap.get('default'));
        expect(c01.style._values.background).toEqual(colorMap.get(0));
    });
    test('ST7b:  S3A6 rule (completeSpreadsheet and cellValue)', async () => {
        predefinedST7bue(jest, localstore);
        renderSpreadSheetWithProviders({ localstore: localstore, contextManager: contextManager });

        const c00 = screen.getByTestId('c00');
        const c01 = screen.getByTestId('c01');
        const c10 = screen.getByTestId('c10');
        const c11 = screen.getByTestId('c11');
        const buttons = screen.getAllByRole('button');

        expect(screen.queryByTestId('colorRulesPopover')).toBeNull();
        expect(screen.queryByTestId('colorPopOver')).toBeNull();

        userEvent.click(buttons[5]);
        jest.runOnlyPendingTimers();

        expect(screen.getByTestId('colorRulesPopover')).toBeDefined();
        expect(screen.queryByTestId('colorPopOver')).toBeNull();

        /* Range Rule Pop up opened */
        const typeSelect = screen.getByTestId('typeSelect');
        const rangeSelect = screen.getByTestId('rangeSelect');
        const confirmButton = screen.getByTestId('confirmButton');
        const closeButton = screen.getByTestId('schliessen');
        const openPalett = screen.getByTestId('colorOpen');

        expect(confirmButton).toBeDisabled();

        fireEvent.change(rangeSelect, { target: { value: 'Entire Spreadsheet' } });
        fireEvent.change(typeSelect, { target: { value: 'Range Select' } });

        // openedColorPalette
        userEvent.click(openPalett);
        expect(screen.getByTestId('colorPopOver')).toBeDefined();
        const colorButton = screen.getAllByTestId('colorbutton');
        const colorConfirmButton = screen.getAllByRole('button', { name: 'Bestätigen' });
        // choose red
        userEvent.click(colorButton[0]);
        // confirm
        userEvent.click(colorConfirmButton[0]);
        jest.runOnlyPendingTimers();
        expect(screen.queryByTestId('colorPopOver')).toBeNull();

        const lowerBound = screen.getByTestId('valueLowerBound');
        const upperBound = screen.getByTestId('valueUpperBound');
        userEvent.type(lowerBound, '1');
        userEvent.type(upperBound, '5');
        expect(confirmButton).not.toBeDisabled();

        userEvent.click(confirmButton);
        // rule display
        const ruleMatchType = screen.getAllByTestId('ruleMatchType');
        const ruleColorShow = screen.getAllByTestId('ruleColorShow');
        const ruleRangeSelection = screen.getAllByTestId('ruleRangeSelection');

        expect(ruleMatchType[0]).toHaveTextContent('1 ≤ Wert ≤ 5');
        expect(ruleColorShow[0]).toBeDefined();
        expect(ruleRangeSelection[0]).toHaveTextContent('Entire Spreadsheet');

        userEvent.click(closeButton);
        jest.runOnlyPendingTimers();
        expect(screen.queryByTestId('colorRulesPopover')).toBeNull();

        // up until now only c11 should be colored red
        expect(c00.style._values.background).toEqual(colorMap.get(0));
        expect(c01.style._values.background).toEqual(colorMap.get('default'));
        expect(c10.style._values.background).toEqual(colorMap.get('default'));
        expect(c11.style._values.background).toEqual(colorMap.get(0));
    });
    test.skip('ST7d:  S3A6 rule (rangeSelect - "shift-klick" and specific Text)', async () => {
        predefinedST7aucud(jest, localstore);
        renderSpreadSheetWithProviders({ localstore: localstore, contextManager: contextManager });

        const c00 = screen.getByTestId('c00');
        const c01 = screen.getByTestId('c01');
        const c10 = screen.getByTestId('c10');
        const c11 = screen.getByTestId('c11');
        const buttons = screen.getAllByRole('button');

        expect(screen.queryByTestId('colorRulesPopover')).toBeNull();
        expect(screen.queryByTestId('colorPopOver')).toBeNull();

        /* activating c00 */
        userEvent.click(c00);
        /* selecting c00,c10 */
        userEvent.click(c10, { shiftKey: true });
        // openHighlightRule
        userEvent.click(buttons[5], { shiftKey: true });
        jest.runOnlyPendingTimers();
        expect(screen.queryByTestId('colorRulesPopover')).toBeDefined();
        expect(screen.queryByTestId('colorPopOver')).toBeNull();

        // Range Rule Pop up opened
        const rangeSelect = screen.getByTestId('rangeSelect');
        const typeSelect = screen.getByTestId('typeSelect');
        const confirmButton = screen.getByTestId('confirmButton');
        const closeButton = screen.getByTestId('schliessen');
        const openPalett = screen.getByTestId('colorOpen');

        expect(confirmButton).toBeDisabled();

        // select entire Spreacsheet and Specific Text
        fireEvent.change(rangeSelect, { target: { value: 'Selected Range' } });
        fireEvent.change(typeSelect, { target: { value: 'Specific Text' } });

        // openedColorPalette
        userEvent.click(openPalett);
        expect(screen.getByTestId('colorPopOver')).toBeDefined();
        const colorButton = screen.getAllByTestId('colorbutton');
        const colorConfirmButton = screen.getAllByRole('button', { name: 'Bestätigen' });

        // choose red
        userEvent.click(colorButton[0]);

        // confirm color
        userEvent.click(colorConfirmButton[0]);
        jest.runOnlyPendingTimers();
        expect(screen.queryByTestId('colorPopOver')).toBeNull();

        // write 'coloring' in the specific text
        const textfield = screen.getByRole('textbox');
        userEvent.type(textfield, 'coloring');
        // fireEvent.change(textfield, { target: { value: 'coloring' } });

        expect(confirmButton).not.toBeDisabled();
        // confirm rule
        userEvent.click(confirmButton);
        // test if rule is displayed
        const ruleMatchType = screen.getAllByTestId('ruleMatchType');
        const ruleColorShow = screen.getAllByTestId('ruleColorShow');
        const ruleRangeSelection = screen.getAllByTestId('ruleRangeSelection');
        expect(ruleMatchType[0]).toHaveTextContent('coloring');
        expect(ruleColorShow[0]).toBeDefined();
        expect(ruleRangeSelection[0]).toHaveTextContent('A1 - A2');
        userEvent.click(closeButton);
        jest.runOnlyPendingTimers();
        // in c00 and c11 is the string 'Zelle00' => coloring changed to red rgb(255,0,0)
        expect(c00.style._values.background).toEqual(colorMap.get('default'));
        expect(c10.style._values.background).toEqual(colorMap.get(0));
        expect(c11.style._values.background).toEqual(colorMap.get('default'));
        expect(c01.style._values.background).toEqual(colorMap.get('default'));
    });
    test('ST7c: rangeseelct with no selected cell', async () => {
        predefinedST7aucud(jest, localstore);
        renderSpreadSheetWithProviders({ localstore: localstore, contextManager: contextManager });
        const buttons = screen.getAllByRole('button');

        expect(screen.queryByTestId('colorRulesPopover')).toBeNull();
        expect(screen.queryByTestId('colorPopOver')).toBeNull();

        // openHighlightRule
        userEvent.click(buttons[5]);
        jest.runOnlyPendingTimers();
        expect(screen.queryByTestId('colorRulesPopover')).toBeDefined();
        expect(screen.queryByTestId('colorPopOver')).toBeNull();

        // Range Rule Pop up opened
        let rangeSelect = screen.getByTestId('rangeSelect');
        let typeSelect = screen.getByTestId('typeSelect');
        let confirmButton = screen.getByTestId('confirmButton');
        let closeButton = screen.getByTestId('schliessen');
        let openPalett = screen.getByTestId('colorOpen');

        expect(confirmButton).toBeDisabled();

        fireEvent.change(rangeSelect, { target: { value: 'Selected Range' } });
        fireEvent.change(typeSelect, { target: { value: 'Cell Value' } });

        // openedColorPalette
        userEvent.click(openPalett);
        expect(screen.getByTestId('colorPopOver')).toBeDefined();
        let colorButton = screen.getAllByTestId('colorbutton');
        let colorConfirmButton = screen.getAllByRole('button', { name: 'Bestätigen' });
        // choose red
        userEvent.click(colorButton[1]);
        // confirm
        userEvent.click(colorConfirmButton[0]);
        jest.runOnlyPendingTimers();
        expect(screen.queryByTestId('colorPopOver')).toBeNull();

        const lowerBound = screen.getByTestId('valueLowerBound');
        const upperBound = screen.getByTestId('valueUpperBound');

        userEvent.type(lowerBound, '1');
        userEvent.type(upperBound, '5');
        expect(confirmButton).toBeDisabled();
        // close HighlightRule
        userEvent.click(closeButton);
        jest.runOnlyPendingTimers();
        expect(screen.queryByTestId('colorRulesPopover')).toBeNull();

        userEvent.click(buttons[5]);
        jest.runOnlyPendingTimers();
        // Range Rule Pop up opened
        expect(screen.getByTestId('colorRulesPopover')).toBeDefined();
        // color Popover should not be opened
        expect(screen.queryByTestId('colorPopOver')).toBeNull();

        rangeSelect = screen.getByTestId('rangeSelect');
        typeSelect = screen.getByTestId('typeSelect');
        confirmButton = screen.getByTestId('confirmButton');
        closeButton = screen.getByTestId('schliessen');
        openPalett = screen.getByTestId('colorOpen');

        expect(confirmButton).toBeDisabled();

        // select entire Spreacsheet and Specific Text
        fireEvent.change(rangeSelect, { target: { value: 'Selected Range' } });
        fireEvent.change(typeSelect, { target: { value: 'Specific Text' } });

        // openedColorPalette
        fireEvent.click(openPalett);
        expect(screen.getByTestId('colorPopOver')).toBeDefined();
        colorButton = screen.getAllByTestId('colorbutton');
        colorConfirmButton = screen.getAllByRole('button', { name: 'Bestätigen' });

        // choose red
        fireEvent.click(colorButton[0]);

        // confirm
        fireEvent.click(colorConfirmButton[0]);
        jest.runOnlyPendingTimers();
        expect(screen.queryByTestId('colorPopOver')).toBeNull();

        // write 'coloring' in the specific text
        const textfield = screen.getByRole('textbox');
        userEvent.type(textfield, 'coloring');

        expect(confirmButton).toBeDisabled();
    });
    test.skip('ST7e: S3A6 rule (rangeSelect "shift-klick" and Cell Value)', async () => {
        predefinedST7bue(jest, localstore);
        renderSpreadSheetWithProviders({ localstore: localstore, contextManager: contextManager });

        const c00 = screen.getByTestId('c00');
        const c01 = screen.getByTestId('c01');
        const c10 = screen.getByTestId('c10');
        const c11 = screen.getByTestId('c11');
        const buttons = screen.getAllByRole('button');

        expect(screen.queryByTestId('colorRulesPopover')).toBeNull();
        expect(screen.queryByTestId('colorPopOver')).toBeNull();

        /* activating c00 */
        userEvent.click(c00);
        /* selecting c00,c10 */
        jest.runOnlyPendingTimers();
        userEvent.click(c10, { shiftKey: true });
        jest.runOnlyPendingTimers();
        // openHighlightRule

        userEvent.click(buttons[5]);
        jest.runOnlyPendingTimers();

        expect(screen.getByTestId('colorRulesPopover')).toBeDefined();
        expect(screen.queryByTestId('colorPopOver')).toBeNull();

        /* Range Rule Pop up opened */
        const typeSelect = screen.getByTestId('typeSelect');
        const rangeSelect = screen.getByTestId('rangeSelect');
        const confirmButton = screen.getByTestId('confirmButton');
        const closeButton = screen.getByTestId('schliessen');
        const openPalett = screen.getByTestId('colorOpen');

        expect(confirmButton).toBeDisabled();

        fireEvent.change(rangeSelect, { target: { value: 'Selected Range' } });
        fireEvent.change(typeSelect, { target: { value: 'Range Select' } });

        // openedColorPalette
        userEvent.click(openPalett);
        expect(screen.getByTestId('colorPopOver')).toBeDefined();
        const colorButton = screen.getAllByTestId('colorbutton');
        const colorConfirmButton = screen.getAllByRole('button', { name: 'Bestätigen' });
        // choose red
        userEvent.click(colorButton[1]);
        // confirm
        userEvent.click(colorConfirmButton[0]);
        jest.runOnlyPendingTimers();
        expect(screen.queryByTestId('colorPopOver')).toBeNull();

        const lowerBound = screen.getByTestId('valueLowerBound');
        const upperBound = screen.getByTestId('valueUpperBound');

        // fireEvent.change(lowerBound, { target: { value: '1' } });
        userEvent.type(lowerBound, '1');
        // fireEvent.change(upperBound, { target: { value: '5' } });
        userEvent.type(upperBound, '5');

        expect(confirmButton).not.toBeDisabled();

        userEvent.click(confirmButton);
        // rule display
        const ruleMatchType = screen.getAllByTestId('ruleMatchType');
        const ruleColorShow = screen.getAllByTestId('ruleColorShow');
        const ruleRangeSelection = screen.getAllByTestId('ruleRangeSelection');

        expect(ruleMatchType[0]).toHaveTextContent('1 ≤ Wert ≤ 5');
        expect(ruleColorShow[0]).toBeDefined();
        expect(ruleRangeSelection[0]).toHaveTextContent('A1 - A2');

        userEvent.click(closeButton);
        jest.runOnlyPendingTimers();
        expect(screen.queryByTestId('colorRulesPopover')).toBeNull();

        expect(c00.style._values.background).toEqual(colorMap.get(1));
        expect(c01.style._values.background).toEqual(colorMap.get('default'));
        expect(c10.style._values.background).toEqual(colorMap.get('default'));
        expect(c11.style._values.background).toEqual(colorMap.get('default'));
    });
    const cellsColor = [];
    test('ST9 : S3A5 arbitrary coloring of the cells, without conditions', async () => {
        predefinedST9(jest, localstore);
        renderSpreadSheetWithProviders({ localstore: localstore, contextManager: contextManager });
        const c00 = screen.getByTestId('c00');
        const buttons = screen.getAllByRole('button');
        const c10 = screen.getByTestId('c10');
        // check if the cell c00 is colored red by a rule
        expect(c00.style._values.background).toEqual(colorMap.get('default'));
        expect(c10.style._values.background).toEqual(colorMap.get(0));

        const cells = [c00, c10];

        let colorButton;
        let confirmButton;
        let cellColor;
        // color the cells c01,c10,c11 with random colors
        for (let i = 0; i < cells.length; i++) {
            userEvent.click(cells[i]);
            expect(screen.queryByTestId('colorPopOver')).toBeNull();
            userEvent.click(buttons[4]);
            jest.runOnlyPendingTimers();
            expect(screen.getByTestId('colorPopOver')).toBeDefined();
            colorButton = screen.getAllByTestId('colorbutton');
            confirmButton = screen.getAllByRole('button', { name: 'Bestätigen' });
            cellColor = getRandomInt(11);
            // default color aka white is overruled so we dont want to use it in the example
            if (cellColor === 10) {
                cellColor = 11;
            }
            cellsColor[i] = cellColor;
            userEvent.click(colorButton[cellColor]);
            userEvent.click(confirmButton[0]);
            jest.runOnlyPendingTimers();
            expect(screen.queryByTestId('colorPopOver')).toBeNull();
        }
        jest.runOnlyPendingTimers();
        expect(c00.style._values.background).toEqual(colorMap.get(cellsColor[0]));
        expect(c10.style._values.background).toEqual(colorMap.get(cellsColor[1]));

        // reset the coloring of the cells
        for (let i = 0; i < cells.length; i++) {
            userEvent.click(cells[i]);
            expect(screen.queryByTestId('colorPopOver')).toBeNull();
            userEvent.click(buttons[4]);
            jest.runOnlyPendingTimers();
            expect(screen.getByTestId('colorPopOver')).toBeDefined();
            colorButton = screen.getAllByTestId('colorbutton');
            confirmButton = screen.getAllByRole('button', { name: 'Bestätigen' });
            userEvent.click(colorButton[10]);
            userEvent.click(confirmButton[0]);
            jest.runOnlyPendingTimers();
            expect(screen.queryByTestId('colorPopOver')).toBeNull();
        }
        jest.runOnlyPendingTimers();
        // Regel coloring is still active
        expect(c10.style._values.background).toEqual(colorMap.get(0));
        expect(c00.style._values.background).toEqual(colorMap.get('default'));

        // range select and manual coloring
        userEvent.click(c00);
        userEvent.click(c10, { shiftKey: true });

        userEvent.click(buttons[4]);
        jest.runOnlyPendingTimers();
        expect(screen.getByTestId('colorPopOver')).toBeDefined();
        colorButton = screen.getAllByTestId('colorbutton');
        confirmButton = screen.getAllByRole('button', { name: 'Bestätigen' });
        cellColor = getRandomInt(11);
        // default color aka white is overruled so we dont want to use it in the example
        if (cellColor === 10) {
            cellColor = 11;
        }
        userEvent.click(colorButton[cellColor]);
        userEvent.click(confirmButton[0]);
        jest.runOnlyPendingTimers();
        expect(screen.queryByTestId('colorPopOver')).toBeNull();
        expect(c00.style._values.background).toEqual(colorMap.get(cellColor));
    });
    test('ST8 Deleting Rules ', () => {
        predefinedST8(jest, localstore);
        renderSpreadSheetWithProviders({ localstore: localstore, contextManager: contextManager });
        const c00 = screen.getByTestId('c00');
        const c10 = screen.getByTestId('c10');
        const c11 = screen.getByTestId('c11');
        const c01 = screen.getByTestId('c01');
        const buttons = screen.getAllByRole('button');

        expect(c00.style._values.background).toEqual(colorMap.get('default'));
        expect(c01.style._values.background).toEqual(colorMap.get(1));
        expect(c10.style._values.background).toEqual(colorMap.get(0));
        expect(c11.style._values.background).toEqual(colorMap.get(2));

        userEvent.click(buttons[5]);

        /* Range Rule Pop up opened */
        let deleteButtons = screen.getAllByTestId('deleteRule');

        expect(deleteButtons.length).toEqual(3);
        userEvent.click(deleteButtons[1]);

        expect(c00.style._values.background).toEqual(colorMap.get('default'));
        expect(c01.style._values.background).toEqual(colorMap.get(1));
        expect(c10.style._values.background).toEqual(colorMap.get('default'));
        expect(c11.style._values.background).toEqual(colorMap.get(2));

        deleteButtons = screen.getAllByTestId('deleteRule');
        expect(deleteButtons.length).toEqual(2);

        userEvent.click(deleteButtons[1]);

        expect(c00.style._values.background).toEqual(colorMap.get('default'));
        expect(c01.style._values.background).toEqual(colorMap.get(1));
        expect(c10.style._values.background).toEqual(colorMap.get('default'));
        expect(c11.style._values.background).toEqual(colorMap.get('default'));

        deleteButtons = screen.getAllByTestId('deleteRule');
        expect(deleteButtons.length).toEqual(1);
        userEvent.click(deleteButtons[0]);

        expect(c00.style._values.background).toEqual(colorMap.get('default'));
        expect(c01.style._values.background).toEqual(colorMap.get('default'));
        expect(c10.style._values.background).toEqual(colorMap.get('default'));
        expect(c11.style._values.background).toEqual(colorMap.get('default'));
    });
});
describe('Testing of the functions and cut,copy,paste', () => {
    test('ST12: formulars (examplary testing Min,Sum and not a formular)', async () => {
        predefinedST12(jest, localstore);
        renderSpreadSheetWithProviders({ localstore: localstore, contextManager: contextManager });
        /* test begin */
        const c01 = screen.getByTestId('c01');
        // exemplary testing of the formula interpretation using sum and min
        // Reference
        writeIntoCell(screen, jest, expect, c01, '=(A1)');
        expect(c01).toHaveTextContent('3');
        expect(c01.style.textAlign).toEqual('right');
        // sum
        writeIntoCell(screen, jest, expect, c01, '=sum(A1,A2,B2,1)', true);
        expect(c01).toHaveTextContent('39');
        expect(c01.style.textAlign).toEqual('right');

        // sum seperated with ':'
        writeIntoCell(screen, jest, expect, c01, '=sum(A2:B2)', true);
        expect(c01).toHaveTextContent('35');
        expect(c01.style.textAlign).toEqual('right');

        // Power function
        writeIntoCell(screen, jest, expect, c01, '=(1 + POWER(A1,2))', true);
        expect(c01).toHaveTextContent('10');
        expect(c01.style.textAlign).toEqual('right');

        // Error : #NAME?
        writeIntoCell(screen, jest, expect, c01, '=miiin(A1,A2,A3)', true);
        expect(c01).toHaveTextContent('#NAME');
        expect(c01.style.textAlign).toEqual('right');

        // Error : #ERROR!
        writeIntoCell(screen, jest, expect, c01, '=', true);
        expect(c01).toHaveTextContent('#ERROR!');
        expect(c01.style.textAlign).toEqual('right');
    });
    /* function is not implemented yet */
    test.skip('ST5: copy,paste', async () => {
        predefinedST5u6(jest, localstore);
        renderSpreadSheetWithProviders({ localstore: localstore, contextManager: contextManager });
        /* test begin */
        const spreadsheet = screen.getByTestId('Tabelle');
        const c00 = screen.getByTestId('c00');
        const c01 = screen.getByTestId('c01');
        const c10 = screen.getByTestId('c10');
        const c11 = screen.getByTestId('c11');
        expect(c00).toHaveTextContent('3');
        expect(c10).toHaveTextContent('abc');
        // copy and paste
        userEvent.click(c00);
        fireEvent.keyDown(spreadsheet, { key: 'ArrowDown', code: 'ArrowDown', charCode: 40, shiftKey: true });
        fireEvent.keyDown(spreadsheet, { key: 'c', keyCode: 67, ctrlKey: true }); // simulate the Ctrl+C key being pressed
        userEvent.click(c01);
        fireEvent.keyDown(spreadsheet, { key: 'v', keyCode: 86, ctrlKey: true }); // simulate the Ctrl+V key being pressed

        expect(c00).toHaveTextContent('3');
        expect(c10).toHaveTextContent('abc');
        expect(c01).toHaveTextContent('3');
        expect(c11).toHaveTextContent('abc');
    });
    /* function is not implemented yet */
    test.skip('ST6: cut,paste', async () => {
        predefinedST5u6(jest, localstore);
        renderSpreadSheetWithProviders({ localstore: localstore, contextManager: contextManager });
        /* test begin */
        const spreadsheet = screen.getByTestId('Tabelle');
        const c00 = screen.getByTestId('c00');
        const c01 = screen.getByTestId('c01');
        const c10 = screen.getByTestId('c10');
        const c11 = screen.getByTestId('c11');
        expect(c00).toHaveTextContent('3');
        expect(c10).toHaveTextContent('abc');
        // copy and paste
        userEvent.click(c00);
        fireEvent.keyDown(spreadsheet, { key: 'ArrowDown', code: 'ArrowDown', charCode: 40, shiftKey: true });
        fireEvent.keyDown(spreadsheet, { key: 'x', keyCode: 67, ctrlKey: true }); // simulate the Ctrl+x key being pressed
        userEvent.click(c01);
        fireEvent.keyDown(spreadsheet, { key: 'v', keyCode: 86, ctrlKey: true }); // simulate the Ctrl+V key being pressed

        expect(c00).toHaveTextContent('');
        expect(c10).toHaveTextContent('');
        expect(c01).toHaveTextContent('3');
        expect(c11).toHaveTextContent('abc');
    });
});
