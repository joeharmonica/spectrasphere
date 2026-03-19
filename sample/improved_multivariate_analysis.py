import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.cross_decomposition import PLSRegression
from sklearn.metrics import r2_score, mean_squared_error
from scipy.signal import savgol_filter
import os

# Set directory
os.chdir('/Users/joepong/Downloads/FTIR-PLS')

def snv(input_data):
    # Standard Normal Variate (SNV) preprocessing
    output_data = np.zeros_like(input_data)
    for i in range(input_data.shape[0]):
        output_data[i,:] = (input_data[i,:] - np.mean(input_data[i,:])) / np.std(input_data[i,:])
    return output_data

# 1. Load Data
df = pd.read_csv('AGILENT-ATR-FTIR-SG-ETOH-BLEND.csv')
wavenumbers = df.iloc[:, 0].values
spectra = df.iloc[:, 1:].values.T # (Samples, Wavenumbers)
y = np.array([0, 2, 5, 10, 20, 30, 50, 70, 90, 100])

# 2. Select Range
# Keeping more of the spectrum but removing the extremely noisy ends and CO2 region
# Keeping 800-2200 and 2700-3600
mask = ((wavenumbers >= 800) & (wavenumbers <= 2200)) | \
       ((wavenumbers >= 2700) & (wavenumbers <= 3700))

X_cropped = spectra[:, mask]
wavenumbers_cropped = wavenumbers[mask]

# 3. Preprocessing: SNV + 1st Derivative
X_snv = snv(X_cropped)
# 1st Derivative helps resolve peaks and remove baseline slope
X_deriv = savgol_filter(X_snv, window_length=15, polyorder=2, deriv=1, axis=1)

# 4. Fit Optimized PLS
n_comp = 3 # Increased components for derivative data
pls = PLSRegression(n_components=n_comp)
pls.fit(X_deriv, y)
y_pred = pls.predict(X_deriv).ravel()

final_r2 = r2_score(y, y_pred)
final_rmse = np.sqrt(mean_squared_error(y, y_pred))

# 5. Visualization
plt.figure(figsize=(12, 5))

# Parity Plot
plt.subplot(1, 2, 1)
plt.scatter(y, y_pred, color='green', alpha=0.7)
plt.plot([0, 100], [0, 100], 'r--')
plt.title(f"Optimized Model (SNV+1st Deriv)\nR2: {final_r2:.4f}, RMSE: {final_rmse:.4f}")
plt.xlabel("Actual (%)")
plt.ylabel("Predicted (%)")
plt.grid(True, alpha=0.3)

# Coefficient Plot
plt.subplot(1, 2, 2)
coeffs = pls.coef_.ravel()
plt.plot(wavenumbers_cropped, coeffs, color='purple')
plt.title("Optimized Coefficients (1st Derivative)")
plt.xlabel("Wavenumber (cm-1)")
plt.ylabel("Weight")
plt.axhline(0, color='black', lw=1)
plt.grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig('optimized_analysis_final.png')
plt.close()

print(f"Optimized PLS Results:")
print(f"R2: {final_r2:.4f}")
print(f"RMSE: {final_rmse:.4f}")
