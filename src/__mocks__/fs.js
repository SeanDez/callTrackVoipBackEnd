const fs = jest.createMockFromModule('fs');

function readdirSync(fileName) {
  console.log(`The file name passed to this fake fs.readdirSync method is: ${fileName}`);

  return 'return value from fake fs.readdirSync';
}

function specialMethod() {
  return 'returned from the special method';
}

fs.readdirSync = readdirSync;
fs.specialMethod = specialMethod;

module.exports = fs;
