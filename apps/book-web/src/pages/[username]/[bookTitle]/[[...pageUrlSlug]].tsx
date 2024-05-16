import NextraLayout from '@/layouts/NextraLayout'
import { generateBookMetadata } from '@/lib/generateBookMetadata'
import { mdxCompiler } from '@/lib/mdx/compileMdx'
import getPages from '@/prefetch/getPages'

import { GetServerSideProps } from 'next'
import { MDXRemoteSerializeResult } from 'next-mdx-remote'

import { useRouter } from 'next/router'

type Props = {
  mdxSource: MDXRemoteSerializeResult
  mdxText: string
}

const Home = ({ mdxSource, mdxText }: Props) => {
  const router = useRouter()

  if (router.isFallback) {
    return <div>isFallback Loading...</div>
  }

  return <NextraLayout mdxSource={mdxSource} body={mdxText} />
}

export default Home

export const getServerSideProps = (async (ctx) => {
  const { params, req } = ctx
  const bookUrlSlug = `/${params?.username}/${params?.bookTitle}`

  // const queryClient = new QueryClient()
  // await queryClient.prefetchQuery({
  //   queryKey: useGetPagesQuery.getKey({ input: { book_url_slug: bookUrlSlug } }),
  //   queryFn: async () => await getPages(bookUrlSlug, req.cookies),
  // })

  const pages = await getPages(bookUrlSlug, req.cookies)

  if (pages) {
    generateBookMetadata({ pages: pages, bookUrl: bookUrlSlug })
  }

  const mdxText = `
  <Callout>${bookUrlSlug} hello!</Callout>

{/* wrapped with {} to mark it as javascript so mdx will not put it under a p tag */}
{<h1 className="text-center font-extrabold md:text-5xl mt-8">SWR</h1>}

El nombre “SWR” es derivado de \`stale-while-revalidate\`, una estrategia de
invalidación de caché HTTP popularizada por
[HTTP RFC 5861](https://tools.ietf.org/html/rfc5861). SWR es una estrategia para
devolver primero los datos en caché (obsoletos), luego envíe la solicitud de
recuperación (revalidación), y finalmente entrege los datos actualizados.

<div emoji="✅">
  Con SWR, el componente obtendrá <strong>constante</strong> y
  <strong>automáticamente</strong> el último flujo de datos.
  <br />Y la interfaz de usuario será siempre <strong>rápida</strong> y <strong>
    reactiva
  </strong>.
</div>

<div className="mb-20 mt-16 text-center">
  [Get Started](/docs/getting-started) · [Examples](/examples) · [Blog](/blog) ·
  [GitHub Repository](https://github.com/vercel/swr)
</div>

## Resumen

\`\`\`jsx filename="hello.js" {4-4}
import useSWR from 'swr'

function Profile() {
  const { data, error } = useSWR('/api/user', fetcher)

  if (error) return <div>failed to load</div>
  if (!data) return <div>loading...</div>
  return <div>hello {data.name}!</div>
}
\`\`\`

En este ejemplo, el hook \`useSWR\` acepta una \`key\` que es un cadena y una
función \`fetcher\`. \`key\` es un indentificador único de los datos (normalmente la
URL de la API) y pasará al \`fetcher\`. El \`fetcher\` puede ser cualquier función
asíncrona que devuelve datos, puedes utilizar el fetch nativo o herramientas
como Axios.

El hook devuelve 2 valores: \`data\` y \`error\`, basados en el estado de la
solicitud.

## Características

Con una sola línea de código, puede simplificar la obtención de datos en su
proyecto, y tambien tiene todas estas increíbles características fuera de caja:

- Obtención de datos **rápida**, **ligera** y **reutilizable**
- Caché integrada y deduplicación de solicitudes
- Experiencia en **tiempo real**
- Agnóstico al transporte y al protocolo
- SSR / ISR / SSG support
- TypeScript ready
- React Native

SWR le cubre en todos los aspectos de velocidad, correción, y estabilidad para
ayudarle a construir mejores experiencias:

- Navegación rápida por la página
- Polling on interval
- Dependencia de los datos
- Revalidation on focus
- Revalidation on network recovery
- Mutación local (Optimistic UI)
- Smart error retry
- Pagination and scroll position recovery
- React Suspense

And lot [more](/docs/getting-started).

## Comunidad

<p className="mt-6 flex h-6 gap-2">
  <img alt="stars" src="https://badgen.net/github/stars/vercel/swr" />
  <img alt="downloads" src="https://badgen.net/npm/dt/swr" />
  <img alt="license" src="https://badgen.net/npm/license/swr" />
</p>

SWR es creado por el mismo equipo que esta detrás de
[Next.js](https://nextjs.org), el framework de React. Sigan
[@vercel](https://twitter.com/vercel) en Twitter para futuras actualizaciones
del proyecto.

Sientase libre de unirse a
[discusiones en GitHub](https://github.com/vercel/swr/discussions)!
  `

  try {
    const mdxSource = await mdxCompiler(mdxText)

    return { props: { mdxSource, mdxText } }
  } catch (error) {
    throw new Error(`Error compiling MDX: ${JSON.stringify(error)}`)
  }
}) satisfies GetServerSideProps<
  {
    mdxSource: MDXRemoteSerializeResult
    mdxText: string
  },
  { username: string; bookTitle: string; pageUrlSlug: string[] }
>
