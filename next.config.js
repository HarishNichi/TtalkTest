/** @type {import('next').NextConfig} */

const cspHeader = `
    default-src 'self' https://ez7bnwrmz5.execute-api.ap-northeast-1.amazonaws.com/ https://${process.env.AWS_BRANCH}.ttalk.nichi.in/ https://t-talk-${process.env.AWS_BRANCH}.s3.ap-northeast-1.amazonaws.com/;
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    connect-src 'self' https://${process.env.AWS_BRANCH}.ttalk.nichi.in/ https://t-talk-${process.env.AWS_BRANCH}.s3.ap-northeast-1.amazonaws.com/ https://${process.env.AWS_BRANCH}.ttalk.nichi.in/ https://ez7bnwrmz5.execute-api.ap-northeast-1.amazonaws.com/ wss://*.appsync-realtime-api.ap-northeast-1.amazonaws.com  https://*.appsync-api.ap-northeast-1.amazonaws.com;
`
const nextConfig = {
  compiler: { styledComponents: true },
  reactStrictMode: true,
  trailingSlash: false,
  poweredByHeader: false,

  // output: 'export', // To enable a static export, change the output mode !!
  env: {
    NEXT_PUBLIC_AWS_BRANCH: process.env.AWS_BRANCH,
    NEXT_PUBLIC_AWS_APPSYNC_GRAPHQLENDPOINT: process.env.AWS_APPSYNC_GRAPHQLENDPOINT,
    NEXT_PUBLIC_AWS_APPSYNC_REGION: process.env.AWS_APPSYNC_REGION,
    NEXT_PUBLIC_AWS_APPSYNC_AUTHENTICATIONTYPE:   process.env.AWS_APPSYNC_AUTHENTICATIONTYPE,
    NEXT_PUBLIC_AWS_APPSYNC_APIKEY: process.env.AWS_APPSYNC_APIKEY,
    customKey:
      process.env.NODE_ENV === "development" ? "my-value-dev" : "my-value-prod",
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ''),
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ]
  },

};



module.exports = nextConfig;
