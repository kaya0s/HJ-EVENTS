import ReactApexChart from "react-apexcharts";
import { useMemo } from "react";

const BookingChart = ({ data }) => {
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
      bookings: item.bookingCount,
    }));
  }, [data]);

  const options = {
    chart: {
      type: "bar",
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
    colors: ["#3b82f6"],
    plotOptions: {
      bar: {
        borderRadius: 8,
        borderRadiusApplication: "end",
        columnWidth: "60%",
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val}`,
      offsetY: -20,
      style: {
        fontSize: "12px",
        colors: ["#374151"],
      },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
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
            color: "#3b82f6",
            opacity: 0.7,
          },
          {
            offset: 100,
            color: "#3b82f6",
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
        text: "Bookings",
        style: {
          fontSize: "14px",
          fontWeight: 600,
        },
      },
      labels: {
        formatter: (value) => `${value}`,
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
        formatter: (value) => `${value} bookings`,
        title: {
          formatter: () => "Bookings:",
        },
      },
      marker: {
        show: true,
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
      name: "Monthly Bookings",
      data: chartData.map((d) => d.bookings),
    },
  ];

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="card bg-base-100 shadow-xl border border-base-300">
        <div className="card-body p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Monthly Bookings
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-lg font-medium">No booking data available</p>
            <p className="text-sm mt-2">
              Select a different date range to view bookings
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
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          Monthly Bookings
        </h3>
        <div className="rounded-xl overflow-hidden">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={350}
          />
        </div>
      </div>
    </div>
  );
};

export default BookingChart;
