import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const FeedManagement = () => {
  const { user } = useAuth();
  const [feedData, setFeedData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedData();
  }, [user]);

  const fetchFeedData = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("feed_purchases")
      .select("*")
      .order("purchase_date", { ascending: false });

    if (error) {
      toast.error("Failed to load feed data");
      console.error(error);
    } else {
      setFeedData(data || []);
    }
    setLoading(false);
  };

  const filteredData = feedData.filter(item =>
    item.feed_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddFeed = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const { error } = await supabase
      .from("feed_purchases")
      .insert([{
        user_id: user?.id,
        feed_name: formData.get("name") as string,
        vehicle_number: formData.get("vehicle") as string,
        purchase_date: formData.get("date") as string,
        quantity: Number(formData.get("quantity")),
        total_cost: Number(formData.get("cost")),
      }]);

    if (error) {
      toast.error("Failed to add feed record");
      console.error(error);
    } else {
      toast.success("Feed record added successfully!");
      setIsDialogOpen(false);
      e.currentTarget.reset();
      fetchFeedData();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("feed_purchases")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete feed record");
      console.error(error);
    } else {
      toast.success("Feed record deleted successfully!");
      fetchFeedData();
    }
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">No feed purchases found</TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.feed_name}</TableCell>
                    <TableCell>{item.vehicle_number}</TableCell>
                    <TableCell>{new Date(item.purchase_date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">₹{item.total_cost.toLocaleString()}</TableCell>
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
    </div>
  );
};

export default FeedManagement;
