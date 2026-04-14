import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, BookOpen, Pencil, Trash2, Undo2 } from "lucide-react";
import { toast } from "sonner";

const emptyBook = { title: "", author: "", isbn: "", category: "", total_copies: 1 };

const Library = () => {
  const [search, setSearch] = useState("");
  const [bookOpen, setBookOpen] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<any>(null);
  const [bookForm, setBookForm] = useState(emptyBook);
  const [issueForm, setIssueForm] = useState({ book_id: "", student_id: "", due_date: "" });
  const qc = useQueryClient();

  const { data: books = [] } = useQuery({
    queryKey: ["library-books", search],
    queryFn: async () => {
      let q = supabase.from("library_books").select("*").order("title");
      if (search.trim()) q = q.or(`title.ilike.%${search}%,author.ilike.%${search}%,isbn.ilike.%${search}%`);
      const { data } = await q;
      return data || [];
    },
  });

  const { data: issues = [] } = useQuery({
    queryKey: ["book-issues"],
    queryFn: async () => {
      const { data } = await supabase.from("book_issues").select("*, library_books(title, author), students(full_name, usn)").order("issue_date", { ascending: false });
      return data || [];
    },
  });

  const { data: students = [] } = useQuery({
    queryKey: ["students-all"],
    queryFn: async () => {
      const { data } = await supabase.from("students").select("*").eq("status", "active").order("full_name");
      return data || [];
    },
  });

  const saveBook = useMutation({
    mutationFn: async (data: typeof bookForm) => {
      const payload = { ...data, total_copies: Number(data.total_copies), available_copies: Number(data.total_copies) };
      if (editingBook) {
        const { error } = await supabase.from("library_books").update({ title: data.title, author: data.author, isbn: data.isbn || null, category: data.category || null, total_copies: Number(data.total_copies) }).eq("id", editingBook.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("library_books").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["library-books"] });
      qc.invalidateQueries({ queryKey: ["books-count"] });
      toast.success(editingBook ? "Book updated" : "Book added");
      setBookOpen(false);
      setEditingBook(null);
      setBookForm(emptyBook);
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteBook = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("library_books").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["library-books"] }); qc.invalidateQueries({ queryKey: ["books-count"] }); toast.success("Book deleted"); },
    onError: (e) => toast.error(e.message),
  });

  const issueBook = useMutation({
    mutationFn: async (data: typeof issueForm) => {
      const { error: issueErr } = await supabase.from("book_issues").insert({
        book_id: data.book_id,
        student_id: data.student_id,
        due_date: data.due_date,
        status: "issued",
      });
      if (issueErr) throw issueErr;
      const book = books.find((b) => b.id === data.book_id);
      if (book) {
        await supabase.from("library_books").update({ available_copies: Math.max(0, book.available_copies - 1) }).eq("id", data.book_id);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["book-issues"] });
      qc.invalidateQueries({ queryKey: ["library-books"] });
      qc.invalidateQueries({ queryKey: ["overdue-books"] });
      toast.success("Book issued");
      setIssueOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const returnBook = useMutation({
    mutationFn: async (issue: any) => {
      const { error } = await supabase.from("book_issues").update({
        status: "returned",
        return_date: new Date().toISOString().split("T")[0],
      }).eq("id", issue.id);
      if (error) throw error;
      const book = books.find((b) => b.id === issue.book_id);
      if (book) {
        await supabase.from("library_books").update({ available_copies: book.available_copies + 1 }).eq("id", issue.book_id);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["book-issues"] });
      qc.invalidateQueries({ queryKey: ["library-books"] });
      qc.invalidateQueries({ queryKey: ["overdue-books"] });
      toast.success("Book returned");
    },
    onError: (e) => toast.error(e.message),
  });

  const today = new Date().toISOString().split("T")[0];
  const overdueIssues = issues.filter((i: any) => i.status === "issued" && i.due_date < today);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Library</h1>
          <div className="flex gap-2">
            <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
              <DialogTrigger asChild><Button variant="outline"><BookOpen className="w-4 h-4 mr-2" />Issue Book</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Issue Book</DialogTitle></DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); issueBook.mutate(issueForm); }} className="space-y-3">
                  <div>
                    <Label>Book</Label>
                    <Select value={issueForm.book_id} onValueChange={(v) => setIssueForm({ ...issueForm, book_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select book" /></SelectTrigger>
                      <SelectContent>
                        {books.filter((b) => b.available_copies > 0).map((b) => (
                          <SelectItem key={b.id} value={b.id}>{b.title} ({b.available_copies} avail.)</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Student</Label>
                    <Select value={issueForm.student_id} onValueChange={(v) => setIssueForm({ ...issueForm, student_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                      <SelectContent>{students.map((s) => <SelectItem key={s.id} value={s.id}>{s.full_name} ({s.usn})</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Due Date</Label><Input type="date" value={issueForm.due_date} onChange={(e) => setIssueForm({ ...issueForm, due_date: e.target.value })} required /></div>
                  <Button type="submit" className="w-full" disabled={issueBook.isPending}>Issue Book</Button>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={bookOpen} onOpenChange={setBookOpen}>
              <DialogTrigger asChild><Button onClick={() => { setEditingBook(null); setBookForm(emptyBook); }}><Plus className="w-4 h-4 mr-2" />Add Book</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{editingBook ? "Edit" : "Add"} Book</DialogTitle></DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); saveBook.mutate(bookForm); }} className="space-y-3">
                  <div><Label>Title</Label><Input value={bookForm.title} onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })} required /></div>
                  <div><Label>Author</Label><Input value={bookForm.author} onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })} required /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>ISBN</Label><Input value={bookForm.isbn} onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })} /></div>
                    <div><Label>Category</Label><Input value={bookForm.category} onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })} /></div>
                  </div>
                  <div><Label>Total Copies</Label><Input type="number" value={bookForm.total_copies} onChange={(e) => setBookForm({ ...bookForm, total_copies: Number(e.target.value) })} min={1} required /></div>
                  <Button type="submit" className="w-full" disabled={saveBook.isPending}>{editingBook ? "Update" : "Add"} Book</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Books</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{books.length}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Currently Issued</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-warning">{issues.filter((i: any) => i.status === "issued").length}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Overdue</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-destructive">{overdueIssues.length}</div></CardContent></Card>
        </div>

        <Tabs defaultValue="catalog">
          <TabsList>
            <TabsTrigger value="catalog">Book Catalog</TabsTrigger>
            <TabsTrigger value="issues">Issued Books</TabsTrigger>
            <TabsTrigger value="overdue">Overdue ({overdueIssues.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="catalog">
            <Card>
              <CardHeader>
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search books..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Author</TableHead><TableHead>ISBN</TableHead><TableHead>Category</TableHead><TableHead>Available</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {books.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium">{b.title}</TableCell>
                        <TableCell>{b.author}</TableCell>
                        <TableCell>{b.isbn || "-"}</TableCell>
                        <TableCell>{b.category || "-"}</TableCell>
                        <TableCell><Badge variant={b.available_copies > 0 ? "default" : "destructive"}>{b.available_copies}/{b.total_copies}</Badge></TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" onClick={() => {
                              setEditingBook(b);
                              setBookForm({ title: b.title, author: b.author, isbn: b.isbn || "", category: b.category || "", total_copies: b.total_copies });
                              setBookOpen(true);
                            }}><Pencil className="w-4 h-4" /></Button>
                            <Button size="icon" variant="ghost" onClick={() => deleteBook.mutate(b.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="issues">
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader><TableRow><TableHead>Book</TableHead><TableHead>Student</TableHead><TableHead>Issued</TableHead><TableHead>Due</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {issues.filter((i: any) => i.status === "issued").map((i: any) => (
                      <TableRow key={i.id}>
                        <TableCell className="font-medium">{i.library_books?.title}</TableCell>
                        <TableCell>{i.students?.full_name} ({i.students?.usn})</TableCell>
                        <TableCell>{i.issue_date}</TableCell>
                        <TableCell>{i.due_date}</TableCell>
                        <TableCell><Badge variant={i.due_date < today ? "destructive" : "default"}>{i.due_date < today ? "Overdue" : "Issued"}</Badge></TableCell>
                        <TableCell><Button size="sm" onClick={() => returnBook.mutate(i)}><Undo2 className="w-4 h-4 mr-1" />Return</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="overdue">
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader><TableRow><TableHead>Book</TableHead><TableHead>Student</TableHead><TableHead>Due Date</TableHead><TableHead>Days Overdue</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {overdueIssues.map((i: any) => (
                      <TableRow key={i.id}>
                        <TableCell className="font-medium">{i.library_books?.title}</TableCell>
                        <TableCell>{i.students?.full_name}</TableCell>
                        <TableCell>{i.due_date}</TableCell>
                        <TableCell><Badge variant="destructive">{Math.floor((new Date().getTime() - new Date(i.due_date).getTime()) / 86400000)} days</Badge></TableCell>
                        <TableCell><Button size="sm" onClick={() => returnBook.mutate(i)}><Undo2 className="w-4 h-4 mr-1" />Return</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Library;
