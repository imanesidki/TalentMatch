import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, FileText, Search, Users } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <Users className="h-5 w-5 text-primary" />
            <span>TalentMatch</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/signin" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Sign in
            </Link>
            <Button asChild>
              <Link href="/signup">Sign up</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
          <div className="flex max-w-[980px] flex-col items-start gap-2">
            <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl">
              Find the perfect candidate <br className="hidden sm:inline" />
              for your job openings
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground">
              Our AI-powered screening system matches the right candidates to your job descriptions, saving you time and
              improving hiring outcomes.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/signup">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="border-t bg-muted/40">
          <div className="container py-12 md:py-16">
            <h2 className="mb-8 text-center text-2xl font-bold md:text-3xl">Key Features</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <FileText className="mb-4 h-10 w-10 text-primary" />
                <h3 className="mb-2 text-xl font-bold">Resume Parsing</h3>
                <p className="text-muted-foreground">
                  Automatically extract key information from resumes including skills, experience, and education.
                </p>
              </div>
              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <Search className="mb-4 h-10 w-10 text-primary" />
                <h3 className="mb-2 text-xl font-bold">Job Match Scoring</h3>
                <p className="text-muted-foreground">
                  Advanced algorithms assess and score the alignment between candidates and job descriptions.
                </p>
              </div>
              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <Users className="mb-4 h-10 w-10 text-primary" />
                <h3 className="mb-2 text-xl font-bold">Recruiter Dashboard</h3>
                <p className="text-muted-foreground">
                  User-friendly interface to view ranked candidates with powerful filtering options.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} TalentMatch. Team Gamma. All rights reserved.
          </p>
          <nav className="flex gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

