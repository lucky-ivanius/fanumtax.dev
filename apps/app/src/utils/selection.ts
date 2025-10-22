export interface Selection<TValue extends string = string, TLabel extends string = string> {
  value: TValue;
  label: TLabel;
}

export const createSelection = <TValue extends string, TLabel extends string>(value: TValue, label: TLabel) =>
  ({
    value,
    label,
  }) as const satisfies Selection;
