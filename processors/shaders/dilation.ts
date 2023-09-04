import { GPU } from "gpu.js";
import { kern } from "./utils";
import { InputDescription } from "@/components/Controls";

const dilationControls: InputDescription = {
  name: 'Dilate',
  description: 'Dilates the image by taking the smallest value in a pixel neighborhood for a given radius r',
  mapping: (x: number[]) => x,
  defaults: [],
  controls: [{
    name: 'radius',
    description: 'Radius - size of the neighborhood',
    type: 'slider',
    config: {
      min: 1,
      max: 25,
      step: 1,
      default: 1
    }
  }, {
    name: 'radius',
    description: 'Radius - size of the neighborhood',
    type: 'slider',
    config: {
      min: 1,
      max: 25,
      step: 1,
      default: 1
    }
  }]
}
export const dilate = (gpu: GPU) => kern(gpu, function(image: number[][][], r: number) {
  let maxValue = [0, 0, 0, 0];
  let radius = Math.floor(r);
  for (let i = -radius; i <= radius; i++) {
    for (let j = -radius; j <= radius; j++) {
      const val = image[this.thread.y+i][this.thread.x+j];
      for(let k = 0; k < 4; k++) 
        maxValue[k] = maxValue[k] > val[k] ? maxValue[k] : val[k]
    }
  }

  this.color(maxValue[0], maxValue[1], maxValue[2], maxValue[3]);
})