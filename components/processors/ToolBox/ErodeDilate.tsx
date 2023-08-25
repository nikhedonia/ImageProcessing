import { Accordion, AccordionDetails, AccordionSummary, Box, Checkbox, FormControlLabel, MenuItem, Select, Slider, Typography } from "@mui/material";
import { ProcessorProps } from "./ProcessorProps";
import DeBlurIcon from '@mui/icons-material/Deblur';
import { useCallback, useRef } from "react";
import { getValue } from "./getValue";

export function ErodeDilate({disabled, image, onUpdate}: ProcessorProps) {
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
  
      onUpdate(operation as string, options);
    })
  
  },[]);

  return (
    <Accordion disabled={!image || image.components > 1}>
      <AccordionSummary>
        <Box  sx={{display:'flex', fontWeight:'bold', alignItems:'center', justifyContent:'center', gap: '0.25em'}}>
          <DeBlurIcon />
          <span> Erode/Dilate</span> 
        </Box>
      </AccordionSummary>
      <AccordionDetails> 
        <form ref={formRef}>
          <Select name="operation" label="operation" defaultValue={"erode"}>
            <MenuItem value="erode">
                Erode
            </MenuItem>
            <MenuItem value="dilate">
                Dilate
            </MenuItem>
            <MenuItem value="open">
                Open (Dilate + Erode)
            </MenuItem>
            <MenuItem value="open">
                Close (Erode + Dilate)
            </MenuItem>

            <MenuItem value="blackHat">
                Black Hat
            </MenuItem>

            <MenuItem value="topHat">
                White Hat
            </MenuItem>

          </Select>
          <Box display="flex" gap={5}>
            <Typography> Iterations </Typography> 
            <Slider disabled={disabled} name="iterations" min={1} max={100} step={1} onChange={onChange} />
          </Box>
        </form>
      </AccordionDetails>
    </Accordion>
  );
}