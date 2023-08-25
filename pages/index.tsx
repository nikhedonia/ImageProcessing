import { useCallback, useMemo, useRef, useState} from 'react';
import { useDropzone } from 'react-dropzone';

import { Image } from 'image-js';
import { Box, Breadcrumbs, Button, ButtonProps } from '@mui/material';


import UndoIcon from '@mui/icons-material/Undo';
import CommitIcon from '@mui/icons-material/Commit';
import { ImageEntry, Operation } from '@/types';
import {Menu} from '@/components/Menu'
import { WorkSpace } from '@/components/WorkSpace';
import objHash from 'object-hash';

function Crumb({operation, data, ...props}: Partial<Operation> & ButtonProps) {
  if(!operation) return null;
  return <Button {...props}>{operation}({JSON.stringify(data||{})})</Button>;
}

const worker = (() => {
  if (typeof(window) !== 'undefined') {
    const worker = new Worker(new URL('../worker.ts', import.meta.url));

    const jobs = {} as Record<string, (val: string)=>void>;

    worker.addEventListener("message", (result: MessageEvent<{url: string, hash: string}>) => {
      console.log({result});
      jobs[result.data.hash]?.(result.data.url);
    })

    return async (url: string, operation: string, options: unknown): Promise<string> => {

      const task = {url, operation, options};
      const hash = objHash(task);
      
      console.log({
        hash,
        ...task
      });

      worker.postMessage({
        hash,
        ...task
      });

      const p = new Promise<string>(done => {
        jobs[hash] = (x: string) => {
          done(x); 
          delete jobs[hash]
        }
      });

      return p;
    }
  
  } else {
    return async (url: string, operation: string, options: unknown) => {
      return "";
    }
  }
})();

function ImageProcessor() {
  const [selected, setSelected] = useState(0);
  const [images, setImages] = useState<ImageEntry[]>([]);


  const onDrop = useCallback( async (files: File[]) => {
    
    const all = await Promise.allSettled(files.map(async (file) => {
     // const url = await window.URL.createObjectURL(file);

      const buf = await file.arrayBuffer();
     
      const image = await Image.load(buf);
      const url = image.toDataURL();
      return {file, url, image};
    }));

    const imageEntries = Array
      .from(all.values())
      .map( (x) => {
        if(x.status !== 'fulfilled') return null;

        return {
          type: 'fs',
          name: x.value.file.name,
          chain: [{
            parent: null,
            id: images.length,
            operation: 'fs',
            data: {input: x.value.file.name}
          }],
          ...x.value
        }
      }).filter(Boolean) as ImageEntry[];

    setImages(images => [
      ...images, 
      ...imageEntries
    ]);
  },[images, selected]);
  
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop});

  const [running, setRunning] = useState(false);
  

  const update = useCallback(async (operation: string, options: unknown) => {

    if (running) return;
    const entry = images[selected];

    console.log(images, entry, selected);
    console.log('update', {url: entry.url, operation, options});
    setRunning(true);


    try {
      const url = await worker(entry.url, operation, options);
      const image = await Image.load(url);
      setRunning(false);

      setImages(images => {
        try {
          // @ts-ignore


          const replaced = {
            ...entry,
            next: {
              url,
              id: selected,
              operation,
              image,
              data: options
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
  } catch (e) {
    console.log(e);
    setRunning(false);
  }
  }, [images.length, selected]);

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
          onClick={async ()=>{
            setImages(images => {
              const {url, image, operation, data} = images[selected].next!;
              delete images[selected].next;

              setTimeout(()=>{
                console.log('updating selection', selected, images.length)
                setSelected(images.length);
              })

              return [
                ...images, {
                  url,
                  type: 'op',
                  name: operation,
                  chain: [...images[selected].chain, {
                    parent: selected,
                    id: images.length,
                    operation,
                    data
                  }],
                  image
                }
              ]
            })}}
          >
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
        <Menu 
          disabled={running} 
          images={images} 
          selected={selected} 
          setSelected={setSelected} 
          update={update} 
          onAddFiles={onAddFiles}
        />
      </div>


    </div>
  )
}


export default function Home() {

  return (
    <ImageProcessor />
  );
}