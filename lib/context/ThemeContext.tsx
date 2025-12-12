import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';
type FontSize = 'normal' | 'large' | 'xlarge';

interface ThemeContextType {
    theme: Theme;
    fontSize: FontSize;
    toggleTheme: () => void;
    setFontSize: (size: FontSize) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>('dark'); // Default to dark as per design
    const [fontSize, setFontSizeState] = useState<FontSize>('normal');

    useEffect(() => {
        // Load from local storage
        const savedTheme = localStorage.getItem('theme') as Theme;
        const savedFontSize = localStorage.getItem('fontSize') as FontSize;

        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.classList.toggle('dark', savedTheme === 'dark');
        } else {
            // Default to dark
            document.documentElement.classList.add('dark');
        }

        if (savedFontSize) setFontSizeState(savedFontSize);
        applyFontSize(savedFontSize || 'normal');
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    const setFontSize = (size: FontSize) => {
        setFontSizeState(size);
        localStorage.setItem('fontSize', size);
        applyFontSize(size);
    };

    const applyFontSize = (size: FontSize) => {
        const root = document.documentElement;
        root.classList.remove('text-normal', 'text-large', 'text-xlarge');
        // We can map these to specific tailwind classes or CSS variables in globals.css
        // For now, let's just set a data attribute or class
        root.setAttribute('data-font-size', size);

        // OR: set a base font size on html
        let scale = '100%';
        if (size === 'large') scale = '110%';
        if (size === 'xlarge') scale = '125%';
        root.style.fontSize = scale;
    };

    return (
        <ThemeContext.Provider value={{ theme, fontSize, toggleTheme, setFontSize }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
