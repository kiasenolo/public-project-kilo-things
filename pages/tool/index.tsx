import type { NextPage } from 'next'
import ListLayout, { ListItemData } from '@/data/components/ListLayout'
import { getListItems } from '@/data/components/ListLayout/getPages'

const fullInfo =
  `
# Tool / 工具
一堆 寫給自己用的工具
有些我會很常用 有些不會
所有的操作邏輯 只有我自己清楚 只有我自己知道
是可以考慮寫文檔 但我懶惰
`

export const toolsColor = "#363636"

interface Props {
  items: ListItemData[]
}

const ListPage: NextPage<Props> = ({ items }) => {
  return (
    <ListLayout
      items={items}
      config={{
        title: "工具",
        description: "一些神奇的工具",
        fullInfo,
        backBtn: {
          hoverTips: "<=\\\\ 學會自給自足 也是一件很棒的事情啊 對吧？ [ root ]",
          href: "/",
        },
        headSetting: {
          ogp: {
            description: "自己寫的一些小工具 就 不一定好用",
            color: toolsColor
          }
        }
      }}
    />
  )
}

export default ListPage

export async function getStaticProps() {
  const items = getListItems('/tool');

  return { props: { items } }
}