import streamlit as st
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures

# Page Configuration
st.set_page_config(
    page_title="Forecaster AI - Streamlit Dashboard",
    page_icon="📈",
    layout="wide"
)

# ----------------------------------------------------
# Session State for Login Flow
# ----------------------------------------------------
if "logged_in" not in st.session_state:
    st.session_state.logged_in = False

# ----------------------------------------------------
# Login Page Interface
# ----------------------------------------------------
if not st.session_state.logged_in:
    st.title("🔐 Forecaster AI - Secure Sign In")
    st.write("Welcome back! Please login to your account to access the Sales Prediction Engine.")
    
    with st.form("login_form"):
        email = st.text_input("Email Address", placeholder="name@company.com")
        password = st.text_input("Password", type="password", placeholder="••••••••")
        remember = st.checkbox("Remember me")
        
        submit_btn = st.form_submit_button("Sign In")
        
        if submit_btn:
            if email and password:
                st.session_state.logged_in = True
                st.success("Successfully logged in!")
                st.rerun() # Refresh page to show dashboard
            else:
                st.error("Please enter both email and password.")
    
    st.info("Don't have an account? Contact your administrator to create one.")
    st.stop() # Stop execution here so dashboard is hidden

# ----------------------------------------------------
# 1. Dataset & Machine Learning Models Training
# ----------------------------------------------------
# Advertising Sales dataset (TV, Radio, Newspaper -> Sales)
advertising_data = np.array([
    [230.1, 37.8, 69.2, 22.1],
    [44.5, 39.3, 45.1, 10.4],
    [17.2, 45.9, 69.3, 9.3],
    [151.5, 41.3, 58.5, 18.5],
    [180.8, 10.8, 58.4, 12.9],
    [8.7, 48.9, 75.0, 7.2],
    [57.5, 32.8, 23.5, 11.8],
    [120.2, 19.6, 11.6, 13.2],
    [8.6, 2.1, 1.0, 4.8],
    [199.8, 2.6, 21.2, 10.6],
    [66.1, 5.8, 24.2, 8.6],
    [214.7, 24.0, 4.0, 17.4],
    [23.8, 35.1, 65.9, 9.2],
    [97.5, 7.6, 7.2, 9.7],
    [204.1, 32.9, 46.0, 19.0],
    [195.4, 47.7, 52.9, 22.4],
    [67.8, 36.6, 114.0, 12.5],
    [281.4, 39.6, 55.8, 24.4],
    [69.2, 20.5, 18.3, 11.3],
    [147.3, 23.9, 19.1, 14.6],
    [218.4, 27.7, 53.4, 18.0],
    [237.4, 5.1, 23.5, 12.5],
    [13.2, 15.9, 49.6, 5.6],
    [228.3, 16.9, 26.2, 15.5],
    [62.3, 12.6, 18.3, 9.7],
    [262.9, 3.5, 19.5, 12.0],
    [142.9, 29.3, 12.6, 15.0],
    [240.1, 16.7, 22.9, 15.9],
    [248.8, 27.1, 22.9, 18.9],
    [70.6, 16.0, 40.8, 10.5],
    [292.9, 28.3, 43.2, 21.4],
    [112.9, 17.4, 38.6, 11.9],
    [97.2, 1.5, 30.0, 9.6],
    [265.6, 20.0, 0.3, 17.4],
    [95.7, 1.4, 7.4, 9.5],
    [290.7, 4.1, 8.5, 12.8],
    [266.9, 43.8, 5.0, 25.4],
    [74.7, 49.4, 45.7, 14.7],
    [136.2, 19.2, 16.6, 12.9],
    [228.0, 37.7, 32.0, 21.5],
    [202.5, 22.3, 31.6, 16.6],
    [177.0, 33.4, 38.7, 17.1],
    [293.6, 27.7, 1.8, 20.7],
    [206.9, 8.4, 26.4, 12.9],
    [25.1, 25.7, 43.3, 8.5],
    [175.1, 22.5, 31.5, 14.9],
    [89.7, 9.9, 35.7, 10.6],
    [239.9, 5.1, 8.5, 12.3],
    [227.2, 15.8, 49.9, 14.8],
    [60.6, 59.3, 1.3, 9.7]
])

X = advertising_data[:, :3]
y = advertising_data[:, 3]

# Train Linear Regression model
lin_model = LinearRegression()
lin_model.fit(X, y)

# Train Polynomial Regression model (Degree 2)
poly_features = PolynomialFeatures(degree=2)
X_poly = poly_features.fit_transform(X)
poly_model = LinearRegression()
poly_model.fit(X_poly, y)

# Price catalog of goods (in thousands of dollars)
item_prices = {
    "Newspaper": 0.005,
    "Radio": 0.05,
    "Smart Phone": 0.8,
    "Smart TV": 1.5,
    "Laptop": 2.5
}

# ----------------------------------------------------
# 2. UI Layout (Dashboard)
# ----------------------------------------------------
# Sidebar for logout
with st.sidebar:
    st.write(f"Logged in as: User")
    if st.button("Logout"):
        st.session_state.logged_in = False
        st.rerun()

st.title("📈 Forecaster AI - Sales & Budget Optimizer")
st.write("Polynomial Regression Engine aur Budget Advisor Streamlit Dashboard.")

col1, col2 = st.columns([1.2, 0.8])

with col1:
    st.header("🎛️ Sales Forecasting Simulator")
    
    # Model Selection
    model_type = st.radio("Model Type Select Karein:", ("Linear Regression", "Polynomial Regression (Deg 2)"), horizontal=True)
    
    # Budget Sliders
    tv_budget = st.slider("TV Advertising Budget ($k)", 0.0, 300.0, 150.0, step=0.5)
    radio_budget = st.slider("Radio Advertising Budget ($k)", 0.0, 50.0, 25.0, step=0.5)
    newspaper_budget = st.slider("Newspaper Advertising Budget ($k)", 0.0, 100.0, 30.0, step=0.5)
    
    input_data = np.array([[tv_budget, radio_budget, newspaper_budget]])
    
    # Prediction
    if model_type == "Linear Regression":
        prediction = lin_model.predict(input_data)[0]
    else:
        input_data_poly = poly_features.transform(input_data)
        prediction = poly_model.predict(input_data_poly)[0]
        
    st.metric("Estimated Sales", f"{max(0.0, prediction):.2f} k units")

    # Dynamic Line Plot: TV vs Sales Curve (Radio and Newspaper kept constant)
    st.write("### Regression Curve (TV Budget vs Sales)")
    tv_range = np.linspace(0, 300, 50)
    curve_data = []
    
    for tv in tv_range:
        pt = np.array([[tv, radio_budget, newspaper_budget]])
        if model_type == "Linear Regression":
            pred_y = lin_model.predict(pt)[0]
        else:
            pt_poly = poly_features.transform(pt)
            pred_y = poly_model.predict(pt_poly)[0]
        curve_data.append(max(0.0, pred_y))
        
    fig, ax = plt.subplots(figsize=(8, 3))
    ax.plot(tv_range, curve_data, color="#06b6d4", label="Regression Curve")
    ax.scatter([tv_budget], [max(0.0, prediction)], color="#f43f5e", s=100, label="Current Point", zorder=5)
    ax.set_xlabel("TV Budget ($k)", color="#94a3b8")
    ax.set_ylabel("Sales (k units)", color="#94a3b8")
    ax.grid(True, linestyle="--", alpha=0.3)
    ax.legend()
    fig.patch.set_facecolor('#0a0b10')
    ax.set_facecolor('#121420')
    ax.spines['bottom'].set_color('#94a3b8')
    ax.spines['left'].set_color('#94a3b8')
    ax.xaxis.label.set_color('#94a3b8')
    ax.yaxis.label.set_color('#94a3b8')
    ax.tick_params(colors='#94a3b8')
    st.pyplot(fig)

with col2:
    st.header("🤖 AI Allocation Advisor")
    total_budget = st.number_input("Enter Your Total Budget ($k):", min_value=0.0, value=150.0, step=1.0)
    
    # 1. Budget Bracket Highlight Logic
    high_rank_item = "Laptop" # Default
    if 1.0 <= total_budget <= 3.0:
        high_rank_item = "Newspaper"
    elif 4.0 <= total_budget <= 15.0:
        high_rank_item = "Radio"
    elif 16.0 <= total_budget <= 20.0:
        high_rank_item = "Smart TV"
    elif 21.0 <= total_budget <= 25.0:
        high_rank_item = "Smart Phone"
        
    st.subheader("🛍️ Purchase Affordability & High Rank Item")
    
    for item, price in item_prices.items():
        is_affordable = total_budget >= price
        is_high_rank = item == high_rank_item
        
        status_text = "✅ Affordable" if is_affordable else "❌ Not Affordable"
        rank_badge = "⭐ [HIGH RANK]" if is_high_rank else ""
        
        if is_high_rank:
            st.markdown(f"**{item}** (${price:.3f}k) : `{status_text}` **{rank_badge}**", unsafe_allow_html=True)
        else:
            st.write(f"{item} (${price:.3f}k) : `{status_text}`")
            
    # 2. Optimal Allocation Calculation
    st.write("---")
    st.subheader("📊 Optimal Budget Allocation Recommendation")
    
    if total_budget > 0:
        # Simple Grid Search Optimizer
        best_sales = -1
        best_alloc = [0, 0, 0]
        step = total_budget / 20.0
        
        for tv in np.arange(0, total_budget + step, step):
            for radio in np.arange(0, total_budget - tv + step, step):
                news = max(0.0, total_budget - tv - radio)
                test_pt = np.array([[tv, radio, news]])
                test_poly = poly_features.transform(test_pt)
                sales_pred = poly_model.predict(test_poly)[0]
                if sales_pred > best_sales:
                    best_sales = sales_pred
                    best_alloc = [tv, radio, news]
                    
        opt_tv, opt_radio, opt_news = best_alloc
        
        # Display recommendations
        st.write(f"**Aapka total budget: ${total_budget:.1f}k**")
        st.write(f"• **TV**: ${opt_tv:.1f}k spend karein")
        st.write(f"• **Radio**: ${opt_radio:.1f}k spend karein")
        st.write(f"• **Newspaper**: ${opt_news:.1f}k spend karein")
        st.write(f"💡 Is allocation se **{max(0.0, best_sales):.2f}k units** sales hone ka estimate hai.")
        
        # Allocation pie chart
        df_pie = pd.DataFrame({
            "Channel": ["TV", "Radio", "Newspaper"],
            "Budget": [opt_tv, opt_radio, opt_news]
        })
        st.bar_chart(df_pie.set_index("Channel"))
    else:
        st.write("Budget 0 se barhayein!")
