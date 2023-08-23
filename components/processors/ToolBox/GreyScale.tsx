import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Checkbox, FormControlLabel, Slider, Typography } from "@mui/material";
import { ProcessorProps } from "./ProcessorProps";
import { GreyAlgorithm } from 'image-js';
import ContrastIcon from '@mui/icons-material/Contrast';

const greys = [
  'luma709',
  'luma601',
  'maximum',
  'minimum',
  'average',
  'minmax',
  'red',
  'green',
  'blue',
  'cyan',
  'magenta',
  'yellow',
  'black',
  'hue',
  'saturation',
  'lightness',
] as GreyAlgorithm[]

export function GreyScale({image, onUpdate}: ProcessorProps) { 
  return (
    <Accordion disabled={!image}>
      <AccordionSummary>
        <Box  sx={{display:'flex', fontWeight:'bold', alignItems:'center', justifyContent:'center', gap: '0.25em'}}>
          <ContrastIcon />
          <span>Grey Scale</span> 
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {greys.map(algorithm => (
          <Button key={algorithm} onClick={()=>onUpdate("grey", {algorithm})}>{algorithm}</Button>
        ))}
      </AccordionDetails>
    </Accordion>
  );
}