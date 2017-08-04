let app = angular.module('myApp', ['ngRoute']);
let UserName = "";
let users = [];
//-------------------------------------------------------------------------------------------------------------------

app.controller('mainController', ['UserService', function (UserService) {
    let vm = this;
    vm.userService = UserService;
}]);

//-------------------------------------------------------------------------------------------------------------------
app.controller('loginController', ['UserService', '$location', '$window',
    function (UserService, $location, $window) {
        let self = this;
        self.user = {
            username: '',
            password: ''
        };
        self.login = function (valid) {
            if (valid) {
                UserService.login(self.user).then(function (success) {
                    $window.alert('You are logged in');
                    $location.path('/store');
                }, function (error) {
                    self.errorMessage = error.data;
                    $window.alert('log-in has failed');
                })
            }
        };
    }]);
//-------------------------------------------------------------------------------------------------------------------
app.controller('logoutController', ['UserService', '$location', '$window',
    function (UserService, $location, $window) {
        let self = this;
        self.logout = function () {
            UserService.isLoggedIn = false;
            $window.alert('You have logged out!');
            $location.path('/login');
        };
    }]);
//-------------------------------------------------------------------------------------------------------------------
app.controller('registerController', ['UserServiceReg', '$http', '$location', '$window',
    function (UserServiceReg, $http, $location, $window) {
        let self = this;
        self.user = {
            USERNAME: '',
            FIRSTNAME: '',
            LASTNAME: '',
            EMAIL: '',
            ADDRESS: '',
            COUNTRY: '',
            FAVORITECAT: '',
            ISADMIN: '0',
            PASSWORD: '',
            PETSNAME: '',
            FAVORITECATSEC: ''
        };

        self.countrylist = [];
        $http.get("countries.xml").then(function (xml) {
            if (xml.data.length > 0) {
                var tmp = xml.data.toString().split("<Name>");
                var tmp2 = tmp;
                for (var i = 1; i < tmp2.length; i++) {
                    var n = tmp2[i].search("</Name>")
                    self.countrylist[i - 1] = tmp2[i].slice(0, n);
                }
            }
        });

        self.register = function (valid) {
            if (valid) {
                UserServiceReg.register(self.user).then(function (success) {
                    $window.alert('Registration Succeeded');
                    $location.path('/login');
                }, function (error) {
                    self.errorMessage = error.data;
                    $window.alert('Registration has failed');
                })
            }
        };
    }]);
//--------------------------------------------------------------------------------------------------------------------
app.controller('storeController', ['$http', function ($http) {
    let self = this;
    self.products = [];
    self.topProducts = [];
    self.newProducts = [];
    self.recommendedProducts = [];
    self.sum_shay = 0;

    self.getProducts = function () {
        $http.get('/getAllProducts').then(function (response) {
            self.products = response.data;
            self.reverseSort = false;
            self.filterBy = "";


            self.addCart = function (movieid, amount) {
                self.productToCart = {
                    UserName: '',
                    MovieID: '',
                    Amount: ''
                };
                self.productToCart.UserName = UserName;
                self.productToCart.MovieID = movieid;
                self.productToCart.Amount = amount;

                console.log(self.productToCart);

                $http.post('/addProductToCart', self.productToCart)
                    .then(function (response) {
                        if (response) {
                            alert("product added successfully!");
                        } else {
                            alert("product added failed");
                        }
                    });
            }

            self.removeCart = function (movieid) {

                self.productToRemove = {
                    UserName: '',
                    MovieID: ''
                };
                self.productToRemove.UserName = UserName;
                self.productToRemove.MovieID = movieid;

                $http.delete('/removeProductFromCart/' + self.productToRemove.UserName + "/" + self.productToRemove.MovieID, self.productToRemove)
                    .then(function (response) {
                        if (response) {
                            alert("product removed successfully!");
                        } else {
                            alert("product removed failed!");
                        }
                    });

            }, function (errResponse) {
                console.error('Error while fetching products');
            }
        });
    }

    self.getTopProducts = function () {
        $http.get('/getTop5HotProducts').then(function (response) {
            self.topProducts = response.data;
            self.reverseSort = false;
            self.filterBy = "";
        });
    }

    self.getNewProducts = function () {
        $http.get('/getLatestMonthlyProducts').then(function (response) {
            self.newProducts = response.data;
            self.reverseSort = false;
            self.filterBy = "";
        });
    }

    self.getRecommendProducts = function () {
        $http.get('/recommendedProductsForUser/' + UserName).then(function (response) {
            self.recommendedProducts = response.data;
            self.reverseSort = false;
            self.filterBy = "";
            if (response.data.length > 0) {
                alert("We found a recommended movie for you!")
            }
            else {
                alert("We have not found a recommended movie for you!")
            }

        });
    }

}]);
//-------------------------------------------------------------------------------------------------------------------
app.controller('cartController', ['$http', function ($http) {
    let self = this;
    self.cart = [];
    self.getMyCart = function () {
        $http.get('/showCart/' + UserName).then(function (response) {
            self.cart = response.data;
            self.reverseSort = false;
            self.filterBy = "";
            self.filterBy = "";

            self.purchase = function () {
                alert("product purchased successfully!");
            };
        });
    };
}]);

//-------------------------------------------------------------------------------------------------------------------
// Our new service - we built it
app.factory('UserService', ['$http', function ($http) {
    let service = {};
    service.isLoggedIn = false;
    service.login = function (user) {
        return $http.post('/login', user)
            .then(function (response) {
                let token = response.data;
                $http.defaults.headers.common = {
                    'my-Token': token,
                    'user': user.username
                };
                UserName = user.username;
                service.isLoggedIn = true;
                return Promise.resolve(response);
            })
            .catch(function (e) {
                return Promise.reject(e);
            });
    };
    return service;
}]);

//-------------------------------------------------------------------------------------------------------------------
// Our new service - we built it
app.factory('UserServiceReg', ['$http', function ($http) {
    let service = {};
    service.register = function (user) {
        return $http.post('/registration', user)
            .then(function (response) {
                return Promise.resolve(response);
            })
            .catch(function (e) {
                return Promise.reject(e);
            });
    };
    return service;
}]);

//---------------------------------------------------------------------------------------------------------------------
// Configuration section
app.config(['$locationProvider', function ($locationProvider) {
    $locationProvider.hashPrefix('');
}]);
app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "views/home.html",
            controller: "mainController"
        })
        .when("/login", {
            templateUrl: "views/login.html",
            controller: "loginController"
        })
        .when("/registration", {
            templateUrl: "views/registration.html",
            controller: 'registerController'
        })
        .when("/store", {
            templateUrl: "views/store.html",
            controller: 'storeController'
        })
        .when("/myCart", {
            templateUrl: "views/cart.html",
            controller: 'cartController'
        })
        .when("/about", {
            templateUrl: "views/about.html",
            controller: 'mainController'
        })
        .otherwise({
            redirect: '/',
        });
}]);
//-------------------------------------------------------------------------------------------------------------------