import { Accordion, AccordionDetails, AccordionSummary, Box, Checkbox, FormControlLabel, MenuItem, Select, Slider, Typography } from "@mui/material";
import { ProcessorProps } from "./ProcessorProps";
import BlurOnIcon from '@mui/icons-material/BlurOn';
import { useCallback, useRef } from "react";
import { getValue } from "./getValue";
import Grid4x4Icon from '@mui/icons-material/Grid4x4';

type ToolControlProps = {
  type: 'slider';
  min: number;
  max: number;
  defaultValue: number;
} | {
  type: 'direction';
} | {
  type: 'channel';
} | {
  type: 'checkbox';
} | {
  type: 'options';
  options: string[];
}

type ToolDescription = {
  name: string
  operation: string
  ui: ToolControl[]
}

type ToolProps = {
  tool: ToolDescription
  imageEntry: ProcessorProps
}

function ToolControlUI () 

function Tool ({imageEntry, tool}: ToolProps) {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <Accordion disabled={!imageEntry.image}>
    <AccordionSummary>
      <Box  sx={{display:'flex', fontWeight:'bold', alignItems:'center', justifyContent:'center', gap: '0.25em'}}>
        <Grid4x4Icon />
        <span>{tool.name}</span> 
      </Box>
    </AccordionSummary>
    <AccordionDetails> 
      <form ref={formRef}>
        <Box display="flex" gap={5}>
          <Typography> Radius </Typography> 
          <Slider name="region" min={1} max={10} step={1} defaultValue={3} onChange={onChange} />
        </Box>
      </form>
    </AccordionDetails>
  </Accordion>
  )
}



export function Grid({image, onUpdate}: ProcessorProps) {
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
        region: raw.region
        //channels: [raw.red ?? 'r', raw.green ?? 'g', raw.blue ?? 'b'].filter(x=>x)
      }
  
  
      onUpdate("localMaxima", data);
    })
  
  },[]);

  return (
    <Accordion disabled={!image}>
      <AccordionSummary>
        <Box  sx={{display:'flex', fontWeight:'bold', alignItems:'center', justifyContent:'center', gap: '0.25em'}}>
          <Grid4x4Icon />
          <span>Grid Operations</span> 
        </Box>
      </AccordionSummary>
      <AccordionDetails> 
        <form ref={formRef}>
          <Box display="flex" gap={5}>
            <Typography> Radius </Typography> 
            <Slider name="region" min={1} max={10} step={1} defaultValue={3} onChange={onChange} />
          </Box>
        </form>
      </AccordionDetails>
    </Accordion>
  );
}