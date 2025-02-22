import clsx from 'clsx';
import React, { useState, useRef, useEffect } from 'react';
import Modal from 'react-modal';
import {
    Button,
    Drawer,
    CssBaseline,
    AppBar,
    Tooltip,
    Toolbar,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    DialogTitle,
    Dialog,
    Switch
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
    Menu as MenuIcon,
    Edit as EditIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Cancel as CancelIcon,
    HelpOutline as HelpIcon
} from '@mui/icons-material';
import { useStyles, BOARD_MODAL_STYLE } from './boardStyles';
import ToolBox from '../ToolBox/ToolBox';
import logo from './../../assets/images/logoBASF/BASFLogo-TIF(RGB)/linkBASF.svg';
import BoardTabViews from './BoardTabViews';
import Labels from '../Labels/Lables';
import { useSelector } from 'react-redux';
import FullscreenEnterIcon from '@mui/icons-material/FullscreenTwoTone';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExitTwoTone';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useErrorBoundary } from 'react-error-boundary';
import { ReactComponent as SplitBoardImage } from '../../assets/images/BoardLogos/split_screen.svg';
import packageJson from '../../../package.json';
import { useNavigate } from 'react-router-dom';
import { disconectAll, conectAll } from '../../services/collectionprovider';
import { selectMetaData } from '../../model/features/metaData/metaDataSlice';
import { useKeycloak } from '@react-keycloak/web';
import { fetchExperiments, insertExperiment, deleteExperimentByName, updateExperimentByName } from './../../services/experimentActions';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DeleteIcon from '@mui/icons-material/Delete';

class Experiment {// duplicated class should be removed/abstracted
    constructor (id, name, json, visibility) {
        this.id = id;
        this.name = name;
        this.json = json;
        this.visibility = visibility;
    }
}

const TabBoard = ({
    fullScreenHandle,
    contextManager,
    expanded,
    changeExpandedAccordion,
    startingBoard,
    view,
    setView,
    loginWithKeyCloak
}) => {
    console.log('TabBoard', loginWithKeyCloak);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingExperiment, setEditingExperiment] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const defaultExperimentValue = new Experiment();
    defaultExperimentValue.json = {};
    defaultExperimentValue.name = '';
    defaultExperimentValue.visibility = false;

    const [activeExperiment, setActiveExperiment] = useState(
        contextManager.defaultExperiment !== null
            ? contextManager.defaultExperiment
            : defaultExperimentValue
    );
    const [deleteTargetExperiment, setDeleteTargetExperiment] = useState(null);
    const [userSelectedVisibility, setUserSelectedVisibility] = useState(editingExperiment ? editingExperiment.visibility : false);
    const handleCloseDialog = () => {
        setOpenDialog(false);
    };
    const openDeleteDialog = (event, experiment) => {
        event.stopPropagation();
        setDeleteTargetExperiment(experiment);
        setDeleteDialogOpen(true);
    };
    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setDeleteTargetExperiment(null);
    };
    const handleOpenDialog = () => {
        setExperimentName(''); // Clear the experimentName field
        setJsonFile(null); // Clear the file input
        setEditingExperiment(null); // Set editingExperiment to null (false)
        setUserSelectedVisibility(false);
        setOpenDialog(true);
    };
    const handleExperimentNameChange = (event) => {
        setExperimentName(event.target.value);
    };
    const handleFileChange = (event) => {
        setJsonFile(event.target.files[0]);
    };
    const handleEdit = (event, experiment) => {
        event.stopPropagation();
        setExperimentName(experiment.name);
        setUserSelectedVisibility(experiment.visibility);
        setEditingExperiment(experiment);
        setOpenDialog(true); // Open the dialog
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingExperiment) {
                // Update the existing experiment
                let jsonData = '';
                let newVisibility = editingExperiment.visibility; // Keep the old visibility as it is by default

                if (!jsonFile || jsonFile.length === 0) {
                    jsonData = editingExperiment.json;
                } else {
                    const fileContent = await readFileContent(jsonFile);
                    jsonData = JSON.parse(fileContent);
                }

                if (newVisibility !== userSelectedVisibility) {
                    // User has changed the visibility, update newVisibility
                    newVisibility = userSelectedVisibility;
                }

                const updatedData = await updateExperimentByName(editingExperiment.name, experimentName, jsonData, newVisibility);
                // setActiveExperiment(updatedData); we dont want to make the updated experiment the active one
            } else {
                let jsonData = {};
                if (jsonFile !== null) {
                    const fileContent = await readFileContent(jsonFile);
                    jsonData = JSON.parse(fileContent);
                }
                const insertedData = await insertExperiment(experimentName, jsonData, userSelectedVisibility);
                if (contextManager.experiments.length === 0) {
                    setActiveExperiment(insertedData); // Update the activeExperiment state
                }
            }
            if (editingExperiment) {
                toast.success('Experiment updated successfully');
            } else {
                toast.success('Experiment inserted successfully');
            }
            // Clear form fields after successful submission
            setExperimentName('');
            setJsonFile('');
            setEditingExperiment(null); // Clear editing state
            loadExperiments(contextManager.userRole);
        } catch (error) {
            console.error('Error processing data:', error);
            toast.error('An error occurred while processing data');
        }
        setOpenDialog(false);
    };

    const readFileContent = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                resolve(event.target.result);
            };

            reader.onerror = (event) => {
                reject(event.target.error);
            };

            reader.readAsText(file);
        });
    };

    const handleDelete = async (name) => {
        try {
            const deletedData = await deleteExperimentByName(name);
            toast.success('Experiment deleted successfully');
            loadExperiments(contextManager.userRole);
            const newActiveExperiment = contextManager.experiments.find(experiment => experiment.name !== name);
            if (newActiveExperiment) {
                console.log(newActiveExperiment);
                setActiveExperiment(newActiveExperiment);
            }
        } catch (error) {
            console.error('Error deleting experiment:', error);
            toast.error('An error occurred while deleting the data');
        }
        closeDeleteDialog();
    };
    const isAdminUser = contextManager.userRole === 'a';
    const state = useSelector((state) => { return state; });
    const [experimentName, setExperimentName] = useState(editingExperiment ? editingExperiment.name : '');
    const [jsonFile, setJsonFile] = useState(null);
    const { showBoundary } = useErrorBoundary();
    const styleClasses = useStyles();
    const theme = useTheme();
    /** Determines if board drawer is open */
    const [open, setOpen] = useState(false);
    /** Determines the selected item type from the toolbox to be used for the corresponding work area */
    const [selectedItemType, setSelectedItemType] = useState(undefined);
    const [leftindex, setleftindex] = useState(0);
    /** The selected/open board tabs */
    const [tabValue, setTabValue] = useState(startingBoard || 3);

    /** The currently active experiment */

    const [anchorEl, setAnchorEl] = React.useState(null);
    /** Used to reroute on logout */
    const navigate = useNavigate();

    /** The labels to display for the boards */
    const labels = {};
    /*
    if (activeExperiment !== null) {
        contextManager.boardConfigs.forEach(config => {
            const id = formulateBoardId(config, contextManager.userId, contextManager.groupName, activeExperiment);
            labels[id] = useSelector((state) => selectLabels(state, id));
        });
    }
    */
    const metaData = useSelector((state) => selectMetaData(state, process.env.REACT_APP_META_DATA_ID));
    const [selectedLabelInfo, setSelectedLabelInfo] = useState({});

    const resetLabelInfo = (boardId) => {
        const newLabelInfo = { ...selectedLabelInfo };
        delete newLabelInfo[boardId];
        setSelectedLabelInfo(newLabelInfo);
    };

    const selectLabelInfo = (boardId, index, { name, componentId }) => {
        if (tabValue !== 3 && tabValue !== index) {
            setTabValue(index);
        }
        if (tabValue === 3) {
            setleftindex(index);
        }
        const newLabelInfo = { ...selectedLabelInfo };
        newLabelInfo[boardId] = { name, componentId };
        setSelectedLabelInfo(newLabelInfo);
    };

    useEffect(() => {
        if (metaData.connected_flag) {
            setThemeFlag('connected');
        } else {
            setThemeFlag('disconnected');
        }
    }, [metaData]);

    // const addLabel = (boardId, name, componentId) => {
    //     const newLabels = { ...labels }; // shallow copy
    //     newLabels[boardId] = [...newLabels[boardId]]; // copy array
    //     newLabels.push({
    //         name: name,
    //         componentId: componentId
    //     });
    //     setLabels(newLabels);
    // };
    const resetSelectedItemType = (itemType) => {
        if (itemType) {
            setSelectedItemType(itemType);
        } else {
            setSelectedItemType(undefined);
        }
    };

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    const [experimentViewIsOpen, setExperimentViewIsOpen] = useState(false);

    const afterOpenExperimentView = () => {};
    const closeExperimentView = () => {
        setExperimentViewIsOpen(false);
    };

    const toggleFullScreen = () => {
        if (fullScreenHandle.active) {
            fullScreenHandle.exit();
        } else {
            fullScreenHandle.enter();
        }
    };
    let fullScreenIcon;
    if (fullScreenHandle.active) {
        fullScreenIcon = (
            <FullscreenExitIcon
                style={{ color: 'white' }}
                fontSize='large'
                onClick={(e) => {
                    try {
                        toggleFullScreen();
                    } catch (err) {
                        showBoundary(err);
                    }
                }}
            />
        );
    } else {
        fullScreenIcon = (
            <FullscreenEnterIcon
                style={{ color: 'white' }}
                fontSize='large'
                onClick={(e) => {
                    try {
                        toggleFullScreen();
                    } catch (err) {
                        showBoundary(err);
                    }
                }}
            />
        );
    }
    const [themeFlag, setThemeFlag] = useState('connected');

    const boardTabs = contextManager.boardConfigs.map((config, index) => {
        const BoardConfigIcon = config.icon;
        const check = view && view === 2 && config.id === 'notizbuch';
        return (
            <>
                { (view === 1 || check || !view) &&
                <React.Fragment key={index}>
                    {config && config.showLeftDivider &&
                    <Divider orientation='vertical' variant="middle" flexItem className={styleClasses.navBarDivider} />
                    }
                    <Tooltip arrow title={config.name}>
                        <IconButton
                            aria-label={config.name}
                            data-testid={'switchTo' + config.name}
                            className={index === tabValue ? styleClasses['tabActive' + themeFlag] : styleClasses.tabStyle}
                            key={index}
                            data-value={index}
                            onClick={(event) => { try { setTabValue((event.currentTarget.dataset && event.currentTarget.dataset.value) ? Number(event.currentTarget.dataset.value) : undefined); } catch (err) { showBoundary(err); } }}
                            size="large">
                            { BoardConfigIcon ? <BoardConfigIcon/> : (config.imageRef ? <config.imageRef width={20} height={20} className={styleClasses.navBarSvgIcons} /> : undefined) }
                        </IconButton>
                    </Tooltip>
                    {config && config.showRightDivider &&
                        <Divider orientation='vertical' variant="middle" flexItem className={styleClasses.navBarDivider} />
                    }
                </React.Fragment>
                }
            </>
        );
    });

    const changeExperiment = (experiment) => {
        setActiveExperiment(experiment);
    };
    async function loadExperiments (userRole) {
        try {
            console.log('fetching experiments');
            const fetchedExperimentsData = await fetchExperiments(userRole);
            const fetchedExperiments = fetchedExperimentsData.map(expData =>
                new Experiment(expData.id, expData.name, expData.json, expData.visibility)
            );
            // Sort experiments by name in ascending order
            fetchedExperiments.sort((a, b) => a.name.localeCompare(b.name));
            contextManager.setExperiments(fetchedExperiments);
        } catch (error) {
            // Handle the error if needed
        }
    }
    const [viewDropdown, setViewDropdown] = useState({ zeilen: false });
    const [selctedPrograms, setPrograms] = useState([]);
    const handleExperimentSelectionClick = (event) => {
        loadExperiments(contextManager.userRole);
        setAnchorEl(event.currentTarget);
    };
    let handleLogout = () => {};
    if (process.env.APP_TEST !== 'true') {
        const { keycloak } = useKeycloak();
        handleLogout = () => {
            if (loginWithKeyCloak) {
                window.sessionStorage.removeItem(process.env.REACT_APP_HOMEPAGE);
                let url = new URL(`${process.env.REACT_APP_HOMEPAGE}`, document.baseURI);
                if (process.env.REACT_APP_HOMEPAGE === '' || process.env.REACT_APP_HOMEPAGE === '/') {
                    url = new URL(process.env.REACT_APP_URL);
                }
                console.log('logout', url);
                keycloak.logout({ redirectUri: url.href });
            } else {
                navigate(`${process.env.REACT_APP_HOMEPAGE}/`);
            }
        };
    }

    const containerRef = useRef(null);

    const handleDashboard = (event) => {
        setView(0);
    };
    const userAgents = navigator.userAgent;
    let isMac = false;
    if (userAgents && (userAgents.indexOf('Macintosh') === -1 || userAgents.indexOf('Mac OS') === -1 || userAgents.indexOf('Mac') !== -1 || userAgents.indexOf('MacOS') !== -1 || userAgents.indexOf('iPhone') !== -1)) {
        isMac = true;
    }
    return (
        <div className={styleClasses.root} ref={containerRef}>
            <CssBaseline />
            <AppBar
                position="sticky"
                className={clsx(styleClasses.appBar, {
                    [styleClasses.appBarShift]: open
                })}
            >
                <Toolbar variant= { themeFlag } >
                    <IconButton
                        color='inherit'
                        aria-label='open drawer'
                        onClick={(e) => {
                            try {
                                handleDrawerOpen();
                            } catch (err) {
                                showBoundary(err);
                            }
                        }}
                        edge='start'
                        className={clsx(styleClasses.menuButton, open && styleClasses.hide)}
                        size="large">
                        <MenuIcon />
                    </IconButton>

                    { isMac
                        ? <IconButton data-testid = "fullscreenButten" size="large">
                            {fullScreenIcon}
                        </IconButton>
                        : <></> }
                    { boardTabs }
                    { view !== 2 && <IconButton
                        className={contextManager.boardConfigs.length === tabValue ? styleClasses['tabActive' + themeFlag] : styleClasses.tabStyle}
                        key={contextManager.boardConfigs.length}
                        data-testid={'splitBoardButton'}
                        data-value={contextManager.boardConfigs.length}
                        onClick={(event) => { try { setTabValue(contextManager.boardConfigs.length); } catch (err) { showBoundary(err); } }}
                        size="large">
                        <SplitBoardImage height={20} width={25} className={styleClasses.navBarSvgIcons}/>
                    </IconButton>
                    }
                    { process.env.NODE_ENV === 'development' ? <button onClick={ () => { conectAll(); }}>Verbinden</button> : <></> /* TODO move to burger menu */ }
                    { process.env.NODE_ENV === 'development' ? <button onClick={ () => { disconectAll(); }}>Trennen</button> : <></> }
                    <div style={{ marginLeft: 'auto', justifyContent: 'flex-end' }}>
                        <List component="nav" dense disablePadding aria-label="Experiment title">
                            <ListItem button
                                disablePadding
                                aria-haspopup="true"
                                aria-controls="lock-menu"
                                aria-label="experiment title"
                                data-testid='experiment-selection-button'
                                onClick={(event) => { try { handleExperimentSelectionClick(event); } catch (err) { showBoundary(err); } }}
                            >
                                <ListItemText
                                    id='experimentName'
                                    primary={contextManager.experiments.length === 0 ? 'Add New Experiment' : activeExperiment.name}
                                    secondaryTypographyProps={{ color: theme.palette.primary.main }}
                                />
                                <KeyboardArrowDownIcon/>
                            </ListItem>
                        </List>
                        <Menu
                            id="lock-menu"
                            anchorEl={anchorEl}
                            keepMounted
                            open={Boolean(anchorEl)}
                            container={containerRef.current}
                            onContextMenu={(event) => { setAnchorEl(null); event.preventDefault(); }}
                            onClose={() => { try { setAnchorEl(null); } catch (err) { showBoundary(err); } }}
                        >
                            {contextManager.experiments.length !== 0 && Object.entries(contextManager.experiments).map(([experimentId, experiment]) => (
                                <MenuItem
                                    data-testid={'experiment-' + experimentId}
                                    key={experiment.id}
                                    selected={experiment.name === activeExperiment.name}
                                    onClick={(event) => {
                                        changeExperiment(experiment);
                                        setAnchorEl(null);
                                    }}
                                    style={{ minWidth: '12em' }}
                                >
                                    {experiment.name}
                                    {isAdminUser && (
                                        <ListItemIcon>
                                            <IconButton
                                                edge="end"
                                                aria-label="edit"
                                                onClick={(event) => handleEdit(event, experiment)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                edge="end"
                                                aria-label="delete"
                                                onClick={(event) => openDeleteDialog(event, experiment)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItemIcon>
                                    )}
                                </MenuItem>
                            ))}
                            {isAdminUser && (
                                <MenuItem onClick={handleOpenDialog}>
                                    Add new experiment
                                </MenuItem>
                            )}
                        </Menu>
                        <Dialog onClose={handleCloseDialog} open={openDialog}>
                            <DialogTitle>{editingExperiment ? 'Edit Experiment' : 'Add New Experiment'}</DialogTitle>
                            <div style={{ padding: '20px' }}>
                                <form onSubmit={handleSubmit}>
                                    <div style={{ marginBottom: '15px' }}>
                                        <label htmlFor="experimentName">Experiment Name:</label>
                                        <input
                                            type="text"
                                            id="experimentName"
                                            name="experimentName"
                                            value={experimentName}
                                            onChange={handleExperimentNameChange}
                                            required
                                        />
                                    </div>
                                    <div style={{ marginBottom: '15px' }}>
                                        <label htmlFor="jsonFile">Upload JSON File:</label>
                                        <input type="file" id="jsonFile" name="jsonFile" accept=".json" onChange={handleFileChange} {...(editingExperiment ? {} : { required: false })} />
                                    </div>
                                    { /* <div style={{ marginBottom: '15px' }}>
                                        <FormControl fullWidth>
                                            <label htmlFor="programs" className='custom-select-label'>Programs:</label>
                                            <div className="custom-multiselect" onClick={() => setViewDropdown((prevState) => { return { ...prevState, zeilen: !prevState.zeilen }; }) }>
                                                <div className="custom-select">
                                                    <select>
                                                        <option>
                                                            { (contextManager.programs && contextManager.programs.length > 0) ? selctedPrograms.toString() : 'Select an option' }
                                                        </option>
                                                    </select>
                                                    <div className="custom-overSelect"></div>
                                                </div>
                                                <div className="custom-checkboxes" style={ viewDropdown.zeilen ? { display: 'block' } : { display: 'none' } }>
                                                    {
                                                        contextManager.programs.map((program, idx) => {
                                                            return (
                                                                <label key={idx} className='custom-checkbox-container'>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selctedPrograms.includes(program.name)}
                                                                        value={program.name}
                                                                        onClick={(event) => {
                                                                            setPrograms((prevState) => {
                                                                                const prevStateObj = [...prevState];
                                                                                if (event.target.checked) {
                                                                                    prevStateObj.push(event.target.value);
                                                                                } else if (!event.target.checked && (prevStateObj.indexOf(event.target.value > -1))) {
                                                                                    prevStateObj.splice(prevStateObj.indexOf(event.target.value), 1);
                                                                                }
                                                                                return prevStateObj;
                                                                            });
                                                                        }}
                                                                    />
                                                                    <span> {`Program: ${program.name}`} </span>
                                                                    <span className='custom-checkmark'></span>
                                                                </label>
                                                            );
                                                        })
                                                    }
                                                </div>
                                            </div>
                                        </FormControl>
                                    </div> */ }
                                    <div style={{ marginBottom: '15px' }}>
                                        <label htmlFor="visibilityToggle">Visibility to students:</label>
                                        <Switch
                                            id="visibilityToggle"
                                            name="visibilityToggle"
                                            checked={userSelectedVisibility}
                                            value={userSelectedVisibility}
                                            onChange={() => setUserSelectedVisibility(!userSelectedVisibility)}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Button variant="outlined" color="secondary" onClick={handleCloseDialog}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" variant="contained" color="primary">
                                            {editingExperiment ? 'Update' : 'Submit'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </Dialog>
                        <Dialog onClose={closeDeleteDialog} open={deleteDialogOpen}>
                            <DialogTitle>Confirm Deletion</DialogTitle>
                            <div style={{ padding: '20px' }}>
                                Are you sure you want to delete this experiment?
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                                    <Button variant="outlined" color="secondary" onClick={closeDeleteDialog}>
                                        No
                                    </Button>
                                    <Button style={{ marginLeft: '10px' }} variant="contained" color="primary" onClick={() => handleDelete(deleteTargetExperiment.name)}>
                                        Yes
                                    </Button>
                                </div>
                            </div>
                        </Dialog>
                    </div>
                    <img src={logo} alt="" height='60' />
                    <IconButton
                        data-testid='help'
                        onClick={() => { try { window.open('https://softech-git.cs.uni-kl.de/basf-labbook/documentation/-/wikis/home'); } catch (err) { showBoundary(err); } }}
                        size="large">
                        <HelpIcon
                            style={{ color: 'white' }}
                        />
                    </IconButton>
                </Toolbar>

            </AppBar>

            <Drawer
                className={styleClasses.drawer}
                variant='persistent'
                anchor='left'
                open={open}
                classes={{
                    paper: styleClasses.drawerPaper
                }}
            >
                <div className={styleClasses.drawerHeader}>
                    <label style={{ left: '10px', position: 'absolute' }}>
                        {(contextManager.boardConfigs[tabValue] && contextManager.boardConfigs[tabValue].name)
                            ? contextManager.boardConfigs[tabValue].name
                            : 'Split Board'}
                    </label>
                    <IconButton data-testId='closeDrawer' onClick={() => { try { handleDrawerClose(); } catch (err) { showBoundary(err); } }} size="large">
                        {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                    </IconButton>
                </div>
                <Divider />
                <ToolBox
                    selectItem={setSelectedItemType}
                    selectedItem={selectedItemType}
                    contextManager={contextManager}
                    activeExperiment={activeExperiment}
                    boardConfig={(contextManager.boardConfigs[tabValue] && contextManager.boardConfigs[tabValue].name) ? contextManager.boardConfigs[tabValue] : undefined}
                    expanded={expanded}
                    changeExpandedAccordion={changeExpandedAccordion}
                />
                <Divider />
                <Labels
                    labels={labels}
                    selectLabelInfo={selectLabelInfo}
                />
                <Divider />
                { (view) && <div
                    className={styleClasses.drawerHeader}
                    onClick={(event) => { try { handleDashboard(event); } catch (err) { showBoundary(err); } }}
                >
                    <label style={{ left: '10px', position: 'absolute' }}>
                        Dashboard
                    </label>
                </div>

                }
                <Divider />
                <div
                    className={styleClasses.drawerHeader}
                    onClick={(e) => { try { handleLogout(e); } catch (err) { showBoundary(err); } }}
                >
                    <label style={{ left: '10px', position: 'absolute' }}>
                        {'Ausloggen Nutzer:  ' + contextManager.userId}
                    </label>
                </div>
                <Divider />
            </Drawer>

            <BoardTabViews
                themeFlag = {themeFlag}
                component="main"
                tabValue={tabValue}
                selectedItemType={selectedItemType}
                resetSelectedItemType={resetSelectedItemType}
                selectedLabelInfo={selectedLabelInfo}
                resetLabelInfo={resetLabelInfo}
                activeExperiment={activeExperiment}
                contextManager={contextManager}
                closeDrawerHandler={() => { setOpen(false); }}
                leftindex = {leftindex}
                openDrawerHandler={() => { setOpen(true); }}
                changeExpandedAccordion={changeExpandedAccordion}
            />

            <Modal
                isOupdateLabelpen={experimentViewIsOpen}
                onAfterOpen={(e) => { try { afterOpenExperimentView(e); } catch (err) { showBoundary(err); } }}
                onRequestClose={(e) => { try { closeExperimentView(e); } catch (err) { showBoundary(err); } }}
                style={BOARD_MODAL_STYLE}
                contentLabel='Experiment Description'
                parentSelector={() => (document.getElementsByClassName('fullscreen') ? document.getElementsByClassName('fullscreen')[0] : undefined)}
            >
                <IconButton onClick={(e) => { try { closeExperimentView(e); } catch (err) { showBoundary(err); } }} size="large">
                    <CancelIcon />
                </IconButton>
                {/* <button onClick={closeExperimentView}>close</button> */}
            </Modal>
        </div>
    );
};

export default TabBoard;
