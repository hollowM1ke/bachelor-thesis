import React, { useState } from 'react';
import {
    IconButton,
    Button,
    Divider,
    AppBar,
    Toolbar as MuiToolbar,
    Grid,
    TextField,
    Popover,
    Select,
    MenuItem
} from '@mui/material';
import { ColorPalette, ColorButton } from 'mui-color';
import { ReactComponent as AddRowIcon } from '../../../../assets/images/SpreadSheetLogos/add_row.svg';
import { ReactComponent as AddColumnIcon } from '../../../../assets/images/SpreadSheetLogos/add_column.svg';
import { ReactComponent as DeleteRowIcon } from '../../../../assets/images/SpreadSheetLogos/delete_row.svg';
import { ReactComponent as DeleteColumnIcon } from '../../../../assets/images/SpreadSheetLogos/delete_column.svg';
import { ReactComponent as ColorFillIcon } from '../../../../assets/images/SpreadSheetLogos/color_fill.svg';
import { ReactComponent as ColorFillConditionalIcon } from '../../../../assets/images/SpreadSheetLogos/color_fill_conditional.svg';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import { COLOR_PALETTE } from './spreadsheetConfig';
import { useErrorBoundary } from 'react-error-boundary';
/**
 * @param props.onClickRow Handler for adding a row
 * @param onClickColumn Handler for adding a column
 * @param props.onClickRowDelete Handler for deleting a row
 * @param onClickColumnDelete Handler for deleting a column
 * @param onColorChange Handler for changing Cells color value
 * @param data spreadsheet data array
 * @param selected selected cells
 * @param cellHighlightFormatRules highlight rules for the spreadsheet
 * @param onAddCellHighlightFormatRule Handler for adding cell highlight formatting rule
 * @param onDeleteCellHighlightFormatRule Handler for Deleting cell highlight formatting rule
 */
export default function Toolbar ({
    onClickRow,
    onClickColumn,
    onClickRowDelete,
    onClickColumnDelete,
    onColorChange,
    data,
    selected,
    studentOnBoardSktipt,
    adminPreview,
    settingsObject,
    cellHighlightFormatRules,
    onAddCellHighlightFormatRule,
    onDeleteCellHighlightFormatRule
}) {
    const { showBoundary } = useErrorBoundary();
    // stores if color palette should be displayed
    const [fillColorPopoverIsOpen, setFillColorPopoverIsOpen] = useState(false);
    // stores if color highlight rules popover should be displayed
    const [colorRulesPopoverIsOpen, setColorRulesPopoverIsOpen] = useState(false);
    // stores anchor for popovers
    const [anchorEl, setAnchorEl] = useState(null);

    const handleOpenColorPalette = (event) => {
        setFillColorPopoverIsOpen(true);
        setAnchorEl(event.currentTarget);
    };
    const handleOpenRuleModal = (event) => {
        setColorRulesPopoverIsOpen(true);
        setAnchorEl(event.currentTarget);
    };

    const handleCloseColorPalette = (selectedColor) => {
        setFillColorPopoverIsOpen(false);
        for (const row in selected) {
            for (const col in selected[row]) {
                const value = data[row][col].value;
                onColorChange(row, col, value, 'string', selectedColor);
            }
        };
    };

    // Prepare palette object in appropriate form for 'ColorPalette'
    const palette = Object.fromEntries(
        Object.entries(COLOR_PALETTE)
            .map(([key, val]) => [key, key])
    );
    const handleDoubleClick = (e) => {
        e.stopPropagation();
    };
    return (
        <div className='Toolbar' onDoubleClick={handleDoubleClick} >
            <ColorFillPopover
                fillColorPopoverIsOpen={fillColorPopoverIsOpen}
                disabled={studentOnBoardSktipt || adminPreview}
                anchorEl={anchorEl}
                palette={palette}
                handleClose={handleCloseColorPalette}
            />
            <ColorRulesPopover
                colorRulesPopoverIsOpen={colorRulesPopoverIsOpen}
                setColorRulesPopoverIsOpen={setColorRulesPopoverIsOpen}
                cellHighlightFormatRules={cellHighlightFormatRules}
                selected={selected}
                disabled={studentOnBoardSktipt || adminPreview}
                anchorEl={anchorEl}
                palette={palette}
                onAddCellHighlightFormatRule={onAddCellHighlightFormatRule}
                onDeleteCellHighlightFormatRule={onDeleteCellHighlightFormatRule}
            />
            <AppBar className='AppBar' position='relative'>
                <MuiToolbar>
                    {/* <Tooltip title="Reihe einfügen" arrow> */}
                    <><IconButton
                        id = {'row'}
                        data-testid = "row"
                        disabled={studentOnBoardSktipt || adminPreview}
                        onClick={(e) => { try { onClickRow(e); } catch (err) { showBoundary(err); } }}
                        size={'small'}
                    >
                        <AddRowIcon width={20} height={20} />
                    </IconButton>
                    <Divider orientation="vertical" flexItem />
                    <IconButton
                        id={'col1'}
                        data-testid ="col1"
                        disabled={studentOnBoardSktipt || adminPreview}
                        onClick={(e) => { try { onClickColumn(e); } catch (err) { showBoundary(err); } }}
                        size={'small'}
                    >
                        <AddColumnIcon width={20} height={20} />
                    </IconButton>
                    <Divider orientation="vertical" flexItem />
                    <IconButton
                        id = {'rowDel'}
                        data-testid = "rowDel"
                        disabled={studentOnBoardSktipt || adminPreview}
                        onClick={(e) => { try { if (confirm('Löschung bestätigen?') === true) onClickRowDelete(e); } catch (err) { showBoundary(err); } }}
                        size={'small'}
                    >
                        <DeleteRowIcon width={20} height={20} />
                    </IconButton>
                    <Divider orientation="vertical" flexItem />
                    <IconButton
                        id = {'colDel'}
                        data-testid = "coldel"
                        disabled={studentOnBoardSktipt || adminPreview}
                        onClick={(e) => { try { if (confirm('Löschung bestätigen?') === true) onClickColumnDelete(e); } catch (err) { showBoundary(err); } }}
                        size={'small'}
                    >
                        <DeleteColumnIcon width={20} height={20} />
                    </IconButton>
                    <Divider orientation="vertical" flexItem /> </>

                    {/* <Tooltip title="Zelle einfärben" arrow> */}
                    <IconButton
                        id = {'colFill'}
                        data-testid="colfill"
                        disabled={studentOnBoardSktipt || adminPreview}
                        onClick={(e) => { try { handleOpenColorPalette(e); } catch (err) { showBoundary(err); } }}
                        size={'small'}
                    >
                        <ColorFillIcon width={20} height={20} />
                    </IconButton>
                    {/* </Tooltip> */}
                    <Divider orientation="vertical" flexItem />
                    {/* <Tooltip title="Regeln für Farben definieren" arrow> */}
                    <IconButton
                        id = {'colFillCon'}
                        data-testid = "colfillcon"
                        disabled={studentOnBoardSktipt || adminPreview}
                        onClick={(e) => { try { handleOpenRuleModal(e); } catch (err) { showBoundary(err); } }}
                        size={'small'}
                    >
                        <ColorFillConditionalIcon width={20} height={20} />
                    </IconButton>
                    {/* </Tooltip> */}
                </MuiToolbar>
            </AppBar>
        </div>
    );
};

function ColorFillPopover ({
    fillColorPopoverIsOpen,
    anchorEl,
    palette,
    handleClose
}) {
    const { showBoundary } = useErrorBoundary();
    // stores the color that got selected by the color palette
    const [selectedColor, setSelectedColor] = useState('#ffffff');
    const handleDoubleClick = (e) => {
        e.stopPropagation();
    };
    return (
        <Popover
            data-testid='colorPopOver'
            className='SpreadsheetPopover'
            open={fillColorPopoverIsOpen}
            anchorEl={anchorEl}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left'
            }}
            onDoubleClick={handleDoubleClick}
        >
            <ColorPalette
                palette={palette}
                onSelect={(value) => { try { setSelectedColor(palette[value]); } catch (err) { showBoundary(err); } }}
            />
            <Button
                onClick={(e) => { try { handleClose(selectedColor); } catch (err) { showBoundary(err); } }}
                variant="contained"
                color='primary'
                size='small'
            >
                Bestätigen
            </Button>
        </Popover>
    );
};

function ColorRulesPopover ({
    colorRulesPopoverIsOpen,
    setColorRulesPopoverIsOpen,
    cellHighlightFormatRules,
    anchorEl,
    palette,
    onAddCellHighlightFormatRule,
    onDeleteCellHighlightFormatRule,
    selected
}) {
    const { showBoundary } = useErrorBoundary();
    // store if color palette for selecting color of new rule should be displayed
    const [paletteIsOpen, setPaletteIsOpen] = useState(false);
    // stores anchor for color palette
    const [paletteAnchorEl, setPaletteAnchorEl] = useState(null);
    // stores lower bound of new rule
    const [newRuleLowerBound, setNewRuleLowerBound] = useState('');
    // stores upper bound of new rule
    const [newRuleUpperBound, setNewRuleUpperBound] = useState('');
    // stores color of new rule
    const [newRuleColor, setNewRuleColor] = useState('#ffffff');
    // If match type selcted is Text: This key stores the text value to check if exists in the cells
    const [newRuleMatchCellText, setNewRuleMatchCellText] = useState('');
    // Defines the type of matching to highlight a cell. (E.g.: Numeric Value range or Contain Text)
    const [newRuleCellMatchType, setNewRuleCellMatchType] = useState('Cell Value');
    // Defines type of range selection (Entire Spreadsheet or Defined range in spreadsheet) to perform the hihglight formatting
    const [newRuleCellRangeSelectionType, setNewRuleCellRangeSelectionType] = useState('Selected Range');

    const handleOpenPalette = (event) => {
        setPaletteIsOpen(true);
        setPaletteAnchorEl(event.currentTarget);
    };

    const handleClosePalette = (selectedColor) => {
        setPaletteIsOpen(false);
        setNewRuleColor(selectedColor);
    };

    const handleSubmitNewRule = () => {
        onAddCellHighlightFormatRule(newRuleCellMatchType, newRuleCellRangeSelectionType, newRuleColor, selected, [newRuleLowerBound === '' ? undefined : newRuleLowerBound, newRuleUpperBound === '' ? undefined : newRuleUpperBound], newRuleMatchCellText);
        setNewRuleLowerBound('');
        setNewRuleUpperBound('');
        setNewRuleColor('#ffffff');
        setNewRuleCellMatchType('Cell Value');
        setNewRuleCellRangeSelectionType('Selected Range');
        setNewRuleMatchCellText('');
    };

    const loadCellMatchTypeDOM = () => {
        switch (newRuleCellMatchType) {
        case 'Cell Value': return (
            <>
                <Grid item xs={4}>
                    <TextField
                        inputProps={{ 'data-testid': 'valueLowerBound' }}
                        variant='standard'
                        type='number'
                        inputMode='decimal'
                        lang="en_001"
                        defaultValue={newRuleLowerBound}
                        value={newRuleLowerBound}
                        onChange={(event) => { try { setNewRuleLowerBound(event.target.value); } catch (err) { showBoundary(err); } }} />
                </Grid><Grid item xs={4} className='AlignTextVerticalCenter'>
                    {' \u2264 Wert \u2264 '}
                </Grid><Grid item xs={4}>
                    <TextField
                        inputProps={{ 'data-testid': 'valueUpperBound' }}
                        variant='standard'
                        type='number'
                        lang="en_001"
                        inputMode='decimal'
                        defaultValue={newRuleUpperBound}
                        value={newRuleUpperBound}
                        onChange={(event) => { try { setNewRuleUpperBound(event.target.value); } catch (err) { showBoundary(err); } }} />
                </Grid>
            </>
        );
        case 'Specific Text': return (
            <Grid item xs={12}>
                <TextField
                    variant='standard'
                    type='text'
                    defaultValue={newRuleMatchCellText}
                    value={newRuleMatchCellText}
                    onChange={(event) => { try { setNewRuleMatchCellText(event.target.value); } catch (err) { showBoundary(err); } }} />
            </Grid>
        );
        default: return (<></>);
        }
    };

    const isAddRuleDisabled = () => {
        if (newRuleCellRangeSelectionType === 'Selected Range') {
            if (newRuleCellMatchType === 'Cell Value' && (newRuleLowerBound !== '') && (newRuleUpperBound !== '') && Object.keys(selected).length > 0) {
                return false;
            } else if (newRuleCellMatchType === 'Specific Text' && newRuleMatchCellText && Object.keys(selected).length > 0) {
                return false;
            }
            return true;
        } else {
            if (newRuleCellMatchType === 'Cell Value' && (newRuleLowerBound !== '') && (newRuleUpperBound !== '')) {
                return false;
            } else if (newRuleCellMatchType === 'Specific Text' && newRuleMatchCellText) {
                return false;
            }
            return true;
        }
    };

    const addCellHighlightFormatRule = (
        <>
            <Grid item xs={8}>
                <Select
                    variant="standard"
                    value={newRuleCellRangeSelectionType}
                    onChange={(event) => { try { setNewRuleCellRangeSelectionType(event.target.value); } catch (err) { showBoundary(err); } }}
                    displayEmpty
                    inputProps={{ 'aria-label': 'Without label', 'data-testid': 'rangeSelect' }}>
                    <MenuItem value={'Selected Range'}>Selected Range</MenuItem>
                    <MenuItem value={'Entire Spreadsheet'}>Entire Spreadsheet</MenuItem>
                </Select>
            </Grid>
            <Grid item xs={2} className='AlignTextVerticalCenter'>
                <ColorButton data-testid = "colorOpen" color={newRuleColor} onClick={(e) => { try { handleOpenPalette(e); } catch (err) { showBoundary(err); } }} style={{ width: '100%' }} />
            </Grid>
            <Grid item xs={1}>
                {/* <Tooltip title='Regel für selektierten Bereich festlegen. Textfelder leer lassen, um keine Grenze zu setzen.'> */}
                <IconButton
                    data-testid = "confirmButton"
                    onClick={(e) => { try { handleSubmitNewRule(e); } catch (err) { showBoundary(err); } }} style={{ width: '100%' }}
                    disabled={isAddRuleDisabled()}
                    size="large">
                    <AddIcon />
                </IconButton>
                {/* </Tooltip> */}
            </Grid>
            <Grid item xs={1}>
                <InfoIcon color='primary' fontSize='small' />
            </Grid>
            <Grid item xs={12}>
                <Select
                    variant="standard"
                    value={newRuleCellMatchType}
                    onChange={(event) => { try { setNewRuleCellMatchType(event.target.value); } catch (err) { showBoundary(err); } }}
                    displayEmpty
                    inputProps={{ 'aria-label': 'Without label', 'data-testid': 'typeSelect' }}>
                    <MenuItem value={'Cell Value'}>Cell Value</MenuItem>
                    <MenuItem value={'Specific Text'}>Specific Text</MenuItem>
                </Select>
            </Grid>

            { loadCellMatchTypeDOM() }

            <Grid item xs={12}>
                <Divider />
            </Grid>
        </>
    );

    // Display all highlight formatting rules applied to the spreadsheet in a grid format, allowing user to understand the highlight of cells
    const cellHighlightFormatRulesGridItems = Object.entries(cellHighlightFormatRules).map(entry => {
        const [key, rule] = entry;
        const { cellMatchType, cellRangeSelectionType, color, selectedRange, matchCellValueRange, matchCellText } = rule;
        const displayedColor = color;
        if (cellMatchType) {
            let cellRangeText = '';
            if (cellRangeSelectionType === 'Selected Range' && selectedRange) {
                // The cellRangeText will display the first row/column selected to the last row/column reference
                const startRowIndex = Number(Object.keys(selectedRange)[0]) + 1;
                const endRowIndex = Number(Object.keys(selectedRange)[Object.keys(selectedRange).length - 1]) + 1;
                const startColumnIndex = Number(Object.keys(selectedRange[Number(Object.keys(selectedRange)[0])])[0]);
                const endColumnIndex = Number(Object.keys(selectedRange[Number(Object.keys(selectedRange)[0])]).pop());
                const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
                cellRangeText = `${alphabet[startColumnIndex]}${startRowIndex} - ${alphabet[endColumnIndex]}${endRowIndex}`;
            }
            let matchCellValueRangeText = '';
            if (matchCellValueRange) {
                matchCellValueRangeText = `${matchCellValueRange[0] !== undefined ? `${matchCellValueRange[0]} \u2264` : ''} Wert ${matchCellValueRange[1] !== undefined ? `\u2264 ${matchCellValueRange[1]}` : ''}`;
            }
            return <>
                <Grid item xs={4} data-testid='ruleMatchType' className='AlignTextVerticalCenter'>
                    {
                        cellMatchType === 'Cell Value'
                            ? matchCellValueRangeText
                            : (cellMatchType === 'Specific Text'
                                ? matchCellText
                                : '')
                    }
                </Grid>
                <Grid item xs={2} className='AlignTextVerticalCenter'>
                    <ColorButton data-testid='ruleColorShow' color={displayedColor} />
                </Grid>
                <Grid item xs={4} data-testid='ruleRangeSelection' className='AlignTextVerticalCenter'>
                    {(cellRangeSelectionType === 'Selected Range' && cellRangeText) ? cellRangeText : cellRangeSelectionType}
                </Grid>
                <Grid item xs={2}>
                    <IconButton
                        data-testid='deleteRule'
                        onClick={(e) => { try { onDeleteCellHighlightFormatRule(key); } catch (err) { showBoundary(err); } }} style={{ width: '100%' }}
                        size="large">
                        <DeleteIcon />
                    </IconButton>
                </Grid>
            </>;
        }
        return <></>;
    });

    return (
        <Popover
            open={colorRulesPopoverIsOpen}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left'
            }}
            anchorEl={anchorEl}
            className='SpreadsheetPopover'
        >
            <Grid container spacing={2} data-testid='colorRulesPopover'>
                {addCellHighlightFormatRule}
                {cellHighlightFormatRulesGridItems}
            </Grid>
            <Button
                data-testid='schliessen'
                onClick={(e) => { try { setColorRulesPopoverIsOpen(false); } catch (err) { showBoundary(err); } }} style={{ width: '100%' }}
                variant="contained"
                color='primary'
                size='small'
            >
                Schließen
            </Button>
            <ColorFillPopover
                fillColorPopoverIsOpen={paletteIsOpen}
                anchorEl={paletteAnchorEl}
                palette={palette}
                handleClose={handleClosePalette}
            />
        </Popover>
    );
}
