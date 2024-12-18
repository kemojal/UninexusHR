import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Organization {
  id: number
  name: string
  industry: string
}

interface OrgState {
  currentOrg: Organization | null
  organizations: Organization[]
  setCurrentOrg: (org: Organization | null) => void
  setOrganizations: (orgs: Organization[]) => void
}

export const useOrgStore = create<OrgState>()(
  persist(
    (set) => ({
      currentOrg: null,
      organizations: [],
      setCurrentOrg: (org) => set({ currentOrg: org }),
      setOrganizations: (orgs) => set({ organizations: orgs }),
    }),
    {
      name: 'org-storage',
    }
  )
)
