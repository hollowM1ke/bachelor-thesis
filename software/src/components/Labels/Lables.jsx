import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Chip from '@mui/material/Chip';
// import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import makeStyles from '@mui/styles/makeStyles';
import { BOARD_CONFIGS } from '../Board/boardConfig';
import { removeLabel } from '../../model/features/boards/boardsSlice';
import { useErrorBoundary } from 'react-error-boundary';
export default function Labels ({
    labels,
    selectLabelInfo
}) {
    const { showBoundary } = useErrorBoundary();
    const dispatch = useDispatch();
    // ignore empty label boards
    labels = Object.keys(labels)
        .filter(boardId => labels[boardId].length > 0)
        .reduce((acc, boardId) => {
            acc[boardId] = labels[boardId];
            return acc;
        }, {});

    const classes = makeStyles((theme) => ({
        root: {
            width: '100%'
        },
        heading: {
            fontSize: theme.typography.pxToRem(15),
            flexBasis: '33.33%',
            flexShrink: 0,
            margin: 'auto 0'
        },
        secondaryHeading: {
            fontSize: theme.typography.pxToRem(15),
            color: theme.palette.text.secondary
        }
    }));

    const [expanded, setExpanded] = useState(Object.keys(labels).reduce((acc, label) => {
        acc[label] = false;
        return acc;
    }, {}));

    const handleAccordionChange = (boardId) => {
        setExpanded((oldExpanded) => {
            const newExpanded = { ...oldExpanded };
            newExpanded[boardId] = !newExpanded[boardId];
            return newExpanded;
        });
    };

    const jumpToLabel = (boardId, { name, componentId }) => {
        const board = BOARD_CONFIGS.filter(config => boardId.startsWith(config.id));
        const index = BOARD_CONFIGS.indexOf(board[0]);
        selectLabelInfo(boardId, index, { name, componentId });
    };

    const removeComponentLabel = (boardId, labelId, componentId) => {
        const confirmation = confirm('Label Entfernen');
        if (confirmation) { dispatch(removeLabel(boardId, labelId, componentId)); }
    };

    const boardLabelGroup = (boardId) => {
        const boardConfig = BOARD_CONFIGS.filter(config => boardId.startsWith(config.id))[0];
        const BoardConfigIcon = boardConfig.icon;
        return (
            <>
                <label style={{ textAlign: 'center' }} title={boardConfig.name}>
                    { BoardConfigIcon
                        ? <BoardConfigIcon/>
                        : (boardConfig.imageRef
                            ? <boardConfig.imageRef width={20} height={20} style={{ margin: '0 4px 0 0', verticalAlign: 'middle' }} />
                            : undefined
                        )
                    }
                </label>
                <Typography className={classes.heading}>{`${boardConfig.name} Labels`}</Typography>
            </>
        );
    };

    return (
        <>
            {
                Object.keys(labels).map((boardId, index) =>
                    <Accordion key={boardId} expanded={expanded[boardId]} onChange={() => { try { handleAccordionChange(boardId); } catch (err) { showBoundary(err); } }}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls={`label${index}-content`}
                            id={`label${index}-header`}
                        >
                            { boardLabelGroup(boardId) }
                        </AccordionSummary>
                        <AccordionDetails>
                            {
                                <List>
                                    {labels[boardId].map(({ id, description, componentId }) => (
                                        <Chip
                                            variant="outlined"
                                            key={description + componentId}
                                            label={description}
                                            onClick={() => { try { jumpToLabel(boardId, { name: description, componentId }); } catch (err) { showBoundary(err); } }}
                                            // onDelete={() => { try { removeComponentLabel(boardId, id, componentId); } catch (err) { showBoundary(err); } }}
                                        />
                                    ))}
                                </List>
                            }
                        </AccordionDetails>
                    </Accordion>
                )}
        </>
    );
}
