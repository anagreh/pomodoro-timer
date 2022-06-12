import { useEffect, useState } from "react";
import "./App.css";

interface TimeInterval {
  startTime: Date;
  endTime: Date;
}

type StudyState = "STUDY" | "SHORT_BREAK" | "LONG_BREAK";

function App() {
  // config
  const [studyInterval, setStudyInterval] = useState(minToMilliseconds(0.1));
  const [shortBreakInterval, setShortBreakInterval] = useState(minToMilliseconds(5));
  const [longBreakInterval, setLongBreakInterval] = useState(minToMilliseconds(15));
  const [numOfLabBeforeLongBreak, setNumOfLabBeforeLongBreak] = useState(4);
  const [isChangeStateAuto, setIsChangeStateAuto] = useState(false);
  const [isStopTimeAfterEnd, setIsStopTimeAfterEnd] = useState(false);

  const [studyState, setStudyState] = useState<StudyState>("STUDY");

  const [studyTimes, setStudyTimes] = useState<TimeInterval[]>([]);
  const [breakTimes, setBreakTimes] = useState<TimeInterval[]>([]);

  const [currLabPassingTime, setCurrLabPassingTime] = useState(0);
  const [currIntervalTime, setCurrIntervalTime] = useState(studyInterval);

  const [numOfLab, setNumOfLab] = useState(0);

  const [isRunning, setIsRunning] = useState(false);
  const [isTimeToBreak, setIsTimeToBreak] = useState(false);

  const [expectedToChangeState, setExpectedToChangeState] = useState(false);

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setCurrLabPassingTime((curr) => curr + 100);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isRunning]);

  useEffect(() => {
    if (currLabPassingTime >= studyInterval) {
      setIsTimeToBreak(true);
      setExpectedToChangeState(true);
    } else {
      setIsTimeToBreak(false);
    }
  }, [currLabPassingTime]);

  useEffect(() => {
    setCurrLabPassingTime(0);

    switch (studyState) {
      case "STUDY":
        setCurrIntervalTime(studyInterval);
        break;
      case "SHORT_BREAK":
        setCurrIntervalTime(shortBreakInterval);
        break;
      case "LONG_BREAK":
        setCurrIntervalTime(longBreakInterval);
        break;
      default:
        break;
    }
  }, [studyState]);

  const handleStudyStateChange: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    const newState = e.currentTarget.value as StudyState;

    if (isRunning === false && expectedToChangeState == true) {
      changeStudyState(newState);
    }
  };

  const forceStudyStateChange = (newState: StudyState) => {
    changeStudyState(newState);
  };

  const changeStudyState = (newState: StudyState) => {
    setNumOfLab((curr) => curr + 1);

    switch (studyState) {
      case "STUDY":
        const currTime = new Date();
        const startTime = new Date(currTime.getTime() - currLabPassingTime);

        const newStudyInterval: TimeInterval = {
          startTime: startTime,
          endTime: currTime,
        };
        addStudyTime(newStudyInterval);

        break;

      case "SHORT_BREAK":
      case "LONG_BREAK":
        break;
      default:
        break;
    }
    setStudyState(newState);
  };

  const handleCurrTimer: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    setIsRunning((currState) => !currState);
  };

  const addStudyTime = (newInterval: TimeInterval) => {
    setStudyTimes((curr) => [newInterval, ...curr]);
  };

  const [min, sec] = milSecondsToMinAndSeconds(currLabPassingTime);
  const [remMin, remSec] = milSecondsToMinAndSeconds(currIntervalTime - currLabPassingTime);

  return (
    <div className="container bg-slate-500 mx-auto min-h-screen flex justify-center items-center">
      <div className="flex flex-col items-center">
        {/* Nav */}
        <ul className="flex gap-2 flex-col md:flex-row">
          <li>
            <button
              className="px-2 py-1 bg-blue-600"
              value="STUDY"
              onClick={handleStudyStateChange}
            >
              STUDY
              {milSecondsToMin(studyInterval)}
            </button>
          </li>
          <li>
            <button
              className="px-2 py-1 bg-blue-600"
              value="SHORT_BREAK"
              onClick={handleStudyStateChange}
            >
              SHORT BREAK
              {milSecondsToMin(shortBreakInterval)}
            </button>
          </li>
          <li>
            <button
              className="px-2 py-1 bg-blue-600"
              value="LONG_BREAK"
              onClick={handleStudyStateChange}
            >
              LONG BREAK
              {milSecondsToMin(longBreakInterval)}
            </button>
          </li>
        </ul>
        <h2 className="text-6xl my-4">{studyState}</h2>

        {/* timer */}
        <p className="text-3xl font-bold text-blue-600">
          {min} : {sec}
        </p>

        <p className="text-3xl font-bold text-blue-600">
          {remMin} : {remSec}
        </p>

        <p>{isTimeToBreak ? "time to take break" : "time to focus"}</p>
        <p>{numOfLab}</p>
        {/* buttons */}
        <button
          className="px-4 py-1 text-sm  font-semibold rounded-full border  hover:bg-purple-600"
          onClick={handleCurrTimer}
        >
          {isRunning ? "STOP" : "START"}
        </button>

        <div>
          {studyTimes.map((timeInterval) => {
            return (
              <div>
                {timeInterval.startTime.toLocaleTimeString()} -{" "}
                {timeInterval.endTime.toLocaleTimeString()}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function milSecondsToMinAndSeconds(milSeconds: number) {
  const seconds = milSeconds / 1000;
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return [min, sec];
}

function minToMilliseconds(min: number) {
  return min * 60 * 1000;
}

function milSecondsToMin(milSeconds: number) {
  return milSeconds / 1000 / 60;
}

export default App;
