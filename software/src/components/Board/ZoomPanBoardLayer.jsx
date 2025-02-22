import React, { useState, useRef } from 'react';
import '../WorkArea/WorkArea.css';
import {
    Button,
    ButtonGroup,
    Tooltip
} from '@mui/material';
import { BOARD_LABEL_STYLE, BOARD_IMAGE_STYLE } from './boardStyles';
import WorkArea from '../WorkArea/WorkArea';
import { Refresh, FlipToFront, BorderOuter, Visibility } from '@mui/icons-material';
import { USAGE_MODES, DISABLED_USAGE_MODES_CONFIG } from './usageModes';
import { formulateBoardId } from '../users/boardIds';
import { nDecimalPlaces, clamp } from '../../services/utils';
import { ReactComponent as SplitBoardImage } from '../../assets/images/BoardLogos/split_screen.svg';
import { useSelector } from 'react-redux';
import { selectBoard, selectBoardError } from '../../model/features/boards/boardsSlice';
import { useErrorBoundary } from 'react-error-boundary';
const ZOOM_SENSITIVITY = 0.001;
const SCALE_DECIMAL_PLACES = 2;
const MIN_SCALE_FACTOR = 0.10;
const MAX_SCALE_FACTOR = 3.00;

/**
 * @param props.mousePositionId The id to track the mouse position in each board alone
 * @param props.previewOnly Whether the board is preview only
 * @param props.selectedItemType The type of work component selected to be added onto the board
 * @param props.resetSelectedItemType Resets the selection of a work component type
 * @param props.boardId The board id
 * @param props.boardWidth The board width
 * @param props.copyData The context data for copying work component
 * @param props.setCopyData Sets the copy data for copying a work component
 * @param props.selectedLabelInfo The info of the selected label
 * @param props.resetLabelInfo Reset the info of the selected label for a board
 * @param props.contextManager The context manager of the board group
 * @param props.activeExperiment The active experiment of the board
 * @param props.closeDrawerHandler Close the toolbox drawer when a new component is added to the board
 * @param props.openDrawerHandler Open the toolbox drawer
 * @param props.changeExpandedAccordion Change the expanded state of the accordion in the drawer
*/
export default function ZoomPanBoardLayer ({
    themeFlag,
    mousePositionId,
    previewOnly,
    selectedItemType,
    resetSelectedItemType,
    boardId,
    boardType,
    boardWidth,
    copyData,
    setCopyData,
    selectedLabelInfo,
    resetLabelInfo,
    contextManager,
    activeExperiment,
    closeDrawerHandler,
    setContextIndex,
    configIndex,
    openDrawerHandler,
    changeExpandedAccordion,
    resizeTagState,
    LorR = ''
}) {
    const { showBoundary } = useErrorBoundary();
    const [usageMode, setUsageMode] = useState(USAGE_MODES.PAN);
    const { components } = useSelector((state) => selectBoard(state, boardId));
    const [scaleFactor, setScaleFactor] = useState(1.0);
    /** Determines the displacement of the current actual view of the board from the origin point view */
    const [displacement, setDisplacement] = useState({ left: 0, top: 0 });

    const incrementScaleFactor = () => {
        const newFactor = Math.min(scaleFactor + 0.1, MAX_SCALE_FACTOR);
        setScaleFactor(newFactor);
    };

    const decrementScaleFactor = () => {
        const newFactor = Math.max(scaleFactor - 0.1, MIN_SCALE_FACTOR);
        setScaleFactor(newFactor);
    };

    const MousePositionRef = useRef();

    const resetScaleFactor = () => {
        setScaleFactor(1.0);
    };
    const getAllComponentsintoView = () => {
        let minx = Number.MAX_VALUE;
        let miny = Number.MAX_VALUE;
        let maxx = Number.MIN_VALUE;
        let maxy = Number.MIN_VALUE;
        const size = { width: 0, height: 0 };
        for (const comp of Object.values(components)) {
            if (comp.position.x > maxx) {
                maxx = comp.position.x;
                size.width = comp.size.width;
            }
            if (comp.position.y > maxy) {
                maxy = comp.position.y;
                size.height = comp.size.height;
            }
            if (comp.position.x < minx) {
                minx = comp.position.x;
            }
            if (comp.position.y < miny) {
                miny = comp.position.y;
            }
        }
        let scale = 1;
        if ((minx + window.innerWidth) / scale < maxx + size.width || (miny + window.innerHeight) / scale < maxy + size.height) {
            const newScale = Math.min((window.innerWidth) / (maxx + size.width), (window.innerHeight) / (maxy + size.height));
            const newScale2 = Math.min((window.innerWidth) / (maxx + size.width), (window.innerHeight) / (maxy + size.height + (100 / newScale)));
            scale = newScale2;
            setScaleFactor(newScale2);
        } else {
            setScaleFactor(1);
        }
        const top = Object.values(components).length > 0 ? miny - (100 * 1 / scale) : 0;
        const left = Object.values(components).length > 0 ? minx - 10 : 0;
        setDisplacement({ left: -left, top: top });
    };

    const zoom = (event) => {
        if (contextManager.boardZoomStatus) {
            const newFactor = scaleFactor + event.deltaY * ZOOM_SENSITIVITY * -1;
            setScaleFactor(clamp(newFactor, MIN_SCALE_FACTOR, MAX_SCALE_FACTOR)); // delta is reversed mul by -1
        }
    };

    const displayBoardLabel = () => {
        const matchedBoardConfig = contextManager.boardConfigs.filter(boardConfig => {
            return formulateBoardId(boardConfig, contextManager.userId, contextManager.groupName, activeExperiment) === boardId;
        });
        if (matchedBoardConfig && matchedBoardConfig[0]) {
            const BoardConfigIcon = matchedBoardConfig[0].icon;
            if (BoardConfigIcon) {
                return (
                    <label style={BOARD_LABEL_STYLE} title={matchedBoardConfig[0].name}>
                        {/* <span style={{ fontSize: 12 }}>{matchedBoardConfig[0].name}</span> */}
                        <BoardConfigIcon/>
                    </label>
                );
            } else if (matchedBoardConfig[0].imageRef) {
                const currentConfig = matchedBoardConfig[0];
                return (
                    <label style={BOARD_LABEL_STYLE} title={matchedBoardConfig[0].name}>
                        {/* <span style={{ fontSize: 12 }}>{matchedBoardConfig[0].name}</span> */}
                        <currentConfig.imageRef width={20} height={20} style={BOARD_IMAGE_STYLE} />
                    </label>
                );
            }
        } else {
            return <SplitBoardImage width={20} height={20} style={BOARD_IMAGE_STYLE} />;
        }
    };

    const changeBoard = () => {
        return (
            <select data-testid="boardSelection" value={configIndex} onChange={(event) => {
                try {
                    setContextIndex(event.target.value);
                } catch (err) {
                    showBoundary(err);
                }
            }}>
                {
                    contextManager.boardConfigs.map((config, index) => {
                        return (<option value={index} key={index}>{config.name}</option>);
                    })
                }
            </select>
        );
    };

    // If 'matchedDisableConfigs' contains a config to disable certain usage modes, for specific user types on the current board type
    // Prevent usage mode from switching to a new mode
    const switchUsageMode = () => {
        setUsageMode(oldUsageMode => {
            if (oldUsageMode === USAGE_MODES.DISPLACE) {
                const matchedDisableConfigs = DISABLED_USAGE_MODES_CONFIG.filter(usageModeConfig => {
                    return usageModeConfig.usageMode === USAGE_MODES.PAN && usageModeConfig.userRoles.includes(contextManager.userRole) && boardType === usageModeConfig.boardType;
                });
                if (matchedDisableConfigs && matchedDisableConfigs.length > 0) {
                    return oldUsageMode;
                } else {
                    return USAGE_MODES.PAN;
                }
            } else {
                const matchedDisableConfigs = DISABLED_USAGE_MODES_CONFIG.filter(usageModeConfig => {
                    return usageModeConfig.usageMode === USAGE_MODES.DISPLACE && usageModeConfig.userRoles.includes(contextManager.userRole) && boardType === usageModeConfig.boardType;
                });
                if (matchedDisableConfigs && matchedDisableConfigs.length > 0) {
                    return oldUsageMode;
                } else {
                    return USAGE_MODES.DISPLACE;
                }
            }
        });
    };

    const loadBoardUsageModeElement = () => {
        switch (usageMode) {
        case USAGE_MODES.DISPLACE: return <Tooltip title="Schwenken" arrow><Button onClick={() => { try { switchUsageMode(); } catch (err) { showBoundary(err); } }}><BorderOuter fontSize='small' /></Button></Tooltip>;
        case USAGE_MODES.PAN: return <Tooltip title="Bewegen" arrow><Button onClick={() => { try { switchUsageMode(); } catch (err) { showBoundary(err); } }}><FlipToFront fontSize='small' /></Button></Tooltip>;
        default: return <></>;
        }
    };
    const decimalPlacesView = `${nDecimalPlaces(scaleFactor, SCALE_DECIMAL_PLACES)}x`;
    // now also hast the information about the scale factor
    const contextManagerPrime = contextManager;
    contextManagerPrime.scaleFactor = scaleFactor;

    const err = useSelector((state) => selectBoardError(state, boardId));
    if (err) {
        showBoundary(err);
    }

    return (
        <div id={mousePositionId}
            ref={MousePositionRef}
            style={
                boardWidth ? { height: '100%', position: 'relative', width: boardWidth, overflow: 'clip', minWidth: '25%' } : { height: '100%', position: 'relative', width: '100%', overflow: 'clip' } // , resize: 'horizontal', overflow: 'auto' (these properties go for resize of the splittabs)
            }
            onWheel={(e) => { try { zoom(e); } catch (err) { showBoundary(err); } }}
        >
            <ButtonGroup data-testid='smallButtonGroup' className={'zoomOptions' + LorR} size='small' variant="contained" color={ themeFlag } aria-label="small contained primary button group">
                {boardWidth ? changeBoard() : displayBoardLabel()} {/* boardwidth is only used for split board functionality, thus the switch case can be correctly used here */}
                <label style={ { margin: 'auto 0' } }>{decimalPlacesView}</label>
                <Button onClick={() => { try { incrementScaleFactor(); } catch (err) { showBoundary(err); } }}>+</Button>
                <Button onClick={() => { try { decrementScaleFactor(); } catch (err) { showBoundary(err); } }}>-</Button>
                <Tooltip title="Zurücksetzen" arrow><Button onClick={() => { try { resetScaleFactor(); } catch (err) { showBoundary(err); } }}><Refresh fontSize='small' /></Button></Tooltip>
                <Tooltip title="Zentrieren" arrow><Button onClick={() => { try { getAllComponentsintoView(); } catch (err) { showBoundary(err); } }}><Visibility fontSize='small' /></Button></Tooltip>
                { loadBoardUsageModeElement() }
            </ButtonGroup>
            <WorkArea
                previewOnly={previewOnly}
                selectedItemType={selectedItemType}
                resetSelectedItemType={resetSelectedItemType}
                boardId={boardId}
                scale={scaleFactor}
                copyData={copyData}
                setCopyData={setCopyData}
                displacement={displacement}
                setDisplacement={setDisplacement}
                selectedLabelInfo={selectedLabelInfo}
                resetLabelInfo={resetLabelInfo}
                resetZoom={resetScaleFactor}
                usageMode={usageMode}
                contextManager={contextManagerPrime}
                userRole={contextManager.userRole}
                boardType={boardType}
                closeDrawerHandler={closeDrawerHandler}
                openDrawerHandler={openDrawerHandler}
                changeExpandedAccordion={changeExpandedAccordion}
                mousePositionRef={MousePositionRef}
            />
        </div>
    );
};
