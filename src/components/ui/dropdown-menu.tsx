import * as React from "react"
import { cn } from "@/lib/utils"

const DropdownMenuContext = React.createContext<{ open: boolean; setOpen: React.Dispatch<React.SetStateAction<boolean>> } | undefined>(undefined)

const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
    const [open, setOpen] = React.useState(false)
    const ref = React.useRef<HTMLDivElement>(null)

    // Click outside to close
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [ref])

    return (
        <DropdownMenuContext.Provider value={{ open, setOpen }}>
            <div className="relative inline-block text-left" ref={ref}>
                {children}
            </div>
        </DropdownMenuContext.Provider>
    )
}

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }>(
    ({ className, children, asChild, ...props }, ref) => {
        const context = React.useContext(DropdownMenuContext)
        if (!context) throw new Error("DropdownMenuTrigger must be used within DropdownMenu")

        if (asChild && React.isValidElement(children)) {
            return React.cloneElement(children as React.ReactElement, {
                onClick: (e: React.MouseEvent) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (children.props as any).onClick?.(e)
                    context.setOpen(!context.open)
                },
                ...props
            })
        }

        return (
            <button
                ref={ref}
                onClick={() => context.setOpen(!context.open)}
                className={className}
                {...props}
            >
                {children}
            </button>
        )
    }
)
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

const DropdownMenuContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "end" | "center" }>(
    ({ className, align = "center", ...props }, ref) => {
        const context = React.useContext(DropdownMenuContext)
        if (!context) throw new Error("DropdownMenuContent must be used within DropdownMenu")

        if (!context.open) return null

        const alignClass = align === "end" ? "right-0" : align === "start" ? "left-0" : "left-1/2 -translate-x-1/2"

        return (
            <div
                ref={ref}
                className={cn(
                    "absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80 zoom-in-95 data-[side=bottom]:slide-in-from-top-2",
                    alignClass,
                    className
                )}
                {...props}
            />
        )
    }
)
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
        const context = React.useContext(DropdownMenuContext)
        return (
            <div
                ref={ref}
                onClick={(e) => {
                    props.onClick?.(e)
                    context?.setOpen(false)
                }}
                className={cn(
                    "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer",
                    className
                )}
                {...props}
            />
        )
    }
)
DropdownMenuItem.displayName = "DropdownMenuItem"

const DropdownMenuLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }>(
    ({ className, inset, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)}
            {...props}
        />
    )
)
DropdownMenuLabel.displayName = "DropdownMenuLabel"

const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("-mx-1 my-1 h-px bg-muted", className)}
            {...props}
        />
    )
)
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator }
