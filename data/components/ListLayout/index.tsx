import React, { useEffect, useState } from 'react'
import HeadSetting, { HeadSettingProps } from '@/data/components/HeadSetting'
import style from './style.module.scss'
import clsx from 'clsx'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import CustomMarkdown from '../CustomMarkdown'
import functions from '@/data/module/functions'

export interface ListItemData {
  href: string
  name: string
  info: string | string[]
}

interface LayoutConfig {
  title: string
  description: string
  fullInfo?: string[] | string,
  backBtn: {
    href: string
    hoverTips: string
  }
  headSetting?: HeadSettingProps
}

interface ListLayoutProps {
  items: ListItemData[]
  config: LayoutConfig
}

const ListLayout: React.FC<ListLayoutProps> = ({ items, config }) => {
  const [info, setInfo] = useState(false)

  useEffect(() => {
    const kd = (e: KeyboardEvent) => { if (e.code === "Escape") setInfo(false) }
    document.addEventListener("keydown", kd);
    return () => { document.removeEventListener("keydown", kd); }
  }, [])

  return (
    <>
      <HeadSetting title={config.title} {...config.headSetting} />

      {config.fullInfo && <div className={clsx(style["FullInfo"], info && style["display"])}>
        <button className={style["Button"]} onClick={() => setInfo(false)}>CLOSE INFO</button>
        <div className={style["Content"]}>
          <CustomMarkdown input={functions.str.arrToStr(config.fullInfo ?? "NONE")} />
        </div>
      </div>}

      <div className={clsx(style["ListMenu"], info && style["dim"])}>

        <div className={style["Title"]}>
          <Link href={config.backBtn.href} hover-tips={config.backBtn.hoverTips} className={style["button"]}>
            <div>BACK</div>
          </Link>
          <div className={style["text"]}>
            <span>{config.title}</span>
          </div>
          <button onClick={() => setInfo(true)} className={clsx(style["button"], !config.fullInfo && style["disab"])}>
            <div>INFO</div>
          </button>
        </div>

        <div className={style["List"]}>
          {items.map((e, i) => <div className={style["item"]} key={i}>

            <div className={style["info"]}>
              <Link href={e.href} className={style["name"]}>{e.name}</Link>
              <div className={style["info"]}>
                <CustomMarkdown input={functions.str.arrToStr(e.info)} />
              </div>
            </div>

            <div className={style["text"]}>
              <div>{e.name}</div>
            </div>

          </div>)}
        </div>

      </div>
    </>
  )
}

export default ListLayout