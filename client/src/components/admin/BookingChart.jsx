import ReactApexChart from "react-apexcharts";

const BookingChart = ({ data }) => {
  const chartData = data.map((item) => ({
    month: `${item._id.year}-${item._id.month}`,
    bookings: item.bookingCount,
  }));

  const options = {
    chart: {
      type: "line",
      height: 300,
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 3,
      colors: ["hsl(var(--s))"],
    },
    xaxis: {
      categories: chartData.map((d) => d.month),
    },
    yaxis: {
      title: {
        text: "Bookings",
      },
      min: 0,
    },
    tooltip: {
      y: {
        formatter: (value) => `${value} bookings`,
      },
    },
    markers: {
      size: 5,
      colors: ["hsl(var(--s))"],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 7,
      },
    },
    theme: {
      mode: "light",
    },
  };

  const series = [
    {
      name: "Bookings",
      data: chartData.map((d) => d.bookings),
    },
  ];

  return (
    <div className="card bg-base-100 shadow-lg border border-base-300">
      <div className="card-body">
        <h3 className="font-semibold mb-4">Monthly Bookings</h3>
        <div className="rounded-lg overflow-hidden bg-base-200 p-2">
          <ReactApexChart
            options={options}
            series={series}
            type="line"
            height={300}
          />
        </div>
      </div>
    </div>
  );
};

export default BookingChart;
