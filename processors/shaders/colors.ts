import { GPU } from "gpu.js";
import { kern } from "./utils";

// export const recolor = (gpu: GPU) => kern(gpu, 
//     function(image: number[][][],  from: number[], weights: number[], to: number[]) {
//       const color = image[this.thread.y][this.thread.x];
  
//       let distance = 0.0;
//       for (let k=0; k<3; k++) {
//         distance += weights[k] * Math.abs(color[k] - from[k]) ** 2
//       }
  
//       if ( distance < from[3]*from[3]) {
//         this.color(to[0], to[1], to[2], to[3])
//       } else {
//         this.color(color[0], color[1], color[2], color[3]);
//       }
//     }
//   )
  
  
  
//   export const rebalance = (gpu: GPU) => kern(gpu, 
//     function(image: number[][][], weights: number[]) {
//       const color = image[this.thread.y][this.thread.x];
  
//       let c = 0
  
//       for (let k=0; k<4; k++) {
//         c+=weights[k]
//       }
  
//       this.color( 
//         color[0]*weights[0] / c,
//         color[1]*weights[1] / c,
//         color[2]*weights[2] / c,
//         color[3]*weights[3] / c
//       )
//     }
//   )
  
  
  
export const greyscale = (gpu: GPU) => kern(gpu, 
  function(image: number[][][], w: number[]) {
    const color = image[this.thread.y][this.thread.x];

    const min1 = (color[0] < color[1]) ? color[0] : color[1];
    const min = min1 < color[2] ? min1 : color[2]

    const max1 = (color[0] > color[1]) ? color[0] : color[1];
    const max = min1 > color[2] ? max1 : color[2]

    const minMax = min * w[4] + max * w[5];

    const luma = w[0] * color[0] + w[1] * color[1] + w[2] * color[2] + w[3] * color[3] + minMax;

    const c1 = w[6];
    const c2 = (1.0-w[6]);

    this.color( 
      color[0] * c1 + luma * c2,
      color[1] * c1 + luma * c2,
      color[2] * c1 + luma * c2,
      (1.0-w[7]) + w[7] * color[3]
    )
  }
)