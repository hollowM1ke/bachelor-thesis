import React, { useEffect, useState } from 'react';
import { useStyles } from './boardStyles';
import { useTheme } from '@mui/material/styles';

import clsx from 'clsx';
import ZoomPanBoardLayer from './ZoomPanBoardLayer';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import { ErrorWorkboard, logError } from '../ErrorBoundaries/ErrorFallbacks';
import { formulateBoardId } from '../users/boardIds';
/**
 * The white board view where the different board tab views are shown
 * @param props.tabValue The active tab
 * @param props.selectedItemType The type of work component selected to be added onto the board
 * @param props.resetSelectedItemType Resets the selection of a work component type
 * @param props.selectedLabelInfo The info of the selected label
 * @param props.resetLabelInfo Reset the info of the selected label for a board
 * @param props.activeExperiment The currently active experiment
 * @param props.contextManager The context manager
 * @param props.closeDrawerHandler Close the toolbox drawer when a new component is added to the board
 * @param props.openDrawerHandler Open the toolbox drawer when chosen in the ContextMenu
 * @param props.changeExpandedAccordion Sets the expanded state of the accordion in the Drawer
 */

export default function BoardTabViews ({
    themeFlag,
    tabValue,
    selectedItemType,
    resetSelectedItemType,
    selectedLabelInfo,
    resetLabelInfo,
    activeExperiment,
    contextManager,
    closeDrawerHandler,
    leftindex,
    openDrawerHandler,
    changeExpandedAccordion
}) {
    const {
        mixins: { toolbar }
    } = useTheme();
    const { showBoundary } = useErrorBoundary();
    const styleClasses = useStyles();
    const [copyData, setCopyData] = useState();
    const [leftSideindex, setLeftSideIndex] = useState(0);
    const [rightSideindex, setRightSideIndex] = useState(1);
    // Start Section for resize of the split board width ----------------------------------------------------------------------------------------------------------------
    let resizer;
    let leftSide;
    let rightSide;
    let leftWidth = 0;
    // Just a state so we can pass down to the children that a resize is has been done and the offset needs to be computed again in the ZoomPanBoardLayer
    // Is changed in the mouseUpHandler when the resize of the split board is done
    const [resizeTagState, setResizeTagState] = useState(false);
    // The current position of mouse
    let x = 0;
    useEffect(() => {
        if (rightSideindex !== leftindex && leftSideindex !== leftindex) {
            setLeftSideIndex(leftindex);
        }
    }, [leftindex]);
    const setupResize = () => {
        resizer = document.getElementById('dragMe');
        leftSide = resizer.previousElementSibling;
        rightSide = resizer.nextElementSibling;
    };

    // Handle the mousedown event
    // that's triggered when user drags the resizer
    const mouseDownHandler = function (e) {
        e.stopPropagation();
        if (!resizer) {
            setupResize();
        }
        // Get the current mouse position
        x = e.clientX;
        leftWidth = leftSide.getBoundingClientRect().width;

        // Attach the listeners to `document`
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    };

    const mouseMoveHandler = (e) => {
        // How far the mouse has been moved
        const dx = e.clientX - x;
        const newLeftWidth = ((leftWidth + dx) * 100) / resizer.parentNode.getBoundingClientRect().width;
        leftSide.style.width = `${newLeftWidth}%`;
        leftSide.style.userSelect = 'none';
        leftSide.style.pointerEvents = 'none';

        rightSide.style.width = `${100 - newLeftWidth}%`;
        rightSide.style.userSelect = 'none';
        rightSide.style.pointerEvents = 'none';

        resizer.style.cursor = 'col-resize';
        document.body.style.cursor = 'col-resize';
    };

    const mouseUpHandler = () => {
        resizer.style.removeProperty('cursor');
        document.body.style.removeProperty('cursor');

        leftSide.style.removeProperty('user-select');
        leftSide.style.removeProperty('pointer-events');

        rightSide.style.removeProperty('user-select');
        rightSide.style.removeProperty('pointer-events');
        setResizeTagState(!resizeTagState);
        // Remove the handlers of `mousemove` and `mouseup`
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
    };

    const touchStartHandler = function (e) {
        e.stopPropagation();
        if (!resizer) {
            setupResize();
        }
        // Get the current mouse position
        x = e.touches[0].clientX;
        leftWidth = leftSide.getBoundingClientRect().width;

        // Attach the listeners to `document`
        document.addEventListener('touchmove', touchMoveHandler);
        document.addEventListener('touchend', touchEndHandler);
    };

    const touchMoveHandler = (e) => {
        // How far the mouse has been moved
        const dx = e.touches[0].clientX - x;

        const newLeftWidth = ((leftWidth + dx) * 100) / resizer.parentNode.getBoundingClientRect().width;
        leftSide.style.width = `${newLeftWidth}%`;
        leftSide.style.userSelect = 'none';
        leftSide.style.pointerEvents = 'none';

        rightSide.style.width = `${100 - newLeftWidth}%`;
        rightSide.style.userSelect = 'none';
        rightSide.style.pointerEvents = 'none';

        resizer.style.cursor = 'col-resize';
        document.body.style.cursor = 'col-resize';
    };

    const touchEndHandler = () => {
        resizer.style.removeProperty('cursor');
        document.body.style.removeProperty('cursor');

        leftSide.style.removeProperty('user-select');
        leftSide.style.removeProperty('pointer-events');

        rightSide.style.removeProperty('user-select');
        rightSide.style.removeProperty('pointer-events');

        // Remove the handlers of `touchmove` and `touchend`
        document.removeEventListener('touchmove', touchMoveHandler);
        document.removeEventListener('touchend', touchEndHandler);
    };
    // End Section for resize of the split board width ----------------------------------------------------------------------------------------------------------------
    const boardTabs = contextManager.boardConfigs.map((config, index) => {
        return (
            <TabPanel value={tabValue} index={index} key={index}>
                <ErrorBoundary key={ index + 'Error'} FallbackComponent={ ErrorWorkboard } onError={ logError }>
                    <ZoomPanBoardLayer
                        themeFlag={themeFlag}
                        mousePositionId={'wholeBoard'}
                        previewOnly={false}
                        selectedItemType={selectedItemType}
                        resetSelectedItemType={resetSelectedItemType}
                        boardId={formulateBoardId(config, contextManager.userId, contextManager.groupName, activeExperiment)}
                        copyData={copyData}
                        selectedLabelInfo={selectedLabelInfo[formulateBoardId(config, contextManager.userId, contextManager.groupName, activeExperiment)]}
                        resetLabelInfo={resetLabelInfo}
                        setCopyData={setCopyData}
                        contextManager={contextManager}
                        activeExperiment={activeExperiment}
                        boardType={config.type}
                        boardConfig={config}
                        closeDrawerHandler={closeDrawerHandler}
                        openDrawerHandler={openDrawerHandler}
                        changeExpandedAccordion={changeExpandedAccordion}
                    />
                </ErrorBoundary>
            </TabPanel>
        );
    });
    return (
        <div
            className={clsx(styleClasses.content, {
                [styleClasses.contentShift]: open
            })}
            style={{
                display: 'flex',
                flexDirection: 'row',
                padding: '0',
                width: '100%',
                height: `calc(100vh - (${toolbar?.minHeight}px + ${8}px))`
            }}
        >
            { boardTabs }
            { !contextManager.adminPreview && <TabPanel value={tabValue} index={(contextManager.boardConfigs.length)} key={(contextManager.boardConfigs.length)}>
                <ErrorBoundary FallbackComponent={ ErrorWorkboard } onError={ logError }>
                    <ZoomPanBoardLayer
                        themeFlag={themeFlag}
                        mousePositionId={'splitBoardLeft'}
                        previewOnly={false}
                        selectedItemType={selectedItemType}
                        resetSelectedItemType={resetSelectedItemType}
                        boardId={formulateBoardId(contextManager.boardConfigs[leftSideindex], contextManager.userId, contextManager.groupName, activeExperiment)}
                        boardWidth={'50%'}
                        copyData={copyData}
                        setCopyData={setCopyData}
                        selectedLabelInfo={selectedLabelInfo[formulateBoardId(contextManager.boardConfigs[leftSideindex], contextManager.userId, contextManager.groupName, activeExperiment)]}
                        resetLabelInfo={resetLabelInfo}
                        contextManager={contextManager}
                        activeExperiment={activeExperiment}
                        boardType={contextManager.boardConfigs[leftSideindex].type}
                        boardConfig={contextManager.boardConfigs[leftSideindex]}
                        closeDrawerHandler={closeDrawerHandler}
                        setContextIndex={setLeftSideIndex}
                        configIndex={leftSideindex}
                        openDrawerHandler={openDrawerHandler}
                        changeExpandedAccordion={changeExpandedAccordion}
                        resizeTagState = {resizeTagState}
                        LorR={'left'}
                    />
                </ErrorBoundary>
                <button className={styleClasses.resizer} id="dragMe" onMouseDown={(e) => { try { mouseDownHandler(e); } catch (err) { showBoundary(err); } }} onTouchStart={(e) => { try { touchStartHandler(e); } catch (err) { showBoundary(err); } }} />
                <ErrorBoundary FallbackComponent={ ErrorWorkboard } onError={ logError }>
                    <ZoomPanBoardLayer
                        themeFlag={themeFlag}
                        mousePositionId={'splitBoardRight'}
                        previewOnly={false}
                        selectedItemType={selectedItemType}
                        resetSelectedItemType={resetSelectedItemType}
                        boardWidth={'50%'}
                        copyData={copyData}
                        setCopyData={setCopyData}
                        selectedLabelInfo={selectedLabelInfo[formulateBoardId(contextManager.boardConfigs[rightSideindex], contextManager.userId, contextManager.groupName, activeExperiment)]}
                        resetLabelInfo={resetLabelInfo}
                        contextManager={contextManager}
                        activeExperiment={activeExperiment}
                        boardId={formulateBoardId(contextManager.boardConfigs[rightSideindex], contextManager.userId, contextManager.groupName, activeExperiment)}
                        boardType={contextManager.boardConfigs[rightSideindex].type}
                        boardConfig={contextManager.boardConfigs[rightSideindex]}
                        closeDrawerHandler={closeDrawerHandler}
                        setContextIndex={setRightSideIndex}
                        configIndex={rightSideindex}
                        openDrawerHandler={openDrawerHandler}
                        changeExpandedAccordion={changeExpandedAccordion}
                        resizeTagState={resizeTagState}
                        LorR={'right'}
                    />
                </ErrorBoundary>
            </TabPanel> }
        </div>
    );
}

function TabPanel (props) {
    const { children, value, index } = props;
    return (
        <React.Fragment>
            {value === index && <React.Fragment>{children}</React.Fragment>}
        </React.Fragment>
    );
}
