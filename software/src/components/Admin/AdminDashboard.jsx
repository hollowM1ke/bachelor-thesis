import React, { useState } from 'react';
import BoardContextManager from '../Board/BoardContextManager';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import { DndProvider } from 'react-dnd-multi-backend';
import { HTML5toTouch } from 'rdndmb-html5-to-touch';
import { Button, Stack } from '@mui/material';
import DashboardView from './DashboardView';

const AdminDashboard = ({
    userId,
    userRole,
    groupInfos,
    groupName,
    loginWithKeyCloak
}) => {
    const handle = useFullScreenHandle();
    const [view, setView] = useState(0);
    return (
        <div>
            <FullScreen handle={handle}>
                <DndProvider options={HTML5toTouch}>
                    { view === 0 && <Stack direction="row" spacing={2} style = {{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                        <Button variant = "contained" onClick={ () => setView(2)}>Admin Dashboard</Button>
                        <Button variant = "contained" onClick={ () => setView(1)}>Board View</Button>
                    </Stack>
                    }
                    { view === 1 &&
                        <BoardContextManager previewOnly={false} fullScreenHandle={handle}
                            userId={userId} userRole={userRole} view = {view} setView = {setView} groupName = {groupName} loginWithKeyCloak={loginWithKeyCloak} />}
                    { view === 2 && <DashboardView view = {view} setView = {setView} userId = {userId} userRole = {userRole} groupInfos = {groupInfos} groupName ={groupName} loginWithKeyCloak={loginWithKeyCloak} /> }
                </DndProvider>
            </FullScreen>
        </div>
    );
};

export default AdminDashboard;
