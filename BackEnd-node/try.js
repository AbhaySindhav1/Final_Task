const fs = require('fs');

fs.unlink('upload/1681287835405Screenshot from 2023-04-04 15-30-58.png', (err) => {
  if (err) throw err;
  console.log('File deleted!');
});