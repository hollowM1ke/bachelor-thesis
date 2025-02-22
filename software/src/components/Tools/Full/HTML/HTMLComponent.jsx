import React, { useState, useEffect, useRef } from 'react';
import {
    PREVIEW_CONTAINER_STYLE
} from './styles';
import {
    selectHTML
} from '../../../../model/features/htmls/htmlsSlice';
import { COMPONENT_TYPES } from '../../../../model/features/functions/loaders';
import { useSelector } from 'react-redux';
import parse from 'html-react-parser';
import { USER_ROLES } from '../../../users/users';
import HTMLModal from './HTMLModal';

export default function HTMLComponent ({
    docName,
    boardId,
    containerId,
    setChildHasEventControl,
    contextManager,
    childToolEditModalStatus
}) {
    // Monitor updates in prop 'childToolEditModalStatus', to open the 'Edit Modal'
    // Required when used on a mobile/tablet device where the edit option is displayed in the contextual menu controlled from the 'WorkComponent'
    useEffect(() => {
        if (childToolEditModalStatus > 0 && contextManager.userRole !== USER_ROLES.STUDENT) {
            // setEditViewIsOpen(true);
            contextManager.setOpenTool(HTMLModal, {
                docName,
                boardId,
                containerId,
                contextManager
            });
        }
    }, [childToolEditModalStatus]);

    const htmlVal = useSelector((state) => selectHTML(state, docName));

    const [scriptTagElements, setScriptTagElements] = useState([]);

    const container = useRef(null);

    const scriptId = 'unique_script';

    useEffect(() => {
        const scriptTagsContainerDiv = document.createElement('div');
        scriptTagsContainerDiv.setAttribute('id', 'scriptTagsInjectContainer');
        scriptTagsContainerDiv.setAttribute('script-id', scriptId);
        container.current.append(scriptTagsContainerDiv);

        scriptTagElements.forEach(scriptTag => {
            const fragment = document.createRange().createContextualFragment(scriptTag);
            scriptTagsContainerDiv.append(fragment);
        });
    }, [(JSON.stringify(scriptTagElements) && scriptTagElements.length > 0)]);

    useEffect(() => {
        if (document.querySelectorAll(`[script-id='${scriptId}']`)) {
            document.querySelectorAll(`[script-id='${scriptId}']`).forEach(el => {
                el.remove();
            });
        }
        setScriptTagElements([]);
    }, [htmlVal]);

    const replaceScriptTag = (domNode) => {
        if (domNode.name === 'script') {
            const scriptTag = `<script script-id=${scriptId}>${domNode?.children[0]?.data}</script>`;
            if (scriptTagElements.indexOf(scriptTag) < 0) {
                setScriptTagElements((prevState) => [...prevState, scriptTag]);
            }
            // Do not add script tag to the HTMLDOM via the parse function
            // It will be added via the useEffect method, as the parse function strips the 'script' tag when adding to the DOM
            return <span style={{ display: 'none' }}>Hidden Script Tag</span>;
        }
    };

    // const dispatch = useDispatch();
    React.useEffect(() => {
        contextManager.loadComponent(boardId, docName, COMPONENT_TYPES.HTML);
        // dispatch(loadHTML({ id: docName, boardId }));
        // return () => dispatch(unloadHTML({ id: docName, boardId }));
    }, []);

    return (
        <>
            <div style={PREVIEW_CONTAINER_STYLE} ref={container}> {/* onDoubleClick={openEditView} */}
                {parse(htmlVal, { replace: domNode => { return replaceScriptTag(domNode); } })}
                {/* { parse(htmlVal) } */}
            </div>
        </>
    );
}
