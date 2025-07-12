import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Edit, Trash2, Eye, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Logo from '@/components/ui/logo';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { supabase } from '@/integrations/supabase/client';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

const MCQQuestions = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState<Omit<Question, 'id'>>({
    question: '',
    options: ['', '', '', '', ''],
    correctAnswer: 0
  });

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('mcq_questions')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedQuestions: Question[] = data.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correct_answer
      }));

      setQuestions(formattedQuestions);

      // Get selected questions
      const selected = data.filter(q => q.is_selected).map(q => q.id);
      setSelectedQuestions(selected);
    } catch (error) {
      console.error('Error loading questions:', error);
      toast({
        title: "Error",
        description: "Failed to load questions from database.",
        variant: "destructive",
      });
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.question.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question",
        variant: "destructive"
      });
      return;
    }

    const validOptions = newQuestion.options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      toast({
        title: "Error",
        description: "Please provide at least 2 options",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('mcq_questions')
        .insert({
          question: newQuestion.question,
          options: newQuestion.options,
          correct_answer: newQuestion.correctAnswer,
          is_selected: false
        })
        .select()
        .single();

      if (error) throw error;

      const formattedQuestion: Question = {
        id: data.id,
        question: data.question,
        options: data.options,
        correctAnswer: data.correct_answer
      };

      setQuestions(prev => [...prev, formattedQuestion]);

      setNewQuestion({
        question: '',
        options: ['', '', '', '', ''],
        correctAnswer: 0
      });
      setShowAddForm(false);

      toast({
        title: "Success",
        description: "Question added successfully"
      });
    } catch (error) {
      console.error('Error adding question:', error);
      toast({
        title: "Error",
        description: "Failed to add question to database.",
        variant: "destructive",
      });
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion({...question});
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;

    try {
      const { error } = await supabase
        .from('mcq_questions')
        .update({
          question: editingQuestion.question,
          options: editingQuestion.options,
          correct_answer: editingQuestion.correctAnswer
        })
        .eq('id', editingQuestion.id);

      if (error) throw error;

      const updatedQuestions = questions.map(q =>
        q.id === editingQuestion.id ? editingQuestion : q
      );
      setQuestions(updatedQuestions);
      setEditingQuestion(null);

      toast({
        title: "Success",
        description: "Question updated successfully"
      });
    } catch (error) {
      console.error('Error updating question:', error);
      toast({
        title: "Error",
        description: "Failed to update question.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      const { error } = await supabase
        .from('mcq_questions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setQuestions(prev => prev.filter(q => q.id !== id));
      setSelectedQuestions(prev => prev.filter(qId => qId !== id));

      toast({
        title: "Success",
        description: "Question deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: "Error",
        description: "Failed to delete question.",
        variant: "destructive",
      });
    }
  };

  const handleQuestionSelection = async (questionId: string, selected: boolean) => {
    if (selected && selectedQuestions.length >= 25) {
      toast({
        title: "Limit Reached",
        description: "You can only select up to 25 questions for the test",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('mcq_questions')
        .update({ is_selected: selected })
        .eq('id', questionId);

      if (error) throw error;

      let updatedSelected;
      if (selected) {
        updatedSelected = [...selectedQuestions, questionId];
      } else {
        updatedSelected = selectedQuestions.filter(id => id !== questionId);
      }

      setSelectedQuestions(updatedSelected);

      toast({
        title: "Success",
        description: `${updatedSelected.length} questions selected for test`
      });
    } catch (error) {
      console.error('Error updating question selection:', error);
      toast({
        title: "Error",
        description: "Failed to update question selection.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="max-w-6xl mx-auto">
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
            MCQ Questions Management
          </h1>
          <p className="text-lg text-muted-foreground">
            Add and manage questions for the employee test
          </p>
        </div>

        {/* Add Question Form */}
        <Card className="shadow-elegant border-0 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Add New Question</span>
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                {showAddForm ? 'Cancel' : 'Add Question'}
              </Button>
            </CardTitle>
          </CardHeader>
          {showAddForm && (
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-semibold">Question</Label>
                  <RichTextEditor
                    value={newQuestion.question}
                    onChange={(value) => setNewQuestion({...newQuestion, question: value})}
                    placeholder="Enter your question here. You can paste images with Ctrl+C, Ctrl+V"
                    className="mt-2"
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">Options</Label>
                  {newQuestion.options.map((option, index) => (
                    <div key={index} className="space-y-2">
                      <Label>Option {String.fromCharCode(65 + index)} {index >= 4 && '(Optional)'}</Label>
                      <RichTextEditor
                        value={option}
                        onChange={(value) => {
                          const newOptions = [...newQuestion.options];
                          newOptions[index] = value;
                          setNewQuestion({...newQuestion, options: newOptions});
                        }}
                        placeholder={`Enter option ${String.fromCharCode(65 + index)}`}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <Label className="text-base font-semibold">Correct Answer</Label>
                  <Select
                    value={newQuestion.correctAnswer.toString()}
                    onValueChange={(value) => setNewQuestion({...newQuestion, correctAnswer: parseInt(value)})}
                  >
                    <SelectTrigger className="mt-2 rounded-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {newQuestion.options.map((option, index) => (
                        option.trim() && (
                          <SelectItem key={index} value={index.toString()}>
                            Option {String.fromCharCode(65 + index)}
                          </SelectItem>
                        )
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleAddQuestion}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm"
                >
                  Add Question
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Questions List */}
        <Card className="shadow-elegant border-0">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Questions Bank ({questions.length} questions)</span>
              <div className="text-sm text-muted-foreground">
                Selected for test: {selectedQuestions.length}/25
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {questions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No questions added yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <Card key={question.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <input
                              type="checkbox"
                              checked={selectedQuestions.includes(question.id)}
                              onChange={(e) => handleQuestionSelection(question.id, e.target.checked)}
                              disabled={!selectedQuestions.includes(question.id) && selectedQuestions.length >= 25}
                              className="w-4 h-4"
                            />
                            <span className="font-semibold">Question {index + 1}</span>
                          </div>
                          <div
                            className="mb-3 text-sm"
                            dangerouslySetInnerHTML={{ __html: question.question }}
                          />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            {question.options.map((option, optIndex) => (
                              option.trim() && (
                                <div
                                  key={optIndex}
                                  className={`p-2 rounded border ${
                                    optIndex === question.correctAnswer 
                                      ? 'bg-success/10 border-success' 
                                      : 'bg-muted/50'
                                  }`}
                                >
                                  <span className="font-semibold mr-2">
                                    {String.fromCharCode(65 + optIndex)}:
                                  </span>
                                  <span dangerouslySetInnerHTML={{ __html: option }} />
                                </div>
                              )
                            ))}
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button
                            onClick={() => handleEditQuestion(question)}
                            size="sm"
                            variant="outline"
                            className="rounded-sm"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteQuestion(question.id)}
                            size="sm"
                            variant="destructive"
                            className="rounded-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Question Dialog */}
        <Dialog open={!!editingQuestion} onOpenChange={() => setEditingQuestion(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Question</DialogTitle>
            </DialogHeader>
            {editingQuestion && (
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-semibold">Question</Label>
                  <RichTextEditor
                    value={editingQuestion.question}
                    onChange={(value) => setEditingQuestion({...editingQuestion, question: value})}
                    className="mt-2"
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">Options</Label>
                  {editingQuestion.options.map((option, index) => (
                    <div key={index} className="space-y-2">
                      <Label>Option {String.fromCharCode(65 + index)} {index >= 4 && '(Optional)'}</Label>
                      <RichTextEditor
                        value={option}
                        onChange={(value) => {
                          const newOptions = [...editingQuestion.options];
                          newOptions[index] = value;
                          setEditingQuestion({...editingQuestion, options: newOptions});
                        }}
                        placeholder={`Enter option ${String.fromCharCode(65 + index)}`}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <Label className="text-base font-semibold">Correct Answer</Label>
                  <Select
                    value={editingQuestion.correctAnswer.toString()}
                    onValueChange={(value) => setEditingQuestion({...editingQuestion, correctAnswer: parseInt(value)})}
                  >
                    <SelectTrigger className="mt-2 rounded-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {editingQuestion.options.map((option, index) => (
                        option.trim() && (
                          <SelectItem key={index} value={index.toString()}>
                            Option {String.fromCharCode(65 + index)}
                          </SelectItem>
                        )
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleUpdateQuestion}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm"
                >
                  Update Question
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MCQQuestions;