import { Accordion, AccordionDetails, AccordionSummary, Box, Paper, Slider, Typography } from "@mui/material"
import { useRef, useState } from "react"

export type SliderInputType = {
  min: number,
  max: number,
  step: number,
  default: number
}

export type InputDescription = {
  description: string,
  name: string,
  mapping: (x: number[]) => unknown,
  defaults: {
    name: string
    description?: string
    config: number[]
  }[],
  controls: {
    type: "slider",
    description: string,
    name: string,
    config: SliderInputType 
  }[]
}


export function InputController(props: InputDescription['controls'][0]) {
  return (
    <Box sx={{display:'flex', gap:'1em', alignItems:'center'}}>
      <Typography>{props.name}</Typography>
      <Slider 
        name={props.name} 
        {...props.config} 
        marks
        valueLabelDisplay="auto"
        getAriaValueText={(value: number) => `${value}px`}
        /> 
    </Box>
  );
}



export function Controls(props: InputDescription) {
  //const [config, setConfig] = useState(props.defaults[0]);
  const ref = useRef<HTMLDivElement>(null);
  return (
    <Paper>
      <Accordion>
        <AccordionSummary> {props.name} </AccordionSummary>
        <AccordionDetails> 
          <Typography>{props.description}</Typography>
          <Box ref={ref}>
            {props
              .controls
              .map( x => <InputController key={x.name} {...x} />)}
          </Box>     
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
}