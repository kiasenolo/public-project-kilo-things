import NotAPage from "@/data/components/NotAPage"
import { languageType } from "./_languageType"

export const JA_JP: languageType = {
  name: "日本語",
  action: {
    blog: {
      delete: "削除",
      export: "書き出し",
      select: "選択",
      edit: "編集",
      close: "閉じる",
      openNew: "新規作成",
      setting: "設定",
      toggleFullScreen: "全画面表示",
      done: "完了",
      read: "閲覧",
      readDone: "閉じる",
    },
    input: {
      addTag: "タグを追加...",
      folderName: "フォルダ名",
      title: "タイトル"
    },
    selectMode: {
      none: "選択なし",
      select: "$1 件選択中",
    },
  },
  window: {
    action: {
      selectFile: "ファイル選択",
      export: "保存",
      cancel: "キャンセル",
    },
    message: {
      import: "現在のデータが【全て上書き】されます。復元はできません。<br>本当に実行しますか？",
      merge: "「結合」は現在のデータを保持したまま、新しいデータを追加します。<br>IDが重複する場合は新しいデータが優先されます。",
      export: {
        all: "全ての記事を書き出しますか？",
        selected: "以下の項目を書き出します：",
        single: "$1 を書き出しますか？",
      },
      delete: {
        first: {
          multi: "選択した項目が完全に削除されます。",
          single: "$1 が完全に削除されます。",
        },
        next: {
          message: "削除すると元に戻せません。よろしいですか？",
          yap: "削除する",
          nah: "やめる",
        }
      }
    }
  },
  setting: {
    title: {
      language: "言語",
      powerSavingMode: "省電力モード",
      fancyMode: "演出モード",
      hideContent: "内容隠蔽",
      save: "データ管理",
      scale: "拡大率",
      readonly: "読み取り専用",
    },
    info: {
      language: "表示言語",
      powerSavingMode: "描画負荷を下げてバッテリーを節約します。一部のエフェクトが無効になります。",
      fancyMode: "アニメーションと視覚効果を有効にします。",
      hideContent: "文字をランダムな英字に置換します。配信時などのプライバシー保護に。[エディタは対象外]",
      hideContent1: "エディタ内の文字は隠されません。",
      save: "合計: $1 記事 // $2 タグ",
      scale: "UIのサイズを調整します。",
      readonly: "編集機能を無効化し、誤操作を防ぎます。",
      readonly1: "解除するには右クリック（スマホは長押し）してください。",
    },
    buttonsText: {
      default: {
        enable: "ON",
        disable: "OFF",
      },
      save: {
        export: "バックアップ保存",
        import: "バックアップ読込",
        merge: "バックアップ結合",
      },
    },
    action: {
      reset: "初期化",
      close: "閉じる"
    }
  }
}

export default function () {
  return <NotAPage info={[
    `JA_JP (${JA_JP.name}) 的语言定义`
  ]} />
}