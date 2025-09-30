import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, DollarSign, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const mockStaffData = [
  { id: 1, name: "Rajesh Kumar", role: "Supervisor", phone: "9876543210", totalPaid: 45000, pending: 0 },
  { id: 2, name: "Amit Sharma", role: "Feeder", phone: "9876543211", totalPaid: 28000, pending: 5000 },
  { id: 3, name: "Priya Singh", role: "Cleaner", phone: "9876543212", totalPaid: 22000, pending: 0 },
  { id: 4, name: "Suresh Patel", role: "Feeder", phone: "9876543213", totalPaid: 30000, pending: 3000 },
];

const Staff = () => {
  const [staff, setStaff] = useState(mockStaffData);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<typeof mockStaffData[0] | null>(null);

  const filteredData = staff.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStaff = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newStaff = {
      id: staff.length + 1,
      name: formData.get("name") as string,
      role: formData.get("role") as string,
      phone: formData.get("phone") as string,
      totalPaid: 0,
      pending: 0,
    };

    setStaff([...staff, newStaff]);
    setIsAddDialogOpen(false);
    toast.success("Staff member added successfully!");
    e.currentTarget.reset();
  };

  const handleAddPayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedStaff) return;

    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get("amount"));

    setStaff(staff.map(s => 
      s.id === selectedStaff.id 
        ? { ...s, totalPaid: s.totalPaid + amount }
        : s
    ));

    setIsPaymentDialogOpen(false);
    setSelectedStaff(null);
    toast.success("Payment recorded successfully!");
    e.currentTarget.reset();
  };

  const handleDelete = (id: number) => {
    setStaff(staff.filter(item => item.id !== id));
    toast.success("Staff member removed successfully!");
  };

  const totalPending = staff.reduce((sum, s) => sum + s.pending, 0);

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
            <div className="text-2xl font-bold">₹{staff.reduce((sum, s) => sum + s.totalPaid, 0).toLocaleString()}</div>
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
              {staff.filter(s => s.pending > 0).length} staff member(s)
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
              {filteredData.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{member.role}</Badge>
                  </TableCell>
                  <TableCell>{member.phone}</TableCell>
                  <TableCell className="text-right">₹{member.totalPaid.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    {member.pending > 0 ? (
                      <span className="text-warning font-semibold">₹{member.pending.toLocaleString()}</span>
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
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
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
              ))}
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
                  <p className="font-medium">{selectedStaff.name}</p>
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
              <Button type="submit" className="w-full">Record Payment</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Staff;
