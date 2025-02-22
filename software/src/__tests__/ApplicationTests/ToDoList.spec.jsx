import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupStore } from '../../model/app/store';
import { contextManager, renderToDoListWithProviders } from '../../services/test-utils';
import { cleanUpProviderCollection, initDocument } from '../../services/collectionprovider';
import { predefinedE1uTT2u3u4, predefinedTT1 } from '../../test_services/predefineStates/ToDoListPredefined';

let localstore;
// set the environment variables because they are not set in the cdci environment
process.env.REACT_APP_HOMEPAGE = '/hhyedz7ynlijlb26';
process.env.REACT_APP_SERVERPORT = ':10180';
beforeEach(() => {
    initDocument('13a');
    localstore = setupStore();
    process.env.APP_TEST = 'true';
    jest.useFakeTimers();
});
afterEach(() => {
    // restore the spy created with spyOn
    jest.restoreAllMocks();
    // cleans up the CollectionProvider
    cleanUpProviderCollection();
    jest.useRealTimers();
    jest.clearAllTimers();
});
describe('reducer Test (the ones needed for the other test cases : ', () => {
    test('E1: store dispatch loadTodoList, addItem ', () => {
        predefinedE1uTT2u3u4(jest, localstore);
        expect(localstore.getState().todolists.entities.testTodo).toBeDefined();
        expect(localstore.getState().todolists.entities.testTodo.todoListObject.data.value[0].text).toEqual('ToDo');
        expect(localstore.getState().todolists.entities.testTodo.todoListObject.data.value[0].checked).toEqual(false);
    });
});
describe('Initial rendering and adding todos ', () => {
    test('TT1: ToDoList renders without error and two todos added to the todolist ', () => {
        predefinedTT1(jest, localstore);
        // preset the state
        renderToDoListWithProviders({ localstore: localstore, contextManager: contextManager });
        // rendering without error
        const buttonAdd = screen.getByTestId('buttonAdd');
        // first todolist added
        userEvent.click(buttonAdd);
        jest.runOnlyPendingTimers();

        expect(screen.queryAllByTestId('buttonRemove').length).toBe(1);
        expect(screen.queryAllByRole('textbox')[0].value).toEqual('');
        expect(screen.queryAllByTestId('todoCheckboxInput')[0]).not.toBeChecked();
    });
});
describe('ckecked status and description of a todo', () => {
    test('TT2: S2A3,S2A4 changing of the ToDo description', () => {
        predefinedE1uTT2u3u4(jest, localstore);
        const { rerender } = renderToDoListWithProviders({ localstore: localstore, contextManager: contextManager });
        /* changing the description of specific a textfield */
        let textField0 = screen.queryAllByRole('textbox')[0];
        let textField1 = screen.queryAllByRole('textbox')[1];
        expect(textField0.value).toEqual('ToDo');
        expect(textField1.value).toEqual('');

        // wirting text into textField0 "ToDoUpdate" Enter to commit the Text
        userEvent.type(textField0, 'Update{enter}');
        expect(textField0.value).toEqual('ToDoUpdate');
        jest.runOnlyPendingTimers();
        expect(textField0.value).toEqual('ToDoUpdate');

        // Enter (commitText) with no inserted text in the textfield
        userEvent.keyboard('{enter}');
        jest.runOnlyPendingTimers();
        expect(textField0.value).toEqual('ToDoUpdate');
        expect(textField1.value).toEqual('');
        // wirting text into textField1 "Zwei" Enter to commit the Text
        userEvent.type(textField1, 'Zwei{enter}');
        expect(textField1.value).toEqual('Zwei');

        expect(textField0.value).toEqual('ToDoUpdate');
        expect(textField1.value).toEqual('Zwei');
        userEvent.click(textField1);
        userEvent.keyboard('{backspace}');
        expect(textField1.value).toEqual('Zwe');
        userEvent.keyboard('{backspace}');
        expect(textField1.value).toEqual('Zw');
        userEvent.keyboard('{backspace}');
        expect(textField1.value).toEqual('Z');
        userEvent.keyboard('{backspace}');
        expect(textField1.value).toEqual('');
        userEvent.keyboard('{enter}');
        expect(textField1.value).toEqual('');

        // rerendering because text value is not always has to mean that the text is wrtiten in the our store. Could just be in the UI!
        renderToDoListWithProviders({ rerender: rerender, localstore: localstore, contextManager: contextManager });
        textField0 = screen.queryAllByRole('textbox')[0];
        textField1 = screen.queryAllByRole('textbox')[1];

        expect(textField0.value).toEqual('ToDoUpdate');
        expect(textField1.value).toEqual('');
    });
    test('TT3: S2A4 changing the checked status of a todo', () => {
        predefinedE1uTT2u3u4(jest, localstore);
        renderToDoListWithProviders({ localstore: localstore, contextManager: contextManager });
        // Checking and unchecking of the checkboxes of the specific ToDos
        const checkbox0 = screen.queryAllByRole('checkbox')[0];
        const checkbox1 = screen.queryAllByRole('checkbox')[1];
        expect(checkbox1).not.toBeChecked();
        expect(checkbox0).not.toBeChecked();
        userEvent.click(checkbox1);
        jest.runOnlyPendingTimers();

        expect(checkbox1).toBeChecked();
        expect(checkbox0).not.toBeChecked();
        userEvent.click(checkbox1);
        jest.runOnlyPendingTimers();

        expect(checkbox0).not.toBeChecked();
        expect(checkbox1).not.toBeChecked();
    });
});
describe(' remove todo from the todolist : ', () => {
    test('TT4: S2A5 remove ToDo  of the ToDoList', () => {
        predefinedE1uTT2u3u4(jest, localstore);
        renderToDoListWithProviders({ localstore: localstore, contextManager: contextManager });
        let buttonRemove = screen.queryAllByTestId('buttonRemove');

        expect(buttonRemove.length).toBe(2);
        // remove the 2nd todo ([text:"",checked:true])
        userEvent.click(buttonRemove[1]);

        buttonRemove = screen.queryAllByTestId('buttonRemove');
        expect(buttonRemove.length).toBe(1);
        expect(screen.queryAllByRole('textbox')[0].value).toEqual('ToDo');
    });
});
