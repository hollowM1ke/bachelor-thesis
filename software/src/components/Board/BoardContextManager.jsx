import React, { useReducer, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import TabbedBoard from './TabBoard';
import { EXPERIMENTS, BOARD_CONFIGS, TOOL_LIST } from './boardConfig';
import { useDispatch } from 'react-redux';
import { loadBoard, unloadBoard } from '../../model/features/boards/boardsSlice';
import { getLoadReducerForSlice, getUnloadReducerForSlice, COMPONENT_TYPES } from '../../model/features/functions/loaders';
import { TOOL_TYPES } from '../Tools/toolTypes';
import { isSupportedBrowser } from './../../services/utils';
import { loadComments, unloadComments } from '../../model/features/comments/commentsSlice';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchExperiments, fetchPrograms } from './../../services/experimentActions';

class Experiment {
    constructor (id, name, json, visibility) {
        this.id = id;
        this.name = name;
        this.json = json;
        this.visibility = visibility;
    }
}
class Program {
    constructor (id, name, visibility) {
        this.id = id;
        this.name = name;
        this.visibility = visibility;
    }
}

const NUMBER_RECENTLY_USED = 3;

const LOCAL_DISPATCHER_ACTIONS = {
    LOAD_BOARD: 'loadBoard',
    UNLOAD_BOARD: 'unloadBoard',
    LOAD_COMPONENT: 'loadComponent',
    UNLOAD_COMPONENT: 'unloadComponent'
};

function contextManagerReducer (state, action) {
    switch (action.type) {
    case 'loadBoard': {
        if (state.boards[action.boardId]) return state;
        action.dispatch(loadBoard(action.boardId));
        const newState = {
            ...state,
            boards: {
                ...state.boards,
                [action.boardId]: { boardId: action.boardId }
            }
        };
        return newState;
    }
    case 'unloadBoard': {
        if (!state.boards[action.boardId]) return state;
        action.dispatch(unloadBoard(action.boardId));
        const newState = {
            ...state,
            boards: {
                ...state.boards
            }
        };
        delete newState.boards[action.boardId];
        return newState;
    }
    case 'loadComponent': {
        const componentType = action.componentType;
        const componentId = action.componentId;
        const boardId = action.boardId;
        const initialState = action.initialState;
        const isExternal = action.isExternal;
        if (state.components[componentType][action.componentId]) return state;

        const reducer = getLoadReducerForSlice(componentType);
        componentType === 'spreadsheet' ? action.dispatch(reducer({ id: componentId, boardId, initialState, isExternal })) : action.dispatch(reducer({ id: componentId, boardId, initialState }));
        action.dispatch(loadComments({ id: componentId, boardId: boardId }));
        const newState = {
            ...state,
            components: {
                ...state.components,
                [componentType]: {
                    ...state.components[componentType],
                    [componentId]: { boardId, componentId, type: componentType }
                }
            }
        };
        return newState;
    }
    case 'unloadComponent': {
        const componentType = action.componentType;
        const componentId = action.componentId;
        const boardId = action.boardId;
        if (!state.components[componentType][action.componentId]) return state;

        const reducer = getUnloadReducerForSlice(componentType);
        action.dispatch(reducer({ id: componentId, boardId }));
        action.dispatch(unloadComments({ id: componentId, boardId: boardId }));
        const newState = {
            ...state,
            components: {
                ...state.components,
                [componentType]: {
                    ...state.components[componentType]
                }
            }
        };
        delete newState.components[componentType][componentId];
        return newState;
    }
    }
}

const COMPONENT_TYPE_KEYS = Object.fromEntries(Object.values(COMPONENT_TYPES).map(name => [name, {}]));
export default function BoardContextManager ({
    fullScreenHandle,
    userId,
    userRole,
    groupName,
    startingBoard,
    view,
    setView,
    adminId,
    loginWithKeyCloak
}) {
    console.log('contextManager2', loginWithKeyCloak);
    const [experiments, setExperiments] = useState([]); // State to store fetched experiments
    const [programs, setPrograms] = useState([]); // State to store fetched programs
    const [loading, setLoading] = useState(true);

    async function loadPrograms (userRole) {
        try {
            const fetchedProgramsData = await fetchPrograms(userRole);
            const fetchedPrograms = fetchedProgramsData.map(programData =>
                new Program(programData.id, programData.program_name, programData.visibility)
            );
            // Sort programs by name in ascending order
            fetchedPrograms.sort((a, b) => a.name.localeCompare(b.name));
            setPrograms(fetchedPrograms);
        } catch (error) {
            // Handle the error if needed
        }
    }

    async function loadExperiments (userRole) {
        try {
            const fetchedExperimentsData = await fetchExperiments(userRole);
            const fetchedExperiments = fetchedExperimentsData.map(expData =>
                new Experiment(expData.id, expData.name, expData.json, expData.visibility)
            );
            // Sort experiments by name in ascending order
            fetchedExperiments.sort((a, b) => a.name.localeCompare(b.name));
            setExperiments(fetchedExperiments);
        } catch (error) {
            // Handle the error if needed
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        console.log('fetching experiments and programs');
        loadPrograms(userRole);
        loadExperiments(userRole);
    }, []);

    const dispatch = useDispatch();
    // TODO: component types, use useReducer instead
    const [loadedItems, localDispatch] = useReducer(contextManagerReducer, {
        boards: {},
        components: {
            ...COMPONENT_TYPE_KEYS
        }
    });
    const [openTool, setTool] = useState();
    const resetOpenTool = () => setTool(undefined);
    const setOpenTool = (component, props) => {
        setTool({
            component,
            props
        });
    };

    const [recentlyUsedTools, setRecentlyUsedTools] = useState([TOOL_TYPES.MARKDOWN, TOOL_TYPES.IMAGE, TOOL_TYPES.SPREADSHEET, TOOL_TYPES.COMMENT]); // Default populated tools will be set as per initial feedback about most common used tools by users. They will be replaced by individual user actions
    const addRecentlyUsedTool = (toolType) => {
        let newUsedTools = [...recentlyUsedTools];
        newUsedTools = newUsedTools.filter(tool => tool !== toolType);
        newUsedTools.unshift(toolType);
        newUsedTools = newUsedTools.slice(0, NUMBER_RECENTLY_USED);
        setRecentlyUsedTools(newUsedTools);
    };

    /**
     * Used to enable and diable the board zoom feature.
     * Useful in scenario when a modal (E.g: Image component) is opened, users on desktop who use mousewheel trigger the ZoomPanBoardLayer onmousewheel trigger
     * Use for new components which use a similar modal
     */
    const [boardZoomStatus, setBoardZoomStatus] = useState(true);

    useEffect(() => {
        // Cleanup function
        return () => {
            // unload loaded boards
            const loadedBoards = loadedItems.boards;
            Object.keys(loadedBoards).forEach(unloadBoard);

            // unload loaded components
            const loadedComponents = loadedItems.components;
            Object.keys(loadedComponents).forEach(itemType => {
                const loadedTypeItems = loadedItems.components[itemType];
                Object.entries(loadedTypeItems).forEach(([componentId, { boardId }]) => unloadComponent(boardId, componentId, itemType));
            });
        };
    }, []);
    // The useEffect will be triggered whenever the react router value is updated.
    // Necessary even though the component will load on routing back again in the event of caching a page, and ensure the warning message is loaded
    const location = useLocation();
    useEffect(() => {
        // update for ipad
        // if (!isSupportedBrowser()) toast.warn('Hinweis: Dies ist kein unterstützter Browser. Bitte verwende Google Chrome!');
    }, [location]);

    // expansion of Toolbox/Import and Label in the drawer. Defined here because it is used in multiple components e.g: WorkArea
    const [expanded, setExpanded] = useState({ toolbox: false, cloneOptions: false });
    const changeExpandedAccordion = (x) => {
        setExpanded(x);
    };
    /**
     * Load logic
     * Load the resouce if not yet loaded
     * Provide a handle for the resource requester
     * If all handles on a resource are unloaded,
     * unload the component (may not be the best approach as there is no caching yet)
     */

    const loadBoard = (boardId) => {
        localDispatch({ type: LOCAL_DISPATCHER_ACTIONS.LOAD_BOARD, boardId, dispatch });
    };

    const unloadBoard = (boardId, ref) => {
        localDispatch({ type: LOCAL_DISPATCHER_ACTIONS.UNLOAD_BOARD, boardId, dispatch });
    };

    const loadComponent = (boardId, componentId, type, initialState = undefined, isExternal = false) => { // isExternal is used to differentiate between components loaded from the board and components loaded from local addcomponent or added from another user and synced(Only realy important for spreadsheet init)
        localDispatch({ type: LOCAL_DISPATCHER_ACTIONS.LOAD_COMPONENT, boardId, componentType: type, componentId, initialState, isExternal, dispatch });
    };

    const unloadComponent = (boardId, componentId, type, ref) => {
        localDispatch({ type: LOCAL_DISPATCHER_ACTIONS.UNLOAD_COMPONENT, boardId, componentType: type, componentId, dispatch });
    };

    const defaultExperiment = experiments.length > 0 ? experiments[0] : null;

    const contextManager = {
        userId,
        userRole,
        groupName,
        defaultExperiment: defaultExperiment,
        experiments: experiments,
        programs: programs,
        boardConfigs: BOARD_CONFIGS,
        toolList: TOOL_LIST,
        loadBoard,
        loadComponent,
        resetOpenTool,
        setOpenTool,
        recentlyUsedTools,
        addRecentlyUsedTool,
        boardZoomStatus,
        setBoardZoomStatus,
        adminPreview: view === 2,
        adminId: adminId,
        setExperiments
    };
    if (loading && !process.env.MTests) {
        return <div>Loading experiments...</div>;
    }
    if ((!experiments || experiments.length === 0) && userRole === 's') {
        return <div>No experiments available.</div>;
    }
    return (
        console.log('contextManager', loginWithKeyCloak),
        <>
            <div
                style={{
                    display: openTool ? 'none' : null
                }}
            >
                <TabbedBoard
                    previewOnly={false}
                    fullScreenHandle={fullScreenHandle}
                    userId={userId}
                    contextManager={contextManager}
                    expanded={expanded}
                    changeExpandedAccordion={ changeExpandedAccordion }
                    startingBoard={startingBoard}
                    view = {view}
                    setView = {setView}
                    loginWithKeyCloak = {loginWithKeyCloak}
                />
            </div>
            {
                openTool &&
                <div
                    style={{
                        height: '100vh',
                        width: '100vw'
                    }}
                >
                    <openTool.component {...openTool.props}/>
                </div>
            }
        </>
    );
}
