const rimraf = require('rimraf');


function removeDevBuild() {
    return new Promise((resolve, reject) => {
        rimraf('./dev-build', function (err) { 
            err ? reject(arguments) : resolve(arguments)
        })
    })
}

exports.removeDevBuild = removeDevBuild;