import React, { SVGProps, forwardRef, useCallback, useMemo, useRef, useState} from 'react';
import { useDropzone } from 'react-dropzone';

import { Image } from 'image-js';
import { AppBar, Box, Breadcrumbs, Button, ButtonProps, Drawer, Icon, Slider, SliderProps, Step, StepContent, StepLabel, Stepper, Toolbar, Tooltip, useMediaQuery } from '@mui/material';


import UndoIcon from '@mui/icons-material/Undo';
import CommitIcon from '@mui/icons-material/Commit';
import { ImageEntry, Operation } from '@/types';
import {Menu} from '@/components/Menu/Menu'
import { Controls } from '@/components/Controls';
import { Editor } from '@/components/Editor';




// const NumberOrSlider = (props: SliderProps) => {

//   return (
//     <Box sx={{
//         "&": {paddingLeft: "15px"},
//         "& .input": {position:'absolute', left: "1em", width: '0', overflow:'hidden', transition: '0.2s width ease-in' },
//         "&:hover .input": {width: '10em', padding: "0.2em",overflow:'hidden' },
//         "& .value": {position:'relative', display:'inline-flex', width:'20em', gap:'10px', alignItems:'center'},
//     }}>
//       <span>{props.name}:</span>
//       <span className="value"> 
//         <span>{props.value || props.defaultValue}</span> 
//         <span className="input" tabIndex={0}>
//           <Slider {...props} />
//         </span>
//       </span>
//     </Box>
//   )
// }

// const WorkSpace =  (props: unknown) => (
//   <svg 
//     {...props}
//     width="100%" 
//     height="100%" 
//     xmlns="http://www.w3.org/2000/svg" 
//     viewBox="-100 -100 1000 1000">
//     <defs>
//       <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
//         <path d="M 10 0 L 0 0 0 10" fill="none" stroke="gray" strokeWidth="0.5"/>
//       </pattern>
//       <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
//         <rect width="100" height="100" fill="url(#smallGrid)"/>
//         <path d="M 100 0 L 0 0 0 100" fill="none" stroke="gray" strokeWidth="1"/>
//       </pattern>
//     </defs>
        
//     <rect x={"-100%"} y="-100%" width="200%" height="200%" fill="url(#grid)" />
//     <image href={"/ImageProcessing/ohhglob.png"} />
//   </svg>
// );

function ImageProcessor() {
  const [selected, setSelected] = useState(0);
  const [images, setImages] = useState<ImageEntry[]>([]);


  const onDrop = useCallback( async (files: File[]) => {
    
    const all = await Promise.allSettled(files.map(async (file) => {

      const buf = await file.arrayBuffer();

     
      const image = await Image.load(buf);
      const url = image.toDataURL();
      console.log({url, buf, image});
      //const url = await URL.createObjectURL(await image.toBlob());
      return {
        file,
        name: file.name, 
        url, 
        image
      };
    }));

    const imageEntries = Array
      .from(all.values())
      .map( (x) => {
        if(x.status !== 'fulfilled') return null;
        return {
          type: 'fs',
          ...x.value
        }
      }).filter(Boolean) as ImageEntry[];

    setImages(images => [
      ...images, 
      ...imageEntries
    ]);
    setSelected(images.length);
  }, [images, selected]);
  
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop});
  const {tabIndex: _, onClick: onAddFiles, ...dropProps} = getRootProps();

  return (
    <div style={{
      display: 'flex',
      height: '100vh'
    }}>
      <input {...getInputProps()}/>
      <Editor/>
      <div>
        <img id="input" src="/ImageProcessing/flowers.jpg" />
        <img id="result" />
      </div>
    </div>
  )
}


export default function Home() {

  return (
    <ImageProcessor />
  );
}