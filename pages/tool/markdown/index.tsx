import HeadSetting from "@/data/components/HeadSetting"
import functions from "@/data/module/functions"
import useLocalStorage from "@/data/module/use/LocalStorage"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toolsColor } from ".."
import FileDrop from "@/data/components/FileDrop"
import style from "./style.module.scss"
import ReactMarkdown from "react-markdown"
import CustomMarkdown from "@/data/components/CustomMarkdown"
import Monaco, { OnMount } from '@monaco-editor/react'
import clsx from "clsx"
import Link from "next/link"
import { defText } from "./defText"
import { Position, Selection } from "monaco-editor"
import { cloneDeep } from "lodash"

type MarkdownProp = {
  type?: "normal" | "kilo"
}

type EditorStatus = {
  scroll?: {
    scrollLeft: number;
    scrollTop: number;
  };
  selections?: Selection[];
};

export function Markdown({ type = "normal" }: MarkdownProp) {
  const [storeContent, setStoreContent] = useLocalStorage(
    type === "normal" ? 'tool/markdown/content' : 'tool/markdown-kilo/content',
    "",
  )

  const [editerStatus, setEditerStatus] = useLocalStorage<EditorStatus | undefined>(
    type === "normal" ? 'tool/markdown/editorStatus' : 'tool/markdown-kilo/editorStatus',
    undefined
  );

  const [storeScrollPos, setStoreScrollPos] = useLocalStorage<[number, number]>(
    type === "normal" ? 'tool/markdown/scrollPos' : 'tool/markdown-kilo/scrollPos',
    [0, 0]
  )

  const [storeSplitRatio, setStoreSplitRatio] = useLocalStorage<number>(
    type === "normal" ? 'tool/markdown/splitRatio' : 'tool/markdown-kilo/splitRatio',
    50
  );
  const [splitRatio, setSplitRatio] = useState<number>(50);

  useEffect(() => {
    if (storeSplitRatio !== undefined) {
      setSplitRatio(storeSplitRatio);
    }
  }, [storeSplitRatio]);

  useEffect(() => {
    const timer = setTimeout(() => setStoreSplitRatio(splitRatio), 500);
    return () => clearTimeout(timer);
  }, [splitRatio]);

  const [scrollPos, setScrollPos] = useState<[number, number]>([0, 0])
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [displayImport, setDisplayImport] = useState(false);
  const [displaySave, setDisplaySave] = useState(false);

  const viewRef = useRef<HTMLDivElement | null>(null);

  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const positionRestored = useRef(false);
  const editerStatusRef = useRef<EditorStatus | null>(editerStatus)

  const isResizing = useRef(false);
  const [isResizi, setIsResizing] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: any) => {
    e.preventDefault();
    isResizing.current = true;
    setIsResizing(true)
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current || !mainRef.current) return;
      e.preventDefault();
      const rect = mainRef.current.getBoundingClientRect();
      const ratio = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitRatio(Math.min(Math.max(ratio, 20), 80));
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      setIsResizing(false)
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleEditorDidMount: OnMount = (editor, monaco) => {

    editorRef.current = editor;

    editor.focus()

    editor.onDidScrollChange((e) => {
      if (editerStatusRef.current)
        editerStatusRef.current.scroll = { scrollLeft: e.scrollLeft, scrollTop: e.scrollTop }
      else
        editerStatusRef.current = { scroll: { scrollLeft: e.scrollLeft, scrollTop: e.scrollTop } };

      setEditerStatus(editerStatusRef.current);
    });

    editor.onDidChangeCursorSelection(() => {
      const selections = editor.getSelections();
      if (!selections) return
      if (editerStatusRef.current)
        editerStatusRef.current.selections = selections
      else
        editerStatusRef.current = { selections: selections }

      setEditerStatus(editerStatusRef.current);
    });
  };

  const viewScrollRestored = useRef(false);

  useEffect(() => {
    if (viewScrollRestored.current) return;
    if (!content || !viewRef.current) return;

    viewScrollRestored.current = true;

    let raf2: number;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        viewRef.current?.scroll({
          left: storeScrollPos[0],
          top: storeScrollPos[1],
          behavior: "instant",
        });
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [content]);

  useEffect(() => {
    const timer = setTimeout(() => setStoreContent(content), 500);
    return () => clearTimeout(timer);
  }, [content]);

  useEffect(() => {
    const timer = setTimeout(() => setStoreScrollPos(scrollPos), 500);
    return () => clearTimeout(timer);
  }, [scrollPos]);

  useEffect(() => {
    if (positionRestored.current) return;
    if (!editorRef.current || !editerStatus || !content) return;

    positionRestored.current = true;
    const editor = editorRef.current;

    const ani = requestAnimationFrame(() => {
      if (editerStatus.selections?.length) {
        editor.setSelections(editerStatus.selections);
        editor.revealPositionInCenter(
          editerStatus.selections[editerStatus.selections.length - 1].getPosition()
        );
      }
      if (editerStatus.scroll) {
        editor.setScrollTop(editerStatus.scroll.scrollTop);
        editor.setScrollLeft(editerStatus.scroll.scrollLeft);
      }
    });

    return () => {
      cancelAnimationFrame(ani)
    }
  }, [content, editerStatus]);

  useEffect(() => {
    const el = viewRef.current;
    if (!el) return;

    const handler = () => {
      setScrollPos([el.scrollLeft, el.scrollTop]);
    };

    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, []);

  const temText = useRef("")
  const fileNameInp = useRef<HTMLInputElement | null>(null)

  const saveFile = useCallback(() => {
    functions.download(content, `${fileName || "untitled"}.md`)
    setDisplaySave(false)
  }, [content, fileName])

  const ImportFile = useCallback(() => {
    setContent(temText.current)
    temText.current = "";
    setDisplayImport(false)
  }, [])

  const textList = useMemo(() => [
    ...defText.all,
    ...(type === "kilo" ? defText.kilo : defText.nor),
  ].map(t => t.join("\n")).map(t => type === "kilo" ? t : t.replaceAll("\n", "  \n")), [type])

  useEffect(() => {
    if (storeContent) setContent(storeContent)
    else setContent(functions.randomChoose(textList)!);
  }, [textList]);

  useEffect(() => {
    const keyEvent = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === "KeyS") {
        e.preventDefault();
        if (e.shiftKey) {
          if (displaySave) {
            saveFile()
            fileNameInp.current?.blur()
          } else {
            setDisplaySave(true)
            fileNameInp.current?.focus()
          }
        } else {
          setStoreContent(content)
        }
      }

      if (e.key === "Enter") {
        if (displaySave) {
          saveFile()
          fileNameInp.current?.blur()
        }
        if (displayImport) {
          ImportFile()
        }
      }
      if (e.code === "Escape") {
        setDisplaySave(false)
        setDisplayImport(false)
        fileNameInp.current?.blur()
      }
    }

    document.addEventListener("keydown", keyEvent)
    return () => {
      document.removeEventListener("keydown", keyEvent)
    }
  }, [displaySave, displayImport, content])

  return (<>
    <HeadSetting title='Markdown預覽' ogp={{
      title: type === "kilo" ? "Markdown預覽 KILO Ver." : "Markdown預覽",
      description: type === "kilo" ? "預覽markdown的神奇小東西 但全都是我的元件" : "預覽markdown的神奇小東西",
      color: toolsColor,
    }} />
    <FileDrop onEvent={(e) => {
      const file = e[0]
      if (file) {
        functions.readFile(file,
          (content) => {
            temText.current = content?.toString() || ""
            setDisplayImport(true)
          }
        );

        setFileName(file.name.slice(0, -3));
      }
    }} onlyOneFile={true} />

    <div className={style["Frame"]}>
      <div className={clsx(style["Save"], displaySave && style["show"])}>
        <div className={style["Window"]}>
          <div className={style["main"]}>
            {"將我寫的這個東西另存爲"}<input ref={fileNameInp} placeholder='無標題' type="text" id='FileName' />{".md"}
          </div>
          <div className={style["buttons"]}>
            <button onClick={saveFile} className={style["ok"]}>{"保存！ [ Enter ]"}</button>
            <button onClick={_ => {
              setDisplaySave(false)
              fileNameInp.current?.blur()
            }} className={style["close"]}>{"先等等.... [ Esc ]"}</button>
          </div>
        </div>
      </div>

      <div className={clsx(style["Import"], displayImport && style["show"])}>
        <div className={style["Window"]}>
          <div className={style["main"]}>
            {"你確定要直接覆寫你現在還沒保存的東西嗎"}
          </div>
          <div className={style["buttons"]}>
            <button onClick={ImportFile} className={style["ok"]}>{"沒戳！ [ Enter ]"}</button>
            <button onClick={_ => setDisplayImport(false)} className={style["close"]}>{"修但几勒！ { 等一下！ } [ Esc ]"}</button>
          </div>
        </div>
      </div>

      <div className={style["Edit"]} ref={mainRef}>
        <div className={style["title"]}>
          <div className={style["return"]} hover-tips='<=\\ 這看起來超酷的 對吧？ [ /tool ]'>
            <Link href={"./"}>
              <svg xmlns="http://www.w3.org/2000/svg" fill='#fff' height="40" width="40"><path d="m22.375 29-8.083-8.042q-.209-.25-.292-.479-.083-.229-.083-.521 0-.25.083-.5t.292-.458l8.083-8.083q.417-.417 1-.417t1 .417q.375.416.375 1 0 .583-.417 1l-7.041 7.041 7.083 7.084q.375.416.375.979 0 .562-.375.979-.417.417-1.021.417-.604 0-.979-.417Z" /></svg>
            </Link>
          </div>

          <div className={style["title"]}>
            <div>
              {"Markdown預覽" + (type === "kilo" ? " [ KILO Ver. ]" : "")}
            </div>
          </div>
        </div>
        <div className={style["main"]} style={{
          gridTemplateColumns: `${splitRatio}fr 5px ${100 - splitRatio}fr`,
          transition: isResizi ? "0s" : undefined
        }}>
          <div className={style["in"]} id="inputArea">
            <Monaco
              className={style["editer"]}
              language="markdown"
              onMount={handleEditorDidMount}
              value={content}
              onChange={e => {
                setContent(e || "")
              }}
              theme='vs-dark'
              options={{
                fontSize: 20,
                mouseWheelZoom: true,
                wordWrap: "on",
                unicodeHighlight: {
                  ambiguousCharacters: false
                },
                accessibilityPageSize: 10,
                tabSize: 2,
                readOnly: (displaySave || displayImport),
              }}
            />
          </div>
          <div
            className={style["resizer"]}
            onMouseDown={handleMouseDown}
            onContextMenu={e => { e.preventDefault(); setSplitRatio(50); }}
            onDoubleClick={e => { e.preventDefault(); setSplitRatio(50); }}
          />
          <div className={style["out"]} id="output" ref={viewRef}>
            {type === "normal" ?
              <ReactMarkdown children={content} />
              :
              <CustomMarkdown input={content} />
            }
          </div>
        </div>
      </div>
    </div>
  </>)
}

export default () => <Markdown />
