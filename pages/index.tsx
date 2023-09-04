import React, { SVGProps, forwardRef, useCallback, useMemo, useRef, useState} from 'react';
import { useDropzone } from 'react-dropzone';

import { Image as ImageJs} from 'image-js';
import { AppBar, Box, Breadcrumbs, Button, ButtonProps, Drawer, Icon, Slider, SliderProps, Step, StepContent, StepLabel, Stepper, Toolbar, Tooltip, useMediaQuery } from '@mui/material';


import UndoIcon from '@mui/icons-material/Undo';
import CommitIcon from '@mui/icons-material/Commit';
import { ImageEntry, Operation } from '@/types';
import { Editor } from '@/components/Editor';
import { Menu } from '@/components/Menu/Menu';

const createImage = (url: string, name: string | undefined = undefined, type = 'sample') => {
  if (typeof document === 'undefined')
   return {} as ImageEntry

  const element = document.createElement('img');
  element.src = url;

  return {
    type,
    name: name || url.replace('/ImageProcessing/', ''),
    url,
    element
  }
}

const defaultImages = [
  createImage('/ImageProcessing/ohhglob.png'),
  createImage('/ImageProcessing/flowers.jpg')
];

function ImageProcessor() {
  const [selected, setSelected] = useState(0);
  const [images, setImages] = useState<ImageEntry[]>(defaultImages as ImageEntry[]);


  const onDrop = useCallback( async (files: File[]) => {
    
    const all = await Promise.allSettled(files.map(async (file) => {

      const buf = await file.arrayBuffer();

     
      const image = await ImageJs.load(buf);
      const url = image.toDataURL();
      console.log({url, buf, image});
      //const url = await URL.createObjectURL(await image.toBlob());
      return {
        file,
        ...createImage(url, file.name, 'fs')
      };
    }));

    const imageEntries = Array
      .from(all.values())
      .map( (x) => {
        if(x.status !== 'fulfilled') return null;
        return x.value;
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
      <Menu images={images}/>
      <Editor images={images}/>
    </div>
  )
}


export default function Home() {

  return (
    <ImageProcessor />
  );
}