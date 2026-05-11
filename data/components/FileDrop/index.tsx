import type { NextPage } from 'next';
import { useEffect, useState, ReactNode } from 'react';
import style from "./style.module.scss";
import { ClipLineSpace } from "@/data/components/KiloDown"
import useLocalStorage from '@/data/module/use/LocalStorage';
import FileDropCfg, { CfgType } from '@/data/other/DefaultConfig/components/FileDrop';

export interface FileDropProp {
  FDID?: string
  onlyOneFile?: boolean,
  onEvent: (Files: Array<File | null>) => void,
  cfg?: CfgType
  _DEBUG?: {
    openit?: boolean
  }
}

const FileDrop: NextPage<FileDropProp> = (prop) => {
  const [fileCount, SetFileCount] = useState<number>(0)

  const defaultTitle = (<>好欸 是檔案欸<br />可以吃嗎?<br />OuO</>)
  const [title, SetTitle] = useState<ReactNode>(defaultTitle)

  const [dropevent, SetDropevent] = useState<boolean>(true)

  const [cfg, setCfg] = useLocalStorage(
    "components/FileDrop",
    FileDropCfg,
  )

  const [DisplayCount, setDisplayCount] = useState<boolean>(true)
  const [DisplayTips, setDisplayTips] = useState<boolean>(true)
  const [BackdropBlur, setBackdropBlur] = useState<boolean>(false)

  useEffect(() => {
    if (prop.cfg) {
      setCfg(prop.cfg)
    }
  }, [prop.cfg])

  useEffect(() => {
    setDisplayCount(cfg.DisplayCount)
    setDisplayTips(cfg.DisplayTips)
    setBackdropBlur(cfg.BackdropBlur)
  }, [cfg])

  useEffect(() => {
    const dropEffect = document.getElementById(`FD_${prop.FDID ?? "FilDrp"}`)! as HTMLDivElement;

    if (prop._DEBUG?.openit !== undefined) {
      if (prop._DEBUG?.openit)
        dropEffect.classList.add(style["show"])
      else
        dropEffect.classList.remove(style["show"])
    };

    const keyevent = (e: KeyboardEvent) => {
      SetDropevent(!e.shiftKey)
    }

    const dragover = (e: DragEvent) => {
      if (prop._DEBUG?.openit !== undefined) return;
      e.preventDefault();
      const Files_ = e!.dataTransfer!.items;

      if (Files_.length !== 0) {
        if ((Files_[0].kind ?? "") === 'file') {
          if (prop.onlyOneFile) {
            SetTitle(defaultTitle)
          } else {
            if (Files_.length < 10) {
              SetTitle(defaultTitle)
            } else if (Files_.length < 100) {
              SetTitle(<>好多檔案哦<br />我吃的完嗎<br />OwO</>)
            } else if (Files_.length < 1000) {
              SetTitle(<>檔案太多了<br />我吃會吃不下欸</>)
            } else {
              SetTitle(<>檔案多到可以慢慢吃<br />然後撐一年</>)
            }
            SetFileCount(Files_.length)
          }
          dropEffect.classList.add(style["show"])

          return Files_[0].getAsFile()
        }
      }

    }

    const dragleave = (e: DragEvent) => {
      if (prop._DEBUG?.openit !== undefined) return;
      if (dropevent) {
        e.preventDefault();
      }
      dropEffect.classList.remove(style["show"])
      SetDropevent(true)
    }

    const drop = (e: DragEvent) => {
      if (prop._DEBUG?.openit !== undefined) return;
      if (dropevent) {
        e.preventDefault();
        const Files = e!.dataTransfer!.items;
        const FileArray: Array<File | null> = []

        if (Files) {
          if (prop.onlyOneFile) {
            FileArray.push(Files[0].getAsFile())
          } else {
            for (let i = 0; i < Files.length; i++) {
              const File = Files[i];
              FileArray.push(File.getAsFile())
            }
          }
        }
        prop.onEvent(FileArray)
      }
      dropEffect.classList.remove(style["show"])
    }

    document.addEventListener("keydown", keyevent);
    document.addEventListener("keyup", keyevent);

    document.addEventListener("dragover", dragover)
    dropEffect.addEventListener("dragleave", dragleave);
    dropEffect.addEventListener("drop", drop)

    return () => {
      document.removeEventListener("keydown", keyevent);
      document.removeEventListener("keyup", keyevent);

      document.removeEventListener("dragover", dragover);
      dropEffect.removeEventListener("dragleave", dragleave);
      dropEffect.removeEventListener("drop", drop)
    }
  }, [prop._DEBUG?.openit])

  return (
    <div id={`FD_${prop.FDID ?? "FilDrp"}`} className={style["DropEffect"]} style={{ backdropFilter: BackdropBlur ? "" : "none" }}>
      <div className={style["border"]} />
      <div className={style["info"]}>
        <div className={style["text"]}>
          {dropevent ? title : <>沒得吃了<br />QwQ</>}
          <ClipLineSpace />
          <div className={style["file"]}>
            {dropevent ?
              <>
                {
                  DisplayCount ?
                    <>
                      {prop.onlyOneFile ?
                        <div>我們這邊只接受喂食一個檔案哦owo</div>
                        :
                        <div>你手上總共有<span className={style["file"]}>{fileCount}</span>個檔案</div>
                      }
                    </>
                    : ""
                }
                {
                  DisplayTips ?
                    <div>{"如果你按住shift丟檔案的話 會取消掉吞檔案這個流程哦"}</div>
                    : ""
                }
              </>
              :
              <div>{DisplayTips ? "將會取消吞檔案的流程 直接使用瀏覽器的事件偵測" : ""}</div>
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default FileDrop