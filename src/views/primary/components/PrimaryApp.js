import React, { Component } from 'react';
import Requests from './Requests.js';
import DockUsers from './DockUsers.js';
import ChatbotSettings from './ChatbotSettings.js';
import Card from './Card.js';
import '../styles/PrimaryApp.css';
import '../styles/Checkboxes.css';

const { ipcRenderer } = require('electron');


const maxRequests = 50;
const maxDocked = 4;

let primaryAppComp = null;

ipcRenderer.on('toggle-dock-response', (event, message) => {
  primaryAppComp.setState({ dockOpen: message })
})

const pushDockState = (msg) => {
  let dockState = {
    placeholders: primaryAppComp.state.placeholders,
    usernames: primaryAppComp.state.usernames,
    column: primaryAppComp.state.column,
    dock: primaryAppComp.state.docked,
  }

  if(msg.data) {
    dockState = Object.assign({}, dockState, msg.data);
  }

  ipcRenderer.send('msg-main-dock', {
    type: 'dock-state-reply',
    data: dockState,
  });
}

const msgRoutes = {};

msgRoutes['dock-state-request'] = pushDockState;

msgRoutes['new-dock-request'] = (msg) => {
  primaryAppComp.checkApproval(msg.data);
}

msgRoutes['undock-request'] = (msg) => {
  primaryAppComp.removeDockRequest(msg.data);
  primaryAppComp.removeDockedUser(msg.data);
}

msgRoutes['chatbot-connection-status'] = (msg) => {
  primaryAppComp.chatbotConnectionStatus(msg.data);
}

msgRoutes['chatbot-could-not-connect'] = (msg) => {
  primaryAppComp.chatbotCouldNotConnect(msg.data);
}

msgRoutes['oauth-token'] = (msg) => {
  primaryAppComp.setAuthToken(msg.data);
}

msgRoutes['get-docked-users'] = (msg) => {
  msg.data.docked = primaryAppComp.state.docked
  ipcRenderer.send('return-docked-users', msg);
}

ipcRenderer.on('msg-primary', (event, msg) => {
  msgRoutes[msg.type](msg);
})

const textInputValidations = {};

textInputValidations['chatbotname'] = text => {
  const pattern = /^[a-zA-Z0-9\-_]{1,30}$/;
  return pattern.test(text);
}

textInputValidations['channels'] = text => {

}


class PrimaryApp extends Component {
  constructor() {
    super();

    const prevToken = localStorage.getItem('token');
    const prevChatbotName = localStorage.getItem('chatbotname');
    const prevChannels = localStorage.getItem('channels');

    let prevRequireApproval = localStorage.getItem('requireapproval');
    prevRequireApproval = prevRequireApproval === 'true';

    let prevPlaceholders = localStorage.getItem('placeholders');
    prevPlaceholders = prevPlaceholders === 'true';

    let prevUsernames = localStorage.getItem('usernames');
    prevUsernames = prevUsernames === 'true';

    let prevColumn = localStorage.getItem('column');
    prevColumn = prevColumn === 'true';


    this.state = {
      dockOpen: false,
      chatbotConnected: false,
      textInputs: {
        token: prevToken || '',
        chatbotname: prevChatbotName || '',
        channels: prevChannels || '',
      },
      requireapproval: prevRequireApproval || false,
      placeholders: prevPlaceholders || false,
      usernames: prevUsernames || false,
      column: prevColumn || false,
      docked: [],
      dockRequests: [],
      chatbotCouldNotConnect: false,
      connecting: false,
    }

    this.handleInput = this.handleInput.bind(this)

    this.addDockRequest = this.addDockRequest.bind(this)
    this.removeDockRequest = this.removeDockRequest.bind(this)

    this.addDockedUser = this.addDockedUser.bind(this)
    this.removeDockedUser = this.removeDockedUser.bind(this)

    this.chatbotConnectionStatus = this.chatbotConnectionStatus.bind(this)

    primaryAppComp = this;
  }

  toggleDock() {
    ipcRenderer.send('toggle-dock', 'actual message data');
  }

  handleInput(e) {
    let inputName = e.currentTarget.name;
    let inputValue = e.currentTarget.value;

    const textChange = Object.assign({}, this.state.textInputs, { [inputName]: inputValue });
    this.setState({ textInputs: textChange });
  }

  handleCheckbox(e) {
    let checkboxName = e.currentTarget.name;
    let checked = e.currentTarget.checked;

    localStorage.setItem(checkboxName, checked);
    this.setState({ [checkboxName]: checked });

    if(this.state.dockOpen) pushDockState({
      type: 'dock-state-reply',
      data: { [checkboxName]: checked },
    });
  }

  addDockRequest(newDockRequest) {
    let currentRequests = this.state.dockRequests.slice(0);
    const alreadyPending = currentRequests.includes(newDockRequest);
    const currentDockedUsers = this.state.docked.slice(0);
    const alreadyDocked = currentDockedUsers.includes(newDockRequest);
    const atMax = currentRequests.length >= maxRequests;


    if(!alreadyPending && !alreadyDocked && !atMax) {
      currentRequests.push(newDockRequest);
      this.setState({ dockRequests: currentRequests });
    }
  }

  removeDockRequest(username) {
    const currentRequests = this.state.dockRequests.slice(0);
    const requestIndex = currentRequests.indexOf(username);

    if(requestIndex > -1) {
      currentRequests.splice(requestIndex, 1);
      this.setState({ dockRequests: currentRequests });
    }
  }

  addDockedUser(username) {
    if(!username) return;
    const currentDockedUsers = this.state.docked.slice(0);
    const alreadyDocked = currentDockedUsers.includes(username);
    const atMax = currentDockedUsers.length >= maxDocked;
    const shouldDock = !alreadyDocked && !atMax;

    if(shouldDock) {
      currentDockedUsers.push(username);
      this.setState({ docked: currentDockedUsers });
    }

    if(shouldDock && this.state.chatbotConnected) {
      ipcRenderer.send('join-chat', {
        type: 'new-dock-join-chat',
        data: username
      });
    }

    if (shouldDock && this.state.dockOpen) {
      ipcRenderer.send('msg-main-dock', {
        type: 'new-dock',
        data: username
      });
    }
  }

  removeDockedUser(username) {
    const currentDockedUsers = this.state.docked.slice(0);
    const userIndex = currentDockedUsers.indexOf(username);

    if(userIndex > -1) {
      currentDockedUsers.splice(userIndex, 1);
      this.setState({ docked: currentDockedUsers });
      
    }

    if(userIndex > -1 && this.state.chatbotConnected) {
      ipcRenderer.send('leave-chat', {
        type: 'undock-user-leave-chat',
        data: username
      });
    }

    if (userIndex > -1 && this.state.dockOpen) {
      ipcRenderer.send('msg-main-dock', {
        type: 'undock-user',
        data: username
      });
    }
  }

  checkApproval(newDockRequest) {
    if(this.state.requireapproval) {
      this.addDockRequest(newDockRequest);
    } else {
      this.addDockedUser(newDockRequest);
    }
  }

  startChatbot() {
    this.setState({connecting: true})
    ipcRenderer.send('start-chatbot', this.state);
  }

  chatbotConnectionStatus(msg) {
    if(msg) {
      this.setState({
        chatbotCouldNotConnect: false,
        connecting: false,
        chatbotConnected: msg,
      })
    } else {
      this.setState({
        connecting: false,
        chatbotConnected: msg,
      })
    }
  }

  disconnectChatbot() {
    ipcRenderer.send('disconnect-chatbot', 'disconnect');
  }

  componentDidUpdate(prevProps, prevState) {
    const textInputs = this.state.textInputs;
    const chatbotNameChange = prevState.chatbotname !== textInputs.chatbotname;
    const tokenChange = prevState.token !== textInputs.token;
    const channelsChange = prevState.channels !== textInputs.channels;
    const textInputChange = chatbotNameChange || tokenChange || channelsChange;
    if(textInputChange) {
      Object.keys(textInputs).forEach((key) => {
        localStorage.setItem(key, textInputs[key]);
      })
    }

    const approvalChange = prevState.requireapproval !== this.state.requireapproval;
    const approvalDisabled = !this.state.requireapproval;
    if(approvalDisabled && approvalChange) {
      this.setState({dockRequests: []})
    }
  }

  openAuthPage() {
    ipcRenderer.send('open-auth', true)
  }

  setAuthToken(token) {
    const textInputs = Object.assign({}, this.state.textInputs, {token});
    this.setState({textInputs});
  }

  clearAuthToken() {
    const textInputs = Object.assign({}, this.state.textInputs, {token: ''});
    this.setState({textInputs});
  }

  chatbotCouldNotConnect(msg) {
    this.setState({chatbotCouldNotConnect: true})
  }

  render() {
    const connected = this.state.chatbotConnected;
    const chatbotSettingsTitle = connected
      ? <div style={{position: 'relative'}}><div style={{
        color: 'lime',
        display: 'inline-block',
        position: 'absolute',
        left: '-15px',
      }}>•</div>Chatbot</div>
      : 'Chatbot';

    return (
          <div className="main-container">
            <Card title={chatbotSettingsTitle}>
              <ChatbotSettings 
                dockOpen={this.state.dockOpen}
                toggleDock={this.toggleDock}
                startChatbot={() => this.startChatbot()}
                disconnectChatbot={() => this.disconnectChatbot()}
                handleCheckbox={(e) => this.handleCheckbox(e)}
                requireapproval={this.state.requireapproval}
                placeholders={this.state.placeholders}
                usernames={this.state.usernames}
                column={this.state.column}
                handleInput={this.handleInput}
                chatbotConnected={this.state.chatbotConnected}
                textInputs={this.state.textInputs}
                openAuthPage={() => this.openAuthPage()}
                clearAuthToken={() => this.clearAuthToken()}
                chatbotCouldNotConnect={this.state.chatbotCouldNotConnect}
                connecting={this.state.connecting}
              />
            </Card>

            <Card title='Docked'>
              <DockUsers
                addDockedUser={this.addDockedUser}
                removeDockedUser={this.removeDockedUser}
                docked={this.state.docked}
                maxDocked={maxDocked}
              />
            </Card>

            { this.state.requireapproval === true && 
              <Card title='Requests'>
                <Requests
                  addDockedUser={this.addDockedUser}
                  removeDockRequest={this.removeDockRequest}
                  dockRequests={this.state.dockRequests}
                  maxRequests={maxRequests}
                  docked={this.state.docked}
                  maxDocked={maxDocked}
                />
              </Card>
            }
        </div>
    );
  }
}

export default PrimaryApp;