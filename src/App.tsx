import { useEffect, useState } from "react";
import "./App.css";

type StudyState = "STUDY" | "SHORT_BREAK" | "LONG_BREAK";

function App() {
  // config
  const [studyInterval, setStudyInterval] = useState(minToMilliseconds(0.05));
  const [shortBreakInterval, setShortBreakInterval] = useState(minToMilliseconds(0.01));
  const [longBreakInterval, setLongBreakInterval] = useState(minToMilliseconds(0.02));
  const [numOfLabBeforeLongBreak, setNumOfLabBeforeLongBreak] = useState(4);
  const [isChangeStateAuto, setIsChangeStateAuto] = useState(false);

  const [studyState, setStudyState] = useState<StudyState>("STUDY");

  const [currLabPassingTime, setCurrLabPassingTime] = useState(0);
  const [currIntervalTime, setCurrIntervalTime] = useState(studyInterval);
  const [numOfLab, setNumOfLab] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [expectedToChangeState, setExpectedToChangeState] = useState(false);
  const [studyingTime, setStudyingTime] = useState(0);

  // audio
  const [audioStudy, toggleAudioStudy] = useAudio("./sound-1.wav");

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

  // PLAY AUDIO
  useEffect(() => {
    if (expectedToChangeState) {
      toggleAudioStudy();
    }
  }, [expectedToChangeState]);

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

  const handleChangeToNextState = () => {
    if (expectedToChangeState) return changeToNextState();

    const confirmation = confirm("Are you sure you want to change to the next state?");
    if (confirmation) changeToNextState();
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

  const [min, sec] = milSecondsToMinAndSeconds(currLabPassingTime);
  const [remMin, remSec] = milSecondsToMinAndSeconds(currIntervalTime - currLabPassingTime);

  return (
    <div className="container bg-slate-500 mx-auto min-h-screen flex justify-center items-center">
      <div className="flex flex-col items-center">
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
          onClick={handleChangeToNextState}
        >
          {"next"}
        </button>

        <h2>{milSecondsToMinAndSeconds(studyingTime)}</h2>
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

const useAudio = (url: string): [boolean, () => void] => {
  const [audio] = useState(new Audio(url));
  const [playing, setPlaying] = useState(false);

  const toggle = () => setPlaying(!playing);

  useEffect(() => {
    playing ? audio.play() : audio.pause();
  }, [playing]);

  useEffect(() => {
    audio.addEventListener("ended", () => setPlaying(false));
    return () => {
      audio.removeEventListener("ended", () => setPlaying(false));
    };
  }, []);

  return [playing, toggle];
};

export default App;
