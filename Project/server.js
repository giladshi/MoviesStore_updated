let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let Connection = require('tedious').Connection;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
let Request = require('tedious').Request;
let TYPES = require('tedious').TYPES;
let cors = require('cors');
app.use(cors());
let squel = require("squel");
let DButilsAzure = require('./DBUtils');
let fs = require('fs');
let xml2js = require('xml2js');
//var cookieParser = require('cookie-parser');
//app.use(cookieParser());

//-------------------------------------------------------------------------------------------------------------------
app.use(express.static(__dirname + '/public'));
//-------------------------------------------------------------------------------------------------------------------
app.locals.users = {};

let token = 12345;

//------------------------CONFIGURATIONS------------------------------//
let config = {
    userName: 'giladshi',
    password: 'jgsP6hoo',
    server: 'giladserver.database.windows.net',
    requestTimeout: 15000,
    options: {encrypt: true, database: 'MoviesShop'}
};

let connection = new Connection(config);
connection.on('connect', function (err) {
    if (err) {
        console.error('error connecting: ' + err.stack)
    }
    else {
        console.log("Connected Azure");
    }

});

let port = 5000;
app.listen(port, function () {
    console.log('listening to port: ' + port);
});
//---------------------------METHODS-----------------------------------//

/***************** Get All Products *****************/
app.get('/getAllProducts', function (req, res) {
    DButilsAzure.Select('Select * from MoviesStock')
        .then((ans) => res.send(ans))
        .catch((err) => res.send(err));
});
/***************** All Category *****************/
app.get('/GetAllCategory', function (req, res) {
    DButilsAzure.Select('SELECT * FROM MoviesStock')
        .then((ans) => res.send(ans))
        .catch((err) => res.send(err));
});
/***************** Top 5 by Rating *****************/
app.get('/getTop5HotProducts', function (req, res) {
    console.log("IM in server!");
    DButilsAzure.Select('Select TOP 5 * FROM MoviesStock ORDER BY Rating DESC')
        .then((ans) => res.send(ans))
        .catch((err) => res.send(err));
});
/***************** Products By Category *****************/
app.get('/getProductsByCategory', function (req, res) {
    DButilsAzure.Select('Select [MovieName], [MovieCategory] FROM MoviesStock ORDER BY MovieCategory ASC')
        .then((ans) => res.send(ans))
        .catch((err) => res.send(err));
});
/***************** Get Product Details *****************/
app.get('/getProductDetails/:MovieID', function (req, res) {
    let movieID = req.params.MovieID;

    let query = squel.select()
        .from("MoviesStock")
        .where("MovieID =  '" + movieID + "'")
        .toString();

    DButilsAzure.Select(query)
        .then(function (ans) {
            if (ans.length > 0) {
                res.send(ans);
            }
            else {
                res.send('Product Doesnt Exist');
            }
        })
        .catch(function (err) {
            res.send(err);
        });
});
/***************** Get All Users *****************/
app.get('/getAllUsers', function (req, res) {
    DButilsAzure.Select('Select * from Users')
        .then((ans) => res.send(ans))
        .catch((err) => res.send(err));
});
/***************** Get Specific User *****************/
app.get('/getUser/:UserName', function (req, res) {
    let userName = req.params.UserName;
    let query = squel.select()
        .from("Users")
        .where("UserName =  '" + userName + "'")
        .toString();

    DButilsAzure.Select(query)
        .then(function (ans) {
            if (ans.length > 0) {
                res.send(ans);
            }
            else {
                res.send('User Doesnt Exist');
            }
        })
        .catch(function (err) {
            res.send(err);
        });
});
/***************** Show Cart *****************/
app.get('/showCart/:UserName', function (req, res) {
    let userName = req.params.UserName;
    let query = "SELECT MoviesInCart.MovieID, MoviesStock.MovieName, MoviesInCart.Amount, " +
        "MoviesStock.Price FROM MoviesInCart INNER JOIN MoviesStock ON MoviesInCart.MovieID=MoviesStock.MovieID " +
        "WHERE UserName = " + "'" + userName + "'";

    DButilsAzure.Select(query)
        .then(function (ans) {
            if (ans.length > 0) {
                res.send(ans);
            }
            else {
                res.send('User Doesnt Exist');
            }
        })
        .catch(function (err) {
            res.send(err);
        });
});
/***************** Get My Orders *****************/
app.get('/getMyOrders/:UserName', function (req, res) {
    let userName = req.params.UserName;
    let query = "SELECT * FROM Orders WHERE UserName = " + "'" + userName + "'";

    DButilsAzure.Select(query)
        .then(function (ans) {
            if (ans.length > 0) {
                res.send(ans);
            }
            else {
                res.send('User Doesnt Exist');
            }
        })
        .catch(function (err) {
            res.send(err);
        });
});
/***************** Check In Stock *****************/
app.get('/checkInStock/:MovieID', function (req, res) {
    let movieID = req.params.MovieID;
    let query = "SELECT [AmountInStock] FROM MoviesStock Where MovieID=" + "'" + movieID + "'";

    DButilsAzure.Select(query)
        .then(function (ans) {
            if (ans.length > 0) {
                res.send({"Result": true});
            }
            else {
                res.send({"Result": false});
            }
        })
        .catch(function (err) {
            res.send(err);
        });
});
/***************** Check Amount In Stock *****************/
app.get('/checkAmountInStock', function (req, res) {
    let query = "SELECT [MovieID], [MovieName], [AmountInStock] FROM MoviesStock"

    DButilsAzure.Select(query)
        .then(function (ans) {
            if (ans.length > 0) {
                res.send(ans);
            }
            else {
                res.send('Opps Something went wrong');
            }
        })
        .catch(function (err) {
            res.send(err);
        });
});
/***************** Latest Monthly Products *****************/
app.get('/getLatestMonthlyProducts', function (req, res) {
    let query = "SELECT TOP (1) WITH ties mis.MovieID, mis.MovieName, mis.MovieCategory FROM MoviesStock mis ORDER BY year DESC, month DESC";

    DButilsAzure.Select(query)
        .then(function (ans) {
            if (ans.length > 0) {
                res.send(ans);
            }
            else {
                res.send('Opps Something went wrong');
            }
        })
        .catch(function (err) {
            res.send(err);
        });
});
/**** GET ORDERS REPORT ****/
app.get('/getOrdersReport', function (req, res) {
    let query = "SELECT * FROM Orders";

    DButilsAzure.Select(query)
        .then(function (ans) {
            if (ans.length > 0) {
                res.send(ans);
            }
            else {
                res.send('Opps Something went wrong');
            }
        })
        .catch(function (err) {
            res.send(err);
        });
});
/***************** LOGIN *****************/
app.post('/login', function (req, res) {
    let userName = req.body.username;
    let password = req.body.password;

    let query = squel.select()
        .from("Passwords")
        .where("UserName =  '" + userName + "'")
        .where("Password =  '" + password + "'")
        .toString();

    DButilsAzure.Select(query)
        .then(function (ans) {
            if (ans.length > 0) {
                token++;
                app.locals.users[userName] = token;
                res.json(token);
                //res.send({"Result": true});
            }
            else {
                res.status(403).send("username or password incorrect");
                //res.send({"Result": false});
            }
        })
        .catch(function (err) {
            res.send(err);
        });
});
/***************** Answer Personal Questions *****************/
app.post('/answerPersonalQuestions', function (req, res) {
    let userName = req.body.UserName;
    let address = req.body.Address;
    let petName = req.body.PetName;

    let query = squel.select()
        .from("Users")
        .where("UserName = '" + userName + "'")
        .where("Address = '" + address + "'")
        .where("PetName = '" + petName + "'")
        .toString();

    DButilsAzure.Select(query)
        .then(function (ans) {
            if (ans.length > 0) {
                res.send({"Result": true});
            }
            else {
                res.send({"Result": false});
            }
        })
        .catch(function (err) {
            res.send(err);
        });
});
/***************** Update Rating *****************/
app.post('/updateRating', function (req, res) {
    let movieID = req.body.MovieID;
    let rate = req.body.Rating;

    let query = squel.update()
        .table("MoviesStock")
        .set("Rating = " + rate)
        .where("MovieID = " + movieID)
        .toString();

    DButilsAzure.Update(query)
        .then(function (ans) {
            res.send(ans);
        })
        .catch(function (err) {
            res.send(err);
        });
});
/***************** Add Product To Cart *****************/
app.post('/addProductToCart', function (req, res) {
    let userName = req.body.UserName;
    let movieID = req.body.MovieID;
    let amount = req.body.Amount;

    let query = squel.insert()
        .into("MoviesInCart")
        .set("UserName", userName)
        .set("MovieID", movieID)
        .set("Amount", amount)
        .toString();

    DButilsAzure.Insert(query)
        .then(function (ans) {
            res.send(ans);
        })
        .catch(function (err) {
            res.send(err);
        });
});
/***************** RESET Password *****************/
app.post('/resetPassword', function (req, res) {
    let userName = req.body.USERNAME;
    let password = req.body.PASSWORD;
    let confirm = req.body.CONFIRM;

    if (password.length < 5 || password.length > 10) {
        res.send('Password should be between 5 to 10 chars');
    }
    else if (password !== confirm) {
        res.send('Confirm passwords wrong');
    }
    else {
        let query = squel.update()
            .table("Passwords")
            .set("Password", password)
            .where("UserName = " + "'" + userName + "'")
            .toString();

        DButilsAzure.Insert(query)
            .then(function (ans) {
                res.send(ans);
            })
            .catch(function (err) {
                res.send(err);
            });
    }
});
/***************** Remove Product From Cart *****************/
app.delete('/removeProductFromCart/:UserName/:MovieID', function (req, res) {

    let userName = req.params.UserName;
    let movieID = req.params.MovieID;
    let query = "DELETE FROM MoviesInCart WHERE UserName=" + "'" + userName + "'" + "AND MovieID=" + "'" + movieID + "'";

    DButilsAzure.Insert(query)
        .then(function (ans) {
            res.send(ans);
        })
        .catch(function (err) {
            res.send(err);
        });
});
/***************** Remove User *****************/
app.delete('/removeUser/:UserName', function (req, res) {
    let userName = req.params.UserName;
    let query = "DELETE FROM Users WHERE UserName=" + "'" + userName + "'";

    DButilsAzure.Select(query)
        .then(function (ans) {
            if (ans > 0) {
                res.send({"Result": true});
            }
            else {
                res.send({"Result": false});
            }
        })
        .catch(function (err) {
            res.send(err);
        });
});
/***************** Remove Product From Stock *****************/
app.delete('/removeProductFromStock/:MovieID', function (req, res) {
    let movieID = req.params.MovieID;
    let query = "DELETE FROM MoviesStock WHERE MovieID=" + "'" + movieID + "'";

    DButilsAzure.Select(query)
        .then(function (ans) {
            if (ans > 0) {
                res.send({"Result": true});
            }
            else {
                res.send({"Result": false});
            }
        })
        .catch(function (err) {
            res.send(err);
        });
});
/***************** Get All Countries *****************/
app.get('/getCountries', function (req, res) {

    let XMLPath = "countries.xml";
    let parser = new xml2js.Parser();
    fs.readFile(XMLPath, function (err, data) {
        parser.parseString(data, function (err, result) {
            console.log(result);
            res.send(result.Countries.Country);
        });
    });
});
/***************** Update Product Details *****************/
app.post('/updateProductDetails', function (req, res) {
    let movieID = req.body.MOVIEID;
    let price = req.body.PRICE;
    let amountInStock = req.body.AMOUNTINSTOCK;
    let rating = req.body.RATING;

    if (!movieID || !price || !amountInStock || !rating) {
        res.send("Parameters are missing");
        res.end();
        return;
    }

    /** Queries **/
    let priceQuery = squel.update()
        .table("MoviesStock")
        .set("Price = " + price)
        .where("MovieID = " + movieID)
        .toString();
    let amountQuery = squel.update()
        .table("MoviesStock")
        .set("AmountInStock = " + amountInStock)
        .where("MovieID = " + movieID)
        .toString();
    let ratingQuery = squel.update()
        .table("MoviesStock")
        .set("Rating = " + rating)
        .where("MovieID = " + movieID)
        .toString();

    DButilsAzure.Insert(priceQuery)
        .then(() => DButilsAzure.Insert(amountQuery))
        .then(() => DButilsAzure.Insert(ratingQuery))
        .then(() => DButilsAzure.Select('SELECT * FROM MoviesStock'))
        .then(function (ans) {
            if (ans.length == 0)
                return Promise.reject('Wrong Parameters');
        })
        .then(() => res.send(true))
        .catch((err) => res.send(err));
});
/***************** Registration *****************/
app.post('/registration', function (req, res) {

    let userName = req.body.USERNAME;
    let firstName = req.body.FIRSTNAME;
    let lastName = req.body.LASTNAME;
    let email = req.body.EMAIL;
    let address = req.body.ADDRESS;
    let country = req.body.COUNTRY;
    let favoriteCat = req.body.FAVORITECAT;
    let isAdmin = req.body.ISADMIN;
    let password = req.body.PASSWORD;
    let petsName = req.body.PETSNAME;
    let favoriteCatSec = req.body.FAVORITECATSEC;

    /** INSERT to Users Table **/
    let usersQuery = squel.insert()
        .into("Users")
        .set("UserName", userName)
        .set("FirstName", firstName)
        .set("LastName", lastName)
        .set("Email", email)
        .set("Address", address)
        .set("Country", country)
        .set("FavoriteCategories", favoriteCat)
        .set("isAdmin", isAdmin)
        .set("PetName", petsName)
        .set("FavoriteCategories2", favoriteCatSec)
        .toString();

    /** INSERT to Passwords Table **/
    let passwordsQuery = squel.insert()
        .into("Passwords")
        .set("UserName", userName)
        .set("Password", password)
        .toString();

    if (password.length < 5 || password.length > 10) {
        res.send('Password should be between 5 to 10 chars');
    }
    else {
        DButilsAzure.Insert(usersQuery)
            .then(() => DButilsAzure.Insert(passwordsQuery))
            .then(() => res.send(true))
            .catch((err) => res.send(err));
    }
});
/***************** Get All Countries XML *****************/
app.get('/getAllCountries', function (req, res) {
    let XMLPath = "countries.xml";
    let parser = new xml2js.Parser();
    fs.readFile(XMLPath, function (err, data) {
        parser.parseString(data, function (err, result) {
            console.log(result);
            res.send(result.Countries.Country);
        });
    });
});
/***************** Cookies *****************/
//let Cookies = require('cookie');
//function setCookies(res){
//    // Set a new cookie with the name
//    res.setHeader('Set-Cookie', Cookies.serialize('name', String('a'), {
//        maxAge: 60 * 60 * 24 * 7 // 1 week
//    }));
//    console.log('cookie');
//    return;
//}
/***************** Recommended Products For User *****************/
app.get('/recommendedProductsForUser/:UserName', function (req, res) {
    console.log("IM in server!!")
    let userName = req.params.UserName;
    let Q1 = 'SELECT FavoriteCategories FROM Users WHERE UserName = ' + "'" + userName + "'";
    let matchedCategory;
    let userNameMatched;
    let n = 'NULL';
    let Q2;
    let Q3;
    let Q4;

    DButilsAzure.Select(Q1)
        .then(function (ans) {
            matchedCategory = ans;
            Q2 = 'SELECT TOP 1 UserName FROM Users WHERE (FavoriteCategories = ' + "'" + matchedCategory + "'" +
                ' OR FavoriteCategories2 = ' + "'" + matchedCategory + "'" + ') AND (UserName != ' + "'" + userName + "'" +
                ') AND (FavoriteCategories2 != ' + "'" + n + "'" + ')';
        })
        .then(() => DButilsAzure.Select(Q2))
        .then(function (ans) {
            userNameMatched = ans;
            Q3 = 'SELECT DISTINCT TOP 1 MovieID FROM MoviesInCart WHERE UserName = ' + "'" + userNameMatched + "'";
        })
        .then(() => DButilsAzure.Select(Q3))
        .then(function (ans) {
            Q4 = 'SELECT MovieName FROM MoviesStock WHERE MovieID = ' + "'" + ans + "'";
        })
        .then(() => DButilsAzure.Select(Q4))
        .then(function (ans) {
            res.send(ans);
        })
        .catch((err) => res.send(err));
});

/***************** PURCHASE *****************/
app.post('/purchase', function (req, res) {
    let userName = req.body.USERNAME;
    let creditCard = req.body.CREDITCARD;
    let shipmentDate = req.body.SHIPMENTDATE;
    let totalAmount;
    let totalMoviesPrice = "30";
    let firstQuery;
    let secondQuery;
    let thirdQuery;
    let fourQuery;
    let fifthQuery;

    /** GET THE TOTAL MOVIES PRICE **/
    firstQuery = "SELECT SUM(MoviesStock.Price) FROM MoviesStock INNER JOIN MoviesInCart ON " +
        "MoviesInCart.UserName = " + "'" + userName + "'" + "AND MoviesInCart.MovieID=MoviesStock.MovieID";
    DButilsAzure.Select(firstQuery)
        .then(function (ans) {
            totalMoviesPrice = ans;
            secondQuery = "SELECT SUM(MoviesInCart.Amount) FROM MoviesInCart WHERE " +
                "MoviesInCart.UserName = " + "'" + userName + "'";
        })
        .then(() => DButilsAzure.Select(secondQuery))
        .then(function (ans) {
            totalAmount = ans;
            thirdQuery = squel.insert()
                .into("CreditCards")
                .set("UserName", userName)
                .set("CardNumber", creditCard)
                .toString();
        })
        .then(() => DButilsAzure.Insert(thirdQuery))
        .then(function (ans) {
            console.log('Credit Card Added Successfully');
            fourQuery = "DELETE FROM MoviesInCart WHERE UserName = " + "'" + userName + "'";
        })
        .then(() => DButilsAzure.Select(fourQuery))
        .then(function (ans) {
            if (ans != 0) {
                totalAmount = result;
                console.log('Deleted from MoviesInCart Successfully');
                fifthQuery = "INSERT INTO Orders VALUES ('" + userName + "', CONVERT(VARCHAR(10),GETDATE(),110)," +
                    " " + "'" + shipmentDate + "'" + ", '" + totalAmount + "' ," + "'" + totalMoviesPrice + "')";
            }
            else {
                console.log('Could not delete user from MoviesInCart');
            }
        })
        .then(() => DButilsAzure.Insert(fifthQuery))
        .then(function (ans) {
            if (ans.length > 0) {
                res.send({"Result": true});
            }
            else {
                res.send({"Result": false});
            }
        })
        .catch((err) => res.send(err));
});