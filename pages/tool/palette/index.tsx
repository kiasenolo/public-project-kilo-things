import React, { JSX, useCallback, useEffect, useState } from 'react'

import style from "./style.module.scss";

import HeadSetting from '@/data/components/HeadSetting';
import Return from '@/data/components/Return';
import useLocalStorage from '@/data/module/use/LocalStorage';
import clsx from 'clsx';
import colormgr from '@/data/module/color'
import { _app, newInput } from '@/pages/_app';
import { isArray } from 'tone';
import { TCFTI_List } from './TCFTI';

const defaultList = ["#ffffff", "#ff0000", "#00ff00", "#0000ff", "#ff00ff", "#00ffff", "#ffff00"];
const gayList = ["#ff0000", "#ff8000", "#ffc400", "#c2ff00", "#41ff00", "#00ffa2", "#00b5ff", "#0045ff", "#8d00ff", "#eb00ff", "#ff00b9"];

const nrmClr = (hex: string) => colormgr.isHex(hex) ? colormgr.normalizeHex(hex) : "";
const bright = (hex: string) => colormgr.mixColor(colormgr.bright(hex, 1.8), "+", "#fff", .30);

const copy = (str: string) => {
  navigator
    .clipboard
    .writeText(str)
    .then(_ => _app.throwNewNotic(`write "${str}" to clipboard`))
    .catch(_ => {
      _app.throwNewNotic(`cannot write "${str}" to clipboard, pls chack you console`)
      console.error(_);
    })
}

type ButtonProps = {
  path: JSX.Element,
  onClick?: () => void
  color: string
  disable?: boolean
};

type ColorBarProps = {
  color: string
  value: string
} & ({
  type: "input",
  ev: {
    change?: (e: React.ChangeEvent<HTMLInputElement>) => void
    keyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
    add?: () => void
    copy?: () => void
  }
} | {
  type: "color",
  ev: {
    isBtm: boolean
    isTop: boolean
    change?: (e: React.ChangeEvent<HTMLInputElement>) => void
    keyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
    copy?: () => void
    up?: () => void
    down?: () => void
    deleted?: () => void
  }
});

export default function Palette() {
  const [_storedColors, _setStoredColors] = useLocalStorage<string[]>("tool/palette/colorList", defaultList)
  const [colors, setColors] = useState<string[]>(defaultList)
  const [nowColor, setNowColor] = useState("")
  const [editMode, setEditMode] = useLocalStorage<boolean>("tool/palette/editMode", true)

  useEffect(() => {
    if (_storedColors && isArray(_storedColors)) setColors(_storedColors);
  }, []);

  useEffect(() => {
    const keyEvent = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.code === "KeyS") {
        event.preventDefault();
        _setStoredColors(colors);
        _app.throwNewNotic("Palette Saved!");
      }
      if (event.altKey && event.code === "KeyA") {
        setEditMode(prev => !prev);
      }
    };
    document.addEventListener("keydown", keyEvent);
    return () => document.removeEventListener("keydown", keyEvent);
  }, [colors, setEditMode]);

  useEffect(() => {
    const keyEvent = (event: KeyboardEvent) => {
      if (event.altKey && event.code === "KeyA") {
        setEditMode(e => !e)
      }
    }

    document.addEventListener("keydown", keyEvent)
    return () => {
      document.removeEventListener("keydown", keyEvent)
    }
  }, [editMode])

  const addColor = useCallback((color: string) => {
    if (colormgr.isHex(color)) {
      setColors(pre => [...pre, colormgr.normalizeHex(color)])
      clear()
    } else _app.throwNewNotic("this is not a valid color hex")
  }, [])

  const clear = () => setNowColor("")

  const Button = useCallback(({
    path,
    onClick,
    color,
    disable,
  }: ButtonProps) => {
    const [hover, setHover] = useState(false);

    const btnStyle: React.CSSProperties = hover ? {
      borderColor: bright(color),
      backgroundColor: bright(color),
    } : {
      borderColor: color,
      backgroundColor: "#0000",
    }

    return <button
      className={style["button"]}
      disabled={disable}
      style={{
        opacity: disable ? ".5" : undefined,
        pointerEvents: disable ? "none" : undefined,
        ...btnStyle
      }}
      onClick={onClick}
      onMouseMove={_ => setHover(true)}
      onMouseLeave={_ => setHover(false)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24"
        viewBox="0 -960 960 960"
        width="24"
        style={hover ? {
          fill: "#000",
        } : {
          fill: bright(color),
        }}
      >{path}</svg>
    </button >
  }, [])

  const ColorBar = useCallback(({
    color,
    value,
    type,
    ev,
  }: ColorBarProps) => {
    const prefix = (<>
      <div
        className={style["color"]}
        style={{
          backgroundColor: color,
        }}
      >
        <input
          type="color"
          value={color}
          onChange={ev.change}
          onContextMenu={e => {
            copy(color);
            e.preventDefault();
          }}
        />
      </div>
      <Button
        path={<path d="M200-80q-33 0-56.5-23.5T120-160v-520q0-17 11.5-28.5T160-720q17 0 28.5 11.5T200-680v520h400q17 0 28.5 11.5T640-120q0 17-11.5 28.5T600-80H200Zm160-160q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Z" />}
        color={color}
        onClick={() => copy(color)}
      />
      <input
        type="text"
        value={value}
        style={{
          borderColor: color,
          color: bright(color),
        }}
        onChange={ev.change}
        onKeyDown={ev.keyDown}
      />
    </>);

    switch (type) {
      case 'input':
        return <div className={style["colorBar"]}>
          {prefix}
          <Button
            path={<path d="M480-200q-17 0-28.5-11.5T440-240v-200H240q-17 0-28.5-11.5T200-480q0-17 11.5-28.5T240-520h200v-200q0-17 11.5-28.5T480-760q17 0 28.5 11.5T520-720v200h200q17 0 28.5 11.5T760-480q0 17-11.5 28.5T720-440H520v200q0 17-11.5 28.5T480-200Z" />}
            color={color}
            onClick={ev.add}
          />
          <Button
            path={<path d="M200-80q-33 0-56.5-23.5T120-160v-520q0-17 11.5-28.5T160-720q17 0 28.5 11.5T200-680v520h400q17 0 28.5 11.5T640-120q0 17-11.5 28.5T600-80H200Zm160-160q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Z" />}
            color={color}
            onClick={ev.copy}
          />
        </div>
      case 'color':
        return <div className={style["colorBar"]}>
          {prefix}
          <Button
            path={<path d="M200-80q-33 0-56.5-23.5T120-160v-520q0-17 11.5-28.5T160-720q17 0 28.5 11.5T200-680v520h400q17 0 28.5 11.5T640-120q0 17-11.5 28.5T600-80H200Zm160-160q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Z" />}
            color={color}
            onClick={ev.copy}
          />
          <Button
            path={<path d="M280-120q-33 0-56.5-23.5T200-200v-520q-17 0-28.5-11.5T160-760q0-17 11.5-28.5T200-800h160q0-17 11.5-28.5T400-840h160q17 0 28.5 11.5T600-800h160q17 0 28.5 11.5T800-760q0 17-11.5 28.5T760-720v520q0 33-23.5 56.5T680-120H280Zm80-200q0 17 11.5 28.5T400-280q17 0 28.5-11.5T440-320v-280q0-17-11.5-28.5T400-640q-17 0-28.5 11.5T360-600v280Zm160 0q0 17 11.5 28.5T560-280q17 0 28.5-11.5T600-320v-280q0-17-11.5-28.5T560-640q-17 0-28.5 11.5T520-600v280Z" />}
            color={color}
            onClick={ev.deleted}
          />
          <Button
            path={<path d="M268-373q-11-11-11-28t11-28l184-184q6-6 13-8.5t15-2.5q8 0 15 2.5t13 8.5l185 185q11 11 11 27t-12 28q-11 11-28 11t-28-11L480-529 323-372q-11 11-27 11t-28-12Z" />}
            color={color}
            onClick={ev.up}
            disable={ev.isTop}
          />
          <Button
            path={<path d="M480-362q-8 0-15-2.5t-13-8.5L267-558q-11-11-10.5-27.5T268-613q11-11 28-11t28 11l156 156 157-157q11-11 27.5-10.5T692-613q11 11 11 28t-11 28L508-373q-6 6-13 8.5t-15 2.5Z" />}
            color={color}
            onClick={ev.down}
            disable={ev.isBtm}
          />
        </div>
    }
  }, [])

  const TCFTI_Menu = useCallback(() => {
    newInput.select<number>(
      TCFTI_List.map(((e, i) => ({
        name: e.name ?? e.id,
        info: `tcfti-${e.id} [${i}]`,
        value: i
      }))),
      (i) => {
        setColors(TCFTI_List[i].colors)
      }
    )
  }, [])

  return (
    <>
      <HeadSetting title='調色板' ogp={{
        title: "Color Palette",
        color: "#6fffff",
        description: "一個神奇的調色板"
      }} />
      <Return hide={true} tips='<=\\ 召喚出各種的顔色！ [ /tool ]' />
      <div
        id={style["Frame"]}
        className={clsx(!editMode && style["copyColor"])}
      >

        <div className={style["Edit"]}>
          <div className={style["Title"]}>
            <span>{"Color Palette"}</span>
          </div>
          <div className={style["List"]}>
            {colors.map((color, i) => <ColorBar
              key={i}
              color={nrmClr(color)}
              value={color}
              type='color'
              ev={{
                change(e) {
                  const value = e.currentTarget.value;
                  setColors(prev => {
                    const _ = [...prev]
                    _[i] = value;
                    return _
                  })
                },
                copy() {
                  setColors(prev => {
                    const _ = [...prev]
                    _.splice(i, 0, _[i]);
                    return _
                  })
                },
                deleted() {
                  setColors(prev => prev.filter((_, idx) => i !== idx))
                },
                up() {
                  setColors(prev => {
                    const _ = [...prev]
                    _.splice(i - 1, 0, _.splice(i, 1)[0]);
                    return _
                  })
                },
                down() {
                  setColors(prev => {
                    const _ = [...prev]
                    _.splice(i + 1, 0, _.splice(i, 1)[0]);
                    return _
                  })
                },
                isBtm: i === (colors.length - 1),
                isTop: i === 0,
              }}
            />)}
          </div>
          <div
            className={style["Input"]}
            style={{
              backgroundColor: nrmClr(nowColor) ? colormgr.bright(nrmClr(nowColor), .1) : ""
            }}
          >
            <ColorBar
              color={nrmClr(nowColor)}
              value={nowColor}
              type='input'
              ev={{
                change(e) {
                  setNowColor(e.currentTarget.value)
                },
                keyDown(e) {
                  const value = e.currentTarget.value;
                  const val = value.toLocaleLowerCase();

                  if (e.code === "Escape") {
                    clear()
                  } if (e.key === "Enter" || e.code === "NumpadEnter") {
                    try {
                      const list = JSON.parse(value)
                      if (isArray(list)) {
                        setColors(list)
                        setNowColor("")
                      } else throw Error();
                    } catch {
                      switch (val) {
                        case "cls":
                        case "clear": {
                          setColors([])
                          return clear();
                        }
                        case "def":
                        case "default": {
                          setColors(defaultList)
                          return clear();
                        }
                        case "gay": {
                          setColors(gayList)
                          return clear();
                        }
                        case "tcfti": {
                          TCFTI_Menu()
                          return clear();
                        }
                        default: {
                          if (val.startsWith("tcfti")) {
                            const idReg = /tcfti-(.*)/
                            const indxReg = /tcfti\[(.*)\]/


                            if (idReg.test(val)) {
                              const mth = val.match(idReg)!

                              const target = TCFTI_List.filter(e => e.id === mth[1])[0]

                              if (target) {
                                setColors(target.colors)
                              } else _app.throwNewNotic("id not found");
                            } else if (indxReg.test(val)) {
                              const mth = val.match(indxReg)!

                              const num = Number(mth[1]);

                              if (isNaN(num)) {
                                _app.throwNewNotic("not a valid number")
                                return;
                              }

                              const target = TCFTI_List[num]

                              if (target) {
                                setColors(target.colors)
                              } else _app.throwNewNotic("tcfti not found");
                            } else {
                              TCFTI_Menu()
                              return clear();
                            }
                          } else addColor(value)
                        }
                      }
                    }
                  }
                },
                add() {
                  addColor(nowColor)
                },
                copy() {
                  navigator.clipboard.writeText(JSON.stringify(colors))
                },
              }}
            />
          </div>
        </div>

        <div className={style["Copy"]}>
          {colors.map((clr, i) => <div
            key={i}
            className={style["color"]}
            onClick={() => {
              copy(clr)
            }}
          >
            <div
              className={style["bg"]}
              style={{
                backgroundColor: clr,
                borderColor: bright(clr)
              }}
            />
            <div className={style["text"]}>
              <span style={{
                color: bright(clr)
              }}>{clr}</span>
            </div>
          </div>)}
        </div>

      </div>
    </>
  )
}