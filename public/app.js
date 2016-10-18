////////////////////////////////////////////////////////////////////////////////
//////////////////////////////ANGULAR JS////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
var dcuApp = angular.module('dcuApp', []);

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

//yearController ME SIRVE PARA LAS CONSULTAS GENERALES
dcuApp.controller('generalController', ['$scope', '$http', '$q', function($scope, $http, $q) {

    //CONSULTAS GENERALES:
    //GET-YEAR (2016 -> TOTAL_AMOUNT)
    //GET-TOTALPROVIDERS
    //GET-TOTALORDERS
    // $http.get('/api/get-totalorders').then(function(response) {
    //         $scope.data = response.data;
    //         console.log($scope.data);
    //   console.log("RESPONSE"+response);
    //         // $scope.data.totalCompras = response.data;
    //         // console.log($scope.data.totalCompras);
    //         console.log("1erst callback!!!!");
    //         return $http.get('/api/get-totalproviders');
    //     })
    //     .then(function(response){
    //       console.log("Cantidad de proveedores:"+response);
    //       $scope.data.totalproviders = response.data;
    //     })
    $http.get('/api/get-totalorders').then(function(response) {
      // console.log(response);
      $scope.totalorders=response;
      console.log($scope.totalorders.data);
      return $http.get('/api/get-totalproviders');

    })
        .then(function(response) {
            $scope.totalproviders = response;
            console.log($scope.totalproviders.data);
            console.debug("2nd callback...");
            return $http.get('/api/get-orders');
        })
        .then(function(response) {
            $scope.orders = response;
            console.log($scope.orders.data);
            console.debug("3nd callback...");
          })
        .catch(function(error){
            console.warn("ERROR...");
            console.log(error);
        });
    // $http.get('/api/general').then(function(response) {
    //         $scope.data = response.data;
    //         console.log("TOTAL_AMOUNT: " + $scope.data[0].total_amount);
    //         console.debug("1st callback...");
    //         return $http.get('/api/get-totalproviders');
    //     })
    //     .then(function(response) {
    //         $scope.data.cantidad = response.data;
    //         console.debug("2nd callback...");
    //         return $http.get('/api/get-totalorders');
    //     })
    //     .then(function(response) {
    //         $scope.data.totalCompras = response.data;
    //         console.debug("3rd callback...");
    //         console.log($scope.data);
    //     })
        // .catch(function(error){
        //     console.warn("ERROR...");
        //     console.log(error);
        // });

    // $http.get('/api/general').then(function(response){
    //   $scope.data = response.data;
    //   console.log($scope.data);
    // })
    // .then(function(response) {
    //         $scope.data.totalProviders = response.data;
    //         console.debug("2nd callback...");
    //         return $http.get('/api/get-generalTotalProviders');
    //     })


    // $http.post('/api/post-year').then(
    //   function(response){
    //     console.debug(response);
    // },function(response){
    //     console.debug('Error --> ' + response);
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

 ////////////////////////////////////////////////////////////////////////////////
 ////////////////////////////////////////////////////////////////////////////////
 ////////////////////////////////////////////////////////////////////////////////
 dcuApp.controller('linechartController',['$scope','$http', function($scope, $http){
   $http.get('/api/get-linechart').then(function(response){
     $scope.data = response.data;
     console.log($scope.data);
     var linechart = c3.generate({
         bindto: '#lineschart',
         data: {
           // url: 'example.json', //la carpeta raiz de busqueda es /public/
           json: $scope.data,
           mimeType: 'json',
           keys: {
               x: '_id', // it's possible to specify 'x' when category axis
               value: ['import'],
           },
           names: {
             amount: 'Evolución del gasto'
           }
         },
         color: {
         pattern: ['#4db6ac']
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
   }),
   function(response){
     console.debug('Error' + response);
   }
 }]);
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// RANKING DE PROVEEDORES
dcuApp.controller('rankingController', ['$scope', '$http', function($scope, $http) {

    $http.get('/api/get-ranking').then(function(response) {
            $scope.data = response.data;
            console.log($scope.data);
        },
        function(response) {
            console.debug('Error:' + response);
        });

}]);
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// CONTRATOS DE OBRAS PUBLICAS Y SERVICIOS
// Reparticion - Proveedor - Detalle
dcuApp.controller('purchaseController', ['$scope', '$http',  function($scope, $http) {
  $scope.sortType     = ''; // set the default sort type
  $scope.sortReverse  = false;  // set the default sort order
  $scope.searchPurchase   = '';     // set the default search/filter term
  $http.get('/api/get-purchase').then(function(response) {
          $scope.data = response.data;
          // console.log($scope.data);
          //show more functionality
          var pagesShown = 1;
          var pageSize = 5;

   $scope.paginationLimit = function(data) {
       return pageSize * pagesShown;
   };
   $scope.hasMoreItemsToShow = function() {
       return pagesShown < ($scope.data.length / pageSize);
   };
   $scope.showMoreItems = function() {
       pagesShown = pagesShown + 1;
   };

      }),
      function(response) {
          console.debug('Error:' + response);
      };
}]);
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
