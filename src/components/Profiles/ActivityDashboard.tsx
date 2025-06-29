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
import LoadingSkeleton from "../UI/Loading/LoadingSkeleton";
import { 
  activityApi,
  formatRelativeTime 
} from "../../services/accountsApi";
import type { ActivityLog, ActivitySummary } from "../../services/accountsApi";
import "./css/ActivityDashboard.css";

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
      <div className="activity-dashboard">
        <div className="dashboard-header">
          <LoadingSkeleton height={60} width="100%" />
        </div>
        <div className="dashboard-stats">
          {[1, 2, 3, 4].map(i => (
            <LoadingSkeleton key={i} height={120} width="100%" />
          ))}
        </div>
        <div className="dashboard-content">
          <LoadingSkeleton height={400} width="100%" />
        </div>
      </div>
    );
  }

  return (
    <div className="activity-dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h1>
              <FontAwesomeIcon icon={faChartBar} />
              Activity Dashboard
            </h1>
            <p>Track your shopping behavior and account activity</p>
          </div>
          <div className="header-actions">
            <Button
              variant="secondary"
              onClick={refreshData}
              disabled={activitiesLoading}
              icon={faRefresh}
              className={activitiesLoading ? 'spinning' : ''}
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
      </div>

      {/* Activity Summary Stats */}
      {summary && (
        <div className="dashboard-stats">
          <Card className="stat-card" padding="lg">
            <div className="stat-content">
              <div className="stat-icon" style={{ backgroundColor: getStatColor('Total Activities') }}>
                <FontAwesomeIcon icon={faChartBar} />
              </div>
              <div className="stat-details">
                <div className="stat-number">{summary.total_activities}</div>
                <div className="stat-label">Total Activities</div>
              </div>
            </div>
          </Card>

          <Card className="stat-card" padding="lg">
            <div className="stat-content">
              <div className="stat-icon" style={{ backgroundColor: getStatColor('Products Viewed') }}>
                <FontAwesomeIcon icon={faEye} />
              </div>
              <div className="stat-details">
                <div className="stat-number">{summary.activity_counts.product_view || 0}</div>
                <div className="stat-label">Products Viewed</div>
              </div>
            </div>
          </Card>

          <Card className="stat-card" padding="lg">
            <div className="stat-content">
              <div className="stat-icon" style={{ backgroundColor: getStatColor('Orders Placed') }}>
                <FontAwesomeIcon icon={faShoppingBag} />
              </div>
              <div className="stat-details">
                <div className="stat-number">{summary.activity_counts.order_placed || 0}</div>
                <div className="stat-label">Orders Placed</div>
              </div>
            </div>
          </Card>

          <Card className="stat-card" padding="lg">
            <div className="stat-content">
              <div className="stat-icon" style={{ backgroundColor: getStatColor('Reviews Added') }}>
                <FontAwesomeIcon icon={faStar} />
              </div>
              <div className="stat-details">
                <div className="stat-number">{summary.activity_counts.review_added || 0}</div>
                <div className="stat-label">Reviews Added</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Most Viewed Categories */}
      {summary?.most_viewed_categories && summary.most_viewed_categories.length > 0 && (
        <Card className="categories-card" padding="lg">
          <div className="categories-header">
            <h3>
              <FontAwesomeIcon icon={faArrowUp} />
              Most Viewed Categories
            </h3>
          </div>
          <div className="categories-list">
            {summary.most_viewed_categories.map((category, index) => (
              <div key={category} className="category-item">
                <div className="category-rank">#{index + 1}</div>
                <div className="category-name">{category}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filters and Search */}
      <Card className="filters-card" padding="md">
        <div className="filters-header">
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            icon={faFilter}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          <div className="results-count">
            {filteredActivities.length} of {activities.length} activities
          </div>
        </div>

        {showFilters && (
          <div className="filters-content">
            <div className="filter-group">
              <label>Search Activities</label>
              <input
                type="text"
                placeholder="Search descriptions..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label>Activity Type</label>
              <select
                value={filters.activity_type || 'all'}
                onChange={(e) => handleFilterChange('activity_type', e.target.value)}
                className="filter-select"
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

            <div className="filter-group">
              <label>Time Range</label>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="filter-select"
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
      <Card className="activities-card" padding="lg">
        <div className="activities-header">
          <h3>
            <FontAwesomeIcon icon={faCalendarAlt} />
            Recent Activities
          </h3>
          {activitiesLoading && (
            <Loading variant="spinner" size="sm" />
          )}
        </div>

        {filteredActivities.length === 0 ? (
          <div className="no-activities">
            <FontAwesomeIcon icon={faChartBar} />
            <h4>No Activities Found</h4>
            <p>
              {activities.length === 0 
                ? "You haven't performed any activities yet." 
                : "No activities match your current filters."}
            </p>
          </div>
        ) : (
          <div className="activities-list">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div 
                  className="activity-icon"
                  style={{ backgroundColor: getActivityColor(activity.activity_type) }}
                >
                  <FontAwesomeIcon icon={getActivityIcon(activity.activity_type)} />
                </div>
                
                <div className="activity-content">
                  <div className="activity-description">
                    {activity.description}
                  </div>
                  <div className="activity-meta">
                    <span className="activity-type">{activity.activity_type.replace('_', ' ')}</span>
                    <span className="activity-time">
                      {formatRelativeTime(activity.created_at)}
                    </span>
                  </div>
                  
                  {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                    <div className="activity-metadata">
                      {activity.metadata.product_name && (
                        <span className="metadata-item">
                          Product: {activity.metadata.product_name}
                        </span>
                      )}
                      {activity.metadata.category && (
                        <span className="metadata-item">
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
