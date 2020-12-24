chrome.runtime.onConnect.addListener(function (externalPort) {
    externalPort.onDisconnect.addListener(function () {
      console.log("onDisconnect")
      // Do stuff that should happen when popup window closes here
    })
  
    console.log("onConnect");
  })