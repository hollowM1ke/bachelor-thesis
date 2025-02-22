import React from 'react';
import { useSelector, useStore } from 'react-redux';
import { selectBoard } from '../../model/features/boards/boardsSlice';
import { getContextSelectorForSlice } from '../../model/features/functions/loaders';
import { CSVLink } from 'react-csv';

export default function ExportBoard ({ id, boardId }) {
    const { components } = useSelector((state) => selectBoard(state, boardId));
    const store = useStore();
    const deepCopy = {
        image: [],
        spreadsheet: [],
        markdown: [],
        htmlcomp: [],
        todolist: [],
        diagram: []
    };
    for (const componentId in components) {
        const { position, innerId, type, size } = components[componentId];
        if (type !== 'comment' && type !== 'progresstracker' && id === componentId) {
            const selector = getContextSelectorForSlice(type);
            const fullContext = selector(store.getState(), innerId);
            deepCopy[type].push({
                componentData: {
                    type,
                    position,
                    size
                },
                innerData: fullContext
            });
        }
    }

    const processedHeaders = (spreadsheetData) => {
        const fields = [];
        const givenHeaders = spreadsheetData[0].innerData.value.headers;
        for (const header of givenHeaders) {
            fields.push(header);
        }
        return fields;
    };

    const processedDeepCopy = (spreadsheetData) => {
        const dataToBeProcessed = spreadsheetData[0].innerData.value.data;
        const headers = spreadsheetData[0].innerData.value.headers;
        const rows = [];
        for (const data of dataToBeProcessed) {
            let row = [];
            for (let i = 0; i < data.length; i++) {
                row[i] = data[i].value;
            }
            rows.push(row);
            row = {};
        }
        return rows;
    };

    return (
        <CSVLink style={{ color: 'inherit', textDecoration: 'none' }} data={deepCopy.spreadsheet.length > 0 ? processedDeepCopy(deepCopy.spreadsheet) : []} headers={deepCopy.spreadsheet.length > 0 ? processedHeaders(deepCopy.spreadsheet) : []} separator={';'} enclosingCharacter={''} filename={'spreadsheet.csv'}>
            Tabellen Export
        </CSVLink>
    );
}
