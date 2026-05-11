import type { NextPage } from 'next';
import style from './style.module.scss';
import { useEffect, useState } from 'react'
import FileDrop from '@/data/components/FileDrop';
import functions from '@/data/module/functions';
import Background from '@/data/components/Background';
import useLocalStorage from '@/data/module/use/LocalStorage';
import AFKCfg, { CfgType } from '@/data/other/DefaultConfig/pages/AFK';
import HeadSetting from '@/data/components/HeadSetting';
import AFK_IMG from "./AFK.png";

const defaultImage = AFK_IMG.src

import { Kiasole, setCustomCommandType } from '../_app';

type AFKProps = {
  _DEBUG?: {
    cfg?: CfgType,
    charge?: boolean
  },
};

const AFK: NextPage<AFKProps> = (props: AFKProps) => {

  const { time, week, date, batteryLevel, batteryCharging } = functions.afkClockTimer()

  const [background, setBackground] = useState<string>(defaultImage)
  const [customText, setCustomText] = useState<string>("KIASENOLO X KOLENOSA")

  const [DisplayCustomText, setDisplayCustomText] = useState<boolean>(true)
  const [CustomTextCanEdit, setCustomTextCanEdit] = useState<boolean>(true)
  const [BatteryAmountDisplay, setBatteryAmountDisplay] = useState<boolean>(true)
  const [ChargingAnimation, setChargingAnimation] = useState<boolean>(true)

  const [D_BatteryCharging, setD_BatteryCharging] = useState<boolean>(true)

  const [cfg, setCfg] = useLocalStorage(
    "pages/AFK",
    AFKCfg,
  )

  useEffect(() => {
    if (props._DEBUG?.cfg) {
      setCfg(props._DEBUG.cfg)
    }
  }, [props._DEBUG?.cfg])

  useEffect(() => {
    if (props._DEBUG) {
      if (props._DEBUG.charge !== undefined) {
        setD_BatteryCharging(props._DEBUG.charge)
      } else {
        setD_BatteryCharging(true)
      }
    }

  }, [props._DEBUG?.charge])

  useEffect(() => {
    setDisplayCustomText(cfg.DisplayCustomText)
    setCustomTextCanEdit(cfg.CustomTextCanEdit)
    setBatteryAmountDisplay(cfg.BatteryAmountDisplay)
    setChargingAnimation(cfg.ChargingAnimation)
  }, [cfg])

  useEffect(() => {
    if (props._DEBUG?.cfg) {
      setCfg(props._DEBUG.cfg)
    }
  }, [props._DEBUG?.cfg])

  useEffect(() => {
    if (!props._DEBUG) {
      Kiasole.setCustomCommand((() => {
        const _: setCustomCommandType = () => [
          {
            name: "resetwallpaper",
            alias: ["resetwall"],
            dsc: "reset the wallpaper",
            action: () => { setBackground(defaultImage) }
          },
        ]
        return _
      }))
    }

    return props._DEBUG ? () => { } : () => {
      Kiasole.setCustomCommand(() => () => [])
    }
  }, [])
  return (<>
    {
      props._DEBUG ? <></> :
        <>
          <FileDrop onEvent={(file) => {
            if (file) {
              setBackground(URL.createObjectURL(file[0]!));
            }
          }
          } onlyOneFile={true} />
        </>
    }
    <HeadSetting title='AFK' />
    <div id={style["Frame"]}>
      <div className={style["Background"]}>
        <Background className={style["Image"]} src={background} settingForKILO={{ defaultImage: defaultImage }} />
        <div className={style["Shadow"]} />
      </div>
      <div className={style["Widget"]}>
        <div className={style["Clock"]}>
          <span>
            <span className={style["Time"]}>{time}</span>
            <br />
            <span className={style["Date"]}>{`${date} ${week}`}</span>
            <br />
            <input className={style["CustomText"]} hide-it={DisplayCustomText ? "" : "hide"} readOnly={!CustomTextCanEdit} defaultValue={customText} />
          </span>
        </div>
        <div className={style["InformationBlock"]}>
          <div className={style["Blocks"]}>
            <div className={`${style["Battery"]} ${props._DEBUG ? (D_BatteryCharging ? style["Char"] : "") : (batteryCharging ? style["Char"] : "")} ${batteryLevel === Infinity ? style["Infi"] : ""}  ${batteryLevel === -1 ? style["Error"] : ""}`} hide-it={BatteryAmountDisplay ? "" : "hide"}>
              <div className={style["Text"]}>{`${batteryCharging ? "+" : "-"} ${~~(batteryLevel * 100)}% ${batteryCharging ? "+" : "-"}`}</div>
              <div className={style["Icon"]}>
                <svg xmlns="http://www.w3.org/2000/svg" className={style["Battery"]} height="48px" viewBox="0 -960 960 960" width="48px"><path d="M310-80q-12.75 0-21.37-8.63Q280-97.25 280-110v-676q0-12.75 8.63-21.38Q297.25-816 310-816h90v-34q0-12.75 8.63-21.38Q417.25-880 430-880h100q12.75 0 21.38 8.62Q560-862.75 560-850v34h90q12.75 0 21.38 8.62Q680-798.75 680-786v676q0 12.75-8.62 21.37Q662.75-80 650-80H310Z" /></svg>
                <svg xmlns="http://www.w3.org/2000/svg" className={style["Charging"]} height="48px" viewBox="0 -960 960 960" width="48px"><path d="m476-212 146-309q4-8-1-14.5t-13-6.5H502v-207q0-6-6-7t-8 4L342-443q-4 8 1 14.5t13 6.5h106v207q0 6 6 7t8-4Zm4 132q-85 0-158-30.5T195-195q-54-54-84.5-127T80-480q0-84 30.5-157T195-764q54-54 127-85t158-31q84 0 157 31t127 85q54 54 85 127t31 157q0 85-31 158t-85 127q-54 54-127 84.5T480-80Z" /></svg>
                <svg xmlns="http://www.w3.org/2000/svg" className={style["Power"]} height="48px" viewBox="0 -960 960 960" width="48px"><path d="M382-150v-88L256-377q-7.65-7.86-11.83-18.21Q240-405.57 240-417v-192q0-24.75 17.63-42.38Q275.25-669 300-669h72l-30 30v-171q0-12.75 8.68-21.38 8.67-8.62 21.5-8.62 12.82 0 21.32 8.62 8.5 8.63 8.5 21.38v141h156v-141q0-12.75 8.68-21.38 8.67-8.62 21.5-8.62 12.82 0 21.32 8.62 8.5 8.63 8.5 21.38v171l-30-30h72q24.75 0 42.38 17.62Q720-633.75 720-609v192q0 11.43-4.17 21.79Q711.65-384.86 704-377L578-238v88q0 12.75-8.62 21.37Q560.75-120 548-120H412q-12.75 0-21.37-8.63Q382-137.25 382-150Z" /></svg>
              </div>
              <div className={style["Bar"]}>
                <div className={style["Inner"]} style={{
                  width: `${batteryLevel * 100}%`
                }} />
              </div>
            </div>
          </div>
        </div>
      </div>
      {["", "", ""].map((e, i) => (
        <div className={`${style["PowerIn"]} ${props._DEBUG ? (D_BatteryCharging ? style["Char"] : "") : (batteryCharging ? style["Char"] : "")}`} key={i} hide-it={BatteryAmountDisplay ? ChargingAnimation ? "" : "hide" : "hide"}>
          <div className={`${style["Cer"]} ${style["cBorder"]} `} />
          <div className={style["Cer"]} />
        </div>
      ))}
    </div>
  </>);
}

export default AFK;