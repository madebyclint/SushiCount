(function() {

  var Helpers = {
    reset: function(parentNode, childrenNode) {
      var inputs = parentNode.querySelectorAll(childrenNode);
      for(var i = 0, len = inputs.length; i < len; i++) {
        // console.log(inputs[i].value);
        inputs[i].value = '';
      }
    },
    checkDupes: function(thisArray, valueToCheck) {
      return thisArray.indexOf(valueToCheck);
    }
  };

  var Tests = {
    dupesInArray: function() {
      describe('restaurantDupes', function () {

        beforeEach(angular.mock.module('SushiCount'));

        beforeEach(angular.mock.inject(function(_$controller_){
          $controller = _$controller_;
        }));

        describe('checkForRestaurantDupes', function() {
          function combineArrays() {
            var $scope = {};
            var controller = $controller('RestaurantsController', { $scope: $scope });
            $scope.restaurants = ['one', 'two', 'three'];
            $scope.newRestaurants = ['four', 'two', 'five', 'six', 'one'];
            $scope.newRestaurants.map(function(restaurant) {
              if(Helpers.checkDupes($scope.restaurants, restaurant) === -1) {
                $scope.restaurants.push(restaurant);
              }
            });
            return $scope.restaurants;
          }
          it('["one", "two", "three"] combined with ["four", "two", "five", "six", "one"] should have a length of 6', function() {
            expect(combineArrays().length).toBe(6);
          });
          it('["one", "two", "three"] combined with ["four", "two", "five", "six", "one"] to be ["one", "two", "three", "four", "five", "six"]', function() {
            expect(combineArrays()).toEqual(['one', 'two', 'three', 'four', 'five', 'six']);
          });
        });
      });
    }
  };

  var Modules = {
    SC: function() {
      var thismod = angular.module('SushiCount', ['ngRoute', 'ngStorage', 'ngAnimate']);


      /*===============================
      =            FILTERS            =
      ===============================*/

      thismod.filter('escape', function() {
        return window.encodeURIComponent;
      });

      // Came from the comments here:  https://gist.github.com/maruf-nc/5625869
      thismod.filter('titlecase', function() {
          return function (input) {
              var smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i;

              input = input.toLowerCase();
              return input.replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, function(match, index, title) {
                  if (index > 0 && index + match.length !== title.length &&
                      match.search(smallWords) > -1 && title.charAt(index - 2) !== ":" &&
                      (title.charAt(index + match.length) !== '-' || title.charAt(index - 1) === '-') &&
                      title.charAt(index - 1).search(/[^\s-]/) < 0) {
                      return match.toLowerCase();
                  }

                  if (match.substr(1).search(/[A-Z]|\../) > -1) {
                      return match;
                  }

                  return match.charAt(0).toUpperCase() + match.substr(1);
              });
          };
      });

      // Came from the comments here:  https://gist.github.com/maruf-nc/5625869
      thismod.filter('initials', function() {
          return function (input) {
              var words = input.split(' ');
              var initials = [];
              words.map(function(word) {
                initials.push(word.charAt(0).toUpperCase());
              });
              return initials.join('');
          };
      });



      /*=====  End of FILTERS  ======*/


      thismod.controller('RestaurantsController', function($scope, $localStorage, $sessionStorage) {
        $scope.restaurants = $localStorage.scRestaurants ? $localStorage.scRestaurants : [];
        // console.log($localStorage);
        $scope.submitForm = function(restaurant) {
            // check to make sure the form is completely valid
            if($scope.restaurant_form.$valid) {
              $scope.addRestaurant(restaurant);
            }
        };
        $scope.getPlateCount = function(restaurantid) {
          return 'count', $scope.restaurants[restaurantid].plates ? $scope.restaurants[restaurantid].plates.length : 0;
        };
        $scope.addRestaurant = function(restaurant) {
          var newRestaurant = angular.copy(restaurant);
          newRestaurant.plates = [];
          $scope.restaurants.push(newRestaurant);
          $localStorage.scRestaurants = $scope.restaurants;
          Helpers.reset(document.getElementById('restaurant_form'), 'input');
          // window.location = '#/plates?restaurantid=' + $scope.restaurantid;
          window.location = '#/restaurants';
        };
        $scope.clearRestaurants = function() {
          var r = confirm('Are you sure you want to clear all your saved restaurants?\nYou will not be able to undo this.');
          if (r === true) {
              delete $localStorage.scRestaurants;
              $scope.restaurants = [];
          }
        };
      });

      thismod.controller('PlatesController', function ($scope, $localStorage, $sessionStorage, $location, $filter) {
        $scope.restaurants = $localStorage.scRestaurants;
        $scope.restaurantid = $location.search().restaurantid;
        $scope.restaurant = $scope.restaurants[$scope.restaurantid].name;
        // console.log($localStorage);
        $scope.plates = $scope.restaurants[$scope.restaurantid].plates ? $scope.restaurants[$scope.restaurantid].plates : [];
        $scope.submitForm = function(plate) {
            // check to make sure the form is completely valid
            if($scope.plate_form.$valid) {
              $scope.addPlate(plate);
            }
        };
        $scope.addPlate = function(newPlateObj) {
          var newPlate = angular.copy(newPlateObj);
          newPlate.slug = $filter('escape')(newPlate.name);
          newPlate.slug = newPlate.slug.toLowerCase();
          newPlate.count = 0;
          $scope.plates.push(newPlate);
          $localStorage.scRestaurants[$scope.restaurantid].plates = $scope.plates;
          Helpers.reset(document.getElementById('plate_form'), 'input');
        };
        $scope.clearPlates = function() {
          var r = confirm('Are you sure you want to clear all your saved plates?\nYou will not be able to undo this.');
          if (r === true) {
              $localStorage.scRestaurants[$scope.restaurantid].plates = [];
              $scope.plates = [];
          }
        };
        // $scope.saveTally = function() {
        //   $localStorage.scReceipts =
        // };
        $scope.resetCounts = function() {
          var r = confirm('Are you sure you want to clear all your saved plates?\nYou will not be able to undo this.');
          if (r === true) {
              $scope.plates.map(function(plate) {
                plate.count = 0;
              });
          } else {
              // alert('cancel');
          }
        };
        $scope.increasePlate = function(plate) {
          plate.count++;
        };
        $scope.decreasePlate = function(plate) {
          plate.count > 0 && plate.count--;
        };
        $scope.getSubtotal = function(price, count) {
          return price * count;
        };
        $scope.getTotal = function() {
          var total = 0;
          $scope.plates.map(function(plate) {
            total += plate.price * plate.count;
          });
          return total;
        };
      });

      thismod.controller('PlateController', function ($scope, $localStorage, $sessionStorage, $location, $filter) {
        $scope.restaurants = $localStorage.scRestaurants;
        $scope.restaurantid = $location.search().restaurantid;
        $scope.restaurant = $scope.restaurants[$scope.restaurantid].name;

        $scope.plateid = $location.search().plateid;
        $scope.plate = $scope.restaurants[$scope.restaurantid].plates[$scope.plateid];
        $scope.submitForm = function(plate) {
            // check to make sure the form is completely valid
            if($scope.plate_details_form.$valid) {
              $scope.updatePlate(plate);
            }
        };
        $scope.updatePlate = function(plateDetails) {
          $scope.plate = plateDetails;
          console.log($scope.plate.name + ' has been updated.');
          window.location = '#/plates?restaurantid=' + $scope.restaurantid;
        };
        $scope.deletePlate = function() {
          var r = confirm('Are you sure you want to delete this plate?\nYou will not be able to undo this.');
          if (r === true) {
              console.log($scope.plate.name + ' has been deleted.');
              $scope.restaurants[$scope.restaurantid].plates.splice($scope.plateid, 1);
              window.location = '#/plates?restaurantid=' + $scope.restaurantid;
          }
        };
      });

      thismod.controller('HomeController', function ($scope) {});

      thismod.controller('AboutController', function ($scope) {});

      thismod.config(function ($routeProvider) {
          $routeProvider.
          when('/home', {
              templateUrl: 'embedded.home.html',
              controller: 'HomeController'
          }).
          when('/about', {
              templateUrl: 'embedded.about.html',
              controller: 'AboutController'
          }).
          when('/restaurants', {
              templateUrl: 'embedded.restaurants.html',
              controller: 'RestaurantsController'
          }).
          when('/addrestaurant', {
              templateUrl: 'embedded.addrestaurant.html',
              controller: 'RestaurantsController'
          }).
          when('/plates', {
              templateUrl: 'embedded.plates.html',
              controller: 'PlatesController'
          }).
          when('/addplate', {
              templateUrl: 'embedded.addplate.html',
              controller: 'PlatesController'
          }).
          when('/plate', {
              templateUrl: 'embedded.plate.html',
              controller: 'PlateController'
          }).
          otherwise({
              redirectTo: '/restaurants'
          });
      });

      return thismod;
    }
  };


  var Init = (function() {
    // Initialize tests
    // Tests.dupesInArray();
    // Initialize Modules
    Modules.SC();
  })();




})();