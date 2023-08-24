import Image from "image-js";
import { useEffect, useRef, useState } from "react";

type WorkSpaceProps = {
  image: Image 
}

export function WorkSpace ({image}: WorkSpaceProps) {
  const canvasRef = useRef(null);
  const [dataUrl, setDataUrl] = useState<string|null>(null);

  const [scale, setScale] = useState(1);
  const [[x,y], setImageXY] = useState([0,0]);

  useEffect(()=>{
    if (image) {
      image.toBlob().then(blob => {
        setDataUrl(window.URL.createObjectURL(blob));
      });
    }

    return ()=>{
      dataUrl && window.URL.revokeObjectURL(dataUrl);
    }
  },[image]);

  const [dragStart, setDragStart] = useState<null|[number,number,number,number]>(null);

  return (
    <div 
    ref={canvasRef}
    draggable={false}
    style={{
        gridArea:'c',
        userSelect:'none',
        display: 'flex', 
        padding: '1em',
        background:'#eee',
        overflow:'hidden',
        position: 'relative',
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

    onMouseUp={() => setDragStart(null)}
    onMouseLeave={() => setDragStart(null)}
    onClick={() => setDragStart(null)}
    onBlur={() => setDragStart(null)}

    onWheel={e => {
      setScale( scale + e.deltaY / 1000.0 )
    }}
    >
        <div style={{
          display:'block',
          position:'absolute',
          top: "-1000px",
          left: "-1000px",
          paddingLeft:'1000px',
          paddingTop:'1000px',
          right: "-1000px",
          bottom: "-1000px",
          backgroundPosition: `center center`,
          backgroundSize: `20px 20px`,
          transform: `translate(${x}px, ${y}px) scale(${scale})`,
          backgroundImage:`
              radial-gradient(circle, #000000 1px, rgba(0, 0, 0, 0) 1px),
              linear-gradient(to right, #ccc 1px, transparent 1px),
              linear-gradient(to bottom, #ccc 1px, transparent 1px)
          `
          }}>  
        {dataUrl && (
          <img
            draggable={false}
            style={{
              userSelect: 'none',
              objectFit: 'contain'
             }} 
            src={dataUrl} /> 
        )}
        

        </div>
    </div>
  )
}