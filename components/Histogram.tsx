import { Button } from "@mui/material";
import Image from "image-js";
import { useState } from "react";
import {VerticalBarSeries, XYPlot} from "react-vis";

const fill = [
  'red','green', 'blue'
]

export function Histogram({image}: {image:Image}) {
  const [histogram, setHistogram] = useState< Record<string, number> >([]); 
  return (
    <div>
        <Button onClick={()=>{
          //setHistogram(image.getHistograms());

          const hist = {} as Record<string, number>;
          for (const [r,g,b,a] of image.getPixelsArray()) {
            const greyScale = image.components == 1
            const name = (greyScale) ? `rgb(${r},${r},${r})` : `rgba(${r||0},${g||0},${b||0},${a||1})`;
            hist[name] = hist[name] || 0
            hist[name] += 1;
          }

          setHistogram(hist);
          console.log(hist);
        }}> Histogram</Button>

      <div style={{ overflowY:'scroll', height: '200px'}}>
        {Object.entries(histogram).sort( (a,b) => b[1] - a[1]).map( ([k,v]) => (
          <div key={k} style={{display:'flex'}}>
            <span style={{background:k, width:'1em', height:'1em', display:'block'}} /> 
            <span>{k} = </span>
            <span> {v} </span>
          </div>
        ))}
      </div>
    </div>
  );
}