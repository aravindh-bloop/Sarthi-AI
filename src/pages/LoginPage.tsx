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
    Globe,
    ChevronDown,
    Brain,
    ScanLine,
    History,
    Radio,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTranslation } from "react-i18next"; // Added to support existing i18n if needed, but the user code uses hardcoded text or local state.
// The user's code uses <LanguageToggle> with local state. I should probably integrate strict i18n triggers if I can, but user provided specific code. 
// I will stick to their code for the UI, but maybe update the setLang to actually change language.

function LanguageToggle() {
    const [lang, setLang] = React.useState("English")
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        setLang(lng === 'en' ? 'English' : 'தமிழ்');
        i18n.changeLanguage(lng);
    }

    // Sync initial state
    React.useEffect(() => {
        setLang(i18n.language === 'ta' ? 'தமிழ்' : 'English');
    }, [i18n.language]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full gap-2 border-slate-200 bg-transparent">
                    <Globe className="h-4 w-4" />
                    {lang}
                    <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuItem onClick={() => changeLanguage("en")}>English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage("ta")}>தமிழ்</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}


function LoginForm() {
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
                setError("Invalid email or password.");
            } else if (err.code === 'auth/email-already-in-use') {
                setError("Email is already registered.");
            } else if (err.code === 'auth/weak-password') {
                setError("Password should be at least 6 characters.");
            } else if (err.code === 'auth/operation-not-allowed') {
                setError("Email/Password login is not enabled in Firebase Console.");
            } else {
                setError(`Failed: ${err.message || "Unknown error"}`);
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
                    {step === "email" ? (isSignUp ? "Create Account" : "Welcome Back") : "Secure Access"}
                </CardTitle>
                <CardDescription className="text-muted-foreground font-medium pt-2">
                    {step === "email"
                        ? "Enter your credentials to access Sarthi AI"
                        : `Verifying identity for ${email}`}
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
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@farm.com"
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
                                        {isSignUp ? "Already have an account? Sign In" : "New to Sarthi? Create an Account"}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-16 bg-foreground hover:bg-primary text-white rounded-2xl font-bold uppercase tracking-[0.15em] text-xs transition-all shadow-2xl shadow-foreground/10 group top-btn"
                                disabled={isLoading}
                            >
                                Continue
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
                                    Password
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
                                    {isLoading ? <span className="animate-pulse">Verifying...</span> : (isSignUp ? "Sign Up" : "Secure Login")}
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
                                    Change Email
                                </Button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>

                <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-center gap-2 text-slate-300">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">SSL Secured Access</span>
                </div>
            </CardContent>
        </Card>
    )
}

export default function LoginPage() {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

    return (
        <div className="min-h-screen bg-white selection:bg-primary/20 font-sans">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-[60] bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <Sprout className="text-white w-6 h-6" />
                        </div>
                        <span className="text-xl font-black tracking-tight text-slate-900">Sarthi AI</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 ml-auto">
                        <a
                            href="#features"
                            className="text-sm font-bold text-slate-500 hover:text-primary transition-colors uppercase tracking-widest"
                        >
                            Features
                        </a>
                        <a
                            href="#about"
                            className="text-sm font-bold text-slate-500 hover:text-primary transition-colors uppercase tracking-widest"
                        >
                            About Us
                        </a>
                        <a
                            href="#help"
                            className="text-sm font-bold text-slate-500 hover:text-primary transition-colors uppercase tracking-widest"
                        >
                            Help Desk
                        </a>
                        <LanguageToggle />
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
                                The Future of Agricultural Intelligence
                            </div>

                            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight drop-shadow-xl">
                                The Intelligence Layer for <span className="text-emerald-300 font-serif italic">Modern Farming</span>
                            </h1>

                            <div className="space-y-6">
                                <p className="text-2xl md:text-3xl font-light text-white/95 leading-tight drop-shadow-lg">
                                    Seasonal Clarity. Health Intelligence.<br />
                                    <span className="font-semibold text-emerald-200">Resource Precision.</span>
                                </p>

                                <p className="text-lg text-white/80 leading-relaxed max-w-xl font-medium drop-shadow-md">
                                    Sarthi AI unifies crop planning, plant health analysis, and farm resource optimization into a single season-aware intelligence system — built for Indian farming realities.
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
                                <span>Core Capabilities</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
                                Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-700">Sarthi AI?</span>
                            </h2>
                            <p className="text-slate-600 font-medium text-lg leading-relaxed">
                                Because farming today needs intelligence, not guesswork.
                                <br className="hidden md:block" />
                                Sarthi AI brings planning, monitoring, risk awareness, and financial clarity into one unified, season-aware platform.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                            {[
                                {
                                    icon: Sprout,
                                    title: "Crop & Plant Health Intelligence",
                                    desc: "Plant images, historical health records, and seasonal context are jointly analyzed. Early stress and disease risks are identified, escalated, and tracked longitudinally.",
                                    coverage: "Plant Health Analyzer + Longitudinal Monitoring"
                                },
                                {
                                    icon: Calendar,
                                    title: "Seasonal Planning & Risk Orchestration",
                                    desc: "Crop calendars, weather signals, and field constraints are synthesized. Task schedules are dynamically adjusted as risks emerge.",
                                    coverage: "Planner + Weather / Pest / Climate Risk Alerts"
                                },
                                {
                                    icon: Coins,
                                    title: "Resource & Input Optimization",
                                    desc: "Water usage, input stocks, and budgets are continuously monitored. Wastage is minimized and shortages are anticipated before impact occurs.",
                                    coverage: "Smart Water Optimization + Inventory / Stock Management"
                                },
                                {
                                    icon: ClipboardList,
                                    title: "Policy & Opportunity Awareness",
                                    desc: "Government schemes, subsidies, and advisories are filtered and contextualized. Only relevant benefits are surfaced at the right stage of the season.",
                                    coverage: "Agri-News + Subsidy Awareness"
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
                                    <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">Where We Stand Out</span>
                                </div>
                                <h2 className="text-5xl md:text-6xl font-light text-white tracking-[0.2em] uppercase drop-shadow-2xl">
                                    SĀRTHI AGENTIC AI
                                </h2>
                                <p className="text-slate-300 font-serif italic text-xl md:text-2xl leading-relaxed max-w-3xl opacity-90">
                                    "From soil to harvest, every signal is observed and every action is guided by an autonomous farm intelligence."
                                </p>
                            </div>

                            {/* Features Grid */}
                            <div className="grid lg:grid-cols-3 gap-8">
                                {[
                                    {
                                        icon: ScanLine,
                                        title: "Intelligent Plant Health Analyzer",
                                        desc: "SĀRTHI AI doesn’t just detect disease from leaf images. It connects symptoms with season, weather, and crop stage before suggesting action.",
                                        why: "No generic treatments. Only timely, localized care.",
                                        color: "text-emerald-400",
                                        bg: "bg-emerald-400/10"
                                    },
                                    {
                                        icon: History,
                                        title: "Longitudinal Farm Intelligence",
                                        desc: "Your farm is treated as a living system across seasons, not a one-time input. SĀRTHI AI learns from past crops, yields, and issues to optimize future decisions.",
                                        why: "Every season gets smarter than the last.",
                                        color: "text-indigo-400",
                                        bg: "bg-indigo-400/10"
                                    },
                                    {
                                        icon: Radio,
                                        title: "Proactive News & Risk Awareness",
                                        desc: "Agricultural news, pest alerts, and policy updates are filtered for your crops and region. No noise. Only what impacts your farm.",
                                        why: "You react early, not after losses happen.",
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
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Why it’s better</span>
                                            <p className={`text-sm font-medium ${feature.color}`}>
                                                {feature.why}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-slate-100">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2 opacity-50">
                        <Sprout className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-widest">Sarthi AI &copy; 2026</span>
                    </div>
                    <div className="flex gap-8">
                        <a
                            href="#"
                            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
                        >
                            Privacy Policy
                        </a>
                        <a
                            href="#"
                            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
                        >
                            Terms of Service
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
