// Dev stub: real Delta Chat clients inject their own window.webxdc.
// This only loads outside Delta Chat (e.g. Lovable preview / browser).
(function () {
  if (window.webxdc) return;
  window.webxdc = {
    selfAddr: "you@localhost",
    selfName: "You",
    sendUpdate: function (update, descr) {
      console.log("[webxdc stub] sendUpdate", update, descr);
    },
    setUpdateListener: function () {
      return Promise.resolve();
    },
    getAllUpdates: function () {
      return Promise.resolve([]);
    },
    sendToChat: function () {},
  };
})();
