import * as React from "react"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { motion, AnimatePresence } from "framer-motion"
import {
    Sprout,
    Calendar,
    Coins,
    ClipboardList,
    Menu,
    X,
    Lock,
    ArrowRight,
    Mail,
    ShieldCheck,
    Brain,
    ScanLine,
    History,
    Radio,
    Phone,
    MapPin,
    Twitter,
    Linkedin,
    Instagram,
    Youtube
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import { useTranslation } from "react-i18next"; // Added to support existing i18n if needed, but the user code uses hardcoded text or local state.



function LoginForm() {
    const { t } = useTranslation();
    const [step, setStep] = React.useState<"email" | "password">("email")
    const [email, setEmail] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [isSignUp, setIsSignUp] = React.useState(false)

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return
        setError(null)
        setStep("password")
    }

    const handleAuthSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!password) return
        setIsLoading(true)
        setError(null)

        try {
            if (isSignUp) {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            // Successful Auth
            window.location.href = '/dashboard';
        } catch (err: any) {
            console.error(err);
            setIsLoading(false)
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError(t('authPage.errors.invalid'));
            } else if (err.code === 'auth/email-already-in-use') {
                setError(t('authPage.errors.emailInUse'));
            } else if (err.code === 'auth/weak-password') {
                setError(t('authPage.errors.weakPassword'));
            } else if (err.code === 'auth/operation-not-allowed') {
                setError(t('authPage.errors.opNotAllowed'));
            } else {
                setError(t('authPage.errors.failed', { message: err.message || "Unknown error" }));
            }
        }
    }

    return (
        <Card className="w-full max-w-[460px] border-border/40 shadow-[0_32px_64px_-16px_rgba(45,70,45,0.1)] rounded-[40px] overflow-hidden bg-white/70 backdrop-blur-2xl border-white/20">
            <CardHeader className="pt-12 pb-8 text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-[24px] flex items-center justify-center mb-6 border border-primary/20 rotate-3">
                    <Lock className="w-8 h-8 text-primary -rotate-3" />
                </div>
                <CardTitle className="text-3xl font-medium text-foreground tracking-tight">
                    {step === "email" ? (isSignUp ? t('authPage.createAccount') : t('authPage.welcomeBack')) : t('authPage.secureAccess')}
                </CardTitle>
                <CardDescription className="text-muted-foreground font-medium pt-2">
                    {step === "email"
                        ? t('authPage.enterCredentials')
                        : t('authPage.verifyingIdentity', { email })}
                </CardDescription>
            </CardHeader>

            <CardContent className="px-10 pb-12">
                <AnimatePresence mode="wait">
                    {step === "email" ? (
                        <motion.form
                            key="email-form"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            onSubmit={handleEmailSubmit}
                            className="space-y-8"
                        >
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1">
                                    {t('authPage.emailAddress')}
                                </label>
                                <div className="relative group">
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={t('authPage.emailPlaceholder')}
                                        className="h-16 bg-muted/30 border-transparent focus:bg-white focus:border-primary/40 rounded-2xl px-6 transition-all text-base font-medium placeholder:text-muted-foreground/40 shadow-inner"
                                        disabled={isLoading}
                                        required
                                        autoFocus
                                    />
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground/30">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="px-1">
                                    <button
                                        type="button"
                                        onClick={() => setIsSignUp(!isSignUp)}
                                        className="text-xs font-medium text-primary hover:underline"
                                    >
                                        {isSignUp ? t('authPage.alreadyHaveAccount') : t('authPage.newToSarthi')}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-16 bg-foreground hover:bg-primary text-white rounded-2xl font-bold uppercase tracking-[0.15em] text-xs transition-all shadow-2xl shadow-foreground/10 group top-btn"
                                disabled={isLoading}
                            >
                                {t('authPage.continue')}
                                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </motion.form>
                    ) : (
                        <motion.form
                            key="password-form"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            onSubmit={handleAuthSubmit}
                            className="space-y-6"
                        >
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">
                                    {t('authPage.password')}
                                </label>
                                <div className="relative">
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="h-14 bg-slate-50 border-transparent focus:bg-white focus:border-primary/30 rounded-2xl px-5 text-xl font-bold transition-all"
                                        disabled={isLoading}
                                        required
                                        autoFocus
                                    />
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground/30">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                </div>
                                {error && (
                                    <p className="text-red-500 text-xs font-semibold px-1 animate-pulse">{error}</p>
                                )}
                            </div>

                            <div className="space-y-4">
                                <Button
                                    type="submit"
                                    className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl shadow-primary/20"
                                    disabled={isLoading}
                                >
                                    {isLoading ? <span className="animate-pulse">{t('authPage.verifying')}</span> : (isSignUp ? t('authPage.signUp') : t('authPage.secureLogin'))}
                                </Button>
                                <Button
                                    variant="ghost"
                                    type="button"
                                    onClick={() => {
                                        setStep("email");
                                        setError(null);
                                    }}
                                    className="w-full text-slate-400 hover:text-slate-900 font-bold uppercase tracking-widest text-[10px]"
                                >
                                    {t('authPage.changeEmail')}
                                </Button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>

                <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-center gap-2 text-slate-300">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t('authPage.sslSecured')}</span>
                </div>
            </CardContent>
        </Card>
    )
}

export default function LoginPage() {
    const { t } = useTranslation();
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

    return (
        <div className="min-h-screen bg-white selection:bg-primary/20 font-sans">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-[60] bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="w-full px-6 md:px-12 h-20 flex items-center">
                    <div className="flex items-center gap-2">
                        <img src="/sarthi_logo.png" alt={t('app.title')} className="w-10 h-10 object-contain" />
                        <span className="text-xl font-black tracking-tight text-slate-900">{t('app.title')}</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 ml-auto">
                        <a
                            href="#features"
                            className="text-sm font-bold text-slate-500 hover:text-primary transition-colors uppercase tracking-widest"
                        >
                            {t('navigation.features')}
                        </a>

                        <a
                            href="#help"
                            className="text-sm font-bold text-slate-500 hover:text-primary transition-colors uppercase tracking-widest"
                        >
                            {t('navigation.help') || "Help Desk"}
                        </a>


                    </div>

                    <button className="md:hidden p-2 ml-auto" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </nav>

            <main className="pt-20">
                {/* Hero Section */}
                <section className="relative min-h-[90vh] flex items-center px-6 overflow-hidden">
                    <div
                        className="absolute inset-0 opacity-100 pointer-events-none mix-blend-multiply bg-center bg-cover"
                        style={{ backgroundImage: 'url("/aerial-view-of-lush-green-farmland-texture.jpg")' }}
                    />

                    <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center relative z-10">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                            <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-sm font-black uppercase tracking-widest border border-white/20 shadow-lg">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                {t('authPage.hero.tag')}
                            </div>

                            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight drop-shadow-xl">
                                {t('authPage.hero.titlePart1')} <span className="text-emerald-300 font-serif italic">{t('authPage.hero.titlePart2')}</span>
                            </h1>

                            <div className="space-y-6">
                                <p className="text-2xl md:text-3xl font-light text-white/95 leading-tight drop-shadow-lg">
                                    {t('authPage.hero.sub1')}<br />
                                    <span className="font-semibold text-emerald-200">{t('authPage.hero.sub2')}</span>
                                </p>

                                <p className="text-lg text-white/80 leading-relaxed max-w-xl font-medium drop-shadow-md">
                                    {t('authPage.hero.desc')}
                                </p>
                            </div>

                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex justify-center lg:justify-end"
                        >
                            <LoginForm />
                        </motion.div>
                    </div>
                </section>

                {/* Features Preview */}
                {/* Features Preview */}
                <section id="features" className="py-32 relative md:mx-6 mb-24 rounded-[56px] overflow-hidden">
                    {/* Background Decor */}
                    <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-xl z-0" />
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-50" />
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl opacity-60" />
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl opacity-60" />

                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100/50 border border-emerald-200 rounded-full text-emerald-800 text-[10px] font-black uppercase tracking-widest">
                                <Sprout className="w-3 h-3" />
                                <span>{t('authPage.features.tag')}</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
                                {t('authPage.features.title')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-700">Sarthi AI?</span>
                            </h2>
                            <p className="text-slate-600 font-medium text-lg leading-relaxed">
                                {t('authPage.features.desc')}
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                            {[
                                {
                                    icon: Sprout,
                                    title: t('authPage.features.items.health.title'),
                                    desc: t('authPage.features.items.health.desc'),
                                    coverage: t('authPage.features.items.health.coverage')
                                },
                                {
                                    icon: Calendar,
                                    title: t('authPage.features.items.planning.title'),
                                    desc: t('authPage.features.items.planning.desc'),
                                    coverage: t('authPage.features.items.planning.coverage')
                                },
                                {
                                    icon: Coins,
                                    title: t('authPage.features.items.resource.title'),
                                    desc: t('authPage.features.items.resource.desc'),
                                    coverage: t('authPage.features.items.resource.coverage')
                                },
                                {
                                    icon: ClipboardList,
                                    title: t('authPage.features.items.policy.title'),
                                    desc: t('authPage.features.items.policy.desc'),
                                    coverage: t('authPage.features.items.policy.coverage')
                                },
                            ].map((feature, i) => (
                                <div
                                    key={i}
                                    className="group relative bg-white p-8 md:p-10 rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(16,185,129,0.1)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/50 to-transparent rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110" />

                                    <div className="relative z-10">
                                        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-emerald-500 group-hover:rotate-6 transition-all duration-300 shadow-sm group-hover:shadow-emerald-500/30">
                                            <feature.icon className="w-7 h-7 text-emerald-600 group-hover:text-white transition-colors duration-300" />
                                        </div>

                                        <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight">{feature.title}</h3>

                                        <p className="text-slate-500 leading-relaxed mb-8">
                                            {feature.desc}
                                        </p>

                                        <div className="pt-6 border-t border-slate-100 flex items-start gap-3">
                                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Covers</span>
                                                <span className="text-sm font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded-lg decoration-clone box-decoration-clone">
                                                    {feature.coverage}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* AI Spotlight: SĀRTHI AI */}
                <section className="pb-32 px-6">
                    <div className="max-w-7xl mx-auto bg-slate-900 rounded-[48px] p-8 md:p-16 overflow-hidden relative group">
                        {/* Dynamic Background */}
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.15),transparent_70%)]" />
                        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_100%,rgba(99,102,241,0.1),transparent_70%)]" />

                        {/* Grid Pattern */}
                        <div className="absolute inset-0 opacity-[0.03]"
                            style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                        />

                        <div className="relative z-10">
                            {/* Header */}
                            <div className="text-left mb-16 space-y-4">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 mb-4 animate-pulse">
                                    <Brain className="w-5 h-5 text-emerald-400" />
                                    <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">{t('authPage.spotlight.tag')}</span>
                                </div>
                                <h2 className="text-5xl md:text-6xl font-light text-white tracking-[0.2em] uppercase drop-shadow-2xl">
                                    {t('authPage.spotlight.title')}
                                </h2>
                                <p className="text-slate-300 font-serif italic text-xl md:text-2xl leading-relaxed max-w-3xl opacity-90">
                                    {t('authPage.spotlight.quote')}
                                </p>
                            </div>

                            {/* Features Grid */}
                            <div className="grid lg:grid-cols-3 gap-8">
                                {[
                                    {
                                        icon: ScanLine,
                                        title: t('authPage.spotlightItems.item1.title'),
                                        desc: t('authPage.spotlightItems.item1.desc'),
                                        why: t('authPage.spotlightItems.item1.why'),
                                        color: "text-emerald-400",
                                        bg: "bg-emerald-400/10"
                                    },
                                    {
                                        icon: History,
                                        title: t('authPage.spotlightItems.item2.title'),
                                        desc: t('authPage.spotlightItems.item2.desc'),
                                        why: t('authPage.spotlightItems.item2.why'),
                                        color: "text-indigo-400",
                                        bg: "bg-indigo-400/10"
                                    },
                                    {
                                        icon: Radio,
                                        title: t('authPage.spotlightItems.item3.title'),
                                        desc: t('authPage.spotlightItems.item3.desc'),
                                        why: t('authPage.spotlightItems.item3.why'),
                                        color: "text-amber-400",
                                        bg: "bg-amber-400/10"
                                    }
                                ].map((feature, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-[32px] hover:bg-white/10 transition-colors group/card"
                                    >
                                        <div className={`w-12 h-12 ${feature.bg} rounded-2xl flex items-center justify-center mb-6`}>
                                            <feature.icon className={`w-6 h-6 ${feature.color}`} />
                                        </div>

                                        <h3 className="text-xl font-bold text-white mb-4 leading-tight">{feature.title}</h3>
                                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                            {feature.desc}
                                        </p>

                                        <div className="pt-6 border-t border-white/5">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">{t('authPage.spotlightItems.whyLabel')}</span>
                                            <p className={`text-sm font-medium ${feature.color}`}>
                                                {feature.why}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-12 pt-8 border-t border-white/10 text-center">
                                <p className="text-white text-xs font-medium uppercase tracking-wider opacity-90">
                                    {t('authPage.spotlight.disclaimer')}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 pt-24 pb-12 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                        {/* Brand Column */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-white">
                                <Sprout className="w-8 h-8 text-emerald-400" />
                                <span className="text-2xl font-black tracking-tight">{t('app.title')}</span>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                {t('authPage.hero.desc')}
                            </p>
                            <div className="flex gap-4">
                                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-emerald-500 hover:text-white transition-all">
                                    <Twitter className="w-4 h-4" />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-emerald-500 hover:text-white transition-all">
                                    <Linkedin className="w-4 h-4" />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-emerald-500 hover:text-white transition-all">
                                    <Instagram className="w-4 h-4" />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-emerald-500 hover:text-white transition-all">
                                    <Youtube className="w-4 h-4" />
                                </a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-8">{t('landing.footer.quickLinks')}</h4>
                            <ul className="space-y-4">
                                <li>
                                    <a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">{t('landing.footer.about')}</a>
                                </li>
                                <li>
                                    <a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">{t('navigation.features')}</a>
                                </li>
                                <li>
                                    <a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">{t('navigation.howItWorks')}</a>
                                </li>
                                <li>
                                    <a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">{t('navigation.help')}</a>
                                </li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-8">{t('landing.footer.legal')}</h4>
                            <ul className="space-y-4">
                                <li>
                                    <a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">{t('landing.footer.privacy')}</a>
                                </li>
                                <li>
                                    <a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">{t('landing.footer.terms')}</a>
                                </li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-8">{t('landing.footer.contact')}</h4>
                            <ul className="space-y-6">
                                <li className="flex items-start gap-3 text-slate-400">
                                    <MapPin className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                    <span className="text-sm leading-relaxed">{t('landing.footer.address')}</span>
                                </li>
                                <li className="flex items-center gap-3 text-slate-400">
                                    <Phone className="w-5 h-5 text-emerald-500 shrink-0" />
                                    <span className="text-sm font-medium">{t('landing.footer.phone')}</span>
                                </li>
                                <li className="flex items-center gap-3 text-slate-400">
                                    <Mail className="w-5 h-5 text-emerald-500 shrink-0" />
                                    <span className="text-sm font-medium">{t('landing.footer.email')}</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2 text-slate-500">
                            <span className="text-xs font-bold uppercase tracking-widest">{t('landing.footer.copyright')}</span>
                        </div>
                        <div className="text-slate-600 text-[10px] uppercase tracking-widest font-bold">
                            {t('landing.footer.sources')}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
