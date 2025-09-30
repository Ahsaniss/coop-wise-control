import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const mockFeedData = [
  { id: 1, name: "Layer Mash Premium", vehicle: "MH-12-AB-1234", date: "2024-01-15", quantity: 500, cost: 25000 },
  { id: 2, name: "Grower Feed", vehicle: "MH-12-CD-5678", date: "2024-01-20", quantity: 300, cost: 13500 },
  { id: 3, name: "Layer Mash Standard", vehicle: "MH-12-AB-1234", date: "2024-02-05", quantity: 450, cost: 22000 },
  { id: 4, name: "Starter Feed", vehicle: "MH-12-EF-9012", date: "2024-02-12", quantity: 200, cost: 11000 },
];

const FeedManagement = () => {
  const [feedData, setFeedData] = useState(mockFeedData);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredData = feedData.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.vehicle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddFeed = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newFeed = {
      id: feedData.length + 1,
      name: formData.get("name") as string,
      vehicle: formData.get("vehicle") as string,
      date: formData.get("date") as string,
      quantity: Number(formData.get("quantity")),
      cost: Number(formData.get("cost")),
    };

    setFeedData([...feedData, newFeed]);
    setIsDialogOpen(false);
    toast.success("Feed record added successfully!");
    e.currentTarget.reset();
  };

  const handleDelete = (id: number) => {
    setFeedData(feedData.filter(item => item.id !== id));
    toast.success("Feed record deleted successfully!");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Feed Management</h1>
          <p className="text-muted-foreground mt-1">Track and manage all feed purchases</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Feed Purchase
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Feed Purchase</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddFeed} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Feed Name</Label>
                <Input id="name" name="name" placeholder="e.g., Layer Mash Premium" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle">Vehicle Number</Label>
                <Input id="vehicle" name="vehicle" placeholder="e.g., MH-12-AB-1234" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Purchase Date</Label>
                <Input id="date" name="date" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (kg)</Label>
                <Input id="quantity" name="quantity" type="number" placeholder="500" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Total Cost (₹)</Label>
                <Input id="cost" name="cost" type="number" placeholder="25000" required />
              </div>
              <Button type="submit" className="w-full">Add Feed Purchase</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Feed Purchase History</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or vehicle..."
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
                <TableHead>Feed Name</TableHead>
                <TableHead>Vehicle Number</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Quantity (kg)</TableHead>
                <TableHead className="text-right">Cost (₹)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.vehicle}</TableCell>
                  <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">₹{item.cost.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(item.id)}
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
    </div>
  );
};

export default FeedManagement;
