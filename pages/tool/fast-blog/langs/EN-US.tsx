import NotAPage from "@/data/components/NotAPage"
import { languageType } from "./_languageType"

export const EN_US: languageType = {
  name: "English (US)",
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
      none: "None Selected",
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
      import: "This will OVERWRITE all existing data. This action cannot be undone.<br>Are you sure?",
      merge: "Merge imports new items without deleting existing ones.<br>If timestamps match, the new version takes precedence.",
      export: {
        all: "Export all blogs?",
        selected: "Export the following items:",
        single: "Export $1?",
      },
      delete: {
        first: {
          multi: "Selected items will be permanently deleted.",
          single: "$1 will be permanently deleted.",
        },
        next: {
          message: "Are you sure? This action cannot be undone.",
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
      scale: "UI Scale",
      readonly: "Read-only",
    },
    info: {
      language: "Display language",
      powerSavingMode: "Simplifies UI rendering to save power. Disables effects; some components may look basic.",
      fancyMode: "Enables all animations and visual effects.",
      hideContent: "Obfuscates text with random characters. Good for streaming/privacy. [Editor unaffected]",
      hideContent1: "Text inside the editor remains visible.",
      save: "Total: $1 blogs, $2 tags",
      scale: "Adjust UI size for better readability.",
      readonly: "Hides edit buttons and disables the editor to prevent accidental changes.",
      readonly1: "Right-click (or long-press) to disable.",
    },
    buttonsText: {
      default: {
        enable: "ON",
        disable: "OFF",
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
    `EN_US (${EN_US.name}) 的语言定义`
  ]} />
}