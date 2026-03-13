'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { Logo } from '@/components/Logo';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { useUserStore } from '@/store/useUserStore';
import { LogOut } from 'lucide-react';
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

const profileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    avatar: z.string().url('Must be a valid URL').or(z.literal('')),
    learning_goal: z.coerce.number().min(0, 'Goal must be a positive number'),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
    otp: z.string().min(6, 'OTP must be 6 digits'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export default function ProfilePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const { user, setUser, clearUser } = useUserStore();

    const profileForm = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema) as any,
        defaultValues: { name: '', avatar: '', learning_goal: 0 },
    });

    const passwordForm = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema) as any,
        defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '', otp: '' },
    });

    useEffect(() => {
        async function loadProfile() {
            try {
                const data = await fetchApi('/users/profile');
                setUser(data);
                profileForm.reset({
                    name: data.name || '',
                    avatar: data.avatar || '',
                    learning_goal: data.learning_goal || 0
                });
            } catch (error) {
                toast.error('Session expired, please login');
                router.push('/login');
            } finally {
                setIsLoading(false);
            }
        }
        loadProfile();
    }, [router, setUser, profileForm]);

    async function onProfileSubmit(data: z.infer<typeof profileSchema>) {
        try {
            const formData = { ...data, avatar: data.avatar === '' ? null : data.avatar };
            const res = await fetchApi('/users/profile', {
                method: 'PATCH',
                body: JSON.stringify(formData),
            });
            setUser(res);
            toast.success('Profile updated successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update profile');
        }
    }

    async function onPasswordSubmit(data: z.infer<typeof passwordSchema>) {
        try {
            // In a real app, verify OTP here first. For mock, we skip strict backend verified logic.
            if (data.otp !== "123456") {
                passwordForm.setError("otp", { message: "Invalid Mock OTP (hint: use 123456)" });
                return;
            }

            await fetchApi('/users/password', {
                method: 'PATCH',
                body: JSON.stringify({
                    currentPassword: data.currentPassword,
                    newPassword: data.newPassword,
                }),
            });
            toast.success('Password changed successfully');
            passwordForm.reset();
        } catch (error: any) {
            toast.error(error.message || 'Failed to change password');
            passwordForm.setError("root.serverError", { message: error.message || 'Failed' });
        }
    }

    function handleLogout() {
        Cookies.remove('token');
        clearUser();
        router.push('/login');
    }

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12">
            <div className="mb-8 w-full max-w-2xl px-4 flex justify-between items-center">
                <Logo />
                <Button variant="ghost" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
            </div>

            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={user?.avatar || undefined} alt={user?.name || "User"} />
                            <AvatarFallback className="text-xl bg-indigo-100 text-indigo-700 font-bold">
                                {user?.name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-2xl">{user?.name || "User Profile"}</CardTitle>
                            <CardDescription className="text-md">{user?.email}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="general" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="general">General Details</TabsTrigger>
                            <TabsTrigger value="security">Security & Password</TabsTrigger>
                        </TabsList>

                        {/* GENERAL TAB */}
                        <TabsContent value="general">
                            <Form {...profileForm}>
                                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                                    <FormField
                                        control={profileForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Your Name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={profileForm.control}
                                        name="avatar"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Avatar URL</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="https://example.com/avatar.png" {...field} />
                                                </FormControl>
                                                <FormDescription>Leave blank for default fallback.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={profileForm.control}
                                        name="learning_goal"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Learning Goal (Minutes per day)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit">Save Changes</Button>
                                </form>
                            </Form>
                        </TabsContent>

                        {/* SECURITY TAB */}
                        <TabsContent value="security">
                            <Form {...passwordForm}>
                                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-5">
                                    <FormField
                                        control={passwordForm.control}
                                        name="currentPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Current Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="••••••••" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={passwordForm.control}
                                            name="newPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>New Password</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" placeholder="••••••••" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={passwordForm.control}
                                            name="confirmPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Confirm New Password</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" placeholder="••••••••" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={passwordForm.control}
                                        name="otp"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>One Time Password (Mock OTP)</FormLabel>
                                                <FormControl>
                                                    <InputOTP maxLength={6} {...field}>
                                                        <InputOTPGroup>
                                                            <InputOTPSlot index={0} />
                                                            <InputOTPSlot index={1} />
                                                            <InputOTPSlot index={2} />
                                                        </InputOTPGroup>
                                                        <InputOTPSeparator />
                                                        <InputOTPGroup>
                                                            <InputOTPSlot index={3} />
                                                            <InputOTPSlot index={4} />
                                                            <InputOTPSlot index={5} />
                                                        </InputOTPGroup>
                                                    </InputOTP>
                                                </FormControl>
                                                <FormDescription>For demo mode, enter "123456"</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {passwordForm.formState.errors.root?.serverError && (
                                        <p className="text-sm font-medium text-destructive">
                                            {passwordForm.formState.errors.root.serverError.message}
                                        </p>
                                    )}

                                    <Button type="submit" variant="default" className="w-full">Change Password</Button>
                                </form>
                            </Form>
                        </TabsContent>
                    </Tabs>

                    <div className="mt-8 pt-4 border-t border-slate-100">
                        <AlertDialog>
                            {/* @ts-ignore - Radix asChild strict type conflict */}
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="flex gap-2">
                                    <LogOut className="w-4 h-4" /> Log Out Entirely
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        You will need to sign back in with your credentials.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleLogout}>Log Out</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
