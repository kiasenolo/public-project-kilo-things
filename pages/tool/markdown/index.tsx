import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import style from "./style.module.scss"
import functions from '@/data/module/functions';
import FileDrop from '@/data/components/FileDrop';
import HeadSetting from '@/data/components/HeadSetting';
import CustomMarkdown from '@/data/components/CustomMarkdown';
import Monaco from '@monaco-editor/react'
import useLocalStorage from '@/data/module/use/LocalStorage';
import ReactMarkdown from 'react-markdown';

const textList = [
  "講實話 Monaco的編輯器真的 當初那麽一用\n整個人爽了",
  "你可能不知道 但這個樣式套件 他叫KiloDown\n~~所以我可以給他做個KIASENOLO 然後箭頭向下的LOGO~~",
  "有時候 寫程式使我快樂",
  "抽象主義派程式設計師",
  "Monaco編輯器賽高！",
  "ReactMarkdown賽高！",
  "我要跟React的開發者結婚（？？？？？？",
  "啊....我叫KILO 不叫可樂 更不叫kero .w.\n不是哥 如果你真想中文的話 凱儸啊.....\n我很討厭別人叫我可樂 請基本的尊重一下",
  "你知道嗎 其實KOLENOSA在設定上 是帥大叔哦\n然後因爲我不知道我的正太音要叫什麽名字\n所以我就把KOSA這個名字用了下去\n~~KOSA被黑的最慘的一次~~",
  "你知道嗎 其實偶爾出門走走 也挺好的 你説....對吧owo?",
  "KIASENOLO x KOLENOSA",
  "Project KIASENOLO的主旨就是\n我爽awa",
  "是説這個隨機文字.....可能會有人覺得我在抄Minecraft......",
  "我有個朋友叫AD 他跟我説 有人給他取名叫交直電\nDC - 直流電\nAC - 交流電\n.......~~我怎麽記得是我取的~~",
]

const defaultText: string = ""

let nowContent = defaultText

let tmpText = ""

const ele = {
  save: function () {
    return document.getElementById(style["Save"])!
  },
  import: function () {
    return document.getElementById(style["Import"])!
  },
  fileName: function () {
    return document.getElementById("FileName")! as HTMLInputElement
  }
}

type MarkdownProp = {
  type: "normal" | "kilo"
}

export function Markdown({ type }: MarkdownProp) {

  const [ctn, chgCtn] = useLocalStorage<string>(
    type === "normal" ? 'tool/markdown:content' : 'tool/markdown-kilo:content',
    defaultText,
  );

  const [ingSaveKey, setSaveKeySta] = useState<boolean>(false);

  const saveSystem = {
    save: function () {
      ele.save().classList.add(style["show"])
      ele.fileName().focus()
    },
    no: function () {
      ele.save().classList.remove(style["show"])
    },
    yes: function () {
      functions.download(nowContent, `${ele.fileName().value || "untitled"}.md`)
      saveSystem.no()
    },
  }

  const importSystem = {
    import: function () {
      ele.import().classList.add(style["show"])
    },
    no: function () {
      ele.import().classList.remove(style["show"])
    },
    yes: function () {
      importSystem.no()
      chgCtn(tmpText)
    },
  }

  useEffect(() => {
    if (ctn === defaultText) {
      const randomInitialText = functions.randomChoose<string>(textList)!
      chgCtn(randomInitialText, { save: false });
    }

    document.onkeydown = (e) => {
      switch (e.key) {
        case 's': {
          if (e.ctrlKey) {
            e.preventDefault();
            if (ingSaveKey) return;
            if (ele.save().classList.contains(style["show"])) {
              saveSystem.yes()
            } else {
              saveSystem.save()
            }
          }

          break;
        }

        case 'Enter': {

          if (ele.save().classList.contains(style["show"])) {
            saveSystem.yes()
          }

          if (ele.import().classList.contains(style["show"])) {
            importSystem.yes()
          }

          break;
        }

        case 'Escape': {

          saveSystem.no()
          importSystem.no()

          break;
        }
      }
    }

    return () => {
      document.onkeydown = null
    }
  }, [])

  useEffect(() => {
    nowContent = ctn
  }, [ctn])

  return (
    <>
      <HeadSetting title='Markdown預覽' />
      <FileDrop onEvent={(e) => {
        const file = e[0]
        if (file) {
          functions.readFile(file,
            (content) => {
              tmpText = content?.toString() || "你確定裏面有寫東西嗎owo?"
              importSystem.import()
            }
          );

          (document.getElementById("FileName")! as HTMLInputElement).value = file.name.slice(0, -3);

          saveSystem.no()

        }
      }} onlyOneFile={true} />

      <div id={style["Save"]}>
        <div className={style["Window"]}>
          <div className={style["main"]}>
            {"將我寫的這個東西另存爲"}<input placeholder='無標題' type="text" id='FileName' />{".md"}
          </div>
          <div className={style["buttons"]}>
            <button onClick={saveSystem.yes} className={style["ok"]}>{"保存！ [ Enter ]"}</button>
            <button onClick={saveSystem.no} className={style["close"]}>{"先等等.... [ Esc ]"}</button>
          </div>
        </div>
      </div>

      <div id={style["Import"]}>
        <div className={style["Window"]}>
          <div className={style["main"]}>
            {"你確定要直接覆寫你現在還沒保存的東西嗎"}
          </div>
          <div className={style["buttons"]}>
            <button onClick={importSystem.yes} className={style["ok"]}>{"沒戳！ [ Enter ]"}</button>
            <button onClick={importSystem.no} className={style["close"]}>{"修但几勒！ { 等一下！ } [ Esc ]"}</button>
          </div>
        </div>
      </div>

      <div id={style["Frame"]}>
        <div className={style["title"]}>
          <div className={style["return"]} hover-tips='<=\\ 這看起來超酷的 對吧？ [ /tool ]'>
            <Link href={"./"}>
              <svg xmlns="http://www.w3.org/2000/svg" fill='#fff' height="40" width="40"><path d="m22.375 29-8.083-8.042q-.209-.25-.292-.479-.083-.229-.083-.521 0-.25.083-.5t.292-.458l8.083-8.083q.417-.417 1-.417t1 .417q.375.416.375 1 0 .583-.417 1l-7.041 7.041 7.083 7.084q.375.416.375.979 0 .562-.375.979-.417.417-1.021.417-.604 0-.979-.417Z" /></svg>
            </Link>
          </div>

          <div className={style["title"]}>
            <div>
              {"Markdown預覽"}
            </div>
          </div>

          <div className={style["ingnore"]}>
            <button className={ingSaveKey ? style["true"] : ""} onClick={() => setSaveKeySta(!ingSaveKey)}>
              {"忽略 Ctrl + S 快捷鍵"}
            </button>
          </div>
        </div>
        <div className={style["main"]}>
          <div className={style["in"]} id="inputArea">
            <Monaco
              className={style["editer"]}
              language="markdown"
              value={ctn}
              onChange={e => {
                chgCtn(e || "")
              }}
              theme='hc-black'
              options={{
                fontSize: 20,
                mouseWheelZoom: true,
                wordWrap: "on",
                unicodeHighlight: {
                  ambiguousCharacters: false
                },
                accessibilityPageSize: 10,
                tabSize: 2
              }}

            />
            <div className={style["filter"]} />
          </div>
          <div className={style["out"]} id="output">
            {type === "normal" ?
              <ReactMarkdown children={ctn} />
              :
              <CustomMarkdown input={ctn} />
            }
          </div>
        </div>
      </div>
    </>
  )
}

export default () => <Markdown type='normal' />