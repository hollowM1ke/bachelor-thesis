import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import './markdownHelperStyle.css';
import {
    selectMarkdown,
    setMarkdown
} from '../../../model/features/markdowns/markdownsSlice';
import { useSelector, useDispatch } from 'react-redux';
import {
    AppBar,
    Toolbar,
    Typography,
    Paper,
    IconButton
} from '@mui/material';
import {
    Check
} from '@mui/icons-material';

import { styled } from '@mui/styles';
import { useStyles } from '../../Board/boardStyles';
import Quill from 'quill';
import MagicUrl from 'quill-magic-url';
import { QuillBinding } from 'y-quill';
import '../../../../node_modules/quill/dist/quill.snow.css';
import ResizeModule from '@botom/quill-resize-module';
import { useErrorBoundary } from 'react-error-boundary';
Quill.register('modules/resize', ResizeModule);
Quill.register('modules/magicUrl', MagicUrl);
const Item = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(1),
    textAlign: 'center',
    height: '100%'
}));

export default function MarkDownFullPreview ({
    docName,
    boardId,
    contextManager
}) {
    const { showBoundary } = useErrorBoundary();
    const styleClasses = useStyles();
    const mdValue = useSelector((state) => {
        return selectMarkdown(state, docName);
    });
    const [tempMDState] = useState(mdValue); // is initially the mdValue
    const dispatch = useDispatch();
    const mdSetValue = (newValue) => {
        dispatch(setMarkdown(docName, newValue));
    };

    const editorRef = useRef(null);
    const handler = () => {
        const ytext = mdValue.getText('quill');
        const toolbarOptions = [
            ['bold', 'italic', 'underline', 'strike'], // toggled buttons
            ['blockquote', 'code-block', 'image', 'video'],
            [{ header: 1 }, { header: 2 }], // custom button values
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
            [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
            [{ direction: 'rtl' }], // text direction
            [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ color: [] }, { background: [] }], // dropdown with defaults from theme
            [{ font: [] }],
            [{ align: [] }],
            ['clean'] // remove formatting button
        ];
        const editor = new Quill(editorRef.current, {
            modules: {
                toolbar: {
                    container: toolbarOptions // Selector for toolbar container
                },
                history: {
                    userOnly: true
                },
                magicUrl: true,
                resize: {
                    locale: {
                        altTip: 'Halten Sie die Alt-Taste gedrückt, um zu zoomen',
                        floatLeft: 'links',
                        floatRight: 'rechts',
                        center: 'zentriert',
                        restore: 'Standard'

                    },
                    toolbar: {
                        sizeTools: false
                    }
                }
            },
            placeholder: 'Text bearbeiten ...',
            theme: 'snow', // or 'bubble'
            bounds: editorRef.current
        });

        const binding = new QuillBinding(ytext, editor);
    };
    useEffect(() => {
        handler();
    }, [mdValue]);

    const handleSave = () => {
        mdSetValue(tempMDState);
        contextManager.resetOpenTool();
    };

    /*
    return (
        // sx doesnt always work with all props
        <Box sx={{ flexGrow: 1 }} style={{ height: '100%', width: '100%' }}>
            <Grid container spacing={0} direction='column' style={{ height: '100%', width: '100%', flexWrap: 'nowrap' }}>
                <Grid container item spacing={0}>
                    <Grid item xs={12}>
                        <AppBar
                            position='sticky'
                            className={clsx(styleClasses.appBar)}
                        >
                            <Toolbar>
                                <IconButton
                                    classes={{ root: styleClasses.success }}
                                    onClick={(e) => { try { handleSave(e); } catch (err) { showBoundary(err); } }}
                                    size="large">
                                    <Check />
                                </IconButton>
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
                                        Texteditor
                                    </Typography>
                                    <img src={logo} alt="" height='60' />
                                </Box>
                            </Toolbar>
                        </AppBar>
                    </Grid>
                </Grid>
                <Grid container item spacing={0} style={{ flex: 1 }}>
                    <Grid item xs={10}
                        onKeyDown={stopPropagation}
                    >
                        <Item>
                            <Box
                                component="main"
                                // sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}
                                maxWidth={'1200px'}
                                maxHeight={'900px'}
                            >
                                <div ref={editorRef} id="editor"/>
                            </Box>
                        </Item>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
    */
    return (
        <div>
            <AppBar
                position='sticky'
                className={clsx(styleClasses.appBar)} >
                <Toolbar>
                    <IconButton
                        classes={{ root: styleClasses.success }}
                        onClick={(e) => { try { handleSave(e); } catch (err) { showBoundary(err); } }}
                        size="large">
                        <Check />
                    </IconButton>
                    <Typography variant="h6" component="div">
                        Texteditor
                    </Typography>
                </Toolbar>
            </AppBar>
            <div ref={editorRef} id="editor" style={{ height: '500px', maxHeight: '900px', overflow: 'auto' }} />
        </div>
    );
};
