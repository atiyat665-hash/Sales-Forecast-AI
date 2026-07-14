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

# Hide Streamlit UI elements for a native look
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

def load_inline_html(filename):
    """
    Reads index.html and injects style.css, regression.js, and app.js inline.
    To be 100% safe from whitespace and quote variations, we strip the original 
    external script tags and append the code directly at the end of the body.
    """
    if not os.path.exists(filename):
        return f"<h1>File {filename} not found</h1>"
        
    with open(filename, 'r', encoding='utf-8') as f:
        html = f.read()
        
    # 1. Inject style.css by replacing the link tag (using regex to ignore spacing)
    if os.path.exists("style.css"):
        with open("style.css", 'r', encoding='utf-8') as css_f:
            css_content = css_f.read()
        # Replace the stylesheet link tag regardless of spaces/quotes
        html = re.sub(r'<link\s+[^>]*href=["\']style\.css["\'][^>]*>', f'<style>\n{css_content}\n</style>', html)
        
    # 2. Strip the original external script tags for regression.js and app.js to prevent 404s
    html = re.sub(r'<script\s+[^>]*src=["\']regression\.js["\'][^>]*>\s*</script>', '', html)
    html = re.sub(r'<script\s+[^>]*src=["\']app\.js["\'][^>]*>\s*</script>', '', html)
    
    # 3. Read script contents
    regression_js = ""
    if os.path.exists("regression.js"):
        with open("regression.js", 'r', encoding='utf-8') as js_f:
            regression_js = js_f.read()
            
    app_js = ""
    if os.path.exists("app.js"):
        with open("app.js", 'r', encoding='utf-8') as js_f:
            app_js = js_f.read()
            
    # 4. Inject scripts inline directly before the closing body tag
    inline_scripts = f"""
    <script>
    {regression_js}
    </script>
    <script>
    {app_js}
    </script>
    </body>
    """
    html = html.replace("</body>", inline_scripts)

    return html

# Serve the single unified SPA index.html
html_content = load_inline_html("index.html")
components.html(html_content, height=1200, scrolling=True)
