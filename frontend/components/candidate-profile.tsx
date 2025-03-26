import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function CandidateProfile() {
  return (
    <div className="space-y-6">
      <Card>
      <CardHeader>
          <CardTitle>AI-Generated Resume Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-md text-muted-foreground">
            Sarah Johnson is a highly skilled Senior Software Engineer with 8 years of experience specializing in
            full-stack web development. Her expertise in JavaScript, TypeScript, React, and Node.js makes her an
            excellent candidate for senior engineering roles. She has demonstrated leadership abilities through
            mentoring junior developers and implementing architecture improvements that significantly enhanced system
            reliability. Her strong educational background from top universities complements her practical experience,
            and her diverse skill set spans frontend, backend, DevOps, and database technologies.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">Senior Software Engineer</h3>
                <p className="text-sm text-muted-foreground">TechCorp Inc.</p>
              </div>
              <p className="text-sm text-muted-foreground">2020 - Present</p>
            </div>
            <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
              <li>Led the development of a microservices architecture that improved system reliability by 40%</li>
              <li>Mentored junior developers and conducted code reviews to ensure code quality</li>
              <li>Implemented CI/CD pipelines that reduced deployment time by 60%</li>
            </ul>
          </div>

          <div>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">Software Engineer</h3>
                <p className="text-sm text-muted-foreground">WebSolutions LLC</p>
              </div>
              <p className="text-sm text-muted-foreground">2017 - 2020</p>
            </div>
            <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
              <li>Developed and maintained multiple React applications with complex state management</li>
              <li>Collaborated with UX designers to implement responsive and accessible interfaces</li>
              <li>Optimized application performance, reducing load times by 35%</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Education</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">Master of Science in Computer Science</h3>
                <p className="text-sm text-muted-foreground">Stanford University</p>
              </div>
              <p className="text-sm text-muted-foreground">2015 - 2017</p>
            </div>
          </div>

          <div>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">Bachelor of Science in Computer Engineering</h3>
                <p className="text-sm text-muted-foreground">University of California, Berkeley</p>
              </div>
              <p className="text-sm text-muted-foreground">2011 - 2015</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge>JavaScript</Badge>
            <Badge>TypeScript</Badge>
            <Badge>React</Badge>
            <Badge>Node.js</Badge>
            <Badge>GraphQL</Badge>
            <Badge>REST APIs</Badge>
            <Badge>MongoDB</Badge>
            <Badge>PostgreSQL</Badge>
            <Badge>AWS</Badge>
            <Badge>Docker</Badge>
            <Badge>Kubernetes</Badge>
            <Badge>CI/CD</Badge>
            <Badge>Git</Badge>
            <Badge>Agile</Badge>
            <Badge>TDD</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

