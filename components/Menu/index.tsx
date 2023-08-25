import { Accordion, AccordionDetails, AccordionSummary, Box, Breadcrumbs, Button, ButtonProps } from '@mui/material';

import InfoIcon from '@mui/icons-material/Info';
import FolderIcon from '@mui/icons-material/Folder';
import MemoryIcon from '@mui/icons-material/Memory';
import BarChartIcon from '@mui/icons-material/BarChart';
import TerminalIcon from '@mui/icons-material/Terminal';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import { ToolBox } from '../processors/ToolBox';
import { ImageEntry } from '@/types';

import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { MouseEventHandler } from 'react';
import { Histogram } from '../Histogram';

export type MenuProps = {
  selected: number
  setSelected: (x:number)=>void
  images: ImageEntry[]
  disabled: boolean;
  update: (op:string, data: any)=>void,
  onAddFiles: MouseEventHandler<HTMLElement> | undefined
}

export function Menu ({disabled, selected, setSelected, images, onAddFiles, update}:MenuProps) {
  const workingImage = images[selected]?.image;
  const previewImage = images[selected]?.next?.image || workingImage;
  return (
    <>
      <Accordion>
      <AccordionSummary> 
        <Box style={{display:'flex', alignItems:'center', gap:'0.5em'}}> 
          <InfoIcon /> Info 
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <pre>
          <code>{
            JSON.stringify({
              name: images[selected]?.name,
              meta: workingImage?.meta,
              width: workingImage?.width,
              height: workingImage?.height,
              size: workingImage?.size,
              bitDepth: workingImage?.bitDepth,
              maxValue: workingImage?.maxValue,
              channels: workingImage?.channels,
              colorModel: workingImage?.colorModel,
            }, null, 2)
          }</code>
        </pre>
        
      </AccordionDetails>
    </Accordion>

    <Accordion>
      <AccordionSummary> 
        <Box style={{display:'flex', alignItems:'center', gap:'0.5em'}}> 
          <MemoryIcon /> Processing
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <ToolBox disabled={disabled} key={selected} image={workingImage} onUpdate={update} />
      </AccordionDetails>
    </Accordion>

    <Accordion>
      <AccordionSummary> 
        <Box style={{display:'flex', alignItems:'center', gap:'0.5em'}}>
          <BarChartIcon/> Analyze 
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Histogram key={selected} image={previewImage} />
      </AccordionDetails>
    </Accordion>

    <Accordion>
      <AccordionSummary> 
        <Box style={{display:'flex', alignItems:'center', gap:'0.5em'}}>
          <FolderIcon/> Files 
        </Box>
      </AccordionSummary>
      <AccordionDetails>


        <div>
            {images.map( (x, i)=>
              <div key={x.name+i} style={{
                display:'flex', 
                flexDirection:'column', 
                padding:'0.5em', 
                margin: '0.5em', 
                border:`solid 1px ${i == selected ? 'red' : 'black'}`,
                justifyContent:'center',
                alignItems:'center'
              }}>
                <img
                  style={{width:x.type == 'fs' ? '100%' : '90%' }} 
                  key={x.name} 
                  src={x.url} onClick={()=>{ setSelected(i); } } />
                <span>{x.name}</span>
              </div> 
            )}
          </div>

          <div style={{marginTop:'2em' }} onClick={onAddFiles}>
            <div style={{display:'flex', flexDirection:'column', alignItems: 'center', justifyContent: 'center'}}>
              <AddPhotoAlternateIcon style={{width:'5rem', height:'5rem'}}/>
              <span>add Image</span>
            </div>
          </div>

      </AccordionDetails>
    </Accordion>

    <Accordion>
      <AccordionSummary> 
        <Box style={{display:'flex', alignItems:'center', gap:'0.5em'}}>
          <TerminalIcon/> Workflows
        </Box>
      </AccordionSummary>
      <AccordionDetails>
      </AccordionDetails>
    </Accordion>


    <Accordion>
      <AccordionSummary> 
        <Box style={{display:'flex', alignItems:'center', gap:'0.5em'}}>
          <ImportExportIcon/> Export
        </Box> 
      </AccordionSummary>
      <AccordionDetails>
      </AccordionDetails>
    </Accordion>
    </>  
  )
}