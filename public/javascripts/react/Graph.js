import React from 'react';
import {agentColors} from './agentColors';
import IconButton from 'material-ui/IconButton';
import ActionCode from 'material-ui/svg-icons/action/code';

class Graph extends React.Component {
  constructor() {
    super();
    this.state = {
      hidden: false
    }
  }

  render() {
    const targets = this.props.targets,
        steps = this.props.steps,
        curStep = this.props.curStep > steps ? steps : this.props.curStep,
        curRegion = this.props.curRegion,
        algorithm = this.props.algorithm;

    let agentsIds = [];
    if (curRegion > -1) {
      this.props.agents.forEach((agent, index) => {
        let isInRegion = this.props.regions.get(curRegion).some((square) => {
          return square.row === agent.row && square.column === agent.column;
        });
        if (isInRegion) agentsIds.push(agent.id.toString());
      })
    }

    let currrentTar = {}
    Object.keys(targets).forEach((key) => {
      if (agentsIds.indexOf(key) > -1) currrentTar[key] = targets[key];
    });

    const targetList = 
    this.props.historyTargetLists 
    && curRegion  > -1 
    && this.props.historyTargetLists[curRegion][curStep]? (
      this.props.historyTargetLists[curRegion][curStep].filter((tar) => {
        if (algorithm == 3 || algorithm == 4) return true;
        return  Object.keys(currrentTar).every((key) => {
          return currrentTar[key][curStep].row != tar.row || currrentTar[key][curStep].column != tar.column;
        });
      }).map((target, index) => {
        return (
          <div className="target" key={index}>
            {`(${target.column + 1}, ${target.row + 1})`}
          </div>
        );
      })
    ) : null;
    
    const curTargets = Object.keys(currrentTar).length > 0 ? Object.keys(currrentTar).map((key, index) => {
      return currrentTar[key][curStep] ? (
        <div key={index}>
          <div className="curTargets-agent">
            {'Agent ' + key}
          </div>
          <div className="target curTarget">
            {`(${targets[key][curStep].column + 1}, ${targets[key][curStep].row + 1})`}
          </div>
        </div>
      ) : null;
    }) : null;

    return (
      <div id="graph" style={{display: (this.props.toggle === -1 ? 'none' : 'block')}}>
        <canvas className="graphView" width="1000px" height="800px"></canvas>
        <div className="info hidden">
          <div>Node :</div>
          <div>Current agents:</div>
          <div className="agents current-agents">
          </div>
          <div>Visited agents:</div>
          <div className="agents visited-agents">
          </div>
        </div>
        <div className="info">
          <div>
            Target list
            <IconButton id="toggle" onClick={() => this.setState({hidden: !this.state.hidden})}>
              <ActionCode color={'white'} hoverColor={'#BDBDBD'}/>
            </IconButton>
          </div>
          <div className={"targetList" + (this.state.hidden ? " hidden" : "")}>
            {targetList}
          </div>
          <div className={"curTargets" + (this.state.hidden ? " hidden" : "")}>
            <div>
              <div>Agent</div>
              <div>Current target</div>
            </div>
            <div>
              {curTargets}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export {Graph};