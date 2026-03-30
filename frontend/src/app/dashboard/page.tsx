'use client';

import { useEffect, useState, useRef } from 'react';
import { apiClient } from '@/lib/api';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { PlusCircle, Loader2, Sparkles, LogOut, Settings, Trash2, Edit2, X, Check, SearchX, BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useUserStore } from '@/store/useUserStore';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PracticeEntryPoint } from '@/components/practice/PracticeEntryPoint';

interface Word {
    id: number;
    term: string;
    definition: string;
    phonetic: string | null;
    example: string | null;
}

interface Lesson {
    id: number;
    title: string;
    description: string | null;
    notes: string | null;
    status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED';
    words: Word[];
}

export default function DashboardPage() {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Vocab CRUD States
    const [isAddingWord, setIsAddingWord] = useState(false);
    const [newWord, setNewWord] = useState({ term: '', definition: '', example: '' });
    const [isSubmittingWord, setIsSubmittingWord] = useState(false);
    const [editingWordId, setEditingWordId] = useState<number | null>(null);
    const [editWordForm, setEditWordForm] = useState({ term: '', definition: '', example: '' });
    const [isDeletingWordId, setIsDeletingWordId] = useState<number | null>(null);

    const [draft, setDraft] = useState({ title: '', description: '', notes: '' });
    const draftRef = useRef({ title: '', description: '', notes: '' });
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        loadLessons();
    }, []);

    async function loadLessons() {
        setIsLoading(true);
        const { success, data, error } = await apiClient.get<Lesson[]>('/lessons');

        if (!success || !data) {
            toast.error(error || 'Failed to load lessons. Please login.');
            setIsLoading(false);
            return;
        }

        setLessons(data);
        if (data.length > 0 && !selectedLesson) {
            selectLesson(data[0]);
        }
        setIsLoading(false);
    }

    async function createLesson() {
        const { success, data, error } = await apiClient.post<Lesson>('/lessons', { title: 'New Lesson' });

        if (!success || !data) {
            return toast.error(error || 'Failed to create lesson');
        }

        setLessons([data, ...lessons]);
        selectLesson(data);
        toast.success('Created new lesson');
    }

    function selectLesson(lesson: Lesson) {
        setSelectedLesson(lesson);
        const initialDraft = {
            title: lesson.title,
            description: lesson.description || '',
            notes: lesson.notes || ''
        };
        setDraft(initialDraft);
        draftRef.current = initialDraft;
    }

    async function updateLessonDetails(id: number, updateData: Partial<Lesson>) {
        const { success } = await apiClient.patch<Lesson>(`/lessons/${id}`, updateData);
        if (!success) {
            return toast.error('Failed to auto-save lesson');
        }
        setLessons(prev => prev.map(l => (l.id === id ? { ...l, ...updateData } : l)));
    }

    function handleFieldChange(field: 'title' | 'description' | 'notes', value: string) {
        if (!selectedLesson) return;
        draftRef.current = { ...draftRef.current, [field]: value };
        setDraft(draftRef.current);

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        saveTimeoutRef.current = setTimeout(() => {
            updateLessonDetails(selectedLesson.id, draftRef.current);
        }, 3500);
    }

    async function deleteLesson(id: number) {
        setIsDeleting(true);
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        const deleteRes = await apiClient.delete(`/lessons/${id}`);
        if (!deleteRes.success) {
            setIsDeleting(false);
            return toast.error(deleteRes.error || 'Failed to delete lesson');
        }

        toast.success('Lesson deleted successfully');
        setIsDeleteDialogOpen(false);
        setIsDeleting(false);

        const { success, data: updatedLessons } = await apiClient.get<Lesson[]>('/lessons');
        if (success && updatedLessons) {
            setLessons(updatedLessons);

            if (selectedLesson?.id === id) {
                if (updatedLessons.length > 0) {
                    selectLesson(updatedLessons[0]);
                } else {
                    setSelectedLesson(null);
                    const empty = { title: '', description: '', notes: '' };
                    setDraft(empty);
                    draftRef.current = empty;
                }
            }
        }
    }

    async function handleAddWord() {
        if (!selectedLesson || !newWord.term || !newWord.definition) return;
        setIsSubmittingWord(true);
        const res = await apiClient.post<Word>(`/lessons/${selectedLesson.id}/words`, newWord);
        setIsSubmittingWord(false);
        if (!res.success || !res.data) {
            return toast.error(res.error || 'Failed to add word');
        }

        toast.success('Word added correctly');
        setNewWord({ term: '', definition: '', example: '' });
        setIsAddingWord(false);

        const updatedLesson = {
            ...selectedLesson,
            words: [res.data, ...(selectedLesson.words || [])]
        };
        setSelectedLesson(updatedLesson);
        setLessons(prev => prev.map(l => l.id === selectedLesson.id ? updatedLesson : l));
    }

    function startEditWord(word: Word) {
        setEditingWordId(word.id);
        setEditWordForm({ term: word.term, definition: word.definition, example: word.example || '' });
    }

    async function handleUpdateWord(wordId: number) {
        if (!selectedLesson) return;
        const res = await apiClient.patch<Word>(`/lessons/${selectedLesson.id}/words/${wordId}`, editWordForm);
        if (!res.success || !res.data) {
            return toast.error(res.error || 'Failed to update word');
        }

        toast.success('Word updated');
        setEditingWordId(null);

        const updatedLesson = {
            ...selectedLesson,
            words: selectedLesson.words?.map(w => w.id === wordId ? res.data! : w) || []
        };
        setSelectedLesson(updatedLesson);
        setLessons(prev => prev.map(l => l.id === selectedLesson.id ? updatedLesson : l));
    }

    async function handleDeleteWord(wordId: number) {
        if (!selectedLesson) return;
        setIsDeletingWordId(wordId);
        const res = await apiClient.delete(`/lessons/${selectedLesson.id}/words/${wordId}`);
        setIsDeletingWordId(null);
        if (!res.success) {
            return toast.error(res.error || 'Failed to delete word');
        }

        toast.success('Word deleted');
        const updatedLesson = {
            ...selectedLesson,
            words: selectedLesson.words?.filter(w => w.id !== wordId) || []
        };
        setSelectedLesson(updatedLesson);
        setLessons(prev => prev.map(l => l.id === selectedLesson.id ? updatedLesson : l));
    }

    async function handleMagicAi() {
        if (!selectedLesson) return;
        setIsGeneratingAi(true);
        toast.info('Generating vocabulary with AI...');

        const { success: aiSuccess, data: aiData, error: aiError } = await apiClient.post<{ message: string }>(`/lessons/${selectedLesson.id}/generate-vocabulary`);

        if (!aiSuccess) {
            setIsGeneratingAi(false);
            return toast.error(aiError || 'AI generation failed');
        }

        toast.success(aiData?.message || 'Generated!');

        // Reload the selected lesson to get the words
        const { success: fetchSuccess, data: updatedLesson } = await apiClient.get<Lesson>(`/lessons/${selectedLesson.id}`);

        if (fetchSuccess && updatedLesson) {
            setLessons(prev => prev.map(l => (l.id === updatedLesson.id ? updatedLesson : l)));
            setSelectedLesson(updatedLesson);
        }

        setIsGeneratingAi(false);
    }

    if (isLoading) return <div className="h-screen flex items-center justify-center"><div className="animate-pulse"><Logo /></div></div>;

    return (
        <div className="h-screen flex bg-slate-50 overflow-hidden">
            {/* Column 1: Sidebar (Lessons) */}
            <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
                <Logo />
                <div className="p-4 flex-1 overflow-y-auto space-y-2">
                    <Button onClick={createLesson} className="w-full justify-start gap-2 mb-4" variant="outline">
                        <PlusCircle className="w-4 h-4" /> New Lesson
                    </Button>
                    {lessons.map(lesson => (
                        <button
                            key={lesson.id}
                            onClick={() => selectLesson(lesson)}
                            className={`w-full text-left px-3 py-3 rounded-lg text-sm transition-colors ${selectedLesson?.id === lesson.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-slate-50 text-slate-700'
                                }`}
                        >
                            <div className="truncate">{lesson.title}</div>
                            {lesson.description && <div className="text-xs text-slate-400 truncate mt-1">{lesson.description}</div>}
                        </button>
                    ))}
                </div>
                <div className="p-4 border-t border-slate-100 space-y-2">
                    <Link href="/practice">
                        <Button variant="outline" className="w-full justify-start gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 border-indigo-100 mb-2">
                            <BrainCircuit className="w-4 h-4" /> Global Practice
                        </Button>
                    </Link>
                    <Link href="/profile">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <Settings className="w-4 h-4" /> Profile
                        </Button>
                    </Link>
                    <AlertDialog>
                        {/* @ts-ignore - Radix asChild strict type conflict */}
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                                <LogOut className="w-4 h-4" /> Logout
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    You are about to securely log out of your EnglishPro account.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => {
                                    Cookies.remove('token');
                                    useUserStore.getState().clearUser();
                                    window.location.href = '/login';
                                }}>
                                    Continue
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            {/* Column 2: Main Editor */}
            <div className="flex-1 flex flex-col bg-slate-50 relative">
                        {selectedLesson ? (
                            <div className="flex-1 p-8 overflow-y-auto max-w-4xl mx-auto w-full">
                                <div className="flex items-center gap-4 mb-4">
                                    <input
                                        type="text"
                                        value={draft.title}
                                        onChange={(e) => handleFieldChange('title', e.target.value)}
                                        className="flex-1 text-4xl font-black bg-transparent border-none outline-none focus:ring-0 text-slate-900 placeholder-slate-300"
                                        placeholder="Lesson Title"
                                    />
                                    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                        {/* @ts-ignore - Radix asChild strict type conflict */}
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                                <Trash2 className="w-5 h-5" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Lesson?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will permanently delete "{draft.title}". This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                                                <Button
                                                    variant="destructive"
                                                    disabled={isDeleting}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        deleteLesson(selectedLesson.id);
                                                    }}
                                                >
                                                    {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                                    Delete
                                                </Button>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>

                                <input
                                    type="text"
                                    value={draft.description}
                                    onChange={(e) => handleFieldChange('description', e.target.value)}
                                    className="w-full text-lg bg-transparent border-none outline-none focus:ring-0 text-slate-500 mb-8 placeholder-slate-400"
                                    placeholder="Add a short description or context for AI..."
                                />

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-sm font-semibold text-slate-700">
                                        <span>Notes & Auto-save Editor</span>
                                        <span className="text-xs text-slate-400">Autosaves after 3.5s of typing</span>
                                    </div>
                                    <Textarea
                                        value={draft.notes}
                                        onChange={(e) => handleFieldChange('notes', e.target.value)}
                                        placeholder="Start typing your lesson notes here..."
                                        className="min-h-[500px] resize-none border-slate-200 focus-visible:ring-indigo-600 text-base p-6 bg-white shadow-sm"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-slate-400">
                                Select or create a lesson to begin
                            </div>
                        )}
                    </div>

                    {/* Column 3: Vocab List & AI Button */}
                    <div className="w-80 bg-slate-50/50 border-l border-slate-200 flex flex-col">
                        {/* Fixed Header Content for Vocab */}
                        <div className="p-4 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between z-10 sticky top-0">
                            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide">Vocabulary</h3>
                            <div className="flex gap-2">

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsAddingWord(true)}
                                    disabled={!selectedLesson || isAddingWord}
                                    className="text-xs h-7 px-2 border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold bg-white shadow-sm"
                                >
                                    <PlusCircle className="w-3 h-3 mr-1" />
                                    Add
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {isAddingWord && (
                                <div className="bg-amber-50/50 p-4 rounded-xl shadow-sm border border-amber-200 flex flex-col group relative mb-2 transition-all">
                                    <div className="space-y-3">
                                        <Input
                                            value={newWord.term}
                                            onChange={e => setNewWord(prev => ({ ...prev, term: e.target.value }))}
                                            placeholder="Term (e.g. Obfuscate)"
                                            className="font-bold text-indigo-900 h-8 bg-white border-amber-200 focus-visible:ring-amber-500"
                                            autoFocus
                                        />
                                        <Textarea
                                            value={newWord.definition}
                                            onChange={e => setNewWord(prev => ({ ...prev, definition: e.target.value }))}
                                            placeholder="Meaning / Definition"
                                            className="min-h-[60px] resize-none text-sm p-2 bg-white border-amber-200 focus-visible:ring-amber-500"
                                        />
                                        <Input
                                            value={newWord.example}
                                            onChange={e => setNewWord(prev => ({ ...prev, example: e.target.value }))}
                                            placeholder="Example Sentence (Optional)"
                                            className="text-sm h-8 bg-white border-amber-200 focus-visible:ring-amber-500"
                                        />
                                        <div className="flex justify-end gap-2 pt-1">
                                            <Button size="sm" variant="ghost" className="h-7 text-xs text-amber-700 hover:text-amber-900 hover:bg-amber-100/50" onClick={() => { setIsAddingWord(false); setNewWord({ term: '', definition: '', example: '' }) }}>
                                                Cancel
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                                                onClick={handleAddWord}
                                                disabled={isSubmittingWord || !newWord.term || !newWord.definition}
                                            >
                                                {isSubmittingWord ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Check className="w-3 h-3 mr-1" />} Save
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!selectedLesson?.words || selectedLesson.words.length === 0 ? (
                                <div className="text-center text-sm text-slate-400 mt-10 flex flex-col items-center">
                                    <SearchX className="w-8 h-8 text-slate-300 mb-2" />
                                    No words yet. Click "Add" above to create one.
                                </div>
                            ) : (
                                selectedLesson.words.map(word => (
                                    <div key={word.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col group relative transition-all hover:shadow-md hover:border-indigo-100">
                                        {editingWordId === word.id ? (
                                            <div className="space-y-3">
                                                <Input
                                                    value={editWordForm.term}
                                                    onChange={e => setEditWordForm(prev => ({ ...prev, term: e.target.value }))}
                                                    className="font-bold text-indigo-900 h-8"
                                                />
                                                <Textarea
                                                    value={editWordForm.definition}
                                                    onChange={e => setEditWordForm(prev => ({ ...prev, definition: e.target.value }))}
                                                    className="min-h-[60px] resize-none text-sm p-2"
                                                />
                                                <Input
                                                    value={editWordForm.example}
                                                    onChange={e => setEditWordForm(prev => ({ ...prev, example: e.target.value }))}
                                                    placeholder="Example"
                                                    className="text-sm h-8"
                                                />
                                                <div className="flex justify-end gap-2 pt-1">
                                                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingWordId(null)}>
                                                        Cancel
                                                    </Button>
                                                    <Button size="sm" className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700" onClick={() => handleUpdateWord(word.id)}>
                                                        <Check className="w-3 h-3 mr-1" /> Save
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="w-7 h-7 p-0 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                                        onClick={() => startEditWord(word)}
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="w-7 h-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                                        onClick={() => handleDeleteWord(word.id)}
                                                        disabled={isDeletingWordId === word.id}
                                                    >
                                                        {isDeletingWordId === word.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                                    </Button>
                                                </div>
                                                <div className="flex items-baseline justify-between mb-1 pr-14">
                                                    <span className="font-bold text-indigo-900 text-lg leading-tight">{word.term}</span>
                                                </div>
                                                <p className="text-sm text-slate-600 mb-2 leading-snug">{word.definition}</p>
                                                {word.example && (
                                                    <div className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-snug">
                                                        "{word.example}"
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ))
                            )}

                            {selectedLesson && (
                                <PracticeEntryPoint 
                                    lessonId={selectedLesson.id} 
                                    wordsCount={selectedLesson.words?.length || 0} 
                                />
                            )}
                        </div>
                    </div>
        </div>
    );
}
