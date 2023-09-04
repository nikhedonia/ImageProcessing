function gaussian(x, sigma) {
    return 1.0 / (Math.sqrt(2 * Math.PI) * sigma) * Math.exp(-(x**2) / (2 * sigma**2))
}

function gaussFilter1D(sigma, dim=3) {
    var sqrtSigmaPi2 = Math.sqrt(Math.PI*2.0)*sigma;
    var s2 = 2.0 * sigma * sigma;
    var sum = 0.0;
    
    var kernel = new Float32Array(dim - +!(dim & 1)); // Make it odd number
    const half = Math.floor(kernel.length / 2);
    console.log(half);
    for (var j = 0, i = -half; j < kernel.length; i++, j++) 
    {
      kernel[j] = Math.exp(-(i*i)/(s2)) / sqrtSigmaPi2;
      sum += kernel[j];
    }
    console.log(kernel, sum);
    // Normalize the gaussian kernel to prevent image darkening/brightening
    for (var i = 0; i < dim; i++) {
      kernel[i] /= sum;
    }
    return [kernel, sum];
  }

module.exports= {
  gaussFilter1D
}