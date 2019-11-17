const packager = require('electron-packager')

const opts = {
    dir: './dev-build',
    out: './build',
    asar: true,
    all: true,
    overwrite: true
}

async function bundleElectronApp() {
    const appPaths = await packager(opts)
    console.log(`Electron app bundles created:\n${appPaths.join("\n")}`)
}

module.exports = bundleElectronApp