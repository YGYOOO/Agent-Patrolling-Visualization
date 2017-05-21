import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';

export default class Popup extends React.Component {

  render() {
    const actions = [
      <FlatButton
        label="OK"
        primary={true}
        onTouchTap={this.props.handleClose}
      />,
    ];
    
    return (
      <div>
        {/*<RaisedButton label="Alert" onTouchTap={this.handleOpen} />*/}
        <Dialog
          actions={actions}
          modal={false}
          open={this.props.alert ? true : false}
          onRequestClose={this.props.handleClose}
        >
          {this.props.alert}
        </Dialog>
      </div>
    );
  }
}