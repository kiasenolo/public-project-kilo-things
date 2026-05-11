import { renderToStaticMarkup as RTS } from 'react-dom/server';
import type { NextPage } from 'next';
import ReactMarkdown from 'react-markdown';
import MDOptions from '../ScrollFrame/MDOptions';
import rehypeRaw from "rehype-raw";
import KD from '../KiloDown';
import { useEffect, useState } from 'react';

export interface OtherSetting {
  disableLineWrap?: boolean
  disableCorrections?: {
    imgRootDir: boolean
  }
}

export interface CorrectionSettings {
  rootDir?: string
}

export interface Options {
  DisableTitleToUrl?: boolean
}

interface CusMDProps {
  input: string
  settings?: OtherSetting
  correction?: CorrectionSettings
  options?: Options
}


const pad = (n: number) => n.toString().padStart(2, '0');

function formatDate(date: Date): string {
  return RTS(
    <KD.EmpText>
      {date.getFullYear()}<KD.ClipLineText2 />
      {pad(date.getMonth() + 1)}<KD.ClipLineText2 />
      {pad(date.getDate())} {pad(date.getHours())}:{pad(date.getMinutes())}:{pad(date.getSeconds())}
    </KD.EmpText>
  );
}


function applyCustomSyntax(input: string, rootDir?: string): string {
  return input

    /* [c:TEXT:c::COLOR] */
    .replace(/\[c:(.+?):c::(.+?)\]/g, (_match, text, color) =>
      RTS(<span style={{ color }}>{text}</span>)
    )

    /* [b:TEXT:b::COLOR] */
    .replace(/\[b:(.+?):b::(.+?)\]/g, (_match, text, color) =>
      RTS(<span style={{ backgroundColor: color }}>{text}</span>)
    )

    /* FRM:[WIDTHxHEIGHT]-(URL):FRM */
    .replace(/FRM:\[(.+?)x(.+?)\]-\((.+?)\):FRM/g, (_match, w, h, src) =>
      RTS(<iframe style={{ width: `${w}vw`, height: `${h}vh`, border: 'none' }} src={src} />)
    )

    /* ::TEXT:: */
    .replace(/::(.+?)::/g, (_match, text) =>
      RTS(<KD.EmpText>{text}</KD.EmpText>)
    )

    /* ||TEXT|| */
    .replace(/\|\|(.+?)\|\|/g, (_match, text) =>
      RTS(<KD.HideText>{text}</KD.HideText>)
    )

    /* ^^^TEXT^^^ */
    .replace(/\^\^\^(.+?)\^\^\^/g, (_match, text) =>
      RTS(<KD.ClipLineLarge2>{text}</KD.ClipLineLarge2>)
    )

    /* ***TEXT*** */
    .replace(/\*\*\*(.+?)\*\*\*/g, (_match, text) =>
      RTS(<KD.ClipLineLarge>{text}</KD.ClipLineLarge>)
    )

    /* ^^^ */
    .replace(/\^\^\^/g, () => RTS(<KD.ClipLineLarge2 />))

    /* *** */
    .replace(/\*\*\*/g, () => RTS(<KD.ClipLineLarge />))

    /* -#TEXT#- */
    .replace(/-#(.+?)#-/g, (_match, text) =>
      RTS(<KD.SmallText set-title="">{text}</KD.SmallText>)
    )

    /* /// */
    .replace(/\/\/\//g, () => RTS(<KD.ClipLineText />))

    /* [] */
    .replace(/\[\]/g, () => RTS(<KD.ClipLineText2 />))

    /* [ t:YYYYMMDD-HHMMSS ] [ t:YYYYMMDD ] [ t:HHMMSS ] [ t:cTIMECODE ] */
    .replace(/\[\s*t:(.*?)\s*\]/g, (_match, content: string) => {
      // Unix timestamp: t:c1712345678000
      if (content.startsWith('c')) {
        const ts = parseInt(content.slice(1), 10);
        if (!isNaN(ts)) return formatDate(new Date(ts));
        return _match;
      }

      // Date + time: t:20240101-120000
      if (content.includes('-')) {
        const m = content.match(/^(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})$/);
        if (m) {
          const [, yr, mo, dy, hh, mm, ss] = m;
          return RTS(
            <KD.EmpText>
              {yr}<KD.ClipLineText2 />{mo}<KD.ClipLineText2 />{dy}{' '}
              {hh}<KD.ClipLineText />{mm}<KD.ClipLineText />{ss}
            </KD.EmpText>
          );
        }
        return _match;
      }

      // Date only: t:20240101
      if (content.length === 8 && !isNaN(Number(content))) {
        const [yr, mo, dy] = [content.slice(0, 4), content.slice(4, 6), content.slice(6, 8)];
        return RTS(
          <KD.EmpText>
            {yr}<KD.ClipLineText2 />{mo}<KD.ClipLineText2 />{dy}
          </KD.EmpText>
        );
      }

      // Time only: t:120000
      if (content.length === 6 && !isNaN(Number(content))) {
        const [hh, mm, ss] = [content.slice(0, 2), content.slice(2, 4), content.slice(4, 6)];
        return RTS(
          <KD.EmpText>
            {hh}<KD.ClipLineText />{mm}<KD.ClipLineText />{ss}
          </KD.EmpText>
        );
      }

      return _match;
    })

    /* [>*ID*>] */
    .replace(/\[>\*(.*)\*>\]/g, (_match, id) => RTS(<a kilo-style="" id={'blog-nt-' + id} href={'#blog-note-' + id}>{'note-' + id}</a>))

    /* [<*ID*<] */
    .replace(/\[<\*(.*)\*<\]/g, (_match, id) => RTS(<a kilo-style="" id={'blog-note-' + id} href={'#blog-nt-' + id} >{'^note-' + id}</a>))

}


export const CustMarkdown: NextPage<CusMDProps> = (props: CusMDProps) => {
  const { settings: set, correction: crt, options: opt } = props;

  const [content, setContent] = useState<string>('');

  useEffect(() => {
    let _inp = props.input;

    if (!set?.disableLineWrap) {
      _inp = _inp.replace(/(.*)\r\n/g, '$1  \r\n');
      // Fall back for Unix line endings if no CRLF found
      if (!_inp.includes('\r\n')) _inp = _inp.replace(/(.*)\n/g, '$1  \n');
    }

    if (!set?.disableCorrections?.imgRootDir) {
      const prefix = crt?.rootDir ? `(./${crt.rootDir}/` : '(./';
      // Only rewrite relative paths that start with "./"
      _inp = _inp.replace(/\(\.?\.\//g, prefix);
    }

    _inp = applyCustomSyntax(_inp, crt?.rootDir);

    setContent(_inp);
  }, [props.input, set, crt]);

  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw]}
      {...MDOptions(opt?.DisableTitleToUrl)}
    >
      {content}
    </ReactMarkdown>
  );
};

export default CustMarkdown;