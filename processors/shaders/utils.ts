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
      .setDynamicOutput(true)
      .setOutput([width, height])
      .setPipeline(true)
    );

  kernels
    .at(-1)!
    .setDynamicOutput(true)
    .setOutput([width, height])
    .setPipeline(false);

  return kernels;
}

export function runPipeline(kernels: IKernelRunShortcut[], input: HTMLImageElement[], args: KernelVariable[][]) {
  configPipeline(kernels, input[0]);
  return kernels.reduce((input, k, i) => k(input, ...args[i]),  input[0] as HTMLImageElement | KernelOutput)
}