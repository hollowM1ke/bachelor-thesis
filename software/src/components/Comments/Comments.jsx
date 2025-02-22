import React, { useState } from 'react';
import { selectComment, addComment, deleteComment, editComment, addReply, editReply, deleteReply, selectCommentError } from '../../model/features/comments/commentsSlice';
import { useDispatch, useSelector } from 'react-redux';
import { generatePseudoRandomId } from '../../services/ids';
import { Delete, Edit, Reply } from '@mui/icons-material';
import { Typography, Stack, Box, TextField, Button } from '@mui/material';
import { useErrorBoundary } from 'react-error-boundary';

const Comments = ({
    docName,
    contextManager
}) => {
    const { showBoundary } = useErrorBoundary();
    const dispatch = useDispatch();
    const commentsList = useSelector((state) => selectComment(state, docName));
    const author = contextManager.adminId && contextManager.adminPreview ? contextManager.adminId : contextManager.userId;
    // const author = contextManager.userId;
    const [commentEditMode, setCommentEditMode] = useState(0);
    // 0 - no edit
    // 1 - add comment
    // 2 - edit comment
    // 3 - add reply
    // 4 - edit reply
    const [commentContent, setCommentContent] = useState('');
    const [activeComment, setActiveComment] = useState(-1);
    const [activeReply, setActiveReply] = useState(-1);
    const handleCommentClick = (e) => {
        setCommentContent('');
        setCommentEditMode(1);
    };
    const handleCommentSave = (e) => {
        setCommentEditMode(0);
        createComment(e);
    };

    const createComment = (e) => {
        const commentDescription = commentContent;
        // const userId = contextManager.adminId ? contextManager.adminId : contextManager.userId;
        const userId = contextManager.adminId && contextManager.adminPreview ? contextManager.adminId : contextManager.userId;
        // const userId = contextManager.userId;
        const componentId = docName;
        dispatch(addComment(commentDescription, userId, componentId));
    };

    const handleDeleteComment = (index) => {
        const componentId = docName;
        const commentId = commentsList[index].commentId;
        const commentIndex = index;
        if (commentsList[commentIndex].replies.length > 0) {
            for (const reply in commentsList[commentIndex].replies) {
                const replyId = commentsList[commentIndex].replies[reply].replyId;
                dispatch(deleteReply(replyId, commentId, componentId));
            }
        }
        dispatch(deleteComment(componentId, commentId, commentIndex));
    };

    const onEditClick = (index) => {
        setActiveComment(index);
        setCommentContent(commentsList[index].commentDescription);
        setCommentEditMode(2);
    };

    const onReplyClick = (index) => {
        setActiveComment(index);
        setCommentContent('');
        setCommentEditMode(3);
    };

    const onReplyEditClick = (replyIndex, commentIndex) => {
        setActiveComment(commentIndex);
        setActiveReply(replyIndex);
        setCommentContent(commentsList[commentIndex].replies[replyIndex].replyDescription);
        setCommentEditMode(4);
    };

    const handleEditComment = () => {
        const commentIndex = activeComment;
        const componentId = docName;
        const commentDescription = commentContent;
        dispatch(editComment(commentIndex, commentDescription, componentId));
        setCommentContent('enter text');
        setActiveComment(-1);
        setCommentEditMode(0);
    };

    const handleReplySave = () => {
        const commentIndex = activeComment;
        const commentId = commentsList[commentIndex].commentId;
        const replyDescription = commentContent;
        const componentId = docName;
        const userId = contextManager.adminId && contextManager.adminPreview ? contextManager.adminId : contextManager.userId;
        // const userId = contextManager.userId;
        const replyId = generatePseudoRandomId();
        dispatch(addReply(replyDescription, replyId, userId, commentId, componentId));
        setCommentEditMode(0);
        setActiveComment(-1);
        setActiveReply(-1);
    };

    const handleEditReply = (replyIndex, commentIndex) => {
        const replyDescription = commentContent;
        const componentId = docName;
        const replyId = commentsList[commentIndex].replies[replyIndex].replyId;
        const commentId = commentsList[commentIndex].commentId;
        dispatch(editReply(replyId, commentId, replyDescription, componentId));
        setActiveComment(-1);
        setCommentEditMode(0);
        setCommentContent('enter text');
    };

    const handleDeleteReply = (replyIndex, commentIndex) => {
        const componentId = docName;
        const replyId = commentsList[commentIndex].replies[replyIndex].replyId;
        const commentId = commentsList[commentIndex].commentId;
        dispatch(deleteReply(replyId, commentId, componentId));
        setActiveComment(-1);
        setCommentEditMode(0);
    };
    const err = useSelector((state) => selectCommentError(state, docName));
    if (err) {
        showBoundary(err);
    }
    return (
        <Box>
            <div>
                <button onClick={(e) => { try { handleCommentClick(e); } catch (err) { showBoundary(err); } }}>Neuer Kommentar</button>
            </div>
            {(commentEditMode === 1) &&
                <><input
                    type="text"
                    value={commentContent}
                    placeholder="Kommentar hinzufügen"
                    onChange={(e) => { try { setCommentContent(e.target.value); } catch (err) { showBoundary(err); } }}
                />
                <button onClick={(e) => { try { handleCommentSave(e); } catch (err) { showBoundary(err); } }}>Speichern</button>
                </>
            }
            {commentsList.map((comment, index) => (
                <div key={index}>
                    <Box sx={{ maxWidth: '200' }}>
                        <Box style={{ border: '1px solid #bab8b8', borderRadius: '6px', minHeight: '30px', marginTop: '5px', background: '#F5F5F5' }}>
                            <Stack spacing={1}>
                                <Typography sx={{ fontWeight: '600', padding: '0 10px' }}>{comment.userId}:</Typography>
                                <Typography sx={{ padding: '0 20px' }}>{comment.commentDescription}</Typography>
                            </Stack>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                            <Button
                                sx={{
                                    textTransform: 'none',
                                    color: '#111',
                                    padding: '6px, 10px',
                                    '& .MuiButton-startIcon': { marginRight: '2px' }
                                }}
                                onClick={(e) => { try { onReplyClick(index); } catch (err) { showBoundary(err); } }} startIcon={<Reply />}>Antworten</Button>
                            {author === comment.userId && <Button sx={{ textTransform: 'none', color: '#111', '& .MuiButton-startIcon': { marginRight: '2px' } }} onClick={(e) => { try { onEditClick(index); } catch (err) { showBoundary(err); } }} startIcon={<Edit />}>Bearbeiten</Button>}
                            {author === comment.userId && <Button sx={{ textTransform: 'none', color: '#111', '& .MuiButton-startIcon': { marginRight: '2px' } }} onClick={(e) => { try { handleDeleteComment(index); } catch (err) { showBoundary(err); } }} startIcon={<Delete />}>Löschen</Button>}
                            {activeComment === index && commentEditMode === 2 && <><input
                                type="text"
                                value={commentContent}
                                onChange={(e) => { try { setCommentContent(e.target.value); } catch (err) { showBoundary(err); } }}
                            />
                            <button onClick={(e) => { try { handleEditComment(); } catch (err) { showBoundary(err); } }}>Speichern</button>
                            </>}
                            {activeComment === index && commentEditMode === 3 && <><input
                                type="text"
                                placeholder="Kommentar hinzufügen"
                                value={commentContent}
                                onChange={(e) => { try { setCommentContent(e.target.value); } catch (err) { showBoundary(err); } }}
                            />
                            <button onClick={(e) => { try { handleReplySave(); } catch (err) { showBoundary(err); } }}>Speichern</button>
                            </>}
                        </Box>
                    </Box>
                    {comment.replies.map((reply, replyIndex) => (
                        <div key={replyIndex}>
                            <Box>
                                <Box sx={{ border: '1px solid #bab8b8', borderRadius: '6px', minHeight: '30px', minWidth: '200px', marginLeft: '30px', background: '#F5F5F5' }}>
                                    <Stack spacing={1}>
                                        <Typography sx={{ fontWeight: '600', padding: '0 10px' }}> {reply.userId} </Typography>
                                        {commentEditMode !== 4 && <Typography sx={{ padding: '0 20px' }}> {reply.replyDescription} </Typography>}
                                    </Stack>
                                </Box>
                                <Box sx={{ textAlign: 'right', paddingTop: '0' }}>
                                    {author === reply.userId && <Button sx={{ textTransform: 'none', color: '#111', '& .MuiButton-startIcon': { marginRight: '2px' } }} onClick={(e) => { try { handleDeleteReply(replyIndex, index); } catch { showBoundary(err); } }} startIcon = {<Delete/>}>Löschen</Button>}
                                    {author === reply.userId && <Button sx={{ textTransform: 'none', color: '#111', '& .MuiButton-startIcon': { marginRight: '2px' } }} onClick={(e) => { try { onReplyEditClick(replyIndex, index); } catch (err) { showBoundary(err); } }} startIcon = {<Edit/>}>Bearbeiten</Button>}
                                    {activeComment === index && activeReply === replyIndex && commentEditMode === 4 && <><TextField
                                        type="text"
                                        placeholder="Kommentar hinzufügen"
                                        value={commentContent}
                                        onChange={(e) => { try { setCommentContent(e.target.value); } catch (err) { showBoundary(err); } }}
                                    />
                                    <button onClick={(e) => { try { handleEditReply(replyIndex, index); } catch (err) { showBoundary(err); } }}>Speichern</button>
                                    </>}
                                </Box>
                            </Box>
                        </div>
                    ))
                    }
                </div>
            ))}
        </Box>
    );
};
export default Comments;
