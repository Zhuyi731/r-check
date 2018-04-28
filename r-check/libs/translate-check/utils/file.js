'use strict';
var fs = require('fs');
var path = require('path');
var file = require('./file');

var IS_WIN = process.platform.toLowerCase().indexOf('win') !== -1 ? true : false;


exports.createFolder = function(folder, callback) {
    folder = path.resolve(folder);
    var originDir = folder;
    try {
        if (!file.isAbsolute(folder)) {
            folder = path.join(process.cwd(), folder);
        }
        if (fs.existsSync(folder)) return;

        while (!fs.existsSync(folder + '/..')) { //检查父目录是否存在
            folder += '/..';
        }

        while (originDir.length <= folder.length) { //如果目录循环创建完毕，则跳出循环
            fs.mkdirSync(folder, '0777');
            folder = folder.substring(0, folder.length - 3);
        }

        if (callback) callback();
    } catch (e) {
        console.log(e);
    }
}

exports.relative = function(dir1, dir2) {
    return path.relative(dir1, dir2).replace(/\\/g, '/');
}

exports.scanFolder = function(folder) {
    var fileList = [],
        folderList = [],
        walk = function(folder, fileList, folderList) {
            var files = fs.readdirSync(folder);
            files.forEach(function(item) {
                var tmpPath = folder + '/' + item,
                    stats = fs.statSync(tmpPath);

                if (stats.isDirectory()) {
                    walk(tmpPath, fileList, folderList);
                    folderList.push(path.resolve(tmpPath));
                } else {
                    fileList.push(path.resolve(tmpPath));
                }
            });
        };

    walk(folder, fileList, folderList);

    //console.log('扫描' + folder +'成功' + "fileList = " + fileList + " folderList = " + folderList);    
 
    return {
        'files': fileList,
        'folders': folderList
    }

};


exports.isAbsolute = function(path) {
    if (IS_WIN) {
        return /^[a-z]:/i.test(path);
    } else {
        if (path === '/') {
            return true;
        } else {
            var split = path.split('/');
            if (split[0] === '~') {
                return true;
            } else if (split[0] === '' && split[1]) {
                return fs.existsSync('/' + split[1] + '/' + split[2]);
            } else {
                return false;
            }
        }
    }
}

exports.cp = function(src, dst) {
    fs.writeFileSync(dst, fs.readFileSync(src));
}
