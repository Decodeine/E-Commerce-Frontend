import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faChartBar,
  faEye,
  faSearch,
  faShoppingCart,
  faHeart,
  faShoppingBag,
  faStar,
  faUser,
  faSignInAlt,
  faSignOutAlt,
  faCalendarAlt,
  faFilter,
  faDownload,
  faRefresh,
  faArrowUp
} from "@fortawesome/free-solid-svg-icons";
import { useToast } from "../UI/Toast/ToastProvider";
import Button from "../UI/Button/Button";
import Card from "../UI/Card/Card";
import Loading from "../UI/Loading/Loading";
import { 
  activityApi,
  formatRelativeTime 
} from "../../services/accountsApi";
import type { ActivityLog, ActivitySummary } from "../../services/accountsApi";

interface ActivityFilters {
  activity_type?: string;
  search?: string;
  date_range?: string;
}

const ActivityDashboard: React.FC = () => {
  const { showToast } = useToast();
  
  const [summary, setSummary] = useState<ActivitySummary | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [filters, setFilters] = useState<ActivityFilters>({});
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [activities, filters, selectedTimeRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [summaryData, activitiesData] = await Promise.all([
        activityApi.getActivitySummary(),
        activityApi.getActivityLogs({ ordering: '-created_at', limit: 50 })
      ]);
      
      setSummary(summaryData);
      setActivities(activitiesData);
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Failed to Load Dashboard',
        message: 'Unable to load your activity data. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setActivitiesLoading(true);
    try {
      const [summaryData, activitiesData] = await Promise.all([
        activityApi.getActivitySummary(),
        activityApi.getActivityLogs({ ordering: '-created_at', limit: 50 })
      ]);
      
      setSummary(summaryData);
      setActivities(activitiesData);
      
      showToast({
        type: 'success',
        title: 'Data Refreshed',
        message: 'Your activity dashboard has been updated.'
      });
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Refresh Failed',
        message: 'Unable to refresh activity data.'
      });
    } finally {
      setActivitiesLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...activities];

    // Filter by activity type
    if (filters.activity_type && filters.activity_type !== 'all') {
      filtered = filtered.filter(activity => activity.activity_type === filters.activity_type);
    }

    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(activity => 
        activity.description.toLowerCase().includes(searchTerm) ||
        activity.activity_type.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by time range
    if (selectedTimeRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (selectedTimeRange) {
        case 'today':
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(activity => 
        new Date(activity.created_at) >= cutoffDate
      );
    }

    setFilteredActivities(filtered);
  };

  const handleFilterChange = (key: keyof ActivityFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const exportActivities = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Activity Type,Description\n"
      + filteredActivities.map(activity => 
          `${new Date(activity.created_at).toLocaleString()},${activity.activity_type},${activity.description.replace(/,/g, ';')}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "activity_log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast({
      type: 'success',
      title: 'Export Complete',
      message: 'Your activity data has been exported successfully.'
    });
  };

  const getActivityIcon = (activityType: string) => {
    const iconMap: Record<string, any> = {
      product_view: faEye,
      product_search: faSearch,
      cart_add: faShoppingCart,
      wishlist_add: faHeart,
      order_placed: faShoppingBag,
      review_added: faStar,
      profile_updated: faUser,
      login: faSignInAlt,
      logout: faSignOutAlt
    };
    
    return iconMap[activityType] || faChartBar;
  };

  const getActivityColor = (activityType: string) => {
    const colorMap: Record<string, string> = {
      product_view: '#667eea',
      product_search: '#764ba2',
      cart_add: '#f093fb',
      wishlist_add: '#f5576c',
      order_placed: '#4facfe',
      review_added: '#43e97b',
      profile_updated: '#fa709a',
      login: '#38a169',
      logout: '#e53e3e'
    };
    
    return colorMap[activityType] || '#718096';
  };

  const getStatColor = (label: string) => {
    const colorMap: Record<string, string> = {
      'Total Activities': '#667eea',
      'Products Viewed': '#764ba2',
      'Orders Placed': '#4facfe',
      'Reviews Added': '#43e97b'
    };
    
    return colorMap[label] || '#718096';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 animate-pulse rounded-lg bg-slate-200" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-slate-200" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-lg bg-slate-200" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <FontAwesomeIcon icon={faChartBar} className="text-blue-600" />
            Activity Dashboard
          </h2>
          <p className="mt-1 text-slate-600">Track your shopping behavior and account activity</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={refreshData}
            disabled={activitiesLoading}
            icon={faRefresh}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={exportActivities}
            icon={faDownload}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Activity Summary Stats */}
      {summary && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg text-white" style={{ backgroundColor: getStatColor('Total Activities') }}>
                <FontAwesomeIcon icon={faChartBar} className="text-xl" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{summary.total_activities}</div>
                <div className="text-sm text-slate-600">Total Activities</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg text-white" style={{ backgroundColor: getStatColor('Products Viewed') }}>
                <FontAwesomeIcon icon={faEye} className="text-xl" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{summary.activity_counts.product_view || 0}</div>
                <div className="text-sm text-slate-600">Products Viewed</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg text-white" style={{ backgroundColor: getStatColor('Orders Placed') }}>
                <FontAwesomeIcon icon={faShoppingBag} className="text-xl" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{summary.activity_counts.order_placed || 0}</div>
                <div className="text-sm text-slate-600">Orders Placed</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg text-white" style={{ backgroundColor: getStatColor('Reviews Added') }}>
                <FontAwesomeIcon icon={faStar} className="text-xl" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{summary.activity_counts.review_added || 0}</div>
                <div className="text-sm text-slate-600">Reviews Added</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Most Viewed Categories */}
      {summary?.most_viewed_categories && summary.most_viewed_categories.length > 0 && (
        <Card className="p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <FontAwesomeIcon icon={faArrowUp} className="text-blue-600" />
            Most Viewed Categories
          </h3>
          <div className="space-y-2">
            {summary.most_viewed_categories.map((category, index) => (
              <div key={category} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                  #{index + 1}
                </div>
                <div className="font-medium text-slate-900">{category}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            icon={faFilter}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          <div className="text-sm text-slate-600">
            {filteredActivities.length} of {activities.length} activities
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 gap-4 border-t border-slate-200 pt-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Search Activities</label>
              <input
                type="text"
                placeholder="Search descriptions..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Activity Type</label>
              <select
                value={filters.activity_type || 'all'}
                onChange={(e) => handleFilterChange('activity_type', e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              >
                <option value="all">All Types</option>
                <option value="product_view">Product Views</option>
                <option value="product_search">Searches</option>
                <option value="cart_add">Cart Additions</option>
                <option value="wishlist_add">Wishlist</option>
                <option value="order_placed">Orders</option>
                <option value="review_added">Reviews</option>
                <option value="login">Logins</option>
                <option value="logout">Logouts</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Time Range</label>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        )}
      </Card>

      {/* Activity List */}
      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-600" />
            Recent Activities
          </h3>
          {activitiesLoading && (
            <Loading variant="spinner" size="sm" />
          )}
        </div>

        {filteredActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <FontAwesomeIcon icon={faChartBar} className="text-3xl text-slate-400" />
            </div>
            <h4 className="mb-2 text-lg font-semibold text-slate-900">No Activities Found</h4>
            <p className="text-slate-600">
              {activities.length === 0 
                ? "You haven't performed any activities yet." 
                : "No activities match your current filters."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 rounded-lg border border-slate-200 bg-white p-4 transition-shadow hover:shadow-sm">
                <div 
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-white"
                  style={{ backgroundColor: getActivityColor(activity.activity_type) }}
                >
                  <FontAwesomeIcon icon={getActivityIcon(activity.activity_type)} />
                </div>
                
                <div className="flex-1">
                  <div className="font-medium text-slate-900">
                    {activity.description}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-sm text-slate-600">
                    <span className="capitalize">{activity.activity_type.replace('_', ' ')}</span>
                    <span>•</span>
                    <span>{formatRelativeTime(activity.created_at)}</span>
                  </div>
                  
                  {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {activity.metadata.product_name && (
                        <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-800">
                          Product: {activity.metadata.product_name}
                        </span>
                      )}
                      {activity.metadata.category && (
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                          Category: {activity.metadata.category}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ActivityDashboard;
