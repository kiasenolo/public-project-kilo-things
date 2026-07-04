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
import { toolsColor } from '..';

const defaultList = [
  "#ffffff",
  "#ff0000",
  "#00ff00",
  "#0000ff",
  "#ff00ff",
  "#00ffff",
  "#ffff00",
];
const gayList = [
  "#ff0000",
  "#ff8000",
  "#ffc400",
  "#c2ff00",
  "#41ff00",
  "#00ffa2",
  "#00b5ff",
  "#0045ff",
  "#8d00ff",
  "#eb00ff",
  "#ff00b9",
];
const favList = [
  "#feeab5",
  "#fed89f",
  "#e7b580",
  "#b29873",
  "#beccb2",
  "#c5caca",
  "#a7bbb7",
  "#d8f5fb",
  "#b1e4ed",
  "#3de0fb",
  "#627e93",
  "#72ada2",
  "#51d0bb",
  "#5ac3a4",
  "#3fa494",
  "#F2ECC1",
  "#C2B390",
  "#B6A469",
  "#978255",
  "#CAB670",
  "#BDA15F",
  "#C98437",
  "#AA7E4D",
  "#FFFAE7",
  "#DFD8BE",
  "#BDB898",
  "#AEAA88",
  "#C3AF60",
  "#B69C25",
  "#BBBAA7",
  "#9F9075",
  "#8F7264",
  "#82878D",
  "#ADB1CC",
]

const appID = "kiasenolo.tool.simple-color-palette"

namespace DragType {
  export type text = {
    type: "text"
    text: string
  }

  export type newColor = {
    type: "newColor"
    color: string
  }

  export type dragColor = {
    type: "dragColor"
    index: number
    color: string
  }

  export type newPalette = {
    type: "newPalette"
    colors: string[]
  }

  export type dragPalette = {
    type: "dragPalette"
    index: number
    colors: string[]
  }

  export type _ALL =
    | text
    | newColor
    | dragColor
    | newPalette
    | dragPalette
}

function drag(e: React.DragEvent, data: DragType._ALL) {
  e.dataTransfer.setData(appID, JSON.stringify(data));
  e.stopPropagation()
  let txt: string = ""
  switch (data.type) {
    case 'text': {
      txt = data.text;
      break;
    }
    case 'newColor':
    case 'dragColor': {
      txt = data.color;
      break;
    }
    case 'newPalette':
    case 'dragPalette': {
      txt = JSON.stringify(data.type);
      break;
    }
  }
  e.dataTransfer.setData("text/plain", txt)
}

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
  onClick?: (e: mouseEvent) => void
  onDrag?: (e: React.DragEvent<HTMLButtonElement>) => void
  color: string
  disable?: boolean
};

type mouseEvent = React.MouseEvent<HTMLButtonElement, MouseEvent>

type baseEv = {
  change?: (e: React.ChangeEvent<HTMLInputElement>) => void
  keyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onDrag?: (e: React.DragEvent<HTMLDivElement>) => void
  copyDrag: (e: React.DragEvent<HTMLButtonElement>) => void,
}


export default function Palette() {
  const [_storedColors, _setStoredColors] = useLocalStorage<string[]>("tool/palette/colorList", defaultList)
  const [colors, setColors] = useState<string[]>(defaultList)
  const [isDraging, setIsDraging] = useState(false)
  const [dragTar, setDragTar] = useState(-1)
  const [nowColor, setNowColor] = useState("")
  const [editMode, setEditMode] = useLocalStorage<boolean>("tool/palette/editMode", true)

  const [tcftiMenu, setTcftiMenu] = useState<boolean>(false)

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
      if (event.altKey && event.code === "KeyR") {
        setColors(e => e.map(colormgr.normalizeHex))
      }
    };
    document.addEventListener("keydown", keyEvent);
    return () => document.removeEventListener("keydown", keyEvent);
  }, [colors, setEditMode]);

  useEffect(() => {
    const keyEvent = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        setTcftiMenu(false)
      }
      if (e.altKey) {
        if (e.code === "KeyA" && !tcftiMenu) {
          setEditMode(e => !e)
        }
        if (e.code === "KeyT" && editMode) {
          setTcftiMenu(e => !e)
        }
      }
    }

    document.addEventListener("keydown", keyEvent)
    return () => {
      document.removeEventListener("keydown", keyEvent)
    }
  }, [editMode, tcftiMenu])

  const isValidColor = useCallback((color: string, isVaild?: (color: string) => void) => {
    if (colormgr.isHex(color)) {
      isVaild?.(color)
      return true
    } else {
      _app.throwNewNotic("this is not a valid color hex")
      return false
    }
  }, [])

  const addColor = useCallback((color: string) => {
    isValidColor(color, (color) => { setColors(pre => [...pre, colormgr.normalizeHex(color)]); clear(); })
  }, [])

  const clear = () => setNowColor("")

  const Button = useCallback(({
    path,
    onClick,
    onDrag,
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
        opacity: disable ? ".2" : undefined,
        pointerEvents: disable ? "none" : undefined,
        ...btnStyle
      }}
      draggable={!!onDrag}
      onDragStart={onDrag}
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

  type ColorBarProps = {
    color: string
    value: string
    index: number
    isDraging: boolean
  } & ({
    type: "input",
    ev: {
      add?: (e: mouseEvent) => void
      copy?: (e: mouseEvent) => void
    } & baseEv
  } | {
    type: "color",
    ev: {
      isBtm: boolean
      isTop: boolean
      copy?: (e: mouseEvent) => void
      up?: (e: mouseEvent) => void
      down?: (e: mouseEvent) => void
      deleted?: (e: mouseEvent) => void
    } & baseEv
  });

  const ColorBar = useCallback(({
    color,
    value,
    type,
    ev,
    index,
    isDraging,
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
        onDrop={e => {
          if (!e.dataTransfer) return;
          const itemdata = e.dataTransfer.getData(appID);
          console.log(itemdata);

          if (itemdata) {
            const item: DragType._ALL = JSON.parse(itemdata);
            switch (item.type) {
              case 'newColor':
              case 'dragColor':
                return e.preventDefault()
            }
          }
        }}
        onChange={ev.change}
        onKeyDown={ev.keyDown}
      />
    </>);

    const ctn = (() => {
      switch (type) {
        case 'input':
          return <>
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
              onDrag={ev.copyDrag}
            />
          </>

        case 'color':
          return <>
            {prefix}
            <Button
              path={<path d="M200-80q-33 0-56.5-23.5T120-160v-520q0-17 11.5-28.5T160-720q17 0 28.5 11.5T200-680v520h400q17 0 28.5 11.5T640-120q0 17-11.5 28.5T600-80H200Zm160-160q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Z" />}
              color={color}
              onClick={ev.copy}
              onDrag={ev.copyDrag}
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
          </>
      }
    })()
    return <div
      className={style["colorBar"]}
      draggable={!!ev.onDrag}
      onDragStart={ev.onDrag}
    >
      {(index !== -1 && isDraging) && <div className={style["drgArea"]}>
        {[
          index,
          index + 1
        ].map((nowIndx, key) => <div
          key={index + key}
          onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
          onDragEnter={() => setDragTar(nowIndx)}
          onDrop={e => dropEvent(e, nowIndx)}
        />)}
      </div>}
      <div className={style["clr"]}>{ctn}</div>
    </div>
  }, [])

  const dropEvent = (e: React.DragEvent<HTMLDivElement>, index: number,) => {
    if (!e.dataTransfer) return;
    const itemdata = e.dataTransfer.getData(appID);
    console.log(itemdata);

    if (itemdata) {
      const item: DragType._ALL = JSON.parse(itemdata);
      setColors(p => {
        let _ = [...p]

        switch (item.type) {
          case 'newColor': {
            if (isValidColor(item.color)) {
              clear()
              return [..._.slice(0, index), colormgr.normalizeHex(item.color), ..._.slice(index)]
            } else {
              return p
            }
          }
          case 'dragColor': {
            _[item.index] = "DEL"
            if (isValidColor(item.color)) {
              return [..._.slice(0, index), colormgr.normalizeHex(item.color), ..._.slice(index)].filter(e => !e.endsWith("DEL"))
            } else {
              return p
            }
          }
          case 'text':
          case 'newPalette':
          case 'dragPalette':
            return p
        }
      })
    }
  }

  type DragAreaProp = {
    setColors: React.Dispatch<React.SetStateAction<string[]>>;
    setNowColor: React.Dispatch<React.SetStateAction<string>>;
    index: number;
    dragTar: number
  }

  const DropArea = useCallback(({
    index,
    dragTar,
  }: DragAreaProp) => {

    return <div
      className={clsx(style["DropArea"], dragTar === index && style["activ"])}
      onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
      onDragEnter={() => setDragTar(index)}
      onDrop={e => dropEvent(e, index)}
    ><div /></div>
  }, [])

  return (
    <>
      <HeadSetting title='調色板' ogp={{
        title: "Color Palette",
        description: "一個神奇的調色板",
        color: toolsColor,
      }} />
      <Return hide={true} tips='<=\\ 召喚出各種的顔色！ [ /tool ]' />
      <div
        id={style["Frame"]}
        className={clsx(!editMode && style["copyColor"])}
        onDrop={e => { setDragTar(-1); setIsDraging(false) }}
        onDragEnd={e => { setDragTar(-1); setIsDraging(false) }}
      >

        <div className={clsx(style["TCFTI"], tcftiMenu && style["show"])}>
          {TCFTI_List.map((e, i) => <div
            className={style["palette"]}
            key={"pat-" + i}
            onClick={() => {
              setColors(e.colors)
              setTcftiMenu(false)
            }}
          >
            <div className={style["title"]}>
              {e.name ?
                <div className={style["name"]}>{`[ ${i} ] `}{e.name}<span>{e.id}</span></div>
                :
                <div className={style["name"]}>{`[ ${i} ] `}{e.id}</div>
              }
              <a href={e.souce} target='_blank' onClick={e => e.stopPropagation()}>source</a>

            </div>
            <div className={style["display"]}>
              {e.colors.map((e, i2) => <div key={"pat-" + i + "-" + i2} style={{ backgroundColor: e }}></div>)}
            </div>
          </div>)}
        </div>

        <div className={style["Edit"]}>
          <div className={style["Title"]}>
            <div className={style["TexT"]}>
              <span>{"Color Palette"}</span>
            </div>
          </div>
          <div className={style["List"]}>
            <DropArea index={0} setColors={setColors} setNowColor={setNowColor} dragTar={dragTar} />
            {colors.map((color, i) => <>
              <ColorBar
                index={i}
                key={i}
                color={nrmClr(color)}
                value={color}
                isDraging={isDraging}
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
                  onDrag(e) {
                    setIsDraging(true)
                    drag(e, { type: "dragColor", color: color, index: i })
                  },
                  copyDrag(e) {
                    setIsDraging(true)
                    drag(e, { type: "text", text: color })
                  },
                  isBtm: i === (colors.length - 1),
                  isTop: i === 0,
                }}
              />
              <DropArea key={"drp" + i + 1} index={i + 1} setColors={setColors} setNowColor={setNowColor} dragTar={dragTar} />
            </>)}
            <div
              className={style["last"]}
              onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
              onDragEnter={() => setDragTar(colors.length)}
              onDrop={e => dropEvent(e, colors.length)}
            ><div /></div>
          </div>
          <div
            className={style["Input"]}
            style={{
              backgroundColor: nrmClr(nowColor) ? colormgr.bright(nrmClr(nowColor), .1) : ""
            }}
          >
            <ColorBar
              index={-1}
              color={nrmClr(nowColor)}
              value={nowColor}
              isDraging={isDraging}
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
                        case "fav": {
                          setColors(favList)
                          return clear();
                        }
                        case "gay": {
                          setColors(gayList)
                          return clear();
                        }
                        case "tcfti": {
                          setTcftiMenu(true)
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
                              setTcftiMenu(true)
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
                copy(e) {
                  if (e.altKey) {
                    navigator.clipboard.writeText(JSON.stringify(colors, null, 2))
                  } else {
                    navigator.clipboard.writeText(JSON.stringify(colors))
                  }
                },
                onDrag(e) {
                  setIsDraging(true)
                  drag(e, { type: "newColor", color: nowColor, })
                },
                copyDrag(e) {
                  setIsDraging(true)
                  if (e.altKey) {
                    drag(e, { type: "text", text: JSON.stringify(colors, null, 2) })
                  } else {
                    drag(e, { type: "text", text: JSON.stringify(colors) })
                  }
                },
              }}
            />
          </div>
        </div>

        <div className={style["Copy"]}>
          {colors.map((clr, i) => <div
            key={i}
            className={style["color"]}
            draggable={true}
            onDragStart={e => drag(e, { type: "text", text: clr })}
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