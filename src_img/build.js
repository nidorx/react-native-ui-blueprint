/**
 * Faz a conversão de SVG para PNG (node.js + Inkscape + pngquant),
 * permitindo a geração de ícones para dispositivos com diferents densidades.
 *
 * Permite o redimensionamento de PNG puros também
 *
 * https://inkscape.org/en/doc/inkscape-man.html
 * https://www.imagemagick.org/script/download.php#windows
 * https://mijingo.com/blog/exporting-svg-from-the-command-line-with-inkscape
 *
 * - Instalar Inkscape e adicionar no PATH (C:\Program Files\Inkscape)
 * - Baixar o pngquant.exe e copiar para o PATH (C:\windows) https://pngquant.org
 * - Instalar ImageMagick
 * - Configurar SVG_PATH_INPUT, PNG_PATH_OUTPUT, BASE_RESOLUTION e DENSITIES
 * - Executar no terminal `node build.js`
 *
 * ps. A qualidade de conversão de SVG -> PNG pelo inkscape é muito superior ao do Imagemagick
 */

const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

/**
 * Força a recriação do PNG?
 */
const FORCE = false;

// Diretório de entrada, onde os arquivos .svg estão
const PATH_INPUT = path.normalize(__dirname + '/img/');

// Diretório de saída, dos arquivos png
const PATH_OUTPUT = path.normalize(__dirname + './../src/assets/');

// Densidades das imagens geradas, usadas para aplicações Mobile (Ex. edit.png, edit@2x.png, edit@3x.png)
const DENSITIES = [1, 2, 3];

const images = require('./images.js');

for (var name in images) {
    if (!images.hasOwnProperty(name)) {
        continue;
    }

    let config = images[name];
    if (Number.isInteger(config) || Array.isArray(config)) {
        config = {
            size: config
        };
    }

    var baseSize = config.size;
    if (!Array.isArray(baseSize)) {
        baseSize = [baseSize, baseSize];
    }


    let pathInput = path.join(PATH_INPUT, name);
    let pathOutput = pathInput.replace(PATH_INPUT, PATH_OUTPUT);

    let inputType = '';
    let outputExt = '';
    if (name.endsWith('.svg')) {
        outputExt = '.svg';
    } else if (name.endsWith('.png')) {
        outputExt = '.png';
    } else if (name.endsWith('.jpg')) {
        outputExt = '.jpg';
    }

    if (fs.existsSync(pathInput.replace(outputExt, '.svg'))) {
        inputType = 'SVG';
        pathInput = pathInput.replace(outputExt, '.svg');
    } else if (fs.existsSync(pathInput.replace(outputExt, '.png'))) {
        inputType = 'PNG';
        pathInput = pathInput.replace(outputExt, '.png');
    } else if (fs.existsSync(pathInput.replace(outputExt, '.jpg'))) {
        inputType = 'JPG';
        pathInput = pathInput.replace(outputExt, '.jpg');
    }

    let parsedViewBox = false;

    DENSITIES.forEach((density) => {

        const suffix = (density > 1 ? ('@' + (density) + 'x') : '');
        const outPath = pathOutput.replace(outputExt, suffix + outputExt);
        if (fs.existsSync(outPath) && !FORCE) {
            return;
        }

        if (inputType === 'SVG' && !parsedViewBox) {
            parsedViewBox = true;
            // Faz parsing do viewBox="0 0 90 32" do svg
            var svg = fs.readFileSync(pathInput) + '';
            var viewBox = svg.match(/viewBox="\d+ \d+ ([\d.]+) ([\d.]+)"/);
            if (viewBox) {
                var vbW = Number.parseFloat(viewBox[1]);
                var vbH = Number.parseFloat(viewBox[2]);
                if (vbW !== vbH && baseSize[0] === baseSize[1]) {
                    // Svg não é quadrado e foi iformado um valor único para renderizar o svg
                    var baseRes = baseSize[0];
                    if (vbW > vbH) {
                        let ratio = vbW / vbH;
                        baseSize = [baseRes, Math.round(baseRes / ratio)];
                    } else {
                        let ratio = vbH / vbW;
                        baseSize = [Math.round(baseRes / ratio), baseRes];
                    }
                }
            }
        }

        const resW = baseSize[0] === 1 ? 1 : density * baseSize[0];
        const resH = baseSize[1] === 1 ? 1 : density * baseSize[1];

        console.log('Salvando arquivo: ', outPath);

        if (inputType === 'SVG') {
            // Converte SVG to PNG, unsando inkscape (qualidade melhor na conversão)
            child_process.execSync(`"inkscape" -z -e "${outPath}" -w ${resW} -h ${resH} "${pathInput}"`, {stdio: [0, 1, 2]});
        } else {
            // Redimensiona png ou jpg
            child_process.execSync(`"magick" "${pathInput}" -resize ${resW}x${resH}\\! "${outPath}"`, {stdio: [0, 1, 2]});
        }

        let tamInicial = getFilesizeInBytes(outPath);
        let tamFinal, tamAnterior = tamInicial;

        console.log('  - Arquivo criado { tamanho:', tamInicial, '}');

        // Compressão de imagens
        if (outputExt === '.png') {
            try {
                child_process.execSync(`pngquant -f --strip --speed 2 --skip-if-larger --quality=65-85 -o "${outPath}" "${outPath}"`, {stdio: [0, 1, 2]});
                tamFinal = getFilesizeInBytes(outPath);
                console.log('  - Compactacao 1 { tamanho:', tamFinal, ', percentual:', percentual(tamAnterior, tamFinal), '}');
                tamAnterior = tamFinal;

                console.log('  - Compactacao total { percentual:', percentual(tamInicial, tamFinal), '}');
            } catch (error) {
                console.error('Erro na compactação');
            }
        } else if (outputExt === '.jpg') {
            try {
                child_process.execSync(`"magick"  "${outPath}" -sampling-factor 4:2:0 -strip -quality 80 -interlace JPEG -colorspace RGB "${outPath}"`, {stdio: [0, 1, 2]});
                tamFinal = getFilesizeInBytes(outPath);
                console.log('  - Compactacao 1 { tamanho:', tamFinal, ', percentual:', percentual(tamAnterior, tamFinal), '}');
                tamAnterior = tamFinal;

                console.log('  - Compactacao total { percentual:', percentual(tamInicial, tamFinal), '}');
            } catch (error) {
                console.error('Erro na compactação');
            }
        }

    });
}

function percentual(tamInicial, tamFinal) {
    return (100 - (100 * tamFinal / tamInicial)).toFixed(2) + '%';
}

function getFilesizeInBytes(filename) {
    const stats = fs.statSync(filename)
    const fileSizeInBytes = stats.size
    return fileSizeInBytes
}
