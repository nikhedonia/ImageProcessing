import { GPU, IKernelRunShortcut } from "gpu.js";
import objectHash from "object-hash";
import {Shaders, Api} from "@/processors"
import { configPipeline, runPipeline } from "./processors/shaders/utils";

export type FileInput = {
  operation: 'fs',
  args: Record<string, string>
}

export type Step = {
  operation: keyof(typeof Api)
  args: Record<string, string | number | number[] | FileInput>
}

export type Transform = {
  operation: 'transform',
  pipelineId: string,
  pipeline: (FileInput | Step)[],
  outputId: string,
}

export type Operation = (FileInput|Transform);

export type UIStateEntry = {name: string, value: number, defaultValue: number, min:number, max:number, step: number}

export type UIState = Record<string, UIStateEntry>


export function evalSpec(text: string, uiState: UIState = {}) {
  try {

    const f = new Function("api", `with (api) {\n${text}\n }`);

    const transformers = Object
      .fromEntries(Object
        .keys(Api)
        .map( (x:string) =>[x, (args: Record<string, number>)=>({operation: x, args})]));
    
    const ops = [] as Operation[];
    const uiOps = {} as UIState;

    const ui = {
      slider: (name='', min=0, max=1, step: number|undefined) => {
        const prev = uiState[name]?.value;
        const op = {
          //type: 'slider',
          defaultValue: (max-min)/2.0,
          value: prev === undefined ? (max-min)/2.0 : prev,
          step: step || (max-min)/25,
          name, 
          min, 
          max
        } as UIStateEntry
        
        uiOps[name] = op;

        return op.value;   
      }
    }

    const blacklist = {
      window: null,
      document: null,
      navigator: null
    }
    
    const api = {
      ...transformers,
      ...ui,
      ...blacklist,
      image: (x: string) => {
        const op = {
          operation: 'fs', args: {path: x}
        } as FileInput;
        ops.push(op)
        return op;
      },
      pipeline: (args: Record<string, string>[]) => {
        return args.flat(Infinity);
      },
      run: (input: Record<string, string>, pipeline: Record<string, string>[]) => {
        const op = {
          operation: 'transform',
          input,
          pipelineId: objectHash(pipeline.map(x=>x.operation)),
          pipeline: [input, ...pipeline] as unknown as Operation[],
          outputId: objectHash({input, pipeline}),
        } as Transform

        ops.push(op);

        return op;
      }
    }
    
    console.log(f(api));
    console.log(ops);

    return {ops, uiOps};
  } catch (error) {
    return {error};
  }
}

type GPUPipelineStep = IKernelRunShortcut

export function instantiatePipeline(gpu: GPU) {
  return (spec: Step | FileInput) => {
    if (spec.operation == 'fs') 
      return [];
    console.log(Shaders, spec);
    return [Shaders[spec.operation](gpu)]
  }
}

type PipelineState = Record<string, {
  gpu: GPU,
  pipelineId: string,
  outputId: string,
  steps: GPUPipelineStep[],
  inputs: Step[],
  dirty: boolean
}>

export function evaluator(ops: Operation[], state: PipelineState = {}) {
  const pipelines = ops.filter(x => x.operation == 'transform') as Transform[]

  pipelines.map(p => {
    if (!state[p.pipelineId]) {
      const canvas = new OffscreenCanvas(0, 0);
      const gpu = new GPU({canvas});
      state[p.pipelineId] = {
        gpu,
        dirty: true,
        pipelineId: p.pipelineId,
        outputId: p.outputId,
        inputs: p
          .pipeline
          .filter(x => x.operation in Shaders) as Step[],
        steps: configPipeline(
          p
            .pipeline
            .flatMap(instantiatePipeline(gpu))
        )
      }
    } else {
      state[p.pipelineId] = {
        ...state[p.pipelineId],
        dirty: p.outputId != state[p.pipelineId].outputId,
        outputId: p.outputId,
        inputs: p
          .pipeline
          .filter(x => x.operation in Api) as Step[],
      }
    }

    return state[p.pipelineId];
    
  });

  const activePipelines = new Set(pipelines.map(p => p.pipelineId));

  Object.entries(state).forEach(([k, s]) => {
    if(!activePipelines.has(k)) {
      console.log('destroying', k);
      s.gpu.destroy();
      delete state[k];
    }
  })

  return state;
}

export function run(state: PipelineState) {
  return Object
    .entries(state)
    .filter(x => x[1].dirty)
    .map( ([k, p]) => {
      const inputs = p.inputs.map( (x) => Api[x.operation](x.args as any));
      const result = runPipeline(p.steps, document.querySelector("#input")! as HTMLImageElement, inputs);
      return {pipeline:p, result};
    })
}