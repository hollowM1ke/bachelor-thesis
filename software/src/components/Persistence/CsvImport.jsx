import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import NativeSelect from '@mui/material/NativeSelect';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { addComponent } from '../../model/features/boards/boardsSlice';
import { generatePseudoRandomId } from '../../services/ids';
import Papa from 'papaparse';
import { TOOL_TYPES } from '../Tools/toolTypes';
import {
    Button,
    TextField
} from '@mui/material';
import Modal from 'react-modal';
import {
    SI_MODAL_STYLE,
    SI_CONTAINER_STYLE,
    MIDDLE_ROW_CONTAINER_STYLE,
    ACTION_BUTTON_STYLE,
    useToolboxStyles
} from './styles';
import { generateAPILinkConcentration, getApiOptionsBiologie, redirectLinkBio } from './PrototypeConentrationAPI/APIAccessMS';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { checkFileTypes } from '../../services/utils';
import { useErrorBoundary } from 'react-error-boundary';
import QRCode from 'react-qr-code';

export default function ImportBoard ({ boardId, contextManager, triggerEvent }) {
    // Construction of the date for the API
    const dateObjekt = new Date();
    const day = dateObjekt.getDate();
    let month = dateObjekt.getMonth() + 1;
    if (month < 10) {
        month = `0${month}`;
    }
    const year = dateObjekt.getFullYear();
    const today = `${day}${month}${year}`;

    const { showBoundary } = useErrorBoundary();
    const dispatch = useDispatch();
    const [uploadHeaderCheck, setuploadHeaderCheck] = React.useState(false);
    const [URLUploadModalOpen, setURLUploadModalOpen] = useState(false);
    const [importURL, setimportURL] = useState(undefined);

    const [selectedOption, setSelectedOption] = useState('');
    const [id, setId] = useState(undefined);
    const [user, setUser] = useState(contextManager.userId);
    const [date, setDate] = useState(today);

    const classes = useToolboxStyles();

    useEffect(() => {
        if (triggerEvent > 0) {
            UrlUploadModalChanger(true);
        }
    }, [triggerEvent]);

    async function BioAPI (type = 'concentration') {
        let url = '';
        let options = {};
        // fails if env variable REACT_APP_..._PUBLIC_KEY is not set
        try {
            url = generateAPILinkConcentration({ type, name: user, date, imageid: id });
        } catch (e) {
            toast.error(e.message);
        }
        const header = true;
        // fails if env variable REACT_APP_..._TOKEN is not set
        try {
            options = getApiOptionsBiologie();
        } catch (e) {
            toast.error(e.message);
        }
        externalDataFetch(options, 'json', header, url);
    }
    async function fetchContent (type = 'json', url, options = { method: 'POST' }) {
        if (type === 'json') {
            const res = await fetch(url, options);
            const json = await res.json();
            return json;
        } else if (type === 'csv') {
            const res = await fetch(url, options);
            const csv = await res.text();
            return csv;
        }
    }
    async function externalDataFetch (options = { method: 'GET' }, type = 'json', header = false, givenUrl = undefined) {
        const url = givenUrl || importURL;
        if (url) {
            let fetchedContent = {};
            try {
                fetchedContent = await fetchContent(type, url, options);
                if (type === 'json') {
                    parseJSON(fetchedContent, header);
                } else if (type === 'csv') {
                    parseCSV(fetchedContent, header);
                }
            } catch (e) {
                toast.error('Fehler beim Laden der Daten');
            }
        }
    }

    function openFileUpload () {
        const header = uploadHeaderCheck;
        const fileDialog = document.createElement('input');
        fileDialog.setAttribute('type', 'file');
        fileDialog.onchange = () => {
            const files = [...fileDialog.files];
            const fileTypes = ['csv', 'json', 'txt']; // acceptable file types
            const FileType = checkFileTypes(files[0], fileTypes);
            const reader = new FileReader();
            reader.onload = (e) => {
                if (FileType === -1) {
                    toast.error('Falsches Dateiformat');
                } else if (FileType === 0 || FileType === 2) {
                    if (e.target.result) {
                        parseCSV(e.target.result, header);
                    }
                } else if (FileType === 1) {
                    if (e.target.result) {
                        parseJSON(e.target.result, header);
                    }
                }
            };
            reader.readAsText(files[0]);
        };
        fileDialog.click();
    };
    // ----- CREATE COPY OF CSV IMPORTED COMPONENT -----
    function parseJSON (json, header = false) {
        const csv = Papa.unparse(json, {
            header: header
        });

        Papa.parse(csv, {
            header: header,
            delimiter: '',
            skipEmptyLines: true,
            delimitersToGuess: [',', '\t', '|', ';', Papa.RECORD_SEP, Papa.UNIT_SEP],
            complete: function (results) {
                importCsvCopy(results, header);
            }
        });
    }
    function parseCSV (csv, header = false, url = undefined) {
        Papa.parse(csv, {
            header: header,
            delimiter: '',
            skipEmptyLines: true,
            delimitersToGuess: [',', '\t', '|', ';', Papa.RECORD_SEP, Papa.UNIT_SEP],
            complete: function (results) {
                importCsvCopy(results, header);
            }
        });
    }
    function getNeededColumnsNumber (results, header) {
        let numberOfColumns = 0;
        if (header) {
            numberOfColumns = results.meta.fields.length;
        }
        for (let i = 0; i < results.data.length; i++) {
            numberOfColumns = Math.max(Object.keys(results.data[i]).length, numberOfColumns);
        }
        return numberOfColumns;
    }
    const importCsvCopy = (results, header = false) => {
        // adding columns (equal the length of the longest row/header)
        const numberOfColumns = getNeededColumnsNumber(results, header);
        // results.data.length === 0 means that there are no rows in the csv
        const numberOfRow = results.data.length;
        if (numberOfColumns === 0 || numberOfRow === 0) {
            toast.error('Keine Daten in der zu importierenden Tabelle');
            return;
        }
        const newInnerId = generatePseudoRandomId();
        dispatch(addComponent({
            id: boardId,
            type: TOOL_TYPES.SPREADSHEET,
            innerId: newInnerId,
            position: {
                x: 200,
                y: 200
            },
            createdBy: contextManager.userId,
            createdOn: (new Date()).toLocaleDateString('en-DE', { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
            componentName: contextManager.toolList.filter(tool => tool.type === TOOL_TYPES.SPREADSHEET)[0].name,
            loadSkip: true
        }));
        const innerData = {
            type: TOOL_TYPES.SPREADSHEET,
            value: {
                data: [
                ],
                meta: {
                    rows: [
                        'r1'
                    ],
                    columns: [
                        'c1'
                    ]
                },
                headers: [
                ],
                cellHighlightFormatRules: {}
            }
        };
        // adding meta
        // adding rows (equal the length of data)
        for (let i = 1; i < numberOfRow; i++) {
            innerData.value.meta.rows.push(generatePseudoRandomId());
        }
        for (let i = 1; i < numberOfColumns; i++) {
            innerData.value.meta.columns.push(generatePseudoRandomId());
        }
        // adding data
        for (let i = 0; i < numberOfRow; i++) {
            const rowWise = [];
            Object.keys(results.data[i]).forEach(key => {
                rowWise.push({
                    value: results.data[i][key],
                    type: 'string',
                    timestamp: 1658147255861,
                    color: '#ffffff'
                });
            });
            innerData.value.data.push(rowWise);
        }
        // adding headers if they exsist
        if (header) {
            const headerArray = results.meta.fields;
            for (let i = 0; i < headerArray.length; i++) {
                if (headerArray[i] === '') {
                    // headerArray[i] = '' means that there are no more interpretable headers
                    headerArray[i] = 'XYZ';
                    for (let j = 0; j < numberOfColumns; j++) {
                        innerData.value.headers.push('XYZ');
                    }
                } else {
                    innerData.value.headers.push(results.meta.fields[i]);
                }
            }
        } else {
            for (let i = 0; i < innerData.value.meta.columns.length; i++) {
                innerData.value.headers.push('XYZ');
            }
        }
        contextManager.loadComponent(boardId, newInnerId, TOOL_TYPES.SPREADSHEET, innerData);
    };
    // --- React logic ---
    const handleUploadHeaderCheckChange = (event) => {
        setuploadHeaderCheck(event.target.checked);
    };
    const UrlUploadModalChanger = (bool) => {
        setURLUploadModalOpen(bool);
    };
    const handleUrlChange = (event) => {
        setimportURL(event.target.value);
    };
    // Michael Spanier API Specific
    const handleIdChange = (event) => {
        setId(event.target.value);
    };
    const handleUserChange = (event) => {
        setUser(event.target.value);
    };
    const handleDateChange = (event) => {
        setDate(event.target.value);
    };
    const handleImportSelectChange = (event) => {
        setSelectedOption(event.target.value);
    };
    const pHlink = redirectLinkBio(contextManager.userId, 'pH');
    const concentrationlink = redirectLinkBio(contextManager.userId);

    return (
        <span className={classes.root}>
            Tabellen Import
            <Modal
                id='import-spreadsheet-modal'
                data-testId='import-spreadsheet-modal'
                isOpen={URLUploadModalOpen}
                contentLabel='URLUploadModal'
                style={SI_MODAL_STYLE}
                parentSelector={() => (document.getElementsByClassName('fullscreen') ? document.getElementsByClassName('fullscreen')[0] : undefined)}
            >
                <div style={SI_CONTAINER_STYLE}>
                    <Box sx={{ minWidth: 120 }}>
                        <FormControl fullWidth>
                            {(process.env.REACT_APP_VERSION === 'bio')
                                ? <NativeSelect
                                    value={selectedOption}
                                    inputProps={{
                                        id: 'import-select',
                                        'data-testId': 'import-select'
                                    }}
                                    onChange={handleImportSelectChange}
                                >
                                    <option style={{ display: 'none' }} value={''}>Wähle...</option>
                                    <option value={'fileUpload'}>Datei-Upload</option >
                                    <option value={'concentration'}>Konzentrations-Messung</option>
                                    <option value={'pH'}>pH-Wertmessung</option>
                                </NativeSelect>
                                : <NativeSelect
                                    value={selectedOption}
                                    inputProps={{
                                        id: 'import-select',
                                        'data-testId': 'import-select'
                                    }}
                                    onChange={handleImportSelectChange}
                                >
                                    <option style={{ display: 'none' }} value={''}>Wähle...</option>
                                    <option value={'fileUpload'}>Datei-Upload</option >
                                    <option value={'JSON'}>JSON Import</option >
                                    <option value={'CSV'}>CSV Import</option>
                                </NativeSelect>

                            }
                            <div style={{ height: '10px' }} />
                            {(selectedOption === 'fileUpload')
                                ? <FormControlLabel
                                    control={ <Checkbox
                                        checked={uploadHeaderCheck}
                                        onChange={handleUploadHeaderCheckChange}
                                        inputProps={{ 'aria-label': 'controlled' }}
                                    />}
                                    label="Kopfzeile"
                                    labelPlacement="bottom"
                                />
                                : <></>
                            }

                        </FormControl>
                    </Box>
                    {(selectedOption === 'concentration' || selectedOption === 'pH') && (
                        <div style={MIDDLE_ROW_CONTAINER_STYLE}>
                            <TextField value={user} defaultValue={contextManager.userId} onChange={handleUserChange} label='Nutzername' variant='outlined' />
                            <TextField value={date} defaultValue={today} onChange={handleDateChange} label='Datum' variant='outlined' />
                            <TextField value={id} onChange={handleIdChange} label='BilderId' variant='outlined' />

                        </div>
                    )}
                    {selectedOption === 'concentration'
                        ? <><div style={{ height: 'auto', margin: '0 auto', maxWidth: 64, width: '100%' }}>
                            <QRCode
                                size={256}
                                style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                                value={concentrationlink}
                                viewBox={'0 0 256 256'} />
                        </div><div style={{ height: '10px' }} />
                        <Button
                            data-testid='concentration-redirect-button'
                            onClick={() => window.open(concentrationlink)}
                            size="large">
                                Zur Konzentrationsmessung wechseln
                        </Button></>

                        : (selectedOption === 'pH')
                            ? <><div style={{ height: 'auto', margin: '0 auto', maxWidth: 64, width: '100%' }}>
                                <QRCode
                                    size={256}
                                    style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                                    value={pHlink}
                                    viewBox={'0 0 256 256'} />
                            </div><div style={{ height: '10px' }} />
                            <Button
                                data-testid='pH-redirect-button'
                                onClick={() => window.open(pHlink)}
                                size="large">
                                    Zur pH-Wertmessung wechseln
                            </Button></>
                            : <></>
                    }

                    {(selectedOption === 'CSV' || selectedOption === 'JSON') && (
                        <div style={MIDDLE_ROW_CONTAINER_STYLE}>
                            <TextField value={importURL} onChange={handleUrlChange} multiline rows={4} label='URL' variant='outlined' />
                        </div>
                    )}
                    {selectedOption === 'CSV' || selectedOption === 'JSON'
                        ? <div ><FormControlLabel
                            value="bottom"
                            control={<Checkbox />}
                            label="Headers"
                            labelPlacement="bottom"
                        /></div>
                        : <></>}
                    <div>
                        { (selectedOption === 'concentration' || selectedOption === 'pH')
                            ? <Button onClick={() => { BioAPI(selectedOption); setURLUploadModalOpen(false); }} disabled={!selectedOption} style={ACTION_BUTTON_STYLE} size='small' variant='contained' color='secondary' aria-label='small contained secondary button'>IMPORTIEREN</Button>
                            : (selectedOption === 'fileUpload')
                                ? <Button onClick={() => { openFileUpload(); setURLUploadModalOpen(false); }} disabled={!selectedOption} style={ACTION_BUTTON_STYLE} size='small' variant='contained' color='secondary' aria-label='small contained secondary button'>IMPORTIEREN</Button>
                                : <Button onClick={() => { externalDataFetch(); setURLUploadModalOpen(false); }} disabled={!selectedOption} style={ACTION_BUTTON_STYLE} size='small' variant='contained' color='secondary' aria-label='small contained secondary button'>IMPORTIEREN</Button> }
                        <Button onClick={() => setURLUploadModalOpen(false)} size='small' variant='contained' style={ACTION_BUTTON_STYLE} aria-label='small contained button'>VERWERFEN</Button>
                    </div>
                </div>
            </Modal>
        </span>
    );
}
