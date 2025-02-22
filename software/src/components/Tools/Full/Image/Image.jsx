import React, { useState, useEffect } from 'react';
import {
    IMAGE_CONTAINER_STYLE,
    IMAGE_SELECTION_CONTAINER_STYLE,
    IMAGE_UPLOAD_OPTIONS_CONTAINER_STYLE,
    IMAGE_UPLOAD_OPTION_BUTTON_STYLE,
    ACTION_BUTTON_STYLE,
    PREVIEW_IMAGE_CONTAINER_STYLE,
    IMAGE_DESCRIPTION_STYLE,
    MIDDLE_ROW_CONTAINER_STYLE,
    BG_ADD_IMAGE_STYLE
} from './styles';
import Modal from 'react-modal';
import {
    Button,
    Fab,
    TextField
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import { isMobileDevice, resizeToAspectRatio, getImageMetaData, checkFileTypes } from '../../../../services/utils';
import { useSelector, useDispatch } from 'react-redux';
import {
    setImageURL as persistImageUrl,
    setImageDescription as persistImageDescription,
    setImageRotation as persistImageRotation,
    selectImage,
    selectError
} from '../../../../model/features/images/imagesSlice';
import { selectComponentSize, updateSize } from '../../../../model/features/boards/boardsSlice';
import { COMPONENT_TYPES } from '../../../../model/features/functions/loaders';
import {
    uploadImageFile,
    getImage
} from '../../../../services/imageUpload';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useErrorBoundary } from 'react-error-boundary';

export default function Image ({
    docName,
    boardId,
    containerId,
    childToolEditModalStatus, // update var name: forceOpenModal for symetrry with all tool components
    contextManager
}) {
    const { showBoundary } = useErrorBoundary();
    const dispatch = useDispatch();
    useEffect(() => {
        contextManager.loadComponent(boardId, docName, COMPONENT_TYPES.IMAGE);
    }, []);

    // Monitor updates in prop 'childToolEditModalStatus', to open the 'Edit Modal'
    // Required when used on a mobile/tablet device where the edit option is displayed in the contextual menu controlled from the 'WorkComponent'
    useEffect(() => {
        if (childToolEditModalStatus > 0) {
            openEditView();
        }
    }, [childToolEditModalStatus]);

    /** Controls the open/closed state of the edit modal from where the image can be selected. */
    const [editImageIsOpen, setEditViewIsOpen] = useState(false);
    /** Stores the image file. When the user selects a file input from local system or clicks a new image from mobile/tablet device.  */
    const [imageFile, setImageFile] = useState(undefined);
    /** Preview of the image selected from any input type. Value will not be stored in the DB. */
    const [previewImageReference, setPreviewImageReference] = useState(undefined);
    /** Stores if fitToAspectRatio Button was clicked */
    const [clickedFitToAspectRatio, setClickedFitToAspectRatio] = useState(false);
    /** Description of the image file uploaded/selected, will allow a description to be displayed when used in an offline mode.
    *  Could also be used in the future for a 'gallery search' of the images in the DB. */
    const [imageDescription, setImageDescription] = useState(undefined);
    /** Stores the image rotation degree. If any online or image file is uploaded, the rotation of the image is controlled via the frontend using this property. */
    const [imageRotation, setImageRotation] = useState(0);

    const imageInfo = useSelector((state) => selectImage(state, docName));
    const containerSizeInfo = useSelector((state) => selectComponentSize(state, boardId, containerId));

    const changeImageDescription = (event) => {
        // dispatch(setImageDescription(docName, event.target.value));
        setImageDescription(event.target.value);
    };

    const changeImage = (event) => {
        event.preventDefault();
        if (event && event.target && event.target.files && event.target.files[0]) {
            const imageFile = event.target.files[0];
            if (checkFileTypes(imageFile, ['png', 'jpg', 'jpeg', 'gif', 'svg']) === -1) {
                toast.error('Hochgeladener Dateityp nicht unterstützt');
                return;
            }
            setImageFile(imageFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImageReference(reader.result);
            };
            reader.readAsDataURL(imageFile);
        } else {
            setPreviewImageReference(undefined);
        }
        setImageRotation(0);
    };

    const uploadImage = (event) => {
        event.preventDefault();
        if (imageFile) {
            uploadImageFile(imageFile)
                .then(response => response.json())
                .then(async data => {
                    const imageUrl = await getImage(data.id);
                    dispatch(persistImageUrl(docName, imageUrl));
                }).catch(err => {
                    toast.error('Fehler beim Hochladen der Datei');
                    throw err;
                });
        } else {
            dispatch(persistImageUrl(docName, previewImageReference));
        }
        dispatch(persistImageDescription(docName, imageDescription));
        dispatch(persistImageRotation(docName, imageRotation));
        closeEditView();
    };

    const pasteLink = (event) => {
        event.preventDefault();
        const imageLink = prompt('Enter the URL of the image:');
        if (imageLink) {
            setPreviewImageReference(imageLink);
            setImageFile(undefined);
        }
    };

    const rotateImage = (degrees) => {
        let newRotation = imageRotation + degrees;
        if (newRotation > 360) newRotation = 90;
        else if (newRotation < 0) newRotation = 270;
        setImageRotation(newRotation);
    };

    const openEditView = () => {
        setEditViewIsOpen(true);
        if (imageInfo && imageInfo.url) {
            setPreviewImageReference(imageInfo.url);
        }
        if (imageInfo && imageInfo.description) {
            setImageDescription(imageInfo.description);
        }
        if (imageInfo && imageInfo.rotation) {
            setImageRotation(imageInfo.rotation);
        }

        /**
         * Disable board zoom when modal is open
         * Desktop users trigger the onmousewheel, zoom board as well as contents of modal
        * */
        contextManager.setBoardZoomStatus(false);
    };

    const closeEditView = (showDiscardConfirm = false) => {
        let confirmAspecRatioResponse = true;
        let discardConfirmResponse = true;
        if (showDiscardConfirm) {
            discardConfirmResponse = confirm('Änderungen verwerfen?');
            // if we want to discard all changes the fitAspecRatio should be discarded as well
            confirmAspecRatioResponse = !discardConfirmResponse;
        }

        if (discardConfirmResponse) {
            if (clickedFitToAspectRatio && confirmAspecRatioResponse) {
                fitAspectRatio();
            }
            setEditViewIsOpen(false);
            setPreviewImageReference(undefined);
            setImageDescription(undefined);
            setImageRotation(0);
            setClickedFitToAspectRatio(false);
        }
        contextManager.setBoardZoomStatus(true); // Enable the board zoom features on close
    };

    const fitAspectRatio = async () => {
        if (!previewImageReference || containerSizeInfo.width === 0 || containerSizeInfo.height === 0) return; // no size info available
        const imageMetaData = await getImageMetaData(previewImageReference);
        const aspectRatio = imageMetaData.width / imageMetaData.height;
        const currentContainerArea = containerSizeInfo.width * containerSizeInfo.height;

        const newSize = resizeToAspectRatio(currentContainerArea, aspectRatio);
        dispatch(updateSize(boardId, containerId, newSize));
    };

    const loadMobileDeviceOptions = () => {
        if (isMobileDevice()) {
            return (
                <React.Fragment>
                    <input type='file' onChange={(e) => { try { changeImage(e); } catch (err) { showBoundary(err); } }} accept='image/*' capture='user' id='contained-button-camera' style={{ display: 'none' }} />
                    <label htmlFor='contained-button-camera'>
                        <Fab component='span' style={IMAGE_UPLOAD_OPTION_BUTTON_STYLE}>
                            <AddAPhotoIcon />
                        </Fab>
                    </label>
                </React.Fragment>
            );
        }
        return <></>;
    };

    const err = useSelector((state) => selectError(state, docName));
    if (err) {
        showBoundary(err);
    }

    return (
        <React.Fragment>
            <div data-testid='Bild' style={IMAGE_CONTAINER_STYLE}>
                {/* { !(imageInfo.url) && <label>Doppelklick um Bild auszuwählen</label> } */}
                { Boolean(imageInfo.url) && <img data-testId='imageComponentImage' alt={imageInfo.description} src={imageInfo.url} style={{ ...IMAGE_CONTAINER_STYLE, transform: `rotate(${imageInfo.rotation}deg)` }} /> }
                { Boolean(!imageInfo.url) && <AddAPhotoIcon style={BG_ADD_IMAGE_STYLE} />}
            </div>

            <Modal
                data-testId='editImageModal'
                isOpen={editImageIsOpen}
                contentLabel='Edit IMAGE Modal'
                style={IMAGE_SELECTION_CONTAINER_STYLE}
                parentSelector={() => (document.getElementsByClassName('fullscreen') ? document.getElementsByClassName('fullscreen')[0] : undefined)}
            >
                <div style={IMAGE_UPLOAD_OPTIONS_CONTAINER_STYLE}>
                    <input accept='image/*' type='file'
                        onChange={(event) => { try { changeImage(event); } catch (err) { showBoundary(err); } }}
                        id='contained-button-file' style={{ display: 'none' }} data-testid='fileUpload' />
                    <label htmlFor='contained-button-file'>
                        <Fab component='span' style={IMAGE_UPLOAD_OPTION_BUTTON_STYLE}>
                            <AddPhotoAlternateIcon />
                        </Fab>
                    </label>
                    <Fab onClick={(event) => { try { pasteLink(event); } catch (err) { showBoundary(err); } }}
                        style={IMAGE_UPLOAD_OPTION_BUTTON_STYLE} data-testid='insertLink'>
                        <LinkIcon />
                    </Fab>
                    <Fab
                        onClick={ (event) => {
                            try {
                                event.preventDefault();
                                rotateImage(90);
                            } catch (err) { showBoundary(err); }
                        }}
                        disabled={!previewImageReference}
                        style={IMAGE_UPLOAD_OPTION_BUTTON_STYLE}
                        data-testid='rotateRight'
                    >
                        <RotateRightIcon />
                    </Fab>
                    <Fab
                        onClick={event => {
                            try {
                                event.preventDefault();
                                rotateImage(-90);
                            } catch (err) { showBoundary(err); }
                        }}
                        disabled={!previewImageReference}
                        style={IMAGE_UPLOAD_OPTION_BUTTON_STYLE}
                        data-testid="rotateLeft"
                    >
                        <RotateLeftIcon />
                    </Fab>
                    <Fab
                        onClick={() => {
                            try {
                                setClickedFitToAspectRatio(true);
                            } catch (err) { showBoundary(err); }
                        }}
                        disabled={!previewImageReference || (previewImageReference && clickedFitToAspectRatio)}
                        style={IMAGE_UPLOAD_OPTION_BUTTON_STYLE}
                        data-testid="fitAspectRatio"
                    >
                        <AspectRatioIcon />
                    </Fab>
                    {loadMobileDeviceOptions()}
                </div>

                <div style={MIDDLE_ROW_CONTAINER_STYLE}>
                    <img data-testid='previewImage' src={previewImageReference} alt={imageInfo.description} style={{ ...PREVIEW_IMAGE_CONTAINER_STYLE, transform: `rotate(${imageRotation}deg)` }}/>
                    <TextField multiline rows={4} style={IMAGE_DESCRIPTION_STYLE} label='Bildbeschreibung' variant='outlined' defaultValue={imageDescription}
                        onChange={ (event) => { try { changeImageDescription(event); } catch (err) { showBoundary(err); } }}
                    />
                </div>

                <div>
                    <Button data-testid='uploadImage'
                        onClick={ (event) => { try { uploadImage(event); } catch (err) { showBoundary(err); } }}
                        disabled={(!previewImageReference || !imageDescription)} style={ACTION_BUTTON_STYLE} size='small' variant='contained' color='secondary' aria-label='small contained secondary button'>Bild hochladen</Button>
                    <Button data-testid='discardChanges'
                        onClick={ (_event) => { try { closeEditView(true); } catch (err) { showBoundary(err); } }}
                        size='small' variant='contained' style={ACTION_BUTTON_STYLE} aria-label='small contained button'>Verwerfen</Button>
                </div>
            </Modal>
        </React.Fragment>
    );
};
