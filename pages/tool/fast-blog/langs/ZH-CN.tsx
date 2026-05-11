import NotAPage from "@/data/components/NotAPage"
import { languageType } from "./_languageType"

export const ZH_CN: languageType = {
  name: "简体中文",
  action: {
    blog: {
      delete: "删除",
      export: "导出",
      select: "选择",
      edit: "编辑",
      close: "关闭",
      openNew: "新建",
      setting: "设置",
      toggleFullScreen: "全屏切换",
      done: "完成",
      read: "阅读",
      readDone: "阅读完毕",
    },
    input: {
      addTag: "添加标签...",
      folderName: "文件夹名称",
      title: "标题"
    },
    selectMode: {
      none: "未选择",
      select: "已选择 $1 项",
    },
  },
  window: {
    action: {
      selectFile: "选择文件",
      export: "导出",
      cancel: "取消",
    },
    message: {
      import: "导入存档将直接「覆盖」当前所有数据，无法恢复。<br>确认要继续吗？",
      merge: "合并存档会保留现有数据，并导入新数据。<br>若创建时间 (ID) 冲突，将以新存档为主。",
      export: {
        all: "确定导出所有文章？",
        selected: "以下项目将被导出：",
        single: "确定导出 $1？",
      },
      delete: {
        first: {
          multi: "下列选中项目将被永久删除。",
          single: "$1 将被永久删除。",
        },
        next: {
          message: "此操作无法撤销，确定要删除吗？",
          yap: "确定删除",
          nah: "取消",
        }
      }
    }
  },
  setting: {
    title: {
      language: "语言",
      powerSavingMode: "省电模式",
      fancyMode: "花哨模式",
      hideContent: "隐藏内容",
      save: "存档管理",
      scale: "界面缩放",
      readonly: "只读模式",
    },
    info: {
      language: "界面显示语言",
      powerSavingMode: "简化 UI 渲染以节省性能。这会关闭部分视觉特效，可能影响某些组件显示。",
      fancyMode: "开启所有动画与视觉特效（不考虑性能）。",
      hideContent: "将内容文字替换为随机乱码，适合直播或截图时保护隐私。[不影响编辑器]",
      hideContent1: "编辑器内的文字不会被隐藏，请小心操作。",
      save: "统计：$1 篇文章 // $2 个标签",
      scale: "调整界面文字大小，适合在不同设备上阅读。",
      readonly: "隐藏编辑按钮并锁定编辑器，防止误触。",
      readonly1: "若要解除，请使用右键（手机为长按）。",
    },
    buttonsText: {
      default: {
        enable: "启用",
        disable: "禁用",
      },
      save: {
        export: "导出备份",
        import: "导入备份",
        merge: "合并备份",
      },
    },
    action: {
      reset: "重置",
      close: "关闭"
    }
  }
}

export default function () {
  return <NotAPage info={[
    `ZH_CN (${ZH_CN.name}) 的语言定义`
  ]} />
}