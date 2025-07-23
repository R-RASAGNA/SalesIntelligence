export interface ChartData {
  labels: string[];
  datasets: Array<{
    label?: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
  }>;
}

export interface ScatterChartData {
  datasets: Array<{
    label?: string;
    data: Array<{ x: number; y: number }>;
    backgroundColor?: string;
    borderColor?: string;
  }>;
}
