import { screen, waitFor } from '@testing-library/react';
import { setupStore } from '../../model/app/store';
import { openEditView, renderBoardWithProviders } from '../../services/test-utils';
import { cleanUpProviderCollection, initDocument } from '../../services/collectionprovider';
import userEvent from '@testing-library/user-event';
import { predefinedIT1u2u3u4, predefinedRTIuIT5 } from '../../test_services/predefineStates/ImagePredefined';

let localstore;
// set the environment variables because they are not set in the cdci environment
process.env.REACT_APP_HOMEPAGE = '/hhyedz7ynlijlb26';
process.env.REACT_APP_SERVERPORT = ':10180';
beforeEach(async () => {
    process.env.MTests = true;
    initDocument('13a');
    process.env.APP_TEST = 'true';
    localstore = setupStore();
    jest.useFakeTimers();
});
afterEach(async () => {
    // restore the spy created with spyOn
    jest.restoreAllMocks();
    jest.useRealTimers();
    jest.clearAllTimers();
    cleanUpProviderCollection();
});
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    // we need to mock the useLocation hook that the tests work
    useLocation: jest.fn()
}));
// get all Buttons that are needed of the edit Image PopUp. It does not test if they are found.
// if a button is not found the variable contains null.
// so you need to test if the button is found in the test case
function getNeededButtons (jest, screen) {
    const fileUpload = screen.getByTestId('fileUpload');
    const imageLinkButton = screen.getByTestId('insertLink');
    // preview Image
    const previewImage = screen.queryByRole('dialog').getElementsByTagName('img')[0];
    // rotateRight
    const rotateRight = screen.getByTestId('rotateRight');
    // rotateLeft
    const rotateLeft = screen.getByTestId('rotateLeft');
    // caption textffeld
    const caption = screen.getByRole('textbox');
    // const caption = screen.queryByRole('dialog').getElementsByTagName('textarea')[0];
    // fitAspectRatio
    const fitAspectRatio = screen.getByTestId('fitAspectRatio');
    // upload image
    const uploadImage = screen.getByTestId('uploadImage');
    // close the edit Window of the ImageComponent
    const discardChanges = screen.getByTestId('discardChanges');
    return { fileUpload, imageLinkButton, previewImage, rotateRight, rotateLeft, caption, fitAspectRatio, uploadImage, discardChanges };
}

describe('Basistests: adding - remove todos to/from todolist : ', () => {
    test('RTI: store dispatch loadTodoList ', () => {
        renderBoardWithProviders({ localstore: localstore });
        predefinedRTIuIT5(jest, localstore);
        expect(localstore.getState().images.entities.testImage).toBeDefined();
        expect(localstore.getState().images.entities.testImage.imageObject.data.description).toEqual('TestDiscription');
        expect(localstore.getState().images.entities.testImage.imageObject.data.url).toEqual('https://upload.wikimedia.org/wikipedia/commons/1/1c/RPTU_Logo.svg');
        expect(localstore.getState().images.entities.testImage.imageObject.data.rotation).toEqual(0);
    });
    // TODOTest: FileReader onloaded is not triggered
    test.skip('IT1: ImageComponent renders without problems, insterting an non-image file ', () => {
        const image = 'data:image/jpeg;base64,/9j/4AAQSkZJ//20==';
        const file = new File([image], 'chucknorris.jpg', { type: 'image/jpeg' });

        jest.spyOn(global, 'FileReader').mockImplementation(function () {
            // eslint-disable-next-line no-return-assign
            this.readAsDataURL = jest.fn(() => this.result = 'hi');
        });
        const reader = FileReader.mock.instances[0];
        const { rerender } = renderBoardWithProviders({ localstore: localstore });
        predefinedIT1u2u3u4(jest, localstore);
        openEditView({ jest: jest, localstore: localstore, rerender: rerender, screen: screen, expect: expect, componentTestId: 'Bild' });
        const imageComponent = screen.getByTestId('Bild');
        // open the edit Window of the ImageComponent
        // fireEvent.doubleClick(imageComponent);
        userEvent.dblClick(imageComponent);

        const {
            fileUpload,
            imageLinkButton,
            previewImage,
            rotateRight,
            rotateLeft,
            caption,
            fitAspectRatio,
            uploadImage,
            discardChanges
        } = getNeededButtons(jest, screen);

        expect(fileUpload).toBeDefined();
        expect(imageLinkButton).toBeDefined();
        expect(previewImage).toBeDefined();
        expect(rotateRight).toBeDisabled();
        expect(rotateLeft).toBeDisabled();
        expect(fitAspectRatio).toBeDisabled();
        expect(uploadImage).toBeDisabled();
        expect(discardChanges).toBeDefined();

        userEvent.upload(fileUpload, new File(['(⌐□_□)'], 'chucknorris.pdf', { type: 'application/pdf' }));
        /*
        fireEvent.change(FileUploadButton, {
            target: {
                files: [file]
            }
        });
        */
        expect(FileReader).toHaveBeenCalledTimes(1);
        // act(() => reader.onloadend());
        userEvent.type(caption, 'TestCaption');
        expect(previewImage.src).toEqual('');
        expect(rotateRight).not.toBeDisabled();
        expect(rotateLeft).not.toBeDisabled();
        expect(fitAspectRatio).not.toBeDisabled();
        expect(uploadImage).not.toBeDisabled();

        userEvent.click(uploadImage);

        expect(imageComponent.getElementsByClassName('MuiSvgIcon-root').length).toBe(1);
    });
    // TODOTest: FileReader onloaded is not triggered
    test.skip('IT2: insterting an image File ', async () => {
        const files = [
            new File(['hello'], 'hello.png', { type: 'image/png' }),
            new File(['there'], 'there.png', { type: 'image/png' })
        ];
        /*
        jest.spyOn(global, 'FileReader').mockImplementation(function () {
            // eslint-disable-next-line no-return-assign
            this.readAsDataURL = jest.fn(() => this.result = 'hi');
        });
        */
        // const reader = FileReader.mock.instances[0];
        const { rerender } = renderBoardWithProviders({ localstore: localstore });
        predefinedIT1u2u3u4(jest, localstore);
        openEditView({ jest: jest, localstore: localstore, rerender: rerender, screen: screen, expect: expect, componentTestId: 'Bild' });
        const imageComponent = screen.getByTestId('Bild');
        // open the edit Window of the ImageComponent
        // fireEvent.doubleClick(imageComponent);
        userEvent.dblClick(imageComponent);

        const {
            fileUpload,
            imageLinkButton,
            previewImage,
            rotateRight,
            rotateLeft,
            caption,
            fitAspectRatio,
            uploadImage,
            discardChanges
        } = getNeededButtons(jest, screen);

        expect(fileUpload).toBeDefined();
        expect(imageLinkButton).toBeDefined();
        expect(previewImage).toBeDefined();
        expect(rotateRight).toBeDisabled();
        expect(rotateLeft).toBeDisabled();
        expect(fitAspectRatio).toBeDisabled();
        expect(uploadImage).toBeDisabled();
        expect(discardChanges).toBeDefined();

        waitFor(() => userEvent.upload(fileUpload, files));

        expect(fileUpload.files).toHaveLength(1);
        expect(fileUpload.files[0]).toBe(files[0]);
        /*
        fireEvent.change(FileUploadButton, {
            target: {
                files: [file]
            }
        });
        */
        // expect(FileReader).toHaveBeenCalledTimes(1);
        // act(() => reader.onloadend());
        userEvent.type(caption, 'TestCaption');
        waitFor(() => expect(rotateRight).not.toBeDisabled());
        expect(previewImage.src).toEqual('');

        expect(rotateLeft).not.toBeDisabled();
        expect(fitAspectRatio).not.toBeDisabled();
        expect(uploadImage).not.toBeDisabled();

        userEvent.click(uploadImage);

        expect(imageComponent.getElementsByClassName('MuiSvgIcon-root').length).toBe(1);
    });
    test.skip('IT3: inserting an non-image link ', async () => {
        const { rerender } = renderBoardWithProviders({ localstore: localstore });
        predefinedIT1u2u3u4(jest, localstore);
        openEditView({ jest: jest, localstore: localstore, rerender: rerender, screen: screen, expect: expect, componentTestId: 'Bild' });
        // await openEditView(jest, screen, expect, 'Bild', localstore, rerender);
        const {
            imageLinkButton,
            previewImage,
            rotateRight,
            rotateLeft,
            caption,
            fitAspectRatio,
            uploadImage
        } = getNeededButtons(jest, screen);
        /* inserting with a link image */
        jest.spyOn(window, 'prompt').mockImplementation(() => 'http://lamport.cs.uni-kl.de:10180/jni41579qd/');
        // insert image trough a link
        userEvent.click(imageLinkButton);
        expect(previewImage.src).toEqual('http://lamport.cs.uni-kl.de:10180/jni41579qd/');
        userEvent.type(caption, 'RPTU{enter}');
        jest.runOnlyPendingTimers();
        expect(caption.value).toEqual('RPTU');
        expect(previewImage.style.transform).toEqual('rotate(0deg)');
        expect(rotateRight).toBeEnabled();
        expect(rotateLeft).toBeEnabled();
        expect(fitAspectRatio).toBeEnabled();
        expect(uploadImage).toBeEnabled();

        userEvent.click(uploadImage);
        jest.runOnlyPendingTimers();
        expect(screen.queryByRole('dialog')).toBeNull();
        const imageInTheImageComponent = screen.getByTestId('Bild').getElementsByTagName('img')[0];
        expect(imageInTheImageComponent.src).toEqual('http://lamport.cs.uni-kl.de:10180/jni41579qd/');
        expect(imageInTheImageComponent.style.transform).toEqual('rotate(0deg)');
        // TODO testing if the caption is saved
    });
    test.skip('IT4: inserting an image link ', async () => {
        const { rerender } = renderBoardWithProviders({ localstore: localstore });
        predefinedIT1u2u3u4(jest, localstore);
        openEditView({ jest: jest, localstore: localstore, rerender: rerender, screen: screen, expect: expect, componentTestId: 'Bild' });
        const {
            imageLinkButton,
            previewImage,
            rotateRight,
            rotateLeft,
            caption,
            fitAspectRatio,
            uploadImage
        } = getNeededButtons(jest, screen);
        /* inserting with a link image */
        userEvent.type(caption, 'RPTU');
        // mocking of the window.prompt message
        jest.spyOn(window, 'prompt').mockImplementation(() => 'https://upload.wikimedia.org/wikipedia/commons/1/1c/RPTU_Logo.svg');
        // insert image trough a link
        userEvent.click(imageLinkButton);
        jest.runOnlyPendingTimers();
        expect(previewImage.src).toEqual('https://upload.wikimedia.org/wikipedia/commons/1/1c/RPTU_Logo.svg');
        userEvent.click(caption);
        userEvent.type(caption, 'RPTU');
        expect(caption).toHaveTextContent('RPTU');
        expect(previewImage.style.transform).toEqual('rotate(0deg)');
        expect(rotateRight).toBeEnabled();
        expect(rotateLeft).toBeEnabled();
        expect(fitAspectRatio).toBeEnabled();
        expect(uploadImage).toBeEnabled();

        userEvent.click(uploadImage);
        jest.runOnlyPendingTimers();
        expect(screen.queryByRole('dialog')).toBeNull();
        const imageInTheImageComponent = screen.getByTestId('Bild').getElementsByTagName('img')[0];
        // auslesen, ob im imageComponent enthaltenden img die Rotation und der Link stimmt
        expect(imageInTheImageComponent).toHaveAttribute('src', 'https://upload.wikimedia.org/wikipedia/commons/1/1c/RPTU_Logo.svg');
        expect(imageInTheImageComponent).toHaveStyle('transform: rotate(0deg);');
        // TODO testing if the caption is saved
    });
    test.skip('IT5: rotating right and left in preview ', async () => {
        const { rerender } = renderBoardWithProviders({ localstore: localstore });
        predefinedRTIuIT5(jest, localstore);
        openEditView({ jest: jest, localstore: localstore, rerender: rerender, screen: screen, expect: expect, componentTestId: 'Bild' });
        const {
            previewImage,
            rotateRight,
            rotateLeft,
            caption,
            uploadImage
        } = getNeededButtons(jest, screen);

        expect(previewImage.src).toEqual('https://upload.wikimedia.org/wikipedia/commons/1/1c/RPTU_Logo.svg');
        expect(rotateLeft).toBeEnabled();
        expect(rotateRight).toBeEnabled();
        expect(uploadImage).toBeEnabled();
        expect(caption.value).toEqual('TestDiscription');

        expect(previewImage.style.transform).toEqual('rotate(0deg)');
        userEvent.click(rotateRight);
        expect(previewImage.style.transform).toEqual('rotate(90deg)');

        userEvent.click(rotateLeft);
        expect(previewImage.style.transform).toEqual('rotate(0deg)');

        userEvent.click(rotateLeft);
        expect(previewImage.style.transform).toEqual('rotate(270deg)');

        userEvent.click(rotateRight);
        expect(previewImage.style.transform).toEqual('rotate(360deg)');

        userEvent.click(rotateRight);
        expect(previewImage.style.transform).toEqual('rotate(90deg)');

        userEvent.click(rotateRight);
        expect(previewImage.style.transform).toEqual('rotate(180deg)');

        userEvent.click(rotateRight);
        expect(previewImage.style.transform).toEqual('rotate(270deg)');

        userEvent.click(rotateRight);
        expect(previewImage.style.transform).toEqual('rotate(360deg)');

        userEvent.click(rotateLeft);
        expect(previewImage.style.transform).toEqual('rotate(270deg)');

        userEvent.click(rotateLeft);
        expect(previewImage.style.transform).toEqual('rotate(180deg)');

        userEvent.click(rotateLeft);
        expect(previewImage.style.transform).toEqual('rotate(90deg)');

        userEvent.click(uploadImage);
        jest.runOnlyPendingTimers();
        expect(screen.queryByRole('dialog')).toBeNull();
        // we want to get the image in the image component
        const imageInTheImageComponent = screen.getByTestId('Bild').getElementsByTagName('img')[0];
        expect(imageInTheImageComponent).toHaveAttribute('src', 'https://upload.wikimedia.org/wikipedia/commons/1/1c/RPTU_Logo.svg');
        expect(imageInTheImageComponent).toHaveStyle('transform: rotate(90deg);');
        // TODO testing if the caption is saved
    });
    // TODOMicha fix this test
    const utils = require('../../services/utils');
    test.skip('IT6: fitApsectRatio test', async () => {
        // in jsdom the image.onload is not called as it would be in a normal browser, so we have to mock the function
        const { rerender } = renderBoardWithProviders({ localstore: localstore });
        predefinedRTIuIT5(jest, localstore);
        openEditView({ jest: jest, localstore: localstore, rerender: rerender, screen: screen, expect: expect, componentTestId: 'Bild' });
        const spy = jest.spyOn(utils, 'getImageMetaData').mockImplementation(() => { const img = new Image(129, 311); img.src = 'https://upload.wikimedia.org/wikipedia/commons/1/1c/RPTU_Logo.svg'; return img; });
        const {
            previewImage,
            caption,
            fitAspectRatio,
            uploadImage
        } = getNeededButtons(jest, screen);
        expect(fitAspectRatio).toBeEnabled();
        expect(caption.value).toEqual('TestDiscription');
        expect(previewImage.src).toEqual('https://upload.wikimedia.org/wikipedia/commons/1/1c/RPTU_Logo.svg');
        expect(screen.getByTestId('workComponent').style.width).toEqual('200px');
        expect(screen.getByTestId('workComponent').style.height).toEqual('200px');
        /* fitAspectReatio should only be commited if the uploadImage button is clicked */
        userEvent.click(fitAspectRatio);
        /* fitAspectReatio */
        await waitFor(() => expect(screen.getByTestId('workComponent').style.height).toEqual('200px'));
        expect(screen.getByTestId('workComponent').style.width).toEqual('200px');

        expect(uploadImage).toBeEnabled();
        userEvent.click(uploadImage);
        jest.runOnlyPendingTimers();
        await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
        expect(screen.getByTestId('workComponent').style.height).toEqual('311px');
        // await waitFor(() => expect(screen.getByTestId('workComponent').style.height).toEqual('311px'));
        expect(screen.getByTestId('workComponent').style.width).toEqual('129px');

        // TODO: test if fit Aspect Ratio is working with a image upload
    });
    test.skip('IT7: discard Changes', async () => {
        // in jsdom the image.onload is not called as it would be in a normal browser, so we have to mock the function
        jest.spyOn(utils, 'getImageMetaData').mockImplementation(() => { const img = new Image(129, 311); img.src = 'https://upload.wikimedia.org/wikipedia/commons/1/1c/RPTU_Logo.svg'; return img; });
        const { rerender } = renderBoardWithProviders({ localstore: localstore });
        predefinedRTIuIT5(jest, localstore);
        openEditView({ jest: jest, localstore: localstore, rerender: rerender, screen: screen, expect: expect, componentTestId: 'Bild' });
        const {
            imageLinkButton,
            previewImage,
            rotateRight,
            rotateLeft,
            caption,
            fitAspectRatio,
            uploadImage,
            discardChanges
        } = getNeededButtons(jest, screen);
        let workComponent = screen.getByTestId('workComponent');

        expect(previewImage.src).toEqual('https://upload.wikimedia.org/wikipedia/commons/1/1c/RPTU_Logo.svg');
        expect(rotateLeft).toBeEnabled();
        expect(rotateRight).toBeEnabled();
        expect(uploadImage).toBeEnabled();
        expect(caption.value).toEqual('TestDiscription');

        // change uploaded Image
        jest.spyOn(window, 'prompt').mockImplementation(() => 'https://sci.informatik.uni-kl.de/logos/RPTU-2h-800x205-col.png');
        userEvent.click(imageLinkButton);
        expect(previewImage.src).toEqual('https://sci.informatik.uni-kl.de/logos/RPTU-2h-800x205-col.png');
        userEvent.click(rotateRight);
        expect(previewImage.style.transform).toEqual('rotate(90deg)');
        userEvent.clear(caption);
        userEvent.type(caption, 'neuesBild');
        expect(caption.value).toEqual('neuesBild');
        userEvent.click(fitAspectRatio);
        // you have to approve a discardChanges
        jest.spyOn(window, 'confirm').mockImplementation(() => true);
        userEvent.click(discardChanges);
        jest.runOnlyPendingTimers();
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

        expect(workComponent.getElementsByTagName('img')[0]).toHaveAttribute('src', 'https://upload.wikimedia.org/wikipedia/commons/1/1c/RPTU_Logo.svg');
        expect(workComponent.getElementsByTagName('img')[0]).toHaveStyle('transform: rotate(0deg);');
        workComponent = screen.getByTestId('workComponent');
        await waitFor(() => expect(workComponent.style.height).toEqual('200px'));
        expect(workComponent.style.width).toEqual('200px');
    });
});
