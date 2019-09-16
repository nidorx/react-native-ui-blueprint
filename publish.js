/**
 * Faz o build publicação no repositorio e tag do github.
 *
 * O versionamento do package.json não é feito automaticamente, afim de permitir um maior controle sobre o deploy.
 *
 * Os passos para usar esses script são:
 *
 * 1 - Após fazer alterações de código, conduzir normalmente com os commits no git
 * 2 - No momento de fazer a publicação de uma versão, no terminal:
 *    a) git add --all
 *    b) git commit -m "Mensagem das alterações feitas"
 *    c) node ./publish.js
 */

const fs = require('fs');
const rimraf = require('rimraf');
const ncp = require('ncp').ncp;
const cpExec = require('child_process').exec;

function cp(source, dest) {
    return new Promise(function (accept, reject) {
        ncp(source, dest, function (err) {
            if (err) {
                return reject(err);
            } else {
                accept();
            }
        });
    });
}

function exec(command, cwd) {

    return new Promise(function (accept, reject) {
        console.log('[' + command + ']');
        const com = cpExec(command, {cwd: cwd});

        com.stdout.on('data', function (data) {
            console.log(data.toString());
        });

        com.stderr.on('data', function (data) {
            console.error(data.toString());
        });

        com.on('exit', function (code, signal) {
            if (signal) {
                reject({
                    code: code,
                    signal: signal,
                });
            } else {
                accept({
                    code: code,
                    signal: signal,
                });
            }
        });
    });
}

rimraf('./dist', {}, function (err) {
    if (err) {
        throw err;
    }

    var package = JSON.parse(fs.readFileSync(__dirname + '/package.json'));

    exec('npm run build-ts')
        .then(cp.bind(undefined, './package.json', './dist/package.json'))
        .then(cp.bind(undefined, './README.md', './dist/README.md'))
        .then(cp.bind(undefined, './LICENSE', './dist/LICENSE'))
        .then(cp.bind(undefined, './src/assets/', './dist/src/assets/'))
        .then(exec.bind(undefined, 'npm publish', './dist'))
        .then(exec.bind(undefined, 'git add --all', null))
        .then(exec.bind(undefined, 'git commit -m "Release of version v' + package.version + '"', null))
        .then(exec.bind(undefined, 'git push', null))
        .then(exec.bind(undefined, 'git tag v' + package.version, null))
        .then(exec.bind(undefined, 'git push --tags', null))
        .catch(err => {
            console.error(err);
        });
    ;


});


