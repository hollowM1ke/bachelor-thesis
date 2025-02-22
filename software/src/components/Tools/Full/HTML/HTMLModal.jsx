import React, { useState } from 'react';
import clsx from 'clsx';
import {
    selectHTML,
    setHTML
} from '../../../../model/features/htmls/htmlsSlice';
import parse from 'html-react-parser';
import { useSelector, useDispatch } from 'react-redux';
import { updateSize } from '../../../../model/features/boards/boardsSlice';
import {
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    AppBar,
    Box,
    Grid,
    Paper,
    IconButton,
    Toolbar,
    Typography
} from '@mui/material';
import {
    Check,
    Cancel
} from '@mui/icons-material';
import { styled } from '@mui/styles';
import logo from './../../../../assets/images/logoBASF/BASFLogo-TIF(RGB)/linkBASF.svg';
import { useStyles } from '../../../Board/boardStyles';
import { stopPropagation } from '../../../../services/DOM';
import {
    HTML_INPUT_STYLE,
    EMPTY_HTML_PREVIEW_STYLE,
    HTML_INPUT_CONTAINER_STYLE,
    HTML_PREVIEW_CONTAINER_STYLE,
    HTML_INPUT_CONTROL_CONTAINER_STYLE,
    HTML_INPUT_LABEL_STYLE
} from './styles';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useErrorBoundary } from 'react-error-boundary';
const Item = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(1),
    textAlign: 'center',
    height: '100%'
}));

export default function HTMLModal ({
    docName,
    boardId,
    containerId,
    contextManager
}) {
    const { showBoundary } = useErrorBoundary();
    const styleClasses = useStyles();
    const htmlValue = useSelector((state) => {
        return selectHTML(state, docName);
    });
    const [tempHTMLState, setTempHTMLState] = useState(htmlValue); // set existing 'htmlValue' if present to the modal
    const previewHTMLRef = React.createRef();
    const dispatch = useDispatch();

    const handleSave = () => {
        if (previewHTMLRef && previewHTMLRef.current && previewHTMLRef.current.childElementCount === 1) {
            dispatch(setHTML(docName, tempHTMLState));
            // Only update the size when an empty HTML input value is updated.
            // Issue 92, request to not update size on content update.
            if (htmlValue === '') {
                previewHTMLRef.current.classList = []; // remove the responsive classes from the div to set the height and width based on content in the html, instead of the preview size properties
                const paddingToSizeDimensions = 30; // Padd the size dimensions, so user has a clearer view of the information on the board
                const htmlSize = { width: Math.max(200, previewHTMLRef.current.firstElementChild.clientWidth + paddingToSizeDimensions), height: Math.max(200, previewHTMLRef.current.firstElementChild.clientHeight + paddingToSizeDimensions) };
                dispatch(updateSize(boardId, containerId, htmlSize));
            }
            contextManager.resetOpenTool();
        } else {
            toast.error('HTML must contain only 1 root child element!');
        }
    };

    const handleCancel = () => {
        contextManager.resetOpenTool();
    };

    return (
        // sx doesnt always work with all props
        <Box sx={{ flexGrow: 1 }} style={{ height: '100%', widht: '100%' }}>
            <Grid container spacing={0} direction='column' style={{ height: '100%', widht: '100%' }}>
                <Grid container item spacing={0}>
                    <Grid item xs={12}>
                        <AppBar
                            position='inherit'
                            className={clsx(styleClasses.appBar)}
                        >
                            <Toolbar>
                                <Box
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        height: '100%',
                                        width: '100%',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Typography align="center" variant="h4" sx={{ flexGrow: 1, height: '100%' }}>
                                        HTML Editor
                                    </Typography>
                                    <img src={logo} alt="" height='60'/>
                                </Box>
                            </Toolbar>
                        </AppBar>
                    </Grid>
                </Grid>
                <Grid container item spacing={0} style={{ flex: 1 }} >
                    <Grid item xs='auto'>
                        <Item>
                            <List>
                                <ListItem button key={'Speichern'} onClick={(e) => { try { handleSave(e); } catch (err) { showBoundary(err); } }}>
                                    <ListItemIcon>
                                        <IconButton
                                            classes={{ root: styleClasses.success }}
                                            onClick={(e) => { try { handleSave(e); } catch (err) { showBoundary(err); } }}
                                            size="large">
                                            <Check />
                                        </IconButton>
                                    </ListItemIcon>
                                    <ListItemText primary={'Speichern'} />
                                </ListItem>
                                <ListItem button key={'Verwerfen'} onClick={(e) => { try { handleCancel(e); } catch (err) { showBoundary(err); } }}>
                                    <ListItemIcon>
                                        <IconButton
                                            classes={{ root: styleClasses.error }}
                                            onClick={(e) => { try { handleCancel(e); } catch (err) { showBoundary(err); } }}
                                            size="large">
                                            <Cancel />
                                        </IconButton>
                                    </ListItemIcon>
                                    <ListItemText primary={'Verwerfen'} />
                                </ListItem>
                            </List>
                        </Item>
                    </Grid>
                    <Grid item xs
                        onKeyDown={stopPropagation}
                    >
                        <Grid container item spacing={0} style={HTML_INPUT_CONTAINER_STYLE}>
                            <Grid item xs={12} md={6} style={HTML_INPUT_CONTROL_CONTAINER_STYLE}>
                                <label htmlFor="HTMLInput" style={HTML_INPUT_LABEL_STYLE}>Enter HTML</label>
                                <textarea
                                    id='HTMLInput'
                                    style={HTML_INPUT_STYLE}
                                    cols="40"
                                    rows="10"
                                    value={tempHTMLState}
                                    onChange={(event) => { try { setTempHTMLState(event.target.value); } catch (err) { showBoundary(err); } }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6} style={HTML_PREVIEW_CONTAINER_STYLE} ref={previewHTMLRef}>
                                { tempHTMLState ? parse(tempHTMLState) : <div style={EMPTY_HTML_PREVIEW_STYLE} /> }
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
};
