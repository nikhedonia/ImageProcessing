import { GPU } from "gpu.js";
import { kern } from "./utils";

export const sobel = (gpu: GPU) => kern(gpu, 
    function(image: number[][][], f: number[]) {
      let cgx = [0.0, 0.0, 0.0, 0.0];
      let cgy = [0.0, 0.0, 0.0, 0.0];
      let g = [0.0, 0.0, 0.0, 0.0];
  
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const mi = i == 2 ? -1 : 1;
          const mj = j == 2 ? -1 : 1;
          const gx =  -(j-1) * (i+mi);
          const gy =  -(i-1) * (j+mj);
          const c = image[this.thread.y+i-1][this.thread.x+j-1];
  
          for (let k = 0; k < 4; k++) {
            cgx[k] += gx * c[k];
            cgy[k] += gy * c[k];
          }
        }
      }
  
      for (let k = 0; k < 4; k++) {
        g[k] = Math.sqrt(
          cgx[k] * cgx[k] * f[0] + 
          cgy[k] * cgy[k] * f[1] 
        )
      }
  
      this.color(g[0], g[1], g[2], 1.0);
    }
  )