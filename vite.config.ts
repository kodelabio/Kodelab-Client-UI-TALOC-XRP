import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import macrosPlugin from 'vite-plugin-babel-macros';
import { VitePluginRadar } from 'vite-plugin-radar';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import rollupNodePolyFill from 'rollup-plugin-node-polyfills';
import packageJson from './package.json';
import path from 'path';

/* -----------------------------------------------------------
   Vite configuration
   ----------------------------------------------------------- */
export default defineConfig(({ mode }) => {
  /* 1.  Read every variable in .env (or the shell)
         – no --mode flags are required */
  const env = loadEnv(mode, process.cwd(), '');
  const chainId = env.VITE_DEFAULT_CHAIN_ID_NETWORK || '1440000';   // fallback if unset

  return {
    /* ---------------- server proxy ---------------- */
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          secure: false,
          rewrite: (url) => url.replace('/api', ''),
        }, 
        '/chain/api': {
          target: 'https://explorer.xrplevm.org/',
          changeOrigin: true,
          secure: false,
          rewrite: (url) => url.replace('/chain/api', ''),
        },
        '/evm-sidechain': {
          target: 'https://rpc.devnet.xrplevm.org',
          changeOrigin: true,
          secure: false,
          rewrite: (url) => url.replace('/evm-sidechain', ''),
        },
      },
    },

    /* ---------------- plugins ---------------- */
    plugins: [
      react({
        babel: {
          plugins: [['@babel/plugin-proposal-decorators', { legacy: true }]],
        },
      }),
      createSvgIconsPlugin({
        iconDirs: [path.resolve('./src/assets/svgs')],
        symbolId: 'icon-[dir]-[name]',
      }),
      macrosPlugin(),
      VitePluginRadar({
        analytics: { id: 'G-' },
      }),
    ],

    /* ---------------- paths / aliases ---------------- */
    base: './',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@img': path.resolve(__dirname, 'src/assets/img'),
        'bn.js': path.resolve(__dirname, 'node_modules/bn.js'),
        'bignumber.js': path.resolve(
          __dirname,
          'node_modules/bignumber.js/bignumber.js',
        ),

        /* 2.  One-line magic: static imports like
              `import vaults from '@mocks/vaults.json'`
              are rewritten to `src/mocks/<chainId>/vaults.json` */
        '@mocks': path.resolve(__dirname, `src/mocks/${chainId}`),

        // Example polyfill alias
        stream: 'rollup-plugin-node-polyfills/polyfills/stream',
      },
    },

    /* ---------------- optimisation / polyfills ---------------- */
    optimizeDeps: {
      esbuildOptions: {
        target: 'es2022',
        define: { global: 'globalThis' },
        plugins: [
          NodeGlobalsPolyfillPlugin({
            process: true,
            buffer: true,
          }),
        ],
      },
    },

    build: {
      target: 'es2022',
      rollupOptions: {
        plugins: [rollupNodePolyFill()],
        onwarn(warning, warn) {
          if (
            warning.message &&
            warning.message.includes("Module level directives cause errors when bundled")
          ) {
            return;
          }
          warn(warning);
        },
      },
    },

    /* ---------------- styles ---------------- */
    css: {
      preprocessorOptions: {
        less: {
          modifyVars: {
            hack: `true; @import "./src/assets/css/var.less";`,
          },
          javascriptEnabled: true,
        },
      },
    },

    /* ---------------- global constants ---------------- */
    define: {
      'import.meta.env.APP_VERSION': JSON.stringify(
        `${packageJson.version}${chainId === '1440000' ? '-Mainnet' : '-Testnet'}`
      ),
    },
  };
});