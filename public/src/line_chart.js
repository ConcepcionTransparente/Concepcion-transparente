
//
// var linechart = c3.generate({
//     bindto: '#lineschart',
//     data: {
//       // url: 'example.json', //la carpeta raiz de busqueda es /public/
//       json: $scope.data,
//       mimeType: 'json',
//       keys: {
//           x: 'month', // it's possible to specify 'x' when category axis
//           value: ['amount'],
//       },
//       names: {
//         amount: 'Evolución del gasto'
//       }
//     },
//     axis: {
//         x: {
//           type: 'category'
//         },
//         y : {
//           tick: {
//             format: d3.format("$,")
//           }
//         }
//     },
//     grid: {
//       x: {
//         show: true
//       },
//       y: {
//         show: true
//       }
//     },
//     tooltip: {
//   format: {
//     name: function (name, ratio, id, index) { return 'Monto'; }
//   }
// }
//   });
// //   setTimeout(function () {
// //     linechart.transform('bar', 'amount');
// // }, 2000);
