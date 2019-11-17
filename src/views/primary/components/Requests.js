import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpaceShuttle } from '@fortawesome/free-solid-svg-icons'
import { faThumbsUp, faThumbsDown } from '@fortawesome/free-regular-svg-icons'
import '../styles/Requests.css';


class Requests extends Component {
  approveRequest(e) {
    const username = e.currentTarget.value;

    this.props.addDockedUser(username);
    this.props.removeDockRequest(username);
  }

  removeRequest(e) {
    const username = e.currentTarget.value;
    this.props.removeDockRequest(username);
  }

  renderDockRequests(dockRequests, atMax) {
      return dockRequests.map((user, index) => {
        return (<div className="dock-request-container" key={index}>
                  <div><FontAwesomeIcon icon={faSpaceShuttle} style={{color: 'black'}} /> { user }</div>
                  <div>
                      {atMax &&
                        <button
                          className="approve-button at-max"
                          value={ user }
                          disabled={true}
                        >
                        <FontAwesomeIcon icon={faThumbsUp} /> Approve</button>
                      }
                      {!atMax &&
                        <button className="approve-button" value={ user } onClick={(e) => this.approveRequest(e)}>
                        <FontAwesomeIcon icon={faThumbsUp} /> Approve</button>
                      }
                      <button className="deny-button" value={ user } onClick={(e) => this.removeRequest(e)}>
                        <FontAwesomeIcon icon={faThumbsDown} /> Deny</button>
                  </div>
                </div>)
      })
  }

  render() {
    const dockRequests = this.props.dockRequests;
    const pendingRequests = this.props.dockRequests.length > 0;
    const atMaxDocked = this.props.docked.length >= this.props.maxDocked;
    const atMaxRequests = dockRequests.length >= this.props.maxRequests;
    const atMax = atMaxDocked || atMaxRequests;

    return (
      <div className="input-container dock-requests">
          { pendingRequests && this.renderDockRequests(dockRequests, atMax) }
          { !pendingRequests && 'Requests will show up here.'}
      </div>
    );
  }
}

export default Requests;