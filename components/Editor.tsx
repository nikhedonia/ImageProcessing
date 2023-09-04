import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-typescript";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";

import dedent from "dedent";
import { useEffect, useMemo, useRef, useState } from "react";
import { UIState, evalSpec, evaluator, run } from "@/evaluator";
import { GPU } from "gpu.js";
import { Box, Slider } from "@mui/material";
import {debounce} from 'lodash'
import objectHash from "object-hash";
import { ImageEntry } from "@/types";


const defaultText= dedent`
  const img = image("ohhglob.png");

  const radius = slider("radius", 0, 10);



  const transform = pipeline([
    greyscale({
      rgba:[1,1,1,0],
      minMax: [0.5, 0.5]
    }),
    gradient({radius})
  ]);


  return run(img, transform);
`



type EditorProps = {
  images: ImageEntry[],
  onChange?: (text: string) => void
}

let g = {};

export function Editor({images}: EditorProps) {
  const editorRef = useRef<AceEditor>(null);
  const [ui, setUI] = useState<UIState>({});
  const [text, setText] = useState("");
  const compiledSpec = useMemo(()=>evalSpec(text, ui), [text, objectHash(ui)]);
  const [error, setError] = useState<null|string>(null);
  const [workingImages, setWorkingImages] = useState<Record<string, {type: string, pipelineId: string, name: string, url: string}>>({});

  const debouncedSetUI = useMemo(() => debounce(setUI, 500), []);
  const runSpec = useMemo(()=>debounce(async (spec: typeof compiledSpec) => {
    if (!spec) return;
    const start = +new Date();
    try {
      const {ops, uiOps, error} = spec; 
      setError(error as string);
      if(error || !ops || !uiOps) {
        console.log({error});
        return;
      }
      debouncedSetUI(uiOps);
      
      if (ops) {
        const pipelines = evaluator(ops, g);
        g = pipelines;
        const htmlImageMap = Object.fromEntries(images.map(x => [x.name, x.element]))

        const inputImages = Object.fromEntries(
          Object
            .values(pipelines)
            .flatMap(p => 
              p.deps.map(x => ({
                type: 'input',
                pipelineId: p.pipelineId,
                name: x.args.path,
                url: htmlImageMap[x.args.path].src
              }))
            ).map(x=> [x.name, x])
        );

        setWorkingImages(images => ({...images, ...inputImages}));

        const outputImages = Object.fromEntries(await Promise.all(
          run(pipelines, htmlImageMap)
            .map( async ({pipeline: p, result}) => {
              if (typeof result === 'string') {
                console.log('using asset from cache');
                return {
                  type: 'output',
                  pipelineId: p.pipelineId,
                  name: p.outputId,
                  url: result
                }
              }

              console.log('re-running', p);
              const src = await URL.createObjectURL(await p.gpu.canvas.convertToBlob());
              p.assets[p.outputId] = {
                type: 'output',
                src
              };

              return {
                type: 'output',
                pipelineId: p.pipelineId,
                name: p.outputId,
                url: src
              }
            }).map( p => p.then(x  => {
              setWorkingImages(images => ({...images, [x.name]: x}));
              return [x.name, x];
            }))
          ))

        setWorkingImages({
          ...inputImages, 
          ...outputImages
        });



      }

    } catch (e) {
      console.log(e);
    }
  }, 300),[ui]);

  useEffect(()=>{
    runSpec(compiledSpec);
  }, [compiledSpec, text]);


  return (
    <Box >
      <AceEditor
        ref={editorRef}
        onLoad={()=>{
          if(!editorRef.current) return;

          const {editor} = editorRef.current;

          editor.completers.push({
            getCompletions: (editor, session, pos, prefix, callback) => {
              callback(null, [{
                caption: 'dilate', 
                value: 'dilate({radius: 1})', 
                meta: `dilate({radius: 1}) \n  radius is \n cool`
              }, {
                caption: 'erode', 
                value: 'erode({radius: 1})',
                score: 1000,
                meta: `erode({radius: 1}) \n  radius is \n cool`,
                docHTML: `
                  <h1> Erosion </h1>
                  <p onClick="console.log('blub')"> radius is <b>cool</b> </p>
                `
              }])
          }})
        }}
        mode="typescript"
        tabSize={2}
        theme="monokai"
        onChange={(text: string) => {
          setText(text);
        }}
        name="UNIQUE_ID_OF_DIV"
        editorProps={{ $blockScrolling: true }}
        enableSnippets ={true}
        defaultValue={defaultText}
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: true
        }}
      />
    {Object.values(ui).length > 0 && <Box>
      <h3> Sliders </h3>
      {
        Object.values(ui).map((x,i)=>(
          <Box key={x.name + x.defaultValue}>
            <span><b>{x.name}</b> - {x.value}</span>
            <Slider {...x} value={undefined} marks onChange={(_, value: number | number[])=>{
              setUI({
                ...ui,
                [x.name]: {
                  ...ui[x.name],
                  value: value as number
                }
              });
            }} />
          </Box>
        ))
      }
    </Box>
    }


    {!!error && (
      <Box>
        <h3> errors </h3>
        {error?.toString()}
        
      </Box>
    )}


    <h3> Inputs </h3>
    {Object
      .values(workingImages)
      .filter(x=> x.type =='input')
      .map( x=> 
        <Box  key={x.url}>
          <img src={x.url} />
          <div>{x.name}</div>
          <div>{x.pipelineId}</div>
        </Box>  
      )}

    <h3> Outputs </h3>
    {Object
      .values(workingImages)
      .filter(x=> x.type =='output')
      .map( x=>
        <Box  key={x.url}>
          <img src={x.url} />
          <div>{x.name}</div>
          <div>{x.pipelineId}</div>
        </Box>
      )
    }

  </Box>
  );
}