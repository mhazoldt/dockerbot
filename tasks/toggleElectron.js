const { spawn } = require('child_process');
const electron = require('electron');

module.exports = ((spawn) => {
    let electronProc = null;

    return {
        toggle: () => {
            if(electronProc) {
                electronProc.kill();
                electronProc = null;
            } else {
                electronProc = spawn(
                    electron,
                    ['./dev-build/main.js'],
                    { stdio: [process.stdin, process.stdout, process.stderr] }
                )
            }
        },
        getElectronProc: () => electronProc
    }
})(spawn)
