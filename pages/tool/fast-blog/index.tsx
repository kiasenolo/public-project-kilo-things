import useLocalStorage from '@/data/module/use/LocalStorage';
import { renderToString as RTS } from 'react-dom/server';
import style from "./style.module.scss"
import { useCallback, useEffect, useRef, useState } from 'react';
import { _appScale, _powerSaveingMode, _setAppScale, _setPowerSaveingMode, newInput, newInputCloseEvents } from '@/pages/_app';
import makeZip, { ZipStructure } from '@/data/module/functions/module/makeZip';
import functions from '@/data/module/functions';
import CustomMarkdown from '@/data/components/CustomMarkdown';
import KD from '@/data/components/KiloDown';
import Monaco from '@monaco-editor/react'
import HeadSetting from '@/data/components/HeadSetting';
import { languageList, lang, languageListType } from './langs/_languageList';

function toRandomText(input: string, language: string): string {
  const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const blacklistSet = new Set("!@#$%^&*()_+-=`\"'/.\r\n\\ []{}|<>~:;，。！？：；".split(""));

  const langSeed = language.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  let result = '';

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (blacklistSet.has(ch) || /^\s*$/.test(ch)) {
      result += ch;
      continue;
    }
    const idx = (ch.charCodeAt(0) + i + langSeed) % letters.length;
    result += letters[idx];
  }
  return result;
}

type blogInfoType = {
  folderName: string
  title: string
  tags: string[]
  dateCreate: number
  content: string
  ignore?: boolean
}

const scaleGear = [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150]

type settingType = {
  scale: number,
  language: languageListType,
  fancyMode: boolean,
  powerSavingMode: boolean,
  hideContent: boolean,
  readonly: boolean,
}

const defaultSetting: settingType = {
  scale: 100,
  language: "ZH-TW",
  fancyMode: false,
  powerSavingMode: false,
  hideContent: false,
  readonly: false,
}

type saveType = {
  blogList: blogInfoType[]
}

function doZip(blogs: blogInfoType[], filename?: string) {
  makeZip(
    blogs.map(e => ({
      type: 'folder',
      name: e.folderName || `blog-${e.dateCreate}`,
      children: [
        {
          type: 'file',
          name: "blog.md",
          content: e.content
        },
        {
          type: 'file',
          name: "info.json",
          content: JSON.stringify({
            title: e.title,
            ...(e.tags.length === 0 ? {} : { tags: e.tags }),
            dateCreate: e.dateCreate,
            ...(e.ignore === false || e.ignore === undefined ? {} : { ignore: e.ignore })
          }, null, 2)
        }
      ]
    })) as ZipStructure
  ).then(async e => {
    functions.download(e, (filename ?? "blogs") + ".zip")
  })
}

const dTitle = "FastBlog"

const defaultAppSetting = {
  scale: +_appScale,
  powersave: !!_powerSaveingMode
}

export default function () {
  const [mulitSelectMode, setMulit] = useState<boolean>(false)
  const [nowSelect, setNowSelect] = useState<number[]>([])

  const [editMode, setEditMode] = useState<boolean>(false)
  const [readFromInfo, setReadFromInfo] = useState<boolean>(false);

  const [tempBlog, setTempBlog] = useState<blogInfoType | null>(null);
  const [editCount, setEditCount] = useState<number>(0);

  const [reading, setReading] = useState<number>(0)
  const [info, setInfo] = useState<number>(0)
  const [nowEdit, setNowEdit] = useState<number>(0)
  const [newTagInput, setNewTagInput] = useState('');

  const [popUpDisplay, setPopUpDisplay] = useState<boolean>(false)

  const [infoStatus, setInfoStatus] = useState<boolean>(false)
  const [readerStatus, setReaderStatus] = useState<boolean>(false)
  const [settingStatus, setSettingStatus] = useState<boolean>(false)

  const [save, setSave] = useLocalStorage<saveType>("tool/fast-blog", {
    blogList: []
  })

  const [setting, setSetting] = useLocalStorage<settingType>("tool/fast-blog/setting", defaultSetting)

  const L = lang[setting.language];

  const isDragging = useRef<boolean>(false);
  const dragTargetState = useRef<boolean>(true);
  const lastTouchIndex = useRef<number | null>(null);

  const dragStartPos = useRef<{ x: number, y: number } | null>(null);
  const isDragConfirmed = useRef<boolean>(false);
  const isTouchAction = useRef<boolean>(false);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isDragging.current = false;
      lastTouchIndex.current = null;
      isDragConfirmed.current = false;
      dragStartPos.current = null;
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    }
  }, []);

  useEffect(() => {
    _setAppScale(setting.scale)
    _setPowerSaveingMode(setting.powerSavingMode)

    return () => {
      const { powersave, scale } = defaultAppSetting
      _setAppScale(scale)
      _setPowerSaveingMode(powersave)
    }
  }, [setting])

  const updateSelection = useCallback((index: number, shouldSelect: boolean) => {
    setNowSelect(prev => {
      const isSelected = prev.includes(index);
      if (shouldSelect && !isSelected) {
        return [...prev, index];
      } else if (!shouldSelect && isSelected) {
        return prev.filter(i => i !== index);
      }
      return prev;
    });
  }, []);

  const resetSelection = useCallback(() => {
    setMulit(false)
    setInfoStatus(false)
    setReaderStatus(false)
    setSettingStatus(false)
    setNowSelect([])
    isDragging.current = false;
  }, [popUpDisplay]);

  const doSave = useCallback((currentTemp: blogInfoType) => {
    if (setting.readonly) return;
    setSave(prv => {
      const newList = [...prv.blogList];
      if (newList[nowEdit] && newList[nowEdit].dateCreate === currentTemp.dateCreate) {
        newList[nowEdit] = currentTemp;
      } else {
        const realIndex = newList.findIndex(b => b.dateCreate === currentTemp.dateCreate);
        if (realIndex !== -1) {
          newList[realIndex] = currentTemp;
        }
      }
      return { ...prv, blogList: newList };
    });
    setEditCount(0);
  }, [nowEdit, setSave, setting]);

  const handleDelete = useCallback((indices: number[], isMultiSelect: boolean) => {
    if (setting.readonly) return;
    if (indices.length === 0) return;

    const wasInfoOpen = infoStatus;
    const targetInfoIndex = info;

    const targets = indices.map(i => save.blogList[i]).filter(Boolean);
    if (targets.length === 0) return;

    const currentLang = lang[setting.language];

    const title = isMultiSelect
      ? currentLang.window.message.delete.first.multi
      : currentLang.window.message.delete.first.single.replace("$1", targets[0].folderName);

    const messageHtml = RTS(
      <>
        <div style={{ marginBottom: "20px" }}>{title}</div>
        {targets.map((blog, idx) => (
          <div key={idx}>
            <div style={{ textAlign: "left", fontSize: "25px" }}>{`${blog.title}`}</div>
            <div style={{ textAlign: "left", fontSize: "20px", opacity: ".5", marginBottom: "10px" }}>
              {`${blog.folderName}`}
            </div>
          </div>
        ))}
      </>
    );

    setInfoStatus(false);

    newInput.message(
      messageHtml,
      [
        { name: currentLang.window.action.cancel, value: "" },
        { name: currentLang.action.blog.delete, value: "del", key: "Enter" }
      ],
      async (res) => {
        setPopUpDisplay(true)
        if (res === "del") {
          await functions.timeSleep(.3e3);
          newInput.message(currentLang.window.message.delete.next.message, [
            { name: currentLang.window.message.delete.next.nah, value: "" },
            { name: currentLang.window.message.delete.next.yap, value: "del", key: "Delete" }
          ],
            finalRes => {
              setPopUpDisplay(true)
              if (finalRes === "del") {
                setSave(prevItems => {
                  const updatedItems = prevItems.blogList.filter((_, i) => !indices.includes(i));
                  return { ...prevItems, blogList: updatedItems };
                });

                if (wasInfoOpen && !isMultiSelect) {
                  resetSelection();
                } else if (isMultiSelect) {
                  resetSelection();
                }

              } else {
                if (wasInfoOpen) setInfoStatus(true);
              }
            },
            () => { setPopUpDisplay(false); if (wasInfoOpen) setInfoStatus(true); }
          );
        } else {
          if (wasInfoOpen) setInfoStatus(true);
        }
      },
      () => { setPopUpDisplay(false); if (wasInfoOpen) setInfoStatus(true); }
    );
  }, [save.blogList, resetSelection, setSave, setting, infoStatus, info]);

  useEffect(() => {
    if (infoStatus && info >= save.blogList.length && save.blogList.length > 0) {
      setInfo(save.blogList.length - 1);
    } else if (infoStatus && save.blogList.length === 0) {
      setInfoStatus(false);
    }
  }, [save.blogList.length, info, infoStatus]);


  const handleExport = useCallback((indices: number[], mode: 'selected' | 'all' | 'single') => {
    if (mode === 'selected' && indices.length === 0) return;

    const targets = mode === 'all' ? save.blogList : indices.map(i => save.blogList[i]);
    const currentLang = lang[setting.language];

    let title = "";
    if (mode === 'all') {
      title = currentLang.window.message.export.all;
    } else if (mode === 'selected') {
      title = currentLang.window.message.export.selected;
    } else {
      title = currentLang.window.message.export.single.replace("$1", targets[0].folderName);
    }

    const showList = mode !== 'all';

    const messageHtml = RTS(
      <>
        <div style={{ marginBottom: "20px" }}>{title}</div>
        {showList && targets.map((blog, idx) => (
          <div key={idx}>
            <div style={{ textAlign: "left", fontSize: "25px" }}>{`${blog.title}`}</div>
            <div style={{ textAlign: "left", fontSize: "20px", opacity: ".5", marginBottom: "10px" }}>
              {`${blog.folderName}`}
            </div>
          </div>
        ))}
      </>
    );

    newInput.message(
      messageHtml,
      [
        { name: currentLang.window.action.cancel, value: "" },
        { name: currentLang.window.action.export, value: "exp", key: "Enter" }
      ],
      (res) => {
        setPopUpDisplay(true);
        if (res === "exp") {
          const fileName = mode === 'single' ? targets[0].folderName : undefined;
          doZip(targets, fileName);

          if (mode !== 'single') {
            resetSelection();
          }
        }
      }, () => { setPopUpDisplay(false); }
    );
  }, [save.blogList, resetSelection, setting]);

  const handleEditorDidMount = (editor: any) => {
  };

  const newBlog = useCallback(() => {
    if (setting.readonly) return;
    newInput.select(
      [
        {
          name: "[ 1 ] 空 [ 1 ]",
          value: "empty",
          key: "Digit1"
        },
        {
          name: "[ 2 ] 日常記錄 [ 2 ]",
          value: "life",
          key: "Digit2"
        },
        {
          name: "[ 3 ] 記錄 [ 3 ]",
          value: "log",
          key: "Digit3"
        },
        {
          name: "[ 4 ] 夢的日記 [ 4 ]",
          value: "dreamLog",
          key: "Digit4"
        },
        {
          name: "[ 5 ] voiceLabs申請 [ 5 ]",
          value: "voiceLabs",
          key: "Digit5"
        },
        {
          name: "[ 6 ] 介紹某些東西 [ 6 ]",
          value: "introduce",
          key: "Digit6"
        },
      ],
      (e) => {
        const nowDate = new Date().getTime()
        let tags: string[] = []
        let title: string = "無標題"
        let folderName = nowDate.toString()

        switch (e) {
          case "life": {
            title = "LifeLog#000 - 無標題";
            tags = ["LifeLog"];
            folderName = "LIFE-000_";
            break
          }
          case "log": {
            title = "記錄 - [ 無標題 ]";
            tags = ["Life"];
            folderName = "LOG-000";
            break
          }
          case "voiceLabs": {
            title = "voiceLabs申請 - 000";
            tags = ["voiceLabs"];
            folderName = "voiceLabs-Idea_000";
            break
          }
          case "dreamLog": {
            title = "夢的日記 - [ 無標題 ]";
            tags = ["DreamLog"];
            folderName = "DREAM_LOG-000";
            break
          }
          case "introduce": {
            title = "";
            tags = ["Introduce"];
            folderName = "Introduce_";
            break
          }
        }

        setSave(prv => {
          prv.blogList.unshift({
            folderName, title, tags, dateCreate: nowDate, content: "", ignore: false,
          })
          return prv
        })
        setNowEdit(0)
        setEditMode(true)
      }
    )
  }, [setSave, setting])

  useEffect(() => {
    if (editMode && save.blogList[nowEdit]) {
      setTempBlog(JSON.parse(JSON.stringify(save.blogList[nowEdit])));
      setEditCount(0);
    }
  }, [editMode, nowEdit]);

  useEffect(() => {
    if (editCount >= 10 && tempBlog) {
      doSave(tempBlog);
    }
  }, [editCount, tempBlog, doSave]);

  useEffect(() => {
    const keydown = (e: KeyboardEvent) => {
      if (newInputCloseEvents.length !== 0) return;

      const activeElement = document.activeElement;
      const isInputActive = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.getAttribute('contenteditable') === 'true'
      );

      if (e.code === "Escape") {
        e.preventDefault()
        if (popUpDisplay) return;

        setSettingStatus(false)

        if (nowSelect.length > 0) {
          setNowSelect([]);
        } else {
          resetSelection();
        }
        if (readFromInfo) {
          setReadFromInfo(false)
          setInfoStatus(true)
          setInfo(reading)
        }
        return;
      }

      if (isInputActive && !e.ctrlKey && !e.altKey) {
        return;
      }

      if (infoStatus) {
        switch (e.code) {
          case "ArrowLeft":
            setInfo(pre => { const c = save.blogList.length; return ((pre - 1) % c + c) % c; });
            break;
          case "ArrowRight":
            setInfo(pre => { const c = save.blogList.length; return ((pre + 1) % c + c) % c; });
            break;
          case "KeyE":
            if (setting.readonly) break;
            setEditMode(true);
            setNowEdit(info);
            setInfoStatus(false);
            setNewTagInput('');
            break;
          case "KeyR":
            if (setting.readonly) break;
            setReaderStatus(true);
            setReading(info);
            setInfoStatus(false);
            setNewTagInput('');
            break;
          case "Delete":
            handleDelete([info], false);
            break;
        }
      }

      if (readerStatus) {
        switch (e.code) {
          case "ArrowLeft":
            setReading(pre => { const c = save.blogList.length; return ((pre - 1) % c + c) % c; })
            break;
          case "ArrowRight":
            setReading(pre => { const c = save.blogList.length; return ((pre + 1) % c + c) % c; })
            break;
          case "KeyE":
            if (setting.readonly) break;
            setReaderStatus(false)
            setEditMode(true);
            setNowEdit(reading);
            setInfoStatus(false);
            setNewTagInput('');
            break;
          case "Delete":
            if (!setting.readonly) handleDelete([reading], false);
            break;
        }
      }


      if (mulitSelectMode) {
        switch (e.code) {
          case "KeyE":
            if (nowSelect.length > 0) handleExport(nowSelect, 'selected');
            break;

          case "Delete":
            if (nowSelect.length > 0) handleDelete(nowSelect, true);
            break;
        }
      }

      if (e.ctrlKey) {
        switch (e.code) {
          case "KeyQ":
            e.preventDefault()
            if (editMode && tempBlog) doSave(tempBlog);
            setEditMode(false)
            resetSelection();
            break
          case "KeyS":
            e.preventDefault()
            if (editMode && tempBlog) doSave(tempBlog);
            break
        }
      }

      if (e.altKey) {
        if (editMode || infoStatus) return;
        switch (e.code) {
          case "KeyE":
            handleExport([], 'all');
            break;
          case "KeyS":
            setMulit(prev => !prev);
            if (mulitSelectMode) setNowSelect([]);
            break;
          case "KeyN":
            e.preventDefault();
            newBlog();
            break;
        }
      }
    }

    document.addEventListener("keydown", keydown)
    return () => document.removeEventListener("keydown", keydown)
  }, [
    infoStatus, mulitSelectMode, editMode, tempBlog,
    save.blogList, nowSelect, info, reading, readerStatus,
    handleDelete, handleExport, doSave, newBlog, resetSelection,
    popUpDisplay, readFromInfo, setting
  ])

  const hasBlogs = save.blogList.length > 0;
  const randomStringLange = setting.powerSavingMode ? "NONE" : setting.language

  const Layer = {
    List: <div className={style["List"]}>
      <div className={[style["innerFrame"], mulitSelectMode ? style["selectMode"] : ""].join(" ")} overflow-bar-none="">
        {save.blogList.map((blog, i) => {
          return (<div
            className={[style["blog"], nowSelect.includes(i) ? style["selecet"] : ""].join(" ")}
            key={i}
            data-index={i}
            style={{
              userSelect: mulitSelectMode ? 'none' : 'auto',
              touchAction: mulitSelectMode ? 'none' : 'auto'
            }}

            onMouseDown={() => {
              if (mulitSelectMode) {
                isDragging.current = true;
                isTouchAction.current = false;

                const isCurrentlySelected = nowSelect.includes(i);
                dragTargetState.current = !isCurrentlySelected;
                updateSelection(i, dragTargetState.current);
              }
            }}

            onMouseEnter={() => {
              if (mulitSelectMode && isDragging.current) {
                updateSelection(i, dragTargetState.current);
              }
            }}

            onTouchStart={(e) => {
              if (mulitSelectMode) {
                isDragging.current = true;
                lastTouchIndex.current = i;
                isTouchAction.current = true;

                const touch = e.touches[0];
                dragStartPos.current = { x: touch.clientX, y: touch.clientY };
                isDragConfirmed.current = false;

                const isCurrentlySelected = nowSelect.includes(i);
                dragTargetState.current = !isCurrentlySelected;
              }
            }}

            onTouchMove={(e) => {
              if (!mulitSelectMode || !isDragging.current) return;

              const touch = e.touches[0];

              if (!isDragConfirmed.current && dragStartPos.current) {
                const deltaX = touch.clientX - dragStartPos.current.x;
                const deltaY = touch.clientY - dragStartPos.current.y;

                if (Math.hypot(deltaX, deltaY) > 10) {
                  isDragConfirmed.current = true;
                }
              }

              if (isDragConfirmed.current) {
                if (e.cancelable) e.preventDefault();

                const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
                const blogItem = targetElement?.closest('[data-index]');
                if (blogItem) {
                  const indexStr = blogItem.getAttribute('data-index');
                  if (indexStr !== null) {
                    const index = parseInt(indexStr, 10);
                    if (lastTouchIndex.current !== index) {
                      updateSelection(index, dragTargetState.current);
                      lastTouchIndex.current = index;
                    }
                  }
                }
              }
            }}

            onTouchEnd={() => {
              isDragging.current = false;
              lastTouchIndex.current = null;
              dragStartPos.current = null;
              isDragConfirmed.current = false;
            }}

            onClick={() => {
              if (mulitSelectMode) {
                if (!isTouchAction.current) return;
                if (!isDragConfirmed.current) updateSelection(i, !nowSelect.includes(i));
              }
              else {
                setInfoStatus(true)
                setInfo(i)
                setEditMode(false)
              }
            }}

            onContextMenu={(e) => {
              if (mulitSelectMode) return;
              e.preventDefault()
              resetSelection()
              if (setting.readonly) {
                setReaderStatus(true)
                setReading(i)
              } else {
                setEditMode(true);
                setNowEdit(i);
              }
            }}
          >
            <div className={style["index"]}><span>{"#"}{save.blogList.length - i}</span></div>
            {setting.powerSavingMode ? <></> : <div className={[style["index"], style["line"]].join(" ")}><span>{"#"}{save.blogList.length - i}</span></div>}
            <div className={style["info"]}>
              <div className={style["frame"]}>
                <div className={style["name"]}>{setting.hideContent ? toRandomText(blog.title, randomStringLange) : blog.title}</div>
                <div className={style["tags"]}>
                  {blog.tags.map((tag, tIdx) => <span className={style["tag"]} key={tIdx}>{setting.hideContent ? toRandomText(tag, randomStringLange) : tag}</span>)}
                </div>
                <div className={style["date"]}>{new Date(blog.dateCreate).toLocaleString()}</div>
                <div className={style["folder"]}>{"/" + (setting.hideContent ? toRandomText(blog.folderName, randomStringLange) : blog.folderName)}</div>
              </div>
            </div>
          </div>)
        })}
      </div>
    </div>,

    Buttons: <div className={style["Buttons"]}>
      <div className={style["Group"]}>
        {setting.readonly ? <></> : <button
          className={mulitSelectMode ? style["actv"] : ""}
          onClick={() => {
            if (mulitSelectMode) resetSelection();
            else setMulit(true);
          }}
        >
          {mulitSelectMode ? nowSelect.length === 0 ? L.action.selectMode.none : L.action.selectMode.select.replace("$1", nowSelect.length.toString()) : L.action.blog.select}
        </button>}

        <button
          disabled={mulitSelectMode && nowSelect.length === 0}
          onClick={() => {
            if (mulitSelectMode) handleExport(nowSelect, "selected");
            else handleExport([], 'all');
          }}
        >{L.action.blog.export}</button>

        <button
          disabled={mulitSelectMode && nowSelect.length === 0}
          style={{ display: mulitSelectMode ? "" : "none" }}
          onClick={() => handleDelete(nowSelect, true)}
        >{L.action.blog.delete}</button>

        {setting.readonly ? <></> : <button
          disabled={mulitSelectMode}
          style={{ marginLeft: "auto" }}
          onClick={newBlog}
        >{L.action.blog.openNew}</button>}

      </div>

      <div className={style["Group"]} style={{ alignItems: "flex-end" }}>
        <button
          disabled={mulitSelectMode}
          style={{ marginLeft: "auto" }}
          onClick={() => setSettingStatus(true)}
        >{L.action.blog.setting}</button>
        <button
          disabled={mulitSelectMode}
          onClick={() => functions.fullscreen.toggle()}
        >{L.action.blog.toggleFullScreen}</button>
      </div>

    </div>,

    Setting: <div className={[style["Setting"], !settingStatus ? style["hide"] : ""].join(" ")}>

      <div className={style["innerContent"]}>
        <div className={style["content"]}>
          <div className={style["innerFrame"]} overflow-bar-none="">

            {/* language */}
            <div className={style["unit"]}>
              <KD.Title>{L.setting.title.language}</KD.Title>
              <KD.Thirdtitle>{L.setting.info.language}</KD.Thirdtitle>
              <div className={style["list"]}>
                {languageList.map(lng => <button
                  key={lng}
                  className={lng === setting.language ? style["actv"] : ""}
                  onClick={() => {
                    setSetting(prev => ({
                      ...prev,
                      language: lng
                    }))
                  }}
                >{lang[lng].name}</button>)}
              </div>
            </div>

            {/* scale */}
            <div className={style["unit"]}>
              <KD.Title>{L.setting.title.scale}</KD.Title>
              <KD.Thirdtitle>{L.setting.info.scale}</KD.Thirdtitle>
              <div className={style["list"]}>
                {scaleGear.map(s => <button
                  key={s}
                  className={s === setting.scale ? style["actv"] : ""}
                  onClick={() => {
                    setSetting(prev => ({
                      ...prev,
                      scale: s
                    }))
                  }}
                >{s + "%"}</button>)}
              </div>
            </div>

            {/* powerSavingMode */}
            <div className={style["unit"]}>
              <KD.Title>{L.setting.title.powerSavingMode}</KD.Title>
              <KD.Thirdtitle>{L.setting.info.powerSavingMode}</KD.Thirdtitle>
              <div className={style["list"]}>
                <button
                  className={setting.powerSavingMode ? style["actv"] : ""}
                  onClick={() => {
                    setSetting(prev => ({
                      ...prev,
                      powerSavingMode: true
                    }))
                  }}
                >{L.setting.buttonsText.default.enable}</button>

                <button
                  className={!setting.powerSavingMode ? style["actv"] : ""}
                  onClick={() => {
                    setSetting(prev => ({
                      ...prev,
                      powerSavingMode: false
                    }))
                  }}
                >{L.setting.buttonsText.default.disable}</button>
              </div>
            </div>

            {/* fancyMode */}
            <div className={style["unit"]} aria-disabled={setting.powerSavingMode}>
              <KD.Title>{L.setting.title.fancyMode}</KD.Title>
              <KD.Thirdtitle>{L.setting.info.fancyMode}</KD.Thirdtitle>
              <div className={style["list"]}>
                <button
                  className={setting.fancyMode ? style["actv"] : ""}
                  onClick={() => {
                    setSetting(prev => ({
                      ...prev,
                      fancyMode: true
                    }))
                  }}
                >{L.setting.buttonsText.default.enable}</button>

                <button
                  className={!setting.fancyMode ? style["actv"] : ""}
                  onClick={() => {
                    setSetting(prev => ({
                      ...prev,
                      fancyMode: false
                    }))
                  }}
                >{L.setting.buttonsText.default.disable}</button>
              </div>
            </div>

            {/* hideContent */}
            <div className={style["unit"]}>
              <KD.Title>{L.setting.title.hideContent}</KD.Title>
              <KD.Thirdtitle>{L.setting.info.hideContent}</KD.Thirdtitle>
              <KD.Thirdtitle>{L.setting.info.hideContent1}</KD.Thirdtitle>
              <div className={style["list"]}>
                <button
                  className={setting.hideContent ? style["actv"] : ""}
                  onClick={() => {
                    setSetting(prev => ({
                      ...prev,
                      hideContent: true
                    }))
                  }}
                >{L.setting.buttonsText.default.enable}</button>

                <button
                  className={!setting.hideContent ? style["actv"] : ""}
                  onClick={() => {
                    setSetting(prev => ({
                      ...prev,
                      hideContent: false
                    }))
                  }}
                >{L.setting.buttonsText.default.disable}</button>
              </div>
            </div>

            {/* readonly */}
            <div className={style["unit"]}>
              <KD.Title>{L.setting.title.readonly}</KD.Title>
              <KD.Thirdtitle>{L.setting.info.readonly}</KD.Thirdtitle>
              <KD.Thirdtitle>{L.setting.info.readonly1}</KD.Thirdtitle>
              <div className={style["list"]}>
                <button
                  className={setting.readonly ? style["actv"] : ""}
                  onClick={() => {
                    setSetting(prev => ({
                      ...prev,
                      readonly: true
                    }))
                  }}
                >{L.setting.buttonsText.default.enable}</button>

                <button
                  className={!setting.readonly ? style["actv"] : ""}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setSetting(prev => ({
                      ...prev,
                      readonly: false
                    }))
                  }}
                >{L.setting.buttonsText.default.disable}</button>
              </div>
            </div>

            {/* save */}
            <div className={style["unit"]}>
              <KD.Title>{L.setting.title.save}</KD.Title>
              <KD.Thirdtitle>{
                L.setting.info.save
                  .replace("$1", `${save.blogList.length}`)
                  .replace("$2", (() => {
                    const tagList: Array<string> = [];
                    save.blogList.map(({ tags }) => tagList.push(...tags))
                    return `${tagList.filter((item, index) => tagList.indexOf(item) === index).length}`
                  })())
              }</KD.Thirdtitle>
              <div className={style["list"]}>
                <button
                  disabled={mulitSelectMode}
                  onClick={() => functions.download(functions.toBase64(JSON.stringify(save)), `${new Date().getTime()}.ftblg`)}
                >{L.setting.buttonsText.save.export}</button>

                <button
                  disabled={mulitSelectMode}
                  onClick={() => {
                    newInput.message(
                      L.window.message.import,
                      [{ name: L.window.action.cancel, value: "" }, { name: L.window.action.selectFile, value: "ok", key: "Enter" }],
                      async (e) => {
                        setPopUpDisplay(true);
                        if (e !== "ok") return;
                        const inp = document.createElement("input")
                        inp.type = "file"; inp.accept = ".ftblg"; inp.click();
                        inp.onchange = (ev) => {
                          const files = (ev.target as HTMLInputElement).files;
                          if (files && files[0]) {
                            const reader = new FileReader();
                            reader.onload = (loadEv) => {
                              try {
                                setSave(JSON.parse(functions.fromBase64(loadEv.target?.result?.toString() ?? "{}")));
                              } catch (err) { console.error("Import failed", err); newInput.message("Import Failed"); }
                            };
                            reader.readAsText(files[0]);
                          }
                        }
                      }, () => { setPopUpDisplay(false); }
                    )
                  }}
                >{L.setting.buttonsText.save.import}</button>

                <button
                  disabled={mulitSelectMode}
                  onClick={() => {
                    newInput.message(
                      L.window.message.merge,
                      [{ name: L.window.action.cancel, value: "" }, { name: L.window.action.selectFile, value: "ok", key: "Enter" }],
                      async (e) => {
                        setPopUpDisplay(true);
                        if (e !== "ok") return;

                        const inp = document.createElement("input")
                        inp.type = "file"; inp.accept = ".ftblg"; inp.click();

                        inp.onchange = (ev) => {
                          const files = (ev.target as HTMLInputElement).files;
                          if (files && files[0]) {
                            const reader = new FileReader();
                            reader.onload = (loadEv) => {
                              try {
                                const importedStr = functions.fromBase64(loadEv.target?.result?.toString() ?? "{}");
                                const importedData: saveType = JSON.parse(importedStr);

                                if (!Array.isArray(importedData.blogList)) {
                                  throw new Error("Invalid format");
                                }

                                setSave(prev => {
                                  const blogMap = new Map<number, blogInfoType>();
                                  prev.blogList.forEach(blog => {
                                    blogMap.set(blog.dateCreate, blog);
                                  });

                                  importedData.blogList.forEach(blog => {
                                    blogMap.set(blog.dateCreate, blog);
                                  });

                                  const mergedList = Array.from(blogMap.values());

                                  mergedList.sort((a, b) => b.dateCreate - a.dateCreate);

                                  return { ...prev, blogList: mergedList };
                                });

                              } catch (err) {
                                console.error("Merge failed", err);
                                newInput.message("Merge Failed");
                              }
                            };
                            reader.readAsText(files[0]);
                          }
                        }
                      }, () => { setPopUpDisplay(false); }
                    )
                  }}
                >{L.setting.buttonsText.save.merge}</button>
              </div>
            </div>
          </div>
        </div>

        <div className={style["Buttons"]}>

          <div className={style["Group"]}>
            <button
              className={mulitSelectMode ? style["actv"] : ""}
              onClick={() => {
                setSetting(prev => ({
                  ...defaultSetting,
                  language: prev.language
                }))
              }}
            >{L.setting.action.reset}</button>

            <button
              disabled={mulitSelectMode}
              style={{ marginLeft: "auto" }}
              onClick={() => { setSettingStatus(false) }}
            >{L.setting.action.close}</button>
          </div>

        </div>
      </div>
    </div>,

    Info: <div className={[style["Info"], !infoStatus ? style["hide"] : ""].join(" ")}>
      {save.blogList[info] && (
        <>
          <div className={style["Content"]} overflow-bar-none="">
            <CustomMarkdown input={setting.hideContent ? toRandomText(save.blogList[info].content, randomStringLange) : save.blogList[info].content} />
          </div>

          <div className={style["Card"]}>
            <div className={[style["blog"], style["card"]].join(" ")}>
              <div className={style["index"]}><span>{"#"}{save.blogList.length - info}</span></div>
              {setting.powerSavingMode ? <></> : <div className={[style["index"], style["line"]].join(" ")}><span>{"#"}{save.blogList.length - info}</span></div>}
              <div className={style["info"]}>
                <div className={style["frame"]}>
                  <div className={style["name"]}>{setting.hideContent ? toRandomText(save.blogList[info].title, randomStringLange) : save.blogList[info].title}</div>
                  <div className={style["tags"]}>
                    {save.blogList[info].tags.map((tag, i) => <span className={style["tag"]} key={i}>{setting.hideContent ? toRandomText(tag, randomStringLange) : tag}</span>)}
                  </div>
                  <div className={style["date"]}>{new Date(save.blogList[info].dateCreate).toLocaleString()}</div>
                  <div className={style["folder"]} style={{ display: "flex" }}>{"/" + (setting.hideContent ? toRandomText(save.blogList[info].folderName, randomStringLange) : save.blogList[info].folderName)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className={style["Arrow"]}>
            <button onClick={() => setInfo(pre => { const c = save.blogList.length; return ((pre - 1) % c + c) % c; })}>{"<"}</button>
            <button onClick={() => setInfo(pre => { const c = save.blogList.length; return ((pre + 1) % c + c) % c; })}>{">"}</button>
          </div>

          <div className={style["Buttons"]}>

            <div className={style["Group"]}>
              <button onClick={() => handleDelete([info], false)}>{L.action.blog.delete}</button>

              <button onClick={() => {
                resetSelection()
                setReadFromInfo(true)
                setReaderStatus(true)
                setReading(info)
              }}>{L.action.blog.read}</button>

              {setting.readonly ? <></> : <button onClick={() => {
                setEditMode(true);
                setNowEdit(info);
                setInfoStatus(false);
                setNewTagInput('');
              }}>{L.action.blog.edit}</button>}

              <button onClick={() => handleExport([info], 'single')}>{L.action.blog.export}</button>
            </div>

            <div className={style["Group"]} style={{ alignItems: "flex-start", justifyContent: "flex-end" }}>
              <button onClick={() => setInfoStatus(false)}>{L.action.blog.close}</button>
            </div>

          </div>
        </>
      )}
    </div>,

    Editor: <div className={[style["Editor"], !editMode ? style["hide"] : ""].join(" ")}>
      {hasBlogs && tempBlog ? (
        <>
          <div className={style["Title"]}>
            <input
              type="text"
              value={tempBlog.title}
              className={style["title"]}
              onChange={(e) => {
                setTempBlog(prv => prv ? ({ ...prv, title: e.target.value }) : null);
                setEditCount(c => c + 1);
              }}
              placeholder={L.action.input.title}
            />
            <div className={style["TagsEditor"]}>
              {tempBlog.tags.map((tag, index) => (
                <span
                  key={index}
                  className={style["tag"]}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    setTempBlog(prv => prv ? ({ ...prv, tags: prv.tags.filter((_, i) => i !== index) }) : null);
                    setEditCount(c => c + 1);
                  }}
                >
                  {tag}
                </span>
              ))}
              <span
                className={style["tag"]}
                onClick={() => {
                  const tagToAdd = newTagInput.trim();
                  if (tagToAdd && !tempBlog.tags.includes(tagToAdd)) {
                    setTempBlog(prv => prv ? ({ ...prv, tags: [...prv.tags, tagToAdd] }) : null);
                    setEditCount(c => c + 1);
                  }
                  setNewTagInput('');
                }}
              >{" + "}</span>
              <input
                type="text"
                placeholder={L.action.input.addTag}
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newTagInput.trim() !== '') {
                    const tagToAdd = newTagInput.trim();
                    if (!tempBlog.tags.includes(tagToAdd)) {
                      setTempBlog(prv => prv ? ({ ...prv, tags: [...prv.tags, tagToAdd] }) : null);
                      setEditCount(c => c + 1);
                    }
                    setNewTagInput('');
                  }
                }}
              />
            </div>
            <span style={{ display: "flex" }}>
              <span style={{ opacity: ".5" }}>{"/"}</span>
              <input
                type="text"
                placeholder={L.action.input.folderName}
                className={style["folderName"]}
                value={tempBlog.folderName}
                onChange={(e) => {
                  setTempBlog(prv => prv ? ({ ...prv, folderName: e.target.value }) : null);
                  setEditCount(c => c + 1);
                }}
              />
            </span>
          </div>

          <div className={style["textEdit"]} style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <div className={style["in"]} id="inputArea" style={{ flexGrow: 1 }}>
              <Monaco
                className={style["editer"]}
                language="markdown"
                value={tempBlog.content}
                onChange={e => {
                  setTempBlog(prv => prv ? ({ ...prv, content: e ?? "" }) : null);
                  setEditCount(c => c + 1);
                }}
                theme='hc-black'
                onMount={handleEditorDidMount}
                options={{
                  fontSize: 20,
                  mouseWheelZoom: true,
                  wordWrap: "on",
                  unicodeHighlight: { ambiguousCharacters: false },
                  accessibilityPageSize: 10,
                  tabSize: 2
                }}
              />
              <div className={style["filter"]} />
            </div>
          </div>

          <div className={style["EditorControls"]} style={{ padding: '10px', }}>
            <button onClick={() => {
              doSave(tempBlog);
              setEditMode(false);
            }}>{L.action.blog.done}</button>
          </div>
        </>
      ) : (
        editMode && <div style={{ color: 'white', padding: '20px' }}>Loading...</div>
      )}
    </div>,

    Reader: <div className={[style["Reader"], !readerStatus ? style["hide"] : ""].join(" ")}>
      {save.blogList[reading] && (
        <>
          <div className={style["Buttons"]}>
            <div className={style["Group"]} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
              <button onClick={() => setReading(pre => { const c = save.blogList.length; return ((pre - 1) % c + c) % c; })}>{"<"}</button>

              <button onClick={() => {
                resetSelection()
                setReadFromInfo(false)
                if (readFromInfo) {
                  setInfoStatus(true)
                  setInfo(reading)
                }
                setReaderStatus(false)
              }}>{L.action.blog.readDone}</button>

              <button onClick={() => setReading(pre => { const c = save.blogList.length; return ((pre + 1) % c + c) % c; })}>{">"}</button>
            </div>
          </div>

          <div className={style["Title"]}>
            <div>{setting.hideContent ? toRandomText(save.blogList[reading].title, randomStringLange) : save.blogList[reading].title}</div>
          </div>

          <div className={style["Content"]}>
            <CustomMarkdown input={setting.hideContent ? toRandomText(save.blogList[reading].content, randomStringLange) : save.blogList[reading].content} />
          </div>
        </>
      )}
    </div>,
  }

  return <>
    <HeadSetting title={(() => {
      if (infoStatus) return `${dTitle} // ${save.blogList[info]?.title}`
      else if (editMode) return `${dTitle} || ${save.blogList[nowEdit]?.title}`
      else return dTitle
    })()} />

    <div
      id={style["App"]}
      className={[
        setting.fancyMode ? setting.powerSavingMode ? "" : style["FancyMode"] : "",
        setting.powerSavingMode ? style["powerSavingMode"] : "",
      ].join(" ")}
    >
      {
        setting.powerSavingMode ?
          <>
            {(() => {
              if (infoStatus)
                return Layer.Info
              else if (settingStatus)
                return Layer.Setting
              else if (editMode)
                return setting.readonly ? <></> : Layer.Editor
              else if (readerStatus)
                return Layer.Reader
              else
                return <>
                  {Layer.List}
                  {Layer.Buttons}
                </>

            })()}
          </>
          :
          <>
            {Layer.List}
            {Layer.Buttons}
            {Layer.Setting}
            {Layer.Info}
            {setting.readonly ? <></> : Layer.Editor}
            {Layer.Reader}
          </>
      }


    </div >
  </>
}