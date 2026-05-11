import React from 'react'
import HeadSetting, { HeadSettingProps } from '@/data/components/HeadSetting'
import ScrollFrame from '@/data/components/ScrollFrame'
import ScrollFrameButton from '@/data/components/ScrollFrameButton'

export interface ListItemData {
  href: string
  name: string
  info: string | string[]
}

interface LayoutConfig {
  title: string
  description: string
  fullInfo?: string[] | string,
  backBtn: {
    href: string
    hoverTips: string
  }
  headSetting?: HeadSettingProps
}

interface ListLayoutProps {
  items: ListItemData[]
  config: LayoutConfig
}

const ListLayout: React.FC<ListLayoutProps> = ({ items, config }) => {

  const backBtn = config.backBtn

  return (
    <>
      <HeadSetting title={config.title} {...config.headSetting} />

      <ScrollFrame
        button={{
          type: "link",
          href: backBtn.href,
          hoverTips: backBtn.hoverTips
        }}
        title={{
          text: config.title,
          hoverTips: config.description || config.title
        }}
        type='div'
      >
        {items.map((item, index) => (
          <ScrollFrameButton {...item} key={index} />
        ))}
      </ScrollFrame>
    </>
  )
}

export default ListLayout