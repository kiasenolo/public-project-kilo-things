import type { NextPage } from 'next';
import Link from 'next/link';
import style from '../ScrollFrame/style.module.scss';
import RMD from '@/data/components/CustomMarkdown'

interface ButtonProps {
  href: string
  name: string
  info: string | string[]
}

const ScrollFrame: NextPage<ButtonProps> = (props) => {
  return (
    <>
      <div className={style["ScrollFrameButton"]}>
        <Link href={props.href} className={style["name"]}>
          {props.name}
        </Link>
        <div className={style["tips"]}>
          <RMD input={Array.isArray(props.info) ? props.info.join("\n") : props.info}></RMD>
        </div>
      </div>
    </>
  );
}
export default ScrollFrame;