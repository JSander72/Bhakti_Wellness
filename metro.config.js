const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Exclude web-only packages from bundling for native platforms
config.resolver.blockList = [
  // Block @radix-ui packages which are web-only
  /@radix-ui\/.*/,
  /vaul/,
];

// Ensure we resolve react-native first for shared modules
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Let default resolution handle most cases
  if (moduleName.includes('@radix-ui') || moduleName === 'vaul') {
    // Return an empty module for blocked packages
    return {
      type: 'empty',
    };
  }
  
  // Use default resolver for everything else
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
