import dedent from "dedent";

export const uiCompletions = [{
    caption: 'erode', 
    value: 'erode({radius: 1})',
    score: 1000,
    meta: `erode({radius: 1})`,
    docHTML: dedent`
      <h1> Erode </h1>
      <p> finds the smallest pixelvalue for a given neighborhood of pixels within a given radius.
        opposite of dilate </p>
    `
}, {
    caption: 'dilate', 
    value: 'dilate({radius: 1})',
    score: 1000,
    meta: `dilate({radius: 1})`,
    docHTML: dedent`
      <h1> Dilate </h1>
      <p> finds the smallest pixelvalue for a given neighborhood of pixels within a given radius </p>
    `    
}, {
    caption: 'average', 
    value: 'avg({radius: 1})',
    score: 1000,
    meta: `avg({radius: 1})`,
    docHTML: dedent`
      <h1> Average </h1>
      <p> Finds the average pixelvalue for a given neighborhood of pixels within a given radius
        Useful for blurring an image </p>
    `    
}, {
    caption: 'gradient', 
    value: 'gradient({radius: 1, f: 0.5})',
    score: 1000,
    meta: `gradient({radius: 1, f: 0.5})`,
    docHTML: dedent`
      <h1> Morphological Gradient </h1>
      <p> This is an edge detector implemented by subtracting the dilated image from the eroded image.
        The parameter f allows you to interpolate between the interior edge (f=0) and the exterior edge (f=1) </p>
    `       
}, {
    caption: 'GreyScale', 
    value: dedent`greyscale({
        rgba: [1, 1, 1, 0], 
        minmax: [0.5, 0.5, 0]})
    `,
    score: 1000,
    meta: dedent`greyscale({
        rgba: [r, g, b, a], 
        minmax: [minFactor, maxFactor, rgbaOrMinMax]})
    `,
    docHTML: dedent`
      <h1> GreyScale </h1>
      <p> This function allows you to turn your image to greyscale.
        You can do this via linear combination of rgba values and luminosity
        Luminosity = 0.5 * max(r,g,b) + 0.5 * min(r,g,b)
        Use rgbaOrMinMax to interpolate between using luminosity or rgba values </p>
      <h2> Common Examples </h2>
      <p> Gray = (Red + Green + Blue) / 3 = greyscale({rgba: [1,1,1]})
          Gray = (Red * 0.2126 + Green * 0.7152 + Blue * 0.0722) [because our eyes are more sensitive to green]
          Gray = (Red * 0.299 + Green * 0.587 + Blue * 0.114) [because our eyes are more sensitive to green]
          Gray = (Max(Red, Green, Blue) + Min(Red, Green, Blue)) / 2 </p>
    `       
}, {
    caption: 'Sobel', 
    value: dedent`sobel({x: 1, y: 1})`,
    score: 1000,
    meta: dedent`sobel({x: 1, y: 1})`,
    docHTML: dedent`
      <h1> Sobel Filter </h1>
      <p> detect edges by applying a vertical and or horizontal sobel filter. 
      To detect horizontal edges only, set (x=1 and y=0), x=1
    `       
}, {
    caption: 'pipeline', 
    value: dedent`pipeline([
        avg({radius:1}),
        greyscale({rgba: [1,1,1]}),
        gradient({radius: 1, f: 0})
    ])`,
    score: 1000,
    meta: 'compose a set of transformations',
    docHTML: `
      <h1> pipeline([...]) </h1>
      <p> compose a set of transformations. Execute them with run(img, myPipeline) </p>
    `  
}, {
    caption: 'run', 
    value: dedent`run(myImg, myPipeline)`,
    score: 1000,
    meta: 'run(myImg, myPipeline) - apply a pipeline to an image'
}]