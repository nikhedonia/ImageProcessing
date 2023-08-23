import { Accordion, AccordionDetails, AccordionSummary, Box, Checkbox, FormControlLabel, MenuItem, Select, Slider, Typography } from "@mui/material";
import { ProcessorProps } from "./ProcessorProps";
import BlurOnIcon from '@mui/icons-material/BlurOn';
import { useCallback, useRef } from "react";
import { getValue } from "./getValue";

export function BlurFilter({image, onUpdate}: ProcessorProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const onChange = useCallback(() => {
    if (!formRef.current) 
      return null;

    setTimeout(()=>{
      const raw = Object.fromEntries(Array
        .from(formRef?.current!.querySelectorAll('input').values())
        .map(el => [el.name, getValue(el)])
      );
  
  
      const data = {
        radius: raw.radius,
        sigma: raw.sigma,
        //channels: [raw.red ?? 'r', raw.green ?? 'g', raw.blue ?? 'b'].filter(x=>x)
      }
  
  
      onUpdate(raw["operation"] as string, data);
    })
  
  },[]);

  return (
    <Accordion disabled={!image}>
      <AccordionSummary>
        <Box  sx={{display:'flex', fontWeight:'bold', alignItems:'center', justifyContent:'center', gap: '0.25em'}}>
          <BlurOnIcon />
          <span>Blur Filter</span> 
        </Box>
      </AccordionSummary>
      <AccordionDetails> 
        <form ref={formRef}>
          <Select name="operation" label="operation" defaultValue={"gaussianFilter"}>
            <MenuItem value="medianFilter">
                Median Filter
            </MenuItem>
            {/* <MenuItem value="blurFilter">
                Blur Filter (slow!!)
            </MenuItem> */}
            <MenuItem value="gaussianFilter">
                Gaussian Filter
            </MenuItem>
          </Select>
          <Box display="flex" gap={5}>
            <Typography> Radius </Typography> 
            <Slider name="radius" min={1} max={100} step={1} onChange={onChange} />
          </Box>
          <Box display="flex" gap={5}>
            <Typography> Sigma </Typography> 
            <Slider name="sigma" min={0.01} max={100} step={0.01} onChange={onChange}  />
          </Box>
        </form>
      </AccordionDetails>
    </Accordion>
  );
}