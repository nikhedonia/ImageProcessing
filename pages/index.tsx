import { useCallback, useMemo, useRef, useState} from 'react';
import { useDropzone } from 'react-dropzone';

import { Image } from 'image-js';
import { Breadcrumbs, Button, ButtonProps } from '@mui/material';

import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import UndoIcon from '@mui/icons-material/Undo';
import CommitIcon from '@mui/icons-material/Commit';
import { ToolBox } from '@/components/processors/ToolBox';
import { Histogram } from '@/components/Histogram';

type Operation = {
  id: number;
  operation: string;
  data: any;
}

type ImageEntry = {
  type: String, 
  name: string, 
  chain: Operation[],
  image: Image, 
  thumbnail: Image,
  next?: {
    image: Image
  } & Operation
}

function Crumb({operation, data, ...props}: Partial<Operation> & ButtonProps) {
  if(!operation) return null;
  return <Button {...props}>{operation}({JSON.stringify(data||{})})</Button>;
}

function ImageProcessor() {
  const [selected, setSelected] = useState(0);
  const [images, setImages] = useState<ImageEntry[]>([]);

  const [scale, setScale] = useState(1);
  const [[x,y], setImageXY] = useState([0,0]);


  const canvasRef = useRef<HTMLDivElement|null>(null);
  const [dragStart, setDragStart] = useState<null|[number,number,number,number]>(null);


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
  const dataUrl = useMemo(()=>{
    return workingImage?.toDataURL()
  }, [workingImage, images[selected]?.next])

  return (
    <div style={{
      display: 'grid', 
      height:'100vh',
      grid: `
        [r1-start]  "n    n   n"    2em [r1-end]
        [r2-start]  "l    c   r"    1fr [r1-end]
                 /  20em 1fr 20em  
      `
    }}>

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
      
        <div style={{gridArea: 'l', background:'#eee', overflowY: 'scroll'}}>
          <input {...getInputProps()} />

          <div style={{ width: '15em'}}>
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
                  src={x.thumbnail.toDataURL()} onClick={()=>{ setSelected(i); } } />
                <span>{x.name}</span>
              </div> 
            )}
          </div>

          <div {...getRootProps()} style={{marginTop:'2em' }}>
            <div style={{display:'flex', flexDirection:'column', alignItems: 'center', justifyContent: 'center'}}>
              <AddPhotoAlternateIcon style={{width:'5rem', height:'5rem'}}/>
              <span>add Image</span>
            </div>
          </div>
          
        </div>

        {workingImage && 
          <div 
          ref={canvasRef}
          draggable={false}
          style={{
            gridArea:'c',
            userSelect:'none',
            display: 'flex', 
            padding: '1em',
            background:'#ccc',
            overflow:'hidden',
            position: 'relative'
          }}
        
          onMouseDown={e => {
            if(!canvasRef.current) return;
            const dx = e.clientX
            const dy = e.clientY
            setDragStart([dx, dy, x,y]);
          }}

          onMouseMove={e => {
            if (!dragStart || !canvasRef.current) return 
            
            const dx = e.clientX - dragStart[0]
            const dy = e.clientY - dragStart[1]
          
            setImageXY([dx+dragStart[2], dy+dragStart[3]]);

          }}

          onMouseUp={()=> setDragStart(null)}
          onMouseLeave={()=> setDragStart(null)}
          onClick={()=> setDragStart(null)}
          onBlur={()=> setDragStart(null)}

          onWheel={e=>{
            setScale( scale + e.deltaY / 1000.0 )
          }}
          >
            {<img
              draggable={false}

              style={{
                userSelect: 'none',
                transform: `translate(${x}px, ${y}px) scale(${scale})`,
                objectFit: 'contain'
              }} 
              src={dataUrl} /> 
            }
          </div>
        }
        

      <div style={{gridArea: 'r', display:'flex', flexDirection:'column', gap: '1em', overflowY:'scroll'}}>
        <h2>Tools</h2>

        <ToolBox key={selected} image={workingImage} onUpdate={(operation, data) => {
          update(operation, data);
        }} />

        <div>
          <Histogram image={workingImage}/>
        </div>
      </div>


    </div>
  )
}


export default function Home() {

  return (
    <ImageProcessor />
  );
}