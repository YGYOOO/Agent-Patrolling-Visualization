import React from 'react';
import Immutable from 'immutable';
import Hammer from 'react-hammerjs';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

import {$f} from '../fn.js'
import {Board, initAgentsColor} from './Board';
import {RunningEnvironment} from '../RunningEnvironment'
import {graph} from '../graphview/graph';
import {Traces} from './Traces';
import {Graph} from './Graph';
import {agentColors} from './agentColors';
import {readFile} from '../ReadingConfiguration'
import Popup from './Popup.js'

const OPEN = 'open',
      OBSTACLE = 'obstacle',
      AGENT = 'agent',
      BlANK  = '';

let agentId = 0;
let algorithm = {};

class Visualization extends React.Component {
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
      selector_algorithm_class: 'hidden',
      selector_disabled: false,
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
      selected_algorithm: 0, //0: free-form; 1: constrained-3; 2: constrained-4
      alert: '',
      steps: 1000
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

  componentDidMount() {
    setTimeout(() => this.setState({btn_finished_class: 'show'}), 450);
    setTimeout(() => this.setState({selector_algorithm_class: 'show'}), 300);
  }

  getAgent(agents, id) {
    return agents.filter((agent) => {
      return agent.id == id;
    }).get(0);
  }

  setAgent(agents, id, value) {
    return agents.map((agent) => {
      if (agent.id == id) return value;
      return agent;
    });
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
    let agents = this.state.agents;
    let isEnd = true;
    algorithm.traces.forEach((trace, id) => {
      if(!trace[curStep]) return;
      isEnd = false;

      let curPosition = trace[curStep],
          row = curPosition.row,
          column = curPosition.column;
      let move = judgeMove($f.get(agents, id), {row, column});

      if(document.getElementById('agent-' + id)) {
        document.getElementById('agent-' + id).classList.add(move);
      }

      let hidden = $f.get(agents, id).hidden;
      agents = $f.set(agents, id, {id, row, column, hidden});
    });
    
    if  (isEnd) {
      this.setState({btn_runOne_class: 'hide'});
      setTimeout(() => this.setState({btn_runOne_class: 'hidden'}), 490);
      this.setState({btn_runMuti_class: 'hide'});
      setTimeout(() => this.setState({btn_runMuti_class: 'hidden'}), 490);

      setTimeout(() => this.setState({btn_save_class: 'show'}), 700);
      return;
    }
    this.setState({curStep});

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
      this.setState({alert: 'Please enter a positive integer'});
      return;
    }

    if (!e.target.classList.contains('btn') || !this.stepsInput.value) return;
    let total = parseInt(this.stepsInput.value);

   let curStep = this.state.curStep + total;
    this.setState({curStep});
    let agents = this.state.agents;

    algorithm.traces.forEach((trace, id) => {
      let step = curStep;
      if(!trace[step]) step = trace.length - 1;

      let curPosition = trace[step],
          row = curPosition.row,
          column = curPosition.column;
      
      let hidden = $f.get(agents, id).hidden;
      agents = $f.set(agents, id, {id, row, column, hidden});
    });
    

    this.agents = agents;
    this.setState({agents});
    
    graph(this.state.regions.get(this.state.curRegion), algorithm.traces, curStep);

    let isEnd = true;
    algorithm.traces.forEach((trace, id) => {
      if(trace[curStep]) isEnd = false;
    });
    
    if  (isEnd) {
      this.setState({btn_runOne_class: 'hide'});
      setTimeout(() => this.setState({btn_runOne_class: 'hidden'}), 490);
      this.setState({btn_runMuti_class: 'hide'});
      setTimeout(() => this.setState({btn_runMuti_class: 'hidden'}), 490);

      setTimeout(() => this.setState({btn_save_class: 'show'}), 700);
      return;
    }
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
      this.addAgent.call(this, target.getAttribute('data-row'), target.getAttribute('data-column'));
    } else {
      this.setState({regions: this.state.regions.push([])}, () => {
        let legal = this.setOpen(target);
        if (legal === false) this.setState({regions: this.state.regions.pop()});
      });
    }
  }

  handleMouseOverOnEnvironment(e) {
    if(this.state.configFinished) return;

    if(this.state.mouseDownOnEnvir) {
      this.setOpen(e.target);
    }
  }

  addAgent(row, column) {
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
      if(illegal) return false;
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
      <div key={index} className="sketchBlock" data-regionID={region.id}>
        <div 
          style={{width, height}} 
          className={'sketch ' + (this.state.toggle === index ? 'selected' : '')}
          onClick={this.handleSketchClick.bind(this, index)}
        >
          {squares}
          <div className={"regionID"}>
            {region.id}
          </div>
        </div>
        {/*{deleter}*/}
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
    let legal = $f.varify(this.state.selected_algorithm, this.state.agents.toArray(), this.state.regions.toArray(), (err) => {
      if (err) {
        this.setState({alert: err});
      }
    });
    if (!legal) return;

    legal = true;
    this.state.regions.forEach((region) => {
      let finded = this.state.agents.find((agent) => {
        return region.find((square) => {
          return square.row == agent.row && square.column == agent.column;
        });
      });

      if (!finded) legal = false;
    });
    if (!legal) return this.setState({alert: 'There are some regions that have no agents!'});

    this.setState({selector_disabled: true});
    // this.setState({selector_algorithm_class: 'hide'})
    // setTimeout(() => this.setState({selector_algorithm_class: 'hidden'}), 500);
    setTimeout(() => this.setState({btn_finished_class: 'hide'}), 150);
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
    // console.log(this.state.regions.toArray());
    // console.log(this.state.agents.toJS());
    algorithm.addRegions(this.state.regions.toObject());
    this.state.agents.forEach((agent) => {
      algorithm.addAgent(agent.id, {column: agent.column, row: agent.row})
    });

    switch (this.state.selected_algorithm) {
      case 0:
        algorithm.move();
        break;
      case 3:
        algorithm.move3();
        break;
      case 4:
        algorithm.move4();
    }
    this.setState({configFinished: true});
    if (this.state.moreBar_class.indexOf('show') > -1) this.setState({moreBar_class: 'hide'});
    this.setState({steps: algorithm.steps});
    console.log(algorithm);
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

    readFile(this.fileInput.files, (result, err) => {
      if (result) this.fileResult = result;
      else if (err) this.setState({alert: err});
    });

    this.setState({selector_disabled: true});
  }

  generateEnvironment() {
    this.setState({regions: Immutable.List([])});
    let height, width;
    if (this.fileResult) {
      height = parseInt(this.fileResult.height),
      width = parseInt(this.fileResult.width);

      const regions = Immutable.List(this.fileResult.regions);
      this.setState({regions});

      let agentId = 0;
      let agents = this.fileResult.regions.reduce((pre, cur) => {
        return pre.concat(cur.agents);
      }, []);

      agents = agents.map((agent) => {
        return {
          id: Number(agent.id),
          row: Number(agent.row),
          column: Number(agent.column)
        }
      });

      agents = Immutable.List(agents);
      this.setState({agents});

      if (!this.checkEnvironment(agents, regions, width, height)){
        this.setState({regions: Immutable.List([])});
        this.setState({agents: Immutable.List([])});
        this.setState({environment: null});
        return;
      }

    } else if (this.heightInput.value && this.widthInput.value) {
      height = this.heightInput.value;
      width = this.widthInput.value;
      if (!$f.isPositiveInterger(height) || !$f.isPositiveInterger(width)) {
        this.setState({alert: 'Please enter an positive integer'});
        return;
      }
      height = Number(height);
      width = Number(width);
    } else {
      this.setState({alert: 'Please set the configration first'});
      return;
    }
    if ( height <=0 || width <= 0) return this.setState({alert: 'Please check the configration'});

    // setTimeout(() => this.setState({btn_finished_class: 'show'}), 950);
    // setTimeout(() => this.setState({selector_algorithm_class: 'show'}), 800);

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

    setTimeout(() => {this.configFinished()}, 500);
  }

  //agent is not in any region; region is out of environment; joint regions; discrete regions;
  checkEnvironment(agents, regions, width, height) {
    agents = agents.toArray();
    regions = regions.toArray();

    let alerts = [], valid = true;
    let agentsOutOfRegion = [];
    regions.forEach((region) => {
      region.agents.forEach((agent) => {
        let exists = region.some((square) => {
          return agent.row == square.row && agent.column == square.column;
        });
        if (!exists) agentsOutOfRegion.push(agent);
      });
    });
    // agents.forEach((agent) => {
    //   let inRegion = regions.some((region) => {
    //     return region.some((square) => {
    //       return agent.row == square.row && agent.column == square.column;
    //     });
    //   });

    //   if (!inRegion) agentsOutOfRegion.push(agent);
    // });

    let regionsOutOfEnv = [];
    regions.forEach((region) => {
      let isOutOf = region.some((square) => {
        return square.row + 1 > height || square.row < 0 || square.column + 1 > width || square.column < 0;
      });
      if (isOutOf) regionsOutOfEnv.push(region);
    });

    let jointRegions = [];
    regions.forEach((region1, index1) => {
      regions.forEach((region2, index2) => {
        if (index1 === index2) return false;

        let joint =  region1.some((square1) => {
          return region2.some((square2) => {
            let join = square1.row === square2.row && square1.column === square2.column || $f.isAdjacent(square1, square2);
            return join;
          });
        });
        if (joint) jointRegions = [region1, region2];
      });
    });

    let isolateSpaces = [];
    regions.forEach((region) => {
      region.forEach((square1, index) => {
        let notIsolate = region.some((square2, index) => {
          return $f.isAdjacent(square1, square2);
        });
        if (!notIsolate) isolateSpaces.push({square: square1, regionId: region.id});
      });
    });

    if (agentsOutOfRegion.length > 0) {
      if (agentsOutOfRegion.length === 1)
        alerts.push('Agent ' + agentsOutOfRegion[0].id + ' is out of the region');
      else {
        let agents = agentsOutOfRegion.map((agent) => {
          return 'agent ' + agent.id;
        });
        agents = agents.join(', ').replace(/a/, 'A');
        alerts.push(agents + ' are out of the region');
      }
      valid = false;
    }

    if (regionsOutOfEnv.length > 0) {
      if (regionsOutOfEnv.length === 1)
        alerts.push('Region ' + regionsOutOfEnv[0].id + ' is out of the environment');
      else {
        let regions = regionsOutOfEnv.map((region) => {
          return 'region ' + region.id;
        });
        regions = regions.join(', ').replace(/a/, 'R');
        alerts.push(regions + ' are out of the environment');
      }
      valid = false;
    }

    if (jointRegions.length > 0) {
      alerts.push(`Region ${jointRegions[1].id} and region ${jointRegions[0].id} are connected`);
      valid = false;
    }

    if (isolateSpaces.length > 0) {
      let space = isolateSpaces[0];
      alerts.push(`Open space (${space.square.column + 1}, ${space.square.row + 1}) in region ${space.regionId} is isolate`);
      valid = false;
    }

    let legal = $f.varify(this.state.selected_algorithm, agents, regions, (err) => {
      if (err) {
        alerts.push(err);
      }
    });
    if (!legal) valid = false;

    let regionsWithNoAgent = [];
    regionsWithNoAgent = regions.filter((region) => {
      return region.agents.length < 1;
    });

    if (regionsWithNoAgent.length > 0) {
      let str = regionsWithNoAgent.map((region) => {
        return 'region ' + region.id;
      }).join(', ').replace(/r/, 'R') + ' do not have agent';
      alerts.push(str);
      valid = false;
    }

    if (alerts.length > 0) {
      this.setState({alert: alerts.join('. ')});
    }

    return valid;
  }

  saveRun() {
    this.setState({show_savePopUp: false});
    let regions = Object.keys(algorithm.regions).map((key) => {
      let agents = [];
      let region = algorithm.regions[key];
      algorithm.traces.forEach((trace, index) => {
        let finded = region.find((square, index) => {
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
        region: region.id,
        coordinates: region,
        agents,
      };
    });

    let body = {
      id: new Date().getTime(),
      environment: algorithm.block,
      regions,
      description: this.descriptionInput.value,
      algorithm: this.state.selected_algorithm == 0 ? 
      'free-form' : 'constrained-' + this.state.selected_algorithm,
      steps: this.state.curStep
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
                <p className={agent.hidden ? ' light' : ''}>agent {agent.id}</p>
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
        <SelectField 
          id="selector-algorithm" 
          className={`selector ${this.state.selector_algorithm_class}`} 
          floatingLabelText="Algorithm"
          value={this.state.selected_algorithm}
          onChange={(event, index, val) => this.setState({selected_algorithm: val})}
          disabled={this.state.selector_disabled}
        >
          <MenuItem value={0} primaryText="free-form"/>
          <MenuItem value={3} primaryText="constrained-3" />
          <MenuItem value={4} primaryText="constrained-4" />
        </SelectField>
        <div 
          id="btn-finished" 
          className={`btn ${this.state.btn_finished_class}`} 
          onClick={this.configFinished.bind(this)}
        >
          FINISHED
        </div>
        <div className={`btn ${this.state.btn_runOne_class}`} onClick={this.runOneStep.bind(this)}>
          RUN 1 STEP
        </div>
        <div className={`btn ${this.state.btn_runMuti_class}`} onClick={this.runMutiSteps.bind(this)}>
          RUN <input type="text" ref={input => this.stepsInput = input}/> STEPS
        </div>
        <div className={`btn ${this.state.btn_save_class}`} onClick={() => this.setState({show_savePopUp: true})}>
          SAVE
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
          <input 
            type="file" 
            id = "fileInput" 
            ref={(input) => { this.fileInput = input;}} 
            onClick={() => {this.fileInput.value = null;}}
            onChange={this.handleSelectFile.bind(this)}/>
        </div>
        <div className={'btn ' + (this.state.content_toggle !== 0 ? 'selected' : '')} onClick={this.generateEnvironment.bind(this)}>GENERATE</div>
      </div>
    );
    
    const graph = this.state.configFinished ? (
      <Graph 
        toggle={this.state.toggle}
        historyTargetLists={algorithm.historyTargetLists}
        targets={algorithm.targets}
        curRegion={this.state.curRegion}
        regions={this.state.regions}
        curStep={this.state.curStep}
        agents={this.state.agents}
        algorithm={this.state.selected_algorithm}
        steps={this.state.steps}
      />
    ) : null;

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
        <Popup
          alert={this.state.alert}
          handleClose={() => this.setState({alert: ''})}
        />
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

export {Visualization};

// const result = runs.filter((run) => {
//   let {startTime, endTime, envSize, regionNum, steps, description} = req.query;

//   if (
//     ((run.environment.length == evnSize.split(',')[1] && run.environment[0].length == evnSize.split(',')[0]) || envSize == null) 
//     &&
//     ((startTime < run.id && endTime > run.id) || (startTime == null && endTime == null))
//     &&
//     ((run.description.indexOf(description) > -1) || description == null)
// //  && 以下同理
//   ) {
//     return true;
//   }

//   return false;
// });