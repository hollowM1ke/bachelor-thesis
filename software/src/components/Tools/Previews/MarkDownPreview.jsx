import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import Modal from 'react-modal';
import { PREVIEW_CONTAINER_STYLE, PREVIEW_FULLVIEW_CONTAINER_STYLE } from './styles';
import {
    selectMarkdown
} from '../../../model/features/markdowns/markdownsSlice';
import { COMPONENT_TYPES } from '../../../model/features/functions/loaders';
import { useSelector } from 'react-redux';
import { Button } from '@mui/material';
import MarkDownFullPreview from './MarkDownFullPreview';
import Quill from 'quill';
import MagicUrl from 'quill-magic-url';
import { QuillBinding } from 'y-quill';
import { useErrorBoundary } from 'react-error-boundary';
import '../../../../node_modules/quill/dist/quill.snow.css';

Quill.register('modules/magicUrl', MagicUrl);
/**
 * The markdown preview element that is represented inside draggable boxes
 */
export default function MarkDownPreview ({
    docName,
    childToolEditModalStatus,
    boardId,
    setChildHasEventControl,
    contextManager
}) {
    const { showBoundary } = useErrorBoundary();
    const editorRef = useRef(null);
    // Monitor updates in prop 'childToolEditModalStatus', to open the 'Edit Modal'
    // Required when used on a mobile/tablet device where the edit option is displayed in the contextual menu controlled from the 'WorkComponent'
    useEffect(() => {
        if (childToolEditModalStatus > 0) {
            contextManager.setOpenTool(MarkDownFullPreview, {
                docName,
                boardId,
                contextManager
            });
        }
    }, [childToolEditModalStatus]);

    const handler = () => {
        // const ydoc = new Y.Doc();
        // const provider = new WebsocketProvider('ws://localhost:1234', `${boardId}-${docName}`, ydoc);#
        if (mdValue) {
            let ytext;
            if (!process.env.appltest) {
                ytext = mdValue.getText('quill');
            }
            const editor = new Quill(editorRef.current, {
                modules: {
                    toolbar: false,
                    history: {
                        userOnly: true
                    },
                    magicUrl: true
                },
                placeholder: 'Text bearbeiten ...',
                theme: 'snow', // or 'bubble'
                bounds: editorRef.current
            });
            editor.enable(false);
            if (!process.env.appltest) {
                const binding = new QuillBinding(ytext, editor);
            }
        }
    };

    const [editViewIsOpen, setEditViewIsOpen] = useState(false);
    const mdValue = useSelector((state) => {
        return selectMarkdown(state, docName);
    });

    useEffect(() => {
        handler();
    }, [mdValue]);

    useLayoutEffect(() => {
        const elements = document.getElementsByClassName('blot-formatter__proxy-image');
        for (let i = 0; i < elements.length; i++) {
            elements[i].remove();
        };
    }, [mdValue]);

    const afterOpenEditView = () => {
        setChildHasEventControl(true);
    };

    const afterCloseEditView = () => {
        setChildHasEventControl(false);
    };

    const closeEditView = () => {
        setEditViewIsOpen(false);
        contextManager.resetOpenTool();
    };

    React.useEffect(() => {
        contextManager.loadComponent(boardId, docName, COMPONENT_TYPES.MARKDOWN);
        // dispatch(loadMarkdown({ id: docName, boardId }));
        // return () => dispatch(unloadMarkdown({ id: docName, boardId }));
    }, []);

    return (
        <>
            <div data-testid = 'Text' style={PREVIEW_CONTAINER_STYLE} /* onClick = { plotRemover } */>
                <div ref={editorRef} id="editor" />
            </div>
            <Modal
                isOpen={editViewIsOpen}
                onAfterOpen={afterOpenEditView}
                onAfterClose={afterCloseEditView}
                onRequestClose={closeEditView}
                style={PREVIEW_FULLVIEW_CONTAINER_STYLE}
                contentLabel='Edit MD Modal'
                parentSelector={() => (document.getElementsByClassName('fullscreen') ? document.getElementsByClassName('fullscreen')[0] : undefined)}
            >
                <Button onClick={(e) => { try { closeEditView(e); } catch (err) { showBoundary(err); } }} size='small' variant='contained' color='secondary' aria-label='small contained secondary button'>Verwerfen</Button>
                {/* <RichCollabMarkdownEditor docName={docName} setTempMdVal={setTempMDState} /> */}
                {/* <DraftJSMarkdownEditor value={tempMDState} setValue={setTempMDState} /> */}
            </Modal>
        </>
    );
}
