import React from 'react'
import style from "./style.module.scss"
import Return from '@/data/components/Return'
import HeadSetting from '@/data/components/HeadSetting'
import { toolsColor } from '..'

export default function Markdown() {

  const ClickEvent = () => {
    const timeDisplay = document.getElementById('display')!
    const nowTime = new Date().getTime()

    navigator.clipboard.writeText(`${nowTime}`)

    timeDisplay.innerHTML = ""

    const timeCode = document.createElement("div")

    timeCode.onclick = ClickEvent
    timeCode.classList.add(style['TimeCode'])
    timeCode.innerHTML = `${nowTime}`

    timeDisplay.appendChild(timeCode)
  }

  return (
    <>
      <HeadSetting title='複製目前時間碼' ogp={{
        title: "複製目前時間碼",
        description: "就....如題 你甚至不知道爲什麽這個東西需要存在",
        color: toolsColor,
      }} />
      <Return hide={true} />
      <div id={style['Frame']}>
        <div id='display' className={style['Text']}>
          <div className={style['Init']} onClick={ClickEvent}>{"Click Me"}</div>
        </div>
      </div>
    </>
  )
}