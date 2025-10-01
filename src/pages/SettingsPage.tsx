import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '@/hooks/use-theme';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
export function SettingsPage() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Manage your application and workspace settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode" className="text-base">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Enable a dark theme for the application.
              </p>
            </div>
            <Switch
              id="dark-mode"
              checked={isDark}
              onCheckedChange={toggleTheme}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Time Unit</Label>
              <p className="text-sm text-muted-foreground">
                Choose the default unit for time estimates.
              </p>
            </div>
            <Select defaultValue="hours">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hours">Hours</SelectItem>
                <SelectItem value="days">Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Working Days</Label>
              <p className="text-sm text-muted-foreground">
                Select the days of the week that are considered workdays.
              </p>
            </div>
            <ToggleGroup type="multiple" defaultValue={["mon", "tue", "wed", "thu", "fri"]}>
              <ToggleGroupItem value="sun">S</ToggleGroupItem>
              <ToggleGroupItem value="mon">M</ToggleGroupItem>
              <ToggleGroupItem value="tue">T</ToggleGroupItem>
              <ToggleGroupItem value="wed">W</ToggleGroupItem>
              <ToggleGroupItem value="thu">T</ToggleGroupItem>
              <ToggleGroupItem value="fri">F</ToggleGroupItem>
              <ToggleGroupItem value="sat">S</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}