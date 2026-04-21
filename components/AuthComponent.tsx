"use client"

import React, { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { LogOut, User, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

// Replace with your project credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function AuthComponent({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setLoading(false)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })

        return () => subscription.unsubscribe()
    }, [])

    if (loading) return null

    if (!session) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background p-4">
                <div className="w-full max-w-[400px] bg-card border rounded-xl shadow-lg p-8">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
                        <p className="text-sm text-muted-foreground mt-2">Sign in to manage your workflows</p>
                    </div>

                    <Auth
                        supabaseClient={supabase}
                        appearance={{
                            theme: ThemeSupa,
                            variables: {
                                default: {
                                    colors: {
                                        brand: 'hsl(var(--primary))',
                                        brandAccent: 'hsl(var(--primary))',
                                    },
                                    radii: {
                                        buttonRadius: '8px',
                                        inputRadius: '8px',
                                    }
                                }
                            }
                        }}
                        providers={['google']}
                        localization={{
                            variables: {
                                sign_in: { email_label: 'Email address', password_label: 'Password', button_label: 'Sign in' },
                                sign_up: { email_label: 'Email address', password_label: 'Create password', button_label: 'Sign up' }
                            }
                        }}
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen">
            {/* Minimal Global Header for User Account */}
            <div className="h-12 bg-muted/50 border-b flex items-center justify-end px-6 gap-4">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <User className="w-3 h-3" />
                    {session.user.email}
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs gap-2 hover:text-destructive"
                    onClick={() => supabase.auth.signOut()}
                >
                    <LogOut className="w-3 h-3" />
                    Logout
                </Button>
            </div>

            {/* The rest of your App (Canvas, etc.) */}
            <div className="flex-1 overflow-hidden">
                {children}
            </div>
        </div>
    )
}