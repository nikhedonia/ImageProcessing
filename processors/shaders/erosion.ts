import { GPU } from "gpu.js";
import { kern } from "./utils";

const erosionControls = {
    name: 'Erosion',
    description: 'Erodes the image by taking the smallest value in a pixel neighborhood for a given radius r',
    controls: [{
      description: 'Radius - size of the neighborhood',
      type: 'slider',
      mapping: '0',
      config: {
        min: 1,
        max: 25,
        step: 1,
        default: 1
      }
    }]
  }
  
export const erode = (gpu: GPU) => kern(gpu, function(image: number[][][], r: number) {
    let minValue = [1.0, 1.0, 1.0, 1.0];
    let radius = Math.floor(r);
    for (let i = -radius; i <= radius; i++) {
      for (let j = -radius; j <= radius; j++) {
        if (this.thread.y+i < 0 || this.thread.x+j < 0)
          continue;
        if (this.thread.y+i >= this.output.y || this.thread.x+j >= this.output.x)
          continue;
        const val = image[this.thread.y+i][this.thread.x+j];
        for(let k = 0; k < 4; k++) 
          minValue[k] = minValue[k] < val[k] ? minValue[k] : val[k]
      }
    }
  
    this.color(minValue[0], minValue[1], minValue[2], minValue[3]);
  })