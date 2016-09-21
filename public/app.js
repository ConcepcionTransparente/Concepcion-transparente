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

  $http.post('/api/post-year').then(
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
