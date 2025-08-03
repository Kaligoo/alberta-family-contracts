'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SpousalSupportSelectorProps {
  value?: string;
  onChange: (value: string) => void;
}

export function SpousalSupportSelector({ value, onChange }: SpousalSupportSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Spousal/Partner Support</CardTitle>
        <CardDescription>
          Please select how you want to handle spousal or partner support in your contract.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup value={value} onValueChange={onChange}>
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="no_affect_child_support" id="no_affect_child_support" />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="no_affect_child_support"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I don't want this contract to affect child support
              </Label>
              <p className="text-xs text-muted-foreground">
                This contract will not impact any child support obligations or entitlements.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <RadioGroupItem value="full_waiver" id="full_waiver" />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="full_waiver"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                We want a full waiver
              </Label>
              <p className="text-xs text-muted-foreground">
                Both parties waive any claim to spousal or partner support.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <RadioGroupItem value="waiver_until_children" id="waiver_until_children" />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="waiver_until_children"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                We want a waiver until we have children
              </Label>
              <p className="text-xs text-muted-foreground">
                Spousal support is waived until children are born or adopted into the relationship.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <RadioGroupItem value="complicated" id="complicated" />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="complicated"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                We want something more complicated
              </Label>
              <p className="text-xs text-muted-foreground">
                For complex spousal support arrangements, please email{' '}
                <a href="mailto:ghorvath@kahanelaw.com" className="text-blue-600 hover:underline">
                  ghorvath@kahanelaw.com
                </a>{' '}
                to discuss a custom contract. Hourly or flat fee options are available.
              </p>
            </div>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}