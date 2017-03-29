import React from 'react';

class Tip extends React.Component {
  render() {
    return (
      <div className="tip">
        {this.props.text}
      </div>
    );
  }
}

export {Tip};