export class CommentProxy {
    constructor (data, crdtObj, executor) {
        this.data = data;
        this.crdtObj = { ...crdtObj };
        this.executor = executor;
    }

    setError (err) {
        this.data.err = err;
    }

    addComponentComment (newItem) {
        const commentIndex = this.data.value.length;
        this.data.value.splice(commentIndex, 0, newItem);
        this.executor.scheduleJob(() => {
            this.crdtObj.commentsArray.doc.transact(() => {
                this.crdtObj.commentsArray.insert(commentIndex, [newItem]);
                this.crdtObj.commentsTextMap.set(newItem.commentId, newItem.commentDescription);
            });
        });
    }

    deleteComponentComment (commentId, commentIndex) {
        this.data.value.splice(commentIndex, 1);
        this.executor.scheduleJob(() => {
            this.crdtObj.commentsArray.doc.transact(() => {
                this.crdtObj.commentsArray.delete(commentIndex, 1);
                this.crdtObj.commentsTextMap.delete(commentId);
            });
        });
    }

    editComponentComment (commentIndex, commentDescription) {
        const commentId = this.data.value[commentIndex].commentId;
        if (this.data.value[commentIndex]) {
            this.data.value[commentIndex].commentDescription = commentDescription;
        }
        this.executor.scheduleJob(() => {
            this.crdtObj.commentsArray.doc.transact(() => {
                this.crdtObj.commentsTextMap.set(commentId, commentDescription);
            });
        });
    }

    addComponentReply (newItem, commentId) {
        const commentIndex = this.data.value.findIndex(item => item.commentId === commentId);
        if (this.data.value[commentIndex]) {
            const replyIndex = this.data.value[commentIndex].replies.length;
            this.data.value[commentIndex].replies.splice(replyIndex, 0, newItem);
        }
        this.executor.scheduleJob(() => {
            this.crdtObj.repliesArray.doc.transact(() => {
                const replies = [...this.crdtObj.repliesArray.toArray()];
                // let replyIndex = replies ? replies.findIndex(item => item.replyId === newItem.replyId) : 0;
                // replyIndex = replyIndex >= 0 ? replyIndex : 0;
                const dummyReplies = [...this.crdtObj.repliesDummyArray.toArray()];
                this.crdtObj.repliesArray.insert(replies.length, [newItem]);
                this.crdtObj.repliesTextMap.set(newItem.replyId, newItem.replyDescription);
                this.crdtObj.repliesDummyArray.insert(replies.length, [newItem]);
            });
        });
    }

    editComponentReply (replyId, commentId, replyDescription) {
        const commentIndex = this.data.value.findIndex(item => item.commentId === commentId);
        const replyIndex = this.data.value[commentIndex] ? this.data.value[commentIndex].replies ? this.data.value[commentIndex].replies.findIndex(item => item.replyId === replyId) : -1 : -1;
        if (this.data.value[commentIndex] && this.data.value[commentIndex].replies && this.data.value[commentIndex].replies[replyIndex]) {
            this.data.value[commentIndex].replies[replyIndex].replyDescription = replyDescription;
        }
        this.executor.scheduleJob(() => {
            this.crdtObj.repliesArray.doc.transact(() => {
                this.crdtObj.repliesTextMap.set(replyId, replyDescription);
            });
        });
    }

    deleteComponentReply (replyId, commentId) {
        const commentIndex = this.data.value.findIndex(item => item.commentId === commentId);
        const replyIndex = this.data.value[commentIndex] ? this.data.value[commentIndex].replies ? this.data.value[commentIndex].replies.findIndex(item => item.replyId === replyId) : -1 : -1;
        if (replyIndex >= 0) {
            this.data.value[commentIndex].replies.splice(replyIndex, 1);
        };
        this.executor.scheduleJob(() => {
            this.crdtObj.repliesArray.doc.transact(() => {
                const temp = this.crdtObj.repliesArray.toArray();
                const index = temp.findIndex(item => item.replyId === replyId);
                this.crdtObj.repliesArray.delete(index, 1);
                this.crdtObj.repliesTextMap.delete(replyId);
            });
        });
    }

    deleteComponentDummyReply (replyIndex) {
        // this.crdtObj.repliesDummyArray = [...this.crdtObj.repliesDummyArray.splice(replyIndex, 1)];
        this.executor.scheduleJob(() => {
            this.crdtObj.repliesDummyArray.doc.transact(() => {
                this.crdtObj.repliesDummyArray.delete(replyIndex, 1);
            });
        });
    }
};
