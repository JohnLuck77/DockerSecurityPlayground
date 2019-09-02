const path = require('path');
const appRoot = require('app-root-path');
const localConfigPath = require(path.join(appRoot.path, 'config', 'local.config.json'));
const vpnDir = path.join(appRoot.path, localConfigPath.config.vpn_dir);
const dockerVPN = require('../util/docker_vpn.js');
const httpHelper = require('help-nodejs').httpHelper;
const async = require('async');
const Checker = require('../util/AppChecker.js');

// User walker to explore all project
function getAll(req, res) {
  dockerVPN.getNames(vpnDir, (err, data) => {
    httpHelper.response(res, err, data);
  });
}
function get(req, res) {
  async.waterfall([
    // Check if repo dir parameter exists
    (cb) => Checker.checkParams(req.params, ['name'], cb),
    (cb) => dockerVPN.getCertificateVPN(req.params.name, vpnDir, cb)
  ], (err, data) => httpHelper.response(res, err, data.toString()));
}


exports.getAll = getAll;
exports.get = get;
exports.version = '0.1.0';
