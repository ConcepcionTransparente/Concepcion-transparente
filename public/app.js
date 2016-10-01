var dcuApp = angular.module('dcuApp', []);

//yearProviderController ME SIRVE PARA EL RANKING DE PROVEEDORES
dcuApp.controller('yearProviderController', ['$scope', '$http', function($scope, $http) {
    $http.get('/api/get-yearprovider').then(
        function(response) {
            //console.debug('Mi peticion ya contesto');
            $scope.data = response.data;
        },
        function(response) {
            console.debug('Error --> ' + response);
        });

    // $http.post('/api/post-yearprovider').then(
    //   function(response){
    //     console.debug(response);
    // },function(response){
    //     console.debug('Error --> ' + response);
    // });

}]);


//------------------------------------------------------------------------------

//yearController ME SIRVE PARA LAS CONSULTAS GENERALES
dcuApp.controller('yearController', ['$scope', '$http', '$q', function($scope, $http, $q) {

    //CONSULTAS GENERALES:
    //GET-YEAR (2016 -> TOTAL_AMOUNT)
    //GET-TOTALPROVIDERS
    //GET-TOTALORDERS
    $http.get('/api/get-year').then(function(response) {
            $scope.data = response.data;
            console.log("TOTAL_AMOUNT: " + $scope.data[0].total_amount);
            console.debug("1st callback...");
            return $http.get('/api/get-totalproviders');
        })
        .then(function(response) {
            $scope.data.cantidad = response.data;
            console.debug("2nd callback...");
            return $http.get('/api/get-totalorders');
        })
        .then(function(response) {
            $scope.data.totalCompras = response.data;
            console.debug("3rd callback...");
            console.log($scope.data);
        })
        .catch(function(error){
            console.warn("ERROR...");
            console.log(error);
        });



    // $http.post('/api/post-year').then(
    //   function(response){
    //     console.debug(response);
    // },function(response){
    //   console.debug(response);
    // });







    // GET CANTIDAD DE PROVEEDORES
    // $http.get('/api/get-totalproviders').then(
    //   function(response){
    //     //console.debug('Mi peticion ya contesto');
    //     $scope.data.cantidad=response.data;
    //     $scope.data.totalCompras=response.data;
    //
    //   });
    //CANTIDAD DE ORDENES DE COMPRA
    // $http.get('/api/get-totalorders').then(
    //   function(response){
    //     $scope.data.totalCompras=response.data;
    //     // console.log($scope.data[0].sumatoria);
    //
    //   });
    //console.debug("Ya hice mi peticion...");




}]);
