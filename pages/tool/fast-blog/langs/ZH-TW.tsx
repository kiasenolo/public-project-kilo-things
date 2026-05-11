import NotAPage from "@/data/components/NotAPage"
import { languageType } from "./_languageType"

export const ZH_TW: languageType = {
  name: "繁體中文",
  action: {
    blog: {
      delete: "刪掉",
      export: "匯出",
      select: "選擇",
      edit: "編輯",
      close: "關掉",
      openNew: "開個新的",
      setting: "設定",
      toggleFullScreen: "切換全螢幕",
      done: "寫完了",
      read: "讀一下",
      readDone: "讀完了",
    },
    input: {
      addTag: "新增標籤",
      folderName: "資料夾名稱",
      title: "標題"
    },
    selectMode: {
      none: "目前沒選東西",
      select: "已選擇 $1 個",
    },
  },
  window: {
    action: {
      selectFile: "選取文件",
      export: "匯出",
      cancel: "取消",
    },
    message: {
      import: "欸 這樣搞會覆蓋掉所有東西 你要確？<br>然後如果給到格式不對的東西 就徹底沒救了",
      merge: "合併存檔 是指 不覆蓋現有東西的情況下 把新的東西導入進來 保留舊的<br>如果 ID 也就是建立時間一樣的話 會以新存檔為主",
      export: {
        all: "你確定要匯出所有 blog？",
        selected: "等一下會匯出下面這些東西",
        single: "確定匯出 $1 ？",
      },
      delete: {
        first: {
          multi: "下面列出來的東西 全部 都會消失",
          single: "$1 會直接消失欸",
        },
        next: {
          message: "你確定你要刪？ 這東西會直接消失 回不來的那種哦",
          yap: "yap 我確定",
          nah: "還是算了",
        }
      }
    }
  },
  setting: {
    title: {
      language: "語言",
      powerSavingMode: "省電模式",
      fancyMode: "花俏模式",
      hideContent: "隱藏內容",
      save: "目前的存檔",
      scale: "界面縮放",
      readonly: "只讀模式",
    },
    info: {
      language: "目前顯示的語言",
      powerSavingMode: "改變所有 UI 的渲染方式 會犧牲掉很多的效果 可能會造成某些特殊元件顯示不正常 慎用 一切以省電為主",
      fancyMode: "主打一個 撇開效能不談 我們來談一談動畫和效果吧",
      hideContent: "會把除了特殊字符以外的其他文字全部替換成隨機大小寫字母 直播的時候很好用",
      hideContent1: "只要你不手殘按到編輯器 就不會有這個問題",
      save: "總共 $1 個 Blog // $2 個 Tag",
      scale: "字體過大或過小的時候 可能會有用 比如....你用手機寫blog",
      readonly: "真的就只能讀 編輯按鈕會直接消失 編輯器也不能用 從根源解決手殘按到的問題",
      readonly1: "要切回來要按右鍵 手機的話是長按 按了沒反應是正常的 不是出bug",
    },
    buttonsText: {
      default: {
        enable: "啟用",
        disable: "禁用",
      },
      save: {
        export: "匯出存檔",
        import: "匯入存檔",
        merge: "合併存檔",
      },
    },
    action: {
      reset: "重設",
      close: "關掉"
    }
  }
}

export default function () {
  return <NotAPage info={[
    `ZH_TW (${ZH_TW.name}) 的语言定义`
  ]} />
}