<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.util.Date" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Departmental Store Validations - JSP</title>
    <link rel="stylesheet" href="style.css">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="background-shape shape1"></div>
    <div class="background-shape shape2"></div>

    <div class="container">
        <header>
            <h1>Luxe Departmental Store</h1>
            <p>Access your premium shopping experience</p>
            <p style="color: #60a5fa; font-size: 0.9rem; margin-top: 10px;">Server Time: <%= new Date().toString() %></p>
        </header>
        
        <nav class="tabs">
            <button type="button" class="tab-btn active" data-target="registration">Register</button>
            <button type="button" class="tab-btn" data-target="login">Login</button>
            <button type="button" class="tab-btn" data-target="profile">Profile</button>
            <button type="button" class="tab-btn" data-target="payment">Payment</button>
        </nav>

        <main class="form-container">
            <!-- Registration Form -->
            <form id="registration" action="dashboard.jsp" method="POST" class="form-section active">
                <input type="hidden" name="formType" value="register">
                <h2>Create Account</h2>
                <div class="input-group">
                    <label for="reg-firstname">First Name</label>
                    <input type="text" id="reg-firstname" name="firstname" placeholder="Enter your first name">
                    <small class="error-msg"></small>
                </div>
                <div class="input-group">
                    <label for="reg-lastname">Last Name</label>
                    <input type="text" id="reg-lastname" name="lastname" placeholder="Enter your last name">
                    <small class="error-msg"></small>
                </div>
                <div class="input-group">
                    <label for="reg-email">Email Address</label>
                    <input type="email" id="reg-email" name="email" placeholder="you@example.com">
                    <small class="error-msg"></small>
                </div>
                <div class="input-group">
                    <label for="reg-password">Password</label>
                    <input type="password" id="reg-password" name="password" placeholder="Create a password">
                    <small class="error-msg"></small>
                </div>
                <div class="input-group">
                    <label for="reg-confirm-password">Confirm Password</label>
                    <input type="password" id="reg-confirm-password" name="confirmPassword" placeholder="Confirm your password">
                    <small class="error-msg"></small>
                </div>
                <div class="input-group">
                    <label for="reg-phone">Phone Number</label>
                    <input type="text" id="reg-phone" name="phone" placeholder="(123) 456-7890">
                    <small class="error-msg"></small>
                </div>
                <button type="submit" class="submit-btn">Register Now</button>
            </form>

            <!-- Login Form -->
            <form id="login" action="dashboard.jsp" method="POST" class="form-section">
                <input type="hidden" name="formType" value="login">
                <h2>Welcome Back</h2>
                <div class="input-group">
                    <label for="login-email">Email Address</label>
                    <input type="email" id="login-email" name="email" placeholder="you@example.com">
                    <small class="error-msg"></small>
                </div>
                <div class="input-group">
                    <label for="login-password">Password</label>
                    <input type="password" id="login-password" name="password" placeholder="Enter your password">
                    <small class="error-msg"></small>
                </div>
                <button type="submit" class="submit-btn">Login</button>
            </form>

            <!-- Profile Form -->
            <form id="profile" action="dashboard.jsp" method="POST" class="form-section">
                <input type="hidden" name="formType" value="profile">
                <h2>Your Profile</h2>
                <div class="input-group">
                    <label for="prof-fullname">Full Name</label>
                    <input type="text" id="prof-fullname" name="fullname" placeholder="Update your full name">
                    <small class="error-msg"></small>
                </div>
                <div class="input-group">
                    <label for="prof-email">Email Address</label>
                    <input type="email" id="prof-email" name="email" placeholder="Update your email">
                    <small class="error-msg"></small>
                </div>
                <div class="input-group">
                    <label for="prof-address">Delivery Address</label>
                    <textarea id="prof-address" name="address" rows="3" placeholder="Enter your full address"></textarea>
                    <small class="error-msg"></small>
                </div>
                <div class="input-group">
                    <label for="prof-dob">Date of Birth</label>
                    <input type="date" id="prof-dob" name="dob">
                    <small class="error-msg"></small>
                </div>
                <button type="submit" class="submit-btn">Save Changes</button>
            </form>

            <!-- Payment Form -->
            <form id="payment" action="dashboard.jsp" method="POST" class="form-section">
                <input type="hidden" name="formType" value="payment">
                <h2>Secure Payment</h2>
                <div class="input-group">
                    <label for="pay-name">Cardholder Name</label>
                    <input type="text" id="pay-name" name="cardname" placeholder="Name as it appears on card">
                    <small class="error-msg"></small>
                </div>
                <div class="input-group">
                    <label for="pay-card">Card Number</label>
                    <input type="text" id="pay-card" name="cardnumber" placeholder="XXXX XXXX XXXX XXXX" maxlength="19">
                    <small class="error-msg"></small>
                </div>
                <div class="input-row">
                    <div class="input-group half-width">
                        <label for="pay-expiry">Expiry Date</label>
                        <input type="text" id="pay-expiry" name="expiry" placeholder="MM/YY" maxlength="5">
                        <small class="error-msg"></small>
                    </div>
                    <div class="input-group half-width">
                        <label for="pay-cvv">CVV</label>
                        <input type="password" id="pay-cvv" name="cvv" placeholder="123" maxlength="3">
                        <small class="error-msg"></small>
                    </div>
                </div>
                <button type="submit" class="submit-btn">Pay Securely</button>
            </form>
        </main>
    </div>

    <script src="script.js"></script>
</body>
</html>
