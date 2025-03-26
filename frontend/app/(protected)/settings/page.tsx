import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AISettings } from "@/components/ai-settings"
import { AccountSettings } from "@/components/account-settings"
import { IntegrationSettings } from "@/components/integration-settings"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="account">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>
        <TabsContent value="account" className="mt-4">
          <AccountSettings />
        </TabsContent>
        <TabsContent value="integrations" className="mt-4">
          <IntegrationSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
