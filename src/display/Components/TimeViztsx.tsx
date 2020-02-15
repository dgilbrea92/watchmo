import { 
  select, 
  line, 
  curveCardinal, 
  axisBottom, 
  axisRight, 
  scaleLinear, 
  mouse 
} from 'd3';
import React, { useRef, useEffect } from 'react';
import '../stylesheets/style.scss'
/* The useEffect Hook is for running side effects outside of React,
       for instance inserting elements into the DOM using D3 */

interface TimeVizProps {
  key: string;
  timeData: any;
  selectedQueries: string[];
}
const TimeViz: React.FC<TimeVizProps> = (props) => {
  let timeData = props.timeData;
  let selectedQueries = props.selectedQueries;
  let timing = {}; //this will be a {'querr': [array of all responsetimes]}
  let timeStamps: string[] = []; //this will be an array of timestamp strings

  for (let quer in timeData) {
    timing[quer] = [];
    timeData[quer].forEach(response => {
      timeStamps.push(response.timestamp);
      timing[quer].push((response.timing[0] + response.timing[1] / 1000000000))
    });
    timing[quer].shift()
  }


  // let [data, setData] = useState();
  let data : number[];
  if (timing[selectedQueries[0]]) {
    data = timing[selectedQueries[0]];
  }
  else {
    data = [.10, .10, .10, .10, .10, .10, .10];
  }


  // let [time, setTime] = useState([{ name: 'Query 1', labelOffset: 60, value: function (t) { return d3.10l(t, 1, 0.5); } },
  // ]);
  let svgRef = useRef();
  /*The most basic SVG file contains the following format:
  --Size of the viewport (Think of this as the image resolution)
  --Grouping instructions via the element -- How should elements be grouped?
  --Drawing instructions using the shapes elements
  --Style specifications describing how each element should be drawn.*/
  // will be called initially and on every data change

  useEffect(() => {

    // if (timing[selectedQueries[0]]) {

    // }

    let chartDiv = document.getElementById('chartArea') //grab the chart area that the graph lives in
    let margin = { yheight: chartDiv.clientHeight, xwidth: chartDiv.clientWidth } //margins required for resizing

    function redrawLine() {
      margin.yheight = chartDiv.clientHeight
      margin.xwidth = chartDiv.clientWidth
      xScale.range([0, margin.xwidth]);
      xAxis = axisBottom(xScale).ticks(data.length)//.tickFormat(index => Math.floor(index + 1));
      svg.select('.x-axis').call(xAxis)
      svg.select('.y-axis').style('transform', `translateX(${margin.xwidth}px)`)
      // svg.select('.y-axis').append('text')

      newLine = line().x((_value, index) => xScale(index)).y(yScale).curve(curveCardinal);

      svg
        .select('rect')
        .style('pointer-events', 'all')
        .attr('width', `${margin.xwidth}`);

      svg
        .selectAll('.line').attr('d', newLine)
    }
    window.addEventListener('resize', redrawLine); //force a redraw when the page resizes


    let max = Math.max(...data)
    let upperLine = 1.5 * max;

    let svg = select(svgRef.current);

    //range in the scales control how long the axis line is on the graph
    //domain is the complete set of values and the range is the set of resulting values of a function
    let xScale:any = scaleLinear<number, number>().domain([0, data.length - 1]).range([0, margin.xwidth]);
    let yScale:any = scaleLinear<number, number>().domain([0, upperLine]).range([300, 0]);
      
    //calling the xAxis function with current selection
    let xAxis:any = axisBottom(xScale).ticks(data.length)
    xAxis.tickFormat((domain) => (Math.floor(domain)).toString());
    svg.select('.x-axis').style('transform', 'translateY(300px)').style('filter', 'url(#glow)').call(xAxis)
    //\ticks are each value in the line
    let yAxis:any = axisRight(yScale).ticks(20)
    yAxis.tickFormat((domain) => (Math.round((domain) * 1000) / 1000).toString());
    svg.select('.y-axis').style('transform', `translateX(${margin.xwidth}px)`).style('filter', 'url(#glow)').call(yAxis)
    svg.select('.y-axis').append('text')
      .attr('class', 'yaxislabel')
      .attr('transform', 'rotate(90)')
      .attr('y', 20)
      .attr('dy', '-3em')
      .attr('x', '3.75em')
      // .attr('dx', '0.5em')
      .style('text-anchor', 'start')
      .style('fill', 'white')
      .attr('font-size', '20px')
      .text('Response Time(s)');
    //initialize a line to the value of line 
    //x line is rendering xscale and y is rendering yscale
    let newLine : any = line().x((_value, index) => xScale(index)).y(yScale).curve(curveCardinal);
    //select all the line elements you find in the svg and synchronize with data provided
    //wrap data in another array so d3 doesn't generate a new path element for every element in data array
    //join creates a new path element for every new piece of data
    //class line is to new updating path elements
    //Container for the gradients
    let defs = svg.append('defs');

    //Filter for the outside glow
    let filter = defs.append('filter')
      .attr('id', 'glow');
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '3.5')
      .attr('result', 'coloredBlur');
    let feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode')
      .attr('in', 'coloredBlur');
    feMerge.append('feMergeNode')
      .attr('in', 'SourceGraphic');

    svg
      .append('rect')
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .attr('width', `${margin.xwidth}`)
      .attr('height', 300)
      .on('mouseover', mouseover)
      .on('mousemove', mousemove)
      .on('mouseout', mouseout);

    svg
      .selectAll('.line')
      .data([data])
      .join('path')
      .attr('class', 'line')
      .attr('d', newLine)
      .attr('fill', 'none')
      .attr('stroke', 'rgb(6, 75, 115)')
      .style('filter', 'url(#glow)');

    // Create the circle that travels along the curve of chart
    // This allows to find the closest X index of the mouse:
    // let bisect = bisector(function (d) { return d.xScale; }).left;
    //the circle on the line
    let focus = svg
      .append('g')
      .append('circle')
      .style('fill', 'none')
      .attr('stroke', 'black')
      .attr('r', 8.5)
      .style('opacity', 0)
    //the the vertical line on the graph where the mouse is
    let mouseLine = svg
      .append('g')
      .append('path')
      .attr('class', 'mouse-line')
      .style('stroke', 'black')
      .style('stroke-width', '1px')
      .attr('height', 300)
      .style('opacity', 0);
    //the the text on the graph where the mouse is
    let focusText = svg
      .append('g')
      .append('text')
      .style('opacity', 0)
      .attr('text-anchor', 'left')
      .attr('alignment-baseline', 'middle')

    function mouseover() : void {
      focus.style('opacity', 1)
      focusText.style('opacity', 1)
      mouseLine.style('opacity', 1)
    }

    function mousemove():void {
      // recover coordinate we need
      let x0 : number = Math.ceil(xScale.invert(mouse(this)[0])) - 1;
      let selectedDataY : number = data[x0]
      focus
        .attr('cx', xScale(x0))
        .attr('cy', yScale(selectedDataY))
      focusText
        .html((x0) + '  : ' + selectedDataY + 's')
        .attr('x', xScale(x0) + 15)
        .attr('y', yScale(selectedDataY) - 25)
      mouseLine
        .attr('d', function () {
          let d = 'M' + xScale(x0) + ',' + 300; //this is drawing the line from 0 to 300px
          d += ' ' + xScale(x0) + ',' + 0;
          return d;
        })

    }
    function mouseout() : void {
      focus.style('opacity', 0)
      focusText.style('opacity', 0)
      mouseLine.style('opacity', 0)
    }


  },
    //rerender data here
    [data]);
  return (
    <React.Fragment>
      <svg ref={svgRef}>
        <g className='x-axis' />
        <g className='y-axis' /></svg>
      <br />
      {/* <button onClick={() => setData(data.map(value => value + 5))}>
        Update Data </button> */}
    </React.Fragment >
  )
}
export default TimeViz;
