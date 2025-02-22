import React, { useRef, useLayoutEffect } from 'react';
import * as d3 from 'd3';

const GroupedBarChart = ({
    dataArray,
    headers,
    xAxisCategories,
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
        const parentWidth = parseInt(parentRef.current ? parentRef.current.offsetWidth : 200);
        const parentHeight = parseInt(parentRef.current ? parentRef.current.offsetHeight - 5 : 200);
        const margin = { top: 30, right: 30, bottom: 25, left: 40 };
        const width = parentWidth - margin.left - margin.right;
        const height = parentHeight - margin.top - margin.bottom - 15;

        // check if (yMin, yMax) range is still applicable
        // could be off due to changes in spreadsheet after diagram got generated
        const newYMin = d3.min(data.map(row => d3.min(row)));
        const newYMax = d3.max(data.map(row => d3.max(row)));
        if (yMin > newYMin) yMin = newYMin;
        if (yMax < newYMax) yMax = newYMax;

        const svg = d3.select(ref.current)
            .attr('width', '100%')
            .attr('height', '100%')
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        // scale for getting color of column value
        const colorScale = d3.scaleOrdinal()
            .domain(data.map(e => data.indexOf(e)))
            .range(['#5E4FA2', '#3288BD', '#66C2A5', '#ABDDA4', '#E6F598', '#FFFFBF', '#FEE08B', '#FDAE61', '#F46D43', '#D53E4F', '#9E0142']);

        // outer scale to get position of row on the x-axis
        const x0 = d3.scaleBand()
            .rangeRound([0, width])
            .paddingInner(0.1)
            .domain((xAxisCategories && xAxisCategories.length > 0)
                ? xAxisCategories.map(val => val)
                : data.map(e => data.indexOf(e)));

        // scale for getting x position inside the outer scale
        const x1 = d3.scaleBand()
            .padding(0.05)
            .domain(data[0].map((_, i) => i))
            .rangeRound([0, x0.bandwidth()]);

        // scale for y value
        const y = d3.scaleLinear()
            .rangeRound([height, 0])
            .domain([yMin, yMax]);

        svg.append('g')
            .attr('transform', 'translate(0,' + height + ')')
            .call(d3.axisBottom(x0));

        svg.append('g')
            .attr('class', 'axis')
            .call(d3.axisLeft(y));

        // add the Y gridlines
        svg.append('g')
            .attr('class', 'gridLine')
            .call(d3.axisLeft(y)
                .ticks(y.ticks().length)
                .tickSize(-width)
                .tickFormat('')
            );

        // draws the rectangles corresponding to their row and column (column decides the color)
        svg.append('g')
            .selectAll('rect')
            .data(data.flatMap((e1, e1Idx) => e1.map((e2, e2Idx) => {
                return { row: e1Idx, col: e2Idx, value: (!isNaN(e2) ? e2 : 0) };
            })))
            .enter().append('rect')
            .attr('transform', function (d) {
                return 'translate(' + x0((xAxisCategories && xAxisCategories.length > 0) ? xAxisCategories[d.row] : d.row) + ',0)';
            })
            .attr('x', function (d) { return x1(d.col); })
            .attr('y', function (d) { return d.value < 0 ? y(0) : y(d.value); })
            .attr('width', x1.bandwidth())
            .attr('height', function (d) { return y(0) - y(Math.abs(d.value)); })
            .attr('fill', function (d) { return colorScale(d.col); });

        // x-axis label
        svg.append('text')
            .attr('class', 'x label')
            .attr('text-anchor', 'middle')
            .attr('x', (width / 2))
            .attr('y', height + margin.bottom)
            .style('font-size', '0.75em')
            .text(xLabel);

        // y label next to the y axis
        svg.append('text')
            .attr('class', 'y label')
            .attr('text-anchor', 'middle')
            .style('font-size', '0.75em')
            .attr('y', -margin.left * 0.9)
            .attr('x', -height / 2)
            .attr('dy', '.75em')
            .attr('transform', 'rotate(-90)')
            .text(yLabel);

        // legend for the columns
        const legend = svg.selectAll('.legend').data(headers)
            .enter().append('g')
            .attr('class', 'legend')
            .attr('x', width - 40)
            .attr('transform', function (d, i) {
                return 'translate(' + (width - 40) + ',' + (i * 20) + ')';
            });

        let legendLabelMaxLen = 0;
        legend.append('text').text(function (d) { return d; })
            .attr('transform', 'translate(15,9)')
            .attr('class', 'legendLabel')
            .each(function (d) {
                const len = d3.select(this).node().getComputedTextLength();
                legendLabelMaxLen = len > legendLabelMaxLen ? len : legendLabelMaxLen;
            });

        legend.append('rect')
            .attr('fill', function (d, i) { return colorScale(i); })
            .attr('width', 10).attr('height', 10);

        // shift the legend just as much to the left so no label will be cut off
        legend.attr('transform', function (d, i) {
            return 'translate(' + (width - legendLabelMaxLen) + ',' + (i * 20) + ')';
        });
    }, [
        parentRef.current ? d3.select(parentRef.current.parentElement).node().offsetWidth : 200,
        JSON.stringify(data),
        JSON.stringify(headers)
    ]);

    return (
        <svg ref={ref}></svg>
    );
};

export default GroupedBarChart;
