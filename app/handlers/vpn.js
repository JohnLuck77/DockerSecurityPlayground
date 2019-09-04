const path = require('path');
const appRoot = require('app-root-path');

const localConfigPath = require(path.join(appRoot.path, 'config', 'local.config.json'));
const vpnDir = path.join(appRoot.path, localConfigPath.config.vpn_dir);
const dockerVPN = require('../util/docker_vpn.js');
const httpHelper = require('help-nodejs').httpHelper;
const async = require('async');
const Checker = require('../util/AppChecker.js');
const dockerJS = require('mydockerjs').docker;

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

function remove(req, res) {
  async.waterfall([
    // Check if repo dir parameter exists
    (cb) => Checker.checkParams(req.params, ['name'], cb),
    (cb) => dockerVPN.removeVPN(req.params.name, vpnDir, cb)
  ], (err) => httpHelper.response(res, err))
}

function attach(req, res) {
  async.waterfall([
    // Check if repo dir parameter exists
    (cb) => Checker.checkParams(req.body, ['networkName', 'vpnName'], cb),
    // (cb) => dockerVPN.runVPN(req.body.vpnName, 1194, cb),
    (cb) => dockerJS.connectToNetwork(req.body.vpnName, req.body.networkName, cb)
  ], (err) => httpHelper.response(res, err));
}
function detach(req, res) {
  async.waterfall([
    // Check if repo dir parameter exists
    (cb) => Checker.checkParams(req.body, ['networkName', 'vpnName'], cb),
    // (cb) => dockerVPN.runVPN(req.body.vpnName, 1194, cb),
    (cb) => dockerJS.disconnectFromNetwork(req.body.vpnName, req.body.networkName, cb)
  ], (err) => httpHelper.response(res, err));
}

function run(req, res) {
  async.waterfall([
    // Check if repo dir parameter exists
    (cb) => Checker.checkParams(req.body, ['vpnName'], cb),
    (cb) => dockerVPN.runVPN(req.body.vpnName, 1194, cb),
  ], (err) => httpHelper.response(res, err));
}
function stop(req, res) {
  async.waterfall([
    // Check if repo dir parameter exists
    (cb) => Checker.checkParams(req.body, ['vpnName'], cb),
    (cb) => dockerVPN.stopVPN(req.body.vpnName, cb),
  ], (err) => httpHelper.response(res, err));
}


exports.getAll = getAll;
exports.get = get;
exports.remove = remove;
exports.attach = attach;
exports.detach = detach;
exports.run = run;
exports.stop = stop;
exports.version = '0.1.0';
