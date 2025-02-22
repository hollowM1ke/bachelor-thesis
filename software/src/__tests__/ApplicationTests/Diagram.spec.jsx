import { setupStore } from '../../model/app/store';
import { cleanUpProviderCollection, initDocument } from '../../services/collectionprovider';
import { predefinedDE1 } from '../../test_services/predefineStates/DiagramPredefined';

let localstore;
// set the environment variables because they are not set in the cdci environment
process.env.REACT_APP_HOMEPAGE = '/hhyedz7ynlijlb26';
process.env.REACT_APP_SERVERPORT = ':10180';
beforeEach(() => {
    initDocument('13a');
    process.env.APP_TEST = 'true';
    localstore = setupStore();
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
    test('DE1: Dispatcher tests ', () => {
        predefinedDE1(jest, localstore);
        expect(localstore.getState().diagrams.entities.testDiagram).toBeDefined();
    });
});
