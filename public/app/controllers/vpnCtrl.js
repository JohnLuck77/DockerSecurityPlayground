var dsp_vpnCtrl = function($scope, SafeApply, $routeParams, BreadCrumbs, SocketService, $uibModal, Constants, ServerResponse, Notification,$http,CurrentLabService , $location, AjaxService, FileSaver, Blob) {
  function downloadFile(nameFile, content) {
  };
  $scope.newVPN = "";
  $scope.listVPN = [];
  $scope.notify = "";
  AjaxService.getAllVPN()
    .then(function s(response) {
      $scope.listVPN = response.data.data;
    }, function(err) {
      Notification(err.message, 'error');
    })


  $scope.download = function(vpnName) {
    AjaxService.getVPN(vpnName)
      .then(function s(response) {
        var content = response.data.data;
        var data = new Blob([content], { type: 'text/plain;charset=utf-8' });
        FileSaver.saveAs(data, vpnName+".ovpn");
      }, function(err) {
        Notification(err.message, 'error');
      })
  }
  $scope.createVPN = function(vpnName) {
    SocketService.manage(JSON.stringify({
      action : 'vpn_create',
      params : {
        name : $scope.newVPN,
      }
    }), function(event) {
      var data = JSON.parse(event.data);
      switch (data.status) {
        case 'success':
          Notification("VPN Created", 'success');
          $scope.notify ="";
          $scope.listVPN.push($scope.newVPN);
          break;
        case 'error':
          Notification({message: data.message}, 'error');
          break;
        default:
          console.log("Update");
          $scope.notify += data.message;
          break

      }
    })
  }
  $scope.remove = function(vpnName) {
    console.log("remove");
  }
}
