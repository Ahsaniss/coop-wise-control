import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, TrendingUp, Calendar } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { toast } from "sonner";

const monthlyData = [
  { month: "Jan", feed: 45000, medicine: 8000, labor: 15000, other: 7000 },
  { month: "Feb", feed: 52000, medicine: 6000, labor: 15000, other: 9000 },
  { month: "Mar", feed: 48000, medicine: 12000, labor: 15000, other: 6000 },
  { month: "Apr", feed: 61000, medicine: 9000, labor: 18000, other: 8000 },
  { month: "May", feed: 55000, medicine: 7000, labor: 18000, other: 10000 },
  { month: "Jun", feed: 58000, medicine: 11000, labor: 18000, other: 8000 },
];

const costTrendData = [
  { month: "Jan", feedCost: 90, laborCost: 1250 },
  { month: "Feb", feedCost: 96, laborCost: 1250 },
  { month: "Mar", feedCost: 94, laborCost: 1250 },
  { month: "Apr", feedCost: 100, laborCost: 1500 },
  { month: "May", feedCost: 98, laborCost: 1500 },
  { month: "Jun", feedCost: 102, laborCost: 1500 },
];

const Reports = () => {
  const handleExport = (format: string) => {
    toast.success(`Exporting report as ${format}...`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">Comprehensive insights and data visualization</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport("PDF")} className="gap-2">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport("Excel")} className="gap-2">
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹5,42,000</div>
            <p className="text-xs text-success mt-1">+12.5% from last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹3,69,000</div>
            <p className="text-xs text-warning mt-1">+8.2% from last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">₹1,73,000</div>
            <p className="text-xs text-muted-foreground mt-1">31.9% margin</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reporting Period</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground mt-1">Months (Jan - Jun)</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)"
                }}
              />
              <Legend />
              <Bar dataKey="feed" name="Feed" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="medicine" name="Medicine" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="labor" name="Labor" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="other" name="Other" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Feed Cost per kg Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={costTrendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)"
                  }}
                  formatter={(value) => [`₹${value}`, ""]}
                />
                <Line 
                  type="monotone" 
                  dataKey="feedCost" 
                  name="Cost per kg"
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--chart-1))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Labor Cost per Worker Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={costTrendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)"
                  }}
                  formatter={(value) => [`₹${value}`, ""]}
                />
                <Line 
                  type="monotone" 
                  dataKey="laborCost" 
                  name="Cost per worker"
                  stroke="hsl(var(--chart-3))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--chart-3))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-success/10 border border-success/20 rounded-lg">
            <TrendingUp className="h-5 w-5 text-success mt-0.5" />
            <div>
              <h4 className="font-medium text-success">Positive Trend</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Feed efficiency has improved by 8% compared to last quarter. Cost per kg of production is decreasing.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <FileText className="h-5 w-5 text-warning mt-0.5" />
            <div>
              <h4 className="font-medium text-warning">Attention Required</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Medicine costs have increased by 15% in the last 3 months. Consider reviewing vaccination schedules.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-accent border border-border rounded-lg">
            <Calendar className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium">Upcoming</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Two staff members have pending salary payments totaling ₹8,000. Payment due by end of month.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
