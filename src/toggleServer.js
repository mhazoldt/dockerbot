const { spawn } = require('child_process');

module.exports = ((spawn) => {
    let serverProc = null;

    return {
        toggle: () => {
            if(serverProc) {
                serverProc.kill();
                serverProc = null;
            } else {
                serverProc = spawn('node', ['./server.js'])
                serverProc.stdout.setEncoding('utf8');
                serverProc.stdout.on('data', function(data) {
                    console.log('stdout: ' + data.toString());
                })
            }
        },
        getServerProc: () => serverProc
    }
})(spawn)
