import { useCallback, useMemo, useRef, useState} from 'react';
import { useDropzone } from 'react-dropzone';

import { Image } from 'image-js';
import { Box, Breadcrumbs, Button, ButtonProps } from '@mui/material';


import UndoIcon from '@mui/icons-material/Undo';
import CommitIcon from '@mui/icons-material/Commit';
import { ImageEntry, Operation } from '@/types';
import {Menu} from '@/components/Menu'
import { WorkSpace } from '@/components/WorkSpace';

function Crumb({operation, data, ...props}: Partial<Operation> & ButtonProps) {
  if(!operation) return null;
  return <Button {...props}>{operation}({JSON.stringify(data||{})})</Button>;
}

// const worker = (() => {
//   if (typeof(window) !== 'undefined') {
//     let id = 0;
//     const worker = new Worker(new URL('../worker.ts', import.meta.url));

//     const jobs = {} as Record<number, (val: unknown)=>void>;

//     worker.addEventListener("message", (result: MessageEvent<{id: number}>) => {
//       jobs[result.data.id]?.(result.data);
//     })

//     return async (image: Image, operation: string, options: unknown) => {

//       const blob = image.toBlob();
        
//       worker.postMessage({
//         id,
//         imageBlob: blob,
//         operation,
//         options
//       });

//       const p = new Promise(done => {jobs[id] = x => {done(x); delete jobs[id]}});

//       ++id;

//       return p;
//     }
  
//   } else {
//     return async (image: Image, operation: string, options: unknown) => {
//       // @ts-ignore
//       return image[operation](options);
//     }
//   }
// })();

function ImageProcessor() {
  const [selected, setSelected] = useState(0);
  const [images, setImages] = useState<ImageEntry[]>([]);


  const onDrop = useCallback( async (files: File[]) => {
    const [file] = files;
    const image = await Image.load(await file.arrayBuffer());
    setImages(images => [
      ...images, 
      {
        type: 'fs',
        name: file.name, 
        chain: [{
          parent: null,
          id: images.length,
          operation: 'fs',
          data: {input: file.name}
        }],
        image, 
        thumbnail: (image.width > 300) ? image.resize({width:300}) : image
      }
    ]);
  }, []);
  
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})
  

  const update = useCallback((operation: string, data: any) => {
    setImages(images => {
      console.log({selected});
      try {
        // @ts-ignore
        const image = images[selected]?.image[operation](data);
        const replaced = {
          ...images[selected],
          next: {
            id: selected,
            operation,
            data,
            image
          }
        }
  
        return [
          ...images.slice(0, selected), 
          replaced, 
          ...images.slice(selected+1)
        ]
      } catch (e) {
        console.error(e);
        return images
      }
    });
  }, [selected]);

  const workingImage = images[selected]?.next?.image || images[selected]?.image;

  const {onClick: onAddFiles, ...dropProps} = getRootProps();

  return (
    <div 
      {...dropProps}
      style={{
      display: 'grid', 
      height:'100vh',
      grid: `
        [r1-start]  " n   n"    2em [r1-end]
        [r2-start]  " c   r"    1fr [r1-end]
                 /   1fr 20em  
      `
    }}>
       <input {...getInputProps()} />

      <div className='topBar' style={{gridArea:'n', display: 'flex', height: '2rem', gap:'0.1em', alignItems: 'center'}}>
        <Button disabled={!images[selected]?.next}           
          onClick={()=>setImages(images => {
            delete images[selected].next;
            return [...images]
          })}><UndoIcon/></Button>
        {/* <Button><RedoIcon/></Button> */}
        <Button 
          disabled={!images[selected]?.next} 
          onClick={()=>{
            setImages(images => {
            const {image, operation, data} = images[selected].next!;
            delete images[selected].next;

            setTimeout(()=>{
              console.log('updating selection', selected, images.length)
              setSelected(images.length);
            })

            return [
              ...images, {
                type: 'op',
                name: operation,
                chain: [...images[selected].chain, {
                  parent: selected,
                  id: images.length,
                  operation,
                  data
                }],
                image,
                thumbnail: (image.width > 300) ? image.resize({width:300}) : image
              }
            ]
          })}}>
            <CommitIcon/>
          </Button>

        {workingImage && (
          <>
            <span> {workingImage?.width} </span>
            <span> x </span>
            <span> {workingImage?.height} </span>
          </>
        )}

        <Breadcrumbs separator=">" sx={{marginLeft:'1em'}}>
          {images[selected]?.chain.length>5 && <span>...</span> }
          {images[selected]?.chain.slice(-5).map( (x, i) => 
            // @ts-ignore
            <Crumb onClick={()=>{
              setSelected(x.id)
            }} style={{color:'#ccc'}} key={i} {...x} />
          )}
          {
            // @ts-ignore
            <Crumb style={{color:'#333'}} {...images[selected]?.next} />
          }
        </Breadcrumbs>
      </div>
      

      <WorkSpace image={workingImage}/>
        

      <div style={{gridArea: 'r', display:'flex', flexDirection:'column', overflowY:'auto'}}>
        <Menu images={images} selected={selected} setSelected={setSelected} update={update} onAddFiles={onAddFiles}/>
      </div>


    </div>
  )
}


export default function Home() {

  return (
    <ImageProcessor />
  );
}