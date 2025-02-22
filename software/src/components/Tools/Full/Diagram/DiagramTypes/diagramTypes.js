export const DIAGRAM_TYPES = {
    LINECHART: 'linechart',
    GROUPEDBARCHART: 'groupedbarchart',
    STACKEDBARCHART: 'stackedbarchart',
    SCATTERPLOTCHART: 'scatterplot'
};

export const DIAGRAM_CONFIG = [
    { id: DIAGRAM_TYPES.LINECHART, name: 'Liniendiagramm', icon: 'ShowChart' },
    { id: DIAGRAM_TYPES.GROUPEDBARCHART, name: 'Gruppiertes Balkendiagramm', icon: 'BarChart' },
    { id: DIAGRAM_TYPES.STACKEDBARCHART, name: 'Gestapeltes Balkendiagramm', icon: 'BarChart' },
    { id: DIAGRAM_TYPES.SCATTERPLOTCHART, name: 'Streudiagramm', icon: 'ScatterPlot' }
];
