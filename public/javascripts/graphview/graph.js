// import * as d3 from 'd3';
// import Immutable from 'immutable';
import {agentColors} from '../react/agentColors';

const r = 13,
  dis = 45;

let transform;

function graph(region, traces, step) {
  let transform = {x: 0, y: 0, scale: 1};

  let canvas = document.querySelector('canvas'),
    context = canvas.getContext('2d'),
    width = canvas.width,
    height = canvas.height;

  //计算这个region一共有多少行多少列
  let left = region[0].column,
    right = region[0].column,
    up = region[0].row,
    down = region[0].row;

  region.forEach((node) => {
    left = Math.min(node.column, left);
    right = Math.max(node.column, right);
    up = Math.min(node.row, up);
    down = Math.max(node.row, down);
  });
  const columns = right - left + 1,
      rows = down - up + 1;
  const graphWidth = (columns - 1) * dis,
      graphHeight = (rows - 1) * dis;


  let allAgents = [];
  traces.forEach((trace, id) => {
    let row, column;
    if(trace.length - 1 >= step) {
      row = trace[step].row;
      column = trace[step].column;
    } else {
      row = trace.slice(-1).pop().row;
      column = trace.slice(-1).pop().column;
    }

    allAgents.push({
      id,
      row,
      column
    });
  });

  //图上的所有点
  var nodes = d3.range(columns * rows).map(function(i) {
    let columnAtRegion = i % columns,
        rowAtRegion =  Math.floor(i / columns);
    let column = columnAtRegion + left,
        row = rowAtRegion + up;

    let exists = false;
    region.forEach((node) => {
      if(node.column == column && node.row == row){
        exists = true;
      }
    });
    let agents = [];
    if (exists) {
      agents = allAgents.filter((agent) => {
        if(agent.column == column && agent.row == row) return true;
      });
    }

    let visited = false;
    traces.forEach((trace) => {
      let finded  = trace.find((node, index) => {
        if (index > step) return false;
        return node.column == column && node.row == row;
      });
      if (finded) visited = true;
    });

    return {
      index: i,
      r, //node半径
      fx: (i % columns) * dis, //每个node的x坐标
      fy: (Math.floor(i / columns)) * dis, //每个node的y坐标
      exists: exists, //该node是否需要显示，这是我另外加上去的属性，为了绘制时判断用的。见drawGraph里的drawLink和drawNode
      row,
      column,
      rowAtRegion,
      columnAtRegion,
      count: agents.length,
      agents,
      visited
    };
    /*
      以上除了exists属性，都是交给d3处理的，比如r设置为10，每个点绘制出来的半径就会是10，相当于配置信息；
      而exists是人为添加的，我在遍历nodes并绘制的函数中，加入了if判断，只绘制被我标记为exists的点。否则会绘制出整个长方形，
      （看前面的“d3.range(columns * rows)”，实际上我们添加了columns * rows个node，最终绘制出来的node数量肯定小于它
    */
  });

  //图上的那些连线
  var links = [];

  for (var y = 0; y < rows; ++y) {
    for (var x = 0; x < columns; ++x) {
      if (y > 0) links.push({source: (y - 1) * columns + x, target: y * columns + x});
      if (x > 0) links.push({source: y * columns + (x - 1), target: y * columns + x});
    }
  }

  //configuration
  var simulation = d3.forceSimulation(nodes)
    .force('charge', d3.forceManyBody().strength(-dis))
    .force('link', d3.forceLink(links).strength(1).distance(dis).iterations(10))
    .on('tick', ticked);

  function ticked() {
    context.clearRect(0, 0, width, height);
    context.save();
    context.translate(width/2 - graphWidth/2, height/2 - graphHeight/2);

    transform.x = width/2 - graphWidth/2;
    transform.y = height/2 - graphHeight/2;

    drawGraph();

    context.restore();
  }

  let zoom = d3.zoom()
    .scaleExtent([.9, 1.1])
    .on('zoom', zoomed);
  d3.select(canvas).call(zoom);


  function zoomed() {
    let trans = d3.event.transform.translate(width/2 - graphWidth/2, height/2 - graphHeight/2);
    context.save();
    context.clearRect(0, 0, width, height);
    context.translate(trans.x, trans.y);
    context.scale(d3.event.transform.k, d3.event.transform.k);

    transform = trans;
    transform.scale = d3.event.transform.k;

    drawGraph();
    context.restore();
  }

  // zoom1();
  // function zoom1() {
  //   console.log(transform);
  //   console.log(d3.event.transform);
  //   if (!transform.translate) return;
  //   let trans = transform.translate(width/2 - graphWidth/2, height/2 - graphHeight/2);
  //   context.save();
  //   context.clearRect(0, 0, width, height);
  //   context.translate(trans.x, trans.y);
  //   context.scale(transform.k, transform.k);

  //   transform = trans;
  //   transform.scale = transform.k;

  //   drawGraph();
  //   context.restore();
  // }

  //绘制整张图
  function drawGraph() {
    context.beginPath();
    links.forEach(drawLink);
    context.strokeStyle = '#fff';
    context.stroke();

    nodes.forEach(drawNode);

    context.beginPath();
    nodes.forEach(drawText);
  }

  function drawNode(d) {
    if(d.exists) {
      context.beginPath();
      context.moveTo(d.x + 3, d.y);
      context.arc(d.x, d.y, d.r,0,  2 * Math.PI);
      context.fillStyle = '#fff';
      context.fill();
      if(d.visited){
        context.fillStyle = '#FFCC99';
        context.fill();
      }
    }
  }

  function drawLink(d) {
    if(d.source.exists && d.target.exists) {
      context.moveTo(d.source.x, d.source.y);
      context.lineTo(d.target.x, d.target.y);
    }
  }

  function drawText(d) {
    if(d.exists) {
      context.font = '12px Arial';
      context.fillStyle = '#666699';
      context.fillText(d.count, d.x - 3.2, d.y + 3.6);
      context.font = '11px Arial';
      context.fillStyle = '#fff';
      context.fillText(`(${d.column + 1}，${d.row + 1})`, d.x + 5, d.y - r);
    }
  }

  // d3.select(canvas)
  //   .on('click', () => {
  //     // let unScaledNode = simulation.find(d3.event.offsetX - transform.x, d3.event.offsetY - transform.y);
  //     // console.log(unScaledNode)
  //     // console.log(unScaledNode.columnAtRegion * 60 * (transform.scale - 1));
  //     // console.log(simulation.find(d3.event.offsetX - transform.x, d3.event.offsetY - transform.y));
  //     let node = simulation.find(d3.event.offsetX - transform.x, d3.event.offsetY - transform.y);

  //     let visitedAgents = [];
  //     traces.forEach((trace, index) => {
  //       let finded = trace.find((square, index) => {
  //         if (index > step) return false;

  //         if (square.row === node.row && square.column === node.column) return true;
  //       });

  //       if (finded) {
  //         visitedAgents.push({
  //           index,
  //           trace
  //         });
  //       }
  //     });

  //     let currentAgent = visitedAgents.filter((agent) => {
  //       let square = agent.trace[step];
  
  //       if (square.row === node.row && square.column === node.column) return true;

  //       return false;
  //     });

  //     showNodeDetail(node, currentAgent, visitedAgents);
  //   });

  // function showNodeDetail(node, currentAgents, visitedAgents) {
  //   let $board = document.querySelector('#graph .info');
  //   $board.children[0].innerHTML = `Node (${node.row}, ${node.column})`;

  //   let $currentAgents = $board.querySelector('.current-agents');
  //   $currentAgents.innerHTML = '';
  //   currentAgents.forEach((agent) => {
  //     $currentAgents.innerHTML +=
  //       `<div class="agentPair">
  //         <div class="agent" style="background: ${agentColors[agent.index]}">
  //         </div>
  //         <div>agent ${Number(agent.index) + 1}</div>
  //       </div>`
  //     ;
  //   });

  //   let $visitedAgents = $board.querySelector('.visited-agents');
  //   $visitedAgents.innerHTML = '';
  //   visitedAgents.forEach((agent) => {
  //     $visitedAgents.innerHTML +=
  //       `<div class="agentPair">
  //         <div class="agent" style="background: ${agentColors[agent.index]}">
  //         </div>
  //         <div>agent ${Number(agent.index) + 1}</div>
  //       </div>`
  //     ;
  //   });
  //   // if (currentAgents.length === 0) $board.children[1].style.display = 'none';
  //   // else $board.children[1].style.display = 'block';
  // }


  setTimeout(() => {simulation.stop();}, 400);
}

// window.onhashchange = () => {
//   console.log(location.hash);
//   if(location.hash == '#1') {
//     let enviroment = document.querySelector('#environment');
//     if(enviroment) enviroment.style.display= 'none';

//     document.querySelector('#background').style.display= 'none';
//     document.querySelector('#graph').style.display= 'block';

//     //模拟输入一个region。到时候我传给你的就是这个格式
//     // var region = [{column: 2, row: 1}, {column: 2, row: 2}, {column: 2, row: 3},
//     //   {column: 3, row: 2}, {column: 3, row: 3}, {column: 3, row: 4},{column: 3, row: 5},
//     //   {column: 4, row: 2}, {column: 4, row: 3}, {column: 5, row: 2},
//     // ];
//     // graph(region);
//   }
//   // else {
//   //   let enviroment = document.querySelector('#environment');
//   //   if(enviroment) enviroment.remove();

//   //   document.querySelector('#background').remove();
//   //   document.querySelector('#graph').style.display= 'block';
//   // }


// };


// window.toggle = function() {
//   if(document.querySelector('#graph').style.display == 'none') {
//     let enviroment = document.querySelector('#environment');
//     if(enviroment) enviroment.style.display= 'none';

//     document.querySelector('#background').style.display= 'none';
//     document.querySelector('#graph').style.display= 'block';
//   } else {
//     let enviroment = document.querySelector('#environment');
//     if(enviroment) enviroment.style.display= 'block';

//     document.querySelector('#background').style.display= 'block';
//     document.querySelector('#graph').style.display= 'none';
//   }
// };

export {graph};

// let agents = Immutable.List([{id: 0, row: 1, colunm:2}, {id: 1, row: 2, colunm:5}]);
// agents.forEach((agent) => {
//   console.log(agent);
// });

// traces.forEach((trace) => {console.log(trace[2])})
