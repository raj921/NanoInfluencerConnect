import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Eye, 
  Heart,
  Users,
  Calendar
} from "lucide-react";

interface ChartData {
  month?: string;
  date?: string;
  revenue?: number;
  reach?: number;
  engagement?: number;
  engagementRate?: number;
  followers?: number;
  clicks?: number;
  conversions?: number;
  roi?: number;
}

interface AnalyticsChartProps {
  data: ChartData[];
  type: "revenue" | "engagement" | "performance" | "platforms";
  height?: number;
  showLegend?: boolean;
  title?: string;
}

export default function AnalyticsChart({ 
  data, 
  type, 
  height = 300, 
  showLegend = true,
  title 
}: AnalyticsChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Cleanup previous chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Load Chart.js dynamically
    import('chart.js/auto').then((Chart) => {
      const chartConfig = getChartConfig(type, data, Chart.default);
      chartRef.current = new Chart.default(ctx, chartConfig);
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, type]);

  const getChartConfig = (chartType: string, chartData: ChartData[], Chart: any) => {
    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: showLegend,
          position: 'top' as const,
          labels: {
            color: 'rgb(148, 163, 184)', // text-slate-400
            usePointStyle: true,
            padding: 20,
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 15, 35, 0.9)',
          titleColor: 'rgb(248, 250, 252)',
          bodyColor: 'rgb(203, 213, 225)',
          borderColor: 'rgb(99, 102, 241)',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true,
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(148, 163, 184, 0.1)',
          },
          ticks: {
            color: 'rgb(148, 163, 184)',
          }
        },
        y: {
          grid: {
            color: 'rgba(148, 163, 184, 0.1)',
          },
          ticks: {
            color: 'rgb(148, 163, 184)',
          }
        }
      }
    };

    switch (chartType) {
      case 'revenue':
        return {
          type: 'line',
          data: {
            labels: chartData.map(d => d.month || d.date),
            datasets: [
              {
                label: 'Revenue',
                data: chartData.map(d => d.revenue || 0),
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgb(99, 102, 241)',
                pointBorderColor: 'rgb(255, 255, 255)',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
              }
            ]
          },
          options: {
            ...commonOptions,
            scales: {
              ...commonOptions.scales,
              y: {
                ...commonOptions.scales.y,
                beginAtZero: true,
                ticks: {
                  ...commonOptions.scales.y.ticks,
                  callback: function(value: any) {
                    return '$' + value.toLocaleString();
                  }
                }
              }
            }
          }
        };

      case 'engagement':
        return {
          type: 'bar',
          data: {
            labels: chartData.map(d => d.month || d.date),
            datasets: [
              {
                label: 'Reach',
                data: chartData.map(d => d.reach || 0),
                backgroundColor: 'rgba(139, 92, 246, 0.8)',
                borderColor: 'rgb(139, 92, 246)',
                borderWidth: 1,
              },
              {
                label: 'Engagement',
                data: chartData.map(d => d.engagement || 0),
                backgroundColor: 'rgba(236, 72, 153, 0.8)',
                borderColor: 'rgb(236, 72, 153)',
                borderWidth: 1,
              }
            ]
          },
          options: {
            ...commonOptions,
            scales: {
              ...commonOptions.scales,
              y: {
                ...commonOptions.scales.y,
                beginAtZero: true,
                ticks: {
                  ...commonOptions.scales.y.ticks,
                  callback: function(value: any) {
                    return value >= 1000 ? (value / 1000).toFixed(1) + 'K' : value;
                  }
                }
              }
            }
          }
        };

      case 'performance':
        return {
          type: 'line',
          data: {
            labels: chartData.map(d => d.month || d.date),
            datasets: [
              {
                label: 'Revenue',
                data: chartData.map(d => d.revenue || 0),
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 2,
                yAxisID: 'y',
              },
              {
                label: 'Engagement Rate',
                data: chartData.map(d => d.engagementRate || d.engagement || 0),
                borderColor: 'rgb(236, 72, 153)',
                backgroundColor: 'rgba(236, 72, 153, 0.1)',
                borderWidth: 2,
                yAxisID: 'y1',
              }
            ]
          },
          options: {
            ...commonOptions,
            interaction: {
              mode: 'index' as const,
              intersect: false,
            },
            scales: {
              x: commonOptions.scales.x,
              y: {
                ...commonOptions.scales.y,
                type: 'linear' as const,
                display: true,
                position: 'left' as const,
                beginAtZero: true,
                ticks: {
                  ...commonOptions.scales.y.ticks,
                  callback: function(value: any) {
                    return '$' + value.toLocaleString();
                  }
                }
              },
              y1: {
                ...commonOptions.scales.y,
                type: 'linear' as const,
                display: true,
                position: 'right' as const,
                beginAtZero: true,
                grid: {
                  drawOnChartArea: false,
                },
                ticks: {
                  ...commonOptions.scales.y.ticks,
                  callback: function(value: any) {
                    return value + '%';
                  }
                }
              },
            },
          }
        };

      case 'platforms':
        return {
          type: 'doughnut',
          data: {
            labels: ['Instagram', 'TikTok', 'YouTube'],
            datasets: [
              {
                data: [45, 35, 20],
                backgroundColor: [
                  'rgba(236, 72, 153, 0.8)', // Instagram pink
                  'rgba(139, 92, 246, 0.8)', // TikTok purple
                  'rgba(239, 68, 68, 0.8)',  // YouTube red
                ],
                borderColor: [
                  'rgb(236, 72, 153)',
                  'rgb(139, 92, 246)',
                  'rgb(239, 68, 68)',
                ],
                borderWidth: 2,
                hoverOffset: 4,
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                ...commonOptions.plugins.legend,
                position: 'bottom' as const,
              },
              tooltip: commonOptions.plugins.tooltip,
            }
          }
        };

      default:
        return {
          type: 'line',
          data: {
            labels: chartData.map(d => d.month || d.date),
            datasets: [
              {
                label: 'Data',
                data: chartData.map(d => d.revenue || d.reach || d.engagement || 0),
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
              }
            ]
          },
          options: commonOptions
        };
    }
  };

  const getChartIcon = () => {
    switch (type) {
      case 'revenue':
        return <DollarSign className="h-5 w-5 text-green-500" />;
      case 'engagement':
        return <Heart className="h-5 w-5 text-pink-500" />;
      case 'performance':
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case 'platforms':
        return <Users className="h-5 w-5 text-purple-500" />;
      default:
        return <BarChart3 className="h-5 w-5 text-primary" />;
    }
  };

  const getChartTitle = () => {
    if (title) return title;
    
    switch (type) {
      case 'revenue':
        return 'Revenue Analytics';
      case 'engagement':
        return 'Engagement Metrics';
      case 'performance':
        return 'Performance Overview';
      case 'platforms':
        return 'Platform Distribution';
      default:
        return 'Analytics';
    }
  };

  const getInsights = () => {
    if (!data || data.length === 0) return null;

    const latest = data[data.length - 1];
    const previous = data[data.length - 2];

    switch (type) {
      case 'revenue':
        const revenueChange = previous ? 
          ((latest.revenue || 0) - (previous.revenue || 0)) / (previous.revenue || 1) * 100 : 0;
        return (
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <span className="text-green-400">
                {revenueChange > 0 ? '+' : ''}{revenueChange.toFixed(1)}%
              </span>
            </div>
            <span className="text-muted-foreground">vs last period</span>
          </div>
        );
      
      case 'engagement':
        const avgEngagement = data.reduce((sum, d) => sum + (d.engagement || 0), 0) / data.length;
        return (
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Heart className="h-4 w-4 text-pink-400" />
              <span className="text-pink-400">
                {avgEngagement.toFixed(0)} avg engagement
              </span>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Chart Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getChartIcon()}
          <h3 className="font-semibold">{getChartTitle()}</h3>
        </div>
        {getInsights()}
      </div>

      {/* Chart Container */}
      <div className="relative" style={{ height: `${height}px` }}>
        <canvas 
          ref={canvasRef}
          className="w-full h-full"
        />
      </div>

      {/* Chart Summary */}
      {data && data.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-border">
          {type === 'revenue' && (
            <>
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">
                  ${data.reduce((sum, d) => sum + (d.revenue || 0), 0).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Total Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">
                  ${(data.reduce((sum, d) => sum + (d.revenue || 0), 0) / data.length).toFixed(0)}
                </div>
                <div className="text-xs text-muted-foreground">Avg per Period</div>
              </div>
            </>
          )}
          
          {type === 'engagement' && (
            <>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-400">
                  {((data.reduce((sum, d) => sum + (d.reach || 0), 0)) / 1000000).toFixed(1)}M
                </div>
                <div className="text-xs text-muted-foreground">Total Reach</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-pink-400">
                  {(data.reduce((sum, d) => sum + (d.engagement || 0), 0) / 1000).toFixed(0)}K
                </div>
                <div className="text-xs text-muted-foreground">Total Engagement</div>
              </div>
            </>
          )}

          <div className="text-center">
            <div className="text-lg font-bold">
              {data.length}
            </div>
            <div className="text-xs text-muted-foreground">Data Points</div>
          </div>
          
          <div className="text-center">
            <Badge variant="outline" className="text-green-400 border-green-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              Growing
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}
