// conf.js
exports.config = {
  framework: 'jasmine',
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['person-get.js'],
  onPrepare: function() {
      global.isAngularSite = function(flag) {
          browser.ignoreSynchronization = !flag;
      };
  }
}
