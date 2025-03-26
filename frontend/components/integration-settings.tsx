import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

const integrations = [
  {
    id: "1",
    name: "Job Boards",
    description: "Post jobs to multiple job boards with a single click",
    connected: false,
    logo: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    name: "Calendar",
    description: "Sync with your calendar for interview scheduling",
    connected: false,
    logo: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "3",
    name: "Email",
    description: "Send emails to candidates directly from the platform",
    connected: true,
    logo: "/placeholder.svg?height=40&width=40",
  },
]

export function IntegrationSettings() {
  return (
    <div className="space-y-6">
      {integrations.map((integration) => (
        <Card key={integration.id}>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div className="space-y-2">
              <CardTitle>{integration.name}</CardTitle>
              <CardDescription>{integration.description}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {integration.connected ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                  Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-muted text-muted-foreground hover:bg-muted">
                  Not Connected
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={integration.logo || "/placeholder.svg"}
                  alt={integration.name}
                  className="h-10 w-10 rounded-md"
                />
                <div className="space-y-0.5">
                  <Label htmlFor={`integration-${integration.id}`}>
                    {integration.connected ? "Enabled" : "Disabled"}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {integration.connected
                      ? "This integration is currently active"
                      : "Connect to enable this integration"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch id={`integration-${integration.id}`} checked={integration.connected} />
                <Button variant="outline" size="sm">
                  {integration.connected ? "Configure" : "Connect"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>Add New Integration</CardTitle>
          <CardDescription>Browse available integrations to enhance your recruitment workflow</CardDescription>
        </CardHeader>
        <CardContent>
          <Button>Browse Integrations</Button>
        </CardContent>
      </Card>
    </div>
  )
}

