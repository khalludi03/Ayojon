import type { VendorApplication } from "@/types/vendor";

const STORAGE_KEY = "ayojon-vendor-applications";

const readApplications = (): VendorApplication[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored) as VendorApplication[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeApplications = (applications: VendorApplication[]) => {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
};

export const getVendorApplications = (): VendorApplication[] => readApplications();

export const getVendorApplicationByEmail = (email: string): VendorApplication | undefined => {
  const applications = readApplications();
  return applications.find((app) => app.email === email);
};

export const addVendorApplication = (application: VendorApplication) => {
  const applications = readApplications();
  writeApplications([application, ...applications]);
};

export const updateVendorApplication = (id: string, updates: Partial<VendorApplication>) => {
  const applications = readApplications();
  const updatedApplications = applications.map((app) =>
    app.id === id ? { ...app, ...updates } : app
  );
  writeApplications(updatedApplications);
};

export const clearVendorApplications = () => {
  writeApplications([]);
};
