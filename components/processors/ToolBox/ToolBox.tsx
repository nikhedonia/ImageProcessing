import { GreyScale } from "./GreyScale";
import { BlurFilter } from "./BlurFilter";
import { ProcessorProps } from "./ProcessorProps";
import { ErodeDilate } from "./ErodeDilate";
import { EdgeDetection } from "./EdgeDetection";
import { Grid } from "./Grid";

export function ToolBox (props: ProcessorProps) {
  return (
    <div>
      <GreyScale {...props} />
      <BlurFilter {...props} />
      <ErodeDilate {...props} />
      <EdgeDetection {...props} />
    </div>
  );
}