export type Range = [number, number];

export type CollectedExports = Map<string | null, Array<string>>;

export enum ExportClosureMapping {
  NAMED_FUNCTION = 0,
  NAMED_CLASS = 1,
  NAMED_DEFAULT_FUNCTION = 2,
  DEFAULT_FUNCTION = 3,
  NAMED_DEFAULT_CLASS = 4,
  DEFAULT_CLASS = 5,
  NAMED_CONSTANT = 6,
  DEFAULT = 7,
  DEFAULT_VALUE = 8,
  DEFAULT_OBJECT = 9,
}

export interface ExportDetails {
  local: string;
  exported: string;
  type: ExportClosureMapping;
  range: Range;
  source: string | null;
}
