import React, { useEffect, useState } from 'react'
import style from "./style.module.scss"
import KMS from "@/data/components/KiloDown"
import Return from '@/data/components/Return'
import HeadSetting from '@/data/components/HeadSetting'
import { toolsColor } from '..'

interface KeyType {
  ctrlKey: boolean
  altKey: boolean
  shiftKey: boolean
  metaKey: boolean
  key: string
  keyCode: number
  code: string
}

export default function Markdown() {
  const [bar, setBar] = useState<number>(0)
  const [count, setCount] = useState<number>(0)
  const [key, setKey] = useState<KeyType>()
  const [eyHistory, setKeyHistory] = useState<KeyType[]>([])
  const [eventLock, setEventLock] = useState<boolean>(false)

  useEffect(() => {

    document.onkeydown = (e) => {
      if (eventLock) {
        e.preventDefault()
      }

      setKey(e)
      if (bar >= 95) {
        setBar(0)
      } else {
        setBar(bar + 5)
      };

      setCount(count + 1)

      {
        const { ctrlKey, altKey, shiftKey, key, keyCode, code, metaKey } = e;
        const theKey: KeyType = { ctrlKey, altKey, shiftKey, metaKey, key, keyCode, code };
        setKey(theKey)
        setKeyHistory([theKey, ...eyHistory])
        if (ctrlKey && altKey && shiftKey && code === "Backspace") {
          if (eventLock) {
            setEventLock(false)
          } else {
            setEventLock(true)
          }
        }
      }
    }

    return () => {
      document.onkeydown = null
    }
  }, [eyHistory, eventLock, bar, key, count])

  return (
    <>
      <HeadSetting title={`按鍵資訊 | ${eventLock ? "已鎖定瀏覽器事件" : "未鎖定瀏覽器事件"}`} ogp={{
        title: "按鍵資訊",
        description: "寫網頁嘛 然後寫快捷鍵嘛 挺好",
        color: toolsColor,
      }} />
      <Return hide={true} tips='<=\\ 記不起來啊.... [ /tool ]' />
      <div id={style["Bar"]}>
        <div className={style["inner"]} style={{ clipPath: `polygon(0 0, ${bar}% 0, ${bar}% 100%, 0% 100%)` }}>
          <div className={style["eventLock2"]} style={{ letterSpacing: `${eventLock ? "10px" : "unset"}` }}>{eventLock ? <>Browser Events Locked</> : <>Browser Events Unlock</>}</div>
        </div>
        <div className={style["eventLock"]} style={{ letterSpacing: `${eventLock ? "10px" : "unset"}` }}>{eventLock ? <>Browser Events Locked</> : <>Browser Events Unlock</>}</div>
      </div>
      <div
        hover-tips={"Click To Copy"} id={style["Key"]}
        onClick={e => {
          if (key) {
            navigator.clipboard.writeText(key?.code)
          }
        }}
      >{key?.code || "Waiting For Press"}</div>
      <div id={style["Json"]}>
        {
          key ? <>{
            Object.entries(key).map(e => {
              let [key, value] = e

              switch (typeof value) {
                case 'string': {
                  value = `"${value}"`
                  break
                }
                default: {
                  value = `${value}`
                }
              }

              return (<>
                <span>
                  <KMS.CodeText
                    onClick={() => {
                      navigator.clipboard.writeText(key)
                    }}
                  >{key}</KMS.CodeText>
                  <KMS.ClipLineText />
                  <KMS.EmpText
                    onClick={() => {
                      navigator.clipboard.writeText(value)
                    }}
                  >{value}</KMS.EmpText>

                </span>
                <br />
              </>)
            })
          }</>
            : <></>
        }
      </div>
      <div id={style["Count"]}>
        <span>
          {count}
        </span>
      </div>
    </>
  )
}