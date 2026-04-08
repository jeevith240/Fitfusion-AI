export function getTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "light";
  return (localStorage.getItem("ff_theme") as "dark" | "light") || "dark";
}

export function setTheme(theme: "dark" | "light") {
  localStorage.setItem("ff_theme", theme);
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function initTheme() {
  const theme = getTheme();
  document.documentElement.classList.toggle("dark", theme === "dark");
}
