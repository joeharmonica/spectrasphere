import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.cross_decomposition import PLSRegression
from sklearn.linear_model import Ridge, Lasso, ElasticNet, LinearRegression
from sklearn.decomposition import PCA
from sklearn.pipeline import Pipeline
from sklearn.metrics import r2_score, mean_squared_error
import os

# Set directory
os.chdir('/Users/joepong/Downloads/FTIR-PLS')

# 1. Load Data
df = pd.read_csv('AGILENT-ATR-FTIR-SG-ETOH-BLEND.csv')
wavenumbers = df.iloc[:, 0].values
spectra = df.iloc[:, 1:].values
y = np.array([0, 2, 5, 10, 20, 30, 50, 70, 90, 100]).ravel()

# X: Transpose so samples are rows (10, 1799)
X = spectra.T

# 2. Define Models
models = {
    "PLS (2 comp)": PLSRegression(n_components=2),
    "PCR (2 comp)": Pipeline([('pca', PCA(n_components=2)), ('lr', LinearRegression())]),
    "Ridge": Ridge(alpha=1.0),
    "Lasso": Lasso(alpha=0.1),
    "ElasticNet": ElasticNet(alpha=0.1, l1_ratio=0.5)
}

results = []

# 3. Train and Evaluate
plt.figure(figsize=(15, 10))
plot_idx = 1

for name, model in models.items():
    model.fit(X, y)
    y_pred = model.predict(X).ravel()
    
    r2 = r2_score(y, y_pred)
    rmse = np.sqrt(mean_squared_error(y, y_pred))
    
    results.append({"Model": name, "R2": r2, "RMSE": rmse})
    
    # Subplot for Parity
    plt.subplot(2, 3, plot_idx)
    plt.scatter(y, y_pred, alpha=0.7)
    plt.plot([0, 100], [0, 100], 'r--')
    plt.title(f"{name}\nR2: {r2:.4f}")
    plt.xlabel("Actual (%)")
    plt.ylabel("Predicted (%)")
    plt.grid(True, alpha=0.3)
    plot_idx += 1

plt.tight_layout()
plt.savefig('multivariate_comparison_parity.png')
plt.close()

# 4. Summary Table
results_df = pd.DataFrame(results)
print("\n--- Multivariate Model Comparison ---")
print(results_df.to_string(index=False))

# 5. Feature Importance (Coefficients)
plt.figure(figsize=(12, 6))
# Compare coefficients of PLS and Ridge as examples
pls_model = models["PLS (2 comp)"]
pls_coeffs = pls_model.coef_.ravel()

ridge_model = models["Ridge"]
ridge_coeffs = ridge_model.coef_

plt.plot(wavenumbers, pls_coeffs / np.max(np.abs(pls_coeffs)), label='PLS (Normalized)', alpha=0.7)
plt.plot(wavenumbers, ridge_coeffs / np.max(np.abs(ridge_coeffs)), label='Ridge (Normalized)', alpha=0.7)
plt.title("Normalized Regression Coefficients Comparison")
plt.xlabel("Wavenumber (cm-1)")
plt.ylabel("Relative Weight")
plt.legend()
plt.grid(True, alpha=0.3)
plt.savefig('coefficient_comparison.png')
plt.close()

# Save results to CSV
results_df.to_csv('multivariate_results_summary.csv', index=False)
