import type { NextPage } from 'next';
import NotAPage from '@/data/components/NotAPage';

const AFKPage: NextPage = () => {
  return <NotAPage info={["Page Not Found", "Code : 404"]} />
}

export default AFKPage;