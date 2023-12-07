const path = require("path");

// Get and export the directory name of the main module's filename
module.exports = path.dirname(require.main.filename);
