import { GPU, IConstantsThis, IKernelRunShortcut, KernelFunction, KernelOutput, KernelVariable, ThreadKernelVariable } from "gpu.js";

export const kern = <T extends ThreadKernelVariable[], U extends IConstantsThis> (gpu: GPU, f: KernelFunction<T, U>) => (
  gpu
    .createKernel(f)
    .setDynamicOutput(true)
    .setDynamicArguments(true)
    .setGraphical(true)
    .setPipeline(false)
)
  
export function configPipeline(kernels: IKernelRunShortcut[], {width, height} = {width:0, height:0}) {
  kernels
    .slice(0,-1)
    .forEach(k => k
      .setOutput([width, height])
      .setPipeline(true)
    );

    kernels
      .at(-1)!
      .setOutput([width, height])
      .setPipeline(false);

    return kernels;
}

export function createPipeline(gpu: GPU, kernels: ((g:GPU) => IKernelRunShortcut)[]) {
  const compiled = kernels.map(k => k(gpu));


  configPipeline(compiled, {width:0, height:0});

  let w = 0;
  let h = 0;
  
  

  return (image: HTMLImageElement, args: KernelVariable[][]) => {
    
    if (w != image.width || h != image.height) {
      w = image.width;
      h = image.height;
      configPipeline(compiled, image);
    }
    
    compiled.reduce((input, k, i) => k(input, ...args[i]),  image as HTMLImageElement | KernelOutput)
  }
}

export function runPipeline(kernels: IKernelRunShortcut[], input: HTMLImageElement[], args: KernelVariable[][]) {
  configPipeline(kernels, input[0]);
  return kernels.reduce((input, k, i) => k(input, ...args[i]),  input[0] as HTMLImageElement | KernelOutput)
}