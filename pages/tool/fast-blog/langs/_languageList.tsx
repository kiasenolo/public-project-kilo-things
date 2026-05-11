import NotAPage from "@/data/components/NotAPage"

import { ZH_TW } from "./ZH-TW";
import { EN_GB } from "./EN-GB";
import { EN_US } from "./EN-US";
import { ES_ES } from "./ES-ES";
import { ZH_CN } from "./ZH-CN";
import { JA_JP } from "./JA-JP";
import { languageType } from "./_languageType";

export type languageListType = "ZH-TW" | "ZH-CN" | "EN-US" | "EN-GB" | "JA-JP" | "ES-ES"

export const languageList: languageListType[] = [
  "ZH-TW",
  "ZH-CN",
  "EN-US",
  "EN-GB",
  "JA-JP",
  "ES-ES"
]

export const lang: { [key in languageListType]: languageType } = {
  "ZH-TW": ZH_TW,
  "ZH-CN": ZH_CN,
  "EN-US": EN_US,
  "EN-GB": EN_GB,
  "JA-JP": JA_JP,
  "ES-ES": ES_ES
}

export default function () {
  return <NotAPage info={[
    "这个是fast-blog的语言列表"
  ]} />
}