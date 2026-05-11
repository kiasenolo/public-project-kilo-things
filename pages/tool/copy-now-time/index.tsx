import React from 'react'
import style from "./style.module.scss"
import Return from '@/data/components/Return'

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
      <Return hide={true} />
      <div id={style['Frame']}>
        <div id='display' className={style['Text']}>
          <div className={style['Init']} onClick={ClickEvent}>{"Click Me"}</div>
        </div>
      </div>
    </>
  )
}