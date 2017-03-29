import {$f} from './fn';

// function test(){

//   $f.ajax({
//     url: '/test',
//     method: 'GET',
//     //body: {},   如果是post就这样加上body
//     success: (result) => {
//       console.log(result);
//     },
//     error: (err) => {
//       console.log(err);
//     }
//   });
// }
// test();
// console.log(5);


// let stacks = new Map();
//         // create a stack for each agent
//         let Iter = this.traces.keys();

//         this.traces.forEach((value, key) => {
//             let stack = [];
//             stacks.set(key, stack);
//         });
        
//         this.traces.forEach((value, key) => {
//             var trace = this.traces.get(key);
//             var stack = stacks.get(key);
//             var lastPosition = trace[trace.length - 1];
//             stack.push(lastPosition);
//         });

//         while (this.isComplete() != 1) {
//             this.traces.forEach((value, key) => {
//                 var trace = this.traces.get(key);
//                 var stack = stacks.get(key);
//                 var lastPosition = trace[trace.length - 1];
//                 // stack.push(lastPosition);
//                 var neighbour = this.findANeighbour(lastPosition.row, lastPosition.column);

//                 if (!neighbour) {
//                     if (stack.length === 0) return;
//                     stack.pop();
//                     if (stack.length === 0) return;
//                     var nextPosition = stack[stack.length - 1];
//                     this.visited[nextPosition.row][nextPosition.column]++;
//                     trace.push(nextPosition);
//                 } else {
//                     this.visited[neighbour.row][neighbour.column]++;
//                     stack.push(neighbour);
//                     trace.push(neighbour);
//                 }
//             });
//         }

const obj = {
    method: 'post',
    url: '/test',
    data: JSON.stringify({test: 123})
};
$f.ajax(obj)
    .then((result) => {
        console.log(result);
    }).catch((err) => {
        console.log(err);
    });
