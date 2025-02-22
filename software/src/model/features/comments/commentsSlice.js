import { createSelector, createEntityAdapter, createAction } from '@reduxjs/toolkit';
import {
    getObject,
    removeObject,
    getProviderCollectionInfo,
    getWebSocketProviderId
} from '../../../services/collectionprovider';
import { generatePseudoRandomId } from '../../../services/ids';
import { createCRDTSupportedSlice } from '../../app/plugins/CRDT/CRDTPlugins';
import CRDTExecutor from '../../../model/app/plugins/CRDT/CRDTExecutor';
import { CommentProxy } from '../EntityProxies/CommentProxy';
const LOAD_AFTER = 0;

const commentsAdapter = createEntityAdapter();
const initialState = commentsAdapter.getInitialState();

const getBoardObjId = boardId => `board-${boardId}`;
const getCommentsArrayObjId = id => `${id}-commentArray`;
const getCommentsTextMapObjId = id => `${id}-commentText`;
const getRepliesArrayObjId = id => `${id}-replyArray`;
const getRepliesTextMapObjId = id => `${id}-replyText`;
const getRepliesDummyArrayObjId = id => `${id}-replyDummyArray`;

const commentsSlice = createCRDTSupportedSlice({
    name: 'comments',
    initialState,
    reducers: {
        setErrorComment: {
            reducer (state, action) {
                const { id, err } = action.payload;
                const comment = state.entities[id];
                if (!comment) return;
                comment.commentObject.setError(err);
            },
            prepare (commentId, err) {
                return {
                    payload: {
                        id: commentId,
                        err: err
                    }
                };
            }
        },
        addComment: {
            reducer (state, action) {
                const { commentDescription, userId, id, commentId } = action.payload;
                const comment = state.entities[id];
                if (!comment) return;
                const newItem = {
                    commentId: commentId,
                    commentDescription: commentDescription,
                    componentId: id,
                    replies: [],
                    userId: userId
                };
                comment.commentObject.addComponentComment(newItem);
            },
            prepare (commentDescription, userId, componentId, commentId = generatePseudoRandomId()) {
                return {
                    payload: {
                        commentDescription,
                        userId,
                        id: componentId,
                        commentId
                    }
                };
            }
        },
        editComment: {
            reducer (state, action) {
                const { commentIndex, commentDescription, id } = action.payload;
                const comment = state.entities[id];
                if (!comment) return;
                comment.commentObject.editComponentComment(commentIndex, commentDescription);
            },
            prepare (commentIndex, commentDescription, componentId, skipSync = false) {
                return {
                    payload: {
                        commentIndex,
                        commentDescription,
                        id: componentId,
                        skipSync
                    }
                };
            }
        },
        deleteComment: {
            reducer (state, action) {
                const { id, commentId, commentIndex } = action.payload;
                const comment = state.entities[id];
                if (!comment) return;
                comment.commentObject.deleteComponentComment(commentId, commentIndex);
            },
            prepare (componentId, commentId, commentIndex, skipSync = false) {
                return {
                    payload: {
                        id: componentId,
                        commentId,
                        commentIndex,
                        skipSync
                    }
                };
            }
        },
        addReply: {
            reducer (state, action) {
                const { replyDescription, replyId, userId, commentId, id } = action.payload;
                const comment = state.entities[id];
                if (!comment) return;
                const newItem = {
                    replyId: replyId,
                    replyDescription: replyDescription,
                    userId: userId,
                    commentId: commentId
                };
                comment.commentObject.addComponentReply(newItem, commentId);
            },
            prepare (replyDescription, replyId = generatePseudoRandomId(), userId, commentId, componentId, skipSync = false) {
                return {
                    payload: {
                        replyDescription: replyDescription,
                        replyId: replyId,
                        userId: userId,
                        commentId: commentId,
                        id: componentId,
                        skipSync
                    }
                };
            }
        },
        editReply: {
            reducer (state, action) {
                // const { replyIndex, commentIndex, replyDescription, componentId } = action.payload;
                const { replyId, commentId, replyDescription, id } = action.payload;
                const comment = state.entities[id];
                if (!comment) return;
                comment.commentObject.editComponentReply(replyId, commentId, replyDescription);
            },
            prepare (replyId, commentId, replyDescription, componentId, skipSync = false) {
                return {
                    payload: {
                        replyId,
                        commentId,
                        replyDescription,
                        id: componentId,
                        skipSync
                    }
                };
            }
        },
        deleteReply: {
            reducer (state, action) {
                const { replyId, commentId, id } = action.payload;
                const comment = state.entities[id];
                if (!comment) return;
                comment.commentObject.deleteComponentReply(replyId, commentId);
            },
            prepare (replyId, commentId, componentId, skipSync = false) {
                return {
                    payload: {
                        replyId,
                        commentId,
                        id: componentId,
                        skipSync
                    }
                };
            }
        },
        deleteDummyReply: {
            reducer (state, action) {
                const { replyIndex, id } = action.payload;
                const comment = state.entities[id];
                if (!comment) return;
                comment.commentObject.deleteComponentDummyReply(replyIndex);
            },
            prepare (replyIndex, componentId, skipSync = false) {
                return {
                    payload: {
                        replyIndex,
                        id: componentId,
                        skipSync
                    }
                };
            }
        },
        loadComments (state, action) {
            const { id, boardId, initialState } = action.payload;
            const comment = state.entities[id];
            if (!comment) {
                const collectionName = getBoardObjId(boardId);
                const commentsArray = getObject(collectionName, getCommentsArrayObjId(id), id, 'YArray', applyCommentArrayChanges); // also defines the observers for the datastructures
                const commentsTextMap = getObject(collectionName, getCommentsTextMapObjId(id), id, 'YMap', applyCommentTextMapChanges);
                const repliesArray = getObject(collectionName, getRepliesArrayObjId(id), id, 'YArray', applyReplyArrayChanges); // also defines the observers for the datastructures
                const repliesTextMap = getObject(collectionName, getRepliesTextMapObjId(id), id, 'YMap', applyReplyTextMapChanges);
                const repliesDummyArray = getObject(collectionName, getRepliesDummyArrayObjId(id), id, 'YArray', applyReplyDummyArrayChanges); // also defines the observers for the datastructures
                if (initialState !== 'Tests') { getProviderCollectionInfo(collectionName).objects[getWebSocketProviderId(id)].connect(); }// connect the websocket to the collection and now we know the observers are defined on the datastructures
                const crdtObjects = { commentsArray, commentsTextMap, repliesArray, repliesTextMap, repliesDummyArray };
                const newComment = {
                    id,
                    commentObject: {
                        _type: 'Comment',
                        _crdt: true,
                        data: {
                            value: []
                        },
                        crdtObjects
                    }
                };
                function applyCommentArrayChanges (yEvent = null) {
                    if (yEvent !== null && yEvent.transaction.local) {
                        return;
                    }
                    const delta = yEvent.changes.delta;
                    let newIndex0 = 0;
                    const addLocalComment = createAction('comments/addComment');
                    const deleteLocalComment = createAction('comments/deleteComment');
                    // const removeLocalItem = todolistsSlice.actions.;
                    for (let i = 0; i < delta.length; i++) { // goes through the delta and applies the changes to the non-CRDTs. Delta format is described here: https://docs.yjs.dev/api/delta-format
                        if (delta[i].retain) {
                            newIndex0 += delta[i].retain;
                        } else if (delta[i].insert) {
                            delta[i].insert.forEach(itemId => {
                                action.store.dispatch(addLocalComment({ commentDescription: itemId.commentDescription, userId: itemId.userId, id: itemId.componentId, commentId: itemId.commentId, skipSync: true }));
                                newIndex0++;
                            });
                        } else {
                            for (let ind = delta[i].delete; ind > 0; ind--) {
                                const itemId = 'Because we don`t remove the item from the CRDTs we dont need to have the ItemId here but we need a dummy which is this :)';
                                action.store.dispatch(deleteLocalComment({ id, commentId: itemId, commentIndex: newIndex0, skipSync: true }));
                            }
                        }
                    }
                }
                function applyCommentTextMapChanges (yEvent = null) {
                    if (yEvent !== null && yEvent.transaction.local) {
                        return;
                    }
                    const editComment = createAction('comments/editComment');
                    yEvent.changes.keys.forEach((change, key) => {
                        const text = commentsTextMap.get(key);
                        const textIndex = commentsArray.toArray().findIndex(item => item.commentId === key);
                        switch (change.action) {
                        case 'add':
                            action.store.dispatch(editComment({ commentIndex: textIndex, commentDescription: text, id, skipSync: true }));
                            break;
                        case 'update':
                            action.store.dispatch(editComment({ commentIndex: textIndex, commentDescription: text, id, skipSync: true }));
                            break;
                        default:
                            break;
                        }
                    });
                }
                function applyReplyArrayChanges (yEvent = null) {
                    if (yEvent !== null && yEvent.transaction.local) {
                        return;
                    }
                    const delta = yEvent.changes.delta;
                    let newIndex0 = 0;
                    const addLocalReply = createAction('comments/addReply');
                    const deleteLocalReply = createAction('comments/deleteReply');
                    const deleteLocalDummyReply = createAction('comments/deleteDummyReply');
                    // const removeLocalItem = todolistsSlice.actions.;
                    for (let i = 0; i < delta.length; i++) { // goes through the delta and applies the changes to the non-CRDTs. Delta format is described here: https://docs.yjs.dev/api/delta-format
                        if (delta[i].retain) {
                            newIndex0 += delta[i].retain;
                        } else if (delta[i].insert) {
                            delta[i].insert.forEach(itemId => {
                                action.store.dispatch(addLocalReply({ replyDescription: itemId.replyDescription, replyId: itemId.replyId, userId: itemId.userId, commentId: itemId.commentId, id, skipSync: true }));
                                newIndex0++;
                            });
                        } else {
                            for (let ind = delta[i].delete; ind > 0; ind--) {
                                const replies = [...repliesDummyArray.toArray()];
                                const toBeDeletedReply = replies[newIndex0];
                                const commentId = toBeDeletedReply.commentId;
                                const replyId = toBeDeletedReply.replyId;
                                action.store.dispatch(deleteLocalReply({ replyId: replyId, commentId: commentId, id, skipSync: true }));
                                action.store.dispatch(deleteLocalDummyReply({ replyIndex: newIndex0, id, skipSync: false }));
                            }
                        }
                    }
                }
                function applyReplyTextMapChanges (yEvent = null) {
                    if (yEvent !== null && yEvent.transaction.local) {
                        return;
                    }
                    const editReply = createAction('comments/editReply');
                    yEvent.changes.keys.forEach((change, key) => {
                        switch (change.action) {
                        case 'add':
                        { const text = repliesTextMap.get(key);
                            const reply = repliesArray.toArray().find(item => item.replyId === key);
                            const commentId = reply ? reply.commentId : 'none';
                            if (commentId !== 'none') {
                                action.store.dispatch(editReply({ replyId: key, commentId: commentId, replyDescription: text, componentId: id, skipSync: true }));
                            }
                            break;
                        }
                        case 'update':
                        { const text = repliesTextMap.get(key);
                            const reply = repliesArray.toArray().find(item => item.replyId === key);
                            const commentId = reply.commentId;
                            action.store.dispatch(editReply({ replyId: key, commentId: commentId, replyDescription: text, id, skipSync: true }));
                            break;
                        }
                        default:
                            break;
                        }
                    });
                }
                function applyReplyDummyArrayChanges (yEvent = null) {
                    if (yEvent !== null && yEvent.transaction.local) {
                        return;
                    }
                    const delta = yEvent.changes.delta;
                    let newIndex0 = 0;
                    // const addLocalDummyReply = createAction('comments/addDummyReply');
                    const deleteLocalDummyReply = createAction('comments/deleteDummyReply');
                    for (let i = 0; i < delta.length; i++) { // goes through the delta and applies the changes to the non-CRDTs. Delta format is described here: https://docs.yjs.dev/api/delta-format
                        if (delta[i].retain) {
                            newIndex0 += delta[i].retain;
                        } else if (delta[i].insert) {
                            delta[i].insert.forEach(itemId => {
                                // action.store.dispatch(addLocalReply({ replyDescription: itemId.replyDescription, replyId: itemId.replyId, userId: itemId.userId, commentId: itemId.commentId, componentId: id, skipSync: true }));
                                newIndex0++;
                            });
                        } else {
                            for (let ind = delta[i].delete; ind > 0; ind--) {
                                const itemId = 'Because we don`t remove the item from the CRDTs we dont need to have the ItemId here but we need a dummy which is this :)';
                                action.store.dispatch(deleteLocalDummyReply({ replyIndex: newIndex0, id, skipSync: true }));
                            }
                        }
                    }
                }
                if (initialState && initialState !== 'Tests') {
                    const executor = CRDTExecutor();
                    const commentHandler = new CommentProxy(newComment.commentObject.data, crdtObjects, executor);
                    for (let i = initialState.value.length - 1; i >= 0; i--) {
                        const item = initialState.value[i];
                        commentHandler.addItem(0, item);
                    }
                    executor.flush();
                }
                commentsAdapter.addOne(state, newComment);
            }
        },
        unloadComments (state, action) {
            const { id, boardId } = action.payload;
            const comment = state.entities[id];
            if (!comment) { return; }

            const collectionName = getBoardObjId(boardId);
            removeObject(collectionName, getCommentsTextMapObjId(id), id);
            // removeObject(collectionName, getCommentsArrayObjId(id), id);
            removeObject(collectionName, getRepliesArrayObjId(id), id);
            removeObject(collectionName, getRepliesDummyArrayObjId(id), id);
            removeObject(collectionName, getRepliesTextMapObjId(id), id);
            delete state.entities[id];
        }
    }
});
export default commentsSlice.reducer;
export const {
    setErrorComment,
    addComment,
    editComment,
    deleteComment,
    addReply,
    editReply,
    deleteReply,
    deleteDummyReply,
    unloadComments,
    loadComments
} = commentsSlice.actions;

const { selectById } = commentsAdapter.getSelectors(state => state.comments);
export const selectComment = createSelector(selectById, comment => {
    return comment ? comment.commentObject.data.value : [];
});
export const selectCommentError = createSelector(selectById, comment => {
    return comment ? comment.commentObject.data.err : null;
});
// one time selector, no need to memoize
export const selectFullContext = (state, id) => {
    const comment = state.comments.entities[id];
    const value = comment ? comment.commentObject.data.value : [];

    return {
        type: 'comment',
        value
    };
};
