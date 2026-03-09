import { useState } from "react";
import { useTranslation } from "react-i18next";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings2, Flag, Mail, Key } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AdminSettingsPage = () => {
  const { t } = useTranslation();
  const [featureFlags, setFeatureFlags] = useState({
    newUserRegistration: true,
    restaurantOnboarding: true,
    instantCheckout: false,
    loyaltyProgram: false,
    advancedAnalytics: true,
  });

  const [emailTemplates, setEmailTemplates] = useState({
    welcomeEmail: "Welcome to SavePlate! We're excited to have you...",
    orderConfirmation: "Your order #{{orderId}} has been confirmed...",
    passwordReset: "Click the link below to reset your password...",
  });

  const [systemConfig, setSystemConfig] = useState({
    platformFee: "5",
    minOrderValue: "5",
    maxOrderValue: "500",
    pickupTimeWindow: "30",
    systemAnnouncement: "",
  });

  const handleSave = (section: string) => {
    toast({
      title: t("common.success"),
      description: `${section} settings saved successfully`,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="animate-slide-up">
          <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
          <p className="text-muted-foreground mt-1">Configure platform-wide settings</p>
        </div>

        <Tabs defaultValue="features" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="features">
              <Flag className="h-4 w-4 mr-2" /> Features
            </TabsTrigger>
            <TabsTrigger value="system">
              <Settings2 className="h-4 w-4 mr-2" /> System
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="h-4 w-4 mr-2" /> Email
            </TabsTrigger>
            <TabsTrigger value="api">
              <Key className="h-4 w-4 mr-2" /> API Keys
            </TabsTrigger>
          </TabsList>

          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Feature Flags</CardTitle>
                <CardDescription>Enable or disable platform features without deploying</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="newUserReg">New User Registration</Label>
                    <p className="text-sm text-muted-foreground">Allow new customers to sign up</p>
                  </div>
                  <Switch
                    id="newUserReg"
                    checked={featureFlags.newUserRegistration}
                    onCheckedChange={(checked) => setFeatureFlags({ ...featureFlags, newUserRegistration: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="restaurantOnboard">Restaurant Onboarding</Label>
                    <p className="text-sm text-muted-foreground">Allow new restaurants to join the platform</p>
                  </div>
                  <Switch
                    id="restaurantOnboard"
                    checked={featureFlags.restaurantOnboarding}
                    onCheckedChange={(checked) => setFeatureFlags({ ...featureFlags, restaurantOnboarding: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="instantCheckout">Instant Checkout</Label>
                    <p className="text-sm text-muted-foreground">Enable one-click checkout for returning customers</p>
                  </div>
                  <Switch
                    id="instantCheckout"
                    checked={featureFlags.instantCheckout}
                    onCheckedChange={(checked) => setFeatureFlags({ ...featureFlags, instantCheckout: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="loyaltyProgram">Loyalty Program</Label>
                    <p className="text-sm text-muted-foreground">Enable points and rewards system</p>
                  </div>
                  <Switch
                    id="loyaltyProgram"
                    checked={featureFlags.loyaltyProgram}
                    onCheckedChange={(checked) => setFeatureFlags({ ...featureFlags, loyaltyProgram: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="advancedAnalytics">Advanced Analytics</Label>
                    <p className="text-sm text-muted-foreground">Show detailed charts and metrics to restaurants</p>
                  </div>
                  <Switch
                    id="advancedAnalytics"
                    checked={featureFlags.advancedAnalytics}
                    onCheckedChange={(checked) => setFeatureFlags({ ...featureFlags, advancedAnalytics: checked })}
                  />
                </div>

                <Button onClick={() => handleSave("Feature flags")}>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>Platform-wide operational settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="platformFee">Platform Fee (%)</Label>
                    <Input
                      id="platformFee"
                      type="number"
                      value={systemConfig.platformFee}
                      onChange={(e) => setSystemConfig({ ...systemConfig, platformFee: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pickupWindow">Pickup Time Window (minutes)</Label>
                    <Input
                      id="pickupWindow"
                      type="number"
                      value={systemConfig.pickupTimeWindow}
                      onChange={(e) => setSystemConfig({ ...systemConfig, pickupTimeWindow: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minOrder">Minimum Order Value (OMR)</Label>
                    <Input
                      id="minOrder"
                      type="number"
                      value={systemConfig.minOrderValue}
                      onChange={(e) => setSystemConfig({ ...systemConfig, minOrderValue: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxOrder">Maximum Order Value (OMR)</Label>
                    <Input
                      id="maxOrder"
                      type="number"
                      value={systemConfig.maxOrderValue}
                      onChange={(e) => setSystemConfig({ ...systemConfig, maxOrderValue: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="announcement">System Announcement</Label>
                  <Textarea
                    id="announcement"
                    placeholder="Display a message to all users (leave empty to hide)"
                    value={systemConfig.systemAnnouncement}
                    onChange={(e) => setSystemConfig({ ...systemConfig, systemAnnouncement: e.target.value })}
                    rows={3}
                  />
                </div>

                <Button onClick={() => handleSave("System configuration")}>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>Customize automated email messages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="welcomeEmail">Welcome Email</Label>
                  <Textarea
                    id="welcomeEmail"
                    value={emailTemplates.welcomeEmail}
                    onChange={(e) => setEmailTemplates({ ...emailTemplates, welcomeEmail: e.target.value })}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">Sent when a new user signs up</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orderConfirm">Order Confirmation</Label>
                  <Textarea
                    id="orderConfirm"
                    value={emailTemplates.orderConfirmation}
                    onChange={(e) => setEmailTemplates({ ...emailTemplates, orderConfirmation: e.target.value })}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">Variables: {`{{orderId}}, {{customerName}}, {{total}}`}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passwordReset">Password Reset</Label>
                  <Textarea
                    id="passwordReset"
                    value={emailTemplates.passwordReset}
                    onChange={(e) => setEmailTemplates({ ...emailTemplates, passwordReset: e.target.value })}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">Variables: {`{{resetLink}}, {{userName}}`}</p>
                </div>

                <Button onClick={() => handleSave("Email templates")}>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>Manage third-party service integrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="stripeKey">Stripe API Key</Label>
                  <Input id="stripeKey" type="password" placeholder="sk_test_..." />
                  <p className="text-xs text-muted-foreground">Payment processing</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twilioKey">Twilio API Key</Label>
                  <Input id="twilioKey" type="password" placeholder="AC..." />
                  <p className="text-xs text-muted-foreground">SMS notifications</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sendgridKey">SendGrid API Key</Label>
                  <Input id="sendgridKey" type="password" placeholder="SG..." />
                  <p className="text-xs text-muted-foreground">Email delivery</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="googleMaps">Google Maps API Key</Label>
                  <Input id="googleMaps" type="password" placeholder="AIza..." />
                  <p className="text-xs text-muted-foreground">Location services</p>
                </div>

                <Button onClick={() => handleSave("API keys")}>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettingsPage;
