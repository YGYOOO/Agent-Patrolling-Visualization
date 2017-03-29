import React from 'react';
import AppBar from 'material-ui/AppBar';
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import DatePicker from 'material-ui/DatePicker';
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton';
import Snackbar from 'material-ui/Snackbar';
import IconButton from 'material-ui/IconButton';
import ActionSettingsBackupRestore from 'material-ui/svg-icons/action/settings-backup-restore';

import {$f} from '../fn'

class History extends React.Component {
  constructor() {
    super();
    this.getRuns({start: 0 ,end: new Date().getTime()});
  }

  state = {
    runs: [],
    inputReminder_text: '',
  }

  getRuns({start, end, description}) {
    let url;
    if (description) {
      url = `/run?description=${description}`;
    } else if ((start || start == 0) && end) {
      url = `/run?start=${start}&end=${end}`
    }
    let obj = {
      method: 'get',
      url,
    };
    $f.ajax(obj)
      .then((result) => {
        result = JSON.parse(result);
        this.setState({runs: result.result});
      })
      .catch((err) => {
        console.log(err);
      });
  }

  handleClickOnSearch() {
    let start = new Date(this.startDateInput.state.date).getTime();
    let end = new Date(this.endDateInput.state.date).getTime();
    let description = this.descriptionInput.input.value;
    if (!description) {
      if (!start && !end) {
        this.getRuns({start: 0, end: new Date().getTime()});
      } else if (!start || !end) {
        let reminder = 'Please enter both start date and end date';
        this.setState({inputReminder_text: reminder});
      } else if (start > end) {
        let reminder = 'The start date should comes before the end date';
        this.setState({inputReminder_text: reminder});
      } else {
        this.getRuns({start, end});
      }
      return;
    } else {
      this.getRuns({description});
    }
    // this.getRuns(start, end);
  }

  handleDescriptionChange() {
    this.startDateInput.refs.input.input.value = '';
    this.endDateInput.refs.input.input.value = '';
    this.startDateInput.state.date = undefined;
    this.endDateInput.state.date = undefined;
  }

  handleDateChange() {
    this.descriptionInput.input.value = '';
  }

  render() {
    const runList = this.state.runs.map((run, index) => {
      let regions = run.regions.map((region, index) => {
        let coordinates = region.coordinates.map((square) => {
          return `(${square.row}, ${square.column})`;
        });
        let agents = region.agents.map((agent, index) => {
          let trace = agent.trace.map((square) => {
            return `(${square.row}, ${square.column})`;
          });

          return (
            <div key={index} >
              <div>
                {`agent ${agent.agent + 1}:`}
              </div>
              <div className="indent">
                {`trace: ${trace.join(', ')}`}
              </div>
            </div>
          );
        });

        return (  
          <div key={index}>
            <div>
              {`region ${region.region + 1}:`}
            </div>
            <div className="indent">
              <div>
                {`coordinates: ${coordinates.join(', ')}`}
              </div>
              {agents}
            </div>
            <div className="empty-line"></div>
          </div>
        );
      });

      let content = (
        <div className="runList" key={index}>
          <div>
            {`Environment: ${run.environment[0].length} X ${run.environment.length}`}
          </div>
          <div>
            Regions:
          </div>
          <div className="indent">
            {regions}
          </div>
        </div>
      );
      
      return (
        <Card key={index}>
          <CardHeader
            title={new Date(run.id).toDateString()}
            subtitle={run.description}
            actAsExpander={true}
            showExpandableButton={true}
          />
          <CardText expandable={true}>
            {content}
          </CardText>
        </Card>
      );
    });

    return (
      <div id="history">
        <AppBar
          iconElementLeft={<IconButton><ActionSettingsBackupRestore/></IconButton>}
          title="History Runs"
        />
        <div className="filter">
          <DatePicker 
            hintText="Start Date" 
            mode="landscape" 
            ref={input => this.startDateInput = input}
            onChange={this.handleDateChange.bind(this)}/>
          <DatePicker 
            hintText="End Date" 
            mode="landscape"
            ref={input => this.endDateInput = input}
            onChange={this.handleDateChange.bind(this)}/>
          <TextField 
            hintText="Description"
            ref={input => this.descriptionInput = input}
            onChange={this.handleDescriptionChange.bind(this)}/>
          <RaisedButton 
            label="Search" 
            primary={true} 
            onClick={this.handleClickOnSearch.bind(this)}/>
        </div>
        <div className="run-list">
          {runList}
        </div>
        <Snackbar
          open={this.state.inputReminder_text ? true : false}
          message={this.state.inputReminder_text}
          autoHideDuration={4000}
          onRequestClose={() => {
            this.setState({inputReminder_text: ''});
          }}
        />
      </div>
    );
  }
}

export {History};