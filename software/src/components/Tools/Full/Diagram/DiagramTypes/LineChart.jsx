import React, { useRef, useLayoutEffect } from 'react';
import * as d3 from 'd3';

const LineChart = ({
    dataArray,
    headers,
    parentRef,
    xLabel,
    yLabel,
    yMin,
    yMax
}) => {
    const ref = useRef();
    const data = dataArray;

    useLayoutEffect(() => {
        d3.select(ref.current).selectAll('*').remove();
        // extract the values of table
        const xVals = data.map(d => d[0]);
        const yVals = data[0].map((col, i) => data.map(row => row[i])).slice(1, data[0].length);

        // check if (yMin, yMax) range is still applicable
        // could be off due to changes in spreadsheet after diagram got generated
        const newYMin = d3.min(yVals.map(row => d3.min(row)));
        const newYMax = d3.max(yVals.map(row => d3.max(row)));
        if (yMin > newYMin) yMin = newYMin;
        if (yMax < newYMax) yMax = newYMax;

        const margin = { top: 30, right: 30, bottom: 40, left: 40 };
        const width = parseInt(parentRef.current ? parentRef.current.offsetWidth : 200) - margin.left - margin.right;
        const height = parseInt(parentRef.current ? parentRef.current.offsetHeight : 200) - (margin.top + (headers.length * 20)) - margin.bottom - 10;

        const svg = d3.select(ref.current)
            .attr('width', '100%')
            .attr('height', '100%')
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + (margin.top + (headers.length * 20)) + ')');

        // x axis Max and Min values
        const xMin = d3.min(xVals);
        const xMax = d3.max(xVals);

        const xScale = d3.scaleLinear().domain([xMin - 0.1, xMax + 0.1]).range([0, width]);
        const yScale = d3.scaleLinear().domain([yMin, yMax]).range([height, 0]);
        const xAxis = d3.axisBottom(xScale).ticks(xScale.ticks().length);
        const yAxis = d3.axisLeft(yScale).ticks(yScale.ticks().length);
        const xAxisGrid = d3.axisBottom(xScale).tickSize(-height).tickFormat('').ticks(xScale.ticks().length);
        const yAxisGrid = d3.axisLeft(yScale).tickSize(-width).tickFormat('').ticks(yScale.ticks().length);

        // Generate grid lines
        svg.append('g')
            .attr('class', 'x axis-grid')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxisGrid);

        svg.append('g')
            .attr('class', 'y axis-grid')
            .call(yAxisGrid);

        // Create axes.
        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis);
        svg.append('g')
            .attr('class', 'y axis')
            .call(yAxis);

        // color scale
        const colorScale = d3.scaleQuantize()
            .domain([0, yVals.length - 1])
            .range(['#5E4FA2', '#3288BD', '#66C2A5', '#ABDDA4', '#E6F598', '#FFFFBF', '#FEE08B', '#FDAE61', '#F46D43', '#D53E4F', '#9E0142']);

        const lineLegend = svg.selectAll('.lineLegend').data(headers)
            .enter().append('g')
            .attr('class', 'lineLegend')
            .attr('x', width - 40)
            .attr('transform', function (d, i) {
                return 'translate(' + (width - 40) + ',' + (i * 20) + ')';
            });

        let legendLabelMaxLen = 0;
        lineLegend.append('text').text(function (d) { return d; })
            .attr('transform', 'translate(15,9)')
            .each(function (d) {
                const len = d3.select(this).node().getComputedTextLength();
                legendLabelMaxLen = len > legendLabelMaxLen ? len : legendLabelMaxLen;
            });

        lineLegend.append('rect')
            .attr('fill', function (d, i) { return colorScale(i); })
            .attr('width', 10).attr('height', 10);

        // shift the legend just as much to the left so no label will be cut off
        lineLegend.attr('transform', function (d, i) {
            return 'translate(' + (width - legendLabelMaxLen) + ',' + (-30 - (i * 20)) + ')';
        });

        // generate 2d array with line points
        const linePoints = [];
        yVals.forEach((col, colIdx) => {
            const colPoints = [];
            col.forEach((entry, entryIdx) => {
                if (xVals[entryIdx] !== undefined && !isNaN(xVals[entryIdx]) && entry !== undefined && !isNaN(entry)) {
                    colPoints.push({ x: xVals[entryIdx], y: entry });
                }
            });
            linePoints.push(colPoints);
        });
        // lines
        linePoints.forEach((col, colIdx) => {
            svg.append('path')
                .datum(linePoints[colIdx])
                .attr('fill', 'none')
                .attr('stroke', colorScale(colIdx))
                .attr('stroke-width', 1)
                .attr('d', d3.line()
                    .x(d => xScale(d.x))
                    .y(d => yScale(d.y))
                );
        });
        linePoints.forEach((col, colIdx) => {
            svg.selectAll('.circle')
                .data(col)
                .enter().append('circle')
                .style('stroke', colorScale(colIdx))
                .style('fill', colorScale(colIdx))
                .attr('r', (width + height) / 200)
                .attr('cx', d => xScale(d.x))
                .attr('cy', d => yScale(d.y));
        });

        // x-axis label
        svg.append('text')
            .attr('class', 'x label')
            .attr('text-anchor', 'middle')
            .attr('x', (width / 2))
            .attr('y', height + margin.bottom - 10)
            .style('font-size', '0.75em')
            .text(xLabel);

        // y-axis label
        svg.append('text')
            .attr('class', 'y label')
            .attr('text-anchor', 'middle')
            .style('font-size', '0.75em')
            .attr('y', -margin.left * 0.9)
            .attr('x', -height / 2)
            .attr('dy', '.75em')
            .attr('transform', 'rotate(-90)')
            .text(yLabel);
    }, [
        parentRef.current ? d3.select(parentRef.current.parentElement).node().offsetWidth : 200,
        JSON.stringify(data),
        JSON.stringify(headers)
    ]);

    return (
        <svg ref={ref}></svg>
    );
};

export default LineChart;
