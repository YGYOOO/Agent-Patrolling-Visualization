import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import FontIcon from 'material-ui/FontIcon';
import {BottomNavigation, BottomNavigationItem} from 'material-ui/BottomNavigation';
import Paper from 'material-ui/Paper';
import IconLocationOn from 'material-ui/svg-icons/communication/location-on';

import ImageBlurOn from 'material-ui/svg-icons/Image/blur-on';
import ActionHistory from 'material-ui/svg-icons/action/history';

import {Game} from './Game';
import {History} from './History';
import {$f} from '../fn';


class Main extends React.Component {
  constructor() {
    super();
  }

  state = {
    nav: 0,
    show_navbar: false,
  };

  select(index) {
    this.setState({nav: index});
  }

  handleMouseMove(e) {
    if (window.innerHeight - e.pageY < 50) this.setState({show_navbar: true});
    else this.setState({show_navbar: false});
  }

  render() {
    return (
      <MuiThemeProvider>
        <div id="main">
          <div className="a">
            
          </div>
          {this.state.nav === 0 ? <Game/> : null}
          {this.state.nav === 1 ? <History/> : null}
          <Paper 
            className={'navbar ' + (this.state.show_navbar ? 'show ' : '')}
            zDepth={1}>
            <BottomNavigation selectedIndex={this.state.nav}>
              <BottomNavigationItem
                label="Visualizing"
                icon={<ImageBlurOn/>}
                onTouchTap={() => this.select(0)}
              />
              <BottomNavigationItem
                label="History"
                icon={<ActionHistory/>}
                onTouchTap={() => this.select(1)}
              />
            </BottomNavigation>
          </Paper>
          <div 
            id="bottomDetector" 
            className={this.state.show_navbar ? 'wide' : ''}
            onMouseMove={$f.debounce(this.handleMouseMove, 300, this)}>
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

ReactDOM.render(
  <Main/>,
  document.getElementById('container')
);