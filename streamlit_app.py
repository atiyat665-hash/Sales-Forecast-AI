import streamlit as st
import streamlit.components.v1 as components
import os

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
    Reads index.html and injects style.css, regression.js, and app.js inline using simple, 
    unambiguous string replacement to guarantee it works in Streamlit's sandboxed environment.
    """
    if not os.path.exists(filename):
        return f"<h1>File {filename} not found</h1>"
        
    with open(filename, 'r', encoding='utf-8') as f:
        html = f.read()
        
    # Inject style.css
    if os.path.exists("style.css"):
        with open("style.css", 'r', encoding='utf-8') as css_f:
            css_content = css_f.read()
        # Find both versions of quotes to be 100% safe
        html = html.replace('<link rel="stylesheet" href="style.css">', f'<style>\n{css_content}\n</style>')
        html = html.replace("<link rel='stylesheet' href='style.css'>", f"<style>\n{css_content}\n</style>")
        
    # Inject regression.js
    if os.path.exists("regression.js"):
        with open("regression.js", 'r', encoding='utf-8') as js_f:
            js_content = js_f.read()
        html = html.replace('<script src="regression.js"></script>', f'<script>\n{js_content}\n</script>')
        html = html.replace("<script src='regression.js'></script>", f"<script>\n{js_content}\n</script>")
        
    # Inject app.js
    if os.path.exists("app.js"):
        with open("app.js", 'r', encoding='utf-8') as js_f:
            js_content = js_f.read()
        html = html.replace('<script src="app.js"></script>', f'<script>\n{js_content}\n</script>')
        html = html.replace("<script src='app.js'></script>", f"<script>\n{js_content}\n</script>")

    return html

# Serve the single unified SPA index.html
html_content = load_inline_html("index.html")
components.html(html_content, height=1200, scrolling=True)
