import { setupStore } from '../../model/app/store';
import { cleanUpProviderCollection, initDocument } from '../../services/collectionprovider';
import { predefinedRTH } from '../../test_services/predefineStates/HTMLPredefined';

let localstore;
// set the environment variables because they are not set in the cdci environment
process.env.REACT_APP_HOMEPAGE = '/hhyedz7ynlijlb26';
process.env.REACT_APP_SERVERPORT = ':10180';
beforeEach(() => {
    initDocument('13a');
    process.env.APP_TEST = 'true';
    // clean localstore for each test
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

describe('reducer Test (the ones needed for the other test cases : ', () => {
    test('RTH - Tests the Reducers that are used to predefine a HTML component.', () => {
        predefinedRTH(jest, localstore);
        expect(localstore.getState().htmls.entities.testHtml).toBeDefined();
        expect(localstore.getState().htmls.entities.testHtml.htmlObject.data.value).toContain('<div>test</div>');
    });
});
