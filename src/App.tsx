import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import { Line } from "react-chartjs-2";
import axios from "axios";
import "chartjs-adapter-moment";
// import Spinner from "./component/Spinner";
import Button from "./component/Button";
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file
import { DateRangePicker } from "react-date-range";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "LED duration statistic",
    },
  },
  scales: {
    x: {
      type: "time",
      time: {
        unit: "day",
      },
      title: {
        display: true,
        text: "time",
      },
    },
    y: {
      title: {
        display: true,
        text: "duration (minute)",
      },
    },
  },
};

const convertDataFormat = (val: any, attr: string) => {
  if (val.timestamp) {
    return { x: new Date(val.timestamp), y: val[attr] / 60 / 1000 };
  } else {
    const date = Date.parse(val._id);

    if (isNaN(date) === false) {
      return { x: new Date(val._id), y: val[attr] / 60 / 1000 };
    } else {
      const newDate = new Date();
      newDate.setFullYear(val._id.year);
      newDate.setMonth(val._id.month);
      newDate.setDate(val._id.day);
      newDate.setHours(val._id.hour);
      if (val._id.minute) {
        newDate.setMinutes(val._id.minute);
      }
      if (val._id.seconds) {
        newDate.setSeconds(val._id.second);
      }
      // console.log(newDate, val._id);

      return { x: newDate, y: val[attr] / 60 / 1000 };
    }
  }
};

const getData = (data: Array<any>) => {
  return {
    datasets: [
      {
        label: "LED on Duration",
        data: data
          .map((val: any) => {
            return convertDataFormat(val, "onDuration");
          })
          .sort((a: any, b: any) => b.x - a.x),
        borderColor: "#655097",
        backgroundColor: "#7a5cbd",
      },
      {
        label: "LED off Duration",
        data: data
          .map((val: any) => {
            return convertDataFormat(val, "offDuration");
          })
          .sort((a: any, b: any) => b.x - a.x),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
    // labels: data.map((val: any) => val.timestamp),
  };
};

export default function App() {
  const [data, setdata] = useState([]);
  const [status, setstatus] = useState(0);
  const [timer, settimer] = useState(0);
  const [filter, setfilter] = useState("day");
  const [modal, setmodal] = useState(false);
  const [duration, setduration] = useState(0);
  const [limit, setlimit] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });
  const [showDatePicker, setshowDatePicker] = useState(false);

  const getDuration = () => {
    axios
      .get(
        `http://localhost:8000/duration?filter=${filter}&start=${limit.startDate}&end=${limit.endDate}`
      )
      .then(res => {
        setdata(res.data);
      });
  };
  /* function to get datas */
  const getDataStatus = () => {
    // setstatus(-1);
    axios.get("http://localhost:8000/dataStatus").then(async res => {
      // console.log(res.data.status);
      setstatus(res.data.status);
      settimer(res.data.timerStatus === "off" ? 0 : 1);
      setduration(parseInt(res.data.duration));
    });
  };

  /* function to update datas */
  const updateStatus = (status: string) => {
    setstatus(-1);
    axios
      .post("http://localhost:8000/status", { control: status })
      .then(getDataStatus);
  };
  const updateTimer = (timer: string) => {
    setstatus(-1);
    axios
      .post("http://localhost:8000/timer", { timer: timer })
      .then(getDataStatus);
  };
  const updateDuration = () => {
    axios
      .post("http://localhost:8000/duration", { duration: duration })
      .then(async () => {
        await getDataStatus();
        setmodal(false);
      });
  };

  useEffect(() => {
    // getDuration();
    getDataStatus();
  }, []);
  useEffect(() => {
    getDuration();
  }, [filter, limit]);

  // console.log(data);

  return (
    <div className=" w-full h-screen min-h-screen p-20 bg-[#E8EEF0] relative">
      <div className="py-5 px-10 w-full h-full bg-white rounded-3xl shadow-sm flex flex-col items-center">
        <div className="flex w-full items-center justify-end gap-x-6">
          <button
            type="button"
            className={
              "text-white rounded-lg px-5 py-2.5 min-h-[50px] min-w-[120px] flex justify-center items-center bg-[#654F97] hover:bg-[#53417e] font-bold text-lg"
            }
            onClick={() => {
              setmodal(true);
            }}
          >
            Set Duration
          </button>
          <button
            type="button"
            className={
              "text-white rounded-lg px-5 py-2.5 min-h-[50px] min-w-[120px] flex justify-center items-center bg-[#654F97] hover:bg-[#53417e] font-bold text-lg"
            }
            onClick={() => {
              setshowDatePicker(true);
            }}
          >
            Date Filter
          </button>
          <select
            id="filter"
            className="bg-[#654F97] border border-gray-300 text-white text-lg rounded-lg block p-2.5 w-28 h-[52px] font-bold outline-none"
            onChange={e => {
              setfilter(e.target.value);
            }}
          >
            <option value="day">per day</option>
            <option value="hour">per hour</option>
            <option value="minute">per minute</option>
            <option value="second">per second</option>
          </select>

          <Button
            action={() => {
              updateTimer(timer === 0 ? "on" : timer === 1 ? "off" : "on");
            }}
            on={timer}
            placeholder={"Timer"}
          />
          <Button
            action={() => {
              updateStatus(status === 0 ? "on" : status === 1 ? "off" : "on");
            }}
            on={status}
            placeholder={"Status"}
          />
        </div>

        <div className="w-4/5 h-4/5">
          <Line options={options as any} data={getData(data)} />
        </div>
        <p>Muhammad Bintang Pananjung - 13519004</p>
      </div>
      <div
        className={
          "w-full h-full bg-[#654f9755] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex justify-center items-center  " +
          (showDatePicker ? "absolute" : "hidden")
        }
        onClick={e => {
          setshowDatePicker(false);
        }}
      >
        <div
          onClick={e => {
            e.stopPropagation();
          }}
        >
          <DateRangePicker
            ranges={[limit]}
            onChange={e => {
              setlimit(e.selection as any);
            }}
          />
        </div>
      </div>

      <div
        className={
          " w-full h-full bg-[#654f9755] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex justify-center items-center " +
          (modal ? "absolute" : "hidden")
        }
        onClick={e => {
          setmodal(false);
        }}
      >
        <div
          className="flex flex-col w-1/2 bg-white rounded-xl items-center py-5 px-10"
          onClick={e => {
            e.stopPropagation();
          }}
        >
          <p className=" font-bold text-xl mb-5">Set Duration</p>
          <input
            type="number"
            id="duration"
            placeholder="duration (in ms)"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lgblock p-2.5 outline-none w-full rounded-lg"
            value={duration}
            onChange={e => {
              setduration(parseInt(e.target.value));
            }}
          />
          <button
            className="px-8 py-2 mt-5 bg-[#654F97] hover:bg-[#53417e] text-white text-lg font-bold rounded-lg"
            onClick={updateDuration}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
