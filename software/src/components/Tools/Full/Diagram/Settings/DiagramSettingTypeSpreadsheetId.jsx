import React, { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import {
    setDiagramType as persistDiagramType,
    setDiagramSSID as persistDiagramSSID
} from '../../../../../model/features/diagrams/diagramsSlice';
import { updateSize } from '../../../../../model/features/boards/boardsSlice';
import { DIAGRAM_CONFIG } from '../DiagramTypes/diagramTypes';
import {
    FormControl,
    Button
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForwardIosOutlined';
import {
    SETTINGS_CONTAINER_STYLE,
    SELECTION_STYLE,
    FORWARD_BTN_STYLE
} from '../styles';
import { useErrorBoundary } from 'react-error-boundary';
export default function DiagramSettingTypeSpreadsheetId ({
    docName,
    boardId,
    containerId,
    diagramInfo,
    spreadsheetsComponentList
}) {
    const { showBoundary } = useErrorBoundary();
    const dispatch = useDispatch();
    useEffect(() => {
        setSelectedDiagram(diagramInfo.type);
        setSelectedSpreadsheet(diagramInfo.ssid);
    }, [diagramInfo.type, diagramInfo.ssid]);

    // stores docName of selected the spreadsheet
    const [selectedSpreadsheet, setSelectedSpreadsheet] = useState('');
    // stores selected diagram type
    const [selectedDiagram, setSelectedDiagram] = useState('');

    const containerRef = useRef(null);

    const saveDiagramTypeSSID = (event) => {
        event.preventDefault();
        dispatch(persistDiagramType(docName, selectedDiagram));
        dispatch(persistDiagramSSID(docName, selectedSpreadsheet));
        // Update the component size, as the next screen 'DiagramSettingsProperties' is a large form and will allow user to avoid redundant resize
        dispatch(updateSize(boardId, containerId, { width: 450, height: 450 }));
    };

    return (
        <div data-testid = 'Diagram' style={SETTINGS_CONTAINER_STYLE}>
            <FormControl
                variant="standard"
                fullWidth
                sytle={SELECTION_STYLE}
                ref={containerRef}
                className='custom-select'>
                <label htmlFor="spreadsheet-select">Tabelle</label>
                <select
                    value={selectedSpreadsheet}
                    label="Tabelle"
                    id='spreadsheet-select'
                    onChange={(event) => { try { setSelectedSpreadsheet(event.target.value); } catch (err) { showBoundary(err); } }}
                >
                    <option key={-1} value=''></option>
                    {
                        Object.entries(spreadsheetsComponentList).map(([_, component], index) => {
                            return (
                                <option key={index} value={component.SSId}>{component.label}</option>
                            );
                        })
                    }
                </select>
            </FormControl>
            <FormControl
                variant="standard"
                fullWidth
                style={SELECTION_STYLE}
                margin="normal"
                className='custom-select'>
                <label htmlFor="">Diagramm</label>
                <select
                    value={selectedDiagram}
                    label="Tabelle"
                    onChange={(event) => { try { setSelectedDiagram(event.target.value); } catch (err) { showBoundary(err); } }}
                    id='diagram-type'
                >
                    <option key={-1} value=''></option>
                    {
                        DIAGRAM_CONFIG.map((diagram, index) => {
                            return (
                                <option key={index} value={diagram.id}>
                                    {diagram.name}
                                </option>
                            );
                        })
                    }
                </select>
            </FormControl>

            <Button
                onClick={(e) => { try { saveDiagramTypeSSID(e); } catch (err) { showBoundary(err); } }}
                variant="contained"
                color='primary'
                size='small'
                disabled={!(selectedSpreadsheet && selectedDiagram)}
                endIcon={<ArrowForwardIcon />}
                style={FORWARD_BTN_STYLE}
            >
                    Weiter
            </Button>
        </div>
    );
}
