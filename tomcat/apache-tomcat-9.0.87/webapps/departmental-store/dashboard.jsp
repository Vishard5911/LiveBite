<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.util.Date" %>
<%@ page import="java.sql.*" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Luxe Departmental Store</title>
    <link rel="stylesheet" href="style.css">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        .dashboard-container {
            text-align: center;
        }
        .welcome-message {
            font-size: 1.8rem;
            color: #f8fafc;
            margin-bottom: 15px;
        }
        .dynamic-time {
            font-size: 1.2rem;
            color: #60a5fa;
            margin-bottom: 30px;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
            overflow: hidden;
        }
        .data-table th, .data-table td {
            padding: 12px 15px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            text-align: left;
            color: #e2e8f0;
        }
        .data-table th {
            background: rgba(139, 92, 246, 0.3);
            color: #ffffff;
            font-weight: 600;
        }
        .data-table tr:last-child td {
            border-bottom: none;
        }
        .error-card {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            padding: 15px;
            border-radius: 8px;
            color: #fca5a5;
            margin-top: 20px;
            text-align: left;
            font-size: 0.9rem;
        }
        .back-btn {
            display: inline-block;
            margin-top: 30px;
            text-decoration: none;
            padding: 12px 24px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            color: #fff;
            transition: background 0.3s;
        }
        .back-btn:hover {
            background: rgba(255, 255, 255, 0.2);
        }
    </style>
</head>
<body>
    <div class="background-shape shape1"></div>
    <div class="background-shape shape2"></div>

    <div class="container dashboard-container">
        <%
            String formType = request.getParameter("formType");
            String displayName = "Guest";
            String actionMessage = "Welcome to the dashboard.";

            if ("register".equals(formType)) {
                displayName = request.getParameter("firstname") + " " + request.getParameter("lastname");
                actionMessage = "Your account has been created successfully!";
            } else if ("login".equals(formType)) {
                displayName = request.getParameter("email");
                actionMessage = "You have logged in successfully!";
            } else if ("profile".equals(formType)) {
                displayName = request.getParameter("fullname");
                actionMessage = "Your profile was updated.";
            } else if ("payment".equals(formType)) {
                displayName = request.getParameter("cardname");
                actionMessage = "Your payment was processed successfully!";
            }
        %>
        
        <h2 class="welcome-message">Hello, <%= displayName != null && !displayName.trim().isEmpty() ? displayName : "Valued Customer" %>!</h2>
        <p style="color: #94a3b8; margin-bottom: 20px;"><%= actionMessage %></p>
        
        <div class="dynamic-time">
            Current Date & Time: <strong><%= new Date().toString() %></strong>
        </div>

        <div style="margin-top: 40px; text-align: left;">
            <h3 style="color: #f8fafc; margin-bottom: 15px;">Recent Store Products (JDBC Demo)</h3>
            
            <%
                // JDBC Database Fetching Logic (Bonus)
                Connection conn = null;
                Statement stmt = null;
                ResultSet rs = null;
                boolean dbConnected = false;
                
                try {
                    // Load the MySQL driver
                    Class.forName("com.mysql.cj.jdbc.Driver");
                    
                    // Replace with actual database credentials if testing with a real DB
                    String dbUrl = "jdbc:mysql://localhost:3306/store_db";
                    String dbUser = "root";
                    String dbPassword = "password";
                    
                    // Attempt connection
                    conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
                    stmt = conn.createStatement();
                    rs = stmt.executeQuery("SELECT id, product_name, price, stock FROM products LIMIT 5");
                    
                    dbConnected = true;
            %>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Product Name</th>
                                <th>Price ($)</th>
                                <th>Stock</th>
                            </tr>
                        </thead>
                        <tbody>
            <%
                    while (rs.next()) {
            %>
                            <tr>
                                <td><%= rs.getInt("id") %></td>
                                <td><%= rs.getString("product_name") %></td>
                                <td><%= rs.getDouble("price") %></td>
                                <td><%= rs.getInt("stock") %></td>
                            </tr>
            <%
                    }
            %>
                        </tbody>
                    </table>
            <%
                } catch (Exception e) {
            %>
                <div class="error-card">
                    <strong>JDBC Connection Info:</strong><br/>
                    <p style="margin-top: 5px; margin-bottom: 10px;">The database connection failed (expected if MySQL is not running locally). To see real data, create a MySQL database named <code>store_db</code> with a <code>products</code> table.</p>
                    <p><em>Error Details: <%= e.getMessage() %></em></p>
                </div>
                
                <!-- Displaying mock data so the UI layout is visible -->
                <p style="color: #cbd5e1; margin-top: 15px; font-size: 0.9rem;">Displaying mock data instead:</p>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Product Name</th>
                            <th>Price ($)</th>
                            <th>Stock</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>1</td><td>Premium Coffee Beans</td><td>24.99</td><td>150</td></tr>
                        <tr><td>2</td><td>Organic Green Tea</td><td>12.50</td><td>85</td></tr>
                        <tr><td>3</td><td>Dark Chocolate Truffles</td><td>18.00</td><td>42</td></tr>
                    </tbody>
                </table>
            <%
                } finally {
                    if (rs != null) try { rs.close(); } catch(SQLException e) {}
                    if (stmt != null) try { stmt.close(); } catch(SQLException e) {}
                    if (conn != null) try { conn.close(); } catch(SQLException e) {}
                }
            %>
        </div>
        
        <a href="index.jsp" class="back-btn">Back to Home</a>
    </div>
</body>
</html>
