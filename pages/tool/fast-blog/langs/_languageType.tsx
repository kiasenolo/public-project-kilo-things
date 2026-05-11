import NotAPage from "@/data/components/NotAPage"

export type languageType = {
  name: string,
  action: {
    blog: {
      delete: string,
      export: string,
      select: string,
      edit: string,
      close: string,
      openNew: string,
      setting: string,
      toggleFullScreen: string,
      done: string,
      read: string;
      readDone: string,
    },
    input: {
      addTag: string,
      folderName: string,
      title: string,
    },
    selectMode: {
      none: string,
      select: string,
    },
  },
  window: {
    action: {
      selectFile: string,
      export: string,
      cancel: string,
    },
    message: {
      import: string,
      merge: string,
      export: {
        all: string,
        selected: string,
        single: string,
      },
      delete: {
        first: {
          multi: string,
          single: string,
        },
        next: {
          message: string,
          yap: string,
          nah: string,
        }
      }
    }
  },
  setting: {
    title: {
      language: string,
      powerSavingMode: string,
      fancyMode: string,
      hideContent: string,
      save: string,
      scale: string,
      readonly: string,
    },
    info: {
      language: string,
      powerSavingMode: string,
      fancyMode: string,
      hideContent: string,
      hideContent1: string,
      save: string,
      scale: string,
      readonly: string,
      readonly1: string,
    }
    buttonsText: {
      default: {
        enable: string,
        disable: string,
      },
      save: {
        export: string,
        import: string,
        merge: string,
      },
    },
    action: {
      reset: string,
      close: string,
    }
  }
}

export default function () {
  return <NotAPage info={[
    "这个是fast-blog语言列表的型别定义"
  ]} />
}