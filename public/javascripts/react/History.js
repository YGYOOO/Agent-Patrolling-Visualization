import React from 'react';
import AppBar from 'material-ui/AppBar';
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import DatePicker from 'material-ui/DatePicker';
import TimePicker from 'material-ui/TimePicker';
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton';
import Snackbar from 'material-ui/Snackbar';
import IconButton from 'material-ui/IconButton';
import ActionSettingsBackupRestore from 'material-ui/svg-icons/action/settings-backup-restore';

import {$f} from '../fn'
import Popup from './Popup.js'

class History extends React.Component {
  constructor() {
    super();
    this.getRuns({start: 0 ,end: new Date().getTime()});
  }

  state = {
    runs: [],
    inputReminder_text: '',
    alert: '',
    startTime: null,
    endTime: null,
  }

  getRuns({start, end, envSize, regionNum, steps, description}) {
    let url = '/runs' + $f.objToQuery(arguments[0]);
    console.log(url)
    let obj = {
      method: 'get',
      url
    };
    $f.ajax(obj)
      .then((result) => {
        result = JSON.parse(result);  
        this.setState({runs: result});
      })
      .catch((err) => {
        console.log(err);
      });
  }

  handleClickOnSearch() {

    const startTime = new Date(this.startTimeInput.state.time);
    const startTimestamp = startTime.getTime() - new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate(), 0).getTime();
    const startDate = new Date(this.startDateInput.state.date);
    const startDateTimestamp = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0).getTime();

    const endTime = new Date(this.endTimeInput.state.time);
    const endTimestamp = endTime.getTime() - new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate(), 0).getTime();
    const endDate = new Date(this.endDateInput.state.date);
    const endDateTimestamp = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 0).getTime();

    const start = startDateTimestamp + startTimestamp || '';
    const end = endDateTimestamp + endTimestamp || '';
    const description = this.descriptionInput.input.value;
    const width = this.widthInput.input.value;
    const height = this.heightInput.input.value;
    const regionNum = this.regionNumInput.input.value;
    const steps = this.stepsInput.input.value;

    if (!$f.isNull(start) && $f.isNull(end)) return this.setState({alert: 'Please enter the end date and time'});
    
    if ($f.isNull(start) && !$f.isNull(end)) return this.setState({alert: 'Please enter the start date and time'});

    if (start > end) return this.setState({alert: 'The start date should comes before the end date'});

    if (!$f.isPositiveInterger(width, true)) return this.setState({alert: 'Width should be a positive integer'});

    if (!$f.isPositiveInterger(height, true)) return this.setState({alert: 'Height should be a positive integer'});

    if (!$f.isPositiveInterger(regionNum, true)) return this.setState({alert: 'Number of Regions should be a positive integer'});
    
    if (!$f.isPositiveInterger(steps, true)) return this.setState({alert: 'Steps should be a positive integer'});
    
    if ($f.isNull(width) && !$f.isNull(height)) return this.setState({alert: 'Please enter width'});

    if (!$f.isNull(width) && $f.isNull(height)) return this.setState({alert: 'Please enter height'});

    const envSize = $f.isNull(width) ? null : width + ',' + height;
    this.getRuns({
      start,
      end,
      description,
      envSize,
      regionNum,
      steps
    });


    // if (!description) {
    //   if (!start && !end) {
    //     this.getRuns({start: 0, end: new Date().getTime()});
    //   } else if (!start || !end) {
    //     let reminder = 'Please enter both start date and end date';
    //     this.setState({inputReminder_text: reminder});
    //   } else if (start > end) {
    //     let reminder = 'The start date should comes before the end date';
    //     this.setState({inputReminder_text: reminder});
    //   } else {
    //     this.getRuns({start, end});
    //   }
    //   return;
    // } else {
    //   this.getRuns({description});
    // }
    // this.getRuns(start, end);
  }

  handleDescriptionChange() {
    // this.startDateInput.refs.input.input.value = '';
    // this.endDateInput.refs.input.input.value = '';
    // this.startDateInput.state.date = undefined;
    // this.endDateInput.state.date = undefined;
  }

  handleStartDateChange() {
    const now = new Date();
    this.setState({startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 1)});
  }

  handleEndDateChange() {
    const now = new Date();
    this.setState({endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 1)});
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
                {`agent ${agent.agent}:`}
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
              {`region ${region.region}:`}
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
            {run.algorithm ? `Algorithm: ${run.algorithm}` : null}
          </div>
          <div>
            {run.steps ? `Steps: ${run.steps}` : null}
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
          <CardText expandable={true} className='run-content'>
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
        <div className="filters">
          <div>
            <DatePicker 
              className="filter"
              hintText="Start Date" 
              mode="landscape" 
              ref={input => this.startDateInput = input}
              onChange={this.handleStartDateChange.bind(this)}/>
            <TimePicker
              className="filter"
              hintText="Start Time"
              ref={input => this.startTimeInput = input}
              value={this.state.startTime}
            />
            <DatePicker 
              className="filter"
              hintText="End Date" 
              mode="landscape"
              ref={input => this.endDateInput = input}
              onChange={this.handleEndDateChange.bind(this)}/>
            <TimePicker
              className="filter"
              hintText="End Time"
              ref={input => this.endTimeInput = input}
              value={this.state.endTime}
            />
          </div>
          <div>
            <div>
              <TextField 
                className="filter"
                className="envSize"
                hintText="Width"
                ref={input => this.widthInput = input}
                onChange={this.handleDescriptionChange.bind(this)}/>
              <span>X</span>
              <TextField 
                className="filter"
                className="envSize"
                hintText="Height"
                ref={input => this.heightInput = input}
                onChange={this.handleDescriptionChange.bind(this)}/>
            </div>
            <TextField 
              className="filter"
              hintText="Number of Regions"
              ref={input => this.regionNumInput = input}
              onChange={this.handleDescriptionChange.bind(this)}/>
            <TextField 
              className="filter"
              hintText="Steps"
              ref={input => this.stepsInput = input}
              onChange={this.handleDescriptionChange.bind(this)}/>
            <TextField 
              className="filter"
              hintText="Description"
              ref={input => this.descriptionInput = input}
              onChange={this.handleDescriptionChange.bind(this)}/>
          </div>
          <RaisedButton 
            className="search"
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
        <Popup
          alert={this.state.alert}
          handleClose={() => this.setState({alert: ''})}
          />
      </div>
    );
  }
}

export {History};