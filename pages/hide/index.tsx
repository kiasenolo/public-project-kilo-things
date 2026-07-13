import type { NextPage } from 'next'
import ListLayout, { ListItemData } from '@/data/components/ListLayout'
import { getListItems } from '@/data/components/ListLayout/getPages'

const fullInfo =
  `
# Hide / 隱藏區
給朋友的東西 額 就 對 反正不會被當成重點
就 想象一下我接委托 那種概念
`

export const toolsColor = "#646464"

interface Props {
  items: ListItemData[]
}

const ListPage: NextPage<Props> = ({ items }) => {
  return (
    <ListLayout
      items={items}
      config={{
        title: "隱藏區",
        description: "給朋友的東西",
        fullInfo,
        backBtn: {
          hoverTips: "<=\\\\ 幫朋友寫的神奇工具 [ root ]",
          href: "/",
        },
        headSetting: {
          ogp: {
            description: "針對朋友寫的東西",
            color: toolsColor
          }
        }
      }}
    />
  )
}

export default ListPage

export async function getStaticProps() {
  const items = getListItems('/hide');

  return { props: { items } }
}