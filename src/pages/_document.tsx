import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="stylesheet" href="/cesium/Widgets/widgets.css" />
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/cesium/Cesium.js" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
