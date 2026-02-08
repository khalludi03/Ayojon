import { createFileRoute, redirect } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Settings, 
  Save, 
  ShieldAlert, 
  Truck, 
  Globe, 
  Mail, 
  Phone, 
  Percent,
  Check,
  AlertTriangle
} from 'lucide-react';
import { getUser } from '@/functions/get-user';
import { orpc } from '@/utils/orpc';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/settings' as any)({
  beforeLoad: async () => {
    const session = await getUser();
    if (!session) {
      throw redirect({ to: '/login' });
    }
    const user = session.user as any;
    if (user.role !== 'admin') {
      throw redirect({ to: '/' });
    }
    return { session };
  },
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery(orpc.admin.getPlatformSettings.queryOptions());
  
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const updateMutation = useMutation(orpc.admin.updatePlatformSettings.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.admin.getPlatformSettings.key() });
      toast.success('Settings updated successfully');
    },
    onError: (error) => toast.error(error.message),
  }));

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleNumberChange = (field: string, value: number) => {
    // Handle NaN by keeping the previous value or setting undefined
    const validValue = isNaN(value) ? undefined : value;
    setFormData((prev: any) => ({ ...prev, [field]: validValue }));
  };

  const handleSave = () => {
    // Filter out undefined values to avoid sending invalid data
    const cleanedData = Object.fromEntries(
      Object.entries(formData).filter(([_, value]) => value !== undefined)
    );
    updateMutation.mutate(cleanedData);
  };

  if (isLoading || !formData) {
    return <div className="p-8">Loading settings...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Settings className="h-8 w-8 text-indigo-600" />
              Platform Configuration
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
              Manage global marketplace rules and behavior.
            </p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={updateMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 h-12 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:-translate-y-0.5"
          >
            <Save className="mr-2 h-5 w-5" />
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <div className="grid gap-8">
          {/* General Settings */}
          <Section icon={Globe} title="General Settings">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="platformName" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Platform Name</Label>
                <Input 
                  id="platformName" 
                  value={formData.platformName} 
                  onChange={(e) => handleChange('platformName', e.target.value)}
                  className="h-12 rounded-xl border-slate-200 dark:border-slate-800"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="platformCommission" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Marketplace Commission (%)</Label>
                <div className="relative">
                  <Input
                    id="platformCommission"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.platformCommission ?? ''}
                    onChange={(e) => handleNumberChange('platformCommission', e.target.valueAsNumber)}
                    className="h-12 rounded-xl border-slate-200 dark:border-slate-800 pr-10"
                  />
                  <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Official Contact Email</Label>
                <div className="relative">
                  <Input 
                    id="contactEmail" 
                    type="email"
                    value={formData.contactEmail} 
                    onChange={(e) => handleChange('contactEmail', e.target.value)}
                    className="h-12 rounded-xl border-slate-200 dark:border-slate-800 pl-10"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportPhone" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Support Phone</Label>
                <div className="relative">
                  <Input 
                    id="supportPhone" 
                    value={formData.supportPhone} 
                    onChange={(e) => handleChange('supportPhone', e.target.value)}
                    className="h-12 rounded-xl border-slate-200 dark:border-slate-800 pl-10"
                  />
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>
          </Section>

          {/* Shipping Settings */}
          <Section icon={Truck} title="Logistics & Rates">
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="freeShippingThreshold" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Free Shipping Min (BDT)</Label>
                <Input
                  id="freeShippingThreshold"
                  type="number"
                  min="0"
                  value={formData.freeShippingThreshold ?? ''}
                  onChange={(e) => handleNumberChange('freeShippingThreshold', e.target.valueAsNumber)}
                  className="h-12 rounded-xl border-slate-200 dark:border-slate-800"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insideDhakaRate" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Inside Dhaka (BDT)</Label>
                <Input
                  id="insideDhakaRate"
                  type="number"
                  min="0"
                  value={formData.insideDhakaRate ?? ''}
                  onChange={(e) => handleNumberChange('insideDhakaRate', e.target.valueAsNumber)}
                  className="h-12 rounded-xl border-slate-200 dark:border-slate-800"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="outsideDhakaRate" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Outside Dhaka (BDT)</Label>
                <Input
                  id="outsideDhakaRate"
                  type="number"
                  min="0"
                  value={formData.outsideDhakaRate ?? ''}
                  onChange={(e) => handleNumberChange('outsideDhakaRate', e.target.valueAsNumber)}
                  className="h-12 rounded-xl border-slate-200 dark:border-slate-800"
                />
              </div>
            </div>
          </Section>

          {/* Feature Toggles */}
          <Section icon={ShieldAlert} title="Feature Visibility">
            <div className="space-y-6">
              <ToggleRow 
                label="Allow Guest Checkout" 
                description="Customers can place orders without creating an account."
                checked={formData.enableGuestCheckout}
                onChange={(v) => handleChange('enableGuestCheckout', v)}
              />
              <ToggleRow 
                label="New Vendor Registration" 
                description="Open the platform for new business signups."
                checked={formData.enableVendorRegistration}
                onChange={(v) => handleChange('enableVendorRegistration', v)}
              />
              
              <div className="pt-4 border-t border-red-100 dark:border-red-900/30">
                <div className="flex items-start justify-between p-4 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      <p className="font-bold">Emergency Maintenance Mode</p>
                    </div>
                    <p className="text-xs text-red-700/70 dark:text-red-400/70 font-medium">Hides store from public and prevents all orders. Use only for updates.</p>
                  </div>
                  <Checkbox 
                    checked={formData.isMaintenanceMode} 
                    onCheckedChange={(v) => handleChange('isMaintenanceMode', v)}
                    className="size-6 rounded-lg border-red-200 data-checked:bg-red-600"
                  />
                </div>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }: any) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all hover:shadow-md">
      <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-800/30">
        <Icon className="h-5 w-5 text-indigo-600" />
        <h2 className="text-sm font-black uppercase tracking-[0.15em] text-slate-900 dark:text-white">{title}</h2>
      </div>
      <div className="p-8">
        {children}
      </div>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }: any) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-1">
        <p className="font-bold text-slate-900 dark:text-white leading-none">{label}</p>
        <p className="text-xs text-slate-500 font-medium">{description}</p>
      </div>
      <Checkbox 
        checked={checked} 
        onCheckedChange={onChange} 
        className="size-6 rounded-lg border-slate-200 dark:border-slate-800 data-checked:bg-indigo-600"
      />
    </div>
  );
}
