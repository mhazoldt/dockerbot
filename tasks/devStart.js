const bundleViews = require('./bundleViews.js');
const toggleElectron = require('./toggleElectron');
const { copyFiles } = require('./copyFiles.js');
const { removeDevBuild } = require('./removeDevBuild.js');


const devStart = async () => {
    await removeDevBuild();
    if(toggleElectron.getElectronProc()) toggleElectron.toggle()
    copyFiles();
    await bundleViews()
    toggleElectron.toggle()
}

module.exports = devStart