/* eslint-disable no-irregular-whitespace */
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import intl from "@/utils/locales/jp/jp.json";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const LineChart = (graphData) => {
  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        intersect: false,
        backgroundColor: "#19388B",
        displayColors: false,
        padding: 20,
        caretSize: 10,
        caretPadding: 12,
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          callback: (value, index) => {
            return labels[value]; // Hide labels for other days
          },
        },
      },
      y: {
        display: true,
        grid: {
          display: false,
        },

        min: 0, // Set the minimum value for the y-axis
        max: graphData?.graphData.max == 10 ? 10 : graphData.max, // Set the minimum value for the y-axis
        ticks: {
          stepSize: graphData.step,
          callback: function (value, index, values) {
            return Number(value).toFixed(0); // Convert the value to a whole number
          },
        },
      },
    },
    elements: {
      line: {
        borderWidth: 2,
      },
      point: {
        radius: 4,
        hoverRadius: 6,
      },
    },
  };

  const generateXAxisLabels = () => {
    const currentDate = new Date();
    const labels = [];

    // Loop through all 31 days
    for (let i = 0; i < 28; i++) {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - i);
      labels.push(
        newDate.toLocaleDateString("ja-JP", { month: "short", day: "numeric" })
      );
    }

    // Reverse the labels array to match the chronological order
    return labels.reverse();
  };

  const labels = generateXAxisLabels();

  // Static JSON data (replace this with data from the API later)
  const staticData = {
    data: graphData?.graphData.graph,
  };

  const data = {
    labels,
    datasets: [
      {
        data: staticData.data,
        borderColor: "#19388B",
        backgroundColor: "#fff",
        // backgroundColor: (context) => {
        //   const gradient = context.chart.ctx.createLinearGradient(
        //     0,
        //     0,
        //     0,
        //     context.chart.height
        //   );
        //   gradient.addColorStop(0, "#39A1EA");
        //   gradient.addColorStop(1, "rgba(255, 255, 255, 0.00)");
        //   return gradient;
        // },
        // fill: "origin",
      },
    ],
  };
  return (
    <>
      <div
        className="py-2 block pl-4 pr-3 bg-white border border-gray-200 rounded-xl shadow relative flex flex-col"
        style={{ maxHeight: "490px", minHeight: "490px" }}
      >
        <span className="text-base md:text-xl mb-[30px] dark:text-black">
          <span className="fond-bold" style={{ fontWeight: 600 }}>
            {" "}
            {intl.card_graphcard_calls_per_day}{" "}
          </span>
          <span className="text-[#595959] font-semibold text-[16px]">
            {intl.card_graphcard_past_28days}
          </span>
        </span>

        {/* <div className=" max-w-max bg-customBlue rounded-xl p-2 mb-2">
          <div className="bg-[#4297EB] text-white rounded-xl px-4 py-3">
            <span className="text-lg">
              <span>{"月における合計通話数"}</span>　:　{graphData?.graphData.total || "0"}
            </span>
          </div>
          <div className="text-white px-4 mt-auto">
            <div className="text-base">
              {intl.card_graphcard_avg_calls_per_month}　:　{graphData?.graphData.avg || "0"}
            </div>
          </div>
        </div> */}

        <Line
          options={options}
          data={data}
          className="flex flex-col h-full w-full flex-1 pt-[10px]"
          style={{
            width: "100%",
            height: "370px",
            maxHeight: "370px",
            minHeight: "370px",
          }}
        />
      </div>
    </>
  );
};

export default LineChart;
