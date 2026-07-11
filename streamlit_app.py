import streamlit as st
import streamlit.components.v1 as components
import os
import re

# Set page configuration to wide and dark
st.set_page_config(
    page_title="Forecaster AI",
    page_icon="📈",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Hide Streamlit header, footer, and sidebar to make it look like a native web app
hide_st_style = """
            <style>
            #MainMenu {visibility: hidden;}
            footer {visibility: hidden;}
            header {visibility: hidden;}
            .block-container {padding: 0px !important;}
            iframe {border: none !important;}
            </style>
            """
st.markdown(hide_st_style, unsafe_allow_html=True)

# Define active page state
if "page" not in st.session_state:
    # Streamlit uses session state or query parameters to track active page
    query_params = st.query_params
    if "page" in query_params:
        st.session_state.page = query_params["page"]
    else:
        st.session_state.page = "login"

def load_inline_html(filename):
    """
    Reads an HTML file and injects local CSS and JS files inline 
    so it renders perfectly inside Streamlit's iframe component.
    """
    if not os.path.exists(filename):
        return f"<h1>File {filename} not found</h1>"
        
    with open(filename, 'r', encoding='utf-8') as f:
        html = f.read()
        
    # Inject style.css
    if os.path.exists("style.css"):
        with open("style.css", 'r', encoding='utf-8') as css_f:
            css_content = css_f.read()
        # Replace stylesheet link with inline style tag
        html = re.sub(
            r'<link[^>]*href=["\']style\.css["\'][^>]*>',
            f'<style>\n{css_content}\n</style>',
            html
        )
        
    # Inject regression.js
    if os.path.exists("regression.js"):
        with open("regression.js", 'r', encoding='utf-8') as js_f:
            js_content = js_f.read()
        html = re.sub(
            r'<script[^>]*src=["\']regression\.js["\'][^>]*>\s*</script>',
            f'<script>\n{js_content}\n</script>',
            html
        )
        
    # Inject app.js
    if os.path.exists("app.js"):
        with open("app.js", 'r', encoding='utf-8') as js_f:
            js_content = js_f.read()
        html = re.sub(
            r'<script[^>]*src=["\']app\.js["\'][^>]*>\s*</script>',
            f'<script>\n{js_content}\n</script>',
            html
        )

    # Inject page redirection helper script to notify Streamlit parent frame when changing pages
    redirection_script = """
    <script>
    // Intercept standard link navigation and form redirects
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (link) {
            const href = link.getAttribute('href');
            if (href && href.endsWith('.html')) {
                e.preventDefault();
                const pageName = href.replace('.html', '');
                window.parent.postMessage({ type: 'streamlit:redirect', page: pageName }, '*');
            }
        }
    });

    // Intercept form submissions (e.g. login form redirect)
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            // Give normal JS execution 100ms to update redirection before triggering parent postMessage
            setTimeout(() => {
                const action = form.getAttribute('action');
                if (action && action.endsWith('.html')) {
                    const pageName = action.replace('.html', '');
                    window.parent.postMessage({ type: 'streamlit:redirect', page: pageName }, '*');
                } else if (form.id === 'loginForm') {
                    // Custom login form fallback
                    window.parent.postMessage({ type: 'streamlit:redirect', page: 'dashboard' }, '*');
                }
            }, 100);
        });
    });
    </script>
    """
    html = html.replace("</body>", f"{redirection_script}\n</body>")
    return html

# Listen to redirect messages from iframe (using streamlit native components communication)
# Since Streamlit components run in an iframe, we inject a custom message handler 
# that receives redirection messages and updates session state
components_listener = """
<script>
window.addEventListener("message", (event) => {
    if (event.data && event.data.type === "streamlit:redirect") {
        const url = new URL(window.location.href);
        url.searchParams.set("page", event.data.page);
        window.parent.location.href = url.toString();
    }
});
</script>
"""
st.markdown(components_listener, unsafe_allow_html=True)

# Render active page
active_page = st.session_state.page
if active_page == "login":
    html_content = load_inline_html("login.html")
    components.html(html_content, height=900, scrolling=False)
elif active_page == "dashboard":
    html_content = load_inline_html("dashboard.html")
    components.html(html_content, height=1000, scrolling=True)
elif active_page == "index":
    html_content = load_inline_html("index.html")
    components.html(html_content, height=1100, scrolling=True)
else:
    # Fallback to login
    html_content = load_inline_html("login.html")
    components.html(html_content, height=900, scrolling=False)
