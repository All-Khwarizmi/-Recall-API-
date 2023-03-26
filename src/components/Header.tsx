import Head from 'next/head';
import React from 'react'

const Header = () => {
  return (
    <Head>
      <title>Recal</title>
      <meta
        name="description"
        content="Recal is the best, neuroscience based, way to scheudle a study planning and remember things on the long run. We handle the scheduling and the optimization part so can be more efficient and productive."
      />
      <link rel="icon" href="/memory-recall.png" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, viewport-fit=cover"
      />
    </Head>
  );
}

export default Header