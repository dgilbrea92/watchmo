import { select, axisBottom, axisRight, scaleLinear, scaleBand } from 'd3';
import React, { useRef, useEffect, useState } from 'react';
import '../stylesheets/style.scss';
import TimeViz from './TimeViz';
/* The useEffect Hook is for running side effects outside of React,
       for instance inserting elements into the DOM using D3 */
///CURRENTLY NOT USING STATE DATA FOR RENDERING PURPOSE
function VertColViz(props) {
  let queries = [];
  let responses = [];
  let selectedQss = [];
  let timeGraph = <div></div>;

  const [selectedQuery, setSelectedQuery] = useState([]);
  const [renderLine, setRenderLine] = useState(false);

  function addOrRemove(queryIn) {
    console.log(queryIn);
    if (selectedQss.includes(queryIn)) {
      setSelectedQuery(selectedQuery.filter(selectedQs => selectedQs !== queryIn));
      selectedQss = selectedQss.filter(selectedQs => selectedQs !== queryIn);
      if (selectedQss.length === 0) {
        setRenderLine(false);
      }
    } else {
      setSelectedQuery([]);
      selectedQss = [];
      setSelectedQuery(selectedQs => [...selectedQs, queryIn]);
      setRenderLine(true);
      selectedQss.push(queryIn);
    }
  }

  const svgRef = useRef();
  /*The most basic SVG file contains the following format:
 
  --Size of the viewport (Think of this as the image resolution)
  --Grouping instructions via the element -- How should elements be grouped?
  --Drawing instructions using the shapes elements
  --Style specifications describing how each element should be drawn.*/
  // will be called initially and on every data change
  useEffect(() => {
    setRenderLine(false);
    for (let query in props.dataCat) {
      let timeTot = 0;
      queries.push(query);
      props.dataCat[query].forEach(time => {
        timeTot += time.timing[1] / 1000000000;
      });
      responses.push(timeTot / props.dataCat[query].length);
    }
  }, [props.dataCat]);

  useEffect(() => {
    setSelectedQuery([]);

    const svg = select(svgRef.current);

    let max = Math.max(...responses);
    let upper = 1.5 * max;
    // scales
    const xScale = scaleBand()
      .domain(responses.map((value, index) => index)) //x-axis labeled here
      .range([0, 750])
      .padding(0.5);

    const yScale = scaleLinear()
      .domain([0, `${upper}`])
      .range([300, 0]);

    const colorScale = scaleLinear()
      .domain([
        `${upper * 0.2}`,
        `${upper * 0.3}`,
        `${upper * 0.35}`,
        `${upper * 0.4}`,
        `${upper * 0.45}`,
        `${upper * 0.5}`
      ])
      .range(['red', 'yellow', 'green', 'blue', 'purple', 'pink'])
      .clamp(true);
    let defs = svg.append('defs');

    //Filter for the outside glow
    let filter = defs.append('filter').attr('id', 'glow');
    filter
      .append('feGaussianBlur')
      .attr('stdDeviation', '3.5')
      .attr('result', 'coloredBlur');
    let feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
    // create x-axis
    const xAxis = axisBottom(xScale).ticks(responses.length);
    svg
      .select('.x-axis')
      .style('transform', 'translateY(300px)')
      .call(xAxis)
      .style('filter', 'url(#glow)');

    // create y-axis
    //location of bars, the higher the number, the higher the position on the graph

    const yAxis = axisRight(yScale);
    svg
      .select('.y-axis')
      .style('transform', 'translateX(750px)')
      .style('filter', 'url(#glow)')
      .call(yAxis);

    // draw the bars
    svg
      .selectAll('.bar')
      .data(responses)
      .join('rect')
      .attr('class', 'bar')
      .style('transform', 'scale(1, -1)')
      .attr('x', (value, index) => xScale(index))
      .attr('y', -300)
      .attr('width', xScale.bandwidth())
      .on('mouseenter', (value, index) => {
        svg
          .selectAll('.tooltip')
          .data([value])
          .join(enter => enter.append('text').attr('y', yScale(value) - 50))
          .attr('class', 'tooltip')
          .text(`${queries[index]}`)
          .attr('x', xScale(index) + xScale.bandwidth() / 2)
          .attr('text-anchor', 'middle')
          .transition()
          .attr('y', yScale(value) - 80)
          .attr('opacity', 1);
      })
      .on('mouseleave', () => svg.select('.tooltip').remove())
      .on('click', (value, index) => {
        addOrRemove(`${queries[index]}`);
      })
      .transition()
      .attr('fill', colorScale)
      .attr('height', value => 350 - yScale(value));
  }, [props.dataCat]);

  if (renderLine === true) {
    timeGraph = (
      <TimeViz key={'lineGraph'} timeData={props.dataCat} selectedQueries={selectedQuery} />
    );
  }

  /*React fragments let you group a list of children without adding extra nodes to the DOM 
         because fragments are not rendered to the DOM. */
  return (
    <React.Fragment>
      <svg ref={svgRef}>
        <g className="x-axis" />
        <g className="y-axis" />
      </svg>
      <button onClick={() => setData(data.map(value => value + 5))}>Add Five</button>
      <button onClick={() => setData(data.filter(value => value < 35))}>Filter</button>
      <button onClick={() => setData([...data, Math.round(Math.random() * 100)])}>Add data</button>
      <div>{timeGraph}</div>
    </React.Fragment>
  );
}

export default VertColViz;
