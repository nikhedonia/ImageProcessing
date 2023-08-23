import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Checkbox, FormControlLabel, MenuItem, Select, Slider, Typography } from "@mui/material";
import { ProcessorProps } from "./ProcessorProps";
import RadarIcon from '@mui/icons-material/Radar';
import { useCallback, useRef } from "react";
import { getValue } from "./getValue";

export function EdgeDetection({image, onUpdate}: ProcessorProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const onChange = useCallback(() => {
    if (!formRef.current) 
      return null;

    setTimeout(()=>{
      const data = Object.fromEntries(Array
        .from(formRef?.current!.querySelectorAll('input').values())
        .map(el => [el.name, getValue(el)])
      );
      
      const {operation, ...options} = data;

      const [name, direction] = (operation as string).split('-');
      
  
      onUpdate(name as string, {...options, direction});
    })
  
  },[]);

  return (
    <Accordion disabled={!image}>
      <AccordionSummary>
        <Box  sx={{display:'flex', fontWeight:'bold', alignItems:'center', justifyContent:'center', gap: '0.25em'}}>
          <RadarIcon />
          <span> Edge Detection </span> 
        </Box>
      </AccordionSummary>
      <AccordionDetails> 
        <form ref={formRef}>
          <Select name="operation" label="operation" defaultValue={"sobelFilter-xy"}>
            <MenuItem value="cannyEdge" disabled={image?.components! > 1}>
                Canny Edge
            </MenuItem>

            <MenuItem value="morphologicalGradient" disabled={image?.components! > 1}>
                Morphological Gradient
            </MenuItem>

            <MenuItem value="sobelFilter-x">
                Sobel X
            </MenuItem>
            <MenuItem value="sobelFilter-y">
                Sobel Y
            </MenuItem>
            <MenuItem value="sobelFilter-xy">
                Sobel XY
            </MenuItem>

            {/* <MenuItem value="gradientFilter-x">
                Gradient X
            </MenuItem>
            <MenuItem value="gradientFilter-y">
                Gradient Y
            </MenuItem>
            <MenuItem value="gradientFilter-xy">
                Gradient XY
            </MenuItem> */}
          </Select>

          <Button onClick={onChange}>Run</Button>
        </form>
      </AccordionDetails>
    </Accordion>
  );
}