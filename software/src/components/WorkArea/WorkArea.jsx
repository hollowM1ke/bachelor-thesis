import React, { useEffect, useRef, useState, useMemo } from 'react';
import Xarrow from 'react-xarrows';
import { Item, Menu, contextMenu, useContextMenu, Separator } from 'react-contexify';
import 'react-contexify/ReactContexify.css';
import WorkComponent from '../WorkComponent/WorkComponent';
import {
    MOUSE_BOX_STYLE,
    WORK_AREA_STYLE,
    getContainerStyle,
    ADD_ITEM_POINTER_STYLE,
    WORK_AREA_DISABLED_STYLE
} from './workAreaStyles';
import { useSelector, useDispatch } from 'react-redux';
import { selectBoard } from '../../model/features/boards/boardsSlice';
import { generatePseudoRandomId } from '../../services/ids';
import { getAnchorArrow, getRemoveArrow, getResetAnchor } from './Arrow';
import { getAddBox, getMoveBox, getRemoveBox } from './ManipulateBox';
import { getUseDrop } from './OnAction';
import { getToolComponent } from '../Tools/toolTypes';
import { USAGE_MODES } from '../Board/usageModes';
import { CONTEXT_MENU_LABEL_STYLE, DEFAULT_BOX_SIZE } from '../WorkComponent/WorkComponentStyles';
import { USER_ROLES } from '../users/users';
import { BOARD_TYPES } from '../Board/boardConfig';
import './WorkArea.css';
import { stopPropagationAndPreventDefault } from '../../services/DOM';
import { throttle } from 'lodash';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useErrorBoundary } from 'react-error-boundary';

// const DEFAULT_BOARD_ACCURACY = 3; // 3 decimal places
const MENU_ID = 'comp_menu';
// const MIN_DISTANCE_RERENDER = 10; // The minimum distance in pixels required to register a change in the mouse pointer position
// const DEFAULT_BOARD_ID = 'default_board';
const DEFAULT_ARROW_SIZE = 4;
const ARROW_SCALE_MULTIPLIER = 1;

/**
 * Represents the area on a board where component boxes are manipulated
 * @param props.selectedItemType The type of work component selected to be added onto the board
 * @param props.resetSelectedItemType Resets the selection of a work component type
 * @param props.scale The current board scale
 * @param props.boardId The id of the board
 * @param props.copyData The context data for copying work component
 * @param props.setCopyData Sets the copy data for copying a work component
 * @param props.displacement The displacement of the board
 * @param props.setDisplacement Sets the displacement of the board
 * @param props.selectedLabelInfo The info of the selected label
 * @param props.resetLabelInfo Reset the info of the selected label for a board
 * @param props.resetZoom Resets the current zoom to 1.0x
 * @param props.usageMode The usage mode of the work area
 * @param props.contextManager The context manager of the board group
 * @param props.boardType The current board type
 * @param props.closeDrawerHandler Close the toolbox drawer when a new component is added to the board
 * @param props.openDrawerHandler Open the toolbox drawer when choosen in the context menu
 * @param props.changeExpandedAccordion Change the expanded accordion in the toolbox drawer
 */
function WorkArea (props) {
    const {
        selectedItemType,
        resetSelectedItemType,
        scale,
        boardId,
        copyData,
        setCopyData,
        displacement,
        setDisplacement,
        selectedLabelInfo,
        resetLabelInfo,
        resetZoom,
        usageMode,
        contextManager,
        boardType,
        closeDrawerHandler,
        openDrawerHandler,
        changeExpandedAccordion,
        mousePositionRef
    } = props;
    const { showBoundary } = useErrorBoundary();
    const boardMenuId = `${MENU_ID}-${boardId}`;
    /** mock ContextMenu that is shown when students click on the script-board   */
    // const boardId = DEFAULT_BOARD_ID; // Todo get board id
    const dispatch = useDispatch();
    const ref = useRef(); // reference current DOM node to calculate offset for dropped elements
    /** A reference to the a component which tracks the mouse pointer */
    const mouseLocRef = useRef();
    /** enables/disables the component that tracks the mouse pointer */
    const [showMousePointer, setShowMousePointer] = useState(false);
    /** The core state required by the board */
    const { components, connections, sizes } = useSelector((state) => selectBoard(state, boardId));
    /** A reference to the current selected board (This is used to add connections between components by selecting to consecutive components) */
    const [currentAnchor, setCurrentAnchor] = useState();
    /** A generic context menu, ids are provided dynamically */
    const { show } = useContextMenu();
    /** Determines if the board view is being displaced */
    const [isDisplacing, setIsDisplacing] = useState(false);
    /** Used to track the deltas between positions when displacing the board view */

    const [lastPos, setLastPos] = useState(undefined);

    // Throttle translate updates to 16 milliseconds (roughly 60 times a second)
    const setThrottledDisplacement = useMemo(() => throttle((delta, pos) => {
        setDisplacement(delta);
        setLastPos(pos);
    }, 16), []);

    // If a label is selected alter the displacement then de-select it
    useEffect(() => {
        if (selectedLabelInfo) {
            const selectedComponent = components[selectedLabelInfo.componentId];
            if (selectedComponent) {
                // Center at labeled Work Component
                let centerDisplaceLeft = 0;
                let centerDisplaceTop = 0;
                resetZoom();
                if (ref.current) {
                    const boundingRect = ref.current.getBoundingClientRect();
                    centerDisplaceTop = (boundingRect.bottom - boundingRect.top) / 2;
                    centerDisplaceLeft = (boundingRect.right - boundingRect.left) / 2;
                }
                setThrottledDisplacement({
                    left: Math.round((-selectedComponent.position.x + centerDisplaceLeft)),
                    top: Math.round((selectedComponent.position.y - centerDisplaceTop))
                });
            }
            resetLabelInfo(boardId);
        }

        // Close the context menus
        closeContextMenus();
    }, [selectedLabelInfo, scale, displacement]); // detect a change in label selection

    /** Initiates the board state */
    useEffect(() => {
        contextManager.loadBoard(boardId);
        // return () => dispatch(unloadBoard(boardId)); // Commenting line for the split board. Todo: will need to unload the boards
    }, [boardId]);

    /** manipulateBox.js **/
    const moveBox = getMoveBox(dispatch, boardId);

    const addBox = getAddBox(dispatch, boardId, contextManager);

    const removeBox = getRemoveBox(dispatch, boardId);

    /** Arrow.js **/
    const resetAnchor = getResetAnchor(setCurrentAnchor, setShowMousePointer);
    const anchorArrow = getAnchorArrow(dispatch, boardId, setCurrentAnchor, setShowMousePointer, resetAnchor);
    const removeArrow = getRemoveArrow(dispatch, boardId);

    /** effects **/
    const [, drop] = getUseDrop(displacement, scale, moveBox, usageMode, boardId);

    const copyComponent = ({ innerId, type, size, fullContext, createdBy, createdOn, label }) => {
        setCopyData({
            innerId,
            type,
            size,
            fullContext,
            createdBy,
            createdOn,
            label
        });
    };

    /**
     * Handles clicking the work area, this is the case when items are supposed to be added by drag and drop from the toolbar
     * @param waX the relative x offset in the workArea
     * @param waY the relative y offset in the workArea
     * @param itemType the item type or if none is provided the currently selectedItemType
     */
    const onClickWorkArea = (waX, waY, itemType = selectedItemType) => {
        // Lazy update the mouse location
        updateMouseLocation(waX, waY);

        // No tool selected, means nothing to do
        if (!itemType) {
            closeDrawerHandler();
            return;
        }

        // Show a warning if the user does not have permissions
        if (!canEditBoard) {
            toast.warn('Keine Berechtigung zum Bearbeiten des Skriptes!');
            return;
        }

        // Now compute the actual positions on the canvas here
        const { x, y } = relPositionToCanvas(waX, waY);
        addBox(itemType, x, y, generatePseudoRandomId(), generatePseudoRandomId());
        resetSelectedItemType();
        closeDrawerHandler();
    };

    /**
     * Translates relative positions within the workarea to the canvas/board coordinates.
     * @param x the left (x) offset
     * @param y the top (y) offset
     * @returns the scaled and adjusted positions
     */
    const relPositionToCanvas = (x, y) => {
        return { x: (x / scale) - (displacement.left), y: (y / scale) + (displacement.top) };
    };

    const handleContextMenu = ({ event, id, props = undefined, isComponent = false }) => {
        event.preventDefault();
        event.stopPropagation();
        updateMouseLocation(getRelMousePositionFromEvent(event));

        // UX improvement: if theres an on-going "tool drop" cancel it on rightclick
        if (selectedItemType) {
            resetSelectedItemType();
            return;
        }

        // Students are not allowed to open a context menu on the class board.
        if (!canEditBoard && !isComponent) {
            // Silently discard the request, no need to inform the user
            toast.warn('Keine Berechtigung zum Bearbeiten des Skript-Boards!');
            closeContextMenus();
            return;
        }

        resetAnchor();
        resetSelectedItemType();
        show({ event, props, id });
    };

    const openContextMenu = (event) => {
        handleContextMenu({
            event,
            id: boardMenuId
        });
    };

    const getRelMousePositionFromEvent = (event) => {
        return computeRelativeMousePosition(event.clientX, event.clientY);
    };

    const pasteComponent = ({ triggerEvent }) => {
        const innerId = generatePseudoRandomId();
        // const loadFunc = getLoadReducerForSlice(copyData.type);
        contextManager.loadComponent(boardId, innerId, copyData.type, copyData.fullContext);
        // dispatch(loadFunc({ id: innerId, boardId, initialState: copyData.fullContext }));\
        const ctxClickPos = getRelMousePositionFromEvent(triggerEvent);
        const { x, y } = relPositionToCanvas(ctxClickPos.x, ctxClickPos.y);
        addBox(copyData.type, x, y, generatePseudoRandomId(), innerId, copyData.size, undefined, undefined, (copyData.label ? copyData.label.description : undefined));
        setCopyData(undefined);
    };

    const handleCTXToolClick = ({ data, triggerEvent }) => {
        const { x, y } = getRelMousePositionFromEvent(triggerEvent);
        onClickWorkArea(x, y, data.type);
    };

    const menuTools = contextManager.toolList.map((tool, index) => {
        if (contextManager.recentlyUsedTools.includes(tool.type) && (!tool.accessibleUserRoles || (tool.accessibleUserRoles && tool.accessibleUserRoles.includes(contextManager.userRole)))) { // && tool.contextMenuOrder
            const ToolIcon = tool.icon;
            return (
                <Item key={index} data-testid={'Komp' + index} data={{ type: tool.type }} onClick={ (e) => { try { handleCTXToolClick(e); } catch (err) { showBoundary(err); } } }><label style={CONTEXT_MENU_LABEL_STYLE}><ToolIcon/></label>{tool.name}</Item>
            );
        }
        return <></>;
    });

    const [mouseArrowPosition, _updateMouseLocation] = useState({
        x: 0,
        y: 0
    });

    // Throttle mouse location updates to a maximum of 50 events per second
    const updateMouseLocation = useMemo(() => throttle((pos) => {
        _updateMouseLocation(pos);
    }, 20), []);

    // Get mouse position relative to base board element
    const computeRelativeMousePosition = (x, y) => {
        const { offsetTop, offsetLeft } = mousePositionRef.current;

        return { x: x - offsetLeft, y: y - offsetTop };
    };

    /**
     * Closes all open context menus
     */
    const closeContextMenus = () => {
        contextMenu.hideAll();
    };

    const triggerDisplace = (e) => {
        // If this is the right click button, ignore it
        if (e.which === 3 || e.button === 2) {
            return;
        }

        setIsDisplacing(true);
        setLastPos(undefined);
    };

    const cancelDisplace = (event) => {
        setIsDisplacing(false);
        setLastPos(undefined);
    };

    const mouseMoveHook = (event) => {
        // OnMouseMove: Prevent text from being higlighted on displacement
        if (event.type === 'mousemove' && isDisplacing) {
            event.preventDefault();
        }

        // If the "connector arrow is being moved, update its position"
        if (showMousePointer) {
            // Cancel any displacement that is in progress
            cancelDisplace(event);

            // Update the mouse location for the arrows only
            updateMouseLocation(computeRelativeMousePosition(event.clientX, event.clientY));
        } else if (usageMode === USAGE_MODES.PAN) {
            // Stop! Dont move if the displacement was not triggered
            if (!isDisplacing) {
                return;
            }

            const x = event.touches == null ? event.pageX : event.touches[0].clientX;
            const y = event.touches == null ? event.pageY : event.touches[0].clientY;

            const deltaX = !lastPos ? 0 : (x - lastPos.x) / scale;
            const deltaY = !lastPos ? 0 : (y - lastPos.y) / scale;

            setThrottledDisplacement(
                { left: displacement.left + deltaX, top: displacement.top - deltaY },
                { x, y }
            );
        }
    };

    const handleWorkAreaClick = (event) => {
        const { x, y } = getRelMousePositionFromEvent(event);
        onClickWorkArea(x, y);
    };

    const [canEditBoard, setCanEditBoard] = React.useState(false);
    useEffect(() => {
        setCanEditBoard(!((contextManager.userRole === USER_ROLES.STUDENT && boardType === BOARD_TYPES.CLASS) || contextManager.adminPreview));
    }, [selectedItemType, contextManager.userRole, boardType]);

    return (
        <div ref={ref} style={getContainerStyle(Boolean(selectedItemType), ADD_ITEM_POINTER_STYLE)}>
            <div
                data-testid = {'workArea-' + boardId}
                ref={drop}
                onContextMenu={ (e) => { try { openContextMenu(e); } catch (err) { showBoundary(err); } }}
                onDoubleClick={ (e) => { try { openContextMenu(e); } catch (err) { showBoundary(err); } } }
                style={Object.assign({},
                    WORK_AREA_STYLE,
                    (!canEditBoard && selectedItemType) && WORK_AREA_DISABLED_STYLE)}
                onClick={(e) => { try { handleWorkAreaClick(e); } catch (err) { showBoundary(err); } }}
                onMouseDown={(e) => { try { usageMode === USAGE_MODES.PAN ? triggerDisplace(e) : stopPropagationAndPreventDefault(e); } catch (err) { showBoundary(err); } }}
                onMouseUp={(e) => { try { usageMode === USAGE_MODES.PAN ? cancelDisplace(e) : stopPropagationAndPreventDefault(e); } catch (err) { showBoundary(err); } }}
                onMouseLeave={(e) => { try { usageMode === USAGE_MODES.PAN ? cancelDisplace(e) : stopPropagationAndPreventDefault(e); } catch (err) { showBoundary(err); } }}
                onTouchStart={(e) => { try { if (usageMode === USAGE_MODES.PAN) { triggerDisplace(e); } } catch (err) { showBoundary(err); } }}
                onTouchEnd={(e) => { try { if (usageMode === USAGE_MODES.PAN) { cancelDisplace(e); } } catch (err) { showBoundary(err); } }}
                onMouseMove={ (e) => { try { mouseMoveHook(e); } catch (err) { showBoundary(err); } }}
                onTouchMove={ (e) => { try { mouseMoveHook(e); } catch (err) { showBoundary(err); } }}
            >

                {Boolean(showMousePointer) && <div ref={mouseLocRef} style={{ ...MOUSE_BOX_STYLE, left: mouseArrowPosition.x, top: mouseArrowPosition.y }} />}
                {
                    sortWorkComponentKeys(components, sizes).map((key) => {
                        const { type, innerId, position, label, createdBy, createdOn, loadSkip, isExternal } = components[key];
                        // const dropTargetXy = ref.current.getBoundingClientRect();
                        const left = position.x;
                        const top = position.y;
                        // Useful for relative coords. Currently not used
                        let roundedLeft = left; // Math.round(left);
                        let roundedTop = top; // Math.round(top);
                        roundedLeft += displacement.left;
                        roundedTop -= displacement.top;
                        roundedLeft *= scale;
                        roundedTop *= scale;
                        const cleanupFunc = removeBox.bind(null, key);
                        const size = getComponentSize(key, components);
                        const settingsObject = {};
                        switch (type) {
                        case 'spreadsheet':
                            settingsObject.isExternal = isExternal;
                            settingsObject.loadSkip = loadSkip;
                            break;
                        default:
                            break;
                        }
                        return (
                            <WorkComponent
                                key={key}
                                id={key}
                                size={size}
                                containedType={type}
                                copyContext={{ innerId, type, size, createdBy, createdOn }}
                                copyFunc={copyComponent}
                                left={roundedLeft}
                                top={roundedTop}
                                cleanupFunc={cleanupFunc}
                                anchorFunc={(data) => anchorArrow(currentAnchor, data)}
                                ChildComponent={getToolComponent(type)}
                                childProps={{ docName: innerId, boardId, containerId: key, contextManager, settingsObject }}
                                isConnecting={Boolean(currentAnchor)}
                                scale={scale}
                                boardId={boardId}
                                boardType={boardType}
                                usageMode={usageMode}
                                contextManager={contextManager}
                                label={label}
                                createdBy={createdBy}
                                openDrawerHandler={openDrawerHandler}
                                handleContextMenu={handleContextMenu}
                            />
                        );
                    })
                }
                {
                    // Note: Xarroww breaks on undefined targets, filter first.
                    connections.filter(({ from, to }) => from && to).map(({ from, to }, idx) =>
                        <Xarrow
                            data-testid = 'arrow'
                            key={`arrow-${from}/${to}`}
                            start={from}
                            end={to}
                            passProps={{ onDoubleClick: (e) => { e.stopPropagation(); removeArrow(from, to); } }}
                            strokeWidth={DEFAULT_ARROW_SIZE * scale * ARROW_SCALE_MULTIPLIER}
                        />
                    )
                }
                {
                    Boolean(currentAnchor) &&
                    <Xarrow
                        start={currentAnchor}
                        end={mouseLocRef}
                        endAnchor='middle'
                        strokeWidth={DEFAULT_ARROW_SIZE * scale * ARROW_SCALE_MULTIPLIER}
                    />
                }
                <Menu id={boardMenuId}>
                    <Item key="insert" data={{ type: 'insert' }} data-testid= 'insertButton' disabled={!copyData} onClick={(e) => { try { pasteComponent(e); } catch (err) { showBoundary(err); } }}>Einfügen</Item>
                    <Separator key='separator' />
                    { menuTools }
                    <Item key="alltools" onClick={() => { try { openDrawerHandler(); changeExpandedAccordion({ toolbox: true, cloneOptions: false }); } catch (err) { showBoundary(err); } }}><label style={CONTEXT_MENU_LABEL_STYLE}></label>Alle Tools</Item>
                </Menu>
            </div>
        </div>
    );
}

function sortWorkComponentKeys (components) {
    return Object.keys(components).sort((first, snd) => area(snd, components) - area(first, components));
}

function area (key, components) {
    const componentSize = getComponentSize(key, components);
    return componentSize.width * componentSize.height;
}

function getComponentSize (key, components) {
    return ((components[key] && components[key].size) || { width: DEFAULT_BOX_SIZE, height: DEFAULT_BOX_SIZE });
}

export default WorkArea; // React.memo(WorkArea, propsComparator);
