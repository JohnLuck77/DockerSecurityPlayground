const networkData = require('../data/network.js');
const appRoot = require('app-root-path');
const dockerVPN = require('../util/docker_vpn.js');
const path= require('path');
const localConfigPath = require(path.join(appRoot.path, 'config', 'local.config.json'));
const vpnDir = path.join(appRoot.path, localConfigPath.config.vpn_dir);
const async = require('async');
const Checker = require('./AppChecker');





exports.createVPN = function createVPN(params, callback, notifyCallback) {
  async.waterfall([
    (cb) => Checker.checkParams(params, ['name'], cb),
    // Check if all images exists
    (cb) => dockerVPN.createVPN(params.name, vpnDir, cb, notifyCallback)],
    // End function , return correct or error
    (err) => callback(err));
}

