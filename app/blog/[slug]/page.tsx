import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getBlogBySlug } from "@/lib/data"
import { notFound } from "next/navigation"

interface BlogArticlePageProps {
  params: Promise<{ slug: string }>
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { slug } = await params

  const blog = await getBlogBySlug(slug)

  if (!blog) {
    notFound()
  }

  return (
    <main className="min-h-screen">
      <Header />

      <article>
        <section className="pt-32 pb-12 md:pt-40 md:pb-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-6 md:px-12">
            <div className="max-w-3xl mx-auto">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground text-sm mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour au blog
              </Link>

              {blog.publishedAt && (
                <time
                  className="block text-primary-foreground/60 text-sm mb-4"
                  dateTime={new Date(blog.publishedAt).toISOString()}
                >
                  {format(new Date(blog.publishedAt), "dd MMMM yyyy", {
                    locale: fr,
                  })}
                </time>
              )}

              <h1
                className="text-3xl md:text-4xl lg:text-5xl font-medium leading-[1.1] tracking-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {blog.title}
              </h1>

              {blog.excerpt && (
                <p className="mt-4 text-lg text-primary-foreground/80">
                  {blog.excerpt}
                </p>
              )}
            </div>
          </div>
        </section>

        {blog.coverImage && (
          <div className="container mx-auto px-6 md:px-12 -mt-8">
            <div className="max-w-4xl mx-auto">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                <Image
                  src={blog.coverImage}
                  alt={blog.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 896px"
                />
              </div>
            </div>
          </div>
        )}

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-6 md:px-12">
            <div className="max-w-3xl mx-auto">
              <div
                className="prose prose-lg dark:prose-invert max-w-none
                  prose-headings:font-heading prose-headings:tracking-tight
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-img:rounded-lg"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {blog.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </section>
      </article>

      <section className="py-12 pb-20 md:pb-12 bg-muted/30 border-t">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-3xl mx-auto text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour au blog
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
