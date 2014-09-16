var app = angular.module('index', [])

app.controller('IndexController', function ($scope, $http) {
  $http.get('/user.json').success(function (data) {
    $scope.user = data.user
  })
})
