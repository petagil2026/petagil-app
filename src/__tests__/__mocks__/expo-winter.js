// Mock for expo winter runtime modules to prevent "import outside scope" errors in Jest.
// The expo winter runtime installs lazy global getters (TextDecoder, URL, structuredClone,
// __ExpoImportMetaRegistry, etc.) that call require() when first accessed. If Jest closes
// the module registry before these getters fire (during teardown), it throws
// "You are trying to import a file outside of the scope of the test code."
// Mapping these to this no-op mock prevents the lazy getters from being installed.
module.exports = {
  default: {},
  ImportMetaRegistry: { url: '' },
  installFormDataPatch: function () {},
  installGlobal: function () {},
};
