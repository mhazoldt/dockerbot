import React, { Component } from 'react';
import TwitchStream from './TwitchStream.js';
import StreamsContainer from './StreamsContainer.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'
import '../styles/DockApp.css';
const remote = require('electron').remote;

const { ipcRenderer } = require('electron');


let dockComponent;
const maxCams = 4;

const routes = {};

routes['dock-state-reply'] = (msg) => {
  const currentColumn = dockComponent.state.column;
  const newColumn = msg.data.column;
  const columnChanged = newColumn !== currentColumn;

  if(columnChanged && newColumn) {
    remote.getCurrentWindow().setSize(410, 1210);
  } else if(columnChanged) {
    remote.getCurrentWindow().setSize(1610, 310);
  }

  dockComponent.setState(msg.data)
}

routes['new-dock'] = (msg) => {
  let dock = dockComponent.state.dock;
  dock.push(msg.data);

  dockComponent.setState({ dock })
}

routes['undock-user'] = (msg) => {
  const currentDockedUsers = dockComponent.state.dock.slice(0);
  const userIndex = currentDockedUsers.indexOf(msg.data);

  if(userIndex > -1) {
    currentDockedUsers.splice(userIndex, 1);
    dockComponent.setState({ dock: currentDockedUsers });
  }
}

ipcRenderer.on('msg-dock', (event, msg) => {
  routes[msg.type](msg);
})

class App extends Component {
  constructor() {
    super();

    this.state = {
      dock: [],
      placeholders: false,
      column: false,
      usernames: false,
    }

    dockComponent = this;
  }

  componentDidMount() {
    ipcRenderer.send('msg-main-primary', {
      type: 'dock-state-request',
      data: null,
    });
  }

  renderDock(dock, renderPlaceholders) {
    if(renderPlaceholders) {
      while(dock.length < maxCams) {
        dock.push(null);
      }
    }

    return dock.map((user, index) => {
      return user
        ? <TwitchStream key={user} streamHeight={300} streamWidth={400} channel={user} usernames={this.state.usernames} />
        : <div key={index} className="placeholder" style={{border: '1px solid black'}}>
            <div style={{border: '0px solid red'}}><FontAwesomeIcon icon={faUser} style={{color: 'white'}} /></div>
            <div style={{color: 'white', textAlign: 'center'}}>!dock to dock your stream here</div>
          </div>;
    })
  }

  render() {
    let dock = this.state.dock.slice(0);
    let renderPlaceholders = this.state.placeholders

    return (
      <div style={{paddingTop: '5px'}}>
        <StreamsContainer column={this.state.column}>
          {this.renderDock(dock, renderPlaceholders)}
        </StreamsContainer>
      </div>
    );
  }
}

export default App;