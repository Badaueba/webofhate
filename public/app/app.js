var webofhate = angular.module('webofhate', [

]);

webofhate.controller('mainController', mainController)
function mainController () {
    var vm = this;
}

webofhate.controller('profileController', profileController)
function profileController ($httpReqs) {
    var vm = this;
    vm.serverMessage = "";
    vm.userdata = {
        password : "",
        username : ""
    };
    vm.signin = function () {
        $httpReqs.post('auth/signin', vm.userdata)
            .then(function (response) {
                console.log(response.data);
                vm.serverMessage = response.data.message;

                if (response.data.success){
                    vm.successLogin(1500);
                    window.localStorage.setItem("username", response.data.username);
                }
            });
    };
    vm.signup = function () {
        $httpReqs.post("auth/signup", vm.userdata)
            .then(function (response) {
                console.log(response.data);
                vm.serverMessage = response.data.message;
                if(response.data.success){
                    vm.signin();
                }

            })
    }

    vm.successLogin = function (time) {
        setTimeout(function () {
            $('#authModal').modal('hide');
            window.game.state.start("Menu");
        }, time)
    }
}

webofhate.factory("$httpReqs", httpReqs);
function httpReqs ($http) {
    var factory = {};
    factory.get = function (route) {
        return $http.get(route);
    };
    factory.post = function (route, data) {
        return $http.post(route, data);
    };
    return factory;
}
