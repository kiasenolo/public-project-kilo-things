import { useState, useEffect, useCallback, useMemo, forwardRef, useImperativeHandle, useRef } from 'react';
import fs, { Dirent } from '@/data/module/functions/module/opfs';
import style from './style.module.scss';
import clsx from 'clsx';

const lang = {
  "contener.loading": "Loading...",
  "contener.empty": "This folder is empty",
  "navigate.back": "Back",
  "navigate.forward": "Forward",
  "navigate.up": "Up dir",
  "navigate.refresh": "Refresh",
  "viewMode.grid": "Grid",
  "viewMode.list": "List"
}

type ViewMode = 'grid' | 'list'

export interface FileExplorerHandle {
  refresh: () => void;
  navigateTo: (path: string) => void;
  goUp: () => void;
  navigateBack: () => void;
  navigateForward: () => void;
  getCurrentPath: () => string;
  getEntries: () => Dirent[];
  getSelection: () => Set<string>;
}

interface FileExplorerOptions {
  rootDir?: string;
  nowDir?: string;
  eventLock?: boolean
  events?: {
    entrie?: {
      click?: (entrie: Dirent) => void,
      dbClick?: (entrie: Dirent) => void,
      contextMenu?: (entrie: Dirent) => void,
      drag?: (entrie: Dirent[]) => void
      dragCapture?: (entrie: Dirent[]) => void
      dragEnd?: (entrie: Dirent[]) => void
      dragEndCapture?: (entrie: Dirent[]) => void
      dragEnter?: (entrie: Dirent[]) => void
      dragEnterCapture?: (entrie: Dirent[]) => void
      dragExit?: (entrie: Dirent[]) => void
      dragExitCapture?: (entrie: Dirent[]) => void
      dragLeave?: (entrie: Dirent[]) => void
      dragLeaveCapture?: (entrie: Dirent[]) => void
      dragOver?: (entrie: Dirent[]) => void
      dragOverCapture?: (entrie: Dirent[]) => void
      dragStart?: (entrie: Dirent[]) => void
      dragStartCapture?: (entrie: Dirent[]) => void
    }
    empty?: {
      click?: (path: string) => void,
      contextMenu?: (path: string) => void,
      drop?: (path: string) => void
      dropCapture?: (path: string) => void
    }
    navigate?: {
      forward?: (newPath: string, entries: Dirent[]) => void,
      up?: (newPath: string, entries: Dirent[]) => void,
      refresh?: (entries: Dirent[]) => void,
    }
    dir?: {
      drop?: (path: string) => void
      dropCapture?: (path: string) => void
      drag?: (path: string) => void
      dragCapture?: (path: string) => void
      dragEnd?: (path: string) => void
      dragEndCapture?: (path: string) => void
      dragEnter?: (path: string) => void
      dragEnterCapture?: (path: string) => void
      dragExit?: (path: string) => void
      dragExitCapture?: (path: string) => void
      dragLeave?: (path: string) => void
      dragLeaveCapture?: (path: string) => void
      dragOver?: (path: string) => void
      dragOverCapture?: (path: string) => void
      dragStart?: (path: string) => void
      dragStartCapture?: (path: string) => void
    }
    breadcrumb?: {
      dragStart?: (path: string) => void
      dragEnd?: (path: string) => void
      dragEnter?: (path: string) => void
      dragLeave?: (path: string) => void
      dragOver?: (path: string) => void
      drop?: (path: string) => void
    }
    viewModeChange?: (newViewMode: ViewMode) => void,
  }
  tTranslate?: {
    "contener.loading"?: string;
    "contener.empty"?: string;
    "navigate.back"?: string;
    "navigate.forward"?: string;
    "navigate.up"?: string;
    "navigate.refresh"?: string,
    "viewMode.grid"?: string;
    "viewMode.list"?: string;
  };
}

const FileExplorer = forwardRef<FileExplorerHandle, FileExplorerOptions>(({
  rootDir = '/',
  nowDir = '/',
  eventLock = false,
  events,
  tTranslate,
}: FileExplorerOptions, ref) => {

  const t = (key: keyof typeof lang) => {
    const list = tTranslate ?? lang;
    const tt = list[key] ?? lang[key];
    return tt;
  };

  const initialPath = nowDir.startsWith(rootDir) ? nowDir : rootDir;

  const [currentPath, setCurrentPath] = useState(initialPath);
  const [entries, setEntries] = useState<Dirent[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const [history, setHistory] = useState<string[]>([initialPath]);
  const [historyStep, setHistoryStep] = useState(0);

  const contener = useRef<HTMLDivElement>(null)
  const prevDir = useRef<string>(initialPath)

  useEffect(() => {
    const cnt = contener.current
    if (cnt) {
      cnt.classList.add(currentPath.length > prevDir.current.length ? style["right"] : style["left"])
      void cnt.offsetWidth;
      cnt.classList.remove(style["right"], style["left"])
    };
    prevDir.current = currentPath
  }, [currentPath])

  const join = (...parts: string[]) => parts.join('/').replace(/\/+/g, '/');

  const getSelectedEntries = useCallback((): Dirent[] => {
    return entries.filter(e => selection.has(e.name));
  }, [entries, selection]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fs.promises.readdir(currentPath, { withFileTypes: true });
      const sorted = (result as Dirent[]).sort((a, b) => {
        if (a.isDirectory() === b.isDirectory()) return a.name.localeCompare(b.name);
        return a.isDirectory() ? -1 : 1;
      });
      setEntries(sorted);
      events?.navigate?.refresh?.(sorted);
    } catch (err) {
      console.error("Failed to read directory:", err);
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPath]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const navigateTo = (path: string, pushHistory = true) => {
    if (!path.startsWith(rootDir)) path = rootDir;
    setCurrentPath(path);
    setSelection(new Set());
    if (pushHistory) {
      const newHistory = history.slice(0, historyStep + 1);
      newHistory.push(path);
      setHistory(newHistory);
      setHistoryStep(newHistory.length - 1);
    }
  };

  const navigateHistory = (delta: number) => {
    const nextStep = historyStep + delta;
    if (nextStep >= 0 && nextStep < history.length) {
      setHistoryStep(nextStep);
      navigateTo(history[nextStep], false);
      if (delta > 0) {
        events?.navigate?.forward?.(history[nextStep], entries);
      }
    }
  };

  const goUp = () => {
    if (currentPath === rootDir) return;
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    const parentPath = '/' + parts.join('/');
    const targetPath = parentPath.startsWith(rootDir) ? parentPath : rootDir;
    navigateTo(targetPath);
    events?.navigate?.up?.(targetPath, entries);
  };

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (eventLock) return;
    if (e.button === 3) { e.preventDefault(); navigateHistory(-1); }
    else if (e.button === 4) { e.preventDefault(); navigateHistory(1); }
  }, [eventLock, historyStep, history]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (eventLock) return;
    if ((e.altKey && e.key === 'ArrowLeft') || e.key === 'Backspace') { e.preventDefault(); navigateHistory(-1); }
    else if (e.altKey && e.key === 'ArrowRight') { e.preventDefault(); navigateHistory(1); }
    else if (e.altKey && e.key === 'ArrowUp') { e.preventDefault(); goUp(); }
    else if (e.key === 'F5') { e.preventDefault(); refresh(); }
  }, [eventLock, historyStep, history, currentPath, rootDir]);

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);
    const preventBack = (e: MouseEvent) => {
      if (!eventLock && (e.button === 3 || e.button === 4)) e.preventDefault();
    };
    window.addEventListener('mousedown', preventBack);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', preventBack);
    };
  }, [handleMouseUp, handleKeyDown]);

  const pathSegments = useMemo(() => {
    const segments: { name: string, path: string }[] = [];
    segments.push({ name: '/', path: rootDir });
    const relativePart = currentPath.slice(rootDir.length).split('/').filter(Boolean);
    let cumulativePath = rootDir;
    relativePart.forEach(seg => {
      cumulativePath = join(cumulativePath, seg);
      segments.push({ name: seg, path: cumulativePath });
    });
    return segments;
  }, [currentPath, rootDir]);

  const handleItemClick = (e: React.MouseEvent, entry: Dirent) => {
    const name = entry.name;
    setSelection(prev => {
      const newSelection = new Set(prev);
      if (e.ctrlKey || e.metaKey) {
        newSelection.has(name) ? newSelection.delete(name) : newSelection.add(name);
      } else {
        newSelection.clear();
        newSelection.add(name);
      }
      return newSelection;
    });
    events?.entrie?.click?.(entry);
  };

  const handleDoubleClick = (entry: Dirent) => {
    if (entry.isDirectory()) {
      navigateTo(join(currentPath, entry.name));
    } else {
      events?.entrie?.dbClick?.(entry);
    }
  };

  const handleItemContextMenu = (e: React.MouseEvent, entry: Dirent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelection(prev => {
      if (prev.has(entry.name)) return prev;
      return new Set([entry.name]);
    });
    events?.entrie?.contextMenu?.(entry);
  };

  const handleEmptyClick = () => {
    setSelection(new Set());
    events?.empty?.click?.(currentPath);
  };

  const handleEmptyContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setSelection(new Set());
    events?.empty?.contextMenu?.(currentPath);
  };

  const handleEmptyDrop = (e: React.DragEvent) => {
    e.preventDefault();
    events?.empty?.drop?.(currentPath);
  };

  const handleEmptyDropCapture = (e: React.DragEvent) => {
    events?.empty?.dropCapture?.(currentPath);
  };

  const makeEntrieDragHandler = (
    cb: ((entries: Dirent[]) => void) | undefined,
    entry: Dirent
  ) => (e: React.DragEvent) => {
    e.stopPropagation();
    const selected = selection.has(entry.name) ? getSelectedEntries() : [entry];
    cb?.(selected);
  };

  /**
   * dir drag/drop handler
   * 傳入目錄的完整路徑。
   */
  const makeDirDragHandler = (
    cb: ((path: string) => void) | undefined,
    entry: Dirent
  ) => (e: React.DragEvent) => {
    e.stopPropagation();
    cb?.(join(currentPath, entry.name));
  };

  /**
   * 合併 entrie + dir handler（僅供 isDirectory() 的 entry 使用）。
   * 同時觸發兩個 callback。
   */
  const makeCombinedDragHandler = (
    entrieCb: ((entries: Dirent[]) => void) | undefined,
    dirCb: ((path: string) => void) | undefined,
    entry: Dirent
  ) => (e: React.DragEvent) => {
    e.stopPropagation();
    const selected = selection.has(entry.name) ? getSelectedEntries() : [entry];
    entrieCb?.(selected);
    dirCb?.(join(currentPath, entry.name));
  };

  const makeBreadcrumbDragSourceHandler = (
    cb: ((path: string) => void) | undefined,
    path: string
  ) => (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/plain', path);
    cb?.(path);
  };

  const makeBreadcrumbDropTargetHandler = (
    cb: ((path: string) => void) | undefined,
    path: string
  ) => (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    cb?.(path);
  };

  const toggleViewMode = () => {
    const next: ViewMode = viewMode === 'grid' ? 'list' : 'grid';
    setViewMode(next);
    events?.viewModeChange?.(next);
  };

  const renderIcon = (entry: Dirent) => {
    if (entry.isDirectory()) {
      return <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px"><path d="M140-160q-24 0-42-18.5T80-220v-520q0-23 18-41.5t42-18.5h256q12.44 0 23.72 5t19.37 13.09L481-740h339q23 0 41.5 18.5T880-680v460q0 23-18.5 41.5T820-160H140Zm0-60h680v-460H456l-60-60H140v520Zm0 0v-520 520Z" /></svg>;
    }
    const ext = entry.name.split('.').pop()?.toLowerCase() || '';
    const EXTENSIONS = {
      image: ['svg', 'png', 'jpg', 'jpeg', 'webp', 'gif'],
      audio: ['mp3', 'wav', 'ogg'],
      text: ['txt', 'md'],
      video: ['mp4', 'webm'],
      code: ['json', 'html', 'js', 'ts', 'css'],
    };
    if (EXTENSIONS.image.includes(ext))
      return <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px"><path d="M180-120q-24 0-42-18t-18-42v-600q0-24 18-42t42-18h600q24 0 42 18t18 42v600q0 24-18 42t-42 18H180Zm0-60h600v-600H180v600Zm56-97h489L578-473 446-302l-93-127-117 152Zm-56 97v-600 600Z" /></svg>;
    if (EXTENSIONS.video.includes(ext))
      return <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px"><path d="M352-240h175q14 0 24.5-10.5T562-275v-55l80 46v-152l-80 46v-55q0-14-10.5-24.5T527-480H352q-14 0-24.5 10.5T317-445v170q0 14 10.5 24.5T352-240ZM220-80q-24 0-42-18t-18-42v-680q0-24 18-42t42-18h361l219 219v521q0 24-18 42t-42 18H220Zm331-554v-186H220v680h520v-494H551ZM220-820v186-186 680-680Z" /></svg>;
    if (EXTENSIONS.audio.includes(ext))
      return <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px"><path d="M286.5-163.5Q243-207 243-270t43.5-106.5Q330-420 393-420q28 0 50.5 8t39.5 22v-450h234v135H543v435q0 63-43.5 106.5T393-120q-63 0-106.5-43.5Z" /></svg>;
    if (EXTENSIONS.code.includes(ext))
      return <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px"><path d="M320-242 80-482l242-242 43 43-199 199 197 197-43 43Zm318 2-43-43 199-199-197-197 43-43 240 240-242 242Z" /></svg>;
    if (EXTENSIONS.text.includes(ext))
      return <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px"><path d="M180-180h600v-375L555-780H180v600Zm0 60q-24.75 0-42.37-17.63Q120-155.25 120-180v-600q0-24.75 17.63-42.38Q155.25-840 180-840h400l260 260v400q0 24.75-17.62 42.37Q804.75-120 780-120H180Zm99-171h402v-60H279v60Zm0-159h402v-60H279v60Zm0-159h276v-60H279v60Zm-99 429v-600 600Z" /></svg>;
    return <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px"><path d="M220-80q-24 0-42-18t-18-42v-680q0-24 18-42t42-18h336q12.44 0 23.72 5T599-862l183 183q8 8 13 19.28 5 11.28 5 23.72v496q0 24-18 42t-42 18H220Zm331-584v-156H220v680h520v-494H581q-12.75 0-21.37-8.63Q551-651.25 551-664ZM220-820v186-186 680-680Z" /></svg>;
  };

  useImperativeHandle(ref, () => ({
    refresh,
    navigateTo,
    goUp,
    navigateBack: () => navigateHistory(-1),
    navigateForward: () => navigateHistory(1),
    getCurrentPath: () => currentPath,
    getEntries: () => entries,
    getSelection: () => selection,
  }), [refresh, navigateTo, goUp, currentPath, entries, selection]);

  return (
    <div className={style["Explorer"]}>
      <div className={style["Dir"]}>
        <div className={style["Buttons"]}>
          <button
            onClick={() => navigateHistory(-1)}
            disabled={historyStep <= 0}
            title={t("navigate.back")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" /></svg>
          </button>

          <button
            onClick={() => navigateHistory(1)}
            disabled={historyStep >= history.length - 1}
            title={t("navigate.forward")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z" /></svg>
          </button>

          <button
            onClick={goUp}
            disabled={currentPath === rootDir}
            title={t("navigate.up")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M320-160v-200H183q-19 0-27-17t4-32l289-353q12-15 31-15t31 15l289 353q12 15 4 32t-27 17H640v200q0 17-11.5 28.5T600-120H360q-17 0-28.5-11.5T320-160Z" /></svg>
          </button>

          <button
            className={clsx(style["refresh"], isLoading && style["spinning"])}
            onClick={() => refresh()}
            disabled={isLoading}
            title={t("navigate.refresh")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z" /></svg>
          </button>
        </div>

        <div className={style["Dir"]}>
          {pathSegments.map((seg) => (
            <span key={seg.path}>
              <button
                className={style["backButton"]}
                onClick={() => navigateTo(seg.path)}
                disabled={seg.path === currentPath}

                draggable
                onDragStart={makeBreadcrumbDragSourceHandler(events?.breadcrumb?.dragStart, seg.path)}
                onDragEnd={makeBreadcrumbDragSourceHandler(events?.breadcrumb?.dragEnd, seg.path)}

                onDragEnter={(e) => { e.preventDefault(); events?.breadcrumb?.dragEnter?.(seg.path); }}
                onDragLeave={(e) => { e.preventDefault(); events?.breadcrumb?.dragLeave?.(seg.path); }}
                onDragOver={(e) => { e.preventDefault(); events?.breadcrumb?.dragOver?.(seg.path); }}
                onDrop={makeBreadcrumbDropTargetHandler(events?.breadcrumb?.drop, seg.path)}
              >
                {seg.name}
              </button>
            </span>
          ))}
        </div>

        <div className={style["ViewMode"]}>
          <button onClick={toggleViewMode}>
            {
              viewMode === "grid" ?
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M120-520v-320h320v320H120Zm0 400v-320h320v320H120Zm400-400v-320h320v320H520Zm0 400v-320h320v320H520ZM200-600h160v-160H200v160Zm400 0h160v-160H600v160Zm0 400h160v-160H600v160Zm-400 0h160v-160H200v160Zm400-400Zm0 240Zm-240 0Zm0-240Z" /></svg>
                :
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M80-160v-160h160v160H80Zm240 0v-160h560v160H320ZM80-400v-160h160v160H80Zm240 0v-160h560v160H320ZM80-640v-160h160v160H80Zm240 0v-160h560v160H320Z" /></svg>
            }

          </button>
        </div>
      </div>

      <div className={clsx(
        style["ContentArea"],
        viewMode === "list" ? style["ListView"] : style["GridView"]
      )}>
        <div
          className={style["MenuFrame"]}
          onClick={handleEmptyClick}
          onContextMenu={handleEmptyContextMenu}
          onDrop={handleEmptyDrop}
          onDropCapture={handleEmptyDropCapture}
          ref={contener}
        >
          {isLoading ? (
            <div className={style["Message"]}>{t("contener.loading")}</div>
          ) : entries.length === 0 ? (
            <div className={style["Message"]}>{t("contener.empty")}</div>
          ) : (
            entries.map((entry) => {
              const isDir = entry.isDirectory();

              return (
                <button
                  key={entry.name}
                  className={clsx(style["Button"], selection.has(entry.name) && style["sel"])}
                  onClick={(e) => { e.stopPropagation(); handleItemClick(e, entry); }}
                  onDoubleClick={() => handleDoubleClick(entry)}
                  onContextMenu={(e) => handleItemContextMenu(e, entry)}

                  onDrag={isDir
                    ? makeCombinedDragHandler(events?.entrie?.drag, events?.dir?.drag, entry)
                    : makeEntrieDragHandler(events?.entrie?.drag, entry)}
                  onDragCapture={isDir
                    ? makeCombinedDragHandler(events?.entrie?.dragCapture, events?.dir?.dragCapture, entry)
                    : makeEntrieDragHandler(events?.entrie?.dragCapture, entry)}
                  onDragStart={isDir
                    ? makeCombinedDragHandler(events?.entrie?.dragStart, events?.dir?.dragStart, entry)
                    : makeEntrieDragHandler(events?.entrie?.dragStart, entry)}
                  onDragStartCapture={isDir
                    ? makeCombinedDragHandler(events?.entrie?.dragStartCapture, events?.dir?.dragStartCapture, entry)
                    : makeEntrieDragHandler(events?.entrie?.dragStartCapture, entry)}
                  onDragEnd={isDir
                    ? makeCombinedDragHandler(events?.entrie?.dragEnd, events?.dir?.dragEnd, entry)
                    : makeEntrieDragHandler(events?.entrie?.dragEnd, entry)}
                  onDragEndCapture={isDir
                    ? makeCombinedDragHandler(events?.entrie?.dragEndCapture, events?.dir?.dragEndCapture, entry)
                    : makeEntrieDragHandler(events?.entrie?.dragEndCapture, entry)}

                  onDragEnter={isDir
                    ? makeCombinedDragHandler(events?.entrie?.dragEnter, events?.dir?.dragEnter, entry)
                    : makeEntrieDragHandler(events?.entrie?.dragEnter, entry)}
                  onDragEnterCapture={isDir
                    ? makeCombinedDragHandler(events?.entrie?.dragEnterCapture, events?.dir?.dragEnterCapture, entry)
                    : makeEntrieDragHandler(events?.entrie?.dragEnterCapture, entry)}
                  onDragLeave={isDir
                    ? makeCombinedDragHandler(events?.entrie?.dragLeave, events?.dir?.dragLeave, entry)
                    : makeEntrieDragHandler(events?.entrie?.dragLeave, entry)}
                  onDragLeaveCapture={isDir
                    ? makeCombinedDragHandler(events?.entrie?.dragLeaveCapture, events?.dir?.dragLeaveCapture, entry)
                    : makeEntrieDragHandler(events?.entrie?.dragLeaveCapture, entry)}
                  onDragExit={isDir
                    ? makeCombinedDragHandler(events?.entrie?.dragExit, events?.dir?.dragExit, entry)
                    : makeEntrieDragHandler(events?.entrie?.dragExit, entry)}
                  onDragExitCapture={isDir
                    ? makeCombinedDragHandler(events?.entrie?.dragExitCapture, events?.dir?.dragExitCapture, entry)
                    : makeEntrieDragHandler(events?.entrie?.dragExitCapture, entry)}

                  onDragOver={(e) => {
                    e.preventDefault();
                    isDir
                      ? makeCombinedDragHandler(events?.entrie?.dragOver, events?.dir?.dragOver, entry)(e)
                      : makeEntrieDragHandler(events?.entrie?.dragOver, entry)(e);
                  }}
                  onDragOverCapture={isDir
                    ? makeCombinedDragHandler(events?.entrie?.dragOverCapture, events?.dir?.dragOverCapture, entry)
                    : makeEntrieDragHandler(events?.entrie?.dragOverCapture, entry)}

                  onDrop={isDir
                    ? (e) => { e.preventDefault(); makeDirDragHandler(events?.dir?.drop, entry)(e); }
                    : undefined}
                  onDropCapture={isDir
                    ? makeDirDragHandler(events?.dir?.dropCapture, entry)
                    : undefined}
                >
                  <div className={style["icon"]}>{renderIcon(entry)}</div>
                  <span className={style["lable"]}>
                    <span>{entry.name}</span>
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
})

FileExplorer.displayName = "FileExplorer";
export default FileExplorer;