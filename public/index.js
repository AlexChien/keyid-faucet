var app = angular.module('index', [])

app.controller('IndexController', function ($scope, $http) {
  $http.get('/profile.json').success(function (data) {
    $scope.profile = data.profile
  })
})
