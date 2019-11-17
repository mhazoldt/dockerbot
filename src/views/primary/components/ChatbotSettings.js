import React, { Component } from 'react';
import Checkbox from './Checkbox.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAddressCard, faKey, faFireAlt, faAngleDoubleRight, faAngleDoubleLeft } from '@fortawesome/free-solid-svg-icons'
import { faWindowMaximize, faCommentDots } from '@fortawesome/free-regular-svg-icons'
import { faTwitch } from '@fortawesome/free-brands-svg-icons'
import '../styles/Chatbot.css';


const textInputValidations = {};

textInputValidations['chatbotname'] = text => {
  const pattern = /^[a-zA-Z0-9\-_]{0,30}$/;
  return pattern.test(text);
}

textInputValidations['channels'] = text => {
  const pattern = /^[a-zA-Z0-9\-_]+(?:(?:(?:,|, )(?!,)){1}[a-zA-Z0-9\-_]*)*$/
  return pattern.test(text);
}

const heatAnimation = (inputName, component) => {
  let count = 0;
  let offset = 0;

  let intervalId = setInterval(() => {
    let currentHeat = component.state.heat[inputName];
    let atMaxHeat = currentHeat >= 50;
    let atMinHeat = currentHeat <= 0;
    let zeroOffset = offset === 0;
    let heat;

    if(count < 10 && !atMaxHeat) {
      currentHeat = currentHeat + 5;
      offset = offset + 1;
      heat = Object.assign({}, component.state.heat, {[inputName]: currentHeat});
      component.setState({heat})

    } else if(count >= 10 && !atMinHeat && !zeroOffset) {
      currentHeat = currentHeat - 5;
      offset = offset - 1;
      heat = Object.assign({}, component.state.heat, {[inputName]: currentHeat});
      component.setState({heat})

    } else if(count >= 20) {
      clearInterval(intervalId)
    }

    count++;
  }, 70);
}


class Chatbot extends Component {
  constructor() {
    super()
    this.state = {
      heat: {
        chatbotname: 0,
        channels: 0,
      }
    }
  }

  validateInput(e) {
    let inputName = e.currentTarget.name;
    let inputValue = e.currentTarget.value;

    const valid = textInputValidations[inputName](inputValue);

    if(valid) {
      this.props.handleInput(e)
    } else {
      heatAnimation(inputName, this);
    }
  }

  render() {
    const textInputs = this.props.textInputs;
    const connected = this.props.chatbotConnected;
    const isToken = textInputs.token.length > 0;

    const inputStyle =  {border: `1px solid hsl(0, 100%, ${this.state.heat.chatbotname}%)`};
    const inputStyleChannels =  {border: `1px solid hsl(0, 100%, ${this.state.heat.channels}%)`};
    const text = this.props.textInputs;
    const textInputEmpty = Object.keys(text).reduce((prevValue, key) => (text[key].length === 0) || prevValue, false);
    const shouldDisableStart = textInputEmpty || this.props.connecting;

    return (
              <div className='chatbot-content-container'>
                <div className="input-container">
                    <div style={{paddingLeft: '5px'}}><FontAwesomeIcon icon={faAddressCard} style={{color: 'black'}} /> Chatbot Name</div>
                    <input 
                        type="text"
                        name="chatbotname"
                        className={`text-input${connected ? ' connected' : ''}`}
                        onChange={(e) => this.validateInput(e)} 
                        value={textInputs.chatbotname}
                        readOnly={connected}
                        disabled={connected}
                        style={inputStyle}
                    ></input>
                </div>

                <div className="input-container">
                    <div style={{paddingLeft: '5px'}}><FontAwesomeIcon icon={faKey} style={{color: 'black'}} /> OAuth Token</div>
                    <input
                        type="password"
                        name="token"
                        className={`text-input${connected ? ' connected' : ''}`}
                        onChange={this.props.handleInput}
                        value={textInputs.token}
                        readOnly={true}
                        disabled={true}
                    ></input>
                    {isToken &&
                      <button
                        className={`chatbot-button get-oauth-token-button${connected ? ' connected' : ''}`}
                        onClick={this.props.clearAuthToken}
                        readOnly={connected}
                        disabled={connected}
                      ><FontAwesomeIcon icon={faAngleDoubleLeft} /> Clear Token</button>
                    }
                    {!isToken &&
                      <button
                        className='chatbot-button get-oauth-token-button'
                        onClick={this.props.openAuthPage}
                      ><FontAwesomeIcon icon={faAngleDoubleRight} /> Get OAuth Token</button>
                    }
                </div>

                <div className="input-container">
                    <div style={{paddingLeft: '5px'}}><FontAwesomeIcon icon={faTwitch} style={{color: 'black'}} /> Channels</div>
                    <input
                        type="text"
                        name="channels"
                        className={`text-input${connected ? ' connected' : ''}`}
                        onChange={(e) => this.validateInput(e)}
                        value={textInputs.channels}
                        readOnly={connected}
                        disabled={connected}
                        style={inputStyleChannels}
                    ></input>
                </div>

                <div className="input-container">
                  <div className="checkbox-grid">
                    <Checkbox 
                      shouldCheck={this.props.requireapproval}
                      handleCheckbox={(e) => this.props.handleCheckbox(e)}
                      checkboxName="requireapproval"
                      checkboxText="require approval to dock"
                    />

                    <Checkbox 
                      shouldCheck={this.props.usernames}
                      handleCheckbox={(e) => this.props.handleCheckbox(e)}
                      checkboxName="usernames"
                      checkboxText="usernames"
                    />

                    <Checkbox 
                      shouldCheck={this.props.placeholders}
                      handleCheckbox={(e) => this.props.handleCheckbox(e)}
                      checkboxName="placeholders"
                      checkboxText="placeholders"
                    />

                    <Checkbox 
                      shouldCheck={this.props.column}
                      handleCheckbox={(e) => this.props.handleCheckbox(e)}
                      checkboxName="column"
                      checkboxText="column"
                    />
                  </div>
                </div>

                <div style={{position: 'relative'}}>
                  {this.props.chatbotCouldNotConnect &&
                    <div style={{position: 'absolute', color: 'red', whiteSpace: 'nowrap', fontSize: '10px', paddingLeft: '10px', top: '-10px'}}>Could not connect</div>
                  }
                  { this.props.chatbotConnected && !textInputEmpty &&
                    <button
                      className='chatbot-button connected'
                      onClick={this.props.disconnectChatbot}
                    ><FontAwesomeIcon icon={faCommentDots} /> Connected</button>
                  }
                  { !this.props.chatbotConnected &&
                    <button
                      className='chatbot-button'
                      onClick={this.props.startChatbot}
                      style={shouldDisableStart ? {border: '1px solid slategray', color: 'slategray', backgroundColor: '#cccccc'} : {}}
                      disabled={shouldDisableStart}
                    ><FontAwesomeIcon icon={faFireAlt} /> Start Chatbot</button>
                  }
                  <button
                    className="chatbot-button dock"
                    onClick={this.props.toggleDock}
                  > <FontAwesomeIcon icon={faWindowMaximize} /> { this.props.dockOpen ? ' Close Dock' : ' Open Dock' }</button>
                </div>
              </div>
    );
  }
}


export default Chatbot;