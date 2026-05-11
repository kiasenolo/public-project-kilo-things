import NotAPage from "@/data/components/NotAPage"
import { languageType } from "./_languageType"

export const EN_GB: languageType = {
  name: "English (UK)",
  action: {
    blog: {
      delete: "Delete",
      export: "Export",
      select: "Select",
      edit: "Edit",
      close: "Close",
      openNew: "New Post",
      setting: "Settings",
      toggleFullScreen: "Fullscreen",
      done: "Done",
      read: "Read",
      readDone: "Close",
    },
    input: {
      addTag: "Add Tag...",
      folderName: "Folder Name",
      title: "Title"
    },
    selectMode: {
      none: "No Selection",
      select: "$1 Selected",
    },
  },
  window: {
    action: {
      selectFile: "Select File",
      export: "Export",
      cancel: "Cancel",
    },
    message: {
      import: "This will OVERWRITE all existing data. Are you absolutely sure?",
      merge: "Merge imports new items whilst keeping existing ones.<br>Newer versions replace older ones if IDs match.",
      export: {
        all: "Export all blogs?",
        selected: "Export the following items:",
        single: "Export $1?",
      },
      delete: {
        first: {
          multi: "All selected items will be permanently deleted.",
          single: "$1 will be permanently deleted.",
        },
        next: {
          message: "This action is irreversible. Proceed?",
          yap: "Delete",
          nah: "Cancel",
        }
      }
    }
  },
  setting: {
    title: {
      language: "Language",
      powerSavingMode: "Power Saving",
      fancyMode: "Fancy Mode",
      hideContent: "Privacy Mode",
      save: "Data Management",
      scale: "UI Scaling",
      readonly: "Read-only",
    },
    info: {
      language: "Display language",
      powerSavingMode: "Optimises UI for efficiency. Disables some visual effects.",
      fancyMode: "Prioritises aesthetics and animations.",
      hideContent: "Scrambles text for privacy during streaming. [Editor unaffected]",
      hideContent1: "The editor content remains visible.",
      save: "Total: $1 blogs, $2 tags",
      scale: "Adjusts interface size.",
      readonly: "Disables editing features to prevent accidental changes.",
      readonly1: "Right-click (or long-press) to toggle off.",
    },
    buttonsText: {
      default: {
        enable: "Enable",
        disable: "Disable",
      },
      save: {
        export: "Export Data",
        import: "Import Data",
        merge: "Merge Data",
      },
    },
    action: {
      reset: "Reset",
      close: "Close"
    }
  }
}

export default function () {
  return <NotAPage info={[
    `EN_GB (${EN_GB.name}) 的语言定义`
  ]} />
}