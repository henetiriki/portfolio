const path = require('path');
const { format } = require('date-fns');
const jsonFile = require('jsonfile');

const generatedFile = path.join(
  process.cwd(),
  'fixtures',
  'generated',
  'build-time-config.json'
);

const config2json = () => {
  const config = {
    lastModified: format(Date.now(), 'dd/MM/yyyy'),
  };

  jsonFile.writeFile(generatedFile, config, { spaces: 2 }, err => {
    if (err) {
      console.error(`Error: ${err}`);
    }
  });
};

module.exports = config2json();
