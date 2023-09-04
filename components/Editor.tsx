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


const defaultText= dedent`
  const img = image("ohhglob.png");

  const transform = pipeline([
    greyscale({rgba:[1,1,1,0]}),
    gradient({radius: 1})
  ]);


  return run(img, transform);
`



type EditorProps = {
  onChange?: (text: string) => void
}

let g = {};

export function Editor(props: EditorProps) {
  const editorRef = useRef<AceEditor>(null);
  const [ui, setUI] = useState<UIState>({});
  const [text, setText] = useState("");
  const compiledSpec = useMemo(()=>evalSpec(text, ui), [text, objectHash(ui)]);
  const [error, setError] = useState<null|string>(null);

  const debouncedSetUI = useMemo(() => debounce(setUI, 500), []);
  const runSpec = useMemo(()=>debounce((spec: typeof compiledSpec) => {
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
        run(pipelines).map( async ({pipeline: p}) => {
          console.log('re-running', p);

          const src = await URL.createObjectURL(await p.gpu.canvas.convertToBlob());
          window.requestAnimationFrame(() => {
            Object.assign(document.querySelector('#result')!, {src});
            const dt = +new Date()-start;
            console.log({dt})
          })
        })
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
  </Box>
  );
}