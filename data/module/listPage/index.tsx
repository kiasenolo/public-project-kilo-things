import type { NextPage } from 'next'
import React, { useEffect } from 'react'
import HeadSetting from '@/data/components/HeadSetting'
import ScrollFrame, { ButtonType, TitleType } from '@/data/components/ScrollFrame';
import fs from 'fs';
import ScrollFrameButton from '@/data/components/ScrollFrameButton';

type OptionType = {
  title: string,
  rootDir: string,
  urlPath: string,
  frameButton: ButtonType,
  frameTitle: TitleType,
}

export default function ListPage(option: OptionType) {
  const title = option.title

  interface PageData {
    href: string
    name: string
    info: string
  }

  interface PageProps {
    pageList: Array<PageData>
  }

  const page: NextPage<PageProps> = (prop) => {
    return (
      <>
        <HeadSetting title={title} />
        <ScrollFrame
          button={option.frameButton}

          title={option.frameTitle}

          type='div'

        >
          {prop.pageList.map((e, i) =>
            <ScrollFrameButton {...e} key={i} />
          )}
        </ScrollFrame>
      </>
    )
  }

  function getStaticProps() {
    const { rootDir, urlPath } = option

    const Pages = fs.readdirSync(`${process.cwd()}/pages/${rootDir}`)
      .filter(file =>
        fs.lstatSync(`${process.cwd()}/pages/${rootDir}/${file}`).isDirectory()
      )

    const PageList: Array<PageData> = []

    for (const page of Pages) {
      const jsonSrc = `${process.cwd()}/pages/${rootDir}/${page}/info.json`
      let json = `{"name":"${page}","info"\`info.json\` no found"}`

      if (fs.existsSync(jsonSrc)) {
        json = fs.readFileSync(jsonSrc, "utf-8")
      }

      PageList.push({
        href: `${urlPath}/${page}`,
        ...JSON.parse(json)
      })
    }

    return {
      props: { pageList: PageList }
    }
  }

  return {
    page,
    getStaticProps,
    title
  }
}