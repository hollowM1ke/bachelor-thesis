import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { loadCheckbox } from '../../model/features/checkboxes/checkboxesSlice';
import { setupStore } from '../../model/app/store';
import { contextManager } from '../../services/test-utils';
import Checkbox from '../../components/Tools/Full/Checkbox/Checkbox';
import { ErrorBoundary } from 'react-error-boundary';
import * as collectionprovider from '../../services/collectionprovider';

let localstore;
// set the environment variables because they are not set in the cdci environment
process.env.REACT_APP_HOMEPAGE = '/hhyedz7ynlijlb26';
process.env.REACT_APP_SERVERPORT = ':10180';
function loadCheckboxDispatcher ({ jest, localstore = setupStore(), id = 'testCheckbox', boardId = 'skript-b1' }) {
    localstore.dispatch(loadCheckbox({ id: id, boardId: boardId }));
    jest.runOnlyPendingTimers();
};
beforeEach(() => {
    collectionprovider.initDocument('13a');
    process.env.APP_TEST = 'true';
    localstore = setupStore();
    jest.useFakeTimers();
});
afterEach(() => {
    // restore the spy created with spyOn
    jest.restoreAllMocks();
    // cleans up the CollectionProvider after a test
    collectionprovider.cleanUpProviderCollection();
    jest.useRealTimers();
    jest.clearAllTimers();
});

describe.skip('reducer Test (the ones needed for the other test cases)', () => {
    test('GT: testing preload functionality', () => {
        loadCheckboxDispatcher({ jest: jest, localstore: localstore });
        expect(localstore.getState().checkboxes.entities['checkbox-1'].data.checked).toBe(false);
    });
});

describe('Checkbox Test', () => {
    test('CT1: Rendes the Checkbox without errors and it is initially not checked \n checking and unchecking', () => {
        loadCheckboxDispatcher({ jest: jest, localstore: localstore });
        render(
            <ErrorBoundary>
                <Provider store={localstore}>
                    <Checkbox docName={'testCheckbox'}
                        boardId={999}
                        contextManager={contextManager} />
                </Provider>
            </ErrorBoundary>);
        expect(screen.getByTestId('checkboxInput')).toBeInTheDocument();
        const checkbox = screen.getByTestId('checkboxInput');

        expect(checkbox).not.toBeChecked();

        fireEvent.click(checkbox);

        expect(checkbox).toBeChecked();

        userEvent.click(checkbox);

        expect(checkbox).not.toBeChecked();
    });
});
