import React, { useEffect } from 'react';
import { loadData } from '../../model/features/personaldata/personaldataSlice';
import { useDispatch } from 'react-redux';
import { formulateBoardId } from '../users/boardIds';
import { BOARD_CONFIGS, EXPERIMENTS } from '../Board/boardConfig';
import { USER_ROLES } from '../users/users';

const PersonalData = ({ userId, userRole, groupInfos, groupName }) => {
    const dispatch = useDispatch();
    if (userRole === USER_ROLES.STUDENT) {
        // TODO Select experiments based on group(s)
        for (const index in EXPERIMENTS) {
            const boardId = formulateBoardId(BOARD_CONFIGS[1], userId, groupName, EXPERIMENTS[index]);
            dispatch(loadData(boardId));
        }
    } else {
        const groupInfo = groupInfos[0];
        // for (const groupInfo of groupInfos) {
        for (const member of groupInfo.members) {
            // TODO Select experiments based on group(s)
            for (const index in EXPERIMENTS) {
                const boardId = formulateBoardId(BOARD_CONFIGS[1], member.username, groupName, EXPERIMENTS[index]);
                setTimeout(dispatch(loadData(boardId)), Math.random() * 100);
            }
        }
        // }
    }
    return (
        <></>
    );
};

export default PersonalData;
