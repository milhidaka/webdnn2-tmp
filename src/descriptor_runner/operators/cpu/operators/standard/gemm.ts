import { broadcastUni } from "../../../operatorUtil";
import { Gemm } from "../../../base/gemm";
import { WebDNNCPUContext } from "../../../../interface/backend/cpu/cpuContext";
import { Tensor } from "../../../../interface/core/tensor";
import { OperatorEntry } from "../../../../interface/core/operator";

// Version 13
class CpuGemm extends Gemm {
  alpha!: number;

  beta!: number;

  transA!: number;

  transB!: number;

  constructor() {
    super("cpu");
  }

  async run(context: WebDNNCPUContext, inputs: Tensor[]): Promise<Tensor[]> {
    context.assertsCPUTensorArray(inputs);
    const inputA = inputs[0],
      inputB = inputs[1],
      inputC = inputs[2],
      {
        m,
        n,
        k,
        strideA: [strideA0, strideA1],
        strideB: [strideB0, strideB1],
      } = this.calcShape(inputA.dims, inputB.dims),
      newData = new Float32Array(m * n),
      dA = inputA.data,
      dB = inputB.data,
      { alpha } = this;
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        let sum = 0;
        for (let x = 0; x < k; x++) {
          sum +=
            dA[i * strideA0 + x * strideA1] * dB[x * strideB0 + j * strideB1];
        }
        sum *= alpha;
        newData[i * n + j] = sum;
      }
    }

    if (inputC) {
      const [strideC0, strideC1] = broadcastUni([m, n], inputC.dims),
        dC = inputC.data,
        { beta } = this;
      for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
          newData[i * n + j] += dC[i * strideC0 + j * strideC1] * beta;
        }
      }
    }
    const output = context.emptyTensor([m, n], "float32", newData);
    return [output];
  }
}

export function getOpEntries(): OperatorEntry[] {
  return [
    {
      opType: "Gemm",
      backend: "cpu",
      opsetMin: 1,
      factory: () => new CpuGemm(),
    },
  ];
}
