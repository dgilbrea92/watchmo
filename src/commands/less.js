const { cleanAllFiles, removeProject, dataPaths, checkAndParseFile, writeJSON } = require('./utility/fileHelpers');
const fs = require('fs');
const chalk = require('chalk');
/*
THIS FUNCTION DEPENDS UPON THE FOLLOWING FILE STRUCTURE:
/src
|
-> /commands
|  |
|   -> /less.js
|
-> /watchmoData
   |
   -> /parsedData.json
   -> /snapshots.txt
*/

function less(projectName, remove = false) {
  const { rawDataPath, parsedDataPath, projectPath, projectNamesPath } = dataPaths(projectName);
  let projectNamesArray = checkAndParseFile(projectNamesPath);

  const removeProjectName = () => {
    projectNamesArray = projectNamesArray.filter((el) => (el !== projectName));
    writeJSON(projectNamesPath, projectNamesArray);
  }

  if (!fs.existsSync(projectPath)) {
    console.log(chalk.cyan.bold(`\nProject ${projectName} is not configured\nRun "watchmo configure ${projectName}" to create this project\n`));;
  }
  else if (!remove) {
    cleanAllFiles([parsedDataPath, rawDataPath]);
    console.log(chalk.cyan.italic.underline('FILES CLEAN'));
  } else {
    if (projectName === 'default') {
      console.log(chalk.red.bold.underline('Cannot remove default file'));
    } else {
      removeProject(projectName);
      removeProjectName();
      console.log(chalk.black.bgRed.bold.underline(`PROJECT ${projectName} DELETED`));

    }

  }

}

module.exports = {
  less
};
