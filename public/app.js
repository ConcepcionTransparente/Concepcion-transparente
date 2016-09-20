var dcuApp = angular.module('dcuApp', []);

//yearProviderController ME SIRVE PARA EL RANKING DE PROVEEDORES
dcuApp.controller('yearProviderController',['$scope','$http',function($scope,$http){
  //console.debug("Aca inicia mi controlador...");
  $http.get('/api/get-yearprovider').then(
    function(response){
      //console.debug('Mi peticion ya contesto');
      $scope.data=response.data;
    },function(response){
      console.debug('Error --> ' + response);
    });

  $http.post('/api/post-yearprovider').then(
    function(response){
      console.debug(response);
  },function(response){
    console.debug('Error --> ' + response);
  });
  //console.debug("Ya hice mi peticion...");
}]);

//------------------------------------------------------------------------------

//yearController ME SIRVE PARA LAS CONSULTAS GENERALES
dcuApp.controller('yearController',['$scope','$http',function($scope,$http){
  //console.debug("Aca inicia mi controlador...");
  $http.get('/api/get-year').then(
    function(response){
      //console.debug('Mi peticion ya contesto');
      $scope.data=response.data;
    },function(response){
      console.debug(response);
    });

  $http.post('/api/post-year',{
    year: 2016,
    numberOfContracts: 23,
    total_amount: 9999999999
  }).then(
    function(response){
      console.debug(response);
  },function(response){
    console.debug(response);
});



  //console.debug("Ya hice mi peticion...");
  $http.get('/api/get-totalproviders').then(
    function(response){
      //console.debug('Mi peticion ya contesto');
      $scope.data.cantidad=response.data;
    });
    //console.debug("Ya hice mi peticion...");
}]);


// //con dataResource inyectamos la factoría
// app.controller("pruebaController", function ($scope, $http, dataResource) {
//     //hacemos uso de $http para obtener los datos del json
//     $http.get('jsons/yearProvider/providers_2016.json').success(function (data) {
//         //Convert data to array.
//         //datos lo tenemos disponible en la vista gracias a $scope
//         $scope.datos = data;
//     });
//     //datosResource lo tenemos disponible en la vista gracias a $scope
//     $scope.datosResource = dataResource.get();
// });
