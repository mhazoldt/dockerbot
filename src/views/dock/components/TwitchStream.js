import React, { Component } from 'react';


class TwitchStream extends Component {
    constructor(props) {
        super(props);
        this.myRef = React.createRef();
    }

    componentDidMount() {
        if(this.props) {
            let options = {
                width: this.props.streamWidth,
                height: this.props.streamHeight,
                channel: this.props.channel,
              };

              // eslint-disable-next-line
              let player = new Twitch.Player(this.props.channel, options);
        }
    }

    render() {
            return (
                <div style={{position: 'relative', padding: '0px', height: '300px', overflow: 'hidden'}}>
                    {this.props.usernames &&
                        <div style={{position: 'absolute', color: 'lime', paddingLeft: '5px', paddingTop: '3px'}}><div style={{display: 'inline-block', color: 'red'}}>•</div> {this.props.channel}</div>
                    }
                    <div id={this.props.channel || 'none'} ref={this.myRef}>
                    </div>
                </div>
                
            );
        }
}

export default TwitchStream;