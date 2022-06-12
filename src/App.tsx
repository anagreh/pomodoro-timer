import { useEffect, useState } from "react";
import "./App.css";

type StudyState = "STUDY" | "SHORT_BREAK" | "LONG_BREAK";
interface TimeInterval {
  name: StudyState;
  startTime: Date;
  endTime: Date | undefined;
}

function App() {
  // config
  const [studyInterval, setStudyInterval] = useState(minToMilliseconds(0.05));
  const [shortBreakInterval, setShortBreakInterval] = useState(minToMilliseconds(0.01));
  const [longBreakInterval, setLongBreakInterval] = useState(minToMilliseconds(0.02));
  const [numOfLabBeforeLongBreak, setNumOfLabBeforeLongBreak] = useState(4);
  const [isChangeStateAuto, setIsChangeStateAuto] = useState(true);
  const [isStopTimeAfterEnd, setIsStopTimeAfterEnd] = useState(false);

  const [studyState, setStudyState] = useState<StudyState>("STUDY");
  const [currInterval, setCurrInterval] = useState<TimeInterval>();
  const [studyTimes, setStudyTimes] = useState<TimeInterval[]>([]);
  const [breakTimes, setBreakTimes] = useState<TimeInterval[]>([]);

  const [currLabPassingTime, setCurrLabPassingTime] = useState(0);
  const [currIntervalTime, setCurrIntervalTime] = useState(studyInterval);
  const [numOfLab, setNumOfLab] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [expectedToChangeState, setExpectedToChangeState] = useState(false);
  const [studyingTime, setStudyingTime] = useState(0);

  // start timer
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setCurrLabPassingTime((curr) => curr + 100);
        if (studyState === "STUDY") {
          setStudyingTime((curr) => curr + 100);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isRunning, studyState]);

  // change state after it passed the curr interval time
  useEffect(() => {
    if (currLabPassingTime >= currIntervalTime) {
      setExpectedToChangeState(true);
    } else {
      setExpectedToChangeState(false);
    }
  }, [currLabPassingTime]);

  // set the curr interval time
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

  // change to the next state if expectedToChange is true and isChangeStateAuto is true
  useEffect(() => {
    if (isChangeStateAuto) {
      if (expectedToChangeState) {
        changeToNextState();
      }
    }
  }, [expectedToChangeState]);

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
    switch (studyState) {
      case "STUDY":
        break;

      case "SHORT_BREAK":
      case "LONG_BREAK":
        break;
      default:
        break;
    }
    setStudyState(newState);
  };

  const changeToNextState = () => {
    switch (studyState) {
      case "STUDY":
        if (numOfLab % numOfLabBeforeLongBreak === 0) {
          changeStudyState("LONG_BREAK");
        } else {
          changeStudyState("SHORT_BREAK");
        }
        break;
      case "SHORT_BREAK":
        changeStudyState("STUDY");
        nextLab();
        break;
      case "LONG_BREAK":
        changeStudyState("STUDY");
        nextLab();
        break;
      default:
        break;
    }
  };

  const handleCurrTimer: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    setIsRunning((currState) => !currState);
  };

  const nextLab = () => {
    setNumOfLab((curr) => curr + 1);
  };

  const addStudyTime = (newInterval: TimeInterval) => {
    const currTime = new Date();
    const startTime = new Date(currTime.getTime() - currLabPassingTime);

    const newStudyInterval: TimeInterval = {
      name: studyState,
      startTime: startTime,
      endTime: currTime,
    };

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

        <p>{numOfLab}</p>

        {/* buttons */}
        <button
          className="px-4 py-1 text-sm  font-semibold rounded-full border  hover:bg-purple-600"
          onClick={handleCurrTimer}
        >
          {isRunning ? "STOP" : "START"}
        </button>

        <button
          className="px-4 py-1 text-sm  font-semibold rounded-full border  hover:bg-purple-600"
          onClick={changeToNextState}
        >
          {"next"}
        </button>

        <h2>{milSecondsToMinAndSeconds(studyingTime)}</h2>

        <div>
          {studyTimes.map((timeInterval) => {
            return (
              <div>
                {timeInterval.startTime.toLocaleTimeString()} -{" "}
                {timeInterval.endTime?.toLocaleTimeString()}
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
