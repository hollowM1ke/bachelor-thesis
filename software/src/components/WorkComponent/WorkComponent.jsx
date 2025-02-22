import React, { useEffect, memo, useMemo, useState, useCallback } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import ItemTypes from '../ToolBox/itemTypes';
import { Menu, Item, Separator } from 'react-contexify';
import Card from '@mui/material/Card';
import { ResizableBox } from 'react-resizable';
import { DEFAULT_BOX_SIZE, MIN_BOX_SIZE, CARD_STYLE, getContainerStyles, CONTEXT_MENU_LABEL_STYLE, WORK_COMPONENT_HEADER_STYLE, ATTENTION_REQUIRED_STYLE } from './WorkComponentStyles';
import { stopPropagationAndPreventDefault } from '../../services/DOM';
import { updateSize, addLabel as boardAddLabel } from '../../model/features/boards/boardsSlice';
import { generatePseudoRandomId } from '../../services/ids';
import { useDispatch, useStore, useSelector } from 'react-redux';
import { getContextSelectorForSlice, COMPONENT_TYPES } from '../../model/features/functions/loaders';
import { USAGE_MODES } from '../Board/usageModes';
import { Delete, Edit, FileCopy, Label, SettingsInputComponent, PriorityHigh, Done } from '@mui/icons-material';
import { TOOL_TYPES } from '../Tools/toolTypes';
import { USER_ROLES } from '../users/users';
import { BOARD_TYPES } from '../Board/boardConfig';
import Comments from '../Comments/Comments';
import { Typography, Button, Box } from '@mui/material';
import { selectComment } from '../../model/features/comments/commentsSlice';
import { addFlag } from '../../model/features/personaldata/personaldataSlice';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import { ErrorToolComponent, logError } from '../ErrorBoundaries/ErrorFallbacks';
import CsvSpreadsheetExport from '../Persistence/CsvSpreadsheetExport';
// TODO: optimize re-render if possible
/* function compareMemo (existingProps, newProps) {
    return false;
} */

const EDITABLE_COMPONENTS = [COMPONENT_TYPES.IMAGE, COMPONENT_TYPES.MARKDOWN, COMPONENT_TYPES.HTML];
/**
 * Represent a draggable box in the board work area
 *
 * @param props.id The id of the box
 * @param props.size The size of the work component containing box
 * @param props.left The coordinate point from the left
 * @param props.top The coordinate point from top
 * @param props.copyContext A context object provided for the copyFunc when copying this component
 * @param props.copyFunc A function that copies the component
 * @param props.cleanupFunc A function that runs for cleaning up resources used by this work component
 * @param props.anchorFunc A function that selects this component for anchoring as a source or target of a connector
 * @param props.ChildComponent The child component that is put in this component
 * @param props.childProps The props to pass to the child component
 * @param props.isConnecting Whether another component had already been selected for anchoring a connector
 * @param props.containedType The type of the component inside
 * @param props.scale The scale factor for the component
 * @param props.boardId The board id
 * @param props.boardType The current board type
 * @param props.resetAnchor Resets the ongoing connection anchoring an arrow between 2 connections
 * @param props.usageMode The usage mode of the work area
 * @param props.label The component label
 * @param props.createdBy Information on which userId created component
 * @param props.contextManager The context manager of the board group
 */
const WorkComponent = memo((props) => {
    const {
        id,
        stateTestId,
        size,
        left,
        top,
        copyContext,
        copyFunc,
        cleanupFunc,
        anchorFunc,
        ChildComponent,
        childProps,
        isConnecting,
        containedType,
        scale,
        boardId,
        boardType,
        usageMode,
        label,
        createdBy,
        contextManager,
        handleContextMenu
    } = props;
    const { showBoundary } = useErrorBoundary();
    const studentOnBoardScript = contextManager.userRole === USER_ROLES.STUDENT && boardType === BOARD_TYPES.CLASS;
    const adminPreview = contextManager.adminPreview;
    const store = useStore();
    const dispatch = useDispatch();
    // Variable is sent as a prop to child component tools and sends a notification to open their 'Edit Modals' when modified. Required for use on tablet/mobile devices.
    const [childToolEditModalStatus, forceUpdateChildToolEditModalStatus] = useState(0);
    const [childHasEventControl, setChildHasEventControl] = useState(false);
    const [comments, setComments] = useState(false); // displays number of comments (if any), if false and gives an option to add comment if true
    const commentsList = useSelector((state) => selectComment(state, childProps.docName));
    const [exportImportEvents, setExportImportEvents] = useState({ deepExport: 0, deepImport: 0, PDFExport: 0, CSVExport: 0, CSVImport: 0, CSVPrototype: 0 });
    const [{ isDragging }, drag, preview] = useDrag(
        () => ({
            type: ItemTypes.WorkComponent,
            item: () => {
                return { id, left, top, type: ItemTypes.WorkComponent, containedType: containedType, boardId };
            },
            collect: (monitor) => ({
                isDragging: monitor.isDragging()
            })
        }),
        [id, left, top]
    );

    /** Disable default react-dnd drag view */
    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true });
    }, [preview]);
    // if (isDragging) {
    //     return null;
    // }

    const handleExportImportEvents = (exportImportKey) => {
        const tempExportImportEventsState = { ...exportImportEvents };
        tempExportImportEventsState[exportImportKey] = tempExportImportEventsState[exportImportKey] + 1;
        setExportImportEvents(tempExportImportEventsState);
    };

    const openContextMenu = (event) => {
        handleContextMenu({
            id: adminPreview ? `${id}-adminPreview` : studentOnBoardScript ? `${id}-menu-skriptStudent` : `${id}-menu`,
            event: event,
            isComponent: true
        });
    };

    // TODO: if not needed, pass func directly from parent
    const onCopy = useCallback((event, props) => {
        const selector = getContextSelectorForSlice(containedType);
        const fullContext = selector(store.getState(), childProps.docName); // TODO: check if hack is valid
        const { createdBy, ...rest } = copyContext;
        copyFunc({ ...rest, createdBy: contextManager.userId, fullContext, size, label: { ...label } });
    }, [store, size]); // copyContext is constant and can be omitted from list

    const arrowAnchorOnClick = () => {
        anchorFunc(id);
    };

    // Prepare the child component props appropriately by addition/removal of keys.
    // Example: The 'childToolEditModalStatus' is only added when used on a mobile device to enable the 'Edit Tool Modal' functionality.
    const prepareChildComponentProps = () => {
        const childPropsObj = { ...childProps };
        childPropsObj.boardType = boardType;
        if (childToolEditModalStatus > 0) {
            childPropsObj.childToolEditModalStatus = childToolEditModalStatus;
        }
        return childPropsObj;
    };

    // For mobile/tablet devices, define the 'Tools' for which the 'Edit Modal' option should be displayed in the contextual menu
    const enableEditOptionContextMenu = () => {
        const accessFlag = contextManager.toolList.some((tool, index) => {
            return (containedType === tool.type && (!tool.accessibleUserRoles || (tool.accessibleUserRoles && tool.accessibleUserRoles.includes(contextManager.userRole))));
        });
        if (ChildComponent && ChildComponent.name && EDITABLE_COMPONENTS.includes(containedType) && accessFlag) { // isMobileDevice()
            return true;
        }
        return false;
    };

    const containerStyle = useMemo(() => getContainerStyles(left, top, isDragging, scale), [left, top, isDragging, scale]);

    const resizableBoxWidth = containedType === TOOL_TYPES.SPREADSHEET ? 'fit-content' : size.width || DEFAULT_BOX_SIZE;

    const resizableBoxHeight = (containedType === TOOL_TYPES.SPREADSHEET ? 'fit-content' : size.height || (DEFAULT_BOX_SIZE));

    const resizableBoxResizeHandles = containedType === TOOL_TYPES.SPREADSHEET ? [] : ['se'];

    const onResizeComponent = (data) => {
        // aktuelle umsetzung nur lokal für den Student die Größe änderbar wird bei neuladem des skripts überschrieben
        if (!studentOnBoardScript) { dispatch(updateSize(boardId, id, data.size)); }
    };

    const createLabel = (e) => {
        const labelPrompt = prompt('Label Eingeben:', label ? label.description : '');
        if (labelPrompt) {
            const labelId = generatePseudoRandomId();
            dispatch(boardAddLabel(boardId, labelId, labelPrompt, label.flag, label.count, id));
        }
    };

    const addComment = (e) => {
        setComments(!comments);
    };

    const handleFlag = () => {
        dispatch(boardAddLabel(boardId, label.labelId, label.description, !label.flag, !label.flag ? label.count + 1 : label.count, id));
        dispatch(addFlag(boardId, id, !label.flag, !label.flag ? label.count + 1 : label.count));
    };

    return (
        <>
            <ResizableBox
                id={id}
                data-testid='workComponent'
                stateTestId = {stateTestId}
                componentclass = {'BoardComponent'}
                width={Number(resizableBoxWidth)}
                height={Number(resizableBoxHeight)}
                minConstraints={[MIN_BOX_SIZE, MIN_BOX_SIZE]}
                style={containerStyle}
                onResizeStop={(e, data) => {
                    try {
                        stopPropagationAndPreventDefault(e);
                        onResizeComponent(data);
                    } catch (err) {
                        showBoundary(err);
                    }
                }}
                onResize={stopPropagationAndPreventDefault}
                onResizeStart={stopPropagationAndPreventDefault}
                resizeHandles={resizableBoxResizeHandles}
            >
                <Card
                    data-testid='workComponentCard'
                    style={CARD_STYLE}
                    id={`${id}-inner`}
                    ref={ usageMode === USAGE_MODES.DISPLACE ? drag : undefined }
                    variant='outlined'
                    onContextMenu={(e) => { try { childHasEventControl ? stopPropagationAndPreventDefault(e) : openContextMenu(e); } catch (err) { showBoundary(err); } }}
                    onDoubleClick={(e) => { try { childHasEventControl ? stopPropagationAndPreventDefault(e) : openContextMenu(e); } catch (err) { showBoundary(err); } }}
                    onClick={(event) => {
                        // event.stopPropagation();
                        try {
                            isConnecting && arrowAnchorOnClick();
                        } catch (err) {
                            showBoundary(err);
                        }
                    }}
                    onMouseMove={(e) => { try { if (childHasEventControl) { stopPropagationAndPreventDefault(e); } } catch (err) { showBoundary(err); } }}
                    onMouseDown={(e) => { try { if (childHasEventControl) { stopPropagationAndPreventDefault(e); } } catch (err) { showBoundary(err); } }}
                    onMouseUp={(e) => { try { if (childHasEventControl) { stopPropagationAndPreventDefault(e); } } catch (err) { showBoundary(err); } }}
                    onTouchMove={(e) => { try { if (childHasEventControl) { stopPropagationAndPreventDefault(e); } } catch (err) { showBoundary(err); } }}
                    onTouchCancel={(e) => { try { if (childHasEventControl) { stopPropagationAndPreventDefault(e); } } catch (err) { showBoundary(err); } }}
                    // for some reason doesnt work with touch
                >
                    {/* <CardHeader style={WORK_COMPONENT_HEADER_STYLE} title={label ? `${label.description}-${createdBy}` : 'Unbenannt'} disableTypography={true} /> */}
                    <div style={label ? label.flag ? ATTENTION_REQUIRED_STYLE : WORK_COMPONENT_HEADER_STYLE : WORK_COMPONENT_HEADER_STYLE}>{label ? `${label.description}-${createdBy}` : 'Unbenannt'}</div>
                    {/* <div> */}
                    <ErrorBoundary FallbackComponent={ ErrorToolComponent } onError={ logError }>
                        <ChildComponent
                            { ...prepareChildComponentProps() }
                            setChildHasEventControl={setChildHasEventControl}
                            contextManager={contextManager}
                        />
                    </ErrorBoundary>
                    {/* </div> */}
                </Card>
                <Box sx = {{ alignItems: 'right', textAlign: 'right' }}>
                    <Button onClick = {(e) => { try { addComment(e); } catch (err) { showBoundary(err); } }} sx = {{ color: '#989898' }}><Typography sx = {{ background: 'transparent', fontSize: 'small', textTransform: 'none' }}>Kommentare({ commentsList ? commentsList.length || 0 : 0 })</Typography></Button>
                </Box>
                <ErrorBoundary FallbackComponent={ ErrorToolComponent } onError={ logError }>

                    { comments && <Comments
                        docName = {childProps.docName}
                        contextManager={contextManager}
                        width={Number(resizableBoxWidth)}>
                    </Comments>

                    }
                </ErrorBoundary>

            </ResizableBox>
            <ErrorBoundary FallbackComponent={ ErrorToolComponent } onError={ logError }>
                <Menu id={`${id}-menu`}>
                    {
                        enableEditOptionContextMenu() &&
                    <Item data-testid='editComponentButton'
                        onClick={() => forceUpdateChildToolEditModalStatus(prev => prev + 1)}
                    >
                        <label style={CONTEXT_MENU_LABEL_STYLE}><Edit /></label>Bearbeiten
                    </Item>
                    }
                    {containedType !== TOOL_TYPES.COMMENT && <Item onClick={(e) => { try { onCopy(e); } catch (err) { showBoundary(err); } }} data-testid='copyComponentButton' ><label style={CONTEXT_MENU_LABEL_STYLE}><FileCopy /></label>Kopieren</Item>}
                    <Item onClick={(e) => { try { cleanupFunc(e); } catch (err) { showBoundary(err); } }} data-testid = 'removeComponentButton'><label style={CONTEXT_MENU_LABEL_STYLE}><Delete /></label>Löschen</Item>
                    <Separator />
                    <Item onClick={arrowAnchorOnClick} data-testid='connection'><label style={CONTEXT_MENU_LABEL_STYLE}><SettingsInputComponent /></label>Verbinden</Item>
                    { (containedType !== TOOL_TYPES.PROGRESS_TRACKER || contextManager.userRole === USER_ROLES.ADMIN) && <Item onClick={createLabel} data-testid='labeling'><label style={CONTEXT_MENU_LABEL_STYLE}><Label /></label>Label</Item> }
                    { !label.flag && <Item onClick={(e) => { try { handleFlag(e); } catch (err) { showBoundary(err); } }}><label style={CONTEXT_MENU_LABEL_STYLE}><PriorityHigh></PriorityHigh></label>Bitte um Rückmeldung</Item> }
                    { label.flag && <Item onClick={(e) => { try { handleFlag(e); } catch (err) { showBoundary(err); } }}><label style={CONTEXT_MENU_LABEL_STYLE}><Done></Done></label>Resolved</Item> }
                    {/* <Item onClick={addComment} data-testid='labeling'><label style={CONTEXT_MENU_LABEL_STYLE}><Comment /></label>Add Comment</Item> */}
                    {containedType === TOOL_TYPES.SPREADSHEET
                        ? <Item onClick={() => handleExportImportEvents('CSVExport')} data-testid='deepExport'><label style={CONTEXT_MENU_LABEL_STYLE}></label><CsvSpreadsheetExport id={id} boardId={boardId} triggerEvent={exportImportEvents.CSVExport}/></Item>
                        : <></>
                    }
                </Menu>
                <Menu id={`${id}-menu-skriptStudent`}>
                    <Item onClick={(e) => { try { onCopy(e); } catch (err) { showBoundary(err); } }}><label style={CONTEXT_MENU_LABEL_STYLE}><FileCopy /></label>Kopieren</Item>
                </Menu>
                <Menu id={`${id}-adminPreview`}>
                    { !label.flag && <Item onClick={(e) => { try { handleFlag(e); } catch (err) { showBoundary(err); } }}><label style={CONTEXT_MENU_LABEL_STYLE}><PriorityHigh></PriorityHigh></label>Bitte um Rückmeldung</Item> }
                    { label.flag && <Item onClick={(e) => { try { handleFlag(e); } catch (err) { showBoundary(err); } }}><label style={CONTEXT_MENU_LABEL_STYLE}><Done></Done></label>Resolved</Item> }
                </Menu>
            </ErrorBoundary>

        </>
    );
});
WorkComponent.displayName = 'WorkComponent';
export default WorkComponent;
