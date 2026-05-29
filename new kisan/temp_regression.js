const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, 'src/data/crop_recommendation.csv');
const data = fs.readFileSync(csvPath, 'utf8').split('\n').slice(1).filter(line => line.trim()).map(line => {
  const parts = line.split(',');
  return {
    N: parseFloat(parts[0]),
    P: parseFloat(parts[1]),
    K: parseFloat(parts[2]),
    ph: parseFloat(parts[5])
  };
});

// Simple linear regression: ph = a*N + b*P + c*K + d
// Using ordinary least squares (simplified)
let sumN = 0, sumP = 0, sumK = 0, sumPh = 0;
let sumN2 = 0, sumP2 = 0, sumK2 = 0, sumNP = 0, sumNK = 0, sumPK = 0, sumNPh = 0, sumPPh = 0, sumKPh = 0;
const n = data.length;

data.forEach(d => {
  sumN += d.N;
  sumP += d.P;
  sumK += d.K;
  sumPh += d.ph;
  sumN2 += d.N * d.N;
  sumP2 += d.P * d.P;
  sumK2 += d.K * d.K;
  sumNP += d.N * d.P;
  sumNK += d.N * d.K;
  sumPK += d.P * d.K;
  sumNPh += d.N * d.ph;
  sumPPh += d.P * d.ph;
  sumKPh += d.K * d.ph;
});

// Solve using matrix inversion (3 variables)
// We'll use a simple library? Instead, we'll use multiple linear regression formula via normal equations
// Construct matrix X'X and X'Y
const XTX = [
  [sumN2, sumNP, sumNK],
  [sumNP, sumP2, sumPK],
  [sumNK, sumPK, sumK2]
];
const XTY = [sumNPh, sumPPh, sumKPh];

// Invert 3x3 matrix manually
function invert3x3(m) {
  const [[a, b, c], [d, e, f], [g, h, i]] = m;
  const det = a*(e*i - f*h) - b*(d*i - f*g) + c*(d*h - e*g);
  if (Math.abs(det) < 1e-10) return null;
  const invDet = 1 / det;
  return [
    [(e*i - f*h) * invDet, (c*h - b*i) * invDet, (b*f - c*e) * invDet],
    [(f*g - d*i) * invDet, (a*i - c*g) * invDet, (c*d - a*f) * invDet],
    [(d*h - e*g) * invDet, (b*g - a*h) * invDet, (a*e - b*d) * invDet]
  ];
}

const inv = invert3x3(XTX);
if (!inv) {
  console.log('Matrix singular, using fallback');
  process.exit(1);
}

// Multiply inv * XTY
const coeffs = [
  inv[0][0]*XTY[0] + inv[0][1]*XTY[1] + inv[0][2]*XTY[2],
  inv[1][0]*XTY[0] + inv[1][1]*XTY[1] + inv[1][2]*XTY[2],
  inv[2][0]*XTY[0] + inv[2][1]*XTY[1] + inv[2][2]*XTY[2]
];

// Intercept d = mean(ph) - a*mean(N) - b*mean(P) - c*mean(K)
const meanN = sumN / n;
const meanP = sumP / n;
const meanK = sumK / n;
const meanPh = sumPh / n;
const intercept = meanPh - coeffs[0]*meanN - coeffs[1]*meanP - coeffs[2]*meanK;

console.log('Regression coefficients:');
console.log(`ph = ${intercept.toFixed(4)} + ${coeffs[0].toFixed(6)}*N + ${coeffs[1].toFixed(6)}*P + ${coeffs[2].toFixed(6)}*K`);

// Test with a few samples
console.log('\nSample predictions:');
for (let i = 0; i < 5; i++) {
  const d = data[i];
  const pred = intercept + coeffs[0]*d.N + coeffs[1]*d.P + coeffs[2]*d.K;
  console.log(`N=${d.N}, P=${d.P}, K=${d.K} => actual pH=${d.ph.toFixed(2)}, predicted=${pred.toFixed(2)}`);
}