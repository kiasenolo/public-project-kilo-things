import fs from 'fs';
import path from 'path';

export const getListItems = (targetDir: string) => {
  const directoryPath = path.join(process.cwd(), "pages", targetDir);

  if (!fs.existsSync(directoryPath)) return [];

  const folders = fs.readdirSync(directoryPath)
    .filter(file =>
      fs.lstatSync(path.join(directoryPath, file)).isDirectory()
    );

  const items = [];

  for (const folder of folders) {
    const infoPath = path.join(directoryPath, folder, 'info.json');

    if (fs.existsSync(infoPath)) {
      const fileContent = fs.readFileSync(infoPath, 'utf-8');
      const data = JSON.parse(fileContent);

      const prefix = targetDir;
      const href = `/${prefix}/${folder}`.replace(/\/+/g, '/');

      items.push({
        href,
        folder,
        ...data
      });
    } else {
      const data = {
        "name": folder,
        "info": "`info.json` not found"
      };

      const prefix = targetDir;
      const href = `/${prefix}/${folder}`.replace(/\/+/g, '/');

      items.push({
        href,
        folder,
        ...data
      });
    }
  }

  return items.sort((a, b) => {
    return a.folder.localeCompare(b.folder, undefined, {
      numeric: true,
      sensitivity: 'base'
    });
  });
}