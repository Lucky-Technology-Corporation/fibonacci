import { Card, Title, LineChart } from "@tremor/react";

const chartdataax = [
  {
    year: 1970,
    "Export Growth Rate": 2.04,
    "Import Growth Rate": 1.53,
  },
  {
    year: 1971,
    "Export Growth Rate": 1.96,
    "Import Growth Rate": 1.58,
  },
  {
    year: 1972,
    "Export Growth Rate": 1.96,
    "Import Growth Rate": 1.61,
  },
  {
    year: 1973,
    "Export Growth Rate": 1.93,
    "Import Growth Rate": 1.61,
  },
  {
    year: 1974,
    "Export Growth Rate": 1.88,
    "Import Growth Rate": 1.67,
  },
  //...
];

const dataFormatter = (number: number) => `${Intl.NumberFormat("us").format(number).toString()}`;

const MyLineChart = () => (
  <Card className = "h-72">
    <Title>Export/Import Growth Rates (1970 to 2021)</Title>
    <LineChart
      className="h-72"
      data={chartdataax}
      index="year"
      categories={["Export Growth Rate", "Import Growth Rate"]}
      colors={["emerald", "gray"]}
      valueFormatter={dataFormatter}
      yAxisWidth={40}
      theme="dark"
    />
  </Card>
);

export default MyLineChart;