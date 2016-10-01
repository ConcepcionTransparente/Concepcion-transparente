var dcuApp = angular.module('dcuApp', []);

//yearProviderController ME SIRVE PARA EL RANKING DE PROVEEDORES
dcuApp.controller('yearProviderController',['$scope','$http',function($scope,$http){
  $http.get('/api/get-yearprovider').then(
    function(response){
      //console.debug('Mi peticion ya contesto');
      $scope.data=response.data;
    },function(response){
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
dcuApp.controller('yearController',['$scope','$http','$q',function($scope,$http,$q){

  //CONSULTAS GENERALES:
  //GET-YEAR (2016 -> TOTAL_AMOUNT)
  //GET-TOTALPROVIDERS
  //GET-TOTALORDERS
  $http.get('/api/get-year').then(
    function(response){
      $scope.data=response.data;
      console.log("TOTAL_AMOUNT: " + $scope.data[0].total_amount);
    },function(response){
      console.debug(response);
    })
    .then($http.get('/api/get-totalproviders').then(
            function(response){
              $scope.data.cantidad=response.data;
            },function(response){
              console.debug(response);
            }))
    .then($http.get('/api/get-totalorders').then(
        function(response){
          $scope.data.totalCompras=response.data;
          console.log("PROBANDOOOOOOOOOOO");
          console.log($scope.data);
        },function(response){
          console.debug(response);
        }));


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


//yearProviderController ME SIRVE PARA EL LINECHART
dcuApp.controller('linechart',['$scope','$http',function($scope,$http){
  $http.get('/api/get-linechart').then(
    function(response){
      //console.debug('Mi peticion ya contesto');
      $scope.data=response.data;
      console.log("SE RECIBIO EL LINECHART  A FRONTEND");
      console.log($scope.data);

      var linechart = c3.generate({
          bindto: '#lineschart',
          data: {
            // url: 'example.json', //la carpeta raiz de busqueda es /public/
            json: $scope.data,
            mimeType: 'json',
            keys: {
                x: 'year', // it's possible to specify 'x' when category axis
                value: ['total_amount'],
            },
            names: {
              amount: 'Evolución del gasto'
            }
          },
          axis: {
              x: {
                type: 'category'
              },
              y : {
                tick: {
                  format: d3.format("$,")
                }
              }
          },
          grid: {
            x: {
              show: true
            },
            y: {
              show: true
            }
          },
          tooltip: {
        format: {
          name: function (name, ratio, id, index) { return 'Monto'; }
        }
      }
        });
      //   setTimeout(function () {
      //     linechart.transform('bar', 'amount');
      // }, 2000);

    },function(response){
      console.debug('Error --> ' + response);
    });

}]);
