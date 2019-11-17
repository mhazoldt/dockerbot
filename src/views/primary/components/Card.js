import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'
import '../styles/Card.css';

class Card extends Component {
    constructor() {
        super();
        this.state = {
            expanded: true,
        }
    }

    toggleExpand() {
        this.setState({expanded: !this.state.expanded})
    }

    render() {
        const expanded = this.state.expanded;

        return (
            <div className="card-main">

                <div className={`card-header${expanded ? '' : ' collapsed'}`}>

                    <div>
                        <FontAwesomeIcon
                            icon={expanded ? faMinus : faPlus}
                            onClick={() => this.toggleExpand()}
                            style={{color: 'black', paddingLeft: '10px'}} 
                        />
                    </div>

                    <div><h2 className={`main-heading${expanded ? '' : ' collapsed'}`}>{this.props.title}</h2></div>

                    <div></div>

                </div>

                { this.state.expanded &&
                    <div className="card-content">
                        {this.props.children}
                    </div>
                }

            </div>
        );
    }
}

export default Card;