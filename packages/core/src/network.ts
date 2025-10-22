export const EVM = "evm" as const;
export type Evm = typeof EVM;
export const SVM = "svm" as const;
export type Svm = typeof SVM;

export type Network = Evm | Svm;
