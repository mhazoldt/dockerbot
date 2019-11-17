import React, { Component } from 'react';


class StreamsContainer extends Component {
  render() {
    const containerStyle = {
        display: 'flex',
        flexFlow: `${this.props.column ? 'column' : 'row'} nowrap`
    };

    return (
          <div style={containerStyle}>
            {this.props.children}
          </div>
    );
  }
}

export default StreamsContainer;