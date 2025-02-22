export function prepareDownload (boardId, data) {
    const exportFile = document.createElement('a');
    exportFile.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
    exportFile.setAttribute('download', boardId + '.json');
    exportFile.click();
};
