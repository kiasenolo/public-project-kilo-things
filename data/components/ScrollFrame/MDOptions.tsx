import KD from '../KiloDown';
import functions from '@/data/module/functions';
import remarkGfm from 'remark-gfm';
import rehypeRaw from "rehype-raw";
import { sha256 } from 'js-sha256';
import { Options } from 'react-markdown';
import { ReactNode } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';

const titleId = (lev?: number, children?: ReactNode | ReactNode[] | null,) => {
  return `${lev}-${sha256(functions.toBase64(children as string))}`
}

const MDOptions: ((DisableTitleToUrl?: boolean) => Readonly<Options>) = (DIsableTitleToUrl?: boolean) => {
  const DTTU = DIsableTitleToUrl;
  return {
    components: {
      h1: ({ ...props }) => <KD.Title {...props} id={DTTU ? undefined : titleId(1, props.children)} />,
      h2: ({ ...props }) => <KD.Subtitle {...props} id={DTTU ? undefined : titleId(2, props.children)} />,
      h3: ({ ...props }) => <KD.Thirdtitle {...props} id={DTTU ? undefined : titleId(3, props.children)} />,
      a: ({ ...props }) => <a {...props} kilo-style="" hover-tips={props.href} />,
      blockquote: ({ ...props }) => <KD.InnerContent  {...props} />,
      hr: ({ ...props }) => <KD.ClipLineLarge set-title="" {...props} />,
      code: ({ ...props }) => <KD.CodeText {...props} />
    },
    remarkPlugins: [
      remarkGfm,
    ],
    rehypePlugins: [
      rehypeRaw
    ],
    children: ""
  }
}


export default MDOptions