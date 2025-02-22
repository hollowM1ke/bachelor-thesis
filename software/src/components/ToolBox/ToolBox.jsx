import React, { useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useToolboxStyles } from './toolBoxStyles';
import DeepExport from '../Persistence/DeepExport';
import DeepImport from '../Persistence/DeepImport';
import { formulateBoardId } from '../users/boardIds';
import PDFExport from '../Persistence/PDFExport';
import CsvImport from '../Persistence/CsvImport';
import { useErrorBoundary } from 'react-error-boundary';
import { USER_ROLES } from '../users/users';
export default function ToolBox ({
    selectItem,
    selectedItem,
    contextManager,
    activeExperiment,
    boardConfig,
    expanded,
    changeExpandedAccordion
}) {
    const { showBoundary } = useErrorBoundary();
    const userRole = contextManager.userRole;
    const classes = useToolboxStyles();

    // important moved it to BoardContextManager
    // const [expanded, setExpanded] = useState({ toolbox: false, cloneOptions: false });

    const [exportImportEvents, setExportImportEvents] = useState({ deepExport: 0, deepImport: 0, PDFExport: 0, CSVExport: 0, CSVImport: 0, CSVPrototype: 0 });
    const boardId = boardConfig ? formulateBoardId(boardConfig, contextManager.userId, contextManager.groupName, activeExperiment) : undefined;

    /** Handles accordion expand/retract */
    const handleAccordionChange = (expandStateKey) => {
        const tempExpandState = { ...expanded };
        tempExpandState[expandStateKey] = !tempExpandState[expandStateKey];
        changeExpandedAccordion(tempExpandState);
    };

    const handleExportImportEvents = (exportImportKey) => {
        // es soll kein Event ausgelöst werden, wenn das Modal des TabellenImports bereits geöffnet ist
        if (document.getElementById('import-spreadsheet-modal') === null) {
            const tempExportImportEventsState = { ...exportImportEvents };
            tempExportImportEventsState[exportImportKey] = tempExportImportEventsState[exportImportKey] + 1;
            setExportImportEvents(tempExportImportEventsState);
        }
    };

    const toolList = contextManager.toolList.map((tool, index) => {
        //
        if (!tool.accessibleUserRoles || (tool.accessibleUserRoles && tool.accessibleUserRoles.includes(userRole))) {
            const IconComponent = tool.icon;

            return (
                <React.Fragment key={index}>
                    <ListItemButton button selected={ selectedItem === tool.type } onClick={(e) => { try { selectItem(tool.type); } catch (err) { showBoundary(err); } }}>
                        <ListItemIcon>
                            <IconComponent />
                        </ListItemIcon>
                        <ListItemText primary={tool.name} />
                    </ListItemButton>
                </React.Fragment>
            );
        }
        return <></>;
    });
    const studendNotAllowed = (boardConfig && boardConfig.id === 'skript' && userRole === USER_ROLES.STUDENT);
    return (
        <div className={classes.root}>
            <Accordion expanded={(expanded && expanded.toolbox)} onChange={(e) => { try { handleAccordionChange('toolbox'); } catch (err) { showBoundary(err); } }} key={1}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls='panel1bh-content'
                    id='panel1bh-header'
                >
                    <Typography className={classes.heading}>ToolBox</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <List className={classes.list}>
                        { toolList }
                    </List>
                </AccordionDetails>
            </Accordion>

            <Accordion expanded={((expanded && expanded.cloneOptions && !studendNotAllowed)) && boardId} onChange={(e) => { try { handleAccordionChange('cloneOptions'); } catch (err) { showBoundary(err); } }} disabled={!boardId || studendNotAllowed} key={2}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls='panel2bh-content'
                    id='panel2bh-header'
                >
                    <Typography className={classes.heading}>Importieren/ Exportieren</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <List className={classes.list}>
                        <ListItemButton button onClick={(e) => { try { handleExportImportEvents('deepExport'); } catch (err) { showBoundary(err); } }} key={1}>
                            <ListItemText>
                                <DeepExport boardId={boardId} triggerEvent={exportImportEvents.deepExport} />
                            </ListItemText>
                        </ListItemButton>

                        <ListItemButton button onClick={(e) => { try { handleExportImportEvents('deepImport'); } catch (err) { showBoundary(err); } }} key={2}>
                            <ListItemText>
                                <DeepImport boardId={boardId} contextManager={contextManager} triggerEvent={exportImportEvents.deepImport}/>
                            </ListItemText>
                        </ListItemButton>

                        <ListItemButton button onClick={(e) => { try { handleExportImportEvents('PDFExport'); } catch (err) { showBoundary(err); } }} key={3}>
                            <ListItemText>
                                <PDFExport boardId={boardId} contextManager={contextManager} triggerEvent={exportImportEvents.PDFExport}/>
                            </ListItemText>
                        </ListItemButton>

                        <ListItemButton button onClick={(e) => { try { handleExportImportEvents('CSVImport'); } catch (err) { showBoundary(err); } }} key={5}>
                            <ListItemText>
                                <CsvImport boardId={boardId} contextManager={contextManager} triggerEvent={exportImportEvents.CSVImport}/>
                            </ListItemText>
                        </ListItemButton>
                        {/**
                        *<ListItemButton button onClick={() => handleExportImportEvents('shallowImport')} key={20}>
                        *    <ListItemText>
                        *        <ShallowImport boardId={boardId} triggerEvent={exportImportEvents.shallowImport}/>
                        *    </ListItemText>
                        *</ListItem>
                        *
                        *<ListItemButton button onClick={() => handleExportImportEvents('shallowExport')} key={19}>
                        *    <ListItemText>
                        *        <ShallowExport boardId={boardId} triggerEvent={exportImportEvents.shallowExport}/>
                        *    </ListItemText>
                        *</ListItem>
                        */}
                    </List>
                </AccordionDetails>
            </Accordion>
        </div>
    );
}
