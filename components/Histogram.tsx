import { Button } from "@mui/material";
import Image from "image-js";
import { useState } from "react";

const createBin = (bins: number) => {
  const range = 256 / bins;
  return (rgb: number[]) => {
    return `rgb(${rgb.slice(0, 3).map(x=>Math.ceil(x/range)*range).join(',')})`
  }
}

const bin8 = createBin(8);

export function Histogram({image}: {image:Image}) {
  const [histogram, setHistogram] = useState< Record<string, number> >({}); 
  const size = image?.width * image?.height;
  return (
    <div>
        <Button onClick={()=>{
          //setHistogram(image.getHistograms());

          const hist = {} as Record<string, number>;
          
          for (const rgba of image.getPixelsArray()) {
            const greyScale = image.components == 1
            const name = (greyScale) ? `rgb(${rgba[0]},${rgba[0]},${rgba[0]})` : bin8(rgba);
            hist[name] = hist[name] || 0
            hist[name] += 1.0;
          }
          setHistogram(hist);
        }}> Histogram</Button>

      <div style={{ overflowY:'scroll', height: '200px'}}>
        {Object
          .entries(histogram)
          .filter(([k,v]) => v > size * 0.001 )
          .sort( (a,b) => b[1] - a[1]).map( ([k,v]) => (
            <div key={k} style={{display:'flex'}}>
              <span style={{background:k, width:'1em', height:'1em', display:'block'}} /> 
              <span>{k} = </span>
              <span> {(v/size*100).toFixed(3)}% ({v}) </span>
            </div>
        ))}
      </div>
    </div>
  );
}