/**
 * Polynomial Regression Engine
 * Handles polynomial feature expansion and solving normal equations for multiple linear/polynomial regression.
 */

class PolynomialRegression {
    constructor(degree = 2) {
        this.degree = degree;
        this.weights = null;
        this.mean = null;
        this.std = null;
    }

    /**
     * Helper to perform matrix multiplication: A * B
     */
    static multiply(A, B) {
        const rowsA = A.length, colsA = A[0].length;
        const rowsB = B.length, colsB = B[0].length;
        if (colsA !== rowsB) throw new Error("Matrix dimensions do not match for multiplication.");
        
        let result = Array(rowsA).fill(0).map(() => Array(colsB).fill(0));
        for (let i = 0; i < rowsA; i++) {
            for (let j = 0; j < colsB; j++) {
                let sum = 0;
                for (let k = 0; k < colsA; k++) {
                    sum += A[i][k] * B[k][j];
                }
                result[i][j] = sum;
            }
        }
        return result;
    }

    /**
     * Helper to transpose matrix: A^T
     */
    static transpose(A) {
        return A[0].map((_, colIndex) => A.map(row => row[colIndex]));
    }

    /**
     * Solve A * x = B using Gaussian Elimination with partial pivoting
     */
    static solve(A, B) {
        const n = A.length;
        // Augment A with B
        let M = A.map((row, i) => [...row, ...B[i]]);
        const numCols = M[0].length;

        for (let i = 0; i < n; i++) {
            // Find pivot
            let maxRow = i;
            for (let k = i + 1; k < n; k++) {
                if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) {
                    maxRow = k;
                }
            }

            // Swap rows
            let temp = M[i];
            M[i] = M[maxRow];
            M[maxRow] = temp;

            // Pivot element check
            if (Math.abs(M[i][i]) < 1e-10) {
                // Add a small regularization term if matrix is singular
                M[i][i] += 1e-5;
            }

            // Eliminate column below
            for (let k = i + 1; k < n; k++) {
                const factor = M[k][i] / M[i][i];
                for (let j = i; j < numCols; j++) {
                    M[k][j] -= factor * M[i][j];
                }
            }
        }

        // Back substitution
        let X = Array(n).fill(0).map(() => Array(B[0].length).fill(0));
        for (let i = n - 1; i >= 0; i--) {
            for (let j = 0; j < B[0].length; j++) {
                let sum = 0;
                for (let k = i + 1; k < n; k++) {
                    sum += M[i][k] * X[k][j];
                }
                X[i][j] = (M[i][n + j] - sum) / M[i][i];
            }
        }
        return X;
    }

    /**
     * Generate polynomial features for a given sample [x1, x2, x3]
     * For degree 2: [1, x1, x2, x3, x1^2, x2^2, x3^2, x1*x2, x2*x3, x1*x3]
     */
    generatePolynomialFeatures(X) {
        let features = [];
        for (let i = 0; i < X.length; i++) {
            const row = X[i];
            let newRow = [1]; // Bias term
            
            // Linear features
            for (let j = 0; j < row.length; j++) {
                newRow.push(row[j]);
            }
            
            // Polynomial features (degree 2)
            if (this.degree >= 2) {
                for (let j = 0; j < row.length; j++) {
                    for (let k = j; k < row.length; k++) {
                        newRow.push(row[j] * row[k]);
                    }
                }
            }
            
            features.push(newRow);
        }
        return features;
    }

    /**
     * Standardize features for numerical stability
     */
    standardize(X_poly, training = false) {
        const numCols = X_poly[0].length;
        const numRows = X_poly.length;

        if (training) {
            this.mean = Array(numCols).fill(0);
            this.std = Array(numCols).fill(1);

            // Compute mean (skipping bias term index 0)
            for (let j = 1; j < numCols; j++) {
                let sum = 0;
                for (let i = 0; i < numRows; i++) {
                    sum += X_poly[i][j];
                }
                this.mean[j] = sum / numRows;
            }

            // Compute standard deviation
            for (let j = 1; j < numCols; j++) {
                let variance = 0;
                for (let i = 0; i < numRows; i++) {
                    variance += Math.pow(X_poly[i][j] - this.mean[j], 2);
                }
                this.std[j] = Math.sqrt(variance / numRows) || 1; // Prevent division by zero
            }
        }

        // Standardize input
        return X_poly.map(row => {
            return row.map((val, j) => {
                if (j === 0) return 1; // Keep bias term unchanged
                return (val - this.mean[j]) / this.std[j];
            });
        });
    }

    /**
     * Fit the polynomial regression model
     * @param {Array<Array<number>>} X - Array of feature vectors (e.g. [[TV, Radio, Newspaper], ...])
     * @param {Array<number>} y - Array of targets (Sales)
     */
    fit(X, y) {
        // 1. Generate polynomial features
        const X_poly = this.generatePolynomialFeatures(X);
        
        // 2. Standardize features
        const X_scaled = this.standardize(X_poly, true);
        
        // 3. Convert target to a 2D matrix (N x 1)
        const Y = y.map(val => [val]);
        
        // 4. Solve Normal Equation: (X_scaled^T * X_scaled)^-1 * X_scaled^T * Y
        const XT = PolynomialRegression.transpose(X_scaled);
        const XTX = PolynomialRegression.multiply(XT, X_scaled);
        const XTY = PolynomialRegression.multiply(XT, Y);
        
        this.weights = PolynomialRegression.solve(XTX, XTY);
    }

    /**
     * Predict values for given samples
     * @param {Array<Array<number>>} X
     */
    predict(X) {
        if (!this.weights) throw new Error("Model has not been fitted yet.");
        const X_poly = this.generatePolynomialFeatures(X);
        const X_scaled = this.standardize(X_poly, false);
        const Y_pred = PolynomialRegression.multiply(X_scaled, this.weights);
        return Y_pred.map(row => row[0]);
    }
}

// Export regression model to global scope
window.PolynomialRegression = PolynomialRegression;
