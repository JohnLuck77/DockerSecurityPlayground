const dockerJS = require('mydockerjs').docker;
const async = require('async');
const appUtils = require('../util/AppUtils');
const log = appUtils.getLogger();
const fs = require('fs');
const path = require('path');
const recursive  = require('recursive-readdir');
const checker = require('./AppChecker');
const pathExists = require('path-exists');
const prefixVPN = "dsp-vpn-";


const vpnImage = "dockersecplayground/vpn:latest";
const dspHostname = "localhost";

function createVolume(name, cb) {
  log.info("[DOCKER VPN] Create Volume");
  dockerJS.createVolume(prefixVPN + name, cb);
}
function _getBaseIp(subnet) {
  const splitted = subnet.split("/");
  return splitted[0].replace(/.$/,"0");
}
function _getSubnet(ip) {
  return ip.replace(/.$/, "0") + "/24";
}

function ovpnGenConfig(name, cb, notifyCallback) {
  log.info("[DOCKER VPN] Generate Configuration ");
  var options = {
    logDriver: "none",
    rm: true,
    volumes: [
      {hostPath: prefixVPN + name, containerPath: "/etc/openvpn"}
    ],
    cmd: `ovpn_genconfig -u udp://${dspHostname}`
  }
  dockerJS.run(vpnImage, cb, options, notifyCallback);
}
function ovpnInitPki(name, cb, notifyCallback) {
  log.info("[DOCKER VPN] Init Pki");
  var options = {
    logDriver: "none",
    rm: true,
    volumes: [
      {hostPath: prefixVPN + name, containerPath: "/etc/openvpn"}
    ],
    cmd: "ovpn_initpki"
  }
  dockerJS.run(vpnImage, cb, options, notifyCallback);
}
function ovpnGenClient(name, cb, notifyCallback) {
  var theName = prefixVPN + name;
  log.info("[DOCKER VPN] Generate Client");
  var options = {
    logDriver: "none",
    rm: true,
    volumes: [
      {hostPath: theName, containerPath: "/etc/openvpn"}
    ],
    cmd: `easyrsa build-client-full ${theName}  nopass`
  }
  dockerJS.run(vpnImage, cb, options, notifyCallback);
}

function ovpnGetClient(name, cb, notifyCallback) {
  var theName = prefixVPN + name;
  var options = {
    logDriver: "none",
    rm: true,
    volumes: [
      {hostPath: theName, containerPath: "/etc/openvpn"}
    ],
    cmd: `ovpn_getclient ${theName}`
  }
  dockerJS.run(vpnImage, cb, options, notifyCallback);
}

function ovpnEditVPN(vpnName, certificateName, networkSubnet, netmask, cb) {
  log.info("[DOCKER VPN] Attach the network");
  const theName = prefixVPN + vpnName;
  const baseIp = _getBaseIp(networkSubnet);

  var options = {
    logDriver: "none",
    rm: true,
    volumes: [
      {hostPath: theName, containerPath: "/etc/openvpn"}
    ]
  };
  const cmd = `echo push \\"route ${baseIp} ${netmask}\\" >> /etc/openvpn/openvpn.conf `
  dockerJS.exec(theName, cmd,  cb);
}
function ovpnRemoveVPN(vpnName, certificateName, networkSubnet, netmask, cb) {

  log.info("[DOCKER VPN] Detach the network");
  const theName = isVPN(vpnName)? vpnName : prefixVPN + vpnName;
  const baseIp = _getBaseIp(networkSubnet);
  // var options = {
  //   logDriver: "none",
  //   rm: true,
  //   volumes: [
  //     {hostPath: theName, containerPath: "/etc/openvpn"}
  //   ]
  // }

  const cmd = `sed -i "/${baseIp}/d" /etc/openvpn/openvpn.conf`
  dockerJS.exec(theName, cmd, cb);
}
function runVPN(vpnName, hostPort, cb) {
  var theName = prefixVPN + vpnName;
  log.info(`[DOCKER VPN] Run ${theName} VPN  `);
  var options = {
    name: theName,
    detached: true,
    cap_add: "NET_ADMIN",
    ports: { '1194/udp': hostPort},
    volumes: [
      {hostPath: theName, containerPath: "/etc/openvpn"}
    ]
  }
  dockerJS.run(vpnImage, cb, options);
}
function stopVPN(vpnName, cb) {
  dockerJS.rm(prefixVPN + vpnName, cb, true);
}

function createVPN(name, outputPath, callback, notifyCallback) {
  log.info("[DOCKER VPN] Create VPN");
  var theName = prefixVPN + name;
  // Create volume
  async.waterfall([
    (cb) => checker.checkAlphabetic(name, cb),
    (cb) => removeVPN(name, outputPath, cb),
    (cb) => createVolume(name, cb),
    (data, cb) => ovpnGenConfig(name, cb, notifyCallback),
    (data, cb) => ovpnInitPki(name, cb, notifyCallback),
    (data, cb) => ovpnGenClient(name, cb, notifyCallback),
    (data, cb) => ovpnGetClient(name, cb, notifyCallback),
    (data, cb) =>  fs.writeFile(path.join(outputPath, `${theName}.ovpn`), data, cb)
  ], (err, data) => {
    callback(err, data)});
}

function getCertificateVPN(name, certificatesPath, callback) {
  var theName = prefixVPN + name;
  checker.checkAlphabetic(name, (err) => {
    if (err) {
      callback(err);
    } else {
      fs.readFile(path.join(certificatesPath, `${theName}.ovpn`), callback);
    }
  });
}

function editCertificateVPN(name, certificatesPath, network, subnet, callback) {
  var theName = prefixVPN + name;
  async.waterfall([(cb) => getCertificateVPN(name, certificatesPath, cb),
    (certificate, cb) => {
      const newCert = addPushRoute(certificate, network, subnet);
      cb(null, newCert);
    }, (newCertificate, cb) => fs.writeFile(path.join(certificatesPath, `${theName}.ovpn`), newCertificate, cb)],
    (err) => callback(err));
}


// TBD Remove certificate
function removeVPN(name, vpnDir, callback) {
  log.info("[DOCKER VPN] Remove previous volume");
  var theName = prefixVPN + name;
  async.waterfall([
    (cb) => checker.checkAlphabetic(name,  cb),
    (cb) => {
      pathExists(path.join(vpnDir, `${theName}.ovpn`))
        .then((exists) => {
          if (exists) {
            fs.unlink(path.join(vpnDir, `${theName}.ovpn`), cb);
          } else {
            cb(null);
          }
        });
    },
    (cb) => dockerJS.removeVolume(theName, (cb))
  ], (err) => {
    // Skip if volume already does not exists
    if(err && err.message.includes("No such volume")) {
      callback(null);
    } else {
      callback(err);
    }
  });
}

function getNames(vpnDir, callback) {
  async.waterfall([(cb) => fs.readdir(vpnDir, cb),
    (data, cb) => {
      cb(null, data.filter((d) => {
        return path.extname(d) === ".ovpn";
      }).map((d) => path.parse(d).name.replace(prefixVPN, "")));
    }], (err, data) => callback(err, data));
}
function getAllVPN(vpnDir, callback) {
  async.waterfall([(cb) => getNames(vpnDir, cb),
    (names, cb) => cb(null, names.map((n) => {
      return {
        name: n
      }
    })),
    (namesObj, cb) => {
      async.eachSeries(namesObj, (n, c) => {
        dockerJS.isRunning(prefixVPN + n.name, (err, isRunning) => {
          if (err) {
            c(err);
          } else {
            n.isRunning = isRunning;
            c(null);
          }
        });
      }, (err) => cb(err, namesObj));
    },
    (namesObj, cb) => {
      async.eachSeries(namesObj, (n, c) => {
        n.attachedNetworks = [];
        dockerJS.getInfoContainer(prefixVPN + n.name, (err, data) => {
        const networks = JSON.parse(data);
        const r = Object.keys(networks.NetworkSettings.Networks).filter((x) => x !== "bridge" );
        n.attachedNetworks = r;
        c(err);
        })
      }, (err) => cb(err, namesObj));
    }], (err, data) => callback(err, data));
}
function isVPN(vpnName) {
  return vpnName.startsWith(prefixVPN);
}
function attach (vpnName, certificatesPath, networkName, callback) {
  async.waterfall([
  (cb) => dockerJS.getNetwork(networkName, cb),
    (data, cb) => {
      const networkSubnet = data.IPAM.Config[0].Subnet;
      cb(null, networkSubnet);
  },
  (networkSubnet, cb) => ovpnEditVPN(vpnName, certificatesPath, networkSubnet, "255.255.255.0", cb),
  (ret, cb) => dockerJS.connectToNetwork(isVPN(vpnName) ? vpnName : prefixVPN + vpnName, networkName, cb)
  ],(err) => callback(err));
}
function detach (vpnName, certificatesPath, networkName, callback) {
  async.waterfall([
  (cb) => dockerJS.getNetwork(networkName, cb),
    (data, cb) => {
      const networkSubnet = data.IPAM.Config[0].Subnet;
      cb(null, networkSubnet);
  },
  (networkSubnet, cb) => ovpnRemoveVPN(vpnName, certificatesPath, networkSubnet, "255.255.255.0", cb),
  (data, cb) => dockerJS.disconnectFromNetwork(isVPN(vpnName) ? vpnName : prefixVPN + vpnName, networkName, cb)
  ],(err) => callback(err));
  }

function addPushRoute (openvpnConfig, network, subnet) {
  const toAppend = `push "route ${network} ${subnet}"`;
  return openvpnConfig +  toAppend + "\n";
}

function removePushRoute (openvpnConfig, network, subnet) {
  const join =  openvpnConfig.split("\n").filter((v) => !v.includes(network)).join("\n");
  return join;
}

// function addPushRoute(openvpnConfig)

exports.createVPN = createVPN;
exports.getCertificateVPN = getCertificateVPN;
exports.editCertificateVPN = editCertificateVPN;
exports.getNames = getNames;
exports.getAllVPN = getAllVPN;
exports.removeVPN = removeVPN;
exports.runVPN = runVPN;
exports.stopVPN = stopVPN;
exports.attach = attach;
exports.detach = detach;
exports.addPushRoute = addPushRoute;
exports.removePushRoute = removePushRoute;
exports.isVPN = isVPN;
