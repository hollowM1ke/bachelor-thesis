import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';

import LineChart from './DiagramTypes/LineChart';
import GroupedBarChart from './DiagramTypes/GroupedBarChart';
import StackedBarChart from './DiagramTypes/StackedBarChart';
import ScatterPlotChart from './DiagramTypes/ScatterPlotChart';
import { selectSpreadsheet } from '../../../../model/features/spreadsheets/spreadsheetsSlice';
import {
    IconButton
} from '@mui/material';
import {
    Parser as FormulaParser
} from 'hot-formula-parser';
import SettingsIcon from '@mui/icons-material/Settings';
import {
    DIAGRAM_CONTAINER_STYLE,
    SETTINGS_BTN_STYLE
} from './styles';
import { DIAGRAM_TYPES } from './DiagramTypes/diagramTypes';
import * as Matrix from '../SpreadSheet/matrix';
import { useErrorBoundary } from 'react-error-boundary';
export default function DiagramVisual ({
    docName,
    boardId,
    containerId,
    contextManager,
    diagramInfo,
    setShowDiagramVisual,
    studentOnBoardSktipt
}) {
    const { showBoundary } = useErrorBoundary();
    const spreadsheet = useSelector((state) => selectSpreadsheet(state, diagramInfo.ssid));
    // stores object {data, headers} that are to be passed down to diagrams
    const [visualizationData, setVisualizationData] = useState({ data: [], headers: [], categoryColumnValues: [] });
    const [diagramProperties, setDiagramProperties] = useState({});

    useEffect(() => {
        if (diagramInfo && diagramInfo.settings) {
            setDiagramProperties(JSON.parse(diagramInfo.settings));
        }
    }, [diagramInfo.settings]);

    useEffect(() => {
        if (Object.keys(diagramProperties).length > 0) {
            setVisualizationData(prepareVisualizationData);
        }
    }, [diagramProperties, spreadsheet.headers, spreadsheet.data]);

    const refContainer = useRef();
    const formulaParser = new FormulaParser();
    formulaParser.on('callCellValue', function (cellCoord, done) {
        let value;
        /** @todo More sound error, or at least document */
        try {
            const cell = Matrix.get(
                cellCoord.row.index,
                cellCoord.column.index,
                spreadsheet.data
            );
            value = parseNoCycles(cell);
        } catch (error) {
            console.error(error);
        } finally {
            done(value);
        }
    });
    formulaParser.on(
        'callRangeValue',
        (startCellCoord, endCellCoord, done) => {
            const startPoint = {
                row: startCellCoord.row.index,
                column: startCellCoord.column.index
            };
            const endPoint = {
                row: endCellCoord.row.index,
                column: endCellCoord.column.index
            };
            const values = Matrix.toArray(
                Matrix.slice(startPoint, endPoint, spreadsheet.data)
            ).map(cell => parseNoCycles(cell));
            done(values);
        });
    const getValue = ({ data }) => {
        return data ? data.value : null;
    };
    const parseNoCycles = (cell) => {
        let res;
        if (cell !== undefined) {
            if (cell.value && cell.value.length > 0 && cell.value.charAt(0) === '=' && !cell.visited) {
                res = formulaParser.parse(getValue({ data: cell }).slice(1)).result;
            } else {
                res = getValue({ data: cell });
            }
            delete cell.visited;
        }
        return res;
    };
    // prepares an object which is going to exported to the specified Diagram component
    // of specified diagramType with following structure:
    // {data: [[row0], [row1], ...]
    // headers: [header0, header1, ...]}
    // whereby the whole spreadsheet.data gets sliced in such a way, that only the selected rows
    // and columns at indices 'rows' and 'cols' (state variables) are considered
    // headers array only consists of headers at indices of selected columns ('cols' state variable)
    const prepareVisualizationData = () => {
        const sortedRows = diagramProperties.rows.sort((a, b) => {
            return a - b;
        });
        const sortedCols = diagramProperties.cols.sort();
        const categoryColumnValues = [];

        const data = [];
        sortedRows.forEach(rowIdx => {
            if (spreadsheet.data[rowIdx] !== undefined) {
                const col = [];
                sortedCols.forEach(colIdx => {
                    if (spreadsheet.data[rowIdx][colIdx] !== undefined) {
                        const { result, error } = (typeof spreadsheet.data[rowIdx][colIdx].value === 'string' && spreadsheet.data[rowIdx][colIdx].value.startsWith('=')) ? formulaParser.parse(spreadsheet.data[rowIdx][colIdx].value.slice(1)) : { result: undefined, error: undefined };
                        col.push((spreadsheet.data[rowIdx][colIdx] && spreadsheet.data[rowIdx][colIdx].value && !isNaN(spreadsheet.data[rowIdx][colIdx].value)) ? parseFloat(spreadsheet.data[rowIdx][colIdx].value) : ('string' && spreadsheet.data[rowIdx][colIdx].value.startsWith('=') && !error && result) ? parseFloat(result) : NaN); // GIT Issue #140, view for explanation
                    }
                });
                data.push(col);

                // Add the categoryColumn values. This is used for BarCharts->(Example)
                if ((diagramProperties.categoryColumn > -1) && spreadsheet.data[rowIdx][diagramProperties.categoryColumn].value !== '') {
                    categoryColumnValues.push(spreadsheet.data[rowIdx][diagramProperties.categoryColumn].value);
                } else if ((diagramProperties.categoryColumn > -1) && spreadsheet.data[rowIdx][diagramProperties.categoryColumn].value === '') {
                    // If the categoryColumn is used, its value is empty. Dump the row associated with it, as data is incomplete
                    data.splice(rowIdx, 1);
                }
            }
        });

        const headers = [];
        // skip the first column for visualizations such as lineChart, where the first column represents xAxis plot points
        const skipFirstColumn = [DIAGRAM_TYPES.LINECHART, DIAGRAM_TYPES.SCATTERPLOTCHART];
        sortedCols.forEach(colIdx => {
            if (spreadsheet.headers[colIdx] !== undefined) {
                if (skipFirstColumn.indexOf(diagramInfo.type) >= 0 && colIdx === 0) return;
                headers.push(spreadsheet.headers[colIdx]);
            }
        });
        return {
            data,
            headers,
            categoryColumnValues
        };
    };

    const displayDiagramVisual = () => {
        if (diagramInfo && diagramProperties && Object.keys(diagramProperties).length > 0 && visualizationData && visualizationData.data.length > 0) {
            switch (diagramInfo.type) {
            case DIAGRAM_TYPES.GROUPEDBARCHART: return (
                <GroupedBarChart
                    dataArray={visualizationData.data}
                    headers={visualizationData.headers}
                    xAxisCategories={visualizationData.categoryColumnValues}
                    parentRef={refContainer}
                    xLabel={diagramProperties.xLabel}
                    yLabel={diagramProperties.yLabel}
                    yMin={diagramProperties.yMin}
                    yMax={diagramProperties.yMax}
                />
            );
            case DIAGRAM_TYPES.STACKEDBARCHART: return (
                <StackedBarChart
                    dataArray={visualizationData.data}
                    headers={visualizationData.headers}
                    xAxisCategories={visualizationData.categoryColumnValues}
                    parentRef={refContainer}
                    xLabel={diagramProperties.xLabel}
                    yLabel={diagramProperties.yLabel}
                    yMin={diagramProperties.yMin}
                    yMax={diagramProperties.yMax}
                />
            );
            case DIAGRAM_TYPES.LINECHART: return (
                <LineChart
                    dataArray={visualizationData.data}
                    headers={visualizationData.headers}
                    parentRef={refContainer}
                    xLabel={diagramProperties.xLabel}
                    yLabel={diagramProperties.yLabel}
                    yMin={diagramProperties.yMin}
                    yMax={diagramProperties.yMax}
                />
            );
            case DIAGRAM_TYPES.SCATTERPLOTCHART: return (
                <ScatterPlotChart
                    dataArray={visualizationData.data}
                    headers={visualizationData.headers}
                    parentRef={refContainer}
                    xLabel={diagramProperties.xLabel}
                    yLabel={diagramProperties.yLabel}
                    yMin={diagramProperties.yMin}
                    yMax={diagramProperties.yMax}
                />
            );
            }
        }
    };

    return (
        <div data-testid='DiagramVisual' ref={refContainer} style={DIAGRAM_CONTAINER_STYLE}>
            <IconButton
                onClick={(e) => { try { setShowDiagramVisual(false); } catch (err) { showBoundary(err); } }}
                disabled={studentOnBoardSktipt || contextManager.adminPreview}
                style={SETTINGS_BTN_STYLE}
                size={'small'}
            >
                <SettingsIcon />
            </IconButton>
            <div className="svgContainer" style={{ width: '100%', height: '100%' }}>
                { displayDiagramVisual() }
            </div>
        </div>
    );
}
