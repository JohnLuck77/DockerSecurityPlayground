var dsp_vpnCtrl = function($scope, SafeApply, $routeParams, BreadCrumbs, SocketService, $uibModal, Constants, ServerResponse, Notification,$http,CurrentLabService , $location, AjaxService, FileSaver, Blob) {
  function downloadFile(nameFile, content) {
  };
  $scope.newVPN = "";
  $scope.listVPN = [];
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
  $scope.remove = function(vpnName) {
    console.log("remove");
  }
}
