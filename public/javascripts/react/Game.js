import React from 'react';
// import ReactDOM from 'react-dom';
import Immutable from 'immutable';
import Hammer from 'react-hammerjs';

import {$f} from '../fn.js'
import {Board, initAgentsColor} from './Board';
import {RunningEnvironment} from '../RunningEnvironment'
import {graph} from '../graphview/graph';
import {Traces} from './Traces';
import {Graph} from './Graph';
import {agentColors} from './agentColors';
import {readFile} from '../ReadingConfiguration'

const OPEN = 'open',
      OBSTACLE = 'obstacle',
      AGENT = 'agent',
      BlANK  = '';

let agentId = 0;
let algorithm;

class Game extends React.Component {
  constructor(){
    super();
    this.state = {
      background: Immutable.fromJS(Array(20).fill(Array(20).fill(BlANK))),
      environment: null,
      agents: Immutable.List([]),
      mouseDown: false,
      mouseDownOnEnvir: false,
      environmentSettled: false,
      regions: Immutable.List([]),
      tipText: '',
      btn_finished_class: 'hidden',
      btn_runOne_class: 'hidden',
      btn_runMuti_class: 'hidden',
      btn_save_class: 'hidden',
      regionBar_class: 'show_regionBar',
      agentBar_class: '',
      moreBar_class: '',
      content_toggle: 0, // 0都不高亮；1第一个高亮；2第二个高亮
      configFinished: false,
      curStep: 0,
      toggle: -1, //-1 shows block view; 0,1,2... shows corresponding region
      curRegion: -1,
      show_nodeDetailBoard: false,
      show_savePopUp: 'init',
    };

    this.envirPosition = {
      startRow: null,
      startColumn: null,
      endRow: null,
      endColumn: null
    };


    this.mouseDownCoor = {};
    this.mouseUpCoor = {};
  }

  runOneStep() {
    /*-------------------*/
    let $board = document.querySelector('#graph .info');
    if ($board) {
      $board.children[0].innerHTML = `Node :`;

      let $currentAgents = $board.querySelector('.current-agents');
      $currentAgents.innerHTML = '';
      let $visitedAgents = $board.querySelector('.visited-agents');
      $visitedAgents.innerHTML = '';
    }
    /*-------------------*/

    let curStep = this.state.curStep + 1;
    this.setState({curStep});
    let agents = this.state.agents;

    let isEnd = true;

    algorithm.traces.forEach((trace, id) => {
      if(!trace[curStep]) return;
      isEnd = false;

      let curPosition = trace[curStep],
          row = curPosition.row,
          column = curPosition.column;
      
      let move = judgeMove(agents.get(id), {row, column});

      if(document.getElementById('agent-' + id)) {
        document.getElementById('agent-' + id).classList.add(move);
      }

      let hidden = agents.get(id).hidden;
      agents = agents.set(id, {id, row, column, hidden});
    });
    
    if  (isEnd) {
      this.setState({btn_runOne_class: 'hide'});
      setTimeout(() => this.setState({btn_runOne_class: 'hidden'}), 490);
      this.setState({btn_runMuti_class: 'hide'});
      setTimeout(() => this.setState({btn_runMuti_class: 'hidden'}), 490);

      setTimeout(() => this.setState({btn_save_class: 'show'}), 700);
      return;
    }

    this.agents = agents;
    setTimeout(() => this.setState({agents}), 350);

    function judgeMove(prev, cur) {
      if (cur.row < prev.row) {
        return 'moveUp';
      } else if (cur.row > prev.row) {
        return 'moveDown';
      } else if (cur.column < prev.column) {
        return 'moveLeft';
      } else {
        return 'moveRight';
      }
    }
    
    graph(this.state.regions.get(this.state.curRegion), algorithm.traces, curStep);
  }

  runMutiSteps(e) {
    if(!this.stepsInput.value) return;

    if (!$f.isPositiveInterger(this.stepsInput.value)) {
      alert('Please enter a positive integer');
      return;
    }

    if (!e.target.classList.contains('btn') || !this.stepsInput.value) return;
    let total = parseInt(this.stepsInput.value);

   let curStep = this.state.curStep + total;
    this.setState({curStep});
    let agents = this.state.agents;

    console.log(curStep);
    algorithm.traces.forEach((trace, id) => {
      if(!trace[curStep]) curStep = trace.length - 1;

      let curPosition = trace[curStep],
          row = curPosition.row,
          column = curPosition.column;
      

      let hidden = agents.get(id).hidden;
      agents = agents.set(id, {id, row, column, hidden});
    });
    

    this.agents = agents;
    this.setState({agents})
    
    graph(this.state.regions.get(0), algorithm.traces, curStep);
  }

  handleMouseDownOnBackground(e) {
    if(this.state.configFinished) return;

    this.setState({mouseDown: true});
    this.envirPosition.startRow = e.target.getAttribute('data-row');
    this.envirPosition.startColumn = e.target.getAttribute('data-column');

    this.mouseDownCoor = e.target.getBoundingClientRect();
  }

  handleMouseOverOnBackground(e) {
    // e.target.innerHTML = '1';
    if(this.state.configFinished) return;

    if(this.state.mouseDown){
      this.envirPosition.endRow = e.target.getAttribute('data-row');
      this.envirPosition.endColumn = e.target.getAttribute('data-column');

      this.mouseUpCoor = e.target.getBoundingClientRect();

      let width = Math.abs(this.envirPosition.endColumn - this.envirPosition.startColumn) + 1,
          height = Math.abs(this.envirPosition.endRow - this.envirPosition.startRow) + 1;
      
      this.setState({tipText: `${width} X ${height}`});
      this.setState(
      {
        environment: Immutable.fromJS(Array(height).fill(Array(width).fill(OBSTACLE)))
      }, () => {
        document.getElementById('environment').style.top = this.mouseDownCoor.top;
        document.getElementById('environment').style.left = this.mouseDownCoor.left;
      });
    }
  }

  handleMouseUpOnEnvironment(e) {
    if(this.state.configFinished) return;

    if (this.state.mouseDown) {
      this.setState({mouseDown: false});
      setTimeout(() => this.setState({btn_finished_class: 'show'}), 1000);
    }
    if (this.state.mouseDownOnEnvir){
      this.setState({mouseDownOnEnvir: false});
    }

    if(this.state.tipText) this.setState({tipText: ''});
  }

  handleMouseDownOnEnvironment(e) {
    if(this.state.configFinished) return;

    e.preventDefault();
    this.setState({mouseDownOnEnvir: true});
    let target = e.target;
    
    if(target.classList.contains('agent') || target.classList.contains('agentMore')) {
      target = target.parentElement
    }

    if(target.classList.contains(OPEN)) {
      this.addAgent.call(this, target);
    }
    else {
      this.setState({regions: this.state.regions.push([])}, () => {this.setOpen(target)});
    }
  }

  handleMouseOverOnEnvironment(e) {
    if(this.state.configFinished) return;

    if(this.state.mouseDownOnEnvir) {
      this.setOpen(e.target);
    }
  }

  addAgent(target) {
    let row = target.getAttribute('data-row'),
        column = target.getAttribute('data-column');
    let agents = this.state.agents;
    agents = agents.push({
      id: agentId++,
      row: Number(row),
      column: Number(column)
    });
    this.setState({agents});
  }

  setOpen(target) {
    let row = target.getAttribute('data-row'),
        column = target.getAttribute('data-column');
    let regions = this.state.regions,
        connectedToOtherRegions = false;

    for(let i = 0; i < regions.size - 1 ; i++) {
      let illegal = false;
      
      regions.get(i).forEach((square) => {
        if((row == square.row && column == square.column - 1) || 
           (row == square.row && column == square.column + 1) || 
           (column == square.column && row == square.row - 1) || 
           (column == square.column && row == square.row + 1)) {
          illegal = true;
          return false;
        }
      })
      if(illegal) return;
    }

    let region = regions.last();
    let notConnected = true,
        repeated = false;
    region.forEach((square) => {
      if(row == square.row && column == square.column) {
        repeated = true;
      }
      if((row == square.row && column == square.column - 1) || 
           (row == square.row && column == square.column + 1) || 
           (column == square.column && row == square.row - 1) || 
           (column == square.column && row == square.row + 1)) {
        notConnected = false;
      }
    });
    if(region.length > 0 && (repeated || notConnected)) return;
    
    this.setState({environment: this.state.environment.update(row, column, OPEN)});

    region = JSON.parse(JSON.stringify(region));
    region.push({row: Number(row), column: Number(column)});
    this.setState({regions: regions.set(-1, region)});
  }

  handleSketchClick(regionID) {
    if (this.state.toggle !== regionID) {
      this.setState({toggle: regionID});
      this.setState({curRegion: regionID});
      graph(this.state.regions.get(regionID), algorithm.traces, this.state.curStep);
    } else {
      this.setState({toggle: -1});
    }
  }

  constructRegionSketch(region, index) {
    if(region.length <= 0) return;
    let left = region[0].column, 
        right = region[0].column, 
        up = region[0].row, 
        down = region[0].row;
    
    region.forEach((square) => {
      left = Math.min(square.column, left);
      right = Math.max(square.column, right);
      up = Math.min(square.row, up);
      down = Math.max(square.row, down);
    });

    let width = (right - left + 1) * 10,
        height = (down - up + 1) * 10;
    
    const squares = [];
    let key = 0;
    for(let i = up; i <= down; i++) {
      for(let j = left; j <= right; j++) {
        let isOpen = false;
        region.forEach((square) => {
          if(i == square.row && j == square.column) isOpen = true;
        });

        squares.push(
          <div className={'sketchSquare ' + (isOpen ? 'sketchSquare-obstacle ' : '')} key={key++}></div>
        );
      }
    }

    const deleter = this.state.mouseDown ? null : (
      <div className={"deleter" + (this.state.configFinished ? ' hidden2' : '')}>
        <span className="close warp black" onClick={() => {
          let environment = this.state.environment,
              regions = this.state.regions,
              agents = this.state.agents;
          regions.get(index).forEach((square) => {
            environment = environment.update(square.row, square.column, OBSTACLE);
            agents = agents.filter((agent, i) => {
              if(agent.row == square.row && agent.column == square.column) {
                return false;
              }
              return true;
            });
          });
          this.setState({agents})
          this.setState({environment})

          regions = regions.delete(index);
          
          this.setState({regions})
        }}>
        </span>
      </div>
    );
      
    return (
      <div key={index} className="sketchBlock" data-regionID={index}>
        <div 
          style={{width, height}} 
          className={'sketch ' + (this.state.toggle === index ? 'selected' : '')}
          onClick={this.handleSketchClick.bind(this, index)}
        >
          {squares}
        </div>
        {deleter}
        <div className="clearFloat"></div>
      </div>
    );
  }

  goOneStep(initialDirection, agent, environment) {
    let goOne = [
      () => {
        if(environment.get(agent.row + 1) && environment.get(agent.row + 1).get(agent.column) === OPEN) {
          agent.row++;
          return agent;
        }
        return false;
      },
      () => {
        if(environment.get(agent.row - 1) && environment.get(agent.row - 1).get(agent.column) === OPEN) {
          agent.row--;
          return agent;
        }
      },
      () => {
        if(environment.get(agent.row) && environment.get(agent.row).get(agent.column + 1) === OPEN) {
          agent.column++;
          return agent;
        }
      },
      () => {
        if(environment.get(agent.row) && environment.get(agent.row).get(agent.column - 1) === OPEN) {
          agent.column--;
          return agent;
        }
      }
    ];

    for(let i = initialDirection; i < initialDirection + goOne.length; i++){
      if(goOne[i % goOne.length]()) break;
    }

    return agent;
  }

  configFinished() {
    let legal = true;
    this.state.regions.forEach((region) => {
      let finded = this.state.agents.find((agent) => {
        return region.find((square) => {
          return square.row == agent.row && square.column == agent.column;
        });
      });

      if (!finded) legal = false;
    });
    if (!legal) return alert('There are some regions that have no agents!');

    this.setState({btn_finished_class: 'hide'});
    setTimeout(() => this.setState({btn_finished_class: 'hidden'}), 500);

    setTimeout(() => this.setState({btn_runOne_class: 'show'}), 500);
    setTimeout(() => this.setState({btn_runMuti_class: 'show'}), 650);
    
    let envri = this.state.environment.toArray();
    envri = envri.map((row) => {
      return row.toArray();
    });

    envri = envri.map((row) => {
      return row.map((square) => {
        switch (square) {
          case OPEN || AGENT:
            return 0;
          case OBSTACLE:
            return -1;
        }
      });
    });
    algorithm = new RunningEnvironment();
    algorithm.initBlock(envri);
    // console.log(this.state.regions.toObject());
    console.log(algorithm);
    // console.log(this.state.environment.toJS());
    algorithm.addRegions(this.state.regions.toObject());
    this.state.agents.forEach((agent) => {
      algorithm.addAgent(agent.id, {column: agent.column, row: agent.row})
    });

    algorithm.move();
    this.setState({configFinished: true});
    // window.algorithm = algorithm;
  }

  handleLeftBarSwipe(e) {
    if (Math.abs(e.angle) > 140) {
      if (this.state.regionBar_class) {
        this.setState({regionBar_class: ''});
        this.setState({agentBar_class: 'show_agentBar'});
      } else {
        this.setState({regionBar_class: 'show_regionBar'});
        this.setState({agentBar_class: ''});
      }
    }
  }

  handleLeftBarAgentClick(e) {
    let agentId = e.currentTarget.getAttribute('data-id');
    let agent = this.state.agents.get(agentId);
    agent.hidden = !agent.hidden;
    let agents = this.state.agents.set(agentId, agent);

    this.setState(agents)
  }

  handleEnterSize() {
    this.setState({content_toggle: 1});
    this.fileInput.value = '';
    this.fileResult = null;
  }

  handleSelectFile() {
    this.setState({content_toggle: 2});
    this.widthInput.value = '';
    this.heightInput.value = '';
    readFile(this.fileInput.files, (result) => {
      this.fileResult = result;
    });
  }

  generateEnvironment() {
    this.setState({regions: Immutable.List([])});
    let height, width;
    if (this.fileResult) {
      height = parseInt(this.fileResult.height),
      width = parseInt(this.fileResult.width);

      let regions = Immutable.List(this.fileResult.regions);
      this.setState({regions});

    } else if (this.heightInput.value && this.widthInput.value) {
      height = this.heightInput.value;
      width = this.widthInput.value;
      if (!$f.isPositiveInterger(height) || !$f.isPositiveInterger(width)) {
        alert('Please enter an positive integer');
        return;
      }
      
      height = Number(height);
      width = Number(width);
    } else {
      return alert('Please set the configration first');
    }
    if ( height <=0 || width <= 0) return alert('Please check the configration');

    this.setState({btn_finished_class: 'show'})

    this.setState({
      environment: Immutable.fromJS(Array(height).fill(Array(width).fill(OBSTACLE)))
    }, () => {
      let dataRow = Math.round((20 - height) / 2);
      let dataColumn = Math.round((20 - width) / 2);
      let ele = document.querySelector(`[data-row="${dataRow}"][data-column="${dataColumn}"]`);

      let rect = ele.getBoundingClientRect();
      document.getElementById('environment').style.top = rect.top;
      document.getElementById('environment').style.left = rect.left;

      if (this.fileResult) {
        let environment = this.state.environment;
        this.fileResult.regions.forEach((region) => {
          region.forEach((square) => {
            environment = environment.update(square.row, square.column, OPEN);
          });
        });
        this.setState({environment});
      }
    });
  }

  saveRun() {
    this.setState({show_savePopUp: false});
    let regions = Object.keys(algorithm.regions).map((key) => {
      let agents = [];
      algorithm.traces.forEach((trace, index) => {
        let finded = algorithm.regions[key].find((square, index) => {
          if (square.row === trace[0].row && square.column === trace[0].column) return true;
          return false;
        });

        if (finded) {
          agents.push({
            agent: Number(index),
            trace
          });
        }
      });

      return {
        region: Number(key),
        coordinates: algorithm.regions[key],
        agents,
      };
    });

    let body = {
      id: new Date().getTime(),
      environment: algorithm.block,
      regions,
      // name: this.nameInput.value,
      description: this.descriptionInput.value
    }
    console.log(body);

    const obj = {
      method: 'post',
      url: '/run',
      data: JSON.stringify(body)
    };
    $f.ajax(obj)
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.log(err);
      })
  }

  render() {
    const background = (
      <Board 
        id="background" 
        board={this.state.background}
        onMouseDown={this.handleMouseDownOnBackground.bind(this)}
        onMouseOver={this.handleMouseOverOnBackground.bind(this)}
        toggle={this.state.toggle}
      />
    );

    const environment = this.state.environment ? (
      <Board 
        id="environment" 
        board={this.state.environment}
        agents={this.state.agents}
        agentColors={agentColors}
        tipText={this.state.tipText}
        onMouseDown={this.handleMouseDownOnEnvironment.bind(this)}
        onMouseUp={this.handleMouseUpOnEnvironment.bind(this)}
        onMouseOver={this.handleMouseOverOnEnvironment.bind(this)}
        toggle={this.state.toggle}
        traces={this.state.configFinished ? algorithm.traces : null}
        curStep={this.state.configFinished ? this.state.curStep : 0}
        Traces={
          this.state.configFinished ? (
            <Traces 
              width={this.state.environment.get(0).size * 40} 
              height={this.state.environment.size * 40} 
              traces={algorithm.traces}
              agents={this.agents}
              step={this.state.curStep}
              agentColors={agentColors}
            />
          )
          : null
        }
      />
    ) : null;

    const leftBar = (
      <Hammer onSwipe={this.handleLeftBarSwipe.bind(this)}>
        <div className="leftBar">
          <div className={'hidden ' + this.state.agentBar_class}>
            {this.state.agents.map((agent, index) => (
              <div data-id={index} 
                className="agentBlock" 
                key={index} 
                onClick={this.handleLeftBarAgentClick.bind(this)}
              >
                <div className="agent" style={{background: agent.hidden ? '#8585ad' : agentColors[agent.id]}}>
                </div>
                <p className={agent.hidden ? ' light' : ''}>agent {index+1}</p>
              </div>
            ))}
          </div>
          <div id="regionBar" className={'hidden ' + this.state.regionBar_class}>
            {this.state.regions.map(this.constructRegionSketch.bind(this))}
          </div>
        </div>
      </Hammer>
    );

    const rightBar = (
      <div id="rightBar">
        <div className={`btn ${this.state.btn_runOne_class}`} onClick={this.runOneStep.bind(this)}>
          RUN 1 STEP
        </div>
        <div className={`btn ${this.state.btn_runMuti_class}`} onClick={this.runMutiSteps.bind(this)}>
          RUN <input type="text" ref={input => this.stepsInput = input}/> STEPS
        </div>
        <div className={`btn ${this.state.btn_save_class}`} onClick={() => this.setState({show_savePopUp: true})}>
          SAVE
        </div>
        <div 
          id="btn-finished" 
          className={`btn ${this.state.btn_finished_class}`} 
          onClick={this.configFinished.bind(this)}
        >
          FINISHED
        </div>
      </div>
    );

    const moreBar = (
      <div id="moreBar" className={this.state.moreBar_class}>
        <div className={'content ' + (this.state.content_toggle === 1 ? 'selected' : '')}>
          <p>Enter the size:</p>
          <div>
            <span>width:</span>
            <input type="text" ref={(input) => { this.widthInput = input; }} onChange={this.handleEnterSize.bind(this)}/>
            <div className="clearFloat"></div>
          </div>
          <div>
            <span>height:</span>
            <input type="text" ref={(input) => { this.heightInput = input; }} onChange={this.handleEnterSize.bind(this)}/>
            <div className="clearFloat"></div>
          </div>
        </div>
        <div className="hr"></div>
        <div className="toggle" onClick={
          () => {
            if (this.state.configFinished) return;
            
            this.setState({moreBar_class: this.state.moreBar_class !== 'show' ? 'show' : 'hide'});
            this.setState({content_toggle: 0});
            this.widthInput.value = '';
            this.heightInput.value = '';
            this.fileInput.value = '';
            this.fileResult = null;
          }
        }></div>
        <div className={'content ' + (this.state.content_toggle === 2 ? 'selected' : '')}>
          <p>Read from file:</p>
          <input type="file" id = "fileInput" ref={(input) => { this.fileInput = input;}} onChange={this.handleSelectFile.bind(this)}/>
        </div>
        <div className={'btn ' + (this.state.content_toggle !== 0 ? 'selected' : '')} onClick={this.generateEnvironment.bind(this)}>GENERATE</div>
      </div>
    );
    
    const graph = (
      <Graph toggle={this.state.toggle}/>
    );

    const savePopUp = (
      <div className={"save-popup " + (this.state.show_savePopUp ? (this.state.show_savePopUp === 'init' ? '' : 'show') : "hide")}>
        {/*<div>
          <div>Name:</div>
          <input type="text" ref={input => this.nameInput = input}/>
        </div>*/}
        <div>
          <div>Description:</div>
          <textarea type="text" ref={input => this.descriptionInput = input}/>
        </div>
        <div className="btn" onClick={this.saveRun.bind(this)}>
          SAVE
        </div>
      </div>
    );

    return (
      <div id="Game">
        {leftBar}
        {background}
        {environment}
        {rightBar}
        {graph}
        {moreBar}
        {savePopUp}
      </div>
    )
  }
}

// ReactDOM.render(
//   <Game/>,
//   document.getElementById('container')
// );

//update Immutable.js list of lists
Immutable.List.prototype.update = function (row, column, value){
  if(this.size == 0) return;
  return this.set(row, this.get(row).set(column, value))
}

// setTimeout(() => {
//   document.getElementsByClassName('leftBar')[0].style.left = window.innerWidth / 2 + 'px';
// }, 2000);

export {Game};