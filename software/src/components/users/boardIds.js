import { BOARD_TYPES } from '../Board/boardConfig';

export const formulateBoardId = (boardConfig, userId, groupName, experiment) => {
    if (experiment === null || experiment === undefined) {
        return 'No experiment';
    }
    switch (boardConfig.type) {
    case BOARD_TYPES.CLASS: return `${boardConfig.id}-${experiment.id}`;
    case BOARD_TYPES.GROUP: return `${boardConfig.id}-${experiment.id}-${groupName}`;
    case BOARD_TYPES.PERSONAL: return `${boardConfig.id}-${experiment.id}-${userId}`;
    }
};
