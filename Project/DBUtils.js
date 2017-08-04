var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

var config = {
    userName: 'giladshi',
    password: 'jgsP6hoo',
    server: 'giladserver.database.windows.net',
    requestTimeout:15000,
    options:{encrypt:true, database:'MoviesShop'}
};

var connection;
//----------------------------------------------------------//
exports.Select = function(query) {
    return new Promise(function(resolve,reject) {
        connection = new Connection(config);

        let substring = 'DELETE FROM Users WHERE UserName=';
        let secondSunstring = 'DELETE FROM MoviesStock WHERE MovieID=';
        let thirdSubstring = 'SELECT FavoriteCategories FROM Users WHERE UserName = ';
        let fourthSubstring = 'SELECT TOP 1 UserName FROM Users WHERE (FavoriteCategories = ';
        let fifthSubstring = 'SELECT DISTINCT TOP 1 MovieID FROM MoviesInCart WHERE UserName = ';
        let sixthSubstring = 'SELECT MovieName FROM MoviesStock WHERE MovieID = ';

        let ans = [];
        let properties = [];
        connection.on('connect', function(err) {
            if (err) {
                console.error('error connecting: ' + err.message);
                reject(err);
            }
            console.log('connection on');
            let dbReq = new Request(query, function (err, rowCount) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
            });

            dbReq.on('columnMetadata', function (columns) {
                columns.forEach(function (column) {
                    if (column.colName != null)
                        properties.push(column.colName);
                });
            });
            dbReq.on('row', function (row) {
                var item = {};
                for (i=0; i<row.length; i++)
                {
                    if((query.indexOf(thirdSubstring) !== -1)
                     || (query.indexOf(fourthSubstring) !== -1)
                        || (query.indexOf(fifthSubstring) !== -1)
                    || (query.indexOf(sixthSubstring)) !== -1)
                    {
                        resolve(row[i].value);
                        return;
                    }
                    else
                        item[properties[i]] = row[i].value;
                }
                ans.push(item);
            });

            dbReq.on('requestCompleted', function () {
                console.log('request Completed: '+ dbReq.rowCount + ' row(s) returned');
                console.log(ans);
                connection.close();
                if(((query.indexOf(substring) !== -1) || (query.indexOf(secondSunstring) !== -1))
                     && (dbReq.rowCount > 0))
                {
                    resolve(dbReq.rowCount);
                }
                else
                {
                    resolve(ans);
                }
            });
            connection.execSql(dbReq);
        });
    });
};

//----------------------------------------------------------//
exports.Insert = function(query) {
    return new Promise(function(resolve,reject) {

        connection = new Connection(config);
        connection.on('connect', function(err) {
            if (err) {
                console.error('error connecting: ' + err.message);
                reject(err);
            }
            console.log('connection on');

            let dbReq = new Request(query, function (err, rowCount) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
            });

            dbReq.on('requestCompleted', function () {
                connection.close();
                resolve(true);
            });
            connection.execSql(dbReq);
        });
    });
};
//----------------------------------------------------------//
exports.Update = function(query) {
    return new Promise(function(resolve,reject) {

        connection = new Connection(config);
        connection.on('connect', function(err) {
            if (err) {
                console.error('error connecting: ' + err.message);
                reject(err);
            }
            console.log('connection on');

            let dbReq = new Request(query, function (err, rowCount) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
            });

            dbReq.on('requestCompleted', function () {
                connection.close();
                resolve(true);
            });
            connection.execSql(dbReq);
        });
    });
};

