'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { 
  Building2, 
  Users, 
  Shield, 
  ClipboardList, 
  TrendingUp,
  Activity,
  Calendar,
  BarChart2,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

interface DashboardStats {
  total_users: number
  total_organizations: number
  total_roles: number
  pending_requests: number
  active_users: number
  monthly_growth: number
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await api.get('/dashboard/stats')
      return response.data
    }
  })

  const cards = [
    {
      title: 'Total Members',
      value: stats?.total_users || 0,
      change: '+12.5%',
      trend: 'up',
      description: 'Active team members',
      icon: Users,
      color: 'from-blue-500/20 to-blue-600/20',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Organizations',
      value: stats?.total_organizations || 0,
      change: '+5.2%',
      trend: 'up',
      description: 'Connected organizations',
      icon: Building2,
      color: 'from-emerald-500/20 to-emerald-600/20',
      iconColor: 'text-emerald-600'
    },
    {
      title: 'Active Users',
      value: stats?.active_users || 0,
      change: '+18.7%',
      trend: 'up',
      description: 'Currently active users',
      icon: Activity,
      color: 'from-violet-500/20 to-violet-600/20',
      iconColor: 'text-violet-600'
    },
    {
      title: 'Monthly Growth',
      value: stats?.monthly_growth || 0,
      change: '+8.3%',
      trend: 'up',
      description: 'Month over month growth',
      icon: TrendingUp,
      color: 'from-amber-500/20 to-amber-600/20',
      iconColor: 'text-amber-600'
    }
  ]

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load dashboard statistics. Please try again later.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <motion.div 
      className="p-6 space-y-6"
      initial="hidden"
      animate="show"
      variants={container}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monitor your organization's key metrics and performance indicators
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Last 30 days
          </Button>
          <Button className="gap-2">
            <BarChart2 className="h-4 w-4" />
            View Reports
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <motion.div key={card.title} variants={item}>
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800 p-6">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline">
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {card.value.toLocaleString()}
                      </p>
                      <span className="ml-2 text-sm font-medium text-emerald-600 dark:text-emerald-500">
                        {card.change}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {card.description}
                    </p>
                  </div>
                  <div className={`rounded-xl bg-gradient-to-br ${card.color} p-3`}>
                    <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                    <div 
                      className={`h-2 rounded-full bg-gradient-to-r ${card.color.replace('/20', '')}`}
                      style={{ width: `${Math.random() * 40 + 60}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Additional Sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Activity Timeline */}
        <Card>
          <CardHeader className="border-b border-gray-100 dark:border-gray-800 p-6">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Add activity timeline here */}
          </CardContent>
        </Card>

        {/* Performance Chart */}
        <Card>
          <CardHeader className="border-b border-gray-100 dark:border-gray-800 p-6">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Add performance chart here */}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
