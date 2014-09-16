var app = angular.module('app', [])

app.controller('IndexController', function ($scope, $http) {
  $http('/profile.json').then(function (profile) {
    $scope.profile = profile
  })
})
