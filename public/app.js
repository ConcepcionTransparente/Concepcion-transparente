// AngularJS

var arr = [];
var dcuApp = angular.module(
    'dcuApp',
    [
        'ui.router',
        'ui.materialize',
        '720kb.socialshare',
        'ngSanitize',
        'angularMoment',
        'ngCsv',
        'angular-d3plus'
    ]
);

dcuApp.config([
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise('/');

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
                        templateUrl: './views/static2015.html'
                    },
                    'Providers': {
                        templateUrl: './views/providers.html',
                        controller: 'providersController'
                    },
                    'VisualizacionesPresupuesto': {
                        templateUrl: './views/visualizacionesPresupuesto.html',
                        controller: 'visualizacionesPresupuestoController'
                    },

                    // Deprecated
                    'Files': {
                        templateUrl: './views/files.html'
                    }
                }
            })
            // Deprecated
            .state('Detail', {
                url: '/:id',
                views: {
                    'Detail': {
                        templateUrl: './views/detail.html',
                        controller: 'detailController'
                    }
                }
            });
    }
]);

dcuApp.run(function($rootScope) {
    moment.locale('es');

    $rootScope.month = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    $rootScope.monthShort = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    $rootScope.weekdaysFull = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sábado'];
    $rootScope.weekdaysLetter = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

    // TODO: Disable days from today on
    // $rootScope.disable = "[false, 1, 7]";

    $rootScope.today = 'Hoy';
    $rootScope.clear = 'Limpiar';
    $rootScope.close = 'Cerrar';
    $rootScope.fechaInicioDatos = new moment('2009-01-01').format();
    $rootScope.fechaMananaString = new moment(new Date()).add(1, 'days').format('YYYY-MM-DD');
});

dcuApp.filter('monthName', [function() {
    return function(monthNumber) { //1 = January
        var monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

        return monthNames[monthNumber];
    }
}]);

dcuApp.controller('generalController', ['$scope', '$http', '$q', function($scope, $http, $q) {
    var fechaActual = new Date();
    var anoActual = fechaActual.getFullYear();

    $scope.generalFechaInicio = new Date(anoActual, 0, 1);
    $scope.generalFechaFin = new Date();

    $scope.generalFechaInicioMaxDate = new moment(new Date())
        .add(1, 'days')
        .format('YYYY-MM-DD');

    $scope.generalFechaFinMaxDate = new moment(new Date())
        .add(1, 'days')
        .format('YYYY-MM-DD');

    $scope.submit = function() {
        // var fechaInicio = new moment($scope.generalFechaInicio + ' 00:00.000Z').toISOString();
        // var fechaFin = new moment($scope.generalFechaFin + ' 00:00.000Z').toISOString();

        var fechaInicio = new moment($scope.generalFechaInicio, 'DD/MM/YYYY').toISOString();
        var fechaFin = new moment($scope.generalFechaFin, 'DD/MM/YYYY').toISOString();

        $http
            .post('/api/post-totalimport', {
                'valorini': fechaInicio,
                'valorfin': fechaFin
            })

            .then(function(response) {
                $scope.totalimport = response.data[0];

                return $http.post('/api/post-totalproviders', {
                    'valorini': fechaInicio,
                    'valorfin': fechaFin
                });
            })

            .then(function(response) {
                $scope.totalproviders = response.data;

                return $http.post('/api/post-totalorders', {
                    'valorini': fechaInicio,
                    'valorfin': fechaFin
                });
            })

            .then(function(response) {
                $scope.totalorders = response.data;
            })

            .catch(function(error) {
                console.log(error);
            });
    };
}]);

// Bubblechart (comparación entre proveedores)
dcuApp.controller('bubblechartController', ['$scope', '$http', function($scope, $http) {
    var fechaActual = new Date();
    var anoActual = fechaActual.getFullYear();

    $scope.bubbleFechaInicio = new Date(anoActual, 0, 1);
    $scope.bubbleFechaFin = new Date();

    $scope.searchPurchase = 'undefined';

    $http
        .get('/api/get-categories')
        .then(function(response) {
            $scope.categories = response.data;
        });

    $scope.submit = function() {
        var fechaInicio = new moment($scope.bubbleFechaInicio, 'DD/MM/YYYY').toISOString();
        var fechaFin = new moment($scope.bubbleFechaFin, 'DD/MM/YYYY').toISOString();

        var svg = d3.select('#bubbleChart');
        svg.selectAll('*').remove();

        function bubbleChart() {
            var w = window,
                d = document,
                e = d.documentElement,
                g = d.getElementById('bubbleChartFather'),
                width = w.innerWidth || e.clientWidth || g.clientWidth,
                // width = g.clientWidth,
                height = w.innerHeight || e.clientHeight || g.clientHeight;

            // Aca esta el problema del resize - el centro lo calcula mal

            if (width < 600) {
                width += 750
            }

            // tooltip for mouseover functionality
            var tooltip = floatingTooltip('gates_tooltip', 240);

            // Locations to move bubbles towards, depending
            // on which view mode is selected.
            var center = {
                x: width / 2,
                y: height / 2
            };

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
                .range(['#e8f5e9', '#2e7d32', '#66bb6a']);

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

                    // d.total_amount = d.total_amount.split(',')[0];

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
                    .classed('svg-container', true) //container class to make it responsive
                    .append('svg')
                    //responsive SVG needs these 2 attributes and no width and height attr
                    .attr('preserveAspectRatio', 'xMidYMid meet')
                    .attr('viewBox', '0 0 1200 900')
                    //class to make it responsive
                    .classed('svg-content-responsive', true);

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
             * Sets visualization in 'single group mode'.
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
             * Helper function for 'single group mode'.
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
             * Sets visualization in 'split by year mode'.
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
             * Helper function for 'split by year mode'.
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
             * between 'single group' and 'split by year' modes.
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
         *
         * Calls bubble chart function to display inside #vis div.
         */
        function display(error, data) {
            if (error) {
                console.log(error);

                return;
            }

            myBubbleChart('#bubbleChart', data);
        }

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
        // Option 1
        Number.prototype.format = function(n, x) {
            var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
            return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,');
        };

        // Option 2
        function addCommas(nStr) {
            nStr += '';
            var x = nStr.split('.');
            var x1 = x[0];
            var x2 = x.length > 1 ? '.' + x[1] : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }
            var number = x1 + x2;
            return number;

        }

        // Load the data.
        // d3.csv('../gates_money-2.csv', display);
        // d3.csv('../jsons/yearProvider/providers_2016.csv', display);

        // d3.json('/api/get-bubblechart', display);
        // d3.json('/api/post-bubblechart?year=2012&customer=type1').header('type', 'POST').post(function(error, json) {
        //    display(error,json);
        // });

        // Compara si la categoria es una en particular o undefined(todas)
        // si es undefined llama a /api/post-bubblechart sin categoria alguna
        // si es distinto de undefined (alguna categoria en particular) llama al
        // POST pasandole dicha categoria.
        var compare = $scope.searchPurchase.localeCompare('undefined');

        // console.log($http);
        // post(url: string, body: any, options?: RequestOptionsArgs) : Observable<Response>

        if (compare == 0) {
            $http
                .post(
                    '/api/post-bubblechart',
                    JSON.stringify({
                        'valorini': fechaInicio,
                        'valorfin': fechaFin,
                        'category': ''
                    }),
                    { headers: { 'Content-Type': 'application/json' } }
                )
                .then(function(data) {
                    display(null, data['data']);
                });
        } else {
            $http
                .post('/api/post-categoryID', {
                    categorySelect: $scope.searchPurchase
                })
                .then(
                    function(response) {
                        $scope.bubbleCategory = response.data[0]._id;

                        $http
                            .post(
                                '/api/post-bubblechart',
                                JSON.stringify({
                                    'valorini': fechaInicio,
                                    'valorfin': fechaFin,
                                    'category': $scope.bubbleCategory
                                }),
                                { headers: { 'Content-Type': 'application/json' } }
                            )
                            .then(function(data) {
                                display(null, data['data']);
                            });
                    },
                    function(response) {
                        console.debug('Error:' + response);
                    }
                );
        }

        // setup the buttons.
        setupButtons();
    };
}]);

// Linechart (evolución del gasto)
dcuApp.controller('linechartController', ['$scope', '$http', function($scope, $http) {

    $scope.lineChartFechaInicio = $scope.fechaInicioDatos;
    $scope.lineChartFechaFin = new Date();

    $scope.lineChartFechaInicioMaxDate = new moment(new Date())
        .add(1, 'days')
        .format('YYYY-MM-DD');

    $scope.lineChartFechaFinMaxDate = new moment(new Date())
        .add(1, 'days')
        .format('YYYY-MM-DD');

    $scope.submit = function() {

        var fechaInicio = new moment($scope.lineChartFechaInicio).toISOString();
        var fechaFin = new moment($scope.lineChartFechaFin).toISOString();

        $http
            .post('/api/post-linechart', {
                'valorini': fechaInicio,
                'valorfin': fechaFin
            })
            .then(
                function(response) {
                    $scope.linechart = response.data;
                    var linechart = c3.generate({
                        bindto: '#lineschart',
                        data: {
                            json: $scope.linechart,
                            mimeType: 'json',
                            keys: {
                                x: 'year', // it's possible to specify 'x' when category axis
                                value: ['totalAmount', 'budget'],
                            },
                            names: {
                                totalAmount: 'Evolución del gasto',
                                budget: 'Presupuesto total'
                            },
                        },
                        point: {
                            r: 5,
                        },
                        color: {
                            pattern: ['#81c784', '#2e7d32', '#66bb6a']
                        },
                        axis: {
                            x: {
                                type: 'category'
                            },
                            y: {
                                tick: {
                                    format: d3.format('$,.2f')
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
                },
                function(response) {
                    console.debug('Error' + response);
                }
            );
    };
}]);

// Ranking de proveedores
dcuApp.controller('rankingController', ['$scope', '$http', '$interval', function($scope, $http, $interval) {
    var fechaActual = new Date();
    var anoActual = fechaActual.getFullYear();

    $scope.rankingFechaInicio = new Date(anoActual, 0, 1);
    $scope.rankingFechaFin = new Date();

    $scope.rankingFechaInicioMaxDate = new moment(new Date())
        .add(1, 'days')
        .format('YYYY-MM-DD');

    $scope.rankingFechaFinMaxDate = new moment(new Date())
        .add(1, 'days')
        .format('YYYY-MM-DD');

    // CSV config
    $scope.getHeader = function() {
        return ['PROVEEDOR', 'CUIT', 'IMPORTE', 'ID DEL PROVEEDOR']
    };

    $scope.submit = function() {
        var fechaInicio = new moment($scope.rankingFechaInicio, 'DD/MM/YYYY').toISOString();
        var fechaFin = new moment($scope.rankingFechaFin, 'DD/MM/YYYY').toISOString();

        $http
            .post('/api/post-ranking', {
                'valorini': fechaInicio,
                'valorfin': fechaFin
            })
            .then(
                function(response) {
                    $scope.getArray = response.data;
                },
                function(response) {
                    console.debug('Error:' + response);
                }
            );
    };
}]);

dcuApp.controller('rankingObraPublicaController', ['$scope', '$http', '$interval', function($scope, $http, $interval) {
    var fechaActual = new Date();
    var anoActual = fechaActual.getFullYear();

    $scope.rankingObraFechaInicio = new Date(anoActual, 0, 1);
    $scope.rankingObraFechaFin = new Date();

    $scope.rankingObraFechaInicioMaxDate = new moment(new Date())
        .add(1, 'days')
        .format('YYYY-MM-DD');

    $scope.rankingObraFechaInicioMaxDate = new moment(new Date())
        .add(1, 'days')
        .format('YYYY-MM-DD');

    // CSV config
    $scope.getHeader = function() {
        return ['PROVEEDOR', 'CUIT', 'IMPORTE']
    };

    $scope.submit = function() {
        var fechaInicio = new moment($scope.rankingObraFechaInicio, 'DD/MM/YYYY').toISOString();
        var fechaFin = new moment($scope.rankingObraFechaFin, 'DD/MM/YYYY').toISOString();

        $http
            .post('/api/post-rankingObraPublica', {
                'valorini': fechaInicio,
                'valorfin': fechaFin
            })
            .then(
                function(response) {
                    $scope.getArrayOP = response.data;
                },
                function(response) {
                    console.debug('Error:' + response);
                }
            );
    };
}]);

// Contratos de obras públicas y servicios
dcuApp.controller('purchaseController', ['$scope', '$http', '$interval', function($scope, $http) {
    $scope.sortType = ''; // set the default sort type
    $scope.sortReverse = false; // set the default sort order

    var fechaActual = new Date();
    var anoActual = fechaActual.getFullYear();

    $scope.purchaseFechaInicio = new Date(anoActual, 0, 1);
    $scope.purchaseFechaFin = new Date();

    $scope.purchaseFechaInicioMaxDate = new moment(new Date())
        .add(1, 'days')
        .format('YYYY-MM-DD');

    $scope.purchaseFechaFinMaxDate = new moment(new Date())
        .add(1, 'days')
        .format('YYYY-MM-DD');

    $scope.searchPurchase = 'undefined';

    $http.get('/api/get-categories').then(function(response) {
        $scope.categories = response.data;
    });

    $scope.submit = function() {
        var compare = $scope.searchPurchase.localeCompare('undefined');

        var fechaInicio = new moment($scope.purchaseFechaInicio, 'DD/MM/YYYY').toISOString();
        var fechaFin = new moment($scope.purchaseFechaFin, 'DD/MM/YYYY').toISOString();

        if (compare == 0) {
            $http
                .post('/api/post-purchases', {
                    'valorini': fechaInicio,
                    'valorfin': fechaFin,
                    'category': ''
                })
                .then(
                    function(response) {
                        $scope.getArrayPU = response.data;
                        $scope.getArrayPUcsv = response.data;

                        // Show more functionality
                        var pagesShown = 1;
                        var pageSize = 5;

                        $scope.paginationLimit = function(data) {
                            return pageSize * pagesShown;
                        };

                        if ($scope.getArrayPU.length) {
                            $scope.hasMoreItemsToShow = function() {
                                return pagesShown < ($scope.getArrayPU.length / pageSize);
                            };
                        }

                        $scope.showMoreItems = function() {
                            pagesShown = pagesShown + 1;
                        };
                    },
                    function(response) {
                        console.debug('Error:' + response);
                    }
                );
        } else {
            $http
                .post('/api/post-categoryID', {
                    categorySelect: $scope.searchPurchase
                })
                .then(function(response) {
                    $scope.category = response.data[0]._id;
                    $http
                        .post('/api/post-purchases', {
                            'valorini': fechaInicio,
                            'valorfin': fechaFin,
                            'category': $scope.category
                        })
                        .then(
                            function(response) {
                                $scope.getArrayPU = response.data;
                                $scope.getArrayPUcsv = response.data;

                                // Show more functionality
                                var pagesShown = 1;
                                var pageSize = 5;

                                $scope.paginationLimit = function(data) {
                                    return pageSize * pagesShown;
                                };
                                if ($scope.getArrayPU.length) {
                                    $scope.hasMoreItemsToShow = function() {
                                        return pagesShown < ($scope.getArrayPU.length / pageSize);
                                    };
                                }

                                $scope.showMoreItems = function() {
                                    pagesShown = pagesShown + 1;
                                };

                            },
                            function(response) {
                                console.debug('Error:' + response);
                            }
                        );
                });
        }
    }
}]);

// Detalle de cada proveedor seleccionado
dcuApp.controller('detailController', ['$scope', '$http', '$stateParams', function($scope, $http, $stateParams) {
    $scope.sortType = ''; // set the default sort type
    $scope.sortReverse = false; // set the default sort order
    $scope.searchPurchase = ''; // set the default search/filter term

    $http
        .get('/' + $stateParams.id)
        .then(function(response) {
            $scope.detail = response.data;
            // Export CSV config
            $scope.getHeader = function() {
                return ['Nombre', 'Cuit', 'Reparticion', 'Importe', 'Fecha']
            }
            var pagesShown = 1;
            var pageSize = 5;

            $scope.paginationLimit = function(data) {
                return pageSize * pagesShown;
            };
            if ($scope.detail.length) {
                $scope.hasMoreItemsToShow = function() {
                    return pagesShown < ($scope.detail.length / pageSize);
                };
            }

            $scope.showMoreItems = function() {
                pagesShown = pagesShown + 1;
            };

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
                point: {
                    r: 5,
                },
                color: {
                    pattern: ['#66bb6a', '#2e7d32']
                },
                axis: {
                    y: {
                        tick: {
                            format: d3.format('$,.2f')
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
        }),
        function(response) {
            console.debug('Error:' + response);
        };

    var fechaActual = new Date();
    var anoActual = fechaActual.getFullYear();

    $scope.categoryIni = new Date(anoActual, 0, 1);
    $scope.categoryFin = new Date();

    $scope.submitCategory = function() {
        $scope.getHeader2 = function() {
            return ['REPARTICIÓN', 'IMPORTE', 'CONTRATOS']
        }

        $http
            .post(
                '/api/post-detailCategories',
                {
                    'valorini': $scope.categoryIni,
                    'valorfin': $scope.categoryFin,
                    'id': $stateParams.id
                }
            )
            .then(function(response) {
                    $scope.detailCategories = response.data;
                },
                function(response) {
                    console.debug('Error:' + response);
                }).then(function() {
                var pagesShown2 = 1;
                var pageSize2 = 5;
                $scope.paginationLimit2 = function(data) {
                    return pageSize2 * pagesShown2;
                };
                if ($scope.detailCategories.length) {
                    $scope.hasMoreItemsToShow2 = function() {
                        return pagesShown2 < ($scope.detailCategories.length / pageSize2);
                    };
                }

                $scope.showMoreItems2 = function() {
                    pagesShown2 = pagesShown2 + 1;
                };
            });
    }

    var from = new moment().year();
    $scope.monthIni = new Date();
    $scope.getHeader3 = function() {
        return ['MES', 'IMPORTE', 'CONTRATOS']
    }

    $scope.submitMonth = function() {
        var dateString = $scope.monthIni;
        var from = new moment($scope.monthIni).year();
        $http
            .post('/api/post-detailMonth', {
                'anio': from,
                'id': $stateParams.id
            })
            .then(
                function(response) {
                    $scope.detailMonth = response.data;
                },
                function(response) {
                    console.debug('Error:' + response);
                }
            );
    };
}]);

// Ranking de proveedores
dcuApp.controller('providersController', ['$scope', '$http', '$interval', function($scope, $http, $interval) {
    $scope.getHeader = function() {
        return ['PROVEEDOR', 'CUIT', 'IMPORTE']
    };

    $http
        .get('/api/get-Providers')
        .then(
            function(response) {
                $scope.getArrayProviders = response.data;
            },

            function(response) {
                console.debug('Error:' + response);
            }
        )
        .then(
            function() {
                var pagesShownP = 1;
                var pageSizeP = 10;

                $scope.paginationLimitP = function(data) {
                    return pageSizeP * pagesShownP;
                };

                $scope.hasMoreItemsToShowP = function() {
                    return pagesShownP < ($scope.getArrayProviders.length / pageSizeP);
                };

                $scope.showMoreItemsP = function() {
                    pagesShownP = pagesShownP + 1;
                };

                $scope.getHeader = function() {
                    return ['PROVEEDOR', 'CUIT', 'IMPORTE']
                }
            }
        );
}]);

dcuApp.controller('visualizacionesPresupuestoController', ['$scope', function($scope) {

    // Treemap config parameters
    $scope.format = { locale: 'es_ES' };
    $scope.font = { family: 'Helvetica, Arial, sans-serif' };
    $scope.labels = { align: 'left', valign: 'top' };
    $scope.legend = true;
    $scope.title = { total: true };

    // Presupuesto
    $scope.data = [
        ['INTENDENCIA', 'PERSONAL', 14686028],
        ['INTENDENCIA', 'BIENES CONSUMO', 300000],
        ['INTENDENCIA', 'SERVICIOS', 1500000],
        ['INTENDENCIA', 'TRANSF. CORRIENTES', 6000000],
        ['INTENDENCIA', 'BIENES CAPITAL', 800000],
        ['INTENDENCIA', 'INT. Y GTOS. DE LA DEUDA', 0],
        ['INTENDENCIA', 'AMORTIZ. DEUDA', 0],
        ['INTENDENCIA', 'PRESPUESTO PARTICIPATIVO', 3000000],
        ['INTENDENCIA', 'TRABAJOS PUBLICOS', 0],
        ['SEC. DE COORD. GRAL. Y JEFE GABINETE', 'PERSONAL', 939884.21],
        ['SEC. DE COORD. GRAL. Y JEFE GABINETE', 'BIENES CONSUMO', 12000],
        ['SEC. DE COORD. GRAL. Y JEFE GABINETE', 'SERVICIOS', 40000],
        ['SEC. DE COORD. GRAL. Y JEFE GABINETE', 'TRANSF. CORRIENTES', 0],
        ['SEC. DE COORD. GRAL. Y JEFE GABINETE', 'BIENES CAPITAL', 20000],
        ['SEC. DE COORD. GRAL. Y JEFE GABINETE', 'INT. Y GTOS. DE LA DEUDA', 0],
        ['SEC. DE COORD. GRAL. Y JEFE GABINETE', 'AMORTIZ. DEUDA', 0],
        ['SEC. DE COORD. GRAL. Y JEFE GABINETE', 'PRESPUESTO PARTICIPATIVO', 0],
        ['SEC. DE COORD. GRAL. Y JEFE GABINETE', 'TRABAJOS PUBLICOS', 0],
        ['SEC. GOBIERNO', 'PERSONAL', 61501753.52],
        ['SEC. GOBIERNO', 'BIENES CONSUMO', 290000],
        ['SEC. GOBIERNO', 'SERVICIOS', 2100000],
        ['SEC. GOBIERNO', 'TRANSF. CORRIENTES', 0],
        ['SEC. GOBIERNO', 'BIENES CAPITAL', 500000],
        ['SEC. GOBIERNO', 'INT. Y GTOS. DE LA DEUDA', 0],
        ['SEC. GOBIERNO', 'AMORTIZ. DEUDA', 0],
        ['SEC. GOBIERNO', 'PRESPUESTO PARTICIPATIVO', 0],
        ['SEC. GOBIERNO', 'TRABAJOS PUBLICOS', 0],
        ['SECRETARIA DE HACIENDA', 'PERSONAL', 21139470.08],
        ['SECRETARIA DE HACIENDA', 'BIENES CONSUMO', 625000],
        ['SECRETARIA DE HACIENDA', 'SERVICIOS', 820000],
        ['SECRETARIA DE HACIENDA', 'TRANSF. CORRIENTES', 0],
        ['SECRETARIA DE HACIENDA', 'BIENES CAPITAL', 1200000],
        ['SECRETARIA DE HACIENDA', 'INT. Y GTOS. DE LA DEUDA', 291964.51],
        ['SECRETARIA DE HACIENDA', 'AMORTIZ. DEUDA', 7889521.2],
        ['SECRETARIA DE HACIENDA', 'PRESPUESTO PARTICIPATIVO', 0],
        ['SECRETARIA DE HACIENDA', 'TRABAJOS PUBLICOS', 0],
        ['SECRETARIA DE DESARROLLO SOCIAL Y EDUCACION', 'PERSONAL', 63044629.06],
        ['SECRETARIA DE DESARROLLO SOCIAL Y EDUCACION', 'BIENES CONSUMO', 295000.00],
        ['SECRETARIA DE DESARROLLO SOCIAL Y EDUCACION', 'SERVICIOS', 860000.00],
        ['SECRETARIA DE DESARROLLO SOCIAL Y EDUCACION', 'TRANSF. CORRIENTES', 2900000],
        ['SECRETARIA DE DESARROLLO SOCIAL Y EDUCACION', 'BIENES CAPITAL', 165000.00],
        ['SECRETARIA DE DESARROLLO SOCIAL Y EDUCACION', 'INT. Y GTOS. DE LA DEUDA', 0],
        ['SECRETARIA DE DESARROLLO SOCIAL Y EDUCACION', 'AMORTIZ. DEUDA', 0],
        ['SECRETARIA DE DESARROLLO SOCIAL Y EDUCACION', 'PRESPUESTO PARTICIPATIVO', 0],
        ['SECRETARIA DE DESARROLLO SOCIAL Y EDUCACION', 'TRABAJOS PUBLICOS', 0],
        ['SECRETARIA DE SALUD, DISCAPACIDAD Y DERECHOS HUMANOS', 'PERSONAL', 58296536.88],
        ['SECRETARIA DE SALUD, DISCAPACIDAD Y DERECHOS HUMANOS', 'BIENES CONSUMO', 550000.00],
        ['SECRETARIA DE SALUD, DISCAPACIDAD Y DERECHOS HUMANOS', 'SERVICIOS', 650000.00],
        ['SECRETARIA DE SALUD, DISCAPACIDAD Y DERECHOS HUMANOS', 'TRANSF. CORRIENTES', 0],
        ['SECRETARIA DE SALUD, DISCAPACIDAD Y DERECHOS HUMANOS', 'BIENES CAPITAL', 400000.00],
        ['SECRETARIA DE SALUD, DISCAPACIDAD Y DERECHOS HUMANOS', 'INT. Y GTOS. DE LA DEUDA', 0],
        ['SECRETARIA DE SALUD, DISCAPACIDAD Y DERECHOS HUMANOS', 'AMORTIZ. DEUDA', 0],
        ['SECRETARIA DE SALUD, DISCAPACIDAD Y DERECHOS HUMANOS', 'PRESPUESTO PARTICIPATIVO', 0],
        ['SECRETARIA DE SALUD, DISCAPACIDAD Y DERECHOS HUMANOS', 'TRABAJOS PUBLICOS', 0],
        ['SEC. CULTURA, TURISMO Y DEPORTES', 'PERSONAL', 49707405.82],
        ['SEC. CULTURA, TURISMO Y DEPORTES', 'BIENES CONSUMO', 735000.00],
        ['SEC. CULTURA, TURISMO Y DEPORTES', 'SERVICIOS', 7140000.00],
        ['SEC. CULTURA, TURISMO Y DEPORTES', 'TRANSF. CORRIENTES', 5750000],
        ['SEC. CULTURA, TURISMO Y DEPORTES', 'BIENES CAPITAL', 400000.00],
        ['SEC. CULTURA, TURISMO Y DEPORTES', 'INT. Y GTOS. DE LA DEUDA', 0],
        ['SEC. CULTURA, TURISMO Y DEPORTES', 'AMORTIZ. DEUDA', 0],
        ['SEC. CULTURA, TURISMO Y DEPORTES', 'PRESPUESTO PARTICIPATIVO', 0],
        ['SEC. CULTURA, TURISMO Y DEPORTES', 'TRABAJOS PUBLICOS', 0],
        ['COORDINACIÓN GRAL. DEL INFRAESTRUCTURA', 'PERSONAL', 31932258.38],
        ['COORDINACIÓN GRAL. DEL INFRAESTRUCTURA', 'BIENES CONSUMO', 33925000.00],
        ['COORDINACIÓN GRAL. DEL INFRAESTRUCTURA', 'SERVICIOS', 71163395.00],
        ['COORDINACIÓN GRAL. DEL INFRAESTRUCTURA', 'TRANSF. CORRIENTES', 0],
        ['COORDINACIÓN GRAL. DEL INFRAESTRUCTURA', 'BIENES CAPITAL', 2500000.00],
        ['COORDINACIÓN GRAL. DEL INFRAESTRUCTURA', 'INT. Y GTOS. DE LA DEUDA', 0],
        ['COORDINACIÓN GRAL. DEL INFRAESTRUCTURA', 'AMORTIZ. DEUDA', 0],
        ['COORDINACIÓN GRAL. DEL INFRAESTRUCTURA', 'PRESPUESTO PARTICIPATIVO', 0],
        ['COORDINACIÓN GRAL. DEL INFRAESTRUCTURA', 'TRABAJOS PUBLICOS', 54400000],
        ['COORDINACION GENERAL DE SERVICIOS SANITARIOS', 'PERSONAL', 39809020.75],
        ['COORDINACION GENERAL DE SERVICIOS SANITARIOS', 'BIENES CONSUMO', 19662400.00],
        ['COORDINACION GENERAL DE SERVICIOS SANITARIOS', 'SERVICIOS', 6500000.00],
        ['COORDINACION GENERAL DE SERVICIOS SANITARIOS', 'TRANSF. CORRIENTES', 0],
        ['COORDINACION GENERAL DE SERVICIOS SANITARIOS', 'BIENES CAPITAL', 1500000.00],
        ['COORDINACION GENERAL DE SERVICIOS SANITARIOS', 'INT. Y GTOS. DE LA DEUDA', 0],
        ['COORDINACION GENERAL DE SERVICIOS SANITARIOS', 'AMORTIZ. DEUDA', 0],
        ['COORDINACION GENERAL DE SERVICIOS SANITARIOS', 'PRESPUESTO PARTICIPATIVO', 0],
        ['COORDINACION GENERAL DE SERVICIOS SANITARIOS', 'TRABAJOS PUBLICOS', 3800000],
        ['COORDINACION GENERAL DE SERVICIOS PUBLICOS', 'PERSONAL', 66361346.89],
        ['COORDINACION GENERAL DE SERVICIOS PUBLICOS', 'BIENES CONSUMO', 1230000.00],
        ['COORDINACION GENERAL DE SERVICIOS PUBLICOS', 'SERVICIOS', 9595000.00],
        ['COORDINACION GENERAL DE SERVICIOS PUBLICOS', 'TRANSF. CORRIENTES', 0],
        ['COORDINACION GENERAL DE SERVICIOS PUBLICOS', 'BIENES CAPITAL', 4820000.00],
        ['COORDINACION GENERAL DE SERVICIOS PUBLICOS', 'INT. Y GTOS. DE LA DEUDA', 0],
        ['COORDINACION GENERAL DE SERVICIOS PUBLICOS', 'AMORTIZ. DEUDA', 0],
        ['COORDINACION GENERAL DE SERVICIOS PUBLICOS', 'PRESPUESTO PARTICIPATIVO', 0],
        ['COORDINACION GENERAL DE SERVICIOS PUBLICOS', 'TRABAJOS PUBLICOS', 0],
        ['COORDINADOR GENERAL DE PLANEAMIENTO', 'PERSONAL', 5552936.06],
        ['COORDINADOR GENERAL DE PLANEAMIENTO', 'BIENES CONSUMO', 120000.00],
        ['COORDINADOR GENERAL DE PLANEAMIENTO', 'SERVICIOS', 430000.00],
        ['COORDINADOR GENERAL DE PLANEAMIENTO', 'TRANSF. CORRIENTES', 0],
        ['COORDINADOR GENERAL DE PLANEAMIENTO', 'BIENES CAPITAL', 300000.00],
        ['COORDINADOR GENERAL DE PLANEAMIENTO', 'INT. Y GTOS. DE LA DEUDA', 0],
        ['COORDINADOR GENERAL DE PLANEAMIENTO', 'AMORTIZ. DEUDA', 0],
        ['COORDINADOR GENERAL DE PLANEAMIENTO', 'PRESPUESTO PARTICIPATIVO', 0],
        ['COORDINADOR GENERAL DE PLANEAMIENTO', 'TRABAJOS PUBLICOS', 3313489.48],
        ['COORD GRAL DE EVALUACION POLITICAS PUBLICAS Y CONTROL DE GASTOS', 'PERSONAL', 10889506.73],
        ['COORD GRAL DE EVALUACION POLITICAS PUBLICAS Y CONTROL DE GASTOS', 'BIENES CONSUMO', 22000.00],
        ['COORD GRAL DE EVALUACION POLITICAS PUBLICAS Y CONTROL DE GASTOS', 'SERVICIOS', 150000.00],
        ['COORD GRAL DE EVALUACION POLITICAS PUBLICAS Y CONTROL DE GASTOS', 'TRANSF. CORRIENTES', 0],
        ['COORD GRAL DE EVALUACION POLITICAS PUBLICAS Y CONTROL DE GASTOS', 'BIENES CAPITAL', 55000.00],
        ['COORD GRAL DE EVALUACION POLITICAS PUBLICAS Y CONTROL DE GASTOS', 'INT. Y GTOS. DE LA DEUDA', 0],
        ['COORD GRAL DE EVALUACION POLITICAS PUBLICAS Y CONTROL DE GASTOS', 'AMORTIZ. DEUDA', 0],
        ['COORD GRAL DE EVALUACION POLITICAS PUBLICAS Y CONTROL DE GASTOS', 'PRESPUESTO PARTICIPATIVO', 0],
        ['COORD GRAL DE EVALUACION POLITICAS PUBLICAS Y CONTROL DE GASTOS', 'TRABAJOS PUBLICOS', 0],
        ['JUZGADO DE FALTAS Nº 1 Y Nº 2', 'PERSONAL', 14375339.11],
        ['JUZGADO DE FALTAS Nº 1 Y Nº 2', 'BIENES CONSUMO', 200000.00],
        ['JUZGADO DE FALTAS Nº 1 Y Nº 2', 'SERVICIOS', 56563395.00],
        ['JUZGADO DE FALTAS Nº 1 Y Nº 2', 'TRANSF. CORRIENTES', 0],
        ['JUZGADO DE FALTAS Nº 1 Y Nº 2', 'BIENES CAPITAL', 200000.00],
        ['JUZGADO DE FALTAS Nº 1 Y Nº 2', 'INT. Y GTOS. DE LA DEUDA', 0],
        ['JUZGADO DE FALTAS Nº 1 Y Nº 2', 'AMORTIZ. DEUDA', 0],
        ['JUZGADO DE FALTAS Nº 1 Y Nº 2', 'PRESPUESTO PARTICIPATIVO', 0],
        ['JUZGADO DE FALTAS Nº 1 Y Nº 2', 'TRABAJOS PUBLICOS', 0],
        ['HONORABLE CONCEJO DELIBERANTE', 'PERSONAL', 10128909.35],
        ['HONORABLE CONCEJO DELIBERANTE', 'BIENES CONSUMO', 68600.00],
        ['HONORABLE CONCEJO DELIBERANTE', 'SERVICIOS', 900000.00],
        ['HONORABLE CONCEJO DELIBERANTE', 'TRANSF. CORRIENTES', 0],
        ['HONORABLE CONCEJO DELIBERANTE', 'BIENES CAPITAL', 780000.00],
        ['HONORABLE CONCEJO DELIBERANTE', 'INT. Y GTOS. DE LA DEUDA', 0],
        ['HONORABLE CONCEJO DELIBERANTE', 'AMORTIZ. DEUDA', 0],
        ['HONORABLE CONCEJO DELIBERANTE', 'PRESPUESTO PARTICIPATIVO', 0],
        ['HONORABLE CONCEJO DELIBERANTE', 'TRABAJOS PUBLICOS', 0]
    ];

    $scope.reducedDataObject = $scope.data
        .reduce(function (result, element) {
            (result[element[0]]) ?
                result[element[0]] += element[2] : result[element[0]] = element[2];

            return result;
        }, {});

    $scope.reducedData = Object.keys($scope.reducedDataObject)
        .map(function(key) {
            return [key, $scope.reducedDataObject[key]];
        });

    $scope.totalPresupuesto = $scope.data.reduce(function(acc, element) { return acc + element[2]; }, 0);

    c3.generate({
        bindto: '#donutchartPresupuesto',
        data: {
            columns: $scope.reducedData,
            type : 'donut'
        },
        donut: {
            title: 'Presupuesto 2018: ' + d3.format('$,.2f')($scope.totalPresupuesto)
        },
        tooltip: {
            format: {
                value: function(value, ratio, id, index) {
                    return d3.format('$,.2f')(value);
                }
            }
        },
        // TODO: Estoy no ayuda al responsiveness al ser un alto fijo
        size: {
            height: 600
        }
    });

    $scope.presupuesto_treemap_data = $scope.data.map(function(element) {
        return {
            nivelUno: element[0],
            nivelDos: element[1],
            value: element[2]
        };
    });

    $scope.presupuesto_group_by = ['nivelUno', 'nivelDos'];

    // Ingresos

    $scope.ingresosRawData = [
        ['JURISDICCION MUNICIPAL','TASA GENERAL INMOBILIARIA','TASA GENERAL INMOBILIARIA',53262675.40],
        ['JURISDICCION MUNICIPAL','TASA GENERAL INMOBILIARIA','T.G.I RECARGOS POR MORA',1534364.70],
        ['JURISDICCION MUNICIPAL','TASA GENERAL INMOBILIARIA','DEUDORES TASAs GENERALES ATRASADAS',2289652.75],
        ['JURISDICCION MUNICIPAL','TASA GENERAL INMOBILIARIA','T.G.I. MULTAS',2384807.15],
        ['JURISDICCION MUNICIPAL','TASA DE HIGIENE (Comercios)','TASA INSPECCION SANITARIA HIGIENE Y PROFILAXIS',149563937.60],
        ['JURISDICCION MUNICIPAL','TASA DE HIGIENE (Comercios)','T.H.I. FONDO MUNICIPAL',15923285.40],
        ['JURISDICCION MUNICIPAL','TASA DE HIGIENE (Comercios)','T.H.I. RECARGO POR MORA',1284681.20],
        ['JURISDICCION MUNICIPAL','TASA DE HIGIENE (Comercios)','DEUDORES TASA HIGIENE ATRASADAS',169037.00],
        ['JURISDICCION MUNICIPAL','TASA DE HIGIENE (Comercios)','T.H.I. MULTAS',2096058.80],
        ['JURISDICCION MUNICIPAL','TASA DE SERVICIOS SANITARIOS','SERVICIOS SANITARIOS',43178462.80],
        ['JURISDICCION MUNICIPAL','TASA DE SERVICIOS SANITARIOS','DOSMU APROBACION PLANOS DE AGUA Y/O CLOACAS',235974.20],
        ['JURISDICCION MUNICIPAL','TASA DE SERVICIOS SANITARIOS','DOSMU APROBACION PLANOS DE REGULARIZACION',34500.00],
        ['JURISDICCION MUNICIPAL','TASA DE SERVICIOS SANITARIOS','DOSMU AGUA POR CONSTRUCCION',573080.20],
        ['JURISDICCION MUNICIPAL','TASA DE SERVICIOS SANITARIOS','DOSMU INSPECCION Y CONEXIÓN A RED DE AGUA',130849.89],
        ['JURISDICCION MUNICIPAL','TASA DE SERVICIOS SANITARIOS','DOSMU INSPECCION Y CONEXIÓN A RED DE CLOACAS',120395.00],
        ['JURISDICCION MUNICIPAL','TASA DE SERVICIOS SANITARIOS','DOSMU INSTALACION MEDIDOR DE AGUA',147550.00],
        ['JURISDICCION MUNICIPAL','TASA DE SERVICIOS SANITARIOS','DOSMU FONDO MUNICIPAL',231158.40],
        ['JURISDICCION MUNICIPAL','TASA DE SERVICIOS SANITARIOS','DOSMU RECARGO POR MORA',1136528.80],
        ['JURISDICCION MUNICIPAL','TASA DE SERVICIOS SANITARIOS','DOSMU SERVICIO DE AGUA POR MEDIDORES',43342.20],
        ['JURISDICCION MUNICIPAL','TASA DE SERVICIOS SANITARIOS','SERVICIOS SANITARIOS ATRASADOS',568264.40],
        ['JURISDICCION MUNICIPAL','TASA DE SERVICIOS SANITARIOS','DOSMU MULTAS',1428273.30],
        ['JURISDICCION MUNICIPAL','TASA DE SERVICIOS SANITARIOS','SERVICIOS SANITARIOS MORATORIA ORD. 9588',329620.81],
        ['JURISDICCION MUNICIPAL','CEMENTERIO DERECHOS VARIOS','CEMENTERIO DERECHOS VARIOS',5567331],
        ['JURISDICCION MUNICIPAL','OTRAS TASAS','SALUD PUBLICA MUNICIPAL',381150.00],
        ['JURISDICCION MUNICIPAL','OTRAS TASAS','PESAS Y MEDIDAS',0],
        ['JURISDICCION MUNICIPAL','OTRAS TASAS','CEMENTERIO VENTA DE TERRENOS Y CONCESIONES',0],
        ['JURISDICCION MUNICIPAL','OTRAS TASAS','OCUPACION DE LA VIA PUBLICA',128320.50],
        ['JURISDICCION MUNICIPAL','OTRAS TASAS','PROPAGANDA Y PUBLICIDAD',0],
        ['JURISDICCION MUNICIPAL','OTRAS TASAS','ESPECTACULOS PUBLICOS JUEGOS Y DIVERSION',321436.50],
        ['JURISDICCION MUNICIPAL','OTRAS TASAS','VENDEDORES AMBULANTES',0],
        ['JURISDICCION MUNICIPAL','OTRAS TASAS','CONSTRUCCIONES',3003462.00],
        ['JURISDICCION MUNICIPAL','OTRAS TASAS','PAPEL SELLADO Y DERECHOS DE OFICINA',3077151.00],
        ['JURISDICCION MUNICIPAL','OTRAS TASAS','FONDO MUNICIPAL P.C.D.R. Y TURISMO',226149.00],
        ['JURISDICCION MUNICIPAL','OTROS INGRESOS MUNICIPALES','DERECHO DE ABASTO E INSPECCION VETERINARIA',7623.00],
        ['JURISDICCION MUNICIPAL','OTROS INGRESOS MUNICIPALES','CORTE DE PAVIMENTO',142296.00],
        ['JURISDICCION MUNICIPAL','OTROS INGRESOS MUNICIPALES','RECARGO POR MORA',696234.00],
        ['JURISDICCION MUNICIPAL','OTROS INGRESOS MUNICIPALES','INTERESES POR FINANCIACION',2149686.00],
        ['JURISDICCION MUNICIPAL','OTROS INGRESOS MUNICIPALES','MULTAS DEL TRIBUNAL DE FALTAS',3003462.00],
        ['JURISDICCION MUNICIPAL','OTROS INGRESOS MUNICIPALES','DEUDORES TASAS DIVERSAS ATRASADAS',747054.00],
        ['JURISDICCION MUNICIPAL','OTROS INGRESOS MUNICIPALES','DEUDORES INSTALACION RED CLOACAL Y AGUA CORRIENTE',0],
        ['JURISDICCION MUNICIPAL','OTROS INGRESOS MUNICIPALES','CONTRIBUCIÓN POR MEJORAS - CORDON CUNETA',0],
        ['JURISDICCION MUNICIPAL','OTROS INGRESOS MUNICIPALES','TASA ANDEN',1946406.00],
        ['JURISDICCION MUNICIPAL','OTROS INGRESOS MUNICIPALES','TASA RECOLECCION RESIDUOS PATOGENOS',421806.00],
        ['JURISDICCION MUNICIPAL','OTROS INGRESOS MUNICIPALES','EMISION VISACION Y DUPLICACION DE CARNET',858858.00],
        ['JURISDICCION MUNICIPAL','OTROS INGRESOS MUNICIPALES','ALUMBRADO PUBLICO COMPENSACIÓN',24119172.00],
        ['JURISDICCION MUNICIPAL','OTROS INGRESOS MUNICIPALES','TERMINAL DE OMNIBUS ARRENDAMIENTO DE LOCALES',828366.00],
        ['JURISDICCION MUNICIPAL','OTROS INGRESOS MUNICIPALES','MERCADO ARRENDAMIENTO DE PUESTOS Y LOCALES',121968.00],
        ['JURISDICCION MUNICIPAL','OTROS INGRESOS MUNICIPALES','ENTRADAS EXTRAORDINARIAS',3735270.00],
        ['JURISDICCION MUNICIPAL','OTROS INGRESOS MUNICIPALES','INTERESES PERCIBIDOS',9615144.00],
        ['JURISDICCION MUNICIPAL','OTROS INGRESOS MUNICIPALES','REGISTRO CONSUL. AUDIT.ESTUD. AMBIENTALES',5082.00],
        ['JURISDICCION MUNICIPAL','OTROS INGRESOS MUNICIPALES','ORD. 6463 TASA DE HIGIENE',10164.00],
        ['JURISDICCION MUNICIPAL','OTROS INGRESOS MUNICIPALES','ORD. Nº 6463 CONTRIBUCION POR MEJORA',0],
        ['JURISDICCION MUNICIPAL','OTROS INGRESOS MUNICIPALES','ACTUACIONES DE TRANSITO',66066.00],
        ['JURISDICCION MUNICIPAL','OTROS INGRESOS MUNICIPALES','REINTEGROS SEGUROS DE TERCEROS',533610.00],
        ['JURISDICCION MUNICIPAL','OTROS INGRESOS MUNICIPALES','COMISIONES COBRANZAS',45738.00],
        ['JURISDICCION MUNICIPAL','OTROS INGRESOS MUNICIPALES','CONFECCION CROQUIS COLISION',55902.00],
        ['JURISDICCION MUNICIPAL','OTROS INGRESOS MUNICIPALES','INGRESO PERSONAL DGSS',1654346.80],
        ['JURISDICCION MUNICIPAL','OTROS INGRESOS MUNICIPALES','CONTRIBUCION MUN. LEY PROV. 8916 COOP. GRAL URQUIZA LTDA. COMPENSACIÓN',55746.20],
        ['JURISDICCION MUNICIPAL','INGRESOS REGÍMENES ESPECIALES','CONTRIBUCION E.D.E.E.R.S.A.',22931163.75],
        ['JURISDICCION MUNICIPAL','INGRESOS REGÍMENES ESPECIALES','CONTRIBUCION MUNICIPAL LEY PROVINCIAL 8916 COOP. RUTA J LTDA',331570.25],
        ['JURISDICCION MUNICIPAL','INGRESOS REGÍMENES ESPECIALES','CONTRIBUCION MUNICIPAL LEY PROVINCIAL 8916 COOP. GRAL URQUIZA LTDA',44013.75],
        ['JURISDICCION MUNICIPAL','INGRESOS REGÍMENES ESPECIALES','CONTRIBUCIÓN E.D.E.R.D.A. COMPENSACIÓN',6035752.25],
        ['JURISDICCION PROVINCIAL','INMOBILIARIO','INMOBILIARIO',19709094.69],
        ['JURISDICCION PROVINCIAL','INMOBILIARIO ATRASADO','INMOBILIARIO ATRASADO',430000.00],
        ['JURISDICCION PROVINCIAL','AUTOMOTORES CORRIENTES','AUTOMOTORES CORRIENTES',41016987.70],
        ['JURISDICCION PROVINCIAL','INGRESOS BRUTOS CORRIENTES','INGRESOS BRUTOS CORRIENTES',75658419.61],
        ['JURISDICCIÓN NACIONAL','PARTICIPACION IMPUESTOS NACIONALES','PARTICIPACION IMPUESTOS NACIONALES',243239151.00],
        ['JURISDICCIÓN NACIONAL','FONDO FEDERAL SOLIDARIO','FONDO FEDERAL SOLIDARIO',16209137.00],
    ];

    $scope.ingresosFirstLevelReducedDataObject = $scope.ingresosRawData
        .reduce(function (result, element) {
            (result[element[0]]) ?
                result[element[0]] += element[3] : result[element[0]] = element[3];

            return result;
        }, {});

    $scope.ingresosFirstLevelReducedData = Object.keys($scope.ingresosFirstLevelReducedDataObject)
        .map(function(key) {
            return [key, $scope.ingresosFirstLevelReducedDataObject[key]];
        });

    $scope.totalIngresos = $scope.ingresosRawData.reduce(function(acc, element) { return acc + element[3]; }, 0);

    c3.generate({
        bindto: '#donutchartIngresos',
        data: {
            columns: $scope.ingresosFirstLevelReducedData,
            type : 'donut'
        },
        donut: {
            title: 'Ingresos 2018: ' + d3.format('$,.2f')($scope.ingresosFirstLevelReducedData)
        },
        tooltip: {
            format: {
                value: function(value, ratio, id, index) {
                    return d3.format('$,.2f')(value);
                }
            }
        },
        // TODO: Estoy no ayuda al responsiveness al ser un alto fijo
        size: {
            height: 600
        }
    });

    $scope.ingresos_treemap_data = $scope.ingresosRawData.map(function(element) {
        return {
            nivelUno: element[0],
            nivelDos: element[1],
            nivelTres: element[2],
            value: element[3]
        };
    });

    $scope.ingresos_group_by = ['nivelUno', 'nivelDos', 'nivelTres'];
}]);
