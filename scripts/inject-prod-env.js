const fs = require('fs');
const path = require('path');

const envDir = path.join(__dirname, '..', 'src', 'environments');
const targetFiles = ['environment.prod.ts', 'environment.staging.ts'];

const replacements = {
  '__DO_SPACES_ACCESS_KEY__': process.env.DO_SPACES_ACCESS_KEY,
  '__DO_SPACES_SECRET_KEY__': process.env.DO_SPACES_SECRET_KEY,
  '__MAPBOX_PUBLIC_KEY__': process.env.MAPBOX_PUBLIC_KEY,
  '__MAPBOX_SECRET_KEY__': process.env.MAPBOX_SECRET_KEY,
};

for (const [placeholder, value] of Object.entries(replacements)) {
  if (!value) {
    console.error(`Missing environment variable for placeholder ${placeholder}`);
    process.exit(1);
  }
}

for (const fileName of targetFiles) {
  const filePath = path.join(envDir, fileName);
  let content = fs.readFileSync(filePath, 'utf8');

  for (const [placeholder, value] of Object.entries(replacements)) {
    content = content.split(placeholder).join(value);
  }

  fs.writeFileSync(filePath, content);
  console.log(`Injected production secrets into ${fileName}`);
}
