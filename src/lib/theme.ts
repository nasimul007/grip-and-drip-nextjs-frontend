export const THEME_KEY = "theme";

/** Runs before first paint (inlined in <head>) so there is no light/dark flash. Default is light. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");var d=t==="dark";var r=document.documentElement;r.classList.toggle("dark",d);var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",d?"#0A0A0F":"#FFFFFF");}catch(e){}})();`;

