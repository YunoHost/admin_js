import { fileURLToPath, URL } from 'url'
import { defineConfig, loadEnv, UserConfig } from 'vite'
import fs from 'fs'
import createVuePlugin from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { BootstrapVueNextResolver } from 'bootstrap-vue-next'

import supportedLocales from './src/i18n/supportedLocales'

const supportedDatefnsLocales = Object.entries(supportedLocales).map(
  ([locale, { dateFnsLocale }]) => {
    return dateFnsLocale || locale
  },
)

export default defineConfig(async ({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd())

  let config: UserConfig = {
    define: {
      // fake process.env for some deps
      'process.env': {},
    },
    resolve: {
      alias: [
        // this is required for the SCSS modules imports with `~` (node_modules)
        {
          find: /^~(.*)$/,
          replacement: fileURLToPath(
            new URL('./node_modules/$1', import.meta.url),
          ),
        },
        {
          find: '@',
          replacement: fileURLToPath(new URL('./src', import.meta.url)),
        },
      ],
    },
    css: {
      preprocessorOptions: {
        scss: {
          // To auto inject scss variables into componentns scope
          additionalData: `
            @import "@/scss/_variables.scss";
          `,
          // FIXME next line when bootstrap 5 scss is updated with new sass syntax
          silenceDeprecations: [
            'mixed-decls',
            'color-functions',
            'global-builtin',
            'import',
          ],
        },
      },
    },
    plugins: [
      createVuePlugin(),
      Components({
        resolvers: [BootstrapVueNextResolver()],
      }),
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id: string) => {
            // Circular import problems, this will merge core deps and api together
            if (!id.includes('node_modules') && id.includes('api/')) {
              return 'core'
            }
            // Translations
            if (id.includes('locales')) {
              const match = /.*\/i18n\/locales\/([\w-]+)\.json/.exec(id)
              return `locales/${match![1]}/translations`
            }
            // Split date-fns locales
            if (id.includes('date-fns')) {
              const match = /.*\/date-fns\/locale\/([\w-]+)\/.*\.js/.exec(id)
              if (match) {
                if (supportedDatefnsLocales.includes(match[1])) {
                  return `locales/${match[1]}/date-fns`
                } else {
                  // FIXME: currently difficult to cherry pick only needed locales,
                  // hopefully this chunk should not be fetched.
                  return 'locales/not-used'
                }
              } else {
                return 'date-fns'
              }
            }
          },
        },
      },
    },
  }

  if (mode === 'production') {
    return {
      ...config,
      base: '/yunohost/admin',
    }
  }
  // mode dev
  config = {
    ...config,
    server: {
      ...(env.VITE_LOCAL === 'true'
        ? {}
        : {
            port: 8080,
            host: env.VITE_IP,
            https: {
              // Use already created cert from yunohost instance
              key: fs.readFileSync('/etc/yunohost/certs/yunohost.org/key.pem'),
              cert: fs.readFileSync('/etc/yunohost/certs/yunohost.org/crt.pem'),
            },
            fs: {
              // Needed for special ynh-dev context where node_modules is symlinked
              allow: [
                '/ynh-dev/yunohost-admin/app',
                '/var/cache/ynh-dev/yunohost-admin/node_modules',
              ],
            },
          }),
      proxy: {
        '/yunohost': {
          target: `https://${env.VITE_IP}`,
          logLevel: 'info',
          secure: false,
        },
      },
    },
  }
  try {
    return (await import("./vite.config.local")).overrideConfig(config)
  } catch {
    return config
  }
})
