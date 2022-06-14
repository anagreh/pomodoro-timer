import { useEffect, useRef, useState } from "react";
import "./App.css";

type StudyState = "STUDY" | "SHORT_BREAK" | "LONG_BREAK";

function App() {
  // config
  const [studyInterval, setStudyInterval] = useState(minToMilliseconds(25));
  const [shortBreakInterval, setShortBreakInterval] = useState(minToMilliseconds(5));
  const [longBreakInterval, setLongBreakInterval] = useState(minToMilliseconds(15));
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
        setCurrLabPassingTime((curr) => curr + 1000);
        if (studyState === "STUDY") {
          setStudyingTime((curr) => curr + 1000);
        }
      }, 1000);
      return () => {
        console.log("stop interval");
        clearInterval(interval);
      };
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
  }, [studyState, studyInterval, shortBreakInterval, longBreakInterval]);

  // change to the next state if expectedToChange is true and isChangeStateAuto is true
  useEffect(() => {
    if (isChangeStateAuto) {
      if (expectedToChangeState) {
        changeToNextState();
      }
    }
  }, [expectedToChangeState]);

  const changeStudyState = (newState: StudyState) => {
    setCurrLabPassingTime(0);

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

  const onClickNextBtn = () => {
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

  const resetPassingTime = () => {
    setCurrLabPassingTime(0);
  };

  const [min, sec] = milSecondsToMinAndSeconds(currLabPassingTime);
  const [remMin, remSec] = milSecondsToMinAndSeconds(currIntervalTime - currLabPassingTime);

  return (
    <main className="container max-w-4xl h-96 mx-auto min-h-screen flex justify-center items-center">
      <div className="bg-primary grid grid-cols-5 text-secondary">
        {/* config */}
        <div className="bg-secondary col-span-1 p-4 text-primary flex flex-col gap-2 ">
          <h2 className="text-center py-1">Config</h2>
          <SwitchConfig setConfig={setIsChangeStateAuto}>auto change state</SwitchConfig>
          <NumConfig
            name="config-2"
            value={numOfLabBeforeLongBreak}
            setValue={setNumOfLabBeforeLongBreak}
          >
            config 2
          </NumConfig>
        </div>

        {/* main */}
        <div className="col-span-3 flex flex-col items-center p-6">
          <h2 className="text-6xl mb-4">{studyState}</h2>
          {/* timer */}
          <div className="grid gap-16 grid-cols-2 mb-4">
            <div>
              <p className="text-3xl font-bold text-center">
                {min} : {sec}
              </p>
              <p className="text-sm text-center">passing time</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-center">
                {remMin} : {remSec}
              </p>
              <p className="text-sm text-center">remaining time</p>
            </div>
          </div>

          {/* buttons */}
          <div className="grid grid-cols-3 items-center mb-4">
            <div className="flex gap-1 items-center">
              <Button onClick={handleCurrTimer}>{isRunning ? "STOP" : "START"}</Button>
              {currLabPassingTime > 0 && (
                <button className="text-secondary h-6 " onClick={resetPassingTime}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"
                    />
                    <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z" />
                  </svg>
                </button>
              )}
            </div>

            <div>
              <p className="text-sm text-center">lab</p>
              <p className="text-center">{numOfLab}</p>
            </div>

            <Button onClick={onClickNextBtn}>NEXT</Button>
          </div>

          {/* study time */}
          <div>
            <p className="text-sm text-center">study time</p>
            <h2 className="text-center">{milSecondsToMinAndSeconds(studyingTime)}</h2>
          </div>
        </div>

        {/*  time sitting */}
        <div className="bg-secondary col-span-1 p-4 text-primary">
          <h2 className="mb-1 text-center">Time Sitting</h2>
          <TimeInput name="study-time" value={studyInterval} setValue={setStudyInterval}>
            Study Time
          </TimeInput>
          <TimeInput
            name="short-break-time"
            value={shortBreakInterval}
            setValue={setShortBreakInterval}
          >
            Short Break
          </TimeInput>
          <TimeInput
            name="long-break-time"
            value={longBreakInterval}
            setValue={setLongBreakInterval}
          >
            Long Break
          </TimeInput>
        </div>
      </div>
    </main>
  );
}

//#region Components

type BtnProps = {
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};
export const Button = (props: BtnProps) => {
  return (
    <button
      className="flex rounded-md bg-white overflow-clip w-28 text-secondary"
      onClick={props.onClick}
    >
      <div className="bg-secondary py-2 px-2">
        <svg
          width="21"
          height="23"
          viewBox="0 0 21 23"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19.8333 11.5L1.75 1.16667M1.75 1.16667V21.8333V1.16667ZM19.8333 11.5L1.75 21.8333L19.8333 11.5Z"
            stroke="#DFF6FF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="px-4 py-2 text-center">{props.children}</p>
    </button>
  );
};

type SwitchConfigProps = {
  children: React.ReactNode;
  setConfig: React.Dispatch<React.SetStateAction<boolean>>;
};
const SwitchConfig = (props: SwitchConfigProps) => {
  return (
    <div className="flex bg-blue-800 p-1 justify-between text-sm">
      <p>{props.children}</p>
      <input
        type="checkbox"
        name="config-1"
        id="config-1"
        value="off"
        onChange={(e) => props.setConfig(e.target.checked)}
      />
    </div>
  );
};

type NumConfigProps = {
  name: string;
  children: string;
  value: number;
  setValue: React.Dispatch<React.SetStateAction<number>>;
};

const NumConfig = ({ name, value, setValue, children }: NumConfigProps) => {
  return (
    <div className="flex bg-blue-800 justify-between py-2 text-sm">
      <label htmlFor={name}>{children}</label>
      <input
        className="text-secondary"
        type="number"
        name={name}
        id={name}
        size={3}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
      />
    </div>
  );
};

type TimeInputProps = {
  name: string;
  value: number;
  children: string;
  setValue: React.Dispatch<React.SetStateAction<number>>;
};
//TODO: if the time is playing and it is for the current state then it should be disabled
const TimeInput = ({ name, value, setValue, children }: TimeInputProps) => {
  return (
    <div className="flex justify-between py-1">
      <label htmlFor={name} className="text-sm">
        {children}
      </label>
      <input
        className="text-secondary"
        type="number"
        name={name}
        id={name}
        size={3}
        value={milSecondsToMin(value)}
        onChange={(e) => setValue(minToMilliseconds(Number(e.target.value)))}
      />
    </div>
  );
};
//#endregion

//#region hooks
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

//#endregion

//#region helper functions
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

//#endregion
