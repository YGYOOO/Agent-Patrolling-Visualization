import React from 'react';

class Traces extends React.Component {

  componentWillUpdate(nextProps, nextState) {
    if (this.props.agents !== nextProps.agents) {
      this.animate = 'movePath';
    } else {
      this.animate = '';
    }
  }


  renderLines(traces) {
    let lines = [];
    traces.forEach((trace, index) => {
      if (this.props.agents && this.props.agents.get(index).hidden) return;
      lines.push(this.renderLine(trace, index));
    });

    return lines;
  }

  renderLine(trace, index1) {
    /*return (
      <path 
        key={index1}
        d={trace.map((square, index) => {
          if (index >= this.props.step) return;

          let points = `M${square.column * 40 + 20} ${square.row * 40 + 20} ` +
            `L ${trace[index+1].column * 40 + 20} ${trace[index+1].row * 40 + 20}`;
          return (
            <path 
              key={index}
              d={points}
              style={{fill:'none', stroke:this.props.agentColors[index1], strokeWidth:2}}
            />
          );
        })}
        style={{fill:'none', stroke:this.props.agentColors[index1], strokeWidth:2}}
      />
    );*/
    return trace.map((square, index) => {
      if (index >= this.props.step || index >= trace.length - 1) return;

      let points = `M${square.column * 40 + 20} ${square.row * 40 + 20} ` +
        `L ${trace[index+1].column * 40 + 20} ${trace[index+1].row * 40 + 20}`;
      return (
        <path 
          key={index}
          d={points}
          className={(index == this.props.step - 1) ? this.animate : ''}
          style={{fill:'none', stroke:this.props.agentColors[index1], strokeWidth:2}}
        />
      );
    });
  }

  render() {
    return (
      <svg id="traces" height={this.props.height} width={this.props.width}>
        {this.renderLines(this.props.traces)}
      </svg>
    );
  }
}

export {Traces};