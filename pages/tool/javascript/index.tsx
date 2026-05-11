import Link from 'next/link'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import style from "./style.module.scss"
import functions from '@/data/module/functions';
import FileDrop from '@/data/components/FileDrop';
import HeadSetting from '@/data/components/HeadSetting';
import CustomMarkdown from '@/data/components/CustomMarkdown';
import Monaco, { OnMount } from '@monaco-editor/react'
import md5 from 'md5';
import sha1 from 'sha1';
import { sha224, sha256 } from 'js-sha256';
import useLocalStorage from '@/data/module/use/LocalStorage';
import * as ts from 'typescript';
import { toolsColor } from '..';

const TextList = [
  "// 20250626的更新\n`md5: ${md5(\"被md5抽過\")} \n sha1: ${sha1(\"被sha1抽過\")} \n sha224: ${sha224(\"被sha224抽過\")} \n sha256: ${sha256(\"被sha256抽過\")}`",
  "// 你現在可以寫 TypeScript 啦！\nconst myName: string = 'World';\n`Hello, ${myName}!`",
  "(1+1===3).toString()",
  "2**10",
  "10**100",
  "1e3",
];

const utility = {
  base64: {
    from: functions.fromBase64,
    to: functions.toBase64
  },
  numberArray: functions.numberArray,
  randomChoose: functions.randomChoose
}

const customLibSource = `
/**
 * Computes the MD5 hash of a string.
 * @param message The string or data to hash.
 * @returns The 32-character hexadecimal MD5 hash.
 */
declare function md5(message: string | number | any[]): string;

/**
 * Computes the SHA-1 hash of a string.
 * @param message The string or data to hash.
 * @returns The 40-character hexadecimal SHA-1 hash.
 */
declare function sha1(message: string | number | any[]): string;
/**
 * Computes the SHA-256 hash of a string.
 * @param message The string to hash.
 * @returns The 64-character hexadecimal SHA-256 hash.
 */
declare function sha256(message: string): string;

/**
 * Computes the SHA-224 hash of a string.
 * @param message The string to hash.
 * @returns The 57-character hexadecimal SHA-224 hash.
 */
declare function sha224(message: string): string;

/**
 * A collection of utility functions.
 */
declare const utility: {

  /**
   * Provides tools for Base64 encoding and decoding.
   */
  base64: {
    /**
     * Decodes a Base64 encoded string into its original UTF-8 string representation.
     * @param content The Base64 encoded string to decode.
     * @returns The original decoded string.
     */
    from: (content: string) => string;

    /**
     * Encodes a string into Base64 format.
     * @param content The original string to encode.
     * @returns The resulting Base64 encoded string.
     */
    to: (content: string) => string;
  };

  /**
   * Generates an array of numbers within a specified range, inclusive.
   * @param minVal The starting number of the sequence.
   * @param maxVal The ending number of the sequence.
   * @returns An array of consecutive numbers.
   */
  numberArray: (minVal: number, maxVal: number) => number[];

  /**
   * Selects a random element from an array.
   * @param list The array containing elements of any type.
   * @returns A randomly selected element from the array.
   */
  randomChoose: <T>(list: Array<T>) => T;
};
`;

const customLibUri = 'ts:filename/my-custom-lib.d.ts';

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

export default function Javascript() {
  const [isClient, setIsClient] = useState(false);

  const [ctn, chgCtn] = useLocalStorage<string>(
    'tool/javascript:content',
    defaultText,
  );

  const [ingSaveKey, setSaveKeySta] = useState<boolean>(false);

  const [transpiledJs, setTranspiledJs] = useState("");
  const [transpileError, setTranspileError] = useState<string | null>(null);

  const libRef = useRef<any>(null);

  const saveSystem = {
    save: function () {
      ele.save().classList.add(style["show"])
      ele.fileName().focus()
    },
    no: function () {
      ele.save().classList.remove(style["show"])
    },
    yes: function () {
      functions.download(nowContent, `${ele.fileName().value || "untitled"}.ts`)
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
    if (!isClient) return;

    try {
      const output = ts.transpileModule(ctn, {
        compilerOptions: {
          module: ts.ModuleKind.None,
          target: ts.ScriptTarget.ESNext,
          removeComments: true,
        },
      });
      setTranspiledJs(output.outputText);
      setTranspileError(null);
    } catch (e) {
      setTranspileError("TypeScript 轉譯失敗！");
      console.error(e);
    }
  }, [ctn, isClient]);

  useEffect(() => {
    setIsClient(true);

    if (ctn === defaultText) {
      const randomInitialText = functions.randomChoose<string>(TextList)!
      chgCtn(randomInitialText, { save: false });
    }

    const attachFunctionsToWindow = () => {
      (window as any).md5 = md5;
      (window as any).sha1 = sha1;
      (window as any).sha256 = sha256;
      (window as any).sha224 = sha224;
      (window as any).utility = utility;
    };

    const cleanupFunctionsFromWindow = () => {
      delete (window as any).md5;
      delete (window as any).sha1;
      delete (window as any).sha256;
      delete (window as any).sha224;
      delete (window as any).utility;
    };

    attachFunctionsToWindow();

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
      cleanupFunctionsFromWindow();
      libRef.current?.dispose();
    }
  }, [ingSaveKey])

  useEffect(() => {
    nowContent = ctn
  }, [ctn])

  const contentToRender = isClient ? ctn : defaultText;

  return (
    <>
      <HeadSetting title='TypeScript 計算機' ogp={{
        title: "TypeScript 計算機",
        description: "反正 有些人就喜歡用JS算數學嘛",
        color: toolsColor,
      }} />
      <FileDrop onEvent={(e) => {
        const file = e[0]
        if (file) {
          functions.readFile(file,
            (content) => {
              tmpText = content?.toString() || "你確定裏面有寫東西嗎owo?"
              importSystem.import()
            }
          );
          (document.getElementById("FileName")! as HTMLInputElement).value = file.name.replace(/\.(ts|js)$/, "");

          saveSystem.no()
        }
      }} onlyOneFile={true} />

      <div id={style["Save"]}>
        <div className={style["Window"]}>
          <div className={style["main"]}>
            {"將這份草稿紙另存爲"}<input placeholder='無標題' type="text" id='FileName' />{".ts"}
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
            {"你確定要直接覆寫你現在的草稿紙嗎？"}
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
              {"TypeScript 計算機"}
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
              language="typescript"
              value={contentToRender}
              onChange={e => {
                chgCtn(e || "")
              }}
              theme='hc-black'
              onMount={(editor, monaco) => {
                libRef.current = (monaco.languages.typescript as any).typescriptDefaults.addExtraLib(customLibSource, customLibUri);
              }}
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
            <CustomMarkdown input=
              {
                `${(() => {
                  if (transpileError) {
                    return `**Transpilation Error:**\n\`\`\`\n${transpileError}\n\`\`\``
                  }
                  try {
                    return eval(`{\n${transpiledJs}\n}`)
                  } catch (err) {
                    const _err = (err as Error)
                    return `**Runtime Error:**\n\`\`\`\n${_err.name}: ${_err.message}\n\`\`\``
                  }
                })() || "**None**"}`
              }
            />
          </div>
        </div>
      </div>
    </>
  )
}