import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const expenseTypes = ["Medicine", "Equipment", "Utilities", "Maintenance", "Transport", "Other"];

const Expenses = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("");

  useEffect(() => {
    fetchExpenses();
  }, [user]);

  const fetchExpenses = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .order("expense_date", { ascending: false });

    if (error) {
      toast.error("Failed to load expenses");
      console.error(error);
    } else {
      setExpenses(data || []);
    }
    setLoading(false);
  };

  const filteredData = expenses.filter(item => {
    const matchesSearch = item.expense_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === "all" || item.expense_type === filterType;
    return matchesSearch && matchesType;
  });

  const totalExpenses = filteredData.reduce((sum, item) => sum + parseFloat(item.amount), 0);

  const handleAddExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const { error } = await supabase
      .from("expenses")
      .insert([{
        user_id: user?.id,
        expense_type: selectedType,
        amount: Number(formData.get("amount")),
        expense_date: formData.get("date") as string,
        notes: formData.get("notes") as string || null,
      }]);

    if (error) {
      toast.error("Failed to add expense");
      console.error(error);
    } else {
      toast.success("Expense added successfully!");
      setIsDialogOpen(false);
      setSelectedType("");
      e.currentTarget.reset();
      fetchExpenses();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete expense");
      console.error(error);
    } else {
      toast.success("Expense deleted successfully!");
      fetchExpenses();
    }
  };

  const handleExport = () => {
    toast.success("Export functionality will be available soon!");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Expense Tracking</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage all operational expenses</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Expense Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Expense Description</Label>
                <Input id="notes" name="notes" placeholder="e.g., Medicine for infection" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input id="amount" name="amount" type="number" placeholder="5000" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" required />
              </div>
              <Button type="submit" className="w-full" disabled={!selectedType}>Add Expense</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle>Expense History</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {expenseTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">No expenses found</TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
                          {item.expense_type}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{item.notes || '-'}</TableCell>
                      <TableCell>{new Date(item.expense_date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right font-semibold">₹{parseFloat(item.amount).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                ₹{totalExpenses.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredData.length} transaction(s)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2" onClick={handleExport}>
                <Download className="h-4 w-4" />
                Export to Excel
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" onClick={handleExport}>
                <Download className="h-4 w-4" />
                Export to PDF
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
