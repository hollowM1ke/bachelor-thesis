import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import { selectSpreadsheet } from '../../../../../model/features/spreadsheets/spreadsheetsSlice';
import { useSelector, useDispatch } from 'react-redux';
import {
    setDiagramSettings as persistDiagramSettings
} from '../../../../../model/features/diagrams/diagramsSlice';
import { DIAGRAM_TYPES } from '../DiagramTypes/diagramTypes';
import { getMaxNumericArrayValue } from '../../../../../services/utils';
import {
    Button,
    TextField,
    FormControl,
    Grid,
    Divider,
    Typography
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForwardIosOutlined';
import {
    SETTINGS_CONTAINER_STYLE,
    FORWARD_BTN_STYLE
} from '../styles';
import { useErrorBoundary } from 'react-error-boundary';
export default function DiagramSettingsProperties ({
    docName,
    boardId,
    containerId,
    diagramInfo,
    setShowDiagramVisual
}) {
    const { showBoundary } = useErrorBoundary();
    const dispatch = useDispatch();
    const spreadsheet = useSelector((state) => selectSpreadsheet(state, diagramInfo.ssid));

    const [rows, setRows] = useState(spreadsheet.data.map((_, idx) => { return idx; }));
    // stores indices of selected columns (default: all columns)
    const [cols, setCols] = useState(spreadsheet.data[0].map((_, idx) => { return idx; }));
    // stores the column used for categorical representation (E.g: In BarCharts)
    // First column of the spreadsheet will be considered by default
    const [categoryCol, setCategoryCol] = useState(-1);
    // stores x-axis label (default: first header)
    const [xLabel, setXLabel] = useState('x-Achse');
    // stores y-axis label
    const [yLabel, setYLabel] = useState('y-Achse');
    // stores lower boundary for y-axis values
    const [yMin, setYMin] = useState();
    // stores upper boundary for y-axis values
    const [yMax, setYMax] = useState();
    // stores dropdown states for multiple dropdowns added to DOM
    const [viewDropdown, setViewDropdown] = useState({});

    useEffect(() => {
        const diagramProperties = JSON.parse(diagramInfo.settings);
        if (Object.keys(diagramProperties).length > 0) {
            setRows(diagramProperties.rows);
            setCols(diagramProperties.cols);
            setCategoryCol(diagramProperties.categoryColumn);
            setXLabel(diagramProperties.xLabel);
            setYLabel(diagramProperties.yLabel);
            setYMin(Number(diagramProperties.yMin));
            setYMax(Number(diagramProperties.yMax));
        } else {
            if (showCategoryColumnSelection()) {
                setCategoryCol(0);
                setCols(Array.from({ length: (spreadsheet.data[0].length - 1) }, (_, i) => i + 1)); // Create array skipping first column, with default selection of remaining columns from spreadsheet components
            }
        }
    }, [diagramInfo.settings]);

    useEffect(() => {
        let yMaxMinExistFlag = false;
        // Check if values already exist in DB
        if (diagramInfo && diagramInfo.settings) {
            const diagramProperties = JSON.parse(diagramInfo.settings);
            yMaxMinExistFlag = ((diagramProperties.yMin !== undefined) && (diagramProperties.yMax !== undefined));
        }
        if (yMin === undefined && yMax === undefined && !yMaxMinExistFlag) {
            setYaxisScaleValues();
        }
    }, [spreadsheet]);

    const handleDoubleClick = (e) => {
        e.stopPropagation();
    };

    // Save diagram settings saved and setFinsihed to true to display diagram
    const saveDiagramSettings = (event) => {
        event.preventDefault();
        // prepare diagramSettings from properties used above
        const diagramSettings = {
            rows: rows,
            cols: cols,
            categoryColumn: categoryCol,
            xLabel: xLabel,
            yLabel: yLabel,
            yMin: yMin,
            yMax: yMax
        };
        dispatch(persistDiagramSettings(docName, JSON.stringify(diagramSettings)));
        setShowDiagramVisual(true);
    };

    // The initial values or if values set to 0 of the yAxis based on data in spreadsheet
    const setYaxisScaleValues = () => {
        const data = spreadsheet.data.map(row => row.map(e => e.value));
        let yValsTransposed = data[0].map((col, i) => data.map(row => row[i]));
        let yMin = 10;
        let yMax = 10;

        switch (diagramInfo.type) {
        case DIAGRAM_TYPES.SCATTERPLOTCHART:
        case DIAGRAM_TYPES.LINECHART:
            // for LineChart we don't consider the first column
            yValsTransposed = yValsTransposed.slice(1, data[0].length);
            yMin = d3.min(yValsTransposed.flat());
            yMax = d3.max(yValsTransposed.flat());
            break;
        case DIAGRAM_TYPES.STACKEDBARCHART:
            // for StackedBarChart yMax has to be at least the maximum of each rows sum of positive yVals
            // yMin has to be at least the minimum of each rows sum of negative yVals
            data.forEach(row => {
                const rowYMin = d3.sum(row.filter(e => e < 0));
                const rowYMax = d3.sum(row.filter(e => e >= 0));
                if (rowYMin < yMin) yMin = rowYMin;
                if (rowYMax > yMax) yMax = rowYMax;
            });
            break;
        case DIAGRAM_TYPES.GROUPEDBARCHART:
            // for GroupedBarChart yMin has to be at least 0
            yMin = d3.min(yValsTransposed.flat()) >= 0 ? 0 : d3.min(yValsTransposed.flat());
            yMax = getMaxNumericArrayValue(yValsTransposed.flat());
            break;
        default:
            // throw new Error('invalid diagramType');
            break;
        };

        setYMin(parseFloat(yMin));
        setYMax(parseFloat(yMax));
    };

    const isSaveDisabled = () => {
        if (rows && rows.length > 0 && cols && cols.length > 0 && yLabel && (yMin !== '' && yMin !== undefined && !isNaN(yMin) && Number.isFinite(yMin)) && (yMax !== '' && yMax !== undefined && !isNaN(yMax) && Number.isFinite(yMax))) {
            return false;
        }
        return true;
    };

    const showCategoryColumnSelection = () => {
        return [DIAGRAM_TYPES.GROUPEDBARCHART, DIAGRAM_TYPES.STACKEDBARCHART].includes(diagramInfo.type);
    };

    return (
        <div style={SETTINGS_CONTAINER_STYLE} onFocus={(e) => { try { setViewDropdown({}); } catch (err) { showBoundary(err); } }} >
            <Typography gutterBottom variant="body2" color='text.secondary'>
                Zeilen und Spalten wählen
            </Typography>
            <Grid container spacing={2} columnSpacing={0}>
                <Grid item xs={6}>
                    <FormControl variant="standard" fullWidth>
                        <label htmlFor="" className='custom-select-label'>Zeilen</label>
                        <div className="custom-multiselect" onClick={(e) => { try { setViewDropdown((prevState) => { return { ...prevState, zeilen: !prevState.zeilen }; }); } catch (err) { showBoundary(err); } }}>
                            <div className="custom-select">
                                <select>
                                    <option>
                                        { (rows && rows.length > 0) ? rows.map(val => val + 1).toString() : 'Select an option' }
                                    </option>
                                </select>
                                <div className="custom-overSelect"></div>
                            </div>
                            <div className="custom-checkboxes" style={ viewDropdown.zeilen ? { display: 'block' } : { display: 'none' } }>
                                {
                                    spreadsheet.data.map((_, rowIdx) => {
                                        return (
                                            <label key={rowIdx} className='custom-checkbox-container'>
                                                <input
                                                    type="checkbox"
                                                    checked={rows.includes(rowIdx)}
                                                    value={rowIdx}
                                                    onClick={(event) => {
                                                        try {
                                                            setRows((prevState) => {
                                                                const prevStateObj = [...prevState];
                                                                if (event.target.checked) {
                                                                    prevStateObj.push(Number(event.target.value));
                                                                } else if (!event.target.checked && (prevStateObj.indexOf(Number(event.target.value) > -1))) {
                                                                    prevStateObj.splice(prevStateObj.indexOf(Number(event.target.value)), 1);
                                                                }
                                                                return prevStateObj;
                                                            });
                                                        } catch (err) { showBoundary(err); }
                                                    }}
                                                />
                                                <span> {`Zeile ${rowIdx + 1}`} </span>
                                                <span className='custom-checkmark'></span>
                                            </label>
                                        );
                                    })
                                }
                            </div>
                        </div>
                    </FormControl>
                </Grid>
                <Grid item xs={6}>
                    <FormControl variant="standard" fullWidth>
                        <label htmlFor="" className='custom-select-label'>Spalten</label>
                        <div className="custom-multiselect" onClick={(e) => { try { setViewDropdown((prevState) => { return { ...prevState, spalten: !prevState.spalten }; }); } catch (err) { showBoundary(err); } } }>
                            <div className="custom-select">
                                <select>
                                    <option>
                                        { (cols && cols.length > 0) ? cols.map(colIdx => spreadsheet.headers[colIdx]).toString() : 'Select an option' }
                                    </option>
                                </select>
                                <div className="custom-overSelect"></div>
                            </div>
                            <div className="custom-checkboxes" style={ viewDropdown.spalten ? { display: 'block' } : { display: 'none' } }>
                                {
                                    spreadsheet.data[0].map((_, colIdx) => {
                                        return (
                                            // For Line and Scatter Charts the first column is disabled as it is used to plot the xAxis points. The columns selected in 'Spalten', will be used to plot at yAxis.
                                            // If categoryColumn is selected, the column should not be plotted, as it contains categorical information and not numerical information used for plotting
                                            <label key={colIdx} className='custom-checkbox-container'>
                                                <input
                                                    type="checkbox"
                                                    checked={cols.includes(colIdx)}
                                                    value={colIdx}
                                                    disabled={(colIdx === 0 && [DIAGRAM_TYPES.LINECHART, DIAGRAM_TYPES.SCATTERPLOTCHART].includes(diagramInfo.type)) || (categoryCol > -1 && colIdx === categoryCol)}
                                                    onClick={(event) => {
                                                        try {
                                                            setCols((prevState) => {
                                                                const prevStateObj = [...prevState];
                                                                if (event.target.checked) {
                                                                    prevStateObj.push(Number(event.target.value));
                                                                } else if (!event.target.checked && event.target.value && (prevStateObj.indexOf(Number(event.target.value) > -1))) {
                                                                    prevStateObj.splice(prevStateObj.indexOf(Number(event.target.value)), 1);
                                                                }
                                                                return prevStateObj;
                                                            });
                                                        } catch (err) { showBoundary(err); }
                                                    }}
                                                />
                                                <span className='custom-checkmark'></span>
                                                <span> {spreadsheet.headers[colIdx]} </span>
                                            </label>
                                        );
                                    })
                                }
                            </div>
                        </div>
                    </FormControl>
                </Grid>
                {
                    showCategoryColumnSelection()
                        ? <Grid item xs={6}>
                            <FormControl variant="standard" fullWidth className='custom-select'>
                                <label htmlFor="">Kategoriale Spalte</label>
                                <select
                                    value={categoryCol}
                                    label="Kategoriale Spalte"
                                    id='kategoriale_spalte'
                                    onChange={(event) => {
                                        try {
                                            setCategoryCol(Number(event.target.value));
                                            // Remove column selected from the 'Spalten' selection. Column cannot be used in both category and value
                                            const removeValueIndex = cols.indexOf(Number(event.target.value));
                                            if (removeValueIndex > -1) { // only splice array when item is found
                                                setCols((prevState) => {
                                                    const prevStateObj = [...prevState];
                                                    prevStateObj.splice(removeValueIndex, 1);
                                                    return prevStateObj;
                                                });
                                            }
                                        } catch (err) { showBoundary(err); }
                                    }}
                                >
                                    <option key={-1} value={-1}></option>
                                    {
                                        spreadsheet.data[0].map((_, colIdx) => {
                                            return (
                                                <option key={colIdx} value={colIdx}>{spreadsheet.headers[colIdx]}</option>
                                            );
                                        })
                                    }
                                </select>
                            </FormControl>
                        </Grid>
                        : <></>
                }

                <Grid item xs={12}>
                    <Divider />
                </Grid>
                <Grid item xs={12}>
                    <Typography gutterBottom variant="body2" color='text.secondary'>
                        Achsenbeschriftung wählen
                    </Typography>
                </Grid>
            </Grid>
            <Grid container spacing={2} columnSpacing={0}>
                <Grid item xs={6}>
                    <TextField
                        variant="standard"
                        label='x-Achse'
                        value={xLabel}
                        onDoubleClick={(e) => { try { handleDoubleClick(e); } catch (err) { showBoundary(err); } }}
                        onChange={(event) => { try { setXLabel(event.target.value); } catch (err) { showBoundary(err); } }} />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        variant="standard"
                        label='y-Achse'
                        onChange={(event) => { try { setYLabel(event.target.value); } catch (err) { showBoundary(err); } }}
                        onDoubleClick={(e) => { try { handleDoubleClick(e); } catch (err) { showBoundary(err); } }}
                        value={yLabel} />
                </Grid>
                <Grid item xs={12}>
                    <Divider />
                </Grid>
                <Grid item xs={12}>
                    <Typography gutterBottom variant="body2" color='text.secondary'>
                        Skalierung y-Achse
                    </Typography>
                </Grid>
            </Grid>
            <Grid container spacing={2} columnSpacing={0}>
                <Grid item xs={6}>
                    <TextField
                        variant="standard"
                        label='minY'
                        type='number'
                        inputMode="decimal"
                        lang="en_001"
                        // defaultValue={getYScaleVals().yMin}
                        value={yMin}
                        onChange={(event) => { try { event.target.value ? setYMin(parseFloat(event.target.value)) : setYMin(undefined); } catch (err) { showBoundary(err); } }}
                        onDoubleClick={(e) => { try { handleDoubleClick(e); } catch (err) { showBoundary(err); } }} />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        variant="standard"
                        label='maxY'
                        type='number'
                        inputMode="decimal"
                        lang="en_001"
                        // defaultValue={getYScaleVals().yMax}
                        value={yMax}
                        onChange={(event) => { try { event.target.value ? setYMax(parseFloat(event.target.value)) : setYMax(undefined); } catch (err) { showBoundary(err); } }}
                        onDoubleClick={(e) => { try { handleDoubleClick(e); } catch (err) { showBoundary(err); } }} />
                </Grid>
                <Grid item xs={12}>
                    <Divider />
                </Grid>
            </Grid>
            <Button
                variant="contained"
                color='primary'
                size='small'
                endIcon={<ArrowForwardIcon />}
                style={FORWARD_BTN_STYLE}
                disabled={isSaveDisabled()}
                onClick={(e) => { try { saveDiagramSettings(e); } catch (err) { showBoundary(err); } }}
            >
                Fertig
            </Button>
        </div>
    );
};
