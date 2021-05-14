import { BackendContext } from "../../core/backendContext";
import { DataType } from "../../core/constants";
import { Tensor } from "../../core/tensor";
import { WebDNNCPUContext } from "../cpu/cpuContext";
import { WasmTensor } from "./wasmTensor";

export interface WasmKernelArgumentTensor {
  type: "tensor";
  value: WasmTensor;
}

export interface WasmKernelArgumentFloat32 {
  type: "float32";
  value: number;
}

export interface WasmKernelArgumentInt32 {
  type: "int32";
  value: number;
}

export type WasmKernelArgument =
  | WasmKernelArgumentTensor
  | WasmKernelArgumentFloat32
  | WasmKernelArgumentInt32;

export interface WebDNNWasmContext extends BackendContext {
  backend: "wasm";
  cpuContext: WebDNNCPUContext;
  initialize(wasmWorkerSrcUrl: string): Promise<void>;
  isWasmTensor(tensor: Tensor): tensor is WasmTensor;
  assertsWasmTensor(tensor: Tensor): asserts tensor is WasmTensor;
  assertsWasmTensorArray(tensors: Tensor[]): asserts tensors is WasmTensor[];
  emptyTensor(dims: ReadonlyArray<number>, dataType?: DataType): WasmTensor;
  moveTensor(tensor: Tensor): Promise<WasmTensor>;
  runKernel(name: string, args: WasmKernelArgument[]): void;
}