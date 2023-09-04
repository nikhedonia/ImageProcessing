import { GPU } from "gpu.js";
import { kern } from "./utils";

export const gradient = (gpu: GPU) => kern(gpu, function(image: number[][][], r: number, f: number) {
    let minValue = [1.0, 1.0, 1.0, 1.0];
    let maxValue = [0, 0, 0, 0];
    let gradient = [0, 0, 0, 0];
  
    let radius = Math.floor(r);
    for (let i = -radius; i <= radius; i++) {
      for (let j = -radius; j <= radius; j++) {
        const val = image[this.thread.y+i][this.thread.x+j];
        for(let k = 0; k < 4; k++) {
          minValue[k] = minValue[k] < val[k] ? minValue[k] : val[k]
          maxValue[k] = maxValue[k] > val[k] ? maxValue[k] : val[k]
        }
      }
    }
  
  
    for (let k = 0; k < 4; k++) {
      const val = image[this.thread.y][this.thread.x];
      const exterior = maxValue[k] - val[k];
      const interior = val[k] - minValue[k];
      gradient[k] = f * exterior + (1.0-f) * interior
    }
  
    this.color(gradient[0], gradient[1], gradient[2], gradient[3]);
  })