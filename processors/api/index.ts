export const erode = ({radius = 1}: Record<string, number>) => [radius];
export const dilate = ({radius = 1}: Record<string, number>) => [radius];
export const gradient = ({radius = 1, f = 0}: Record<string, number>) => [radius, f];
export const greyscale = ({rgba = [1, 1, 1, 0], minmax = [0, 0]}: Record<string, number[]>) => [[...rgba, ...minmax]];
export const avg = ({radius = 1}: Record<string, number>) => [radius];
export const sobel = ({x = 1, y = 1}: Record<string, number>) => [[x, y]];