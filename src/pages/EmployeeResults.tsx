import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Edit, Trash2, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Logo from '@/components/ui/logo';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';

interface EmployeeResult {
  id: string;
  serialNumber: number;
  name: string;
  gender: string;
  position: string;
  timeSubmitted: string;
  totalMarks: number;
}

const EmployeeResults = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<EmployeeResult[]>([]);
  const [editingResult, setEditingResult] = useState<EmployeeResult | null>(null);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const { data, error } = await supabase
        .from('employee_results')
        .select('*')
        .order('serial_number', { ascending: true });

      if (error) throw error;

      const formattedResults: EmployeeResult[] = data.map(r => ({
        id: r.id,
        serialNumber: r.serial_number,
        name: r.name,
        gender: r.gender,
        position: r.position,
        timeSubmitted: new Date(r.time_submitted).toLocaleString(),
        totalMarks: r.total_marks
      }));

      setResults(formattedResults);
    } catch (error) {
      console.error('Error loading results:', error);
      toast({
        title: "Error",
        description: "Failed to load results from database.",
        variant: "destructive",
      });
    }
  };

  const handleEditResult = (result: EmployeeResult) => {
    setEditingResult({...result});
  };

  const handleUpdateResult = async () => {
    if (!editingResult) return;

    try {
      const { error } = await supabase
        .from('employee_results')
        .update({
          name: editingResult.name,
          position: editingResult.position,
          total_marks: editingResult.totalMarks
        })
        .eq('id', editingResult.id);

      if (error) throw error;

      await loadResults(); // Reload to get fresh data
      setEditingResult(null);

      toast({
        title: "Success",
        description: "Result updated successfully"
      });
    } catch (error) {
      console.error('Error updating result:', error);
      toast({
        title: "Error",
        description: "Failed to update result.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteResult = async (id: string) => {
    try {
      const { error } = await supabase
        .from('employee_results')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadResults(); // Reload to get fresh data

      toast({
        title: "Success",
        description: "Result deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting result:', error);
      toast({
        title: "Error",
        description: "Failed to delete result.",
        variant: "destructive",
      });
    }
  };

  const handleExportToExcel = () => {
    if (results.length === 0) {
      toast({
        title: "No Data",
        description: "No results to export",
        variant: "destructive"
      });
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(results.map(result => ({
      'Serial Number': result.serialNumber,
      'Name': result.name,
      'Gender': result.gender,
      'Position Applying For': result.position,
      'Time Submitted': result.timeSubmitted,
      'Total Marks': `${result.totalMarks}/50`
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employee Results');

    const fileName = `Worbyn_Employee_Results_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast({
      title: "Success",
      description: "Results exported to Excel successfully"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigate('/admin-dashboard')}
              variant="outline"
              className="rounded-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <Logo size="md" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Employee Test Results
          </h1>
          <p className="text-lg text-muted-foreground">
            View and manage employee test performance
          </p>
        </div>

        <Card className="shadow-elegant border-0">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Results ({results.length} entries)</CardTitle>
              <Button
                onClick={handleExportToExcel}
                className="bg-success hover:bg-success/90 text-success-foreground rounded-sm"
                disabled={results.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export to Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No test results available yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Serial No.</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Position Applying For</TableHead>
                      <TableHead>Time Submitted</TableHead>
                      <TableHead>Total Marks</TableHead>
                      <TableHead className="w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell className="font-medium">
                          {result.serialNumber}
                        </TableCell>
                        <TableCell>{result.name}</TableCell>
                        <TableCell className="capitalize">{result.gender}</TableCell>
                        <TableCell>{result.position}</TableCell>
                        <TableCell>{result.timeSubmitted}</TableCell>
                        <TableCell>
                          <span className={`font-semibold ${
                            result.totalMarks >= 35 ? 'text-success' : 
                            result.totalMarks >= 25 ? 'text-accent' : 'text-destructive'
                          }`}>
                            {result.totalMarks}/50
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleEditResult(result)}
                              size="sm"
                              variant="outline"
                              className="rounded-sm"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteResult(result.id)}
                              size="sm"
                              variant="destructive"
                              className="rounded-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Result Dialog */}
        <Dialog open={!!editingResult} onOpenChange={() => setEditingResult(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Employee Result</DialogTitle>
            </DialogHeader>
            {editingResult && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={editingResult.name}
                    onChange={(e) => setEditingResult({...editingResult, name: e.target.value})}
                    className="rounded-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-position">Position</Label>
                  <Input
                    id="edit-position"
                    value={editingResult.position}
                    onChange={(e) => setEditingResult({...editingResult, position: e.target.value})}
                    className="rounded-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-marks">Total Marks</Label>
                  <Input
                    id="edit-marks"
                    type="number"
                    min="0"
                    max="50"
                    value={editingResult.totalMarks}
                    onChange={(e) => setEditingResult({...editingResult, totalMarks: parseInt(e.target.value) || 0})}
                    className="rounded-sm"
                  />
                </div>

                <Button
                  onClick={handleUpdateResult}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm"
                >
                  Update Result
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default EmployeeResults;