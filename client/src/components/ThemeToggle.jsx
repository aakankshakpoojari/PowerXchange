import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  console.log("ThemeToggle - current theme:", theme);

  return (
    <button
      onClick={() => {
        console.log("Theme toggle clicked, current:", theme);
        toggleTheme();
      }}
      className="relative w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800
        flex items-center justify-center transition-all duration-300
        hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-110
        border border-gray-200 dark:border-gray-700 shadow-md"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        // Sun icon - shown in dark mode (click to go to light)
        <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      ) : (
        // Moon icon - shown in light mode (click to go to dark)
        <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
