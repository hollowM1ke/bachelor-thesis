import { Stack, Button, Grid } from '@mui/material';
import React, { useState } from 'react';
import { LOGIN_CREDS } from '../LoginScreen/loginCreds';
import { USER_ROLES } from '../users/users';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import LinearProgress from '@mui/material/LinearProgress';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import { DndProvider } from 'react-dnd-multi-backend';
import { HTML5toTouch } from 'rdndmb-html5-to-touch';
import BoardContextManager from '../Board/BoardContextManager';
import { selectPersonalData, selectPersonalDataError } from '../../model/features/personaldata/personaldataSlice';
import { useSelector } from 'react-redux';
import { formulateBoardId } from '../users/boardIds';
import { BOARD_CONFIGS, EXPERIMENTS } from '../Board/boardConfig';
import Badge from '@mui/material/Badge';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import { BarChart } from '@mui/x-charts/BarChart';
import PersonalData from '../PersonalData/PersonalData';

const DashboardView = ({ view, setView, userId, userRole, groupInfos, groupName, loginWithKeyCloak }) => {
    const handle = useFullScreenHandle();
    const [studentPreview, setStudentPreview] = useState(false);
    const [studentId, setStudentId] = useState('');
    const [analyticsView, setAnalyticsView] = useState(0);
    const flagsObject = {};
    const progressObject = {};
    const totalCount = {};
    const activeFlagsCount = {};
    const dataset = [];

    const groupInfo = groupInfos[0];
    // for (const groupInfo of groupInfos) {
    for (const member of groupInfo.members) {
        const username = member.username;
        flagsObject[username] = flagsObject[username] || {};
        progressObject[username] = progressObject[username] || {};
        totalCount[username] = 0;
        activeFlagsCount[username] = 0;
        for (const index in EXPERIMENTS) {
            const boardId = formulateBoardId(BOARD_CONFIGS[1], username, groupName, EXPERIMENTS[index]);
            const flagsList = useSelector((state) => selectPersonalData(state, boardId));
            const flagCount = Object.values(flagsList.flags).reduce((sum, value) => sum + value.count, 0);
            totalCount[username] += flagCount;
            const activeFlagCount = Object.values(flagsList.flags).reduce((sum, value) => {
                return sum + (value.flag ? 1 : 0);
            }, 0);
            activeFlagsCount[username] += activeFlagCount;
            const flagValue = Object.values(flagsList.flags).some(value => value.flag === true);
            flagsObject[username] = flagsObject[username] === true ? true : flagValue;
            const progressInfo = Object.values(flagsList.progressTracker);
            progressObject[username][index] = progressInfo;
        }
        dataset.push({
            totalFlags: totalCount[username],
            activeFlags: activeFlagsCount[username],
            student: username
        });
    };
    const valueFormatter = (value) => `${value}`;

    const selectStudent = (userName) => {
        setStudentId(userName);
        setStudentPreview(true);
    };
    const setAdminView = (event) => {
        setView(0);
    };
    return (
        <>
            { !studentPreview && <Container style = {{ marginTop: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <PersonalData userId = {userId} userRole = {userRole} groupInfos = {groupInfos} groupName = {groupName}/>
                <Button variant='contained' style={{ position: 'fixed', top: '20px', right: '20px' }} onClick={setAdminView}>My Boards</Button>
                { analyticsView === 0 && <Button variant='contained' style={{ position: 'fixed', top: '20px', right: '160px' }} onClick={() => { setAnalyticsView(1); }}>Analytics</Button>}
                { analyticsView === 1 && <Button variant='contained' style={{ position: 'fixed', top: '20px', right: '160px' }} onClick={() => { setAnalyticsView(0); }}>Back</Button>}
                { analyticsView === 0 && <Grid container spacing = {2} >
                    { groupInfos[0].members.map((member, index) => (
                        <Grid item key = {index} >
                            <Card sx={{ minWidth: 175, maxWidth: 480, maxHeight: 200, border: flagsObject[member.username] ? '1px solid #F44336' : 'none', overflow: 'auto' }}>
                                <CardContent>
                                    <Stack direction='row' spacing={1}>
                                        <Typography sx={{ fontSize: 24 }} color="text.secondary" gutterBottom>
                                            { member.username }
                                        </Typography>
                                        {activeFlagsCount[member.username] > 0 &&
                                        <Badge badgeContent={activeFlagsCount[member.username]} color="error">
                                            <NotificationsOutlinedIcon />
                                        </Badge>
                                        }
                                    </Stack>
                                    {/* <Typography sx={{ fontSize: 12 }} gutterBottom>
                                            { totalCount[username] + '- flags raised' }
                                        </Typography> */}
                                    {Object.keys(progressObject[member.username]).map((experimentKey) => (
                                        <React.Fragment key={experimentKey}>
                                            {progressObject[member.username][experimentKey].map((item, itemIndex) => (
                                                <React.Fragment key={itemIndex}>
                                                    <Typography sx={{ mb: 1.5 }}>{experimentKey + ' - ' + item.label.slice(0, -7)}</Typography>
                                                    <LinearProgress variant="determinate" value={item.progressValue} />
                                                    <Typography sx={{ mb: 1.5 }}>{Math.round(item.progressValue) + '%'}</Typography>
                                                </React.Fragment>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                    <Button variant='outlined' size='small' onClick={ () => selectStudent(member.username)} >Preview</Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    )
                    )}
                </Grid> }
                { analyticsView === 1 && <Grid container spacing={2} sx = {{ width: '100%', height: '100%' }}>
                    <BarChart
                        dataset={dataset}
                        xAxis={[{ scaleType: 'band', dataKey: 'student' }]}
                        series={[
                            { dataKey: 'totalFlags', label: 'Total Flags', valueFormatter },
                            { dataKey: 'activeFlags', label: 'Active Flags', valueFormatter }
                        ]}
                        yAxis = {[{ label: 'Flags' }]}
                        width = {500}
                        height = {300}
                    />
                </Grid>
                }
            </Container>
            } { (studentPreview && view === 2) && <FullScreen handle={handle}>
                <Button variant='contained' style={{ position: 'fixed', top: '70px', right: '20px' }}>Student view: {studentId}</Button>
                <DndProvider options={HTML5toTouch}>
                    <BoardContextManager previewOnly={false} fullScreenHandle={handle} userId={studentId} userRole={USER_ROLES.STUDENT} groupName = {groupName} startingBoard = {1} view = {view} setView = {setView} adminId = {userId} loginWithKeyCloak={loginWithKeyCloak}/>
                </DndProvider>
            </FullScreen>
            }
        </>
    );
};

export default DashboardView;
