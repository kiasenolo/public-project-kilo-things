import React, { useEffect, useRef, useState } from 'react'

import style from "./old.module.scss";

import HeadSetting from '@/data/components/HeadSetting';
import Return from '@/data/components/Return';

const defaultList = ["#ffffff", "#ff0000", "#00ff00", "#0000ff", "#ff00ff", "#00ffff", "#ffff00"]
export default function Palette() {
  const [colors, setColors] = useState<Array<string>>(defaultList)
  const [nowColor, setNowColor] = useState<string>("")

  const MainRef = useRef<HTMLDivElement>(null)
  const ColorInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {

    const main = MainRef.current!
    const input = ColorInputRef.current!

    document.onkeydown = (event) => {
      if (event.altKey && event.code === "KeyA") {
        event.preventDefault()
        const em = main.getAttribute("edit-mode")
        const set = (v: string) => main.setAttribute("edit-mode", v);

        if (em === "true") {
          set("false")
        } else {
          set("true")
        }
      } else if (event.code === "Escape") {
        input.value = ""
        setNowColor("")
      }
    }

    return () => {
      document.onkeydown = null
    }
  })

  return (
    <>
      <HeadSetting title='調色板' />
      <Return hide={true} tips='<=\\ 召喚出各種的顔色！ [ /tool ]' />
      <div id={style["Frame"]}>
        <div className={style["Title"]}>
          <div>神奇的調色板</div>
        </div>
        <div className={style["Main"]} edit-mode="true" ref={MainRef}>
          <div className={style["input"]}>
            <div className={style["list"]}>
              {colors.map((color, i) =>
                <div
                  key={i}
                  className={style["color"]}
                >
                  <div
                    className={style["color"]}
                    style={{ backgroundColor: color }}
                  />
                  <input
                    className={style["textInput"]}
                    style={{ borderColor: color }}
                    the-text-input=""
                    key={`txt_${color}`}
                    onChange={(event) => {
                      const owo = colors
                      const target = (event.target);
                      owo[i] = target.value.padStart(7, "#")
                      setColors([...owo])
                      target.focus()
                    }}
                    defaultValue={color.slice(1)}
                  />
                  <button
                    the-button=""
                    className={style["copy"]}
                    style={{ borderColor: color }}
                    onClick={() => {
                      const owo = colors;
                      const index = i;
                      const element = color

                      owo.splice(index, 0, element);
                      setColors([...owo])
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M200-80q-33 0-56.5-23.5T120-160v-520q0-17 11.5-28.5T160-720q17 0 28.5 11.5T200-680v520h400q17 0 28.5 11.5T640-120q0 17-11.5 28.5T600-80H200Zm160-160q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Z" /></svg>
                  </button>
                  <button
                    the-button=""
                    className={style["delete"]}
                    style={{ borderColor: color }}
                    onClick={() => {
                      setColors([
                        ...colors.slice(0, i),
                        ...colors.slice(i + 1)
                      ])
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M280-120q-33 0-56.5-23.5T200-200v-520q-17 0-28.5-11.5T160-760q0-17 11.5-28.5T200-800h160q0-17 11.5-28.5T400-840h160q17 0 28.5 11.5T600-800h160q17 0 28.5 11.5T800-760q0 17-11.5 28.5T760-720v520q0 33-23.5 56.5T680-120H280Zm80-200q0 17 11.5 28.5T400-280q17 0 28.5-11.5T440-320v-280q0-17-11.5-28.5T400-640q-17 0-28.5 11.5T360-600v280Zm160 0q0 17 11.5 28.5T560-280q17 0 28.5-11.5T600-320v-280q0-17-11.5-28.5T560-640q-17 0-28.5 11.5T520-600v280Z" /></svg>
                  </button>
                  <div
                    className={`${style["buttons"]} ${style[(i === 0 || i === (colors.length - 1)) ? "true" : "false"]}`}
                  >
                    {(() => {
                      const up = (
                        <button
                          className={style["up"]}
                          the-button=""
                          style={{ borderColor: color }}
                          onClick={() => {
                            const owo = colors;
                            const targetIndex = i;

                            const targetElement = owo.splice(targetIndex, 1)[0];
                            const newPosition = i - 1;

                            owo.splice(newPosition, 0, targetElement);

                            setColors([...owo])
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M268-373q-11-11-11-28t11-28l184-184q6-6 13-8.5t15-2.5q8 0 15 2.5t13 8.5l185 185q11 11 11 27t-12 28q-11 11-28 11t-28-11L480-529 323-372q-11 11-27 11t-28-12Z" /></svg>
                        </button>)

                      const down = (
                        <button
                          className={style["down"]}
                          the-button=""
                          style={{ borderColor: color }}
                          onClick={() => {
                            const owo = colors;
                            const targetIndex = i;

                            const targetElement = owo.splice(targetIndex, 1)[0];
                            const newPosition = i + 1;

                            owo.splice(newPosition, 0, targetElement);

                            setColors([...owo])
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M480-362q-8 0-15-2.5t-13-8.5L267-558q-11-11-10.5-27.5T268-613q11-11 28-11t28 11l156 156 157-157q11-11 27.5-10.5T692-613q11 11 11 28t-11 28L508-373q-6 6-13 8.5t-15 2.5Z" /></svg>
                        </button>)

                      if (i === 0) {
                        return down
                      } else if (i === (colors.length - 1)) {
                        return up
                      } else {
                        return (<>
                          {up}
                          {down}
                        </>)
                      }
                    })()}
                  </div>
                </div>
              )}
            </div>
            <div className={style["input"]}>
              <div
                className={style["color"]}
                style={{ backgroundColor: nowColor || "#ffffff" }}
              />
              <input
                type="text"
                the-text-input=""
                style={{ borderColor: nowColor || "#ffffff" }}
                onChange={(e) => {
                  const value = e.target.value

                  const clearInput = () => {
                    ColorInputRef.current!.value = ""
                  }

                  switch (value.toLocaleLowerCase()) {
                    case "clear":
                    case "cls":
                      {
                        setColors([])
                        clearInput()
                        break;
                      }

                    case "default": {
                      setColors(defaultList)
                      clearInput()
                      break;
                    }

                    case "gay": {
                      setColors(["#ff0000", "#ff8000", "#ffc400", "#c2ff00", "#41ff00", "#00ffa2", "#00b5ff", "#0045ff", "#8d00ff", "#eb00ff", "#ff00b9"])
                      clearInput()
                      break;
                    }

                    default: {
                      try {
                        const json = JSON.parse(value)
                        if (typeof json !== "object") return;
                        setColors(json)
                        clearInput()
                      } catch {
                        setNowColor((value ? "#" + value.padStart(6, "0") : ""))
                      }
                      break
                    }
                  }
                }}
                defaultValue={nowColor}
                ref={ColorInputRef}
              />
              <button
                the-button=""
                style={{ borderColor: nowColor || "#ffffff" }}
                onClick={() => {
                  setColors([...colors, nowColor || "#ffffff"])
                  setNowColor("")
                  ColorInputRef.current!.value = ""
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M480-200q-17 0-28.5-11.5T440-240v-200H240q-17 0-28.5-11.5T200-480q0-17 11.5-28.5T240-520h200v-200q0-17 11.5-28.5T480-760q17 0 28.5 11.5T520-720v200h200q17 0 28.5 11.5T760-480q0 17-11.5 28.5T720-440H520v200q0 17-11.5 28.5T480-200Z" /></svg>
              </button>
              <button
                the-button=""
                className={style["copy"]}
                style={{ borderColor: nowColor || "#ffffff" }}
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(colors))
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M200-80q-33 0-56.5-23.5T120-160v-520q0-17 11.5-28.5T160-720q17 0 28.5 11.5T200-680v520h400q17 0 28.5 11.5T640-120q0 17-11.5 28.5T600-80H200Zm160-160q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Z" /></svg>
              </button>
            </div>
          </div>
          <div className={style["output"]}>
            {
              colors.map((e, i) =>
                <div
                  className={style["color"]}
                  key={i}
                  style={{ backgroundColor: e }}
                  hover-tips={e}
                  onClick={() => {
                    navigator.clipboard.writeText(e)
                  }}
                >
                  <div className={style["hexCode"]}>
                    <div className={style["code"]} style={{ color: e, filter: "brightness(2)" }}>{e}</div>
                  </div>
                </div>
              )
            }
          </div>
        </div>
      </div>
    </>
  )
}