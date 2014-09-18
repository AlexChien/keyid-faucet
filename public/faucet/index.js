var app = angular.module('index', [])

app.controller('IndexController', function ($scope, $http) {
  $http.get('/user').success(function (data) {
    $scope.user = data.user
    $scope.register_account = function () {
      $http.post('/register-account', {
        key: $scope.key, name: $scope.name
      }).success(function (data) {
        if (data.error) {
          $scope.error = data.error
        } else {
          $scope.result = data.result
        }
      })
    }
  })
})
