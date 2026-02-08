import ReactApexChart from "react-apexcharts";

const SalesChart = ({ data }) => {
  const chartData = data.map((item) => ({
    month: `${item._id.year}-${item._id.month}`,
    sales: item.totalSales,
  }));

  const options = {
    chart: {
      type: "bar",
      height: 300,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: chartData.map((d) => d.month),
    },
    yaxis: {
      title: {
        text: "Sales (₱)",
      },
    },
    fill: {
      opacity: 1,
      colors: ["hsl(var(--p))"],
    },
    tooltip: {
      y: {
        formatter: (value) => `₱${Number(value).toLocaleString()}`,
      },
    },
    theme: {
      mode: "light",
    },
  };

  const series = [
    {
      name: "Sales",
      data: chartData.map((d) => d.sales),
    },
  ];

  return (
    <div className="card bg-base-100 shadow-lg border border-base-300">
      <div className="card-body">
        <h3 className="font-semibold mb-4">Monthly Sales</h3>
        <div className="rounded-lg overflow-hidden bg-base-200 p-2">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={300}
          />
        </div>
      </div>
    </div>
  );
};

export default SalesChart;
