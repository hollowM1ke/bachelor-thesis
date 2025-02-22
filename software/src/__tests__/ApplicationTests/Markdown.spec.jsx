import { setupStore } from '../../model/app/store';
import { screen } from '@testing-library/react';
import { cleanUpProviderCollection, initDocument } from '../../services/collectionprovider';
import { renderBoardWithProviders } from '../../services/test-utils';
import { predefinedMT1, predefinedRTM } from '../../test_services/predefineStates/MarkdownPredefined';

let localstore;
// set the environment variables because they are not set in the cdci environment
process.env.REACT_APP_HOMEPAGE = '/hhyedz7ynlijlb26';
process.env.REACT_APP_SERVERPORT = ':10180';
beforeEach(() => {
    process.env.MTests = true;
    initDocument('13a');
    // clean localstore for each test
    localstore = setupStore();
    jest.useFakeTimers();
    process.env.APP_TEST = 'true';
    document.execCommand = jest.fn();
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

describe('reducer Test (the ones needed for the other test cases : ', () => {
    test('RTH - Tests the Reducers that are used to predefine a HTML component.', () => {
        predefinedRTM(jest, localstore);
        expect(localstore.getState().markdowns.entities.testMarkdown).toBeDefined();
        expect(localstore.getState().markdowns.entities.testMarkdown.textObject.data.value).toEqual({ quill: 'Hey' });
    });
});

describe('Markdown Test: ', () => {
    test.skip('MT1 - Tests if a new Markdown is rendered correctly and if the state is updated correctly.', () => {
        renderBoardWithProviders({ localstore });
        predefinedMT1(jest, localstore);
        console.log(screen.getByTestId('Text').children[0].innerHTML);
        expect(screen.getByTestId('Text').children[0].innerHTML).toContain('Text bearbeiten ...');
        // TODO: find a way to mock the blot formatter because it is not working with the test environment
        // openEditView({ jest: jest, localstore: localstore, expect: expect, screen: screen, componentTestId: 'Text', rerender: null });
        // const textfeld = screen.getByRole('paragraph');
        // expect(textfeld).toBeInTheDocument();
        // userEvent.type(textfeld, 'Hey{enter}');
        // expect(textfeld).toHaveTextContent('Hey');
    });
});
