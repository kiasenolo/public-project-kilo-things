import type { NextPage } from 'next';
import Link from 'next/link';
import { CSSProperties, ReactNode, useEffect, useRef } from 'react';
import style from './style.module.scss';
import ReactMarkdown from 'react-markdown';
import MDOptions from "./MDOptions"
import CustomMarkdown, { CorrectionSettings, OtherSetting } from '../CustomMarkdown';
import Background from '../Background';
import { settingForKILO } from '../Background';

export interface TitleType {
  text: string
  hoverTips: string
}

export interface ButtonType {
  hoverTips: string
  href: string
  type: "link" | "a"
}

export interface FrameProps {
  children: ReactNode
  type: "div" | "md"
  button: ButtonType
  title: TitleType
  style?: CSSProperties
  backgroundImage?: string
  ctrlShiftHide?: boolean
  ignoreHideContent?: boolean
  nonBackButton?: boolean
  settingForKILO?: settingForKILO
  settings?: OtherSetting
  correction?: CorrectionSettings
}

const ScrollFrame: NextPage<FrameProps> = (props: FrameProps) => {
  const ContentRef = useRef<HTMLDivElement>(null)
  const BarRef = useRef<HTMLDivElement>(null)
  const RootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!(props.ctrlShiftHide ?? false)) return;

    const keyevent = (e: KeyboardEvent) => {
      if (!props.ignoreHideContent) {
        ContentRef.current?.classList.toggle(style["blur"], e.shiftKey && e.ctrlKey)
      }
      BarRef.current?.classList.toggle(style["blur"], e.shiftKey && e.ctrlKey)
      RootRef.current?.classList.toggle(style["blur"], e.shiftKey && e.ctrlKey)
    }

    document.addEventListener("keydown", keyevent)
    document.addEventListener("keyup", keyevent)

    return () => {
      document.removeEventListener("keydown", keyevent)
      document.removeEventListener("keyup", keyevent)
    }
  })

  return (
    <div className={style["root"]} ref={RootRef}>
      <Background className={style["background"]} src={props.backgroundImage} settingForKILO={props.settingForKILO} />
      {
        props.nonBackButton ?
          <div className={style["bar"]} Non-Back-Button="" ref={BarRef}>
            <div>
              <div className={style.title}>
                <div hover-tips={props.title.hoverTips}>{props.title.text}</div>
              </div>
            </div>
          </div>
          :
          <div className={style["bar"]} ref={BarRef}>
            <div>
              {(() => {
                if (props.button.type === "link") {
                  return <Link href={props.button.href} legacyBehavior>
                    <a className={style.link} hover-tips={props.button.hoverTips}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill='#fff' height="40" width="40"><path d="m22.375 29-8.083-8.042q-.209-.25-.292-.479-.083-.229-.083-.521 0-.25.083-.5t.292-.458l8.083-8.083q.417-.417 1-.417t1 .417q.375.416.375 1 0 .583-.417 1l-7.041 7.041 7.083 7.084q.375.416.375.979 0 .562-.375.979-.417.417-1.021.417-.604 0-.979-.417Z" /></svg>
                    </a>
                  </Link>
                } else {
                  return <a href={props.button.href} className={style.link} hover-tips={props.button.hoverTips}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill='#fff' height="40" width="40"><path d="m22.375 29-8.083-8.042q-.209-.25-.292-.479-.083-.229-.083-.521 0-.25.083-.5t.292-.458l8.083-8.083q.417-.417 1-.417t1 .417q.375.416.375 1 0 .583-.417 1l-7.041 7.041 7.083 7.084q.375.416.375.979 0 .562-.375.979-.417.417-1.021.417-.604 0-.979-.417Z" /></svg>
                  </a>
                }
              })()}
              <div className={style.title}>
                <div hover-tips={props.title.hoverTips}>{props.title.text}</div>
              </div>
            </div>
          </div>
      }

      <div className={style["content"]} ref={ContentRef}>
        {(() => {
          const defuletProps = {
            className: style["main"]
          }
          if (props.type === "div") {
            return <div {...defuletProps} style={props.style} is-div="">
              {props.children}
            </div>
          } else {
            return <div {...defuletProps} style={props.style}>
              <CustomMarkdown correction={props.correction} settings={props.settings} input={props.children as string} />
            </div>
          }
        })()}
      </div>
    </div>
  );
}
export default ScrollFrame;