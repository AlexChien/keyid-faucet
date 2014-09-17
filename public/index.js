var app = angular.module('index', [])

app.controller('IndexController', function ($scope, $http) {
  $http.get('/user').success(function (data) {
    $scope.user = data.user
    $scope.register = function (key, name) {
      $http({
        method: 'POST', url: '/register-account',
        data: { key: key, name: name }
      }).success(function (data) {
        $scope.result = data
      })
    }
  })
})
