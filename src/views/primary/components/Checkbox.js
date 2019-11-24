import React, { Component } from 'react';
import '../styles/Checkboxes.css';

// comment
class checkbox extends Component {
    render() {
        return (
            <div>
                <div className="checkbox-container">
                    <div className="checkbox-box-container">
                        <label className={`checkbox-label${this.props.shouldDisable ? ' connected' : ''}`}>
                            <input
                                type="checkbox"
                                name={this.props.checkboxName}
                                onChange={this.props.handleCheckbox}
                                checked={this.props.shouldCheck}
                                readOnly={this.props.shouldDisable}
                                disabled={this.props.shouldDisable}
                            />
                            <div className={`checkbox-box${this.props.shouldDisable ? ' connected' : ''}`}></div>
                        </label>
                    </div>
                    <div className='checkbox-text'>{this.props.checkboxText}</div>
                </div>
            </div>
            
        );
    }
}

export default checkbox;