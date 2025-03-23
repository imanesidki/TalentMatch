import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function JobDetails({ jobId = "1" }: { jobId?: string }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Job Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            We're looking for a Senior Software Engineer to join our team and help build scalable web applications. The
            ideal candidate will have strong experience with JavaScript, TypeScript, React, and Node.js, and a passion
            for writing clean, maintainable code.
          </p>

          <div className="mt-4 space-y-4">
            <div>
              <h3 className="font-semibold">Responsibilities:</h3>
              <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                <li>Design and implement new features for our web applications</li>
                <li>Write clean, maintainable, and well-tested code</li>
                <li>Collaborate with product managers, designers, and other engineers</li>
                <li>Review code and provide constructive feedback to peers</li>
                <li>Mentor junior engineers and help them grow</li>
                <li>Participate in technical design discussions and architecture decisions</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold">Requirements:</h3>
              <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                <li>5+ years of experience in software development</li>
                <li>Strong proficiency in JavaScript, TypeScript, React, and Node.js</li>
                <li>Experience with RESTful APIs and GraphQL</li>
                <li>Familiarity with AWS or other cloud platforms</li>
                <li>Knowledge of CI/CD pipelines and DevOps practices</li>
                <li>Bachelor's degree in Computer Science or related field, or equivalent experience</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold">Nice to Have:</h3>
              <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                <li>Experience with serverless architectures</li>
                <li>Knowledge of AWS Lambda and other AWS services</li>
                <li>Experience with microservices architecture</li>
                <li>Contributions to open-source projects</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Required Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge>JavaScript</Badge>
            <Badge>TypeScript</Badge>
            <Badge>React</Badge>
            <Badge>Node.js</Badge>
            <Badge>REST APIs</Badge>
            <Badge>GraphQL</Badge>
            <Badge>AWS</Badge>
            <Badge>CI/CD</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 text-sm text-muted-foreground">
            <li>Competitive salary and equity package</li>
            <li>Health, dental, and vision insurance</li>
            <li>401(k) with company match</li>
            <li>Flexible work hours and remote work options</li>
            <li>Unlimited PTO policy</li>
            <li>Professional development budget</li>
            <li>Home office stipend</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

