import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpaceShuttle, faUserPlus } from '@fortawesome/free-solid-svg-icons'
import '../styles/DockUsers.css';


const textInputValidations = {};

textInputValidations['manualadd'] = text => {
  const pattern = /^[a-zA-Z0-9\-_]{0,30}$/;
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

class DockUsers extends Component {
    constructor() {
        super();
        this.state = {
            manualadd: '',
            heat: {
                manualadd: 0,
            }
        }
    }

    undockUser(e) {
        const username = e.currentTarget.value;
        this.props.removeDockedUser(username)
    }

    handleInput(e) {
        let inputName = e.currentTarget.name;
        let inputValue = e.currentTarget.value;
    
        this.setState({ [inputName]: inputValue });
    }

    addOnEnter(e) {
        if(e.key === 'Enter') this.manualAdd();
    }

    manualAdd() {
        this.props.addDockedUser(this.state.manualadd);
        this.setState({manualadd: ''})
    }

    validateInput(e) {
        let inputName = e.currentTarget.name;
        let inputValue = e.currentTarget.value;

        const valid = textInputValidations[inputName](inputValue);

        if(valid) {
            this.handleInput(e)
        } else {
            heatAnimation(inputName, this);
        }
    }


    renderDockedUsers(docked) {
        return docked.map((user, index) => {
            return (<div className="docked-users-container" key={index}>
                        <div><FontAwesomeIcon icon={faSpaceShuttle} style={{color: 'black'}} /> {user}</div>
                        <div>
                            <button className="undock-button" value={user} onClick={(e) => this.undockUser(e)}>X</button>
                        </div>
                    </div>)
        })
    }

    render() {
        const docked = this.props.docked;
        const isDocked = this.props.docked.length > 0;
        const atMax = docked.length >= this.props.maxDocked;
        const inputStyle = {border: `1px solid hsl(0, 100%, ${this.state.heat.manualadd}%)`}
        const textInputEmpty = this.state.manualadd.length === 0;

        return (
            <div className="input-container docked-users">
                {isDocked && this.renderDockedUsers(docked)}
                {!isDocked && 'Docked users will show up here.'}
                <div className='manual-add-container'>
                    <input
                        type="text"
                        name="manualadd"
                        className={`text-input`}
                        onChange={(e) => this.validateInput(e)}
                        onKeyDown={(e) => this.addOnEnter(e)}
                        value={this.state.manualadd}
                        readOnly={false}
                        disabled={false}
                        style={inputStyle}
                    ></input>
                    {!textInputEmpty &&
                        <button
                            className={`chatbot-button manual-add-button${atMax ? ' max-docked' : ''}`}
                            onClick={() => this.manualAdd()}
                        > <FontAwesomeIcon icon={faUserPlus} /> Add User</button>
                    }
                    {textInputEmpty &&
                        <button
                            className={`chatbot-button manual-add-button${atMax ? ' max-docked' : ''}`}
                            onClick={() => this.manualAdd()}
                            style={{border: '1px solid slategray', color: 'slategray', backgroundColor: '#cccccc'}}
                            disabled={true}
                        > <FontAwesomeIcon icon={faUserPlus} /> Add User</button>
                    }
                </div>
            </div>
        );
    }
}

export default DockUsers;