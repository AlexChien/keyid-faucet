var app = angular.module('index', [])

app.controller('IndexController', function ($scope, $http) {
  $http.get('/profile.json').then(function (profile) {
    $scope.profile = profile
  })
})
