import ReactApexChart from "react-apexcharts";
import { useMemo } from "react";

const SalesChart = ({ data }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map((item) => ({
      month: `${new Date(item._id.year, item._id.month - 1).toLocaleDateString(
        "en-US",
        {
          month: "short",
          year: "numeric",
        },
      )}`,
      sales: item.totalSales,
    }));
  }, [data]);

  const options = {
    chart: {
      type: "area",
      height: 350,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
        },
      },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
      },
      fontFamily: "inherit",
    },
    colors: ["#10b981"],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100],
        colorStops: [
          {
            offset: 0,
            color: "#10b981",
            opacity: 0.7,
          },
          {
            offset: 100,
            color: "#10b981",
            opacity: 0.1,
          },
        ],
      },
    },
    xaxis: {
      categories: chartData.map((d) => d.month),
      labels: {
        style: {
          fontSize: "12px",
        },
        rotate: -45,
        rotateAlways: false,
      },
      axisBorder: {
        show: true,
      },
      axisTicks: {
        show: true,
      },
    },
    yaxis: {
      title: {
        text: "Sales (₱)",
        style: {
          fontSize: "14px",
          fontWeight: 600,
        },
      },
      labels: {
        formatter: (value) => `₱${(value / 1000).toFixed(0)}k`,
      },
    },
    grid: {
      borderColor: "#f1f1f1",
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    tooltip: {
      theme: "light",
      x: {
        show: true,
      },
      y: {
        formatter: (value) => `₱${Number(value).toLocaleString()}`,
        title: {
          formatter: () => "Sales:",
        },
      },
      marker: {
        show: true,
      },
    },
    markers: {
      size: 0,
      hover: {
        size: 6,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
    },
  };

  const series = [
    {
      name: "Monthly Sales",
      data: chartData.map((d) => d.sales),
    },
  ];

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="card bg-base-100 shadow-xl border border-base-300">
        <div className="card-body p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Monthly Sales
          </h3>
          <div className="flex flex-col items-center justify-center py-16 text-base-content/40">
            <svg
              className="w-16 h-16 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="text-lg font-medium">No sales data available</p>
            <p className="text-sm mt-2">
              Select a different date range to view sales
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl border border-base-300 hover:shadow-2xl transition-shadow duration-300">
      <div className="card-body p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Monthly Sales
        </h3>
        <div className="rounded-xl overflow-hidden">
          <ReactApexChart
            options={options}
            series={series}
            type="area"
            height={350}
          />
        </div>
      </div>
    </div>
  );
};

export default SalesChart;
