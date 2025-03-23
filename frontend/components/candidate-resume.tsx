import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, FileText } from "lucide-react"

export function CandidateResume() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">sarah_johnson_resume.pdf</h3>
                <p className="text-sm text-muted-foreground">Uploaded 2 days ago</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg border bg-card shadow-sm">
        <div className="p-6">
          <h2 className="mb-6 text-center text-2xl font-bold">Sarah Johnson</h2>

          <div className="mb-4 text-center">
            <p>San Francisco, CA • (555) 123-4567 • sarah.johnson@example.com</p>
            <p>linkedin.com/in/sarahjohnson • github.com/sarahjohnson</p>
          </div>

          <div className="mb-6">
            <h3 className="mb-2 border-b pb-1 text-lg font-semibold">Summary</h3>
            <p className="text-sm">
              Experienced software engineer with 8 years of expertise in building scalable web applications. Proficient
              in JavaScript, TypeScript, React, and Node.js. Strong problem-solving skills and a track record of
              delivering high-quality code. Passionate about creating intuitive user experiences and optimizing
              application performance.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="mb-2 border-b pb-1 text-lg font-semibold">Experience</h3>

            <div className="mb-4">
              <div className="flex justify-between">
                <h4 className="font-semibold">Senior Software Engineer, TechCorp Inc.</h4>
                <span>2020 - Present</span>
              </div>
              <ul className="ml-5 list-disc text-sm">
                <li>Led the development of a microservices architecture that improved system reliability by 40%</li>
                <li>Mentored junior developers and conducted code reviews to ensure code quality</li>
                <li>Implemented CI/CD pipelines that reduced deployment time by 60%</li>
              </ul>
            </div>

            <div className="mb-4">
              <div className="flex justify-between">
                <h4 className="font-semibold">Software Engineer, WebSolutions LLC</h4>
                <span>2017 - 2020</span>
              </div>
              <ul className="ml-5 list-disc text-sm">
                <li>Developed and maintained multiple React applications with complex state management</li>
                <li>Collaborated with UX designers to implement responsive and accessible interfaces</li>
                <li>Optimized application performance, reducing load times by 35%</li>
              </ul>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="mb-2 border-b pb-1 text-lg font-semibold">Education</h3>

            <div className="mb-2">
              <div className="flex justify-between">
                <h4 className="font-semibold">Master of Science in Computer Science</h4>
                <span>2015 - 2017</span>
              </div>
              <p className="text-sm">Stanford University</p>
            </div>

            <div>
              <div className="flex justify-between">
                <h4 className="font-semibold">Bachelor of Science in Computer Engineering</h4>
                <span>2011 - 2015</span>
              </div>
              <p className="text-sm">University of California, Berkeley</p>
            </div>
          </div>

          <div>
            <h3 className="mb-2 border-b pb-1 text-lg font-semibold">Skills</h3>
            <p className="text-sm">
              JavaScript, TypeScript, React, Node.js, GraphQL, REST APIs, MongoDB, PostgreSQL, AWS, Docker, Kubernetes,
              CI/CD, Git, Agile, TDD
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4 font-semibold">AI-Generated Resume Summary</h3>
          <p className="text-sm text-muted-foreground">
            Sarah Johnson is a highly skilled Senior Software Engineer with 8 years of experience specializing in
            full-stack web development. Her expertise in JavaScript, TypeScript, React, and Node.js makes her an
            excellent candidate for senior engineering roles. She has demonstrated leadership abilities through
            mentoring junior developers and implementing architecture improvements that significantly enhanced system
            reliability. Her strong educational background from top universities complements her practical experience,
            and her diverse skill set spans frontend, backend, DevOps, and database technologies.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

