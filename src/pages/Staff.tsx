import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, DollarSign, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Staff = () => {
  const { user } = useAuth();
  const [staff, setStaff] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState("paid");

  useEffect(() => {
    fetchStaff();
    fetchPayments();
  }, [user]);

  const fetchStaff = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("staff")
      .select("*")
      .order("full_name");

    if (error) {
      toast.error("Failed to load staff");
      console.error(error);
    } else {
      setStaff(data || []);
    }
    setLoading(false);
  };

  const fetchPayments = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("staff_payments")
      .select("*");

    if (error) {
      console.error("Failed to load payments:", error);
    } else {
      setPayments(data || []);
    }
  };

  const getStaffPayments = (staffId: string) => {
    return payments.filter(p => p.staff_id === staffId);
  };

  const getTotalPaid = (staffId: string) => {
    return getStaffPayments(staffId)
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);
  };

  const getPending = (staffId: string) => {
    return getStaffPayments(staffId)
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);
  };

  const filteredData = staff.filter(item =>
    item.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStaff = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const { error } = await supabase
      .from("staff")
      .insert([{
        user_id: user?.id,
        full_name: formData.get("name") as string,
        role: formData.get("role") as string,
        contact_phone: formData.get("phone") as string,
        contact_email: formData.get("email") as string || null,
      }]);

    if (error) {
      toast.error("Failed to add staff member");
      console.error(error);
    } else {
      toast.success("Staff member added successfully!");
      setIsAddDialogOpen(false);
      e.currentTarget.reset();
      fetchStaff();
    }
  };

  const handleAddPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedStaff) return;

    const formData = new FormData(e.currentTarget);
    
    const { error } = await supabase
      .from("staff_payments")
      .insert([{
        user_id: user?.id,
        staff_id: selectedStaff.id,
        amount: Number(formData.get("amount")),
        payment_date: formData.get("paymentDate") as string,
        status: paymentStatus,
      }]);

    if (error) {
      toast.error("Failed to record payment");
      console.error(error);
    } else {
      toast.success("Payment recorded successfully!");
      setIsPaymentDialogOpen(false);
      setSelectedStaff(null);
      setPaymentStatus("paid");
      e.currentTarget.reset();
      fetchPayments();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("staff")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to remove staff member");
      console.error(error);
    } else {
      toast.success("Staff member removed successfully!");
      fetchStaff();
    }
  };

  const totalPending = staff.reduce((sum, s) => sum + getPending(s.id), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Staff Management</h1>
          <p className="text-muted-foreground mt-1">Manage workers and track payments</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Staff Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddStaff} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" placeholder="e.g., Rajesh Kumar" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" name="role" placeholder="e.g., Feeder, Cleaner, Supervisor" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" type="tel" placeholder="9876543210" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (optional)</Label>
                <Input id="email" name="email" type="email" placeholder="email@example.com" />
              </div>
              <Button type="submit" className="w-full">Add Staff Member</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staff.length}</div>
            <p className="text-xs text-muted-foreground">Active workers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{staff.reduce((sum, s) => sum + getTotalPaid(s.id), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">All time payments</p>
          </CardContent>
        </Card>

        <Card className={totalPending > 0 ? "border-warning" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">₹{totalPending.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {staff.filter(s => getPending(s.id) > 0).length} staff member(s)
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Staff Directory</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Total Paid</TableHead>
                <TableHead className="text-right">Pending</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">No staff members found</TableCell>
                </TableRow>
              ) : (
                filteredData.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.full_name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{member.role}</Badge>
                    </TableCell>
                    <TableCell>{member.contact_phone}</TableCell>
                    <TableCell className="text-right">₹{getTotalPaid(member.id).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      {getPending(member.id) > 0 ? (
                        <span className="text-warning font-semibold">₹{getPending(member.id).toLocaleString()}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => {
                            setSelectedStaff(member);
                            setIsPaymentDialogOpen(true);
                          }}
                        >
                          <DollarSign className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(member.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          {selectedStaff && (
            <form onSubmit={handleAddPayment} className="space-y-4">
              <div className="space-y-2">
                <Label>Staff Member</Label>
                <div className="p-3 bg-accent rounded-lg">
                  <p className="font-medium">{selectedStaff.full_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedStaff.role}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Payment Amount (₹)</Label>
                <Input id="amount" name="amount" type="number" placeholder="5000" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentDate">Payment Date</Label>
                <Input id="paymentDate" name="paymentDate" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Record Payment</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Staff;
