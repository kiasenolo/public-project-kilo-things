import { useEffect, useMemo, useState } from "react"
import style from "./style.module.scss"
import KD from "@/data/components/KiloDown"
import HeadSetting from "@/data/components/HeadSetting"
import { _app } from "@/pages/_app"

function TEST() {
  const [inputTxt, _inputTxt] = useState("測試用")

  const afterFilter = useMemo(() => {
    const symboList = "。”“—【】，」！？\n… 「-）（~～』『"

    function filterSymbo(ctn: string) {
      return ctn.split("").filter(e => !symboList.split("").some(s => e === s))
    }

    return filterSymbo(inputTxt).join("");
  }, [inputTxt])

  useEffect(()=>{
    _app.setColor("#74ffa3")
  },[])

  return (<div id={style["Root"]}>
    <HeadSetting title='算字數的神奇東西' description="給我們的葉子大老闆用的" ogp={{
      color: "#74ffa3",
    }} />
    <textarea placeholder="字放這裏" value={inputTxt} onChange={e => _inputTxt(e.currentTarget.value)}></textarea>
    <br />
    <KD.Title>{"處理後結果 （自行檢查有沒有多餘的標點符號）"}</KD.Title>
    <div className={style["content"]}>{afterFilter}</div>
    <KD.Title>{`字數 / 長度 : ${afterFilter.length}`}</KD.Title>
    <KD.Title>{`8個字兩塊 : ${afterFilter.length / 4}塊`}</KD.Title>

  </div>)
}

export default TEST
