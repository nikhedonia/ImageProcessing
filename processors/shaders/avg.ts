import { GPU } from "gpu.js";
import { kern } from "./utils";

const avgControls = {
  name: 'Averaging Kernel',
  description: 'Averages the image by taking the average value in a pixel neighborhood for a given radius r',
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

export const avg = (gpu: GPU) => kern(gpu, 
  function(image: number[][][], r: number) {
    let sums = [0, 0, 0, 0];
    const radius = Math.floor(r);
    let c = 0;
    for(let i = -radius; i <= radius; i++) {
      for(let j = -radius; j <= radius; j++) {
        if (this.thread.y+i < 0 || this.thread.x+j < 0)
          continue;
        if (this.thread.y+i >= this.output.y || this.thread.x+j >= this.output.x)
          continue;

        ++c;

        const val = image[this.thread.y+i][this.thread.x+j];
        for(let k = 0; k < 4; k++) {
          sums[k] = sums[k] + val[k];
        }
      }
    }

    let avg = sums;
    
    for(let k = 0; k < 4; k++) {
      avg[k] = sums[k] / c;
    }
    this.color(avg[0], avg[1], avg[2], avg[3]);
  }
)