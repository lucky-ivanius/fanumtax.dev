export type SearchParamsValue = string | string[] | undefined;

export const forceArray = (value: SearchParamsValue): string[] => {
  if (value === undefined) return [];

  if (typeof value === "string") return [value];

  return value;
};

export interface SearchParams {
  [key: string]: SearchParamsValue;
}

export type SearchParamsWithArrayValues<TFrom extends SearchParams = SearchParams> = {
  [key in keyof TFrom]: (string | undefined)[];
};

export const forceArrays = <TParams extends SearchParams>(params: TParams): SearchParamsWithArrayValues<TParams> => {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      return [key, forceArray(value)];
    })
  ) as SearchParamsWithArrayValues<TParams>;
};
