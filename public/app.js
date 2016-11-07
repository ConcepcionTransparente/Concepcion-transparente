////////////////////////////////////////////////////////////////////////////////
//////////////////////////////ANGULAR JS////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
var dcuApp = angular.module('dcuApp', ['ui.router','720kb.datepicker','720kb.socialshare','ngSanitize', 'ngCsv']);
dcuApp.config(
    ["$stateProvider", "$urlRouterProvider",
        function($stateProvider, $urlRouterProvider) {

            $urlRouterProvider.otherwise("/");

            $stateProvider
                .state('home', {
                    url: '/',
                    views: {
                        'History': {
                            templateUrl: './views/history.html',
                            controller: 'historyController'
                        },
                        'General': {
                            templateUrl: './views/general.html',
                            controller: 'generalController'
                        },
                        'Bubblechart': {
                            templateUrl: './views/bubblechart.html',
                            controller: 'bubblechartController'
                        },
                        'Linechart': {
                            templateUrl: './views/linechart.html',
                            controller: 'linechartController'
                        },
                        'Ranking': {
                            templateUrl: './views/ranking.html',
                            controller: 'rankingController'
                        },
                        'RankingObraPublica': {
                            templateUrl: './views/rankingobra.html',
                            controller: 'rankingObraPublicaController'
                        },
                        'Purchases': {
                            templateUrl: './views/purchaseorder.html',
                            controller: 'purchaseController'
                        },
                        'Static2015': {
                            templateUrl: './views/static2015.html',
                        }
                    }
                })
                .state('Detail', {
                    url: '/:id',
                    views: {
                        'Detail': {
                            templateUrl: './views/detail.html',
                            controller: 'detailController'
                        }
                    }
                })

        }
    ]);

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//Consultas generales
dcuApp.controller('historyController',['$scope','$http', function($scope,$http){
  $http.get('/api/get-importHistory')
    .then(function(response){
      $scope.importHistory = response.data[0];
      return $http.get('/api/get-ordersHistory');
    })
    .then(function(response){
      $scope.ordersHistory = response.data;
      return $http.get('/api/get-providersHistory');
    })
    .then(function(response){
      $scope.providersHistory = response.data;
    })
    .catch(function(error){
      console.log(error);
    });
}]);
dcuApp.controller('generalController', ['$scope', '$http', '$q', function($scope, $http, $q) {
    $scope.generalfilterini = new Date(2009,00,01);
    $scope.generalfilterfin = new Date();
    $scope.submit = function(){
      $http.post('/api/post-totalimport',{"valorini":$scope.generalfilterini,"valorfin":$scope.generalfilterfin})
      .then(function(response) {
              console.log($scope.generalfilterini);
              console.log($scope.generalfilterfin);
              $scope.totalimport = response.data[0];
              // console.debug("1st callback...");
              return $http.post('/api/post-totalproviders',{"valorini":$scope.generalfilterini,"valorfin":$scope.generalfilterfin});
          })
      .then(function(response) {
          $scope.totalproviders = response.data;
          // console.debug("2nd callback...");
          return $http.post('/api/post-totalorders',{"valorini":$scope.generalfilterini,"valorfin":$scope.generalfilterfin});
      })
      .then(function(response) {
          $scope.totalorders = response.data;
          // console.debug("3nd callback...");
      })
      .catch(function(error) {
          console.warn("ERROR...");
          console.log(error);
      });
    };

}]);
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//Bubblechart (comparación entre proveedores)
dcuApp.controller('bubblechartController', ['$scope', '$http', function($scope, $http) {
  $scope.bubblefilterini = new Date(2009,00,01);
  $scope.bubblefilterfin = new Date();
  $scope.searchPurchase = "undefined";

  $http.get('/api/get-categories').then(function(response){
    $scope.categories = response.data;
  });

  $scope.submit = function(){

    var svg = d3.select("#bubbleChart");
    svg.selectAll("*").remove();

    function bubbleChart() {
        var w = window,
            d = document,
            e = d.documentElement,
            g = d.getElementById('bubbleChartFather'),
            width = w.innerWidth || e.clientWidth || g.clientWidth,
            // width = g.clientWidth,
            height = w.innerHeight || e.clientHeight || g.clientHeight;
        //ACA ESTA EL PROBLEMA DEL RESIZE - EL CENTRO LO CALCULA MAL
        // console.log("Bubblechart WIDTH: " + width);
        // console.log("Bubblechart HEIGHT: " + height);
        if(width < 600){ width += 750}

        // tooltip for mouseover functionality
        var tooltip = floatingTooltip('gates_tooltip', 240);

        // Locations to move bubbles towards, depending
        // on which view mode is selected.
        var center = {
            x: width / 2,
            y: height / 2
        };
        // console.log("Bubblechart CENTER.x: " + center.x);
        // console.log("Bubblechart CENTER.y: " + center.y);


        var yearCenters = {
            2008: {
                x: width / 3,
                y: height / 2
            },
            2009: {
                x: width / 2,
                y: height / 2
            },
            2010: {
                x: 2 * width / 3,
                y: height / 2
            }
        };

        // X locations of the year titles.
        var yearsTitleX = {
            2008: 160,
            2009: width / 2,
            2010: width - 160
        };

        // Used when setting up force and
        // moving around nodes
        var damper = 0.102;

        // These will be set in create_nodes and create_vis
        var svg = null;
        var bubbles = null;
        var nodes = [];

        // Charge function that is called for each node.
        // Charge is proportional to the diameter of the
        // circle (which is stored in the radius attribute
        // of the circle's associated data.
        // This is done to allow for accurate collision
        // detection with nodes of different sizes.
        // Charge is negative because we want nodes to repel.
        // Dividing by 8 scales down the charge to be
        // appropriate for the visualization dimensions.
        function charge(d) {
            return -Math.pow(d.radius, 2.0) / 8;
        }

        // Here we create a force layout and
        // configure it to use the charge function
        // from above. This also sets some contants
        // to specify how the force layout should behave.
        // More configuration is done below.
        var force = d3.layout.force()
            .size([width, height])
            .charge(charge)
            .gravity(-0.01)
            .friction(0.9);


        // Nice looking colors - no reason to buck the trend
        var fillColor = d3.scale.ordinal()
            .domain(['low', 'medium', 'high'])
            .range(['#4db6ac', '#ffffff', '#202020']);

        // Sizes bubbles based on their area instead of raw radius
        var radiusScale = d3.scale.pow()
            // .exponent(0.5)
            .exponent(0.7)
            .range([2, 85]);

        if (width < 500) {
            var radiusScale = d3.scale.pow()
                // .exponent(0.5)
                .exponent(0.9)
                .range([2, 85]);
        }

        /*
         * This data manipulation function takes the raw data from
         * the CSV file and converts it into an array of node objects.
         * Each node will store data and visualization values to visualize
         * a bubble.
         *
         * rawData is expected to be an array of data objects, read in from
         * one of d3's loading functions like d3.csv.
         *
         * This function returns the new node array, with a node in that
         * array for each element in the rawData input.
         */
        function createNodes(rawData) {
            // Use map() to convert raw data into node data.
            // Checkout http://learnjsdata.com/ for more on
            // working with data.
            var myNodes = rawData.map(function(d) {
                // console.log(d.total_amount);
                // d.total_amount = d.total_amount.split(',')[0];
                // console.log(d.total_amount);
                return {
                    id: d.total_amount,
                    radius: radiusScale(+d.total_amount),
                    value: d.total_amount,
                    name: d._id.grant_title,
                    // org: d.organization,
                    // group: d.group,
                    // year: d.start_year,
                    x: Math.random() * 900,
                    y: Math.random() * 800
                };
            });

            // sort them to prevent occlusion of smaller nodes.
            myNodes.sort(function(a, b) {
                return b.value - a.value;
            });

            return myNodes;
        }

        /*
         * Main entry point to the bubble chart. This function is returned
         * by the parent closure. It prepares the rawData for visualization
         * and adds an svg element to the provided selector and starts the
         * visualization creation process.
         *
         * selector is expected to be a DOM element or CSS selector that
         * points to the parent element of the bubble chart. Inside this
         * element, the code will add the SVG continer for the visualization.
         *
         * rawData is expected to be an array of data objects as provided by
         * a d3 loading function like d3.csv.
         */
        var chart = function chart(selector, rawData) {
            // Use the max total_amount in the data as the max in the scale's domain
            // note we have to ensure the total_amount is a number by converting it
            // with `+`.
            var maxAmount = d3.max(rawData, function(d) {
                return +d.total_amount;
            });
            radiusScale.domain([0, maxAmount]);

            nodes = createNodes(rawData);
            // Set the force's nodes to our newly created nodes array.
            force.nodes(nodes);

            // Create a SVG element inside the provided selector
            // with desired size.
            //000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
            // svg = d3.select(selector)
            //   .append('svg')
            //   .attr('width', width)
            //   .attr('height', height);
            svg = d3.select(selector)
                //.append('svg')
                //.attr('width', width)
                //.attr('height', height);
                .classed("svg-container", true) //container class to make it responsive
                .append("svg")
                //responsive SVG needs these 2 attributes and no width and height attr
                .attr("preserveAspectRatio", "xMidYMid meet")
                .attr("viewBox", "0 0 1200 900")
                //class to make it responsive
                .classed("svg-content-responsive", true);

            // Bind nodes data to what will become DOM elements to represent them.
            bubbles = svg.selectAll('.bubble')
                .data(nodes, function(d) {
                    return d.id;
                });

            // Create new circle elements each with class `bubble`.
            // There will be one circle.bubble for each object in the nodes array.
            // Initially, their radius (r attribute) will be 0.
            bubbles.enter().append('circle')
                .classed('bubble', true)
                .attr('r', 0)
                .attr('fill', function(d) {
                    return fillColor(d.group);
                })
                .attr('stroke', function(d) {
                    return d3.rgb(fillColor(d.group)).darker();
                })
                .attr('stroke-width', 2)
                .on('mouseover', showDetail)
                .on('mouseout', hideDetail);


            // Fancy transition to make bubbles appear, ending with the
            // correct radius
            bubbles.transition()
                .duration(2000)
                .attr('r', function(d) {
                    return d.radius;
                });

            // Set initial layout to single group.
            groupBubbles();
        };

        /*
         * Sets visualization in "single group mode".
         * The year labels are hidden and the force layout
         * tick function is set to move all nodes to the
         * center of the visualization.
         */
        function groupBubbles() {
            hideYears();

            force.on('tick', function(e) {
                bubbles.each(moveToCenter(e.alpha))
                    .attr('cx', function(d) {
                        return d.x;
                    })
                    .attr('cy', function(d) {
                        return d.y;
                    });
            });

            force.start();
        }

        /*
         * Helper function for "single group mode".
         * Returns a function that takes the data for a
         * single node and adjusts the position values
         * of that node to move it toward the center of
         * the visualization.
         *
         * Positioning is adjusted by the force layout's
         * alpha parameter which gets smaller and smaller as
         * the force layout runs. This makes the impact of
         * this moving get reduced as each node gets closer to
         * its destination, and so allows other forces like the
         * node's charge force to also impact final location.
         */
        function moveToCenter(alpha) {
            return function(d) {
                d.x = d.x + (center.x - d.x) * damper * alpha;
                d.y = d.y + (center.y - d.y) * damper * alpha;
            };
        }

        /*
         * Sets visualization in "split by year mode".
         * The year labels are shown and the force layout
         * tick function is set to move nodes to the
         * yearCenter of their data's year.
         */
        function splitBubbles() {
            showYears();

            force.on('tick', function(e) {
                bubbles.each(moveToYears(e.alpha))
                    .attr('cx', function(d) {
                        return d.x;
                    })
                    .attr('cy', function(d) {
                        return d.y;
                    });
            });

            force.start();
        }

        /*
         * Helper function for "split by year mode".
         * Returns a function that takes the data for a
         * single node and adjusts the position values
         * of that node to move it the year center for that
         * node.
         *
         * Positioning is adjusted by the force layout's
         * alpha parameter which gets smaller and smaller as
         * the force layout runs. This makes the impact of
         * this moving get reduced as each node gets closer to
         * its destination, and so allows other forces like the
         * node's charge force to also impact final location.
         */
        function moveToYears(alpha) {
            return function(d) {
                var target = yearCenters[d.year];
                d.x = d.x + (target.x - d.x) * damper * alpha * 1.1;
                d.y = d.y + (target.y - d.y) * damper * alpha * 1.1;
            };
        }

        /*
         * Hides Year title displays.
         */
        function hideYears() {
            svg.selectAll('.year').remove();
        }

        /*
         * Shows Year title displays.
         */
        function showYears() {
            // Another way to do this would be to create
            // the year texts once and then just hide them.
            var yearsData = d3.keys(yearsTitleX);
            var years = svg.selectAll('.year')
                .data(yearsData);

            years.enter().append('text')
                .attr('class', 'year')
                .attr('x', function(d) {
                    return yearsTitleX[d];
                })
                .attr('y', 40)
                .attr('text-anchor', 'middle')
                .text(function(d) {
                    return d;
                });
        }


        /*
         * Function called on mouseover to display the
         * details of a bubble in the tooltip.
         */

        function showDetail(d) {
            // change outline to indicate hover state.
            d3.select(this).attr('stroke', 'black');

            var content = '<span class="name">Proveedor: </span><span class="value">' +
                d.name +
                '</span><br/>' +
                '<span class="name">Monto: </span><span class="value">$' +

                // addCommas(d.value)
                d.value.format(2)


                // addCommas(d.value) +
                // '</span><br/>' +
                // '<span class="name">Year: </span><span class="value">' +
                // d.year +
                // '</span>';
            tooltip.showTooltip(content, d3.event);
        }

        /*
         * Hides tooltip
         */
        function hideDetail(d) {
            // reset outline
            d3.select(this)
                .attr('stroke', d3.rgb(fillColor(d.group)).darker());

            tooltip.hideTooltip();
        }

        /*
         * Externally accessible function (this is attached to the
         * returned chart function). Allows the visualization to toggle
         * between "single group" and "split by year" modes.
         *
         * displayName is expected to be a string and either 'year' or 'all'.
         */
        chart.toggleDisplay = function(displayName) {
            if (displayName === 'year') {
                splitBubbles();
            } else {
                groupBubbles();
            }
        };


        // return the chart function from closure.
        return chart;
    }

    /*
     * Below is the initialization code as well as some helper functions
     * to create a new bubble chart instance, load the data, and display it.
     */

    var myBubbleChart = bubbleChart();

    /*
     * Function called once data is loaded from CSV.
     * Calls bubble chart function to display inside #vis div.
     */
    function display(error, data) {
        if (error) {
            console.log(error);
        }

        myBubbleChart('#bubbleChart', data);
    }

    //????????????????????????????????????????????????????????????????????????????????

    /*
     * Sets up the layout buttons to allow for toggling between view modes.
     */
    function setupButtons() {
        d3.select('#toolbar')
            .selectAll('.button')
            .on('click', function() {
                // Remove active class from all buttons
                d3.selectAll('.button').classed('active', false);
                // Find the button just clicked
                var button = d3.select(this);

                // Set it as the active button
                button.classed('active', true);

                // Get the id of the button
                var buttonId = button.attr('id');

                // Toggle the bubble chart based on
                // the currently clicked button.
                myBubbleChart.toggleDisplay(buttonId);
            });
    }

    /*
     * Helper function to convert a number into a string
     * and add commas to it to improve presentation.
     */
     //option 1
     Number.prototype.format = function(n, x) {
        var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
        return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,');
    };
    //option 2
    function addCommas(nStr) {
        nStr += '';
        var x = nStr.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        var number = x1+x2;
        return number;

    }

    // Load the data.
    // d3.csv('../gates_money-2.csv', display);
    // d3.csv('../jsons/yearProvider/providers_2016.csv', display);

    // d3.json('/api/get-bubblechart', display);
    // d3.json('/api/post-bubblechart?year=2012&customer=type1').header("type", "POST").post(function(error, json) {
    //    console.log("resultado: "+json);
    //    display(error,json);
    // });

    //COMPARA SI LA CATEGORIA ES UNA EN PARTICULAR O UNDEFINED(TODAS)
    //SI ES UNDEFINED LLAMA A /api/post-bubblechart SIN CATEGORIA ALGUNA
    //SI ES DISTINTO DE UNDEFINED (ALGUNA CATEGORIA EN PARTICULAR) LLAMA AL POST PASANDOLE DICHA CATEGORIA.
    var compare=$scope.searchPurchase.localeCompare('undefined');
    if(compare == 0){
      d3.json('/api/post-bubblechart',function(error, data) {
        display(error,data);
        })
       .header("Content-Type","application/json")
       .send("POST", JSON.stringify({"valorini": $scope.bubblefilterini, "valorfin": $scope.bubblefilterfin,"category":""}));

    }else{
      $http.post('/api/post-categoryID',{categorySelect:$scope.searchPurchase})
      .then(function(response) {
          $scope.bubbleCategory = response.data[0]._id;
          d3.json('/api/post-bubblechart',function(error, data) {
            display(error,data);
            })
           .header("Content-Type","application/json")
           .send("POST", JSON.stringify({"valorini": $scope.bubblefilterini, "valorfin": $scope.bubblefilterfin,"category":$scope.bubbleCategory}));
              },
      function(response) {
          console.debug('Error:' + response);
      });
    };

    // setup the buttons.
    setupButtons();

  };

}]);
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//Linechar (evolución del gasto)
dcuApp.controller('linechartController', ['$scope', '$http', function($scope, $http) {
  $scope.rankingFilterini = new Date(2009,00,01);
  $scope.rankingFilterfin = new Date();
  $scope.submit = function(){
    $http.post('/api/post-linechart',
    {"valorini":$scope.rankingFilterini,
    "valorfin":$scope.rankingFilterfin})
    .then(function(response) {
          $scope.linechart = response.data;
            var linechart = c3.generate({
                bindto: '#lineschart',
                data: {
                    // url: 'example.json', //la carpeta raiz de busqueda es /public/
                    json: $scope.linechart,
                    mimeType: 'json',
                    keys: {
                        x: 'year', // it's possible to specify 'x' when category axis
                        value: ['totalAmount','budget'],
                    },
                    names: {
                        totalAmount: 'Evolución del gasto',
                        budget: 'Presupuesto total'
                    },
                },
                color: {
                    pattern: ['#4db6ac','#004d40']
                },
                axis: {
                    x: {
                        type: 'category'
                    },
                    y: {
                        tick: {
                            format: d3.format("$,.2f")
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
                        name: function(name, ratio, id, index) {
                            return 'Monto';
                        }
                    }
                }
            });
            //   setTimeout(function () {
            //     linechart.transform('bar', 'amount');
            // }, 2000);
        },
        function(response) {
            console.debug('Error' + response);
        });
      };
}]);
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// Ranking de proveedores
dcuApp.controller('rankingController', ['$scope', '$http','$interval', function($scope, $http,$interval) {
  $scope.rankingFilterini = new Date(2009,00,01);
  $scope.rankingFilterfin = new Date();
  //csv config
  $scope.getHeader = function(){
    return ["PROVEEDOR","CUIT","IMPORTE"]
  }
  //
  $scope.submit = function(){
    $http.post('/api/post-ranking',
    {"valorini":$scope.rankingFilterini,
    "valorfin":$scope.rankingFilterfin})
    .then(function(response) {
            $scope.getArray = response.data;
        },
        function(response) {
            console.debug('Error:' + response);
        });
  };

}]);
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
dcuApp.controller('rankingObraPublicaController', ['$scope', '$http','$interval', function($scope, $http,$interval) {

  $scope.obrapublicaFilterini = new Date(2009,00,01);
  $scope.obrapublicaFilterfin = new Date();
  //csv config
  $scope.getHeader = function(){
    return ["PROVEEDOR","CUIT","IMPORTE"]
  }
  //
  $scope.submit = function(){
    $http.post('/api/post-rankingObraPublica',
    {"valorini":$scope.obrapublicaFilterini,
    "valorfin":$scope.obrapublicaFilterfin})
    .then(function(response) {

            $scope.getArrayOP = response.data;
        },
        function(response) {
            console.debug('Error:' + response);
        });
  };
}]);
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// Contratos de obras públicas y servicios
dcuApp.controller('purchaseController', ['$scope', '$http','$interval', function($scope, $http) {
    $scope.sortType = ''; // set the default sort type
    $scope.sortReverse = false; // set the default sort order
    $scope.purchasefilterini =  new Date(2009,00,01);
    $scope.purchasefilterfin = new Date();
    $scope.searchPurchase = "undefined";
    //csv config
    $scope.getHeader = function(){
      return ["AÑO","MES","PROVEEDOR","RUBRO","IMPORTE"]
    }
    //
    $http.get('/api/get-categories').then(function(response){
      $scope.categories = response.data;
    });


    $scope.submit = function(){
      var compare=$scope.searchPurchase.localeCompare('undefined');

      if(compare == 0){
        $http.post('/api/post-purchases',
        {"valorini":$scope.purchasefilterini,
        "valorfin":$scope.purchasefilterfin,"category":""})
        .then(function(response) {
                $scope.getArrayPU = response.data;
                $scope.getArrayPUcsv = response.data;

                // console.log("getARRAY: "+$scope.getArrayOP);
                //show more functionality
                var pagesShown = 1;
                var pageSize = 5;

                $scope.paginationLimit = function(data) {
                    return pageSize * pagesShown;
                };
                $scope.hasMoreItemsToShow = function() {
                    return pagesShown < ($scope.getArrayPU.length / pageSize);
                };
                $scope.showMoreItems = function() {
                    pagesShown = pagesShown + 1;
                };

            },
            function(response) {
                console.debug('Error:' + response);
            });
        }else{
          $http.post('/api/post-categoryID',{categorySelect:$scope.searchPurchase})
          .then(function(response) {
              $scope.category = response.data[0]._id;
              $http.post('/api/post-purchases',
              {"valorini":$scope.purchasefilterini,
              "valorfin":$scope.purchasefilterfin,"category":$scope.category})
              .then(function(response) {
                      $scope.getArrayPU = response.data;
                      $scope.getArrayPUcsv = response.data;

                      // console.log("getARRAY: "+$scope.getArrayOP);
                      //show more functionality
                      var pagesShown = 1;
                      var pageSize = 5;

                      $scope.paginationLimit = function(data) {
                          return pageSize * pagesShown;
                      };
                      $scope.hasMoreItemsToShow = function() {
                          return pagesShown < ($scope.getArrayPU.length / pageSize);
                      };
                      $scope.showMoreItems = function() {
                          pagesShown = pagesShown + 1;
                      };

                  },
                  function(response) {
                      console.debug('Error:' + response);
                  });
            });
        };
    }

}]);

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//Detalle de cada proveedor seleccionado
dcuApp.controller('detailController', ['$scope', '$http', '$stateParams', function($scope, $http, $stateParams) {
    $scope.sortType = ''; // set the default sort type
    $scope.sortReverse = false; // set the default sort order
    $scope.searchPurchase = ''; // set the default search/filter term
    $http.get('/' + $stateParams.id).then(function(response) {
            $scope.detail = response.data;
            //Export CSV config
            $scope.getHeader = function(){
              return ["Nombre","Cuit","Reparticion","Importe","Fecha"]
            }
            var pagesShown = 1;
            var pageSize = 5;
            $scope.paginationLimit = function(data) {
                return pageSize * pagesShown;
            };
            $scope.hasMoreItemsToShow = function() {
                return pagesShown < ($scope.detail.length / pageSize);
            };
            $scope.showMoreItems = function() {
                pagesShown = pagesShown + 1;
            };
            //
            var linechart = c3.generate({
                bindto: '#lineschart-detail',
                data: {
                    // url: 'example.json', //la carpeta raiz de busqueda es /public/
                    json: $scope.detail,
                    mimeType: 'json',
                    keys: {
                        value: ['importe']
                    },
                    names: {
                        import: 'Evolución del gasto'
                    }
                },
                color: {
                    pattern: ['#4db6ac']
                },
                axis: {

                    y: {
                        tick: {
                            format: d3.format("$,.2f")
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
                        name: function(name, ratio, id, index) {
                            return 'Monto';
                        }
                    }
                }
            })


        }),
        function(response) {
            console.debug('Error:' + response);
        };

}]);
