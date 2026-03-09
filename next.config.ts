import withSerwistInit from '@serwist/next'
import type { NextConfig } from 'next'

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  disable: true, // Temporarily disabled to debug production error
})

const nextConfig: NextConfig = {
  turbopack: {},
}

export default withSerwist(nextConfig)
