const process = require('process');
const fs = require('fs');
const path = require('path');

const sourceDir = process.argv[2] || './dir_1';  // [2] путь к исходной папке = sourceDir
const finalDir = process.argv[3] || './collection'; // [3] путь к итоговой папке = finalDir
const dirDelete = process.argv[4]; // [4] необходимость удаления исходной = dirDelete (-d)

function doIt(callback) {
    fs.mkdir(finalDir , function (err) { //создаем общую папку
        if (err) {
            if (err === 'EEXIST') console.log('dir has already exist');
            else return 1; //console.error(err);
        } else
            console.log(`Directory \"${finalDir}\" created successfully!`);
    });

    recursiveWalk(sourceDir, function (arrFilePaths) {
        // нужно создать папку и переместить файл
        for(let i=0; i<arrFilePaths.length; i++) {
            createDir(arrFilePaths[i], function (){} );
        }
        console.log('callback in doIt');
    });
    return callback();
}

function recursiveWalk(currentDirPath, callback) { // поиск в ширину
    let arrFilePaths = [];
    fs.readdir(currentDirPath, function (err, files) { // readdir=асинхрон. Считывает содержимое каталога.
        if (err) {
            throw new Error(err.message);
        }
        files.forEach(function (fName) {
            let filePath = path.join(currentDirPath, fName); // делаем корретный URL
            try {
                let stat = fs.statSync(filePath); // statSync=синхрон. вытаскиваем инфу по адресу пути(текущем объекте)
                if (stat.isFile()) { // проверяем явл-ся ли он файлом
                    arrFilePaths.push(filePath);
                }
                else if (stat.isDirectory()) { // иначе это папка
                    recursiveWalk(filePath, callback); // спускаемся ниже и повторяем
                }
            } catch (err) {
                console.log('recursiveWalk ', err.message);
                return 1;
            }
        });
        callback(arrFilePaths);
    });
}

function createDir(filePath, callback) {
    let dirPath = getDirPath(filePath);

    fs.stat(dirPath, function (err, stat) {
        if (err){
            if(err.code === 'ENOENT') { // папка еще не существует
                fs.mkdir(dirPath, function (err) { //создаем папку с литерой
                    if (err) {
                        if (err.code === 'EEXIST'){}  //console.log(dirPath, ': has already exist'); // todo эта проверка нужна??
                        else console.log(dirPath, ':', err.code);
                    }
                    //else
                    //console.log(dirPath + " created successfully!");
                    callback = movingFile(filePath, dirPath);
                });
            }else{
                console.log('createDir ', err.message);
            }
        }else if (stat) { // папка уже существует
            callback = movingFile(filePath, dirPath);
        }
    });
}

function getDirPath(filePath) {
    let fName = getFileName(filePath); // вытаскиваем имя файла из пути
    let firstLetter = fName.charAt(0).toUpperCase();
    return path.join(finalDir, firstLetter); // делаем корректный URL
}

function getFileName(filePath) {
    return path.basename(filePath);
}

function movingFile(filePath, dirPath) {
    if (dirPath!==''){
        fs.copyFile(filePath, dirPath + '/' + getFileName(filePath), (err) => { // copyFile(что, куда)
            if (err) console.log('movingFile: ', err.message); //throw err.message;
            //console.log(getFileName(filePath) + ' was copied');
        });
    }
}
/***********************************************************************/
function removeFile(filePath) {
    fs.unlink(filePath, function (err) {
        if (err && err.code === 'ENOENT') {// file doesn't exist
            console.info(filePath + " doesn't exist");
        } else if (err) { // other errors
            console.log('removeFile ', err.message);
        } else {
            //console.info(filePath + ' was removed');
        }
    });
}

function removeDirRecursive(currentDirPath, arrDirPaths, arrFilePaths, callback){
    console.log('removeDirRecursive: ');
    fs.readdir(currentDirPath, function (err, files) { // readdir=асинхрон. Считывает содержимое каталога.
        if (err) {
            throw new Error(err);
        }
        files.forEach(function (fName) {
            let filePath = path.join(currentDirPath, fName); // делаем корретный URL
            try {
                let stat = fs.statSync(filePath); // statSync=синхрон. вытаскиваем инфу по адресу пути(текущем объекте) // todo тут надо заменить на асинхр?
                if (stat.isFile()) { // проверяем явл-ся ли он файлом
                    removeFile(filePath);
                    //arrFilePaths.push(filePath);
                }
                else if (stat.isDirectory()) { // иначе это папка
                    arrDirPaths.push(filePath);
                    removeDirRecursive(filePath, arrDirPaths, arrFilePaths, callback); // спускаемся ниже и повторяем
                }
            } catch (err) {
                console.log('removeDirRecursive: ', err.message);
                return 1;
            }
        });
    });
    if (currentDirPath === 'dir_1\\dir_1_2\\dir_1_2_3\\dir_1_2_3_3')
    return callback(); //todo его надо вызывать при последней итерации? но как это нормально сделать??????
}

let arrFilePaths = [];
let arrDirPaths = [];
arrDirPaths.push(sourceDir); // todo не очень хорошая строчка, как ее заменить?

doIt( ()=> { test1();} );

function test1() {
    console.log('test1');
}

// doIt( ()=> { removeDirRecursive(sourceDir,
//                                 arrDirPaths,
//                                 arrFilePaths,
//                                 // function() {
//                                 //     removeFiles(arrFilePaths, function () {
//                                 //         for (let i = arrDirPaths.length - 1; i >= 0; i--) {
//                                 //             console.log("arrDirPaths[", i, '] =', arrDirPaths[i]);
//                                 //             fs.rmdirSync(arrDirPaths[i]);
//                                 //         }
//                                 //     });
//                                 // }
//                                 function() {
//                                     for (let i = arrDirPaths.length - 1; i >= 0; i--) {
//                                         console.log("arrDirPaths[", i, '] =', arrDirPaths[i]);
//                                         fs.rmdirSync(arrDirPaths[i]);
//                                     }
//                                 }
//                             )}
// );

