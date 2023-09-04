import { GPU, IKernelRunShortcut } from "gpu.js";
import objectHash from "object-hash";
import {Shaders, Api} from "@/processors"
import { configPipeline, runPipeline } from "./processors/shaders/utils";
import { ImageEntry } from "./types";

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
          pipelineId: objectHash(pipeline.map(x => x.operation)),
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

type ImageInfo = {
  width: number,
  height: number,
  src: string
}

type PipelineStateEntry = {
  gpu: GPU,
  pipelineId: string,
  outputId: string,
  steps: GPUPipelineStep[],
  inputs: Step[],
  dirty: boolean,
  deps: FileInput[],
  assets: Record<string, {
    type: 'output',
    inputImages: ImageInfo[]
  } & ImageInfo>
}


type PipelineState = Record<string, PipelineStateEntry>

export function evaluator(ops: Operation[], state: PipelineState = {}) {
  const pipelines = ops.filter(x => x.operation == 'transform') as Transform[]

  const jobs = pipelines.map(p => {

    const data = {   
      assets:  state[p.pipelineId]?.assets || {},
      pipelineId: p.pipelineId,
      outputId: p.outputId,
      dirty: p.outputId != state[p.pipelineId]?.outputId, 
      deps: p
        .pipeline
        .filter(x => (x.operation === 'fs')) as FileInput[],
      inputs: p
        .pipeline
        .filter(x => x.operation in Shaders) as Step[],
    }

    if (!state[p.pipelineId]) {
      const canvas = new OffscreenCanvas(0, 0);
      const gpu = new GPU({canvas});
      state[p.pipelineId] = {
        gpu,
        ...data,
        steps: configPipeline(
          p
            .pipeline
            .flatMap(instantiatePipeline(gpu))
        )
      }
    } else {
      state[p.pipelineId] = {
        ...state[p.pipelineId],
        ...data
      }
    }

    return {
      ...state[p.pipelineId],
      ...data
    };
  });

  const activePipelines = new Set(jobs.map(p => p.pipelineId));

  Object.entries(state).forEach(([k, s]) => {
    if (!activePipelines.has(k)) {
      console.log('destroying', k);

      try {
        Object
          .values(s.assets)
          .filter(x => x.type === 'output' )
          .map(x => {
            console.log('destroying', k);
            URL.revokeObjectURL(x.src)
          });
        } catch (_) {}

      s.gpu.destroy();

      delete state[k];
    }
  });

  return {jobs, state};
}


export async function canvasToUrl(canvas: OffscreenCanvas, {width = 0, height = 0}) {
  if (canvas.width === width && canvas.height === height) {
    return canvas
      .convertToBlob()
      .then(URL.createObjectURL)
  } else {
    // WORKAROUND: gpu.js prevents canvases to resize
    // this results in a bigger image with garbage artefacts
    // we are cropping the image by copying it into a smaller canvas
    // the latest image is on the bottom left of in the old canvas
    const tmpCanvas = new OffscreenCanvas(width, height);
    const ctx = tmpCanvas.getContext('2d');

    ctx?.drawImage(canvas,
      0,
      canvas.height - height, 
      width, height,
      0,0, 
      width, height 
    );

    return tmpCanvas
      .convertToBlob()
      .then(URL.createObjectURL)
  }
}

export async function* run(jobs: PipelineStateEntry[], inputImages: Record<string, HTMLImageElement>) {

  for (const p of jobs) {
    const args = p.inputs.map( (x) => Api[x.operation](x.args as any));
    if ( p.assets[p.outputId] ) {
      yield {pipeline: p, result: p.assets[p.outputId]};
      continue;
    }

    const images = p.deps.map(x => inputImages[x.args.path]);


    await new Promise(done => window.requestAnimationFrame(done));
    runPipeline(p.steps, images, args);

    const src = await canvasToUrl(p.gpu.canvas, images[0]);


    p.assets[p.outputId] = {
      type: 'output',
      inputImages: images,
      width: images[0].width,
      height: images[0].height,
      src
    }

    yield {pipeline: p, result: p.assets[p.outputId]};
  }

}

export type JobSpecs = {
  ops: Operation[];
  uiOps: UIState;
} | null

export type EvaluatorResult = {
  type: string, 
  pipelineId: string, 
  name: string, 
  url: string
}

export class Evaluator {
  public state = {}
  public currentJobSpecs: JobSpecs = null;
  public error: unknown = null;

  public digest<T extends UIState>(text: string, api?: T) {
    const specs = evalSpec(text, api);
    this.error = specs.error;
    if (specs.ops && specs.uiOps) {
      this.currentJobSpecs = specs;
    } 
    return specs;
  }

  private getInputImages(htmlImageMap: Record<string, HTMLImageElement>, jobs: PipelineStateEntry[]) {
    return Object.fromEntries(
      jobs
        .flatMap(p => 
          p.deps.map(x => ({
            type: 'input',
            pipelineId: p.pipelineId,
            outputId: p.outputId,
            name: x.args.path,
            width: htmlImageMap[x.args.path].width,
            height: htmlImageMap[x.args.path].height,
            url: htmlImageMap[x.args.path].src
          }))
        ).map(x=> [x.name, x])
    );
  }

  public async run(
    htmlImageMap: Record<string, HTMLImageElement> = {},
    onResult = (stage: string, i: number, steps: number ,images: Record<string, EvaluatorResult>)=>{}
  ) { 
    if (!this.currentJobSpecs)
      return;
    
    const {jobs, state} = evaluator(
      this.currentJobSpecs?.ops, 
      this.state
    );

    this.state = state;

    const inputImages = this.getInputImages(htmlImageMap, jobs);
    const outputImages : Record<string, EvaluatorResult> = {};

    let i = 0;
    onResult('input', i, jobs.length, inputImages);

    for await (const {pipeline: p, result} of  run(jobs, htmlImageMap)) {
      outputImages[p.outputId] = {
        pipelineId: p.pipelineId,
        name: p.outputId,
        ...result,
        url: result.src
      }
      onResult('progress', i++ , jobs.length, {...inputImages, ...outputImages});
    }

    onResult('complete', i, jobs.length, {
      ...inputImages, 
      ...outputImages
    });

  }

}