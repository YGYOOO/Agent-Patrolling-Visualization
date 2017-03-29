import React from 'react';
import {agentColors} from './agentColors';

class Graph extends React.Component {

  render() {
    return (
      <div id="graph" style={{display: (this.props.toggle === -1 ? 'none' : 'block')}}>
        <canvas className="graphView" width="800px" height="800px"></canvas>
        <div className="info">
          <div>Node :</div>
          <div>Current agents:</div>
          <div className="agents current-agents">
          </div>
          <div>Visited agents:</div>
          <div className="agents visited-agents">
          </div>
        </div>
      </div>
    );
  }
}

export {Graph};