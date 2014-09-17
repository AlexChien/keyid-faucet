var app = angular.module('index', [])

app.controller('IndexController', function ($scope, $http) {
  $http.get('/user').success(function (data) {
    $scope.user = data.user
    $scope.register = function (key, name) {
      $http.post('/register', {
        key: key, name: name
      }).success(function (data) {
        $scope.result = data
      })
    }
  })
})
