import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-typescript";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";

import dedent from "dedent";
import { useEffect, useMemo, useRef, useState } from "react";
import { Evaluator, EvaluatorResult, UIState, evalSpec, evaluator, run } from "@/evaluator";
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
  const imageMap = useMemo(()=>Object.fromEntries(images.map(x=> [x.name, x.element])), [images]);

  const [ui, setUI] = useState<UIState>({});
  const [text, setText] = useState("");
  const [error, setError] = useState<null|string>(null);

  const [workingImages, setWorkingImages] = useState<Record<string, EvaluatorResult>>({});


  const evaluator = useMemo(()=> new Evaluator(), []);
  const debouncedSetUI = useMemo(() => debounce(setUI, 200), []);


  console.log({ui});

  const runSpec = useMemo(() => debounce(async (text, ui) => {
    evaluator.digest(text, ui);
    setError(evaluator.error as string);

    
    if( objectHash(evaluator.currentJobSpecs?.uiOps||{}) !== objectHash(ui) ) {
      console.log('updating ui');
      debouncedSetUI(evaluator.currentJobSpecs?.uiOps!);
    }
    

    if (!evaluator.currentJobSpecs?.ops)
      return

    await evaluator.run(imageMap, (status, _1,_2, processed) => {
      if (status != 'complete' ) {
        setWorkingImages(images => ({...images, ...processed}))
      } else {
        setWorkingImages(processed);
      }
    });

  }, 300), [imageMap, setWorkingImages]);

  useEffect(() => {runSpec(text, ui)}, [text, ui])

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
          runSpec(text, ui);
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
              
              debouncedSetUI(ui => ({
                ...ui,
                [x.name]: {
                  ...ui[x.name],
                  value: value as number
                }
              }));
              
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